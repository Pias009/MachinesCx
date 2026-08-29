import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/adminCredentials";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, SessionUser } from "@/lib/adminAuth";
import { readRolesDB, writeRolesDB, logSecurityEvent, AdminRole } from "@/lib/adminRoles";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; role?: AdminRole };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request payload" }, { status: 400 });
  }

  const rawEmail = (body.email ?? "").trim();
  const rawPassword = (body.password ?? "").trim();

  if (!rawEmail || !rawPassword) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  let sessionUser: SessionUser | null = null;

  // 1. Check Super Admin MongoDB / ENV Singleton Credentials
  const isSuperAdminCred = await verifyCredentials(rawEmail, rawPassword);
  if (isSuperAdminCred) {
    sessionUser = {
      id: "usr-super-1",
      email: rawEmail.toLowerCase(),
      name: "Super Admin",
      role: "super_admin",
    };
  }

  // 2. Check JSON Roles Database (Admin Users)
  if (!sessionUser) {
    const db = readRolesDB();
    const matchedUser = db.users.find(
      (u) => u.email.toLowerCase() === rawEmail.toLowerCase()
    );

    if (matchedUser) {
      // Check password match against user tempPassword or Super Admin credentials
      const passwordMatch =
        (matchedUser.tempPassword && matchedUser.tempPassword.trim() === rawPassword) ||
        (matchedUser.role === "super_admin" && (await verifyCredentials(rawEmail, rawPassword)));

      if (passwordMatch) {
        matchedUser.status = "active";
        matchedUser.lastLoginAt = new Date().toISOString();
        writeRolesDB(db);

        sessionUser = {
          id: matchedUser.id,
          email: matchedUser.email,
          name: matchedUser.name,
          role: matchedUser.role,
        };

        logSecurityEvent(
          matchedUser.name,
          "ROLE_LOGIN_SUCCESS",
          `Logged into Ops Console with role '${matchedUser.role}'`
        );
      }
    }
  }

  // 3. Reject if invalid credentials
  if (!sessionUser) {
    logSecurityEvent(
      rawEmail || "Unknown",
      "LOGIN_FAILED",
      "Failed authentication attempt with invalid email or password"
    );
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  // 4. Set Session Cookie with encoded user role info
  const sessionToken = await createSessionToken(sessionUser);
  const res = NextResponse.json({
    ok: true,
    user: sessionUser,
    message: `Signed in successfully as ${sessionUser.name}`,
  });

  res.cookies.set(SESSION_COOKIE, sessionToken, sessionCookieOptions());
  return res;
}
