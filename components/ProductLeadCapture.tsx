"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getVisitorSessionId } from "@/lib/clientSession";
import { ASHA_STATE_EVENT } from "./ChatWidget";

const DELAY_MS = 6_000;
const SHOWN_KEY = "lead_popup_shown";
/** Broadcasts open/closed — components/ProactiveNudge.tsx listens so the
 *  two proactive prompts never stack on top of each other. */
export const LEAD_POPUP_STATE_EVENT = "leadpopup:state";

function alreadyShown(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(SHOWN_KEY) === "1";
}
function markShown() {
  localStorage.setItem(SHOWN_KEY, "1");
}
function broadcast(open: boolean) {
  window.dispatchEvent(new CustomEvent(LEAD_POPUP_STATE_EVENT, { detail: { open } }));
}

/** Mounted once in app/[locale]/layout.tsx. On any product detail page,
 *  after a short dwell, offers to send more specific machine data in
 *  exchange for an email — shown at most once ever per visitor, whether
 *  they submit or dismiss it. */
export default function ProductLeadCapture() {
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);
  const [machineName, setMachineName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const chatOpenRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onState = (e: Event) => {
      const open = (e as CustomEvent<{ open: boolean }>).detail?.open ?? false;
      chatOpenRef.current = open;
      if (open) setVisible(false);
    };
    window.addEventListener(ASHA_STATE_EVENT, onState);
    return () => window.removeEventListener(ASHA_STATE_EVENT, onState);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (alreadyShown()) return;

    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("products");
    const slug = idx >= 0 ? parts[idx + 2] : undefined;
    if (!slug) return;

    let cancelled = false;
    fetch(`/api/chat/machines?slugs=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        const name = data.machines?.[0]?.name;
        if (!name) return;
        timerRef.current = setTimeout(() => {
          if (chatOpenRef.current || alreadyShown()) return;
          setMachineName(name);
          setVisible(true);
          broadcast(true);
        }, DELAY_MS);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  function close() {
    setVisible(false);
    markShown();
    broadcast(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const res = await fetch("/api/lead-capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getVisitorSessionId(), email: email.trim(), machineName }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("sent");
      markShown();
      setTimeout(() => { setVisible(false); broadcast(false); }, 2600);
    } catch {
      setStatus("error");
    }
  }

  if (!visible) return null;

  return (
    <div className="plc-overlay" onClick={close} role="presentation">
      <div className="plc-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Get more details on this machine">
        <button className="plc-close" onClick={close} aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>

        {status === "sent" ? (
          <div className="plc-sent">
            <div className="plc-sent__icon">✓</div>
            <p className="plc-sent__text">Thanks — we&apos;ll be in touch with more on the <strong>{machineName}</strong> shortly.</p>
          </div>
        ) : (
          <>
            <h3 className="plc-title">Want the full picture on the <span>{machineName}</span>?</h3>
            <p className="plc-body">
              Let us send you more specific data on this machine, and get you in touch with one of our trained engineers who can walk you through it directly.
            </p>
            <form className="plc-form" onSubmit={submit}>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status === "sending"}
                aria-label="Your email"
              />
              <button type="submit" disabled={status === "sending" || !email.trim()}>
                {status === "sending" ? "Sending…" : "Send me the details"}
              </button>
            </form>
            {status === "error" && <p className="plc-error">Something went wrong — try again in a moment.</p>}
            <p className="plc-privacy">We&apos;ll only use this to follow up about this machine.</p>
          </>
        )}
      </div>

      <style jsx>{`
        .plc-overlay {
          position: fixed; inset: 0; z-index: 9300;
          background: rgba(4,10,9,0.6);
          -webkit-backdrop-filter: blur(3px);
                  backdrop-filter: blur(3px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.2rem;
          animation: plc-fade-in 0.2s ease both;
        }
        @keyframes plc-fade-in { from { opacity: 0; } to { opacity: 1; } }

        .plc-modal {
          position: relative;
          width: min(380px, 100%);
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          border-radius: 16px;
          padding: 1.6rem 1.5rem 1.4rem;
          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
          font-family: var(--ff-body), system-ui, sans-serif;
          color-scheme: dark;
          animation: plc-pop-in 0.32s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes plc-pop-in {
          0% { opacity: 0; transform: translateY(14px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .plc-close {
          position: absolute; top: 0.85rem; right: 0.85rem;
          width: 26px; height: 26px; border-radius: 7px;
          background: transparent; border: none; cursor: pointer;
          color: var(--ink-35); display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .plc-close:hover { background: rgba(255,255,255,0.06); color: var(--ink); }

        .plc-title {
          margin: 0 1.4rem 0.6rem 0; font-size: 1.08rem; font-weight: 700;
          color: var(--ink); line-height: 1.35;
        }
        .plc-title span { color: var(--brand-teal); }
        .plc-body {
          margin: 0 0 1.1rem; font-size: 0.85rem; line-height: 1.55; color: var(--ink-60);
        }

        .plc-form { display: flex; flex-direction: column; gap: 0.55rem; }
        .plc-form input {
          padding: 0.65rem 0.8rem; border-radius: 9px;
          background: var(--bg-raise); border: 1px solid var(--bg-line);
          color: var(--ink); font-family: inherit; font-size: 0.88rem; outline: none;
        }
        .plc-form input::placeholder { color: var(--ink-35); }
        .plc-form button {
          padding: 0.65rem 0.8rem; border-radius: 9px; cursor: pointer;
          background: var(--brand-teal); color: #06110f; border: none;
          font-family: inherit; font-size: 0.86rem; font-weight: 700;
          transition: opacity 0.15s;
        }
        .plc-form button:disabled { opacity: 0.5; cursor: default; }
        .plc-form button:not(:disabled):hover { opacity: 0.88; }

        .plc-error { margin: 0.6rem 0 0; font-size: 0.76rem; color: #ff6b7d; }
        .plc-privacy { margin: 0.75rem 0 0; font-size: 0.7rem; color: var(--ink-35); }

        .plc-sent { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0.6rem 0.4rem 0.3rem; }
        .plc-sent__icon {
          width: 40px; height: 40px; border-radius: 50%; margin-bottom: 0.7rem;
          display: flex; align-items: center; justify-content: center;
          background: rgba(43,191,179,0.15); color: var(--brand-teal); font-size: 1.1rem;
        }
        .plc-sent__text { margin: 0; font-size: 0.88rem; line-height: 1.5; color: var(--ink-60); }
        .plc-sent__text strong { color: var(--brand-teal); }

        @media (prefers-reduced-motion: reduce) {
          .plc-overlay, .plc-modal { animation: none; }
        }
      `}</style>
    </div>
  );
}
