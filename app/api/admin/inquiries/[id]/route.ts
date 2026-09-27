import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { parseSessionToken, SESSION_COOKIE } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
  "Pragma": "no-cache",
  "Expires": "0",
  "Surrogate-Control": "no-store",
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await parseSessionToken(token);
  if (!user || user.role === "machine_manager") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  await connectDB();
  const inquiry = await Inquiry.findById(params.id).lean();
  if (!inquiry) return NextResponse.json({ error: "not found" }, { status: 404, headers: NO_CACHE_HEADERS });
  return NextResponse.json({ inquiry }, { headers: NO_CACHE_HEADERS });
}

// Mark as read or update status (called when toggling or updating inquiry status)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await parseSessionToken(token);
  if (!user || user.role === "machine_manager") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: NO_CACHE_HEADERS });
  }

  let body: { status?: "new" | "read" | "replied" };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400, headers: NO_CACHE_HEADERS });
  }
  if (!body.status || !["new", "read", "replied"].includes(body.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400, headers: NO_CACHE_HEADERS });
  }
  await connectDB();
  const inquiry = await Inquiry.findByIdAndUpdate(params.id, { status: body.status }, { new: true }).lean();
  if (!inquiry) return NextResponse.json({ error: "not found" }, { status: 404, headers: NO_CACHE_HEADERS });
  return NextResponse.json({ inquiry }, { headers: NO_CACHE_HEADERS });
}
