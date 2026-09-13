import { NextRequest, NextResponse } from "next/server";
import {
  readRolesDB,
  writeRolesDB,
  logSecurityEvent,
  generateTempPassword,
  generateInviteToken,
  normalizeAdminRole,
  AdminRole,
} from "@/lib/adminRoles";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/adminAuth";

function extractSessionToken(req: NextRequest | Request): string | undefined {
  if ("cookies" in req && typeof (req as any).cookies?.get === "function") {
    const val = (req as any).cookies.get(SESSION_COOKIE)?.value;
    if (val) return val;
  }
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return undefined;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

// GET /api/admin/roles — return users, invitations, audit log & role definitions
export async function GET(req: NextRequest) {
  const token = extractSessionToken(req);
  const user = await parseSessionToken(token);
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden: super admin required" }, { status: 403 });
  }

  const db = readRolesDB();
  try {
    const { getAllMongoAdminUsers } = await import("@/lib/adminMongo");
    const mongoUsers = await getAllMongoAdminUsers();
    let updated = false;
    mongoUsers.forEach(mu => {
      const cleanEmail = (mu.email || "").toLowerCase();
      if (!cleanEmail) return;
      const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      const role = normalizeAdminRole(mu.role);
      if (!existing) {
        db.users.push({
          id: mu.id || `usr-${Date.now().toString(36)}`,
          email: cleanEmail,
          name: mu.name || cleanEmail.split("@")[0],
          role: role,
          status: mu.status || "active",
          tempPassword: mu.password || mu.tempPassword,
          createdAt: mu.createdAt || new Date().toISOString(),
          lastLoginAt: mu.lastLoginAt,
        });
        updated = true;
      } else {
        if (existing.role !== role) {
          existing.role = role;
          updated = true;
        }
        if (mu.status && existing.status !== mu.status) {
          existing.status = mu.status;
          updated = true;
        }
        if (mu.password && existing.tempPassword !== mu.password) {
          existing.tempPassword = mu.password;
          updated = true;
        }
        if (mu.lastLoginAt) existing.lastLoginAt = mu.lastLoginAt;
      }
    });

    if (updated) {
      writeRolesDB(db);
    }
  } catch (err) {
    console.warn("Could not merge MongoDB users in GET /api/admin/roles:", err);
  }

  const visibleUsers = db.users.filter(u => u.email.toLowerCase() !== "pvs178380@gmail.com");
  const visibleInvitations = db.invitations.filter(i => i.email.toLowerCase() !== "pvs178380@gmail.com");

  return NextResponse.json({
    users: visibleUsers,
    invitations: visibleInvitations,
    auditLog: db.auditLog.slice(0, 50),
    roleDefinitions: [
      {
        key: "super_admin",
        title: "Super Admin",
        badgeColor: "#00E5A3",
        description: "Full access to all CMS content, role invitations, settings & telemetry.",
        permissions: ["All Permissions", "Manage Users & Roles", "Change Global Settings", "Edit All Schemas"],
      },
      {
        key: "content_editor",
        title: "Content Editor",
        badgeColor: "#3b82f6",
        description: "Edit machinery specifications, homepage sections, and product catalogues.",
        permissions: ["Edit CMS Schemas", "Manage Products", "Upload Images"],
      },
      {
        key: "machine_manager",
        title: "Machine Manager",
        badgeColor: "#f5c451",
        description: "Dedicated access to machine specifications, series, and output statistics.",
        permissions: ["Edit Product Specs", "Update Catalogue Images"],
      },
      {
        key: "analytics_viewer",
        title: "Analytics & Inquiry Viewer",
        badgeColor: "#a855f7",
        description: "Read-only access to customer inquiries, telemetry, and visitor traffic.",
        permissions: ["View Inquiries", "View Analytics"],
      },
    ],
  });
}

