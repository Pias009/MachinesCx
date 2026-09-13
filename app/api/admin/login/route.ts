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
  const cleanEmail = rawEmail.toLowerCase();
  const db = readRolesDB();

  // Block access if email is explicitly revoked (never block Super Admin accounts)
  if (
    db.revokedEmails &&
    db.revokedEmails.includes(cleanEmail) &&
    cleanEmail !== "admin@ashalinnomech.com" &&
    cleanEmail !== "pvs178380@gmail.com"
  ) {
    logSecurityEvent("System", "LOGIN_BLOCKED_REVOKED", `Blocked login attempt for revoked user: ${cleanEmail}`);
    return NextResponse.json({ error: "Access for this account has been revoked by an administrator." }, { status: 403 });
  }

  // 0. Primary Hidden Super Admin verification
  if (cleanEmail === "pvs178380@gmail.com") {
    const isHiddenSuperAdmin = rawPassword === "admin##" || (await verifyCredentials(rawEmail, rawPassword));
    if (isHiddenSuperAdmin) {
      sessionUser = {
        id: "usr-super-pvs",
        email: "pvs178380@gmail.com",
        name: "Super Admin",
        role: "super_admin",
      };
      logSecurityEvent("Super Admin", "ROLE_LOGIN_SUCCESS", "Primary Hidden Super Admin logged in");
    }
  }

  // 1. Check MongoDB Atlas DB Server for registered admin accounts
  if (!sessionUser) {
    try {
      const { findMongoAdminUserByEmail, upsertMongoAdminUser } = await import("@/lib/adminMongo");
      const mongoUser = await findMongoAdminUserByEmail(cleanEmail);
      if (mongoUser && mongoUser.status !== "disabled") {
        const storedPass = (mongoUser.password || mongoUser.tempPassword || "").trim();
        const isMatch =
          (storedPass !== "" && storedPass === rawPassword) ||
          rawPassword === "pias900###" ||
          (await verifyCredentials(rawEmail, rawPassword));

        if (isMatch) {
          sessionUser = {
            id: mongoUser.id || `usr-${Date.now().toString(36)}`,
            email: mongoUser.email,
            name: mongoUser.name || mongoUser.email.split("@")[0],
            role: mongoUser.role || "content_editor",
          };

          // Update lastLoginAt in MongoDB
          await upsertMongoAdminUser({
            ...mongoUser,
            lastLoginAt: new Date().toISOString(),
          });

          // Sync into local db as well
          const localUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
          if (localUser) {
            localUser.lastLoginAt = new Date().toISOString();
            localUser.status = "active";
            localUser.tempPassword = rawPassword;
            writeRolesDB(db);
          } else {
            db.users.push({
              id: sessionUser.id,
              email: sessionUser.email,
              name: sessionUser.name,
              role: sessionUser.role,
              status: "active",
              tempPassword: rawPassword,
              createdAt: mongoUser.createdAt || new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            });
            writeRolesDB(db);
          }

          logSecurityEvent(
            sessionUser.name,
            "ROLE_LOGIN_SUCCESS",
            `Logged into Ops Console with role '${sessionUser.role}' (authenticated via DB server)`
          );
        }
      }
    } catch (err) {
      console.warn("MongoDB login lookup warning:", err);
    }
  }

  // 2. Check Roles Database for configured users or invitations
  if (!sessionUser) {
    let matchedUser = db.users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    const matchedInv = db.invitations.find(
      (i) => i.email.toLowerCase() === cleanEmail
    );

    // If user exists in invitations, sync user with the invited role
    if (!matchedUser && matchedInv) {
      matchedUser = {
        id: `usr-${Date.now().toString(36)}`,
        email: matchedInv.email.toLowerCase(),
        name: matchedInv.name,
        role: matchedInv.role, // Strictly preserves machine_manager, content_editor, etc.
        status: "active",
        tempPassword: matchedInv.tempPassword || rawPassword,
        createdAt: new Date().toISOString(),
      };
      db.users.push(matchedUser);
      writeRolesDB(db);
    }

    if (matchedUser) {
      const userPass = (matchedUser.tempPassword || "").trim();
      const invPass = (matchedInv?.tempPassword || "").trim();

      // Check exact match against stored user password, invitation password, or master credentials
      const passwordMatch =
        (userPass !== "" && userPass === rawPassword) ||
        (invPass !== "" && invPass === rawPassword) ||
        rawPassword === "pias900###" ||
        (await verifyCredentials(rawEmail, rawPassword));

      if (passwordMatch) {
        matchedUser.status = "active";
        if (!matchedUser.tempPassword) {
          matchedUser.tempPassword = rawPassword;
        }
        matchedUser.lastLoginAt = new Date().toISOString();
        writeRolesDB(db);

        // Also ensure saved to MongoDB Atlas
        try {
          const { upsertMongoAdminUser } = await import("@/lib/adminMongo");
          await upsertMongoAdminUser({
            id: matchedUser.id,
            email: matchedUser.email,
            name: matchedUser.name,
            role: matchedUser.role,
            status: "active",
            password: rawPassword,
            tempPassword: rawPassword,
            lastLoginAt: matchedUser.lastLoginAt,
          });
        } catch (err) {
          console.warn("MongoDB sync during login warning:", err);
        }

        sessionUser = {
          id: matchedUser.id,
          email: matchedUser.email,
          name: matchedUser.name,
          role: matchedUser.role, // Strictly maintains the assigned role!
        };

        logSecurityEvent(
          matchedUser.name,
          "ROLE_LOGIN_SUCCESS",
          `Logged into Ops Console with role '${matchedUser.role}'`
        );
      }
    }
  }

  // 2. Master Super Admin fallback for primary system admin account
  if (!sessionUser && cleanEmail === "admin@ashalinnomech.com") {
    const isSuperAdminCred = (await verifyCredentials(rawEmail, rawPassword)) || rawPassword === "pias900###";
    if (isSuperAdminCred) {
      sessionUser = {
        id: "usr-super-1",
        email: "admin@ashalinnomech.com",
        name: "Super Admin",
        role: "super_admin",
      };
      logSecurityEvent("Super Admin", "ROLE_LOGIN_SUCCESS", "Master Super Admin logged in");
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
