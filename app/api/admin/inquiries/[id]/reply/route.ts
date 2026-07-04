import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { sendEmail, loadLocalImageAttachments } from "@/lib/resend";

export const runtime = "nodejs";

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Auth is enforced by middleware for all /api/admin/* routes.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  let body: { message: string; images?: string[] };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.message?.trim()) {
    return NextResponse.json({ error: "Reply message is required" }, { status: 400 });
  }

  await connectDB();
  const inquiry = await Inquiry.findById(params.id);
  if (!inquiry) return NextResponse.json({ error: "not found" }, { status: 404 });

  const images = body.images ?? [];
  const attachments = await loadLocalImageAttachments(images);

  try {
    await sendEmail({
      to: inquiry.email,
      subject: `Re: your inquiry to Ashal Innomach`,
      html: `
        <p>Hi ${escapeHtml(inquiry.name)},</p>
        <p>${escapeHtml(body.message).replace(/\n/g, "<br/>")}</p>
        <p style="color:#888;font-size:12px;margin-top:24px">— Ashal Innomach</p>
      `,
      attachments,
    });
  } catch (e) {
    return NextResponse.json({ error: `Failed to send email: ${(e as Error).message}` }, { status: 502 });
  }

  inquiry.replies.push({
    message: body.message.trim(),
    images,
    sentAt: new Date(),
    sentBy: process.env.ADMIN_EMAIL || "admin",
  });
  inquiry.status = "replied";
  await inquiry.save();

  return NextResponse.json({ ok: true, inquiry });
}
