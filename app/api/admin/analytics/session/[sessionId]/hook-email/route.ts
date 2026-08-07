import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import { sendEmail } from "@/lib/resend";
import { renderEmailLayout } from "@/lib/emailTemplate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Matches the escapeHtml() convention in lib/inquiries.ts / lib/leadNotify.ts
// — this text (an AI draft, or an admin's free-text edit of one) was going
// straight into the outbound HTML unescaped, unlike every other email this
// codebase sends.
function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

// Auth is enforced by middleware for all /api/admin/* routes.
export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  let body: { action?: "send" | "dismiss"; subject?: string; body?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); }
  if (body.action !== "send" && body.action !== "dismiss") {
    return NextResponse.json({ error: "action must be 'send' or 'dismiss'" }, { status: 400 });
  }

  await connectDB();
  const session = await ChatSession.findOne({ sessionId: params.sessionId });
  if (!session || !session.hookDraft) return NextResponse.json({ error: "no draft found" }, { status: 404 });
  if (session.hookDraft.status !== "pending") {
    return NextResponse.json({ error: `draft already ${session.hookDraft.status}` }, { status: 409 });
  }

  if (body.action === "dismiss") {
    session.hookDraft.status = "dismissed";
    await session.save();
    return NextResponse.json({ ok: true, hookDraft: session.hookDraft });
  }

  const email = session.pendingInquiry?.email || session.contactCaptured?.email;
  if (!email) return NextResponse.json({ error: "no recipient email on this session" }, { status: 400 });

  // Admin may have edited the AI draft before sending — use their version if given.
  const subject = (body.subject ?? session.hookDraft.subject).trim();
  const text = (body.body ?? session.hookDraft.body).trim();
  if (!subject || !text) return NextResponse.json({ error: "subject and body are required" }, { status: 400 });

  try {
    await sendEmail({
      to: email,
      subject,
      html: renderEmailLayout({
        preheader: text.slice(0, 120),
        heading: escapeHtml(subject),
        bodyHtml: text.split(/\n{2,}/).map((p: string) => `<p style="margin:0 0 12px;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`).join(""),
      }),
    });
  } catch (e) {
    return NextResponse.json({ error: `Failed to send email: ${(e as Error).message}` }, { status: 502 });
  }

  session.hookDraft.status = "sent";
  session.hookDraft.sentAt = new Date();
  session.hookDraft.subject = subject;
  session.hookDraft.body = text;
  await session.save();

  return NextResponse.json({ ok: true, hookDraft: session.hookDraft });
}
