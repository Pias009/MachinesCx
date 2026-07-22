"use client";
import { useEffect, useRef, useState } from "react";
import { familyBySlug } from "@/lib/products";

interface OrderMachine { slug: string; name: string; series: string; model: string; qty: number; notes: string }
interface OrderPart { name: string; machine: string; quantity: number; notes: string }

interface Suggestion {
  type: "add_machine" | "edit_machine_qty" | "edit_machine_notes" | "add_part";
  slug?: string;
  index?: number;
  qty?: number;
  notes?: string;
  name?: string;
  reason: string;
}

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  suggestions?: Suggestion[];
  appliedKeys?: Set<number>; // indices into `suggestions` already applied
}

function suggestionLabel(s: Suggestion): string {
  if (s.type === "add_machine") {
    const fam = familyBySlug(s.slug ?? "");
    return `+ Add ${fam?.name ?? s.slug}`;
  }
  if (s.type === "edit_machine_qty") return `Set quantity to ${s.qty}`;
  if (s.type === "edit_machine_notes") return `Update notes: "${s.notes}"`;
  if (s.type === "add_part") return `+ Add part: ${s.name}`;
  return "Apply";
}

export default function AiReviewChat({
  machines, parts, onAddMachine, onEditMachineQty, onEditMachineNotes, onAddPart, onContinue,
}: {
  machines: OrderMachine[];
  parts: OrderPart[];
  onAddMachine: (slug: string) => void;
  onEditMachineQty: (index: number, qty: number) => void;
  onEditMachineNotes: (index: number, notes: string) => void;
  onAddPart: (name: string) => void;
  onContinue: () => void;
}) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function ask(history: ChatMsg[]) {
    setLoading(true);
    try {
      const res = await fetch("/api/inquiry-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          machines: machines.map(m => ({ slug: m.slug, name: m.name, series: m.series, model: m.model, qty: m.qty, notes: m.notes })),
          parts: parts.map(p => ({ name: p.name, machine: p.machine, quantity: p.quantity, notes: p.notes })),
          history: history.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const j = await res.json();
      if (j.unavailable) setUnavailable(true);
      setMessages(prev => [...prev, { role: "assistant", content: j.text || "…", suggestions: j.suggestions ?? [] }]);
    } catch {
      setUnavailable(true);
      setMessages(prev => [...prev, { role: "assistant", content: "I couldn't reach the review assistant. You can skip this step and continue whenever you're ready." }]);
    } finally {
      setLoading(false);
    }
  }

  function startReview() {
    setStarted(true);
    ask([]);
  }

  function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    ask(next);
  }

  function applySuggestion(msgIdx: number, sugIdx: number, s: Suggestion) {
    if (s.type === "add_machine" && s.slug) onAddMachine(s.slug);
    else if (s.type === "edit_machine_qty" && typeof s.index === "number" && typeof s.qty === "number") onEditMachineQty(s.index, s.qty);
    else if (s.type === "edit_machine_notes" && typeof s.index === "number" && typeof s.notes === "string") onEditMachineNotes(s.index, s.notes);
    else if (s.type === "add_part" && s.name) onAddPart(s.name);

    setMessages(prev => prev.map((m, i) => {
      if (i !== msgIdx) return m;
      const applied = new Set(m.appliedKeys ?? []);
      applied.add(sugIdx);
      return { ...m, appliedKeys: applied };
    }));
  }

  if (!started) {
    return (
      <div className="ci-aichat ci-aichat--intro">
        <div className="ci-aichat__intro-icon">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 11.5c0-1.5 1.5-2.5 3-2.5s3 1 3 2.3c0 1.6-2.2 1.9-2.7 3.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12.4" cy="17.3" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className="ci-aichat__intro-body">
          <h3 className="ci-aichat__intro-title">Want a second opinion before you send this?</h3>
          <p className="ci-aichat__intro-sub">
            Our AI can review your machines and parts, ask a couple of quick questions, and suggest anything you might be missing — accessories, related machines, or spec notes. Totally optional.
          </p>
        </div>
        <div className="ci-aichat__intro-actions">
          <button type="button" className="ci-aichat__start-btn" onClick={startReview}>
            Review with AI →
          </button>
          <button type="button" className="ci-aichat__skip-btn" onClick={onContinue}>
            Skip this step
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ci-aichat">
      <div className="ci-aichat__thread" ref={scrollRef}>
        {messages.map((m, mi) => (
          <div key={mi} className={`ci-aichat__msg ci-aichat__msg--${m.role}`}>
            <div className="ci-aichat__bubble">{m.content}</div>
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="ci-aichat__suggestions">
                {m.suggestions.map((s, si) => {
                  const applied = m.appliedKeys?.has(si);
                  return (
                    <button
                      key={si}
                      type="button"
                      className={`ci-aichat__sug${applied ? " ci-aichat__sug--applied" : ""}`}
                      disabled={applied}
                      onClick={() => applySuggestion(mi, si, s)}
                      title={s.reason}
                    >
                      {applied ? "✓ Added" : suggestionLabel(s)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="ci-aichat__msg ci-aichat__msg--assistant">
            <div className="ci-aichat__bubble ci-aichat__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>

      <div className="ci-aichat__composer">
        <input
          type="text"
          placeholder={unavailable ? "Review assistant unavailable — you can still skip ahead" : "Ask a question or share more detail…"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          disabled={loading}
        />
        <button type="button" className="ci-aichat__send" onClick={send} disabled={loading || !input.trim()} aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12m0 0L9 3m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>

      <div className="ci-aichat__footer">
        <button type="button" className="ci-aichat__continue-btn" onClick={onContinue}>
          Continue to your details →
        </button>
      </div>
    </div>
  );
}
