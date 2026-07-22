"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HardHat, X } from "lucide-react";

const AGENT_NAME = "ASHA";
const SESSION_KEY = "asha_session_id";
const OPEN_EVENT = "asha:open";

/** Opens the ASHA chat widget from anywhere on the site (e.g. a homepage CTA). */
export function openAshaChat(prefillMessage?: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { prefillMessage } }));
}

type ChatAction =
  | { type: "navigate"; slug: string }
  | { type: "show_machines"; slugs: string[] }
  | { type: "compare"; slugs: string[]; specLabels: string[] }
  | { type: "quick_replies"; options: string[] }
  | { type: "machine_detail"; slug: string };

interface Msg {
  role: "user" | "assistant";
  content: string;
  at?: string;
  actions?: ChatAction[];
}

interface MachineSummary {
  slug: string;
  name: string;
  series: string;
  tagline: string;
  category: string;
  categoryName: string;
  image: string;
  models: string[];
  specs: { label: string; values: string[] }[];
  href: string;
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

function parseNumeric(v: string): number | null {
  const match = v.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

/** Machine suggestion cards — larger image left, data right, polished card UI with Explore + Inquire buttons. */
function MachineCards({ slugs, onInquire, onExplore }: { slugs: string[]; onInquire: (slug: string, name: string) => void; onExplore: (slug: string) => void }) {
  const [machines, setMachines] = useState<MachineSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chat/machines?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setMachines(data.machines ?? []); })
      .catch(() => { if (!cancelled) setMachines([]); });
    return () => { cancelled = true; };
  }, [slugs]);

  if (!machines) return <div className="asha-cards-loading">Loading machines…</div>;
  if (machines.length === 0) return null;

  return (
    <div className="asha-cards">
      {machines.map(m => (
        <div key={m.slug} className="asha-card">
          <div className="asha-card-img-col">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.image} alt={m.name} className="asha-card-img" />
          </div>
          <div className="asha-card-info-col">
            <div className="asha-card-name">{m.name}</div>
            <div className="asha-card-series">{m.series}</div>
            <div className="asha-card-cat">{m.categoryName}</div>
            {m.tagline && <div className="asha-card-tagline">{m.tagline}</div>}
            <div className="asha-card-actions">
              <button className="asha-card-explore" onClick={() => onExplore(m.slug)}>
                Explore
              </button>
              <button className="asha-card-inquire" onClick={() => onInquire(m.slug, m.name)}>
                Inquire
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Clickable quick-reply chips for a "quick_replies" action — lets the visitor pick an option instead of typing. */
function QuickReplies({ options, onPick }: { options: string[]; onPick: (option: string) => void }) {
  return (
    <div className="asha-quick-replies">
      {options.map(opt => (
        <button key={opt} className="asha-quick-reply" onClick={() => onPick(opt)}>
          {opt}
        </button>
      ))}
    </div>
  );
}

/** Spec comparison bars for a "compare" action — one grouped bar chart per spec row. */
function CompareChart({ slugs, specLabels }: { slugs: string[]; specLabels: string[] }) {
  const [machines, setMachines] = useState<MachineSummary[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chat/machines?slugs=${encodeURIComponent(slugs.join(","))}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setMachines(data.machines ?? []); })
      .catch(() => { if (!cancelled) setMachines([]); });
    return () => { cancelled = true; };
  }, [slugs]);

  if (!machines) return <div className="asha-cards-loading">Loading comparison…</div>;
  if (machines.length < 2) return null;

  return (
    <div className="asha-compare">
      <div className="asha-compare-header">
        {machines.map(m => (
          <div key={m.slug} className="asha-compare-legend">
            <span className="asha-compare-dot" />{m.series || m.name}
          </div>
        ))}
      </div>
      {specLabels.map(label => {
        const rows = machines.map(m => {
          const specRow = m.specs.find(s => s.label.toLowerCase() === label.toLowerCase());
          const modelIdx = 0; // first model column as the representative value
          const raw = specRow?.values[modelIdx] ?? "-";
          return { machine: m, raw, num: parseNumeric(raw) };
        });
        const max = Math.max(...rows.map(r => r.num ?? 0), 1);
        const anyNumeric = rows.some(r => r.num !== null);

        return (
          <div key={label} className="asha-compare-row">
            <div className="asha-compare-label">{label}</div>
            {rows.map(({ machine, raw, num }) => (
              <div key={machine.slug} className="asha-compare-bar-track">
                <div
                  className="asha-compare-bar-fill"
                  style={{ transform: `scaleX(${anyNumeric && num !== null ? Math.max(0.06, num / max) : 0})` }}
                />
                <span className="asha-compare-value">{raw}</span>
              </div>
            ))}
          </div>
        );
      })}
      <div className="asha-compare-table-wrap">
        <table className="asha-compare-table">
          <thead><tr><th>Spec</th>{machines.map(m => <th key={m.slug}>{m.series || m.name}</th>)}</tr></thead>
          <tbody>
            {specLabels.map(label => (
              <tr key={label}>
                <td>{label}</td>
                {machines.map(m => {
                  const specRow = m.specs.find(s => s.label.toLowerCase() === label.toLowerCase());
                  return <td key={m.slug}>{specRow?.values[0] ?? "-"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Resolves a bare slug to its full /products/<category>/<slug> URL and navigates there. */
function NavigateAction({ slug }: { slug: string }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chat/machines?slugs=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        const href = data.machines?.[0]?.href;
        if (href) router.push(href);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [slug, router]);

  return <div className="asha-nav-hint">Opening that machine's page…</div>;
}

/** Full machine detail view shown when "Explore" is clicked — hero image, spec bars, and inquiry CTA. */
function MachineDetailView({ slug, onInquire }: { slug: string; onInquire: (slug: string, name: string) => void }) {
  const [machine, setMachine] = useState<MachineSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/chat/machines?slugs=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => { if (!cancelled) setMachine(data.machines?.[0] ?? null); })
      .catch(() => { if (!cancelled) setMachine(null); });
    return () => { cancelled = true; };
  }, [slug]);

  if (!machine) return <div className="asha-cards-loading">Loading details…</div>;

  const maxNum = (values: string[]) => Math.max(...values.map(v => parseNumeric(v) ?? 0), 1);

  return (
    <div className="asha-detail">
      <div className="asha-detail-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={machine.image} alt={machine.name} className="asha-detail-hero-img" />
        <div className="asha-detail-hero-overlay">
          <div className="asha-detail-cat-badge">{machine.categoryName}</div>
          <div className="asha-detail-name">{machine.name}</div>
          <div className="asha-detail-series">{machine.series}</div>
        </div>
      </div>

      {machine.tagline && <p className="asha-detail-tagline">{machine.tagline}</p>}

      <div className="asha-detail-models">
        <span className="asha-detail-models-label">Models</span>
        <div className="asha-detail-model-chips">
          {machine.models.map(m => <span key={m} className="asha-detail-model-chip">{m}</span>)}
        </div>
      </div>

      <div className="asha-detail-specs">
        <div className="asha-detail-specs-title">Technical Specifications</div>
        {machine.specs.map(spec => {
          const barMax = maxNum(spec.values);
          return (
            <div key={spec.label} className="asha-detail-spec-row">
              <div className="asha-detail-spec-label">{spec.label}</div>
              <div className="asha-detail-spec-bars">
                {spec.values.map((val, i) => {
                  const num = parseNumeric(val);
                  const model = machine.models[i] || "";
                  const pct = num !== null ? Math.max(6, (num / barMax) * 100) : 0;
                  return (
                    <div key={model} className="asha-detail-spec-bar-row">
                      <span className="asha-detail-spec-bar-model">{model}</span>
                      <div className="asha-detail-spec-bar-track">
                        <div className="asha-detail-spec-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="asha-detail-spec-bar-value">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="asha-detail-cta">
        <button className="asha-detail-inquire-btn" onClick={() => onInquire(machine.slug, machine.name)}>
          Inquire About This Machine
        </button>
      </div>
    </div>
  );
}

interface ActionRendererProps {
  action: ChatAction;
  onInquire: (slug: string, name: string) => void;
  onQuickReply: (option: string) => void;
  onExplore: (slug: string) => void;
}

function ActionRenderer({ action, onInquire, onQuickReply, onExplore }: ActionRendererProps) {
  if (action.type === "navigate") return <NavigateAction slug={action.slug} />;
  if (action.type === "show_machines") return <MachineCards slugs={action.slugs} onInquire={onInquire} onExplore={onExplore} />;
  if (action.type === "compare") return <CompareChart slugs={action.slugs} specLabels={action.specLabels} />;
  if (action.type === "quick_replies") return <QuickReplies options={action.options} onPick={onQuickReply} />;
  if (action.type === "machine_detail") return <MachineDetailView slug={action.slug} onInquire={onInquire} />;
  return null;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [replyCount, setReplyCount] = useState(0);
  const [latestReply, setLatestReply] = useState<{ inquiryId: string; inquiryType: string; message: string; machineNames: string[]; partNames: string[]; sentAt: string } | null>(null);
  const [showReplyPopup, setShowReplyPopup] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sessionIdRef.current = getSessionId();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = localStorage.getItem("asha_tooltip_dismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setShowTooltip(true), 1200);
      const autoDismiss = setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem("asha_tooltip_dismissed", "1");
      }, 10000);
      return () => { clearTimeout(timer); clearTimeout(autoDismiss); };
    }
  }, []);

  // Poll for reply notifications
  useEffect(() => {
    if (typeof window === "undefined") return;
    const email = localStorage.getItem("cx_inquiry_email");
    if (!email) return;

    async function checkReplies() {
      try {
        const lastSeen = localStorage.getItem("cx_inquiry_lastSeen") || "";
        const res = await fetch(`/api/inquiry-replies?email=${encodeURIComponent(email!)}&lastSeen=${encodeURIComponent(lastSeen)}`);
        const data = await res.json();
        if (data.hasNewReplies && data.replies.length > 0) {
          setReplyCount(data.count);
          setLatestReply(data.replies[0]);
        }
      } catch { /* silent */ }
    }

    checkReplies();
    pollRef.current = setInterval(checkReplies, 30000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const loadHistory = useCallback(async () => {
    if (hydrated || !sessionIdRef.current) return;
    setHydrated(true);
    try {
      const res = await fetch(`/api/chat?sessionId=${encodeURIComponent(sessionIdRef.current)}`);
      const data = await res.json();
      if (Array.isArray(data.messages) && data.messages.length > 0) {
        setMessages(data.messages.map((m: Msg) => ({ role: m.role, content: m.content, actions: m.actions })));
      } else {
        setMessages([{
          role: "assistant",
          content: `Hi, I'm ${AGENT_NAME}, your AI assistant. I can help you explore our full range of machines — specs, comparisons, pricing, technical details, and more. Just ask me about any machine or category to get started!`,
          actions: [{ type: "quick_replies", options: ["Film Blowing Machines", "Bag Making Machines", "Recycling & Lab Lines", "Flexographic Printing Machines"] }],
        }]);
      }
    } catch {
      setMessages([{ role: "assistant", content: `Hi, I'm ${AGENT_NAME}, your AI assistant. Ask me about any machine — I'll pull up specs, details, and help you find the right fit.` }]);
    }
  }, [hydrated]);

  const handleOpen = useCallback((prefillMessage?: string) => {
    setOpen(true);
    setShowTooltip(false);
    localStorage.setItem("asha_tooltip_dismissed", "1");
    loadHistory();
    if (prefillMessage) setInput(prefillMessage);
  }, [loadHistory]);

  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ prefillMessage?: string }>).detail;
      handleOpen(detail?.prefillMessage);
    };
    window.addEventListener(OPEN_EVENT, onOpenEvent);
    return () => window.removeEventListener(OPEN_EVENT, onOpenEvent);
  }, [handleOpen]);

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || sending) return;
    if (!override) setInput("");
    setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "" }]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sessionIdRef.current, message: text }),
      });
      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let lineBuffer = "";
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        lineBuffer += decoder.decode(value, { stream: true });
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let frame: { type: string; text?: string; actions?: ChatAction[] };
          try { frame = JSON.parse(line); } catch { continue; }

          if (frame.type === "delta" && frame.text) {
            acc += frame.text;
            const snapshot = acc;
            setMessages(prev => {
              const next = [...prev];
              next[next.length - 1] = { role: "assistant", content: snapshot };
              return next;
            });
          } else if (frame.type === "final") {
            const finalText = frame.text ?? acc;
            const actions = frame.actions ?? [];
            setMessages(prev => {
              const next = [...prev];
              next[next.length - 1] = { role: "assistant", content: finalText, actions };
              return next;
            });
          }
        }
      }
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = { role: "assistant", content: "Sorry, I couldn't reach the server. Please try again in a moment." };
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const onInquire = (slug: string, name: string) => {
    send(`I'd like to inquire about the ${name} (${slug}).`);
  };

  const onQuickReply = (option: string) => {
    send(option);
  };

  const onExplore = (slug: string) => {
    setMessages(prev => [...prev, { role: "assistant", content: "", actions: [{ type: "machine_detail", slug }] }]);
  };

  return (
    <>
      <button
        aria-label={open ? `Close ${AGENT_NAME} chat` : `Open ${AGENT_NAME} chat`}
        onClick={() => {
          if (open) {
            setOpen(false);
          } else if (replyCount > 0 && !showReplyPopup) {
            setShowReplyPopup(true);
            setShowTooltip(false);
          } else {
            setShowReplyPopup(false);
            handleOpen();
          }
        }}
        className={`asha-launcher ${sending ? "asha-launcher--thinking" : ""} ${replyCount > 0 && !open ? "asha-launcher--has-reply" : ""}`}
      >
        {open ? (
          <X size={24} />
        ) : (
          <HardHat size={26} className={`asha-engineer-icon ${sending ? "asha-engineer-icon--thinking" : ""}`} />
        )}
        {replyCount > 0 && !open && (
          <span className="asha-reply-badge">{replyCount}</span>
        )}
      </button>

      {showTooltip && (
        <div className="asha-tooltip" onClick={() => { setShowTooltip(false); localStorage.setItem("asha_tooltip_dismissed", "1"); handleOpen(); }}>
          <div className="asha-tooltip-text">Ask <strong>ASHA</strong> — specs, comparisons &amp; pricing</div>
          <div className="asha-tooltip-arrow" />
        </div>
      )}

      {showReplyPopup && latestReply && (
        <div className="asha-reply-popup">
          <div className="asha-reply-popup__header">
            <div className="asha-reply-popup__icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17 10c0 3.866-3.134 7-7 7a6.97 6.97 0 01-3.5-.938L3 17l.938-3.5A6.97 6.97 0 013 10c0-3.866 3.134-7 7-7s7 3.134 7 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="7.5" cy="10" r="0.8" fill="currentColor"/>
                <circle cx="10" cy="10" r="0.8" fill="currentColor"/>
                <circle cx="12.5" cy="10" r="0.8" fill="currentColor"/>
              </svg>
            </div>
            <div className="asha-reply-popup__header-text">
              <div className="asha-reply-popup__title">New Reply from Engineer</div>
              <div className="asha-reply-popup__type">
                {latestReply.inquiryType === "talk-to-engineer" ? "Talk to Engineer" :
                 latestReply.inquiryType === "parts" ? "Part Inquiry" : "Direct Inquiry"}
                {latestReply.machineNames.length > 0 && ` — ${latestReply.machineNames.join(", ")}`}
                {latestReply.partNames.length > 0 && ` — ${latestReply.partNames.join(", ")}`}
              </div>
            </div>
            <button className="asha-reply-popup__close" onClick={() => setShowReplyPopup(false)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="asha-reply-popup__body">
            <p>{latestReply.message}</p>
          </div>
          <div className="asha-reply-popup__actions">
            <button className="asha-reply-popup__btn asha-reply-popup__btn--primary" onClick={() => {
              setShowReplyPopup(false);
              setReplyCount(0);
              localStorage.setItem("cx_inquiry_lastSeen", new Date().toISOString());
              window.location.href = `/inquiries#${latestReply.inquiryId}`;
            }}>
              View Full Reply
            </button>
            <button className="asha-reply-popup__btn" onClick={() => {
              setShowReplyPopup(false);
              handleOpen();
            }}>
              Chat with ASHA
            </button>
          </div>
        </div>
      )}

      {open && (
        <div className={`asha-panel ${expanded ? "asha-panel--expanded" : ""}`}>
          <div className="asha-header">
            <div className={`asha-avatar ${sending ? "asha-avatar--thinking" : ""}`}>A</div>
            <div className="asha-header-text">
              <div className="asha-title">{AGENT_NAME}</div>
              <div className="asha-subtitle">Machine assistant · online</div>
            </div>
            <button
              className="asha-expand-btn"
              aria-label={expanded ? "Shrink chat" : "Expand chat"}
              onClick={() => setExpanded(v => !v)}
            >
              {expanded ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              )}
            </button>
          </div>

          <div className="asha-messages" ref={listRef}>
            {messages.map((m, i) => (
              <div key={i} className="asha-msg-group">
                <div className={`asha-bubble ${m.role}`}>
                  {m.content || (sending && i === messages.length - 1 ? <span className="asha-typing"><span>·</span><span>·</span><span>·</span></span> : "")}
                </div>
                {m.actions?.map((action, ai) => <ActionRenderer key={ai} action={action} onInquire={onInquire} onQuickReply={onQuickReply} onExplore={onExplore} />)}
              </div>
            ))}
          </div>

          <div className="asha-input-row">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about a machine, compare models, or request a page…"
              rows={1}
              disabled={sending}
            />
            <button onClick={() => send()} disabled={sending || !input.trim()} aria-label="Send message">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12L20 4L13 20L11 13L4 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        .asha-launcher {
          position: fixed; bottom: 24px; right: 24px; z-index: 9200;
          width: 58px; height: 58px; border-radius: 50%;
          background: var(--brand-teal); color: #06110f;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
        }
        .asha-launcher:hover { background: #3dd6ca; }
        .asha-engineer-icon {
          animation: asha-idle-float 3s ease-in-out infinite;
        }
        .asha-engineer-icon--thinking {
          animation: none;
        }
        .asha-launcher--thinking {
          animation: asha-think-pulse 0.7s ease-in-out infinite;
        }

        .asha-tooltip {
          position: fixed; bottom: 42px; right: 76px; z-index: 9199;
          display: flex; align-items: center; gap: 0;
          cursor: pointer;
          animation: asha-tooltip-in 0.4s var(--ease-out) both;
        }
        .asha-tooltip:hover { opacity: 0.9; }
        .asha-tooltip-text {
          background: var(--bg-surface);
          border: 1px solid var(--brand-teal);
          border-radius: 10px;
          padding: 0.55rem 0.85rem;
          font-family: var(--ff-body), system-ui, sans-serif;
          font-size: 0.75rem;
          color: var(--ink);
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
          position: relative;
        }
        .asha-tooltip-text strong { color: var(--brand-teal); }
        .asha-tooltip-arrow {
          width: 0; height: 0;
          border: 7px solid transparent;
          border-left-color: var(--brand-teal);
          margin-left: -1px;
        }

        .asha-panel {
          position: fixed; bottom: 96px; right: 24px; z-index: 9200;
          width: min(460px, calc(100vw - 32px));
          height: min(680px, calc(100vh - 120px));
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          border-radius: 18px;
          backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          display: flex; flex-direction: column; overflow: hidden;
          font-family: var(--ff-body), system-ui, sans-serif;
          color-scheme: dark;
        }
        .asha-panel--expanded {
          width: min(720px, calc(100vw - 32px));
          height: min(88vh, 860px);
        }

        .asha-header {
          display: flex; align-items: center; gap: 0.7rem;
          padding: 1rem 1.1rem;
          border-bottom: 1px solid var(--bg-line);
        }
        .asha-header-text { flex: 1; }
        .asha-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--brand-teal-dim);
          color: var(--brand-teal);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.95rem;
          flex-shrink: 0;
          position: relative;
        }
        .asha-avatar--thinking::after {
          content: ""; position: absolute; inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--brand-teal);
          animation: asha-ring-pulse 0.7s ease-out infinite;
        }
        .asha-avatar--thinking {
          animation: asha-avatar-breathe 0.7s ease-in-out infinite;
        }
        .asha-title { color: var(--ink); font-weight: 700; font-size: 0.95rem; }
        .asha-subtitle { color: var(--ink-35); font-size: 0.78rem; }
        .asha-expand-btn {
          width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
          background: var(--bg-raise); border: 1px solid var(--bg-line);
          color: var(--ink-60); cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .asha-expand-btn:hover { border-color: var(--brand-teal); color: var(--brand-teal); }

        .asha-messages {
          flex: 1; overflow-y: auto; padding: 1rem 1rem 0.5rem;
          display: flex; flex-direction: column; gap: 0.9rem;
        }
        .asha-msg-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .asha-bubble {
          max-width: 88%; padding: 0.6rem 0.85rem; border-radius: 12px;
          font-size: 0.9rem; line-height: 1.45; white-space: pre-wrap;
        }
        .asha-bubble.assistant {
          align-self: flex-start;
          background: var(--bg-raise);
          color: var(--ink);
          border-bottom-left-radius: 4px;
        }
        .asha-bubble.user {
          align-self: flex-end;
          background: var(--brand-teal);
          color: #06110f;
          border-bottom-right-radius: 4px;
        }

        .asha-cards-loading { font-size: 0.78rem; color: var(--ink-35); padding: 0.3rem 0; }

        .asha-cards { display: flex; flex-direction: column; gap: 0.6rem; }

        .asha-card {
          display: flex; gap: 0;
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .asha-card:hover {
          border-color: var(--brand-teal);
          box-shadow: 0 0 0 1px rgba(43,191,179,0.12);
        }

        .asha-card-img-col {
          width: 100px; min-height: 100px;
          flex-shrink: 0;
          background: var(--bg-surface);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .asha-card-img {
          width: 100%; height: 100%;
          object-fit: contain; padding: 0.5rem;
        }

        .asha-card-info-col {
          flex: 1; min-width: 0;
          padding: 0.65rem 0.7rem 0.65rem 0.65rem;
          display: flex; flex-direction: column; gap: 0.1rem;
        }

        .asha-card-name {
          font-size: 0.85rem; font-weight: 700;
          color: var(--ink); line-height: 1.25;
        }
        .asha-card-series {
          font-family: var(--ff-mono, inherit);
          font-size: 0.6rem; letter-spacing: 0.03em;
          color: var(--ink-35);
        }
        .asha-card-cat {
          font-size: 0.62rem; font-weight: 600;
          color: var(--brand-teal);
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-top: 0.05rem;
        }
        .asha-card-tagline {
          font-size: 0.68rem; color: var(--ink-60);
          line-height: 1.35; margin-top: 0.1rem;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .asha-card-actions {
          display: flex; gap: 0.35rem; margin-top: 0.45rem;
        }
        .asha-card-explore {
          flex: 1; padding: 0.35rem 0.5rem;
          background: var(--brand-teal); color: #06110f;
          border: none; border-radius: 7px; cursor: pointer;
          font-family: inherit; font-size: 0.68rem; font-weight: 600;
          transition: opacity 0.15s;
        }
        .asha-card-explore:hover { opacity: 0.85; }
        .asha-card-inquire {
          flex-shrink: 0; padding: 0.35rem 0.6rem;
          background: transparent; color: var(--ink-60);
          border: 1px solid var(--bg-line); border-radius: 7px; cursor: pointer;
          font-family: inherit; font-size: 0.68rem; font-weight: 500;
          transition: border-color 0.15s, color 0.15s;
        }
        .asha-card-inquire:hover { border-color: var(--brand-teal); color: var(--brand-teal); }

        .asha-detail {
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          border-radius: 12px;
          overflow: hidden;
        }

        .asha-detail-hero {
          position: relative; height: 150px;
          background: var(--bg-surface);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .asha-detail-hero-img {
          width: 100%; height: 100%;
          object-fit: contain; padding: 1rem;
        }
        .asha-detail-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(6,17,15,0.92) 100%);
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0.8rem;
        }
        .asha-detail-cat-badge {
          align-self: flex-start;
          padding: 0.15rem 0.55rem;
          border-radius: 4px;
          background: rgba(43,191,179,0.15);
          color: var(--brand-teal);
          font-size: 0.6rem; font-weight: 600; letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.25rem;
        }
        .asha-detail-name {
          font-size: 1rem; font-weight: 700;
          color: #fff; line-height: 1.2;
        }
        .asha-detail-series {
          font-family: var(--ff-mono, inherit);
          font-size: 0.68rem; letter-spacing: 0.03em;
          color: rgba(255,255,255,0.6); margin-top: 0.05rem;
        }

        .asha-detail-tagline {
          font-size: 0.78rem; color: var(--ink-60);
          line-height: 1.45; padding: 0.7rem 0.8rem 0;
          margin: 0;
        }

        .asha-detail-models {
          padding: 0.7rem 0.8rem;
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .asha-detail-models-label {
          font-size: 0.68rem; font-weight: 600; color: var(--ink-35);
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .asha-detail-model-chips {
          display: flex; flex-wrap: wrap; gap: 0.35rem;
        }
        .asha-detail-model-chip {
          padding: 0.2rem 0.55rem;
          background: rgba(43,191,179,0.08);
          border: 1px solid rgba(43,191,179,0.2);
          border-radius: 5px;
          color: var(--brand-teal);
          font-family: var(--ff-mono, inherit);
          font-size: 0.64rem; font-weight: 500;
        }

        .asha-detail-specs {
          padding: 0 0.8rem 0.6rem;
        }
        .asha-detail-specs-title {
          font-size: 0.68rem; font-weight: 600; color: var(--ink-35);
          text-transform: uppercase; letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .asha-detail-spec-row {
          margin-bottom: 0.55rem;
        }
        .asha-detail-spec-label {
          font-size: 0.7rem; font-weight: 600; color: var(--ink-60);
          margin-bottom: 0.25rem;
        }
        .asha-detail-spec-bars {
          display: flex; flex-direction: column; gap: 0.2rem;
        }
        .asha-detail-spec-bar-row {
          display: flex; align-items: center; gap: 0.4rem;
        }
        .asha-detail-spec-bar-model {
          width: 5rem; flex-shrink: 0;
          font-family: var(--ff-mono, inherit);
          font-size: 0.6rem; color: var(--ink-35);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .asha-detail-spec-bar-track {
          flex: 1; height: 16px;
          background: var(--bg-surface);
          border-radius: 4px; overflow: hidden;
        }
        .asha-detail-spec-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--brand-teal), rgba(43,191,179,0.55));
          border-radius: 4px;
          transition: width 0.45s ease;
        }
        .asha-detail-spec-bar-value {
          width: 4.5rem; flex-shrink: 0;
          font-family: var(--ff-mono, inherit);
          font-size: 0.62rem; font-weight: 600;
          color: var(--ink); text-align: right;
        }

        .asha-detail-cta {
          padding: 0.6rem 0.8rem 0.8rem;
        }
        .asha-detail-inquire-btn {
          width: 100%; padding: 0.55rem;
          background: var(--brand-teal); color: #06110f;
          border: none; border-radius: 8px; cursor: pointer;
          font-family: inherit; font-size: 0.8rem; font-weight: 700;
          transition: opacity 0.15s;
        }
        .asha-detail-inquire-btn:hover { opacity: 0.85; }

        .asha-quick-replies { display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .asha-quick-reply {
          padding: 0.45rem 0.85rem;
          background: var(--bg-raise);
          border: 1px solid rgba(43,191,179,0.35);
          border-radius: 999px; cursor: pointer;
          color: var(--brand-teal);
          font-family: inherit; font-size: 0.78rem; font-weight: 600;
          transition: background 0.15s, border-color 0.15s;
        }
        .asha-quick-reply:hover { background: var(--bg-raise); border-color: var(--brand-teal); }

        .asha-nav-hint { font-size: 0.78rem; color: var(--ink-35); font-style: italic; }
        .asha-typing { display: inline-flex; gap: 0.15rem; align-items: center; padding: 0 0.1rem; }
        .asha-typing span {
          animation: asha-dot-bounce 0.8s ease-in-out infinite;
          font-size: 1.2rem; line-height: 1; color: var(--ink-35);
        }
        .asha-typing span:nth-child(2) { animation-delay: 0.2s; }
        .asha-typing span:nth-child(3) { animation-delay: 0.4s; }

        .asha-compare {
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          border-radius: 10px; padding: 0.75rem 0.85rem;
          display: flex; flex-direction: column; gap: 0.55rem;
        }
        .asha-compare-header { display: flex; gap: 0.9rem; flex-wrap: wrap; }
        .asha-compare-legend {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.72rem; color: var(--ink-60);
        }
        .asha-compare-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--brand-teal); flex-shrink: 0;
        }
        .asha-compare-row { display: flex; flex-direction: column; gap: 0.25rem; }
        .asha-compare-label { font-size: 0.74rem; color: var(--ink-35); }
        .asha-compare-bar-track {
          position: relative; height: 20px; border-radius: 5px;
          background: var(--bg-surface); overflow: hidden;
          display: flex; align-items: center;
        }
        .asha-compare-bar-fill {
          position: absolute; left: 0; top: 0; bottom: 0; width: 100%;
          transform-origin: left center;
          background: var(--brand-teal-dim);
          border-right: 2px solid var(--brand-teal);
          transition: transform 0.4s ease;
        }
        .asha-compare-value {
          position: relative; z-index: 1; font-size: 0.72rem;
          color: var(--ink); padding-left: 0.5rem; font-weight: 600;
        }
        .asha-compare-table-wrap { overflow-x: auto; margin-top: 0.3rem; }
        .asha-compare-table { width: 100%; border-collapse: collapse; font-size: 0.72rem; }
        .asha-compare-table th, .asha-compare-table td {
          text-align: left; padding: 0.35rem 0.5rem;
          border-bottom: 1px solid var(--bg-line);
          color: var(--ink-60); white-space: nowrap;
        }
        .asha-compare-table th { color: var(--ink); font-weight: 600; }

        .asha-input-row {
          display: flex; align-items: flex-end; gap: 0.5rem;
          padding: 0.75rem;
          border-top: 1px solid var(--bg-line);
        }
        .asha-input-row textarea {
          flex: 1; resize: none; max-height: 90px;
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          border-radius: 10px;
          color: var(--ink);
          padding: 0.6rem 0.75rem;
          font-family: inherit; font-size: 0.9rem; outline: none;
        }
        .asha-input-row textarea::placeholder { color: var(--ink-35); }
        .asha-input-row button {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: var(--brand-teal); color: #06110f;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.15s;
        }
        .asha-input-row button:disabled { opacity: 0.4; cursor: default; }

        @keyframes asha-idle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes asha-tooltip-in {
          0% { opacity: 0; transform: translateX(12px) scale(0.92); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes asha-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-4px); }
        }
        @keyframes asha-think-pulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(43,191,179,0.45); }
          50% { box-shadow: 0 8px 48px rgba(43,191,179,0.7), 0 0 0 6px rgba(43,191,179,0.12); }
        }
        @keyframes asha-avatar-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes asha-ring-pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* reply notification badge */
        .asha-reply-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 20px; height: 20px; padding: 0 5px;
          border-radius: 10px; background: #ef4444; color: #fff;
          font-family: var(--ff-body), system-ui, sans-serif;
          font-size: 0.7rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--brand-teal);
          animation: asha-badge-blink 1.2s ease-in-out infinite;
        }
        @keyframes asha-badge-blink {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .asha-launcher--has-reply {
          animation: asha-reply-glow 1.5s ease-in-out infinite !important;
        }
        @keyframes asha-reply-glow {
          0%, 100% { box-shadow: 0 4px 20px rgba(239,68,68,0.4); }
          50% { box-shadow: 0 4px 32px rgba(239,68,68,0.7), 0 0 0 6px rgba(239,68,68,0.15); }
        }

        /* reply popup */
        .asha-reply-popup {
          position: fixed; bottom: 96px; right: 24px; z-index: 9201;
          width: min(380px, calc(100vw - 32px));
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          border-radius: 16px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          overflow: hidden;
          animation: asha-popup-in 0.3s var(--ease-out) both;
          font-family: var(--ff-body), system-ui, sans-serif;
          color-scheme: dark;
        }
        @keyframes asha-popup-in {
          0% { opacity: 0; transform: translateY(12px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .asha-reply-popup__header {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.9rem 1rem;
          border-bottom: 1px solid var(--bg-line);
          background: var(--bg-raise);
        }
        .asha-reply-popup__icon {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(43,191,179,0.15); color: var(--brand-teal);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          animation: asha-popup-icon-pulse 2s ease-in-out infinite;
        }
        @keyframes asha-popup-icon-pulse {
          0%, 100% { background: rgba(43,191,179,0.15); }
          50% { background: rgba(43,191,179,0.25); }
        }
        .asha-reply-popup__header-text { flex: 1; min-width: 0; }
        .asha-reply-popup__title {
          color: var(--ink); font-weight: 700; font-size: 0.88rem;
          line-height: 1.2;
        }
        .asha-reply-popup__type {
          color: var(--ink-35); font-size: 0.72rem; margin-top: 0.15rem;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .asha-reply-popup__close {
          width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
          background: transparent; border: none; cursor: pointer;
          color: var(--ink-35); display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .asha-reply-popup__close:hover { background: rgba(255,255,255,0.08); color: var(--ink); }
        .asha-reply-popup__body {
          padding: 1rem;
          max-height: 160px; overflow-y: auto;
        }
        .asha-reply-popup__body p {
          margin: 0; font-size: 0.88rem; line-height: 1.6;
          color: var(--ink-60);
        }
        .asha-reply-popup__actions {
          display: flex; gap: 0.5rem; padding: 0.75rem 1rem;
          border-top: 1px solid var(--bg-line);
        }
        .asha-reply-popup__btn {
          flex: 1; padding: 0.6rem 0.75rem; border-radius: 8px;
          border: 1px solid var(--bg-line); background: var(--bg-raise);
          font-family: var(--ff-body), system-ui, sans-serif;
          font-size: 0.8rem; font-weight: 600; cursor: pointer;
          color: var(--ink-60); transition: all 0.15s;
        }
        .asha-reply-popup__btn:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
        .asha-reply-popup__btn--primary {
          background: var(--brand-teal); color: #06110f; border-color: var(--brand-teal);
        }
        .asha-reply-popup__btn--primary:hover { background: #3dd6ca; }

        @media (max-width: 480px) {
          .asha-panel, .asha-panel--expanded {
            right: 16px; bottom: 88px;
            width: calc(100vw - 32px); height: calc(100vh - 160px);
          }
          .asha-launcher { right: 16px; bottom: 16px; }
          .asha-reply-popup { right: 16px; bottom: 88px; width: calc(100vw - 32px); }
          .asha-tooltip {
            left: 16px; right: 16px; bottom: 86px;
            width: auto;
          }
          .asha-tooltip-text {
            white-space: normal; width: 100%;
          }
          .asha-tooltip-arrow { display: none; }
        }
      `}</style>
    </>
  );
}
