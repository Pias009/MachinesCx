import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VisitorSession from "@/models/VisitorSession";
import { parseUserAgent } from "@/lib/uaParse";

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
  const ua = req.headers.get("user-agent") || "";
  const { browser, os, device } = parseUserAgent(ua);

  await connectDB();

  const update: Record<string, unknown> = {
    $setOnInsert: {
      sessionId: body.sessionId,
      ip, countryCode, region, city,
      userAgent: ua, browser, os, device,
      referrer: body.referrer || "",
      source: body.source || "",
      locale: body.locale || "",
      landingPath: body.path || "/",
      firstSeen: new Date(),
    },
    $set: { lastSeen: new Date() },
  };

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

  if (body.type === "chat_open") {
    (update.$set as Record<string, unknown>).chatOpened = true;
  }

  await VisitorSession.findOneAndUpdate({ sessionId: body.sessionId }, update, { upsert: true });

  return NextResponse.json({ ok: true });
}
