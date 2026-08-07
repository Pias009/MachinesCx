// Opportunistically drafts outreach emails for leads whose ~7-minute window
// has passed (see models/ChatSession.ts's leadCapturedAt). Called from
// app/api/track/route.ts — fire-and-forget, on every real page-view ping —
// instead of a fixed-schedule cron. That means this (and its Groq calls)
// only ever runs as a side effect of actual visitor traffic: zero Vercel
// invocations and zero Groq spend while nobody is on the site. Throttled to
// at most once every 5 minutes via SystemState so a burst of page views
// from one visitor doesn't trigger repeat runs.
import { connectDB } from "@/lib/mongodb";
import ChatSession, { type ChatMessageDoc } from "@/models/ChatSession";
import VisitorSession, { type PageViewEntry } from "@/models/VisitorSession";
import SystemState from "@/models/SystemState";
import { groqJsonCompletion } from "@/lib/groq";
import { formatDuration } from "@/lib/format";

const DELAY_MS = 7 * 60 * 1000; // ~5-10 min past email capture
const THROTTLE_MS = 5 * 60 * 1000; // don't re-check more than once per 5 min
const MAX_PER_RUN = 5; // small — this can fire on any real pageview, keep each trigger cheap
const THROTTLE_KEY = "leadDraftsLastRun";

export async function maybeProcessLeadDrafts(): Promise<void> {
  await connectDB();

  const now = new Date();
  // Atomic "read previous value, then stamp now" — findOneAndUpdate with
  // new:false returns the doc as it was BEFORE this update (null the very
  // first time). Safe under concurrent calls: each request just sees
  // whatever the previous winner left behind.
  const prev = await SystemState.findOneAndUpdate(
    { key: THROTTLE_KEY },
    { $set: { value: now } },
    { upsert: true, new: false },
  );
  const prevValue = prev?.value ?? new Date(0);
  if (now.getTime() - prevValue.getTime() < THROTTLE_MS) return;

  const cutoff = new Date(now.getTime() - DELAY_MS);
  const candidates = await ChatSession.find({
    leadNotified: true,
    hookDraft: null,
    leadCapturedAt: { $lte: cutoff, $ne: null },
  }).limit(MAX_PER_RUN);

  for (const session of candidates) {
    const email = session.pendingInquiry?.email || session.contactCaptured?.email;
    const name = session.pendingInquiry?.name || session.contactCaptured?.name;
    if (!email) continue;

    try {
      const visitor = await VisitorSession.findOne({ sessionId: session.sessionId }).lean();

      const chatLines = (session.messages || [])
        .slice(-20)
        .map((m: ChatMessageDoc) => `${m.role}: ${m.content}`)
        .join("\n");
      const pagesLines = (visitor?.pageViews || [])
        .slice(-10)
        .map((pv: PageViewEntry) => `${pv.path} (${formatDuration(pv.durationMs)})`)
        .join("\n");

      const prompt = `You are writing a short, warm follow-up email FROM the ASHAL INNOMACH sales team TO a website visitor who gave their email during a chat with ASHA (the AI sales assistant). This is a real outreach email a human will review before sending — write it like a person, not a bot. No corporate filler, no "I hope this email finds you well."

Visitor name: ${name || "unknown — use a generic friendly greeting, don't invent a name"}

Pages they visited:
${pagesLines || "(none recorded)"}

Their chat with ASHA:
${chatLines || "(no chat transcript)"}

Write a short email (3-5 sentences body) that references something SPECIFIC from what they looked at or asked — not generic. Invite them to reply with questions or to schedule a quick call. Sign off as "The ASHAL INNOMACH Team". Do not invent specs, prices, or claims not supported by the context above.

Reply ONLY with this JSON: {"subject":"short subject line","body":"the email body, plain text with \\n for paragraph breaks"}`;

      const raw = await groqJsonCompletion([{ role: "user", content: prompt }], { maxTokens: 500, temperature: 0.6 });
      const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("no JSON in Groq response");
      const parsed = JSON.parse(jsonMatch[0]);
      if (!parsed.subject || !parsed.body) throw new Error("missing subject/body");

      session.hookDraft = {
        subject: String(parsed.subject),
        body: String(parsed.body),
        generatedAt: new Date(),
        status: "pending",
      };
      await session.save();
    } catch (e) {
      console.error(`maybeProcessLeadDrafts: failed for session ${session.sessionId}:`, e);
      // Without this, the session keeps matching `hookDraft: null` and gets
      // re-selected (and re-failed) every throttle window forever, eating
      // one of this run's limited slots each time instead of ever reaching
      // a genuinely new lead. The admin already got the instant lead alert
      // from lib/leadNotify.ts regardless, so this is a lost nice-to-have,
      // not a lost lead.
      try {
        session.hookDraft = { subject: "", body: "", generatedAt: new Date(), status: "failed" };
        await session.save();
      } catch (saveErr) {
        console.error(`maybeProcessLeadDrafts: failed to mark session ${session.sessionId} as failed:`, saveErr);
      }
    }
  }
}
