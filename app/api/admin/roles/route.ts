import { NextRequest, NextResponse } from "next/server";
import {
  readRolesDB,
  writeRolesDB,
  logSecurityEvent,
  generateTempPassword,
  generateInviteToken,
  AdminRole,
} from "@/lib/adminRoles";

// GET /api/admin/roles — return users, invitations, audit log & role definitions
export async function GET() {
  const db = readRolesDB();
  return NextResponse.json({
    users: db.users,
    invitations: db.invitations,
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
    const body = await req.json();
    const { action } = body;
    const db = readRolesDB();

    if (action === "invite") {
      const { email, name, role } = body as { email: string; name?: string; role?: AdminRole };
      if (!email || !email.includes("@")) {
        return NextResponse.json({ error: "Please enter a valid Gmail / email address" }, { status: 400 });
      }

      const assignedRole: AdminRole = role || "content_editor";
      const memberName = name?.trim() || email.split("@")[0];
      const tempPassword = generateTempPassword();
      const token = generateInviteToken();

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
        token,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      db.invitations.unshift(newInv);

      // Add user record if not present
      let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = {
          id: `usr-${Date.now().toString(36)}`,
          email: email.toLowerCase(),
          name: memberName,
          role: assignedRole,
          status: "invited",
          tempPassword,
          createdAt: new Date().toISOString(),
        };
        db.users.push(user);
      } else {
        user.role = assignedRole;
        user.status = "invited";
        user.tempPassword = tempPassword;
      }

      writeRolesDB(db);

      const origin = req.nextUrl.origin;
      const magicLink = `${origin}/cx-ops-x7k9q2/invite?token=${token}&email=${encodeURIComponent(email)}`;

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
      const { userId, newRole } = body as { userId: string; newRole: AdminRole };
      const user = db.users.find(u => u.id === userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const oldRole = user.role;
      user.role = newRole;
      writeRolesDB(db);

      logSecurityEvent(
        "Super Admin",
        "ROLE_UPDATED",
        `Updated role for ${user.email} from '${oldRole}' to '${newRole}'`
      );

      return NextResponse.json({ success: true, user });
    }

    if (action === "change_temp_password") {
      const { userId, newTempPassword } = body as { userId: string; newTempPassword?: string };
      const user = db.users.find(u => u.id === userId);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

      const updatedPass = newTempPassword?.trim() || generateTempPassword();
      user.tempPassword = updatedPass;

      const inv = db.invitations.find(i => i.email.toLowerCase() === user.email.toLowerCase());
      if (inv) {
        inv.tempPassword = updatedPass;
      }

      writeRolesDB(db);

      logSecurityEvent(
        "Super Admin",
        "TEMP_PASSWORD_RESET",
        `Reset password for user ${user.email}`
      );

      return NextResponse.json({ success: true, tempPassword: updatedPass, email: user.email });
    }

    if (action === "revoke_user") {
      const { userId, email } = body as { userId?: string; email?: string };
      
      const userIdx = db.users.findIndex(u => 
        (userId && u.id === userId) || 
        (email && u.email.toLowerCase() === email.toLowerCase())
      );

      if (userIdx < 0) {
        // If user not in main users array, check invitations list
        if (email) {
          const invIdx = db.invitations.findIndex(i => i.email.toLowerCase() === email.toLowerCase());
          if (invIdx >= 0) {
            db.invitations.splice(invIdx, 1);
            writeRolesDB(db);
            return NextResponse.json({ success: true });
          }
        }
        return NextResponse.json({ error: "User or invitation not found" }, { status: 404 });
      }

      const removedUser = db.users[userIdx];
      if (removedUser.role === "super_admin" && db.users.filter(u => u.role === "super_admin").length <= 1) {
        return NextResponse.json({ error: "Cannot revoke the primary Super Admin account" }, { status: 400 });
      }

      db.users.splice(userIdx, 1);
      db.invitations = db.invitations.filter(i => i.email.toLowerCase() !== removedUser.email.toLowerCase());
      writeRolesDB(db);

      logSecurityEvent("Super Admin", "USER_REVOKED", `Revoked access for ${removedUser.email}`);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process request" }, { status: 500 });
  }
}
