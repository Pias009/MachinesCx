// No-password customer login — mirrors lib/adminAuth.ts's signed-token
// pattern (Web Crypto HMAC, works in both Node and Edge), but embeds an
// email in the payload since there are many customers, not one admin, and
// two scopes share one secret: "login" (short-lived, emailed as a magic
// link) and "customer" (the actual session, set once the link is clicked).
// A login token can never be replayed as a session token or vice versa —
// verify() rejects on scope mismatch regardless of a valid signature.
export const CUSTOMER_SESSION_COOKIE = "__cxu";
const SESSION_TTL_S = 60 * 60 * 24 * 30; // 30 days — B2B buyers return infrequently
const LOGIN_TOKEN_TTL_S = 60 * 20;       // 20 minutes to click the emailed link

function getSecret(): string {
  const s = process.env.CUSTOMER_SESSION_SECRET;
  if (!s) throw new Error("CUSTOMER_SESSION_SECRET not set");
  return s;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  return atob(b64);
}

async function hmac(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

async function sign(scope: string, email: string, ttlS: number): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + ttlS;
  const emailB64 = toBase64Url(new TextEncoder().encode(email.trim().toLowerCase()));
  const payload = `${scope}.${exp}.${emailB64}`;
  return `${payload}.${await hmac(payload)}`;
}

async function verify(scope: string, token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [tScope, expStr, emailB64, sig] = parts;
  if (tScope !== scope) return null;
  const exp = parseInt(expStr, 10);
  if (!exp || exp < Math.floor(Date.now() / 1000)) return null;
  const expected = await hmac(`${tScope}.${expStr}.${emailB64}`);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return null;
  try { return fromBase64Url(emailB64); } catch { return null; }
}

export const createLoginToken = (email: string) => sign("login", email, LOGIN_TOKEN_TTL_S);
export const verifyLoginToken = (token: string | undefined) => verify("login", token);
export const createCustomerSessionToken = (email: string) => sign("customer", email, SESSION_TTL_S);
export const verifyCustomerSessionToken = (token: string | undefined) => verify("customer", token);

export function customerSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  };
}
