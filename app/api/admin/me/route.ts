import { NextRequest, NextResponse } from "next/server";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await parseSessionToken(token);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
