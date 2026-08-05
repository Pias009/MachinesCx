"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { openAshaChat, ASHA_STATE_EVENT } from "./ChatWidget";

const DWELL_MS = 10_000;
const SEEN_KEY = "asha_nudge_seen";

function getSeenSlugs(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}
function markSeen(slug: string) {
  const seen = getSeenSlugs();
  seen.add(slug);
  sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
}

/** Mounted once in app/[locale]/layout.tsx. If a visitor sits on a product
 *  detail page for 10s+ without opening chat, ASHA proactively offers to
 *  connect them with an engineer about that specific machine. */
export default function ProactiveNudge() {
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);
  const [machineName, setMachineName] = useState("");
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
    setVisible(false);
    if (timerRef.current) clearTimeout(timerRef.current);

    const parts = pathname.split("/").filter(Boolean);
    const idx = parts.indexOf("products");
    const slug = idx >= 0 ? parts[idx + 2] : undefined;
    if (!slug || getSeenSlugs().has(slug)) return;

    // Fetch the machine name via the same API ChatWidget's machine cards use,
    // instead of importing lib/products.ts directly — that module pulls in
    // the full product catalog JSON (~150KB) at module scope, which this
    // component (mounted on every page) has no reason to carry.
    let cancelled = false;
    fetch(`/api/chat/machines?slugs=${encodeURIComponent(slug)}`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        const name = data.machines?.[0]?.name;
        if (!name) return;
        timerRef.current = setTimeout(() => {
          if (chatOpenRef.current) return;
          setMachineName(name);
          setVisible(true);
          markSeen(slug);
        }, DWELL_MS);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="asha-nudge" role="dialog" aria-live="polite">
      <button className="asha-nudge__close" aria-label="Dismiss" onClick={() => setVisible(false)}>
        <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <p className="asha-nudge__text">
        Hi, I&apos;m ASHA — noticed you&apos;re checking out the <strong>{machineName}</strong>. Want me to connect you with an engineer, or can I help with anything else?
      </p>
      <div className="asha-nudge__actions">
        <button
          className="asha-nudge__btn asha-nudge__btn--primary"
          onClick={() => { setVisible(false); openAshaChat(`I'd like to talk to an engineer about the ${machineName}.`); }}
        >
          Talk to an engineer
        </button>
        <button
          className="asha-nudge__btn"
          onClick={() => { setVisible(false); openAshaChat(); }}
        >
          Ask ASHA something else
        </button>
      </div>
      <style jsx>{`
        .asha-nudge {
          position: fixed; bottom: 96px; right: 24px; z-index: 9198;
          width: min(320px, calc(100vw - 32px));
          background: var(--bg-surface);
          border: 1px solid var(--brand-teal);
          border-radius: 14px;
          padding: 0.9rem 1rem 1rem;
          box-shadow: 0 20px 50px rgba(0,0,0,0.4);
          font-family: var(--ff-body), system-ui, sans-serif;
          color-scheme: dark;
          animation: asha-nudge-in 0.35s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes asha-nudge-in {
          0% { opacity: 0; transform: translateY(14px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .asha-nudge__close {
          position: absolute; top: 0.6rem; right: 0.6rem;
          width: 22px; height: 22px; border-radius: 6px;
          background: transparent; border: none; cursor: pointer;
          color: var(--ink-35); display: flex; align-items: center; justify-content: center;
        }
        .asha-nudge__close:hover { color: var(--ink); }
        .asha-nudge__text {
          margin: 0 1.2rem 0.8rem 0; font-size: 0.86rem; line-height: 1.5; color: var(--ink);
        }
        .asha-nudge__text strong { color: var(--brand-teal); }
        .asha-nudge__actions { display: flex; flex-direction: column; gap: 0.4rem; }
        .asha-nudge__btn {
          padding: 0.55rem 0.7rem; border-radius: 8px; cursor: pointer;
          font-family: inherit; font-size: 0.8rem; font-weight: 600;
          border: 1px solid var(--bg-line); background: var(--bg-raise); color: var(--ink-60);
          transition: border-color 0.15s, color 0.15s;
        }
        .asha-nudge__btn:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
        .asha-nudge__btn--primary {
          background: var(--brand-teal); color: #06110f; border-color: var(--brand-teal);
        }
        .asha-nudge__btn--primary:hover { opacity: 0.88; }
        @media (prefers-reduced-motion: reduce) {
          .asha-nudge { animation: none; }
        }
        @media (max-width: 480px) {
          .asha-nudge { right: 16px; left: 16px; width: auto; bottom: 88px; }
        }
      `}</style>
    </div>
  );
}
