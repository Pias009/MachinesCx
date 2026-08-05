import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ChatSession from "@/models/ChatSession";
import { answerWithGroq } from "@/lib/groq";
import { answerWithOpenRouter } from "@/lib/openrouter";
import { answerLocally, isBasicQuery } from "@/lib/localAgent";
import { createInquiry } from "@/lib/inquiries";
import { notifyLeadCaptured } from "@/lib/leadNotify";

export const runtime = "nodejs";

const AGENT_NAME = "ASHA";

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return Response.json({ messages: [] });

  await connectDB();
  const session = await ChatSession.findOne({ sessionId }).lean();
  return Response.json({ messages: session?.messages ?? [] });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const sessionId = body?.sessionId as string | undefined;
  const message = body?.message as string | undefined;

  if (!sessionId || !message?.trim()) {
    return Response.json({ error: "sessionId and message are required" }, { status: 400 });
  }

  await connectDB();
  let session = await ChatSession.findOne({ sessionId });
  if (!session) session = new ChatSession({ sessionId, messages: [] });

  session.messages.push({ role: "user", content: message.trim(), at: new Date() });

  let answer: Awaited<ReturnType<typeof answerWithOpenRouter>>;

  function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    return Promise.race([
      p,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timeout`)), ms)),
    ]);
  }

  // For basic queries (greetings, simple asks), skip the general-chat LLM
  // round-trip — the guided inquiry flow inside answerLocally may still make
  // its own short Groq classification call for an ambiguous reply, but never
  // the full chat completion.
  if (isBasicQuery(message.trim(), session.pendingInquiry ?? null)) {
    answer = await answerLocally(message.trim(), session.pendingInquiry ?? null);
  } else {
    try {
      // Groq is the primary backend — fast inference, more capable model,
      // handles general questions in addition to catalog lookups.
      answer = await withTimeout(
        answerWithGroq(session.messages, session.pendingInquiry ?? null),
        10_000,
        "Groq overall",
      );
    } catch (groqErr) {
      console.error("ASHA chat: Groq unavailable, falling back to OpenRouter:", groqErr);
      try {
        answer = await withTimeout(
          answerWithOpenRouter(session.messages, session.pendingInquiry ?? null),
          10_000,
          "OpenRouter overall",
        );
      } catch (e) {
        console.error("ASHA chat: OpenRouter unavailable, falling back to local engine:", e);
        answer = await answerLocally(message.trim(), session.pendingInquiry ?? null);
      }
    }
  }

  session.messages.push({ role: "assistant", content: answer.text, at: new Date() });
  session.pendingInquiry = answer.pendingInquiry ?? null;

  const capturedEmail = session.pendingInquiry?.email;
  if (capturedEmail && !session.leadNotified) {
    session.leadNotified = true;
    notifyLeadCaptured({
      sessionId,
      name: session.pendingInquiry?.name,
      email: capturedEmail,
      machineName: session.pendingInquiry?.machineName,
    }).catch(e => console.error("ASHA chat: lead notification failed:", e));
  }

  await session.save();

  if (answer.completedInquiry) {
    const { name, email, qty, slug, machineName } = answer.completedInquiry;
    try {
      await createInquiry({
        name,
        email,
        message: `Submitted by ${AGENT_NAME} (AI chat assistant) via the guided in-chat inquiry flow.`,
        machines: [{ slug, name: machineName, series: "", model: "", qty, notes: "" }],
      });
    } catch (e) {
      console.error("ASHA chat: failed to create inquiry from guided flow:", e);
    }
  }

  // Same NDJSON framing the Grok-backed route used, so the widget's parser
  // (ChatWidget.tsx) needs no changes: one delta frame with the full text
  // (no real streaming needed — the engine answers synchronously), then the
  // final frame carrying the structured actions.
  const encoder = new TextEncoder();
  const lines = [
    JSON.stringify({ type: "delta", text: answer.text }),
    JSON.stringify({ type: "final", text: answer.text, actions: answer.actions }),
  ];
  const body_ = encoder.encode(lines.join("\n") + "\n");

  return new Response(body_, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8" } });
}
