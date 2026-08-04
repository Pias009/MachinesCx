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
      setDdPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
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
          display: flex; align-items: center; justify-content: center; gap: 0.3rem;
          height: 36px; padding: 0 0.65rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer;
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.82);
          transition: background .18s, border-color .18s, color .18s;
        }
        .ls-btn:hover { background: rgba(43,191,179,0.12); border-color: var(--brand-teal); color: #fff; }
        .ls-btn svg { width: 8px; height: 8px; flex-shrink: 0; transition: transform .2s ease; opacity: 0.7; }
        .ls--open .ls-btn svg { transform: rotate(180deg); opacity: 1; }

        .ls-dd {
          position: fixed;
          min-width: 150px;
          background: rgba(10,14,26,0.97);
          border: 1px solid rgba(255,255,255,0.1);
          border-top: 2px solid var(--brand-red);
          backdrop-filter: blur(24px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          z-index: 9200;
          padding: 0.35rem;
          animation: lsDdIn 0.18s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes lsDdIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }

        .ls-opt {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          width: 100%; padding: 0.55rem 0.75rem;
          background: none; border: none; cursor: pointer;
          font-family: var(--ff-body); font-size: 0.85rem;
          color: rgba(255,255,255,0.75); text-align: left;
          transition: background 0.14s, color 0.14s;
        }
        .ls-opt:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .ls-opt--on { color: var(--brand-teal); }
        .ls-opt__check { width: 12px; height: 12px; flex-shrink: 0; opacity: 0; }
        .ls-opt--on .ls-opt__check { opacity: 1; }

        [data-theme="light"] .ls-btn {
          background: rgba(13,34,32,0.08);
          border-color: rgba(13,34,32,0.2);
          color: #0d2220;
        }
        [data-theme="light"] .ls-btn:hover { background: rgba(43,191,179,0.1); border-color: var(--brand-teal); color: #0d2220; }
        [data-theme="light"] .ls-dd {
          background: rgba(255,255,255,0.98);
          border-color: rgba(13,34,32,0.1);
        }
        [data-theme="light"] .ls-opt { color: rgba(13,34,32,0.75); }
        [data-theme="light"] .ls-opt:hover { background: rgba(13,34,32,0.05); color: #0d2220; }
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
