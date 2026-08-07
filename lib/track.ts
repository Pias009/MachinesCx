"use client";

import { getVisitorSessionId } from "./clientSession";

const TRACK_URL = "/api/track";

interface NetworkInformation { effectiveType?: string; }

function post(payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const sessionId = getVisitorSessionId();
  if (!sessionId) return;
  const body = JSON.stringify({ ...payload, sessionId });
  if (navigator.sendBeacon) {
    navigator.sendBeacon(TRACK_URL, new Blob([body], { type: "application/json" }));
  } else {
    fetch(TRACK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
  }
}

/** Client-side device signals the server can't see from headers alone —
 *  screen/viewport size, language, timezone, connection type. Collected
 *  fresh on every ping (see api/track/route.ts) so a returning visitor's
 *  profile never goes stale. */
function deviceSignals() {
  const nav = navigator as Navigator & { connection?: NetworkInformation };
  return {
    screenWidth: window.screen?.width,
    screenHeight: window.screen?.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    language: navigator.language || "",
    clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    connectionType: nav.connection?.effectiveType || "",
  };
}

export function trackPageview(path: string, durationMs?: number, extra?: { referrer?: string; locale?: string; source?: string }) {
  post({ type: "pageview", path, durationMs, ...deviceSignals(), ...extra });
}

export function trackChatOpen() {
  post({ type: "chat_open", ...deviceSignals() });
}
