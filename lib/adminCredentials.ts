import { connectDB } from "@/lib/mongodb";
import AdminCredentials from "@/models/AdminCredentials";

const EMAIL_CHANGE_TTL_MS = 1000 * 60 * 30; // 30 minutes

async function hashPassword(password: string): Promise<string> {
  const { scryptSync, randomBytes } = await import("crypto");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function checkPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const { scryptSync, timingSafeEqual } = await import("crypto");
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/** Loads the one admin credentials doc, seeding it from ADMIN_EMAIL /
 *  ADMIN_PASSWORD_HASH the first time this ever runs (so upgrading from the
 *  old env-var-only setup doesn't lock anyone out — the existing password
 *  keeps working, it just now lives in the DB where it can be changed). */
async function getOrSeedCredentials() {
  await connectDB();
  let doc = await AdminCredentials.findOne({ singleton: true });
  if (doc) return doc;

  const envEmail = process.env.ADMIN_EMAIL;
  const envHash = process.env.ADMIN_PASSWORD_HASH;
  if (!envEmail || !envHash) return null;

  doc = await AdminCredentials.create({
    singleton: true,
    email: envEmail.trim().toLowerCase(),
    passwordHash: envHash,
  });
  return doc;
}

export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const doc = await getOrSeedCredentials();
  if (!doc) return false;
  if (email.trim().toLowerCase() !== doc.email.toLowerCase()) return false;
  return checkPassword(password, doc.passwordHash);
}

export async function getAdminEmail(): Promise<string | null> {
  const doc = await getOrSeedCredentials();
  return doc?.email ?? null;
}

/** Changes the password after verifying the CURRENT one — never trust a
 *  valid session cookie alone for this, since a hijacked/stale session
 *  shouldn't be able to lock the real admin out. */
export async function changePassword(currentPassword: string, newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const doc = await getOrSeedCredentials();
  if (!doc) return { ok: false, error: "Admin account not configured" };
  const valid = await checkPassword(currentPassword, doc.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect" };
  if (newPassword.length < 10) return { ok: false, error: "New password must be at least 10 characters" };

  doc.passwordHash = await hashPassword(newPassword);
  doc.updatedAt = new Date();
  await doc.save();
  return { ok: true };
}

/** Step 1 of an email change — verifies the current password, then stores
 *  a pending email + signed token (does NOT change the login email yet).
 *  Returns the token so the caller can email it as a confirmation link;
 *  the change only takes effect once confirmEmailChange() validates it. */
export async function requestEmailChange(currentPassword: string, newEmail: string): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  const doc = await getOrSeedCredentials();
  if (!doc) return { ok: false, error: "Admin account not configured" };
  const valid = await checkPassword(currentPassword, doc.passwordHash);
  if (!valid) return { ok: false, error: "Current password is incorrect" };

  const normalized = newEmail.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return { ok: false, error: "Enter a valid email address" };
  if (normalized === doc.email.toLowerCase()) return { ok: false, error: "That's already the current email" };

  const { randomBytes } = await import("crypto");
  const token = randomBytes(32).toString("hex");

  doc.pendingEmail = normalized;
  doc.pendingEmailToken = token;
  doc.pendingEmailExpires = new Date(Date.now() + EMAIL_CHANGE_TTL_MS);
  await doc.save();

  return { ok: true, token };
}

export async function confirmEmailChange(token: string): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  await connectDB();
  const doc = await AdminCredentials.findOne({ singleton: true });
  if (!doc || !doc.pendingEmailToken || !doc.pendingEmail) return { ok: false, error: "No pending email change" };
  if (doc.pendingEmailToken !== token) return { ok: false, error: "Invalid confirmation link" };
  if (!doc.pendingEmailExpires || doc.pendingEmailExpires.getTime() < Date.now()) {
    return { ok: false, error: "This confirmation link has expired — request the change again" };
  }

  const email = doc.pendingEmail;
  doc.email = email;
  doc.pendingEmail = undefined;
  doc.pendingEmailToken = undefined;
  doc.pendingEmailExpires = undefined;
  doc.updatedAt = new Date();
  await doc.save();

  return { ok: true, email };
}
