"use client";
import { useEffect, useMemo, useState } from "react";
import { Terminal, Globe, Clock, Users, Activity, MessageSquare } from "lucide-react";
import AdminShell from "../AdminShell";

interface Totals {
  totalSessions: number;
  sessionsToday: number;
  avgDurationMs: number;
  chatOpenRate: number;
}
interface CountryRow { countryCode: string; count: number; }
interface PageRow { path: string; views: number; avgDurationMs: number; }
interface ChatRow { sessionId: string; countryCode: string; lastQuestion: string; messageCount: number; at: string; }
interface SessionRow {
  sessionId: string; countryCode: string; region: string; city: string;
  device: string; browser: string; os: string; landingPath: string;
  referrer: string; source: string; pageCount: number; totalDurationMs: number;
  chatOpened: boolean; firstSeen: string; lastSeen: string;
}
interface AnalyticsData {
  totals: Totals;
  byCountry: CountryRow[];
  topPages: PageRow[];
  recentSessions: SessionRow[];
  chatActivity: ChatRow[];
}

function flagEmoji(code: string) {
  if (!code || code.length !== 2) return "🏳️";
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 127397 + c.charCodeAt(0)));
}

function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function timeAgo(iso: string) {
  const d = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(d / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

/** Char-by-char terminal typing effect — used for the header command line only. */
function TypedLine({ text, speed = 16 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return <>{shown}<span className="trm-cursor">▊</span></>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(j => { if (alive) setData(j); })
      .catch(() => { if (alive) setData({ totals: { totalSessions: 0, sessionsToday: 0, avgDurationMs: 0, chatOpenRate: 0 }, byCountry: [], topPages: [], recentSessions: [], chatActivity: [] }); });
    return () => { alive = false; };
  }, []);

  const maxCountryCount = useMemo(() => Math.max(1, ...(data?.byCountry.map(c => c.count) ?? [1])), [data]);

  return (
    <AdminShell>
      <div className="trm-root adm-rise">
        <div className="trm-head">
          <Terminal size={15} />
          <span className="trm-head__line">
            <TypedLine text="root@cx-machinery:~$ ./analytics --watch --since=180d" />
          </span>
        </div>
        <h1 className="adm-page-head__title" style={{ marginTop: "0.6rem" }}>Visitor analytics</h1>
        <p className="adm-page-head__sub" style={{ marginBottom: "1.75rem" }}>
          Where visitors come from, what they look at, how long they stay, and what they ask ASHA — refreshed on load.
        </p>

        {!data ? (
          <div className="trm-loading">loading telemetry…</div>
        ) : (
          <>
            {/* ── stat readouts ── */}
            <div className="trm-stats adm-stagger">
              <div className="trm-stat">
                <div className="trm-stat__icon"><Users size={16} /></div>
                <div className="trm-stat__value">{data.totals.totalSessions}</div>
                <div className="trm-stat__label">sessions tracked</div>
              </div>
              <div className="trm-stat">
                <div className="trm-stat__icon"><Activity size={16} /></div>
                <div className="trm-stat__value">{data.totals.sessionsToday}</div>
                <div className="trm-stat__label">sessions today</div>
              </div>
              <div className="trm-stat">
                <div className="trm-stat__icon"><Clock size={16} /></div>
                <div className="trm-stat__value">{formatDuration(data.totals.avgDurationMs)}</div>
                <div className="trm-stat__label">avg time on site</div>
              </div>
              <div className="trm-stat">
                <div className="trm-stat__icon"><MessageSquare size={16} /></div>
                <div className="trm-stat__value">{data.totals.chatOpenRate}%</div>
                <div className="trm-stat__label">opened ASHA chat</div>
              </div>
            </div>

            <div className="trm-grid">
              {/* ── by country ── */}
              <div className="trm-panel">
                <div className="trm-panel__head"><Globe size={14} /> visitors_by_country</div>
                <div className="trm-panel__body">
                  {data.byCountry.length === 0 ? (
                    <div className="trm-empty">no traffic recorded yet</div>
                  ) : data.byCountry.slice(0, 12).map(c => (
                    <div key={c.countryCode} className="trm-bar-row">
                      <span className="trm-bar-flag">{flagEmoji(c.countryCode)}</span>
                      <span className="trm-bar-code">{c.countryCode}</span>
                      <div className="trm-bar-track">
                        <div className="trm-bar-fill" style={{ transform: `scaleX(${Math.max(0.04, c.count / maxCountryCount)})` }} />
                      </div>
                      <span className="trm-bar-count">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── top pages ── */}
              <div className="trm-panel">
                <div className="trm-panel__head"><Activity size={14} /> top_pages · time_on_page</div>
                <div className="trm-panel__body trm-table-wrap">
                  {data.topPages.length === 0 ? (
                    <div className="trm-empty">no page views recorded yet</div>
                  ) : (
                    <table className="trm-table">
                      <thead><tr><th>path</th><th>views</th><th>avg time</th></tr></thead>
                      <tbody>
                        {data.topPages.map(p => (
                          <tr key={p.path}>
                            <td className="trm-path">{p.path}</td>
                            <td>{p.views}</td>
                            <td>{formatDuration(p.avgDurationMs)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            {/* ── AI chat activity ── */}
            <div className="trm-panel" style={{ marginTop: "1.1rem" }}>
              <div className="trm-panel__head"><MessageSquare size={14} /> tail -f asha_chat.log</div>
              <div className="trm-panel__body trm-log">
                {data.chatActivity.length === 0 ? (
                  <div className="trm-empty">no chat activity yet</div>
                ) : data.chatActivity.map((c, i) => (
                  <div key={c.sessionId + i} className="trm-log-row" style={{ animationDelay: `${Math.min(i, 10) * 0.04}s` }}>
                    <span className="trm-log-flag">{flagEmoji(c.countryCode)}</span>
                    <span className="trm-log-prompt">$</span>
                    <span className="trm-log-text">
                      {c.lastQuestion || "(no message text)"}
                    </span>
                    <span className="trm-log-meta">{c.messageCount} msgs · {timeAgo(c.at)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── recent sessions ── */}
            <div className="trm-panel" style={{ marginTop: "1.1rem" }}>
              <div className="trm-panel__head"><Users size={14} /> recent_sessions</div>
              <div className="trm-panel__body trm-table-wrap">
                {data.recentSessions.length === 0 ? (
                  <div className="trm-empty">no sessions recorded yet</div>
                ) : (
                  <table className="trm-table">
                    <thead>
                      <tr><th>where</th><th>device</th><th>landing</th><th>pages</th><th>time</th><th>chat</th><th>last seen</th></tr>
                    </thead>
                    <tbody>
                      {data.recentSessions.map(s => (
                        <tr key={s.sessionId}>
                          <td>{flagEmoji(s.countryCode)} {s.countryCode || "??"}{s.city ? ` · ${s.city}` : ""}</td>
                          <td>{s.device || "?"} / {s.browser || "?"}</td>
                          <td className="trm-path">{s.landingPath || "/"}</td>
                          <td>{s.pageCount}</td>
                          <td>{formatDuration(s.totalDurationMs)}</td>
                          <td>{s.chatOpened ? <span className="trm-yes">yes</span> : <span className="trm-no">·</span>}</td>
                          <td>{timeAgo(s.lastSeen)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .trm-root { font-family: var(--ff-mono, monospace); }
        .trm-head {
          display: flex; align-items: center; gap: 0.5rem;
          color: var(--brand-teal); font-size: 0.85rem;
        }
        .trm-head__line { white-space: pre-wrap; overflow-wrap: anywhere; }
        .trm-cursor { display: inline-block; animation: trm-blink 1s step-end infinite; margin-left: 1px; }
        @keyframes trm-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }

        .trm-loading { color: var(--adm-text-faint); font-size: 0.85rem; padding: 2rem 0; }

        .trm-stats {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem; margin-bottom: 1.1rem;
        }
        .trm-stat {
          border-radius: 12px; padding: 1rem 1.1rem;
          background: var(--adm-surface); border: 1px solid var(--adm-border);
        }
        .trm-stat__icon {
          width: 30px; height: 30px; border-radius: 8px; margin-bottom: 0.7rem;
          display: flex; align-items: center; justify-content: center;
          background: rgba(43,191,179,0.13); color: var(--brand-teal);
        }
        .trm-stat__value {
          font-size: 1.5rem; font-weight: 700; color: var(--adm-text);
          font-variant-numeric: tabular-nums; line-height: 1;
        }
        .trm-stat__label { font-size: 0.72rem; color: var(--adm-text-faint); margin-top: 0.35rem; letter-spacing: 0.03em; }

        .trm-grid {
          display: grid; grid-template-columns: 1fr 1.3fr; gap: 1.1rem;
        }
        @media (max-width: 900px) { .trm-grid { grid-template-columns: 1fr; } }

        .trm-panel {
          border-radius: 12px; background: var(--adm-surface); border: 1px solid var(--adm-border);
          overflow: hidden;
        }
        .trm-panel__head {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem; border-bottom: 1px solid var(--adm-border);
          font-size: 0.78rem; color: var(--brand-teal); letter-spacing: 0.02em;
        }
        .trm-panel__body { padding: 0.85rem 1rem; }
        .trm-empty { color: var(--adm-text-faint); font-size: 0.8rem; padding: 0.5rem 0; }

        .trm-bar-row {
          display: flex; align-items: center; gap: 0.55rem;
          padding: 0.3rem 0; font-size: 0.78rem; color: var(--adm-text-dim);
        }
        .trm-bar-flag { font-size: 0.95rem; }
        .trm-bar-code { width: 2.2rem; flex-shrink: 0; color: var(--adm-text); font-weight: 600; }
        .trm-bar-track { flex: 1; height: 10px; border-radius: 4px; background: rgba(255,255,255,0.04); overflow: hidden; }
        .trm-bar-fill { width: 100%; height: 100%; transform-origin: left center; background: linear-gradient(90deg, var(--brand-teal-dk), var(--brand-teal)); border-radius: 4px; transition: transform 0.4s ease; }
        .trm-bar-count { width: 2.5rem; text-align: right; color: var(--adm-text-faint); }

        .trm-table-wrap { overflow-x: auto; }
        .trm-table { width: 100%; border-collapse: collapse; font-size: 0.76rem; }
        .trm-table th {
          text-align: left; padding: 0.35rem 0.6rem 0.5rem 0; color: var(--adm-text-faint);
          font-weight: 600; text-transform: lowercase; border-bottom: 1px solid var(--adm-border);
          white-space: nowrap;
        }
        .trm-table td {
          padding: 0.4rem 0.6rem 0.4rem 0; color: var(--adm-text-dim);
          border-bottom: 1px solid rgba(255,255,255,0.04); white-space: nowrap;
        }
        .trm-path { color: var(--adm-text); max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap !important; }
        .trm-yes { color: var(--brand-teal); font-weight: 600; }
        .trm-no { color: var(--adm-text-faint); }

        .trm-log { display: flex; flex-direction: column; gap: 0.2rem; max-height: 340px; overflow-y: auto; }
        .trm-log-row {
          display: flex; align-items: baseline; gap: 0.5rem;
          padding: 0.4rem 0.1rem; font-size: 0.78rem;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          animation: trm-log-in 0.3s ease both;
          white-space: pre-wrap; overflow-wrap: anywhere;
        }
        @keyframes trm-log-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .trm-log-flag { flex-shrink: 0; }
        .trm-log-prompt { color: var(--brand-teal); flex-shrink: 0; font-weight: 700; }
        .trm-log-text { color: var(--adm-text-dim); flex: 1; min-width: 0; }
        .trm-log-meta { flex-shrink: 0; color: var(--adm-text-faint); font-size: 0.68rem; }

        @media (prefers-reduced-motion: reduce) {
          .trm-cursor { animation: none; opacity: 1; }
          .trm-log-row { animation: none; }
        }
      `}</style>
    </AdminShell>
  );
}
