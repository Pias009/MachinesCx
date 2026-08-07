import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry, { type InquiryMachine, type InquiryPart } from "@/models/Inquiry";
import VisitorSession from "@/models/VisitorSession";
import { groqJsonCompletion } from "@/lib/groq";
import { formatDuration } from "@/lib/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function daysAgo(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// Auth is enforced by middleware for all /api/admin/* routes.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();

  const inquiry = await Inquiry.findById(params.id);
  if (!inquiry) return NextResponse.json({ error: "not found" }, { status: 404 });

  const force = (await req.json().catch(() => ({})))?.force === true;

  // Repeat-customer facts — cheap, computed fresh every call (not cached,
  // since a new inquiry could arrive between requests). Case-insensitive —
  // see the matching comment in api/account/login/route.ts.
  const priorInquiries = await Inquiry.find({ email: inquiry.email, _id: { $ne: inquiry._id } })
    .collation({ locale: "en", strength: 2 })
    .sort({ createdAt: 1 })
    .lean();
  const allForEmail = [...priorInquiries, { createdAt: inquiry.createdAt }].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const firstContactAt = allForEmail[0].createdAt;
  const repeatCount = priorInquiries.length;
  const repeatInfo = {
    isRepeat: repeatCount > 0,
    totalInquiries: repeatCount + 1,
    firstContactAt,
    daysSinceFirstContact: daysAgo(new Date(firstContactAt)),
  };

  const replyCount = inquiry.replies?.length ?? 0;
  const cached = inquiry.roadmap;
  if (!force && cached && cached.basedOnReplyCount >= replyCount) {
    return NextResponse.json({ roadmap: cached, repeatInfo, cached: true });
  }

  // Optional visitor-behavior grounding, only if this inquiry is linked to
  // a tracked session (see models/Inquiry.ts's sessionId field).
  let visitorLine = "";
  if (inquiry.sessionId) {
    const visitor = await VisitorSession.findOne({ sessionId: inquiry.sessionId }).lean();
    if (visitor) {
      visitorLine = [
        visitor.countryCode ? `Country: ${visitor.countryCode}` : null,
        visitor.device ? `Device: ${visitor.device}` : null,
        visitor.totalDurationMs ? `Time on site: ${formatDuration(visitor.totalDurationMs)}` : null,
        visitor.pageViews?.length ? `Pages viewed: ${visitor.pageViews.length}` : null,
      ].filter(Boolean).join(" · ");
    }
  }

  const machinesLine = inquiry.machines?.length
    ? inquiry.machines.map((m: InquiryMachine) => `${m.name} (qty ${m.qty})`).join(", ")
    : "";
  const partsLine = inquiry.parts?.length
    ? inquiry.parts.map((p: InquiryPart) => `${p.name} (qty ${p.quantity})`).join(", ")
    : "";
  const repliesLine = replyCount > 0 ? `${replyCount} repl${replyCount > 1 ? "ies" : "y"} sent so far.` : "No reply sent yet.";
  const priorLine = repeatInfo.isRepeat
    ? `This customer has ${repeatInfo.totalInquiries} total inquiries, first contacted ${repeatInfo.daysSinceFirstContact} days ago. Prior requests: ${priorInquiries.map(p => (p.machines?.length ? p.machines.map((m: InquiryMachine) => m.name).join("/") : p.parts?.length ? p.parts.map((pt: InquiryPart) => pt.name).join("/") : p.inquiryType)).join("; ")}.`
    : "This is their first inquiry — no prior contact on file.";

  const prompt = `You are a CRM analyst writing a short customer-relationship plan for a sales team at a plastics processing machinery manufacturer (film blowing, bag making, recycling, printing lines).

Customer: ${inquiry.name}${inquiry.company ? ` (${inquiry.company})` : ""}, status: ${inquiry.status}.
Inquiry type: ${inquiry.inquiryType}. ${machinesLine ? `Machines: ${machinesLine}.` : ""} ${partsLine ? `Parts: ${partsLine}.` : ""}
${inquiry.message ? `Their message: "${inquiry.message}"` : ""}
${repliesLine}
${priorLine}
${visitorLine ? `Browsing behavior: ${visitorLine}` : "No linked browsing data for this inquiry."}

Write a short, concrete plan (3-5 sentences, or short "- " bullets) for how to maintain this customer relationship: what to do next, and roughly when. Be specific to what's actually known above — a first-time inquiry needs a different plan than a 3rd-time repeat customer. Do not invent facts not given above.

Reply ONLY with this JSON: {"text":"the plan","nextTouchpointDays":3} — nextTouchpointDays is a whole number of days until the next recommended touchpoint.`;

  let text: string;
  let nextTouchpointDays: number;
  try {
    const raw = await groqJsonCompletion([{ role: "user", content: prompt }], { maxTokens: 400, temperature: 0.4 });
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "");
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("no JSON in Groq response");
    const parsed = JSON.parse(jsonMatch[0]);
    text = typeof parsed.text === "string" ? parsed.text : "";
    nextTouchpointDays = Number.isFinite(parsed.nextTouchpointDays) ? Math.max(0, Math.round(parsed.nextTouchpointDays)) : 7;
    if (!text) throw new Error("empty roadmap text");
  } catch (e) {
    console.error("Inquiry roadmap: Groq failed:", e);
    return NextResponse.json({ error: "Couldn't generate a roadmap right now — try again shortly" }, { status: 502 });
  }

  const roadmap = {
    text,
    nextTouchpointDays,
    generatedAt: new Date(),
    basedOnReplyCount: replyCount,
  };
  inquiry.roadmap = roadmap;
  await inquiry.save();

  return NextResponse.json({ roadmap, repeatInfo, cached: false });
}
