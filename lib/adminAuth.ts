import { AdminRole } from "./adminRoles";

export const ADMIN_PATH = "cx-ops-x7k9q2";
export const SESSION_COOKIE = "__cxs";
const SESSION_TTL_S = 60 * 60 * 24 * 7;

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || "default_fallback_secret_ashal_ops_2026";
  return s;
}

// ── session tokens (Web Crypto — works in both Node and Edge middleware) ──
function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): string {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function hmac(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return toBase64Url(new Uint8Array(sig));
}

export async function createSessionToken(user?: Partial<SessionUser>): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_S;
  const userPayload: SessionUser = {
    id: user?.id || "usr-super-1",
    email: user?.email || "admin@ashalinnomech.com",
    name: user?.name || "Super Admin",
    role: user?.role || "super_admin",
  };
  const b64Data = toBase64Url(new TextEncoder().encode(JSON.stringify(userPayload)));
  const payload = `admin.${exp}.${b64Data}`;
  return `${payload}.${await hmac(payload)}`;
}

export async function parseSessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  const parts = token.split(".");
  
  // Legacy 3-part token: admin.exp.sig
  if (parts.length === 3) {
    const [scope, expStr, sig] = parts;
    if (scope !== "admin") return null;
    const exp = parseInt(expStr, 10);
    if (!exp || exp < Math.floor(Date.now() / 1000)) return null;
    const expected = await hmac(`${scope}.${expStr}`);
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    if (diff !== 0) return null;
    return {
      id: "usr-super-1",
      email: "admin@ashalinnomech.com",
      name: "Super Admin",
      role: "super_admin",
    };
  }

  // Modern 4-part token: admin.exp.b64Data.sig
  if (parts.length === 4) {
    const [scope, expStr, b64Data, sig] = parts;
    if (scope !== "admin") return null;
    const exp = parseInt(expStr, 10);
    if (!exp || exp < Math.floor(Date.now() / 1000)) return null;
    const expected = await hmac(`${scope}.${expStr}.${b64Data}`);
    if (sig.length !== expected.length) return null;
    let diff = 0;
    for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
    if (diff !== 0) return null;
    try {
      const decoded = JSON.parse(fromBase64Url(b64Data));
      return {
        id: decoded.id || "usr-user",
        email: decoded.email || "admin@ashalinnomech.com",
        name: decoded.name || "Admin User",
        role: decoded.role || "super_admin",
      };
    } catch {
      return null;
    }
  }

  return null;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  const user = await parseSessionToken(token);
  return user !== null;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_S,
  };
}

