import { NextRequest, NextResponse } from "next/server";
import { createInquiry, type CreateInquiryInput } from "@/lib/inquiries";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: CreateInquiryInput;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const inquiry = await createInquiry(body);
    return NextResponse.json({ ok: true, id: inquiry._id });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to submit inquiry";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
