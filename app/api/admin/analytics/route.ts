import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession from "@/models/VisitorSession";
import ChatSession from "@/models/ChatSession";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth is enforced by middleware for all /api/admin/* routes.
export async function GET(_req: NextRequest) {
  await connectDB();

  const [sessions, chatSessions] = await Promise.all([
    VisitorSession.find().sort({ lastSeen: -1 }).limit(500).lean(),
    ChatSession.find().sort({ createdAt: -1 }).limit(50).lean(),
  ]);

  const now = Date.now();
  const todayCutoff = now - 24 * 60 * 60 * 1000;

  const totalSessions = sessions.length;
  const sessionsToday = sessions.filter(s => new Date(s.lastSeen).getTime() >= todayCutoff).length;
  const avgDurationMs = totalSessions
    ? Math.round(sessions.reduce((sum, s) => sum + (s.totalDurationMs || 0), 0) / totalSessions)
    : 0;
  const chatOpenRate = totalSessions
    ? Math.round((sessions.filter(s => s.chatOpened).length / totalSessions) * 100)
    : 0;

  const countryCounts = new Map<string, number>();
  for (const s of sessions) {
    const key = s.countryCode || "??";
    countryCounts.set(key, (countryCounts.get(key) || 0) + 1);
  }
  const byCountry = [...countryCounts.entries()]
    .map(([countryCode, count]) => ({ countryCode, count }))
    .sort((a, b) => b.count - a.count);

  const pageStats = new Map<string, { views: number; totalDurationMs: number }>();
  for (const s of sessions) {
    for (const pv of s.pageViews || []) {
      const cur = pageStats.get(pv.path) || { views: 0, totalDurationMs: 0 };
      cur.views += 1;
      cur.totalDurationMs += pv.durationMs || 0;
      pageStats.set(pv.path, cur);
    }
  }
  const topPages = [...pageStats.entries()]
    .map(([path, v]) => ({ path, views: v.views, avgDurationMs: v.views ? Math.round(v.totalDurationMs / v.views) : 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 15);

  const sessionsById = new Map(sessions.map(s => [s.sessionId, s]));
  const chatActivity = chatSessions.map(cs => {
    const visitor = sessionsById.get(cs.sessionId);
    const lastUserMsg = [...(cs.messages || [])].reverse().find(m => m.role === "user");
    return {
      sessionId: cs.sessionId,
      countryCode: visitor?.countryCode || "??",
      lastQuestion: lastUserMsg?.content || "",
      messageCount: cs.messages?.length || 0,
      at: lastUserMsg?.at || cs.createdAt,
    };
  });

  const recentSessions = sessions.slice(0, 40).map(s => ({
    sessionId: s.sessionId,
    countryCode: s.countryCode,
    region: s.region,
    city: s.city,
    device: s.device,
    browser: s.browser,
    os: s.os,
    landingPath: s.landingPath,
    referrer: s.referrer,
    source: s.source,
    pageCount: s.pageViews?.length || 0,
    totalDurationMs: s.totalDurationMs,
    chatOpened: s.chatOpened,
    firstSeen: s.firstSeen,
    lastSeen: s.lastSeen,
  }));

  return NextResponse.json({
    totals: { totalSessions, sessionsToday, avgDurationMs, chatOpenRate },
    byCountry,
    topPages,
    recentSessions,
    chatActivity,
  });
}
