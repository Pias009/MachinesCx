"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const t = useTranslations("languageSwitcher");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [ddPos, setDdPos] = useState<{ top: number; right: number } | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        wrapRef.current && !wrapRef.current.contains(e.target as Node) &&
        !(e.target as Element)?.closest?.(".ls-dd")
      ) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // .sn (the nav bar) has overflow:hidden AND backdrop-filter — the latter
  // creates a containing block that traps position:fixed descendants, so
  // even "fixed" positioning alone isn't enough. Portal to <body> and
  // anchor via a measured rect, same reason the category mega-menu in
  // SiteNav renders as a sibling outside .sn.
  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const rightPos = window.innerWidth - r.right;
      const safeRight = Math.max(12, Math.min(rightPos, window.innerWidth - 170));
      setDdPos({ top: r.bottom + 8, right: safeRight });
    }
    setOpen(v => !v);
  };

  const switchTo = (next: Locale) => {
    setOpen(false);
    router.replace(pathname, { locale: next });
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .ls { position: relative; flex-shrink: 0; }
        .ls-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          height: 36px; padding: 0 0.75rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--ff-mono); font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.88);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .ls-btn:hover, .ls--open .ls-btn {
          background: rgba(43,191,179,0.22);
          border-color: rgba(43,191,179,0.45);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(43,191,179,0.3);
        }
        .ls-btn svg { width: 9px; height: 9px; flex-shrink: 0; transition: transform .2s ease, opacity .2s ease; opacity: 0.85; stroke: currentColor; }
        .ls--open .ls-btn svg { transform: rotate(180deg); opacity: 1; }

        .ls-dd {
          position: fixed;
          min-width: 160px;
          background: var(--glass-bg-raise);
          border: 1px solid var(--glass-border);
          border-top: 2px solid var(--brand-teal);
          border-radius: 10px;
          -webkit-backdrop-filter: blur(var(--glass-blur-lg)) saturate(var(--glass-sat));
                  backdrop-filter: blur(var(--glass-blur-lg)) saturate(var(--glass-sat));
          box-shadow: 0 12px 32px rgba(0,0,0,0.35), inset 0 1px 0 var(--glass-highlight);
          z-index: 9200;
          padding: 0.4rem;
          animation: lsDdIn 0.24s var(--ease-fluid) both;
        }
        @keyframes lsDdIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); filter: blur(3px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
        @media (prefers-reduced-motion: reduce) {
          .ls-dd { animation: none; }
        }

        .ls-opt {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          width: 100%; padding: 0.55rem 0.75rem;
          border-radius: 6px;
          background: none; border: none; cursor: pointer;
          font-family: var(--ff-body); font-size: 0.85rem; font-weight: 500;
          color: rgba(255,255,255,0.85); text-align: left;
          transition: background 0.14s, color 0.14s;
        }
        .ls-opt:hover { background: rgba(255,255,255,0.08); color: #ffffff; }
        .ls-opt--on { color: var(--brand-teal) !important; font-weight: 600; }
        .ls-opt__check { width: 14px; height: 14px; flex-shrink: 0; opacity: 0; stroke: currentColor; }
        .ls-opt--on .ls-opt__check { opacity: 1; }

        /* Light mode overrides — high-contrast dark text */
        [data-theme="light"] .ls-btn {
          background: rgba(13, 34, 32, 0.06) !important;
          border: 1px solid rgba(13, 34, 32, 0.18) !important;
          color: #0d2220 !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0,0,0,0.05);
        }
        [data-theme="light"] .ls-btn:hover,
        [data-theme="light"] .ls--open .ls-btn {
          background: rgba(43,191,179,0.18) !important;
          border-color: rgba(43,191,179,0.45) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .ls-btn svg {
          opacity: 0.95 !important;
          stroke: #0d2220 !important;
        }

        [data-theme="light"] .ls-dd {
          background: #ffffff !important;
          border: 1px solid rgba(13,34,32,0.18) !important;
          border-top: 2px solid var(--brand-teal-dk) !important;
          box-shadow: 0 12px 32px rgba(13,34,32,0.18) !important;
        }
        [data-theme="light"] .ls-opt {
          color: #0d2220 !important;
          font-weight: 500 !important;
        }
        [data-theme="light"] .ls-opt:hover {
          background: rgba(43,191,179,0.14) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .ls-opt--on {
          color: #1fa39a !important;
          font-weight: 700 !important;
        }
        [data-theme="light"] .ls-opt__check {
          stroke: #1fa39a !important;
        }
      `}</style>

      <div className={`ls${open ? " ls--open" : ""}`} ref={wrapRef}>
        <button
          ref={btnRef}
          type="button"
          className="ls-btn"
          onClick={toggle}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t("label")}
        >
          {locale.toUpperCase()}
          <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l4 4 4-4" />
          </svg>
        </button>
      </div>

      {mounted && open && ddPos && createPortal(
        <div className="ls-dd" role="listbox" style={{ top: ddPos.top, right: ddPos.right }}>
          {locales.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={l === locale}
              className={`ls-opt${l === locale ? " ls-opt--on" : ""}`}
              onClick={() => switchTo(l)}
            >
              {t(l)}
              <svg className="ls-opt__check" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l3.5 3.5L13 5" />
              </svg>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}
