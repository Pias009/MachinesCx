import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth is enforced by middleware for all /api/admin/* routes.

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const inquiry = await Inquiry.findById(params.id).lean();
  if (!inquiry) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ inquiry });
}

// Mark as read (called when the admin opens an inquiry)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let body: { status?: "new" | "read" | "replied" };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.status || !["new", "read", "replied"].includes(body.status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  await connectDB();
  const inquiry = await Inquiry.findByIdAndUpdate(params.id, { status: body.status }, { new: true }).lean();
  if (!inquiry) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ inquiry });
}
