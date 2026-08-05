import { NextRequest, NextResponse } from "next/server";
import { changePassword } from "@/lib/adminCredentials";

export const runtime = "nodejs";

// Auth (valid admin session) is enforced by middleware for all /api/admin/*
// routes. This endpoint additionally requires the CURRENT password before
// accepting a new one — a session cookie alone proves "logged in right
// now", not "still the legitimate admin", so re-checking the password
// keeps a stolen/left-open session from silently taking over the account.
export async function POST(req: NextRequest) {
  let body: { currentPassword?: string; newPassword?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad request" }, { status: 400 }); }

  const { currentPassword, newPassword } = body;
  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
  }

  const result = await changePassword(currentPassword, newPassword);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  return NextResponse.json({ ok: true });
}
