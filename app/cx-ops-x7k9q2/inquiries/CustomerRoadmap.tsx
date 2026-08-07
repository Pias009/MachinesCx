"use client";
import { useEffect, useMemo, useState } from "react";
import { Users, Compass, Sparkles, RefreshCw, MapPin } from "lucide-react";
import type { InquiryRoadmap } from "@/models/Inquiry";
import { formatDuration } from "@/lib/format";

export interface InquiryForRoadmap {
  _id: string;
  email: string;
  sessionId?: string;
  createdAt: string;
  roadmap?: InquiryRoadmap | null;
}

interface SessionSummary {
  countryCode?: string;
  device?: string;
  browser?: string;
  totalDurationMs?: number;
  pageCount: number;
  chatOpened?: boolean;
}

function flagEmoji(code?: string) {
  if (!code || code.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

/** Sits inside InquiryDetail. Shows real repeat-customer facts (computed
 *  client-side from the inquiries already loaded — instant, no fetch),
 *  condensed visitor-behavior data if this inquiry is linked to a tracked
 *  session, and an on-demand AI relationship roadmap. */
export default function CustomerRoadmap({
  inquiry,
  allInquiries,
}: {
  inquiry: InquiryForRoadmap;
  allInquiries: InquiryForRoadmap[];
}) {
  const [session, setSession] = useState<SessionSummary | null | undefined>(undefined);
  const [roadmap, setRoadmap] = useState<InquiryRoadmap | null>(inquiry.roadmap ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const priorInquiries = useMemo(
    () => allInquiries
      .filter(i => i._id !== inquiry._id && i.email.trim().toLowerCase() === inquiry.email.trim().toLowerCase())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [allInquiries, inquiry._id, inquiry.email],
  );
  const isRepeat = priorInquiries.length > 0;
  const firstContactAt = isRepeat ? priorInquiries[0].createdAt : inquiry.createdAt;
  const daysSinceFirstContact = Math.floor((Date.now() - new Date(firstContactAt).getTime()) / 86400000);

  useEffect(() => {
    setRoadmap(inquiry.roadmap ?? null);
    setError("");
    if (!inquiry.sessionId) { setSession(null); return; }
    setSession(undefined);
    let alive = true;
    fetch(`/api/admin/analytics/session/${encodeURIComponent(inquiry.sessionId)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (!alive) return;
        if (!j?.session) { setSession(null); return; }
        setSession({
          countryCode: j.session.countryCode,
          device: j.session.device,
          browser: j.session.browser,
          totalDurationMs: j.session.totalDurationMs,
          pageCount: j.journey?.length ?? 0,
          chatOpened: j.session.chatOpened,
        });
      })
      .catch(() => { if (alive) setSession(null); });
    return () => { alive = false; };
  }, [inquiry.sessionId, inquiry.roadmap]);

  async function generateRoadmap(force: boolean) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiry._id}/roadmap`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const j = await res.json();
      if (!res.ok) { setError(j.error || "Failed to generate roadmap"); return; }
      setRoadmap(j.roadmap);
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  const labelStyle: React.CSSProperties = { fontFamily: "var(--ff-body)", fontSize: "0.85rem", fontWeight: 700, color: "var(--brand-teal)", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" };

  return (
    <div style={{ borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", padding: "1.1rem 1.2rem" }}>
      <div style={labelStyle}><Users size={14} /> Customer relationship</div>

      {/* repeat-customer badge — computed instantly, no fetch */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        padding: "0.3rem 0.65rem", borderRadius: 999,
        background: isRepeat ? "rgba(245,196,81,0.15)" : "rgba(255,255,255,0.06)",
        color: isRepeat ? "#f5c451" : "rgba(255,255,255,0.5)",
        fontFamily: "var(--ff-body)", fontSize: "0.78rem", fontWeight: 700,
        marginBottom: "0.9rem",
      }}>
        {isRepeat
          ? `Returning customer — inquiry #${priorInquiries.length + 1}, first contacted ${daysSinceFirstContact === 0 ? "today" : `${daysSinceFirstContact}d ago`}`
          : "New customer — first inquiry"}
      </div>

      {/* linked visitor behavior */}
      <div style={{ marginBottom: "1.1rem" }}>
        <div style={{ ...labelStyle, fontSize: "0.78rem", marginBottom: "0.5rem" }}><MapPin size={12} /> Browsing activity</div>
        {session === undefined ? (
          <div className="adm-skel" style={{ height: 32, borderRadius: 8 }} />
        ) : session === null ? (
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)", margin: 0 }}>
            No browsing activity linked to this inquiry.
          </p>
        ) : (
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.82rem", color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.6 }}>
            {flagEmoji(session.countryCode)} {session.countryCode || "Unknown"} · {session.device || "?"} / {session.browser || "?"} ·{" "}
            {session.pageCount} page{session.pageCount === 1 ? "" : "s"} viewed
            {typeof session.totalDurationMs === "number" ? ` · ${formatDuration(session.totalDurationMs)} on site` : ""}
            {session.chatOpened ? " · opened ASHA chat" : ""}
          </p>
        )}
      </div>

      {/* AI roadmap */}
      <div>
        <div style={{ ...labelStyle, fontSize: "0.78rem" }}><Compass size={12} /> Relationship roadmap</div>
        {roadmap ? (
          <div>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: "0 0 0.6rem" }}>{roadmap.text}</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.7rem", flexWrap: "wrap" }}>
              <span style={{
                fontFamily: "var(--ff-body)", fontSize: "0.72rem", fontWeight: 700,
                color: "var(--brand-teal)", background: "rgba(43,191,179,0.14)",
                padding: "0.2rem 0.55rem", borderRadius: 5,
              }}>
                Next touchpoint: {roadmap.nextTouchpointDays === 0 ? "today" : `in ${roadmap.nextTouchpointDays}d`}
              </span>
              <button onClick={() => generateRoadmap(true)} disabled={loading} style={{
                display: "flex", alignItems: "center", gap: "0.3rem",
                background: "none", border: "none", cursor: loading ? "default" : "pointer",
                color: "rgba(255,255,255,0.4)", fontFamily: "var(--ff-body)", fontSize: "0.72rem", fontWeight: 600,
              }}>
                <RefreshCw size={11} className={loading ? "adm-spin-icon" : ""} /> {loading ? "regenerating…" : "regenerate"}
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => generateRoadmap(false)} disabled={loading} className="adm-btn" style={{ fontSize: "0.8rem", padding: "0.55rem 0.9rem" }}>
            {loading ? <span className="adm-spinner" style={{ width: 12, height: 12 }} /> : <Sparkles size={13} />}
            {loading ? "Analyzing…" : "Generate roadmap"}
          </button>
        )}
        {error && <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.78rem", color: "#ff8a97", margin: "0.6rem 0 0" }}>{error}</p>}
      </div>
    </div>
  );
}
