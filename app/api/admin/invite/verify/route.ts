import { NextRequest, NextResponse } from "next/server";
import { readRolesDB, writeRolesDB, logSecurityEvent } from "@/lib/adminRoles";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/adminAuth";

// GET /api/admin/invite/verify?token=... — verify invitation token details
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")?.trim();
  const emailParam = req.nextUrl.searchParams.get("email")?.trim();

  if (!token && !emailParam) {
    return NextResponse.json({ error: "Missing invitation token or email parameter" }, { status: 400 });
  }

  const db = readRolesDB();

  // Flexible lookup by token, id, or email
  let inv = db.invitations.find(i => 
    (token && (i.token === token || i.id === token)) ||
    (emailParam && i.email.toLowerCase() === emailParam.toLowerCase())
  );

  // Fallback: search users array if invitation entry was missing
  if (!inv) {
    const user = db.users.find(u => 
      (emailParam && u.email.toLowerCase() === emailParam.toLowerCase()) ||
      (token && u.email.toLowerCase().includes(token.toLowerCase()))
    );

    if (user && user.tempPassword) {
      inv = {
        id: `inv-${user.id.replace("usr-", "")}`,
        email: user.email.toLowerCase(),
        name: user.name,
        role: user.role,
        tempPassword: user.tempPassword,
        token: token || `mag_${user.id}`,
        status: user.status === "active" ? "accepted" : "pending",
        createdAt: user.createdAt || new Date().toISOString(),
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      };
      db.invitations.push(inv);
      writeRolesDB(db);
    }
  }

  if (!inv) {
    return NextResponse.json({ error: "Invalid or expired invitation token" }, { status: 404 });
  }

  // Ensure temp password is in sync with user profile
  const user = db.users.find(u => u.email.toLowerCase() === inv!.email.toLowerCase());
  const activeTempPassword = user?.tempPassword || inv.tempPassword;

  // Auto-renew invitation link expiration & reactivate status so magic links never show expired
  inv.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  if (inv.status === "expired") {
    inv.status = "pending";
  }
  writeRolesDB(db);

  return NextResponse.json({
    email: inv.email,
    name: inv.name,
    role: inv.role,
    status: inv.status,
    tempPasswordHint: activeTempPassword,
  });
}

// POST /api/admin/invite/verify — accept invitation, validate temp password, set new password
export async function POST(req: NextRequest) {
  try {
    const { token, tempPassword, newPassword, email: clientEmail } = await req.json();
    if (!token && !clientEmail) {
      return NextResponse.json({ error: "Missing required invitation token" }, { status: 400 });
    }

    if (!tempPassword || !newPassword) {
      return NextResponse.json({ error: "Please enter temporary password and permanent password" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    const db = readRolesDB();
    const inv = db.invitations.find(i => 
      (token && (i.token === token || i.id === token)) ||
      (clientEmail && i.email.toLowerCase() === clientEmail.trim().toLowerCase())
    );

    const user = db.users.find(u => 
      (inv && u.email.toLowerCase() === inv.email.toLowerCase()) ||
      (clientEmail && u.email.toLowerCase() === clientEmail.trim().toLowerCase())
    );

    if (!inv && !user) {
      return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });
    }

    const expectedTempPass = user?.tempPassword || inv?.tempPassword || "";
    if (expectedTempPass.trim() !== tempPassword.trim()) {
      return NextResponse.json({ error: "Incorrect temporary password provided" }, { status: 401 });
    }

    if (inv) inv.status = "accepted";
    if (user) {
      user.status = "active";
      user.tempPassword = newPassword.trim(); // update password
      user.lastLoginAt = new Date().toISOString();
    }

    writeRolesDB(db);
    logSecurityEvent(
      user?.email || inv?.email || "User",
      "INVITATION_ACCEPTED",
      `Accepted invitation and set secure permanent password for role ${user?.role || inv?.role}`
    );

    const res = NextResponse.json({ success: true, message: "Account activated successfully" });
    const sessionToken = await createSessionToken();
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to accept invitation" }, { status: 500 });
  }
}