// POST /api/admin/roles — handle invitations, role updates, password changes, revokes
export async function POST(req: NextRequest) {
  try {
    const token = extractSessionToken(req);
    const user = await parseSessionToken(token);
    if (!user || user.role !== "super_admin") {
      return NextResponse.json({ error: "forbidden: super admin required" }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;
    const db = readRolesDB();

    if (action === "invite") {
      const { email, name, role } = body as { email: string; name?: string; role?: string };
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid Gmail / email address" }, { status: 400 });
      }
      if (email.toLowerCase().trim() === "pvs178380@gmail.com") {
        return NextResponse.json({ error: "The Hidden Super Admin account is permanent and cannot be modified." }, { status: 403 });
      }

      // Strictly normalize the role (e.g. "analytics", "analatic", "analytics_viewer" -> "analytics_viewer")
      const assignedRole: AdminRole = normalizeAdminRole(role);
      const memberName = name?.trim() || email.split("@")[0];
      const tempPassword = generateTempPassword();
      const inviteToken = generateInviteToken();

      // Remove from revokedEmails if previously revoked
      if (db.revokedEmails) {
        db.revokedEmails = db.revokedEmails.filter(e => e.toLowerCase() !== email.toLowerCase());
      }

      // Check if invitation already exists
      const existingInvIdx = db.invitations.findIndex(i => i.email.toLowerCase() === email.toLowerCase());
      if (existingInvIdx >= 0) {
        db.invitations.splice(existingInvIdx, 1);
      }

      const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
      const newInv = {
        id: `inv-${Date.now().toString(36)}`,
        email: email.toLowerCase(),
        name: memberName,
        role: assignedRole,
        tempPassword,
        token: inviteToken,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      db.invitations.unshift(newInv);

      // Add user record if not present
      let userRecord = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!userRecord) {
        userRecord = {
          id: `usr-${Date.now().toString(36)}`,
          email: email.toLowerCase(),
          name: memberName,
          role: assignedRole,
          status: "invited",
          tempPassword,
          createdAt: new Date().toISOString(),
        };
        db.users.push(userRecord);
      } else {
        userRecord.role = assignedRole;
        userRecord.status = "invited";
        userRecord.tempPassword = tempPassword;
      }

      writeRolesDB(db);

      // Sync new invitation & user to MongoDB Atlas DB server
      try {
        const { upsertMongoAdminUser, upsertMongoInvitation } = await import("@/lib/adminMongo");
        await upsertMongoAdminUser({
          id: userRecord?.id || newInv.id,
          email: email.toLowerCase(),
          name: memberName,
          role: assignedRole,
          status: "invited",
          tempPassword,
        });
        await upsertMongoInvitation(newInv);
      } catch (mongoErr) {
        console.warn("MongoDB sync during invite warning:", mongoErr);
      }

      const origin = (req as any).nextUrl?.origin || (req.url ? new URL(req.url).origin : "http://localhost:3000");
      const magicLink = `${origin}/cx-ops-x7k9q2/invite?token=${inviteToken}&email=${encodeURIComponent(email)}`;

      // Attempt to send email via Resend
      let emailSent = false;
      try {
        const { sendEmail } = await import("@/lib/resend");
        const html = `
          <div style="font-family: Arial, sans-serif; background-color: #0b1523; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2bbfb3; margin-top: 0;">Ashal Innomech Ops — Access Invitation</h2>
            <p>Hello <strong>${memberName}</strong>,</p>
            <p>You have been invited to join the Ashal Innomech Administrative Command Center as a <strong>${assignedRole.replace("_", " ").toUpperCase()}</strong>.</p>
            <div style="background: rgba(255,255,255,0.08); padding: 18px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #cbd5e1;">Temporary Password:</p>
              <code style="font-family: monospace; font-size: 18px; background: #000; padding: 6px 12px; border-radius: 6px; color: #f5c451; display: inline-block;">${tempPassword}</code>
            </div>
            <p>Click the button below to accept your invitation and set your permanent password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" style="background-color: #2bbfb3; color: #04211e; padding: 14px 28px; text-decoration: none; font-weight: bold; border-radius: 8px; display: inline-block; font-size: 16px;">Activate Account</a>
            </div>
            <p style="font-size: 13px; color: #94a3b8; word-break: break-all;">Or copy and paste this direct link into your browser:<br/><a href="${magicLink}" style="color: #2bbfb3;">${magicLink}</a></p>
          </div>
        `;
        await sendEmail({
          to: email,
          subject: `Ashal Innomech Ops Invitation for ${memberName}`,
          html,
        });
        emailSent = true;
      } catch (e: any) {
        console.warn("Resend email delivery skipped or sandbox restriction:", e.message);
      }

      logSecurityEvent(
        "Super Admin",
        "GMAIL_MAGIC_LINK_CREATED",
        `Created magic link invitation for ${email} with role '${assignedRole}' and temporary password`
      );

      return NextResponse.json({
        success: true,
        invitation: newInv,
        magicLink,
        tempPassword,
        emailSent,
        message: `Gmail Magic Link & temporary password generated for ${email}`,
      });
    }

    if (action === "update_role") {
      const { userId, email, newRole } = body as { userId?: string; email?: string; newRole: string };
      const normalizedRole = normalizeAdminRole(newRole);

      // Check MongoDB Atlas first or concurrently
      let mongoUser: any = null;
      try {
        const { findMongoAdminUser, updateMongoUserRole } = await import("@/lib/adminMongo");
        if (userId) mongoUser = await findMongoAdminUser(userId);
        if (!mongoUser && email) mongoUser = await findMongoAdminUser(email);
        if (mongoUser) {
          await updateMongoUserRole(mongoUser.email, normalizedRole);
        }
      } catch (mongoErr) {
        console.warn("MongoDB role update error:", mongoErr);
      }

      let userToUpdate = db.users.find(u => 
        (userId && u.id === userId) ||
        (email && u.email.toLowerCase() === email.toLowerCase()) ||
        (mongoUser && u.email.toLowerCase() === mongoUser.email.toLowerCase())
      );

      if (!userToUpdate && mongoUser) {
        userToUpdate = {
          id: mongoUser.id || userId || `usr-${Date.now().toString(36)}`,
          email: mongoUser.email.toLowerCase(),
          name: mongoUser.name || mongoUser.email.split("@")[0],
          role: normalizedRole,
          status: mongoUser.status || "active",
          tempPassword: mongoUser.password || mongoUser.tempPassword,
          createdAt: mongoUser.createdAt || new Date().toISOString(),
        };
        db.users.push(userToUpdate);
      }

      if (!userToUpdate) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (userToUpdate.email.toLowerCase() === "pvs178380@gmail.com" || userToUpdate.id === "usr-super-pvs") {
        return NextResponse.json({ error: "Cannot modify role of the Hidden Super Admin account." }, { status: 403 });
      }

      const oldRole = userToUpdate.role;
      userToUpdate.role = normalizedRole;

      const inv = db.invitations.find(i => i.email.toLowerCase() === userToUpdate!.email.toLowerCase());
      if (inv) {
        inv.role = normalizedRole;
      }

      writeRolesDB(db);

      // Also ensure updated in MongoDB Atlas
      try {
        const { upsertMongoAdminUser, upsertMongoInvitation } = await import("@/lib/adminMongo");
        await upsertMongoAdminUser({
          id: userToUpdate.id,
          email: userToUpdate.email,
          name: userToUpdate.name,
          role: normalizedRole,
          status: userToUpdate.status,
          tempPassword: userToUpdate.tempPassword,
        });
        if (inv) await upsertMongoInvitation(inv);
      } catch (mongoErr) {
        console.warn("MongoDB sync during role update warning:", mongoErr);
      }

      logSecurityEvent(
        "Super Admin",
        "ROLE_UPDATED",
        `Updated role for ${userToUpdate.email} from '${oldRole}' to '${normalizedRole}'`
      );

      return NextResponse.json({ success: true, user: userToUpdate });
    }

    if (action === "change_temp_password") {
      const { userId, email, newTempPassword } = body as { userId?: string; email?: string; newTempPassword?: string };
      let mongoUser: any = null;
      try {
        const { findMongoAdminUser } = await import("@/lib/adminMongo");
        if (userId) mongoUser = await findMongoAdminUser(userId);
        if (!mongoUser && email) mongoUser = await findMongoAdminUser(email);
      } catch (e) {}

      let targetUser = db.users.find(u => 
        (userId && u.id === userId) ||
        (email && u.email.toLowerCase() === email.toLowerCase()) ||
        (mongoUser && u.email.toLowerCase() === mongoUser.email.toLowerCase())
      );

      if (!targetUser && mongoUser) {
        targetUser = {
          id: mongoUser.id || userId || `usr-${Date.now().toString(36)}`,
          email: mongoUser.email.toLowerCase(),
          name: mongoUser.name || mongoUser.email.split("@")[0],
          role: normalizeAdminRole(mongoUser.role),
          status: mongoUser.status || "active",
          tempPassword: mongoUser.password || mongoUser.tempPassword,
          createdAt: mongoUser.createdAt || new Date().toISOString(),
        };
        db.users.push(targetUser);
      }

      if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (targetUser.email.toLowerCase() === "pvs178380@gmail.com" || targetUser.id === "usr-super-pvs") {
        return NextResponse.json({ error: "Cannot change password of the Hidden Super Admin account." }, { status: 403 });
      }

      const updatedPass = newTempPassword?.trim() || generateTempPassword();
      targetUser.tempPassword = updatedPass;

      const inv = db.invitations.find(i => i.email.toLowerCase() === targetUser!.email.toLowerCase());
      if (inv) {
        inv.tempPassword = updatedPass;
      }

      writeRolesDB(db);

      // Sync new password to MongoDB Atlas
      try {
        const { upsertMongoAdminUser, upsertMongoInvitation } = await import("@/lib/adminMongo");
        await upsertMongoAdminUser({
          id: targetUser.id,
          email: targetUser.email,
          name: targetUser.name,
          role: targetUser.role,
          status: targetUser.status,
          tempPassword: updatedPass,
          password: updatedPass,
        });
        if (inv) await upsertMongoInvitation(inv);
      } catch (mongoErr) {
        console.warn("MongoDB sync during temp password reset warning:", mongoErr);
      }

      logSecurityEvent(
        "Super Admin",
        "TEMP_PASSWORD_RESET",
        `Reset password for user ${targetUser.email}`
      );

      return NextResponse.json({ success: true, tempPassword: updatedPass, email: targetUser.email });
    }

    if (action === "revoke_user") {
      const { userId, email } = body as { userId?: string; email?: string };
      let targetEmail = (email || "").toLowerCase().trim();

      if (!targetEmail && userId) {
        const local = db.users.find(u => u.id === userId);
        if (local) targetEmail = local.email.toLowerCase();
        else {
          try {
            const { findMongoAdminUser } = await import("@/lib/adminMongo");
            const m = await findMongoAdminUser(userId);
            if (m) targetEmail = m.email.toLowerCase();
          } catch (e) {}
        }
      }

      if (
        targetEmail === "admin@ashalinnomech.com" ||
        userId === "usr-super-1" ||
        targetEmail === "pvs178380@gmail.com" ||
        userId === "usr-super-pvs"
      ) {
        return NextResponse.json({ error: "Cannot revoke Super Admin accounts." }, { status: 400 });
      }

      // Filter out user from db.users
      db.users = db.users.filter(u => {
        const matchId = userId && u.id === userId;
        const matchEmail = targetEmail && u.email.toLowerCase() === targetEmail;
        return !matchId && !matchEmail;
      });

      // Filter out invitation from db.invitations
      if (targetEmail) {
        db.invitations = db.invitations.filter(i => i.email.toLowerCase() !== targetEmail);
      }

      // Add to revokedEmails to prevent auto-re-registration
      if (!db.revokedEmails) db.revokedEmails = [];
      if (targetEmail && !db.revokedEmails.includes(targetEmail)) {
        db.revokedEmails.push(targetEmail);
      }

      writeRolesDB(db);

      // Delete from MongoDB Atlas
      try {
        const { deleteMongoAdminUser } = await import("@/lib/adminMongo");
        if (targetEmail) await deleteMongoAdminUser(targetEmail);
        else if (userId) await deleteMongoAdminUser(userId);
      } catch (mongoErr) {
        console.warn("MongoDB delete during revoke warning:", mongoErr);
      }

      logSecurityEvent("Super Admin", "USER_REVOKED", `Revoked access for ${targetEmail || userId}`);

      return NextResponse.json({ success: true, message: `Access revoked permanently for ${targetEmail || userId}` });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
