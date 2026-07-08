import { NextRequest, NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/adminCredentials";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/adminAuth";

export const runtime = "nodejs";

// Rate limiting removed — in-memory Maps don't persist across
// Vercel serverless invocations. Relies on strong password hash instead.

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const ok = await verifyCredentials(body.email ?? "", body.password ?? "");
  if (!ok) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions());
  return res;
}
