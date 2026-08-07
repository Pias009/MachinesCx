import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import { notifyLeadCaptured } from "@/lib/leadNotify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Body {
  sessionId?: string;
  email?: string;
  machineName?: string;
}

// Public, unauthenticated — fed by components/ProductLeadCapture.tsx (the
// "want the full picture on this machine?" popup). Deliberately reuses the
// exact same lead pipeline as the chat-based flow (lib/leadNotify.ts for
// the instant admin alert, lib/leadDrafts.ts for the throttled AI-drafted
// follow-up) by writing into the same ChatSession fields — no parallel
// pipeline, one lead funnel regardless of entry point.
export async function POST(req: NextRequest) {
  let body: Body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "invalid JSON" }, { status: 400 }); }

  const sessionId = body.sessionId?.trim();
  const email = body.email?.trim();
  if (!sessionId || !email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "a valid sessionId and email are required" }, { status: 400 });
  }

  await connectDB();
  let session = await ChatSession.findOne({ sessionId });
  if (!session) session = new ChatSession({ sessionId, messages: [] });

  session.contactCaptured = { ...session.contactCaptured, email };

  if (!session.leadNotified) {
    session.leadNotified = true;
    session.leadCapturedAt = new Date();
    notifyLeadCaptured({
      sessionId,
      email,
      machineName: body.machineName,
    }).catch(e => console.error("lead-capture: notify failed:", e));
  }

  await session.save();
  return NextResponse.json({ ok: true });
}
