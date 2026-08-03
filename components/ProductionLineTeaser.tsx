"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";

const SESSION_KEY = "cx_plteaser_dismissed";
const SHOW_AFTER_MS = 2500;

export default function ProductionLineTeaser() {
  const t = useTranslations("productionLineTeaser");
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  // Hidden on the production-line page itself (no point promoting the page
  // you're already on), the admin panel, article pages (its fixed bottom
  // position overlaps real article text at every viewport width — a
  // responsive audit caught it covering spec rows and body paragraphs),
  // and once dismissed for the session.
  const hiddenRoute =
    !pathname ||
    /\/production-line(\/|$)/.test(pathname) ||
    pathname.startsWith("/cx-ops-x7k9q2") ||
    /\/news\/[^/]+$/.test(pathname);

  useEffect(() => {
    if (hiddenRoute) return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, [hiddenRoute]);

  function dismiss() {
    setClosing(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    setTimeout(() => setVisible(false), 300);
  }

  if (hiddenRoute || !visible) return null;

  return (
    <>
      <style suppressHydrationWarning>{`
        .plt {
          position: fixed; left: 0; right: 0; bottom: 0; z-index: 9150;
          display: flex; justify-content: center;
          padding: 0 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
          pointer-events: none;
        }
        .plt__bar {
          pointer-events: auto;
          display: flex; align-items: center; gap: 1rem;
          max-width: 720px; width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--brand-teal);
          border-radius: 1rem;
          padding: .9rem 1rem .9rem 1.25rem;
          box-shadow: 0 20px 60px -20px rgba(0,0,0,.5);
          animation: plt-up .4s cubic-bezier(0.16,1,0.3,1);
        }
        .plt__bar--closing { animation: plt-down .3s cubic-bezier(0.4,0,1,1) forwards; }
        @keyframes plt-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes plt-down { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(24px); } }

        .plt__icon {
          flex-shrink: 0; width: 40px; height: 40px; border-radius: .75rem;
          background: rgba(43,191,179,.12); border: 1px solid rgba(43,191,179,.28);
          display: flex; align-items: center; justify-content: center; color: var(--brand-teal);
        }
        .plt__text { flex: 1; min-width: 0; }
        .plt__title { font-family: var(--ff-display); font-size: .95rem; color: var(--ink); line-height: 1.3; margin: 0; }
        .plt__sub { font-size: .78rem; color: var(--ink-60); line-height: 1.4; margin: .15rem 0 0; }
        .plt__cta {
          flex-shrink: 0;
          padding: .6rem 1.1rem; border-radius: .65rem;
          background: var(--brand-teal); color: #04211e;
          font-family: var(--ff-display); font-size: .85rem; letter-spacing: .01em;
          text-decoration: none; white-space: nowrap;
          transition: background .15s;
        }
        .plt__cta:hover { background: var(--brand-teal-dk); }
        .plt__close {
          flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
          background: none; border: 1px solid var(--bg-line); color: var(--ink-35);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: border-color .15s, color .15s;
        }
        .plt__close:hover { border-color: var(--ink-35); color: var(--ink); }

        @media (max-width: 640px) {
          .plt__bar { flex-wrap: wrap; padding: 1rem; }
          .plt__text { order: 1; flex-basis: 100%; }
          .plt__icon { order: 0; }
          .plt__cta { order: 2; }
          .plt__close { order: 3; }
        }
      `}</style>
      <div className="plt">
        <div className={`plt__bar${closing ? " plt__bar--closing" : ""}`} role="dialog" aria-label={t("title")}>
          <span className="plt__icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <div className="plt__text">
            <p className="plt__title">{t("title")}</p>
            <p className="plt__sub">{t("sub")}</p>
          </div>
          <TransitionLink href="/production-line" className="plt__cta" onClick={dismiss}>
            {t("cta")}
          </TransitionLink>
          <button type="button" className="plt__close" aria-label={t("dismissAria")} onClick={dismiss}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8m0-8l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}
