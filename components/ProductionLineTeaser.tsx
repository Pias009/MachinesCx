"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";

const SESSION_KEY = "cx_plteaser_dismissed";
const SHOW_AFTER_MS = 2500;
const AUTO_HIDE_MS = 5000;

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

  // Auto-hide a few seconds after it appears — same behavior on every
  // screen size, not just mobile.
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(dismiss, AUTO_HIDE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

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
          display: flex; align-items: center; gap: .7rem;
          max-width: 640px; width: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--brand-teal);
          border-radius: .8rem;
          padding: .55rem .6rem .55rem .8rem;
          box-shadow: 0 16px 44px -18px rgba(0,0,0,.5);
          animation: plt-up .4s cubic-bezier(0.16,1,0.3,1);
        }
        .plt__bar--closing { animation: plt-down .3s cubic-bezier(0.4,0,1,1) forwards; }
        @keyframes plt-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes plt-down { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(24px); } }

        .plt__icon {
          flex-shrink: 0; width: 30px; height: 30px; border-radius: .6rem;
          background: rgba(43,191,179,.12); border: 1px solid rgba(43,191,179,.28);
          display: flex; align-items: center; justify-content: center; color: var(--brand-teal);
        }
        .plt__text { flex: 1; min-width: 0; }
        .plt__title { font-family: var(--ff-display); font-size: .82rem; color: var(--ink); line-height: 1.25; margin: 0; }
        .plt__sub { font-size: .7rem; color: var(--ink-60); line-height: 1.35; margin: .1rem 0 0; }
        .plt__cta {
          flex-shrink: 0;
          padding: .42rem .8rem; border-radius: .55rem;
          background: var(--brand-teal); color: #04211e;
          font-family: var(--ff-display); font-size: .76rem; letter-spacing: .01em;
          text-decoration: none; white-space: nowrap;
          transition: background .15s;
        }
        .plt__cta:hover { background: var(--brand-teal-dk); }
        .plt__close {
          flex-shrink: 0; width: 24px; height: 24px; border-radius: 50%;
          background: none; border: 1px solid var(--bg-line); color: var(--ink-35);
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          transition: border-color .15s, color .15s;
        }
        .plt__close:hover { border-color: var(--ink-35); color: var(--ink); }

        @media (max-width: 640px) {
          .plt__bar { flex-wrap: wrap; padding: .65rem .7rem; gap: .5rem; }
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
