"use client";
import { useEffect, useState, useCallback } from "react";
import { X, Sparkles, MapPin, Monitor, Clock, RefreshCw, Mail, Send, Trash2 } from "lucide-react";
import { formatDuration } from "@/lib/format";

interface PageViewEntry { path: string; enteredAt: string; durationMs: number; }
interface AiInsight { text: string; intentSignal: "high" | "medium" | "low"; generatedAt: string; basedOnPageCount: number; basedOnMessageCount: number; }
interface HookDraft { subject: string; body: string; generatedAt: string; status: "pending" | "sent" | "dismissed" | "failed"; sentAt?: string; }
interface SessionDetail {
  sessionId: string; ip: string; countryCode: string; region: string; city: string;
  latitude: string; longitude: string; timezone: string;
  browser: string; os: string; device: string; userAgent: string;
  screenWidth?: number; screenHeight?: number; viewportWidth?: number; viewportHeight?: number;
  language: string; clientTimezone: string; connectionType: string;
  referrer: string; source: string; landingPath: string; locale: string;
  totalDurationMs: number; chatOpened: boolean;
  firstSeen: string; lastSeen: string;
  aiInsight: AiInsight | null;
}
interface ChatMsg { role: "user" | "assistant"; content: string; at: string; }
interface DetailResponse {
  session: SessionDetail;
  journey: PageViewEntry[];
  longestPage: PageViewEntry | null;
  chat: { messages: ChatMsg[]; contactCaptured: { name?: string; email?: string; phone?: string } | null; hookDraft: HookDraft | null } | null;
}

