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
  | { type: "quick_replies"; options: string[] };

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

/** Compact machine list for a "show_machines" action — small thumbnail, name-led, professional row layout. */
function MachineCards({ slugs, onInquire }: { slugs: string[]; onInquire: (slug: string, name: string) => void }) {
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.image} alt="" className="asha-card-thumb" />
          <Link href={m.href} className="asha-card-info">
            <div className="asha-card-name">{m.name}</div>
            <div className="asha-card-series">{m.series}</div>
          </Link>
          <button className="asha-card-inquire" onClick={() => onInquire(m.slug, m.name)} aria-label={`Inquire about ${m.name}`}>
            Inquire
          </button>
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

interface ActionRendererProps {
  action: ChatAction;
  onInquire: (slug: string, name: string) => void;
  onQuickReply: (option: string) => void;
}

function ActionRenderer({ action, onInquire, onQuickReply }: ActionRendererProps) {
  if (action.type === "navigate") return <NavigateAction slug={action.slug} />;
  if (action.type === "show_machines") return <MachineCards slugs={action.slugs} onInquire={onInquire} />;
  if (action.type === "compare") return <CompareChart slugs={action.slugs} specLabels={action.specLabels} />;
  if (action.type === "quick_replies") return <QuickReplies options={action.options} onPick={onQuickReply} />;
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
  const listRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");

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

  return (
    <>
      <button
        aria-label={open ? `Close ${AGENT_NAME} chat` : `Open ${AGENT_NAME} chat`}
        onClick={() => (open ? setOpen(false) : handleOpen())}
        className={`asha-launcher ${sending ? "asha-launcher--thinking" : ""}`}
      >
        {open ? (
          <X size={24} />
        ) : (
          <HardHat size={26} className={`asha-engineer-icon ${sending ? "asha-engineer-icon--thinking" : ""}`} />
        )}
      </button>

      {showTooltip && (
        <div className="asha-tooltip" onClick={() => { setShowTooltip(false); localStorage.setItem("asha_tooltip_dismissed", "1"); handleOpen(); }}>
          <div className="asha-tooltip-text">Ask <strong>ASHA</strong> — specs, comparisons &amp; pricing</div>
          <div className="asha-tooltip-arrow" />
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
                {m.actions?.map((action, ai) => <ActionRenderer key={ai} action={action} onInquire={onInquire} onQuickReply={onQuickReply} />)}
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

      <style jsx>{`
        .asha-launcher {
          position: fixed; bottom: 24px; right: 24px; z-index: 9200;
          width: 58px; height: 58px; border-radius: 50%;
          background: var(--brand-teal); color: #06110f;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 8px 32px rgba(43,191,179,0.45);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .asha-launcher:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(43,191,179,0.55); }
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

        .asha-cards-loading { font-size: 0.78rem; color: var(--ink-35); padding: 0.2rem 0; }

        .asha-cards {
          display: flex; flex-direction: column; gap: 0.4rem;
        }
        .asha-card {
          display: flex; align-items: center; gap: 0.6rem;
          padding: 0.45rem 0.55rem;
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          border-radius: 8px;
          transition: border-color 0.15s, background 0.15s;
        }
        .asha-card:hover { border-color: var(--brand-teal); }
        .asha-card-thumb {
          width: 34px; height: 34px; object-fit: contain; flex-shrink: 0;
          background: var(--bg-surface); border-radius: 6px; padding: 0.2rem;
        }
        .asha-card-info {
          flex: 1; min-width: 0; text-decoration: none; color: var(--ink);
        }
        .asha-card-name {
          font-size: 0.78rem; font-weight: 600; color: var(--ink); line-height: 1.3;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .asha-card-series {
          font-family: var(--ff-mono, inherit); font-size: 0.64rem;
          letter-spacing: 0.03em; color: var(--ink-35); margin-top: 0.1rem;
        }
        .asha-card-inquire {
          flex-shrink: 0; padding: 0.32rem 0.6rem;
          background: var(--brand-teal); color: #06110f;
          border: none; border-radius: 6px; cursor: pointer;
          font-family: inherit; font-size: 0.68rem; font-weight: 600;
          transition: opacity 0.15s;
        }
        .asha-card-inquire:hover { opacity: 0.8; }

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
          border-radius: 10px; color: var(--ink); padding: 0.6rem 0.75rem;
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

        @media (max-width: 480px) {
          .asha-panel, .asha-panel--expanded {
            right: 16px; bottom: 88px;
            width: calc(100vw - 32px); height: calc(100vh - 160px);
          }
          .asha-launcher { right: 16px; bottom: 16px; }
        }
      `}</style>
    </>
  );
}
