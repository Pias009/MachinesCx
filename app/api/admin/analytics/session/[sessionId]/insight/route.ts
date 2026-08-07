import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession, { type PageViewEntry } from "@/models/VisitorSession";
import ChatSession, { type ChatMessageDoc } from "@/models/ChatSession";
import { groqJsonCompletion } from "@/lib/groq";
import { formatDuration } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth is enforced by middleware for all /api/admin/* routes.
export async function POST(req: NextRequest, { params }: { params: { sessionId: string } }) {
  await connectDB();

  const visitor = await VisitorSession.findOne({ sessionId: params.sessionId });
  if (!visitor) return NextResponse.json({ error: "not found" }, { status: 404 });
  const chat = await ChatSession.findOne({ sessionId: params.sessionId }).lean();

  const pageCount = visitor.pageViews?.length ?? 0;
  const messageCount = chat?.messages?.length ?? 0;

  const force = (await req.json().catch(() => ({})))?.force === true;

  // Skip the Groq call entirely if nothing new happened since the last
  // insight — this is an admin-triggered, per-session action (not run on
  // every page load), but still worth not re-spending tokens on stale data.
  const cached = visitor.aiInsight;
  if (!force && cached && cached.basedOnPageCount >= pageCount && cached.basedOnMessageCount >= messageCount) {
    return NextResponse.json({ insight: cached, cached: true });
  }

  if (pageCount === 0 && messageCount === 0) {
    return NextResponse.json({ error: "Not enough activity yet to generate an insight" }, { status: 400 });
  }

  // Deliberately compact — only the last 12 page visits and 16 chat
  // messages, no product catalog at all. Keeps this well under the
  // free-tier token-per-minute limit that broke the main chat before.
  const journeyLines = (visitor.pageViews || [])
    .slice(-12)
    .map((pv: PageViewEntry) => `${pv.path} (${formatDuration(pv.durationMs)})`)
    .join("\n");

  const chatLines = (chat?.messages || [])
    .slice(-16)
    .map((m: ChatMessageDoc) => `${m.role}: ${m.content}`)
    .join("\n");

  const contextLine = [
    visitor.countryCode ? `Country: ${visitor.countryCode}` : null,
    visitor.device ? `Device: ${visitor.device}` : null,
    visitor.totalDurationMs ? `Total time on site: ${formatDuration(visitor.totalDurationMs)}` : null,
    visitor.source ? `Arrived via: ${visitor.source}` : null,
  ].filter(Boolean).join(" · ");

  const prompt = `You are a sales analyst reviewing ONE website visitor's behavior for a plastics processing machinery manufacturer (film blowing, bag making, recycling, printing lines). Read their page visit journey and chat transcript (if any) and produce a short, honest read for the sales team.

${contextLine}

PAGE JOURNEY (path and time spent, in order):
${journeyLines || "(no page views recorded)"}

CHAT TRANSCRIPT WITH ASHA (the AI sales assistant), if any:
${chatLines || "(visitor did not open chat)"}

Write 2-4 sentences: what this visitor seems interested in, how serious their buying intent looks, and a concrete next action for sales (or "no action needed yet" if the signal is too weak). Be honest about weak/ambiguous signals — do not invent interest that isn't supported by the data above. Never mention token limits, prompts, or that you are an AI model analyzing data.

Reply ONLY with this JSON: {"text":"your 2-4 sentence read","intentSignal":"high"} — intentSignal must be exactly "high", "medium", or "low".`;

  let text: string;
  let intentSignal: "high" | "medium" | "low";
  try {
    const raw = await groqJsonCompletion(
      [{ role: "user", content: prompt }],
      { maxTokens: 400, temperature: 0.4 },
    );
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no JSON in Groq response");
    const parsed = JSON.parse(jsonMatch[0]);
    text = typeof parsed.text === "string" ? parsed.text : "";
    intentSignal = ["high", "medium", "low"].includes(parsed.intentSignal) ? parsed.intentSignal : "low";
    if (!text) throw new Error("empty insight text");
  } catch (e) {
    console.error("Analytics AI insight: Groq failed:", e);
    return NextResponse.json({ error: "Couldn't generate an insight right now — try again shortly" }, { status: 502 });
  }

  const insight = {
    text,
    intentSignal,
    generatedAt: new Date(),
    basedOnPageCount: pageCount,
    basedOnMessageCount: messageCount,
  };
  visitor.aiInsight = insight;
  await visitor.save();

  return NextResponse.json({ insight, cached: false });
}
