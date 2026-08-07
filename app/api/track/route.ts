import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession from "@/models/VisitorSession";
import { parseUserAgent } from "@/lib/uaParse";
import { maybeProcessLeadDrafts } from "@/lib/leadDrafts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TrackBody {
  sessionId: string;
  type: "pageview" | "chat_open";
  path?: string;
  durationMs?: number;
  referrer?: string;
  locale?: string;
  source?: string;
  screenWidth?: number;
  screenHeight?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  language?: string;
  clientTimezone?: string;
  connectionType?: string;
}

// Public, unauthenticated ingest endpoint — fed by components/VisitorTracker.tsx
// and the ASHA chat widget's open handler. Runs outside the admin auth gate
// (see middleware.ts matcher) since visitors are never logged in.
export async function POST(req: NextRequest) {
  let body: TrackBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body.sessionId || !body.type) {
    return NextResponse.json({ error: "sessionId and type required" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const countryCode = req.headers.get("x-vercel-ip-country") || "";
  const region = req.headers.get("x-vercel-ip-country-region") || "";
  const cityHeader = req.headers.get("x-vercel-ip-city") || "";
  const city = cityHeader ? decodeURIComponent(cityHeader) : "";
  const latitude = req.headers.get("x-vercel-ip-latitude") || "";
  const longitude = req.headers.get("x-vercel-ip-longitude") || "";
  const timezone = req.headers.get("x-vercel-ip-timezone") || "";
  const ua = req.headers.get("user-agent") || "";
  const { browser, os, device } = parseUserAgent(ua);

  await connectDB();

  // First-touch fields only: what session this visitor first landed under.
  // Never overwritten on later pings, so it keeps meaning "the page/referrer
  // that started this session" even as the visitor moves around the site.
  const setOnInsert: Record<string, unknown> = {
    sessionId: body.sessionId,
    referrer: body.referrer || "",
    source: body.source || "",
    landingPath: body.path || "/",
    firstSeen: new Date(),
  };

  // Environmental snapshot fields: refreshed on every ping, not just the
  // first. A sessionId lives in localStorage indefinitely, so a visitor
  // returning weeks later on a different network/device would otherwise be
  // stuck showing their very first visit's stale IP/geo/device forever —
  // this keeps the profile reflecting their current visit.
  const set: Record<string, unknown> = {
    lastSeen: new Date(),
    ip, countryCode, region, city, latitude, longitude, timezone,
    userAgent: ua, browser, os, device,
    locale: body.locale || "",
  };
  if (typeof body.screenWidth === "number") set.screenWidth = body.screenWidth;
  if (typeof body.screenHeight === "number") set.screenHeight = body.screenHeight;
  if (typeof body.viewportWidth === "number") set.viewportWidth = body.viewportWidth;
  if (typeof body.viewportHeight === "number") set.viewportHeight = body.viewportHeight;
  if (body.language) set.language = body.language;
  if (body.clientTimezone) set.clientTimezone = body.clientTimezone;
  if (body.connectionType) set.connectionType = body.connectionType;
  if (body.type === "chat_open") set.chatOpened = true;

  const update: Record<string, unknown> = { $setOnInsert: setOnInsert, $set: set };

  // Only a completed dwell (a real durationMs, sent when the visitor leaves
  // the page) becomes a pageViews entry — the fire-and-forget "I just
  // landed" ping on mount carries no durationMs and only touches
  // landingPath/lastSeen, so a page never gets double-counted.
  if (body.type === "pageview" && body.path && typeof body.durationMs === "number" && body.durationMs >= 0) {
    update.$push = {
      pageViews: {
        $each: [{ path: body.path, enteredAt: new Date(Date.now() - body.durationMs), durationMs: body.durationMs }],
        $slice: -200,
      },
    };
    update.$inc = { totalDurationMs: body.durationMs };
  }

  try {
    await VisitorSession.findOneAndUpdate({ sessionId: body.sessionId }, update, { upsert: true });
  } catch (e) {
    // Two pings for a brand-new sessionId can race (e.g. the mount ping and
    // an almost-immediate route change both firing before the doc exists) —
    // upsert isn't atomic across the read+insert on a duplicate key, so the
    // loser gets E11000. Retry once as a plain update now that the doc
    // exists instead of dropping the event.
    const isDupKey = e instanceof Error && "code" in e && (e as unknown as { code?: number }).code === 11000;
    if (!isDupKey) throw e;
    await VisitorSession.findOneAndUpdate({ sessionId: body.sessionId }, update);
  }

  // Awaited, not fire-and-forget: on a serverless function, execution can be
  // frozen/torn down the moment the response is sent, which would silently
  // cut off the Groq call or final session.save() this sometimes does.
  // Internally throttled (see lib/leadDrafts.ts) so this is a cheap no-op —
  // a plain SystemState read/write — on nearly every call; the occasional
  // multi-second Groq round-trip only happens on the one call that crosses
  // the 5-minute throttle window, which the visitor never perceives since
  // this endpoint is hit via sendBeacon / a background fetch, not something
  // blocking their page.
  try {
    await maybeProcessLeadDrafts();
  } catch (e) {
    console.error("track: lead draft processing failed:", e);
  }

  return NextResponse.json({ ok: true });
}
