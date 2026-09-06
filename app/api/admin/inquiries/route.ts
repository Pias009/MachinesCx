import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { parseSessionToken, SESSION_COOKIE } from "@/lib/adminAuth";

// Auth is enforced by middleware and validated here for RBAC.
export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await parseSessionToken(token);
  if (!user || (user.role !== "super_admin" && user.role !== "analytics_viewer")) {
    return NextResponse.json({ error: "forbidden: inquiries access not permitted for this role" }, { status: 403 });
  }

  await connectDB();
  const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ inquiries });
}

// DELETE /api/admin/inquiries — body: { ids: string[] } (super_admin only)
export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = await parseSessionToken(token);
  if (!user || user.role !== "super_admin") {
    return NextResponse.json({ error: "forbidden: only super_admin can delete inquiries" }, { status: 403 });
  }

  let body: { ids?: string[] };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: "ids is required" }, { status: 400 });
  }
  await connectDB();
  const result = await Inquiry.deleteMany({ _id: { $in: body.ids } });
  return NextResponse.json({ deletedCount: result.deletedCount });
}
