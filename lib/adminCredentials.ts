export async function verifyCredentials(email: string, password: string): Promise<boolean> {
  const envEmail = process.env.ADMIN_EMAIL;
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!envEmail || !stored) return false;
  if (email.trim().toLowerCase() !== envEmail.toLowerCase()) return false;

  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;

  const { scryptSync, timingSafeEqual } = await import("crypto");
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}
