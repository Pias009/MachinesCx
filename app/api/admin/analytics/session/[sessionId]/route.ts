import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession from "@/models/VisitorSession";
import ChatSession from "@/models/ChatSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth is enforced by middleware for all /api/admin/* routes.
export async function GET(_req: NextRequest, { params }: { params: { sessionId: string } }) {
  await connectDB();

  const [visitor, chat] = await Promise.all([
    VisitorSession.findOne({ sessionId: params.sessionId }).lean(),
    ChatSession.findOne({ sessionId: params.sessionId }).lean(),
  ]);

  if (!visitor) return NextResponse.json({ error: "not found" }, { status: 404 });

  // Ordered page-by-page journey ("roadmap"), earliest first, plus which
  // page the visitor actually stayed on longest.
  const journey = [...(visitor.pageViews || [])].sort(
    (a, b) => new Date(a.enteredAt).getTime() - new Date(b.enteredAt).getTime(),
  );
  const longestPage = journey.reduce<typeof journey[number] | null>(
    (max, pv) => (!max || pv.durationMs > max.durationMs ? pv : max),
    null,
  );

  return NextResponse.json({
    session: {
      sessionId: visitor.sessionId,
      ip: visitor.ip,
      countryCode: visitor.countryCode,
      region: visitor.region,
      city: visitor.city,
      latitude: visitor.latitude,
      longitude: visitor.longitude,
      timezone: visitor.timezone,
      browser: visitor.browser,
      os: visitor.os,
      device: visitor.device,
      userAgent: visitor.userAgent,
      screenWidth: visitor.screenWidth,
      screenHeight: visitor.screenHeight,
      viewportWidth: visitor.viewportWidth,
      viewportHeight: visitor.viewportHeight,
      language: visitor.language,
      clientTimezone: visitor.clientTimezone,
      connectionType: visitor.connectionType,
      referrer: visitor.referrer,
      source: visitor.source,
      landingPath: visitor.landingPath,
      locale: visitor.locale,
      totalDurationMs: visitor.totalDurationMs,
      chatOpened: visitor.chatOpened,
      firstSeen: visitor.firstSeen,
      lastSeen: visitor.lastSeen,
      aiInsight: visitor.aiInsight ?? null,
    },
    journey,
    longestPage,
    chat: chat ? { messages: chat.messages, contactCaptured: chat.contactCaptured ?? null, hookDraft: chat.hookDraft ?? null } : null,
  });
}
