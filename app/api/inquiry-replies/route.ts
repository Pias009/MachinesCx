import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import type { InquiryReply } from "@/models/Inquiry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email?.trim()) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  await connectDB();
  const inquiries = await Inquiry.find({
    email: email.trim().toLowerCase(),
    status: "replied",
  })
    .sort({ createdAt: -1 })
    .lean();

  const lastSeenKey = req.nextUrl.searchParams.get("lastSeen");
  const lastSeen = lastSeenKey ? new Date(lastSeenKey) : null;

  const replies = inquiries.flatMap(inq =>
    (inq.replies as InquiryReply[])
      .filter((r: InquiryReply) => !lastSeen || new Date(r.sentAt) > lastSeen)
      .map((r: InquiryReply) => ({
        inquiryId: inq._id,
        inquiryType: inq.inquiryType,
        message: r.message,
        images: r.images,
        sentAt: r.sentAt,
        sentBy: r.sentBy,
        machineNames: inq.machines.map((m: { name: string }) => m.name),
        partNames: inq.parts.map((p: { name: string }) => p.name),
      }))
  );

  return NextResponse.json({
    hasNewReplies: replies.length > 0,
    count: replies.length,
    replies,
  });
}
