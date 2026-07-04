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
