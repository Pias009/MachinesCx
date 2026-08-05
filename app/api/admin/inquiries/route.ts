import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth is enforced by middleware for all /api/admin/* routes.
export async function GET(_req: NextRequest) {
  await connectDB();
  const inquiries = await Inquiry.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ inquiries });
}

// DELETE /api/admin/inquiries — body: { ids: string[] }
export async function DELETE(req: NextRequest) {
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
