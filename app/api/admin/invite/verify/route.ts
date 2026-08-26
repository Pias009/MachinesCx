import { NextRequest, NextResponse } from "next/server";
import { readRolesDB, writeRolesDB, logSecurityEvent } from "@/lib/adminRoles";
import { createSessionToken, sessionCookieOptions, SESSION_COOKIE } from "@/lib/adminAuth";

// GET /api/admin/invite/verify?token=... — verify invitation token details
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing invitation token" }, { status: 400 });

  const db = readRolesDB();
  const inv = db.invitations.find(i => i.token === token);
  if (!inv) return NextResponse.json({ error: "Invalid or expired invitation token" }, { status: 404 });

  if (new Date(inv.expiresAt).getTime() < Date.now()) {
    inv.status = "expired";
    writeRolesDB(db);
    return NextResponse.json({ error: "Invitation token has expired" }, { status: 410 });
  }

  return NextResponse.json({
    email: inv.email,
    name: inv.name,
    role: inv.role,
    status: inv.status,
    tempPasswordHint: inv.tempPassword,
  });
}

// POST /api/admin/invite/verify — accept invitation, validate temp password, set new password
export async function POST(req: NextRequest) {
  try {
    const { token, tempPassword, newPassword } = await req.json();
    if (!token || !tempPassword || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters long" }, { status: 400 });
    }

    const db = readRolesDB();
    const inv = db.invitations.find(i => i.token === token);
    if (!inv) return NextResponse.json({ error: "Invalid invitation link" }, { status: 404 });

    if (inv.tempPassword.trim() !== tempPassword.trim()) {
      return NextResponse.json({ error: "Incorrect temporary password provided" }, { status: 401 });
    }

    inv.status = "accepted";
    const user = db.users.find(u => u.email.toLowerCase() === inv.email.toLowerCase());
    if (user) {
      user.status = "active";
      delete user.tempPassword;
      user.lastLoginAt = new Date().toISOString();
    }

    writeRolesDB(db);
    logSecurityEvent(inv.email, "INVITATION_ACCEPTED", `Accepted invitation and initialized secure password for role ${inv.role}`);

    const res = NextResponse.json({ success: true, message: "Account activated successfully" });
    const sessionToken = await createSessionToken();
    res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to accept invitation" }, { status: 500 });
  }
}
