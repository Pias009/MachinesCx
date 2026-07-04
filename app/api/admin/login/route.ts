import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/adminCredentials";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/adminAuth";

export const runtime = "nodejs";

// naive in-memory throttle — 5 attempts / 10 min per IP
const attempts = new Map<string, { n: number; t: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const rec = attempts.get(ip);
  if (rec && now - rec.t < WINDOW_MS && rec.n >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const ok = await verifyCredentials(body.email ?? "", body.password ?? "");
  if (!ok) {
    const cur = rec && now - rec.t < WINDOW_MS ? rec : { n: 0, t: now };
    attempts.set(ip, { n: cur.n + 1, t: cur.t });
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  attempts.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
  return res;
}
