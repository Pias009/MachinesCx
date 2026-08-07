import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { verifyCustomerSessionToken, CUSTOMER_SESSION_COOKIE } from "@/lib/customerAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = await verifyCustomerSessionToken(req.cookies.get(CUSTOMER_SESSION_COOKIE)?.value);
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  await connectDB();
  // Case-insensitive — see the matching comment in api/account/login/route.ts.
  const inquiries = await Inquiry.find({ email }).collation({ locale: "en", strength: 2 }).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    email,
    name: inquiries[0]?.name ?? "",
    inquiries: inquiries.map(i => ({
      _id: i._id,
      inquiryType: i.inquiryType,
      machines: i.machines,
      parts: i.parts,
      message: i.message,
      status: i.status,
      replies: i.replies,
      createdAt: i.createdAt,
    })),
  });
}