function flagEmoji(code: string) {
  if (!code || code.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

const INTENT_META = {
  high: { label: "high intent", color: "#ff6b7d" },
  medium: { label: "medium intent", color: "var(--brand-teal)" },
  low: { label: "low intent", color: "var(--adm-text-faint)" },
} as const;

export default function SessionDetailPanel({ sessionId, onClose }: { sessionId: string; onClose: () => void }) {
  const [data, setData] = useState<DetailResponse | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightError, setInsightError] = useState("");
  const [draftSubject, setDraftSubject] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const [draftBusy, setDraftBusy] = useState<"send" | "dismiss" | null>(null);
  const [draftError, setDraftError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/analytics/session/${encodeURIComponent(sessionId)}`);
    const j = await res.json();
    if (!res.ok) return;
    setData(j);
    if (j.chat?.hookDraft) {
      setDraftSubject(j.chat.hookDraft.subject);
      setDraftBody(j.chat.hookDraft.body);
    }
  }, [sessionId]);

  useEffect(() => {
    setData(null);
    setInsightError("");
    setDraftError("");
    load();
  }, [load]);

  async function actOnDraft(action: "send" | "dismiss") {
    setDraftBusy(action);
    setDraftError("");
    try {
      const res = await fetch(`/api/admin/analytics/session/${encodeURIComponent(sessionId)}/hook-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "send" ? { action, subject: draftSubject, body: draftBody } : { action }),
      });
      const j = await res.json();
      if (!res.ok) { setDraftError(j.error || `Failed to ${action}`); return; }
      setData(prev => prev && prev.chat ? { ...prev, chat: { ...prev.chat, hookDraft: j.hookDraft } } : prev);
    } catch {
      setDraftError("Network error — try again");
    } finally {
      setDraftBusy(null);
    }
  }

  async function generateInsight(force: boolean) {
    setInsightLoading(true);
    setInsightError("");
    try {
      const res = await fetch(`/api/admin/analytics/session/${encodeURIComponent(sessionId)}/insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const j = await res.json();
      if (!res.ok) { setInsightError(j.error || "Failed to generate insight"); return; }
      setData(prev => prev ? { ...prev, session: { ...prev.session, aiInsight: j.insight } } : prev);
    } catch {
      setInsightError("Network error — try again");
    } finally {
      setInsightLoading(false);
    }
  }

  const s = data?.session;
  const insight = s?.aiInsight;
  const hookDraft = data?.chat?.hookDraft;

  return (
    <div className="sdp-overlay" onClick={onClose}>
      <div className="sdp-panel" onClick={e => e.stopPropagation()}>
        <div className="sdp-head">
          <div className="sdp-head__title">
            {s ? <>{flagEmoji(s.countryCode)} {s.city || s.countryCode || "Unknown"}</> : "Loading…"}
          </div>
          <button className="sdp-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {!data ? (
          <div className="sdp-loading">loading session…</div>
        ) : (
          <div className="sdp-body">
            {/* ── AI insight ── */}
            <div className="sdp-section">
              <div className="sdp-section__head"><Sparkles size={13} /> ai_insight</div>
              {insight ? (
                <div className="sdp-insight">
                  <div className="sdp-insight__badge" style={{ color: INTENT_META[insight.intentSignal].color, borderColor: INTENT_META[insight.intentSignal].color }}>
                    {INTENT_META[insight.intentSignal].label}
                  </div>
                  <p className="sdp-insight__text">{insight.text}</p>
                  <button className="sdp-btn sdp-btn--ghost" onClick={() => generateInsight(true)} disabled={insightLoading}>
                    <RefreshCw size={12} className={insightLoading ? "sdp-spin" : ""} /> {insightLoading ? "regenerating…" : "regenerate"}
                  </button>
                </div>
              ) : (
                <div className="sdp-insight">
                  <p className="sdp-insight__empty">No insight generated yet.</p>
                  <button className="sdp-btn" onClick={() => generateInsight(false)} disabled={insightLoading}>
                    <Sparkles size={12} /> {insightLoading ? "analyzing…" : "generate insight"}
                  </button>
                </div>
              )}
              {insightError && <p className="sdp-insight__error">{insightError}</p>}
            </div>

            {/* ── hook email draft ── (a "failed" draft has nothing worth
                showing — subject/body are empty — so treat it like there's
                no draft at all rather than rendering a blank card) */}
            {hookDraft && hookDraft.status !== "failed" && (
              <div className="sdp-section">
                <div className="sdp-section__head"><Mail size={13} /> hook_email_draft</div>
                <div className="sdp-draft">
                  {hookDraft.status !== "pending" && (
                    <div className={`sdp-draft__status sdp-draft__status--${hookDraft.status}`}>
                      {hookDraft.status === "sent" ? "sent" : "dismissed"}
                    </div>
                  )}
                  <label className="sdp-draft__label">Subject</label>
                  <input
                    className="sdp-draft__subject"
                    value={draftSubject}
                    onChange={e => setDraftSubject(e.target.value)}
                    disabled={hookDraft.status !== "pending" || draftBusy !== null}
                  />
                  <label className="sdp-draft__label">Body</label>
                  <textarea
                    className="sdp-draft__body"
                    value={draftBody}
                    onChange={e => setDraftBody(e.target.value)}
                    rows={8}
                    disabled={hookDraft.status !== "pending" || draftBusy !== null}
                  />
                  {hookDraft.status === "pending" && (
                    <div className="sdp-draft__actions">
                      <button className="sdp-btn" onClick={() => actOnDraft("send")} disabled={draftBusy !== null || !draftSubject.trim() || !draftBody.trim()}>
                        <Send size={12} /> {draftBusy === "send" ? "sending…" : "send to visitor"}
                      </button>
                      <button className="sdp-btn sdp-btn--ghost" onClick={() => actOnDraft("dismiss")} disabled={draftBusy !== null}>
                        <Trash2 size={12} /> {draftBusy === "dismiss" ? "dismissing…" : "dismiss"}
                      </button>
                    </div>
                  )}
                  {draftError && <p className="sdp-insight__error">{draftError}</p>}
                </div>
              </div>
            )}

            {/* ── device & location ── */}
            {s && (
              <div className="sdp-section">
                <div className="sdp-section__head"><MapPin size={13} /> device_and_location</div>
                <div className="sdp-kv">
                  <div><span>IP</span><span>{s.ip}</span></div>
                  <div><span>Location</span><span>{[s.city, s.region, s.countryCode].filter(Boolean).join(", ") || "unknown"}</span></div>
                  {s.latitude && s.longitude && (
                    <div><span>Coordinates</span><span><a href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`} target="_blank" rel="noreferrer">{s.latitude}, {s.longitude}</a></span></div>
                  )}
                  {s.timezone && <div><span>Timezone (IP)</span><span>{s.timezone}</span></div>}
                  {s.clientTimezone && <div><span>Timezone (device)</span><span>{s.clientTimezone}</span></div>}
                  <div><span>Browser / OS</span><span>{s.browser || "?"} / {s.os || "?"}</span></div>
                  <div><span>Device type</span><span>{s.device || "?"}</span></div>
                  {s.screenWidth && s.screenHeight && <div><span>Screen</span><span>{s.screenWidth}×{s.screenHeight}</span></div>}
                  {s.viewportWidth && s.viewportHeight && <div><span>Viewport</span><span>{s.viewportWidth}×{s.viewportHeight}</span></div>}
                  {s.language && <div><span>Language</span><span>{s.language}</span></div>}
                  {s.connectionType && <div><span>Connection</span><span>{s.connectionType}</span></div>}
                  <div><span>Referrer</span><span className="sdp-kv__truncate">{s.referrer || "direct"}</span></div>
                  <div><span>Source</span><span>{s.source || "direct"}</span></div>
                </div>
              </div>
            )}

            {/* ── page journey / roadmap ── */}
            <div className="sdp-section">
              <div className="sdp-section__head"><Clock size={13} /> page_journey</div>
              {data.journey.length === 0 ? (
                <p className="sdp-empty">no page views recorded</p>
              ) : (
                <div className="sdp-journey">
                  {data.journey.map((pv, i) => {
                    const isLongest = data.longestPage && pv.path === data.longestPage.path && pv.enteredAt === data.longestPage.enteredAt;
                    return (
                      <div key={i} className={`sdp-journey-row${isLongest ? " sdp-journey-row--longest" : ""}`}>
                        <span className="sdp-journey-dot" />
                        <span className="sdp-journey-time">{formatClock(pv.enteredAt)}</span>
                        <span className="sdp-journey-path">{pv.path}</span>
                        <span className="sdp-journey-dur">{formatDuration(pv.durationMs)}{isLongest ? " ★" : ""}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── chat transcript ── */}
            {data.chat && data.chat.messages.length > 0 && (
              <div className="sdp-section">
                <div className="sdp-section__head"><Monitor size={13} /> chat_transcript</div>
                {data.chat.contactCaptured?.email && (
                  <p className="sdp-contact">{data.chat.contactCaptured.name || "—"} · {data.chat.contactCaptured.email}</p>
                )}
                <div className="sdp-chat">
                  {data.chat.messages.map((m, i) => (
                    <div key={i} className={`sdp-chat-row sdp-chat-row--${m.role}`}>
                      <span className="sdp-chat-role">{m.role === "user" ? "visitor" : "asha"}</span>
                      <span className="sdp-chat-text">{m.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .sdp-overlay {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55);
          display: flex; justify-content: flex-end;
          animation: sdp-fade-in 0.18s ease both;
        }
        @keyframes sdp-fade-in { from { opacity: 0; } to { opacity: 1; } }
        .sdp-panel {
          width: min(480px, 100vw); height: 100vh; overflow-y: auto;
          background: var(--adm-surface); border-left: 1px solid var(--adm-border);
          font-family: var(--ff-mono, monospace);
          animation: sdp-slide-in 0.22s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes sdp-slide-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        .sdp-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1rem 1.2rem; border-bottom: 1px solid var(--adm-border);
          position: sticky; top: 0; background: var(--adm-surface); z-index: 1;
        }
        .sdp-head__title { font-size: 0.95rem; font-weight: 700; color: var(--adm-text); }
        .sdp-close { background: none; border: none; color: var(--adm-text-faint); cursor: pointer; padding: 0.2rem; }
        .sdp-close:hover { color: var(--adm-text); }
        .sdp-loading { padding: 2rem 1.2rem; color: var(--adm-text-faint); font-size: 0.85rem; }
        .sdp-body { padding: 1rem 1.2rem 2rem; display: flex; flex-direction: column; gap: 1.3rem; }

        .sdp-section__head {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.75rem; color: var(--brand-teal); margin-bottom: 0.6rem; letter-spacing: 0.02em;
        }
        .sdp-empty { color: var(--adm-text-faint); font-size: 0.78rem; }

        .sdp-insight { background: rgba(43,191,179,0.05); border: 1px solid var(--adm-border); border-radius: 10px; padding: 0.85rem; }
        .sdp-insight__badge {
          display: inline-block; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 0.15rem 0.5rem; border-radius: 999px; border: 1px solid; margin-bottom: 0.55rem;
        }
        .sdp-insight__text { font-size: 0.82rem; line-height: 1.6; color: var(--adm-text-dim); margin: 0 0 0.7rem; }
        .sdp-insight__empty { font-size: 0.8rem; color: var(--adm-text-faint); margin: 0 0 0.7rem; }
        .sdp-insight__error { font-size: 0.75rem; color: #ff6b7d; margin: 0.5rem 0 0; }

        .sdp-draft { background: rgba(43,191,179,0.05); border: 1px solid var(--adm-border); border-radius: 10px; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; }
        .sdp-draft__status {
          align-self: flex-start; font-size: 0.65rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 0.15rem 0.5rem; border-radius: 999px; margin-bottom: 0.3rem;
        }
        .sdp-draft__status--sent { color: var(--brand-teal); background: rgba(43,191,179,0.14); }
        .sdp-draft__status--dismissed { color: var(--adm-text-faint); background: rgba(255,255,255,0.05); }
        .sdp-draft__label { font-size: 0.65rem; color: var(--adm-text-faint); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.3rem; }
        .sdp-draft__subject, .sdp-draft__body {
          font-family: inherit; font-size: 0.8rem; color: var(--adm-text); background: var(--adm-bg);
          border: 1px solid var(--adm-border); border-radius: 7px; padding: 0.5rem 0.6rem; resize: vertical;
        }
        .sdp-draft__subject:disabled, .sdp-draft__body:disabled { opacity: 0.7; }
        .sdp-draft__actions { display: flex; gap: 0.5rem; margin-top: 0.3rem; }

        .sdp-btn {
          display: inline-flex; align-items: center; gap: 0.35rem;
          font-family: inherit; font-size: 0.72rem; font-weight: 600;
          background: var(--brand-teal); color: #04211e; border: none;
          border-radius: 7px; padding: 0.4rem 0.7rem; cursor: pointer;
        }
        .sdp-btn:disabled { opacity: 0.6; cursor: default; }
        .sdp-btn--ghost { background: transparent; color: var(--adm-text-faint); border: 1px solid var(--adm-border); }
        .sdp-btn--ghost:hover:not(:disabled) { color: var(--brand-teal); border-color: var(--brand-teal); }
        .sdp-spin { animation: sdp-spin 0.8s linear infinite; }
        @keyframes sdp-spin { to { transform: rotate(360deg); } }

        .sdp-kv { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.76rem; }
        .sdp-kv > div { display: flex; justify-content: space-between; gap: 1rem; padding: 0.2rem 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .sdp-kv > div > span:first-child { color: var(--adm-text-faint); flex-shrink: 0; }
        .sdp-kv > div > span:last-child { color: var(--adm-text-dim); text-align: right; }
        .sdp-kv__truncate { max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sdp-kv a { color: var(--brand-teal); text-decoration: none; }
        .sdp-kv a:hover { text-decoration: underline; }

        .sdp-journey { display: flex; flex-direction: column; }
        .sdp-journey-row {
          display: grid; grid-template-columns: auto auto 1fr auto; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0; font-size: 0.75rem; border-left: 1px solid var(--adm-border); padding-left: 0.7rem; margin-left: 3px;
        }
        .sdp-journey-row--longest { border-left-color: var(--brand-teal); }
        .sdp-journey-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--adm-text-faint); margin-left: -0.95rem; flex-shrink: 0; }
        .sdp-journey-row--longest .sdp-journey-dot { background: var(--brand-teal); }
        .sdp-journey-time { color: var(--adm-text-faint); }
        .sdp-journey-path { color: var(--adm-text-dim); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sdp-journey-row--longest .sdp-journey-path { color: var(--adm-text); font-weight: 600; }
        .sdp-journey-dur { color: var(--adm-text-faint); white-space: nowrap; }
        .sdp-journey-row--longest .sdp-journey-dur { color: var(--brand-teal); }

        .sdp-contact { font-size: 0.76rem; color: var(--adm-text-dim); margin: -0.3rem 0 0.6rem; }
        .sdp-chat { display: flex; flex-direction: column; gap: 0.5rem; max-height: 320px; overflow-y: auto; }
        .sdp-chat-row { display: flex; flex-direction: column; gap: 0.15rem; font-size: 0.76rem; padding: 0.4rem 0.55rem; border-radius: 8px; }
        .sdp-chat-row--user { background: rgba(43,191,179,0.08); }
        .sdp-chat-row--assistant { background: rgba(255,255,255,0.03); }
        .sdp-chat-role { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--adm-text-faint); }
        .sdp-chat-text { color: var(--adm-text-dim); line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }

        @media (max-width: 560px) {
          .sdp-panel { width: 100vw; }
        }
      `}</style>
    </div>
  );
}
