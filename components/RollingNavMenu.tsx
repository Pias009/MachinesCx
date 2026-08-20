"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import TransitionLink from "@/components/TransitionLink";
import { Info, Newspaper, Factory, Mail } from "lucide-react";

interface NavItem {
  id: string;
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

export default function RollingNavMenu() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [currIndex, setCurrIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [ddPos, setDdPos] = useState<{ top: number; left: number } | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const items: NavItem[] = [
    {
      id: "about",
      href: "/about",
      labelKey: "about",
      icon: <Info className="rnm-opt-icon" />,
    },
    {
      id: "news",
      href: "/news",
      labelKey: "news",
      icon: <Newspaper className="rnm-opt-icon" />,
    },
    {
      id: "production-line",
      href: "/production-line",
      labelKey: "productionLine",
      icon: <Factory className="rnm-opt-icon" />,
    },
    {
      id: "contact",
      href: "/contact",
      labelKey: "contact",
      icon: <Mail className="rnm-opt-icon" />,
    },
  ];

  useEffect(() => {
    setMounted(true);
    const check = () =>
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  // Cycle items one by one every 2.4 seconds
  useEffect(() => {
    if (open) return;

    const interval = setInterval(() => {
      setCurrIndex((prev) => {
        setPrevIndex(prev);
        setAnimating(true);
        return (prev + 1) % items.length;
      });

      setTimeout(() => {
        setAnimating(false);
        setPrevIndex(null);
      }, 450);
    }, 2400);

    return () => clearInterval(interval);
  }, [open, items.length]);

  const updatePos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDdPos({ top: r.bottom + 8, left: Math.max(12, r.left) });
    }
  };

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    updatePos();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  const formatLabel = (key: string) => {
    return t(key);
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        .rnm-wrap { position: relative; flex-shrink: 0; margin-right: 0.25rem; }

        /* ── Trigger button styled 1:1 with LanguageSwitcher (.ls-btn) ── */
        .rnm-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.45rem;
          height: 36px; padding: 0 0.75rem;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--ff-mono, inherit); font-size: 0.72rem; font-weight: 600;
          letter-spacing: 0.05em; text-transform: uppercase;
          color: rgba(255,255,255,0.88);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .rnm-btn:hover, .rnm-wrap--open .rnm-btn {
          background: rgba(43,191,179,0.22);
          border-color: rgba(43,191,179,0.45);
          color: #ffffff;
          box-shadow: 0 0 12px rgba(43,191,179,0.3);
        }
        .rnm-btn svg.rnm-chevron {
          width: 9px; height: 9px; flex-shrink: 0;
          transition: transform .2s ease, opacity .2s ease;
          opacity: 0.85; stroke: currentColor;
        }
        .rnm-wrap--open .rnm-btn svg.rnm-chevron {
          transform: rotate(180deg); opacity: 1;
        }

        /* ── Single-Item Precision Slot Window ── */
        .rnm-roller {
          position: relative;
          height: 20px;
          min-width: 96px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rnm-item-single {
          position: absolute;
          inset: 0;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          white-space: nowrap;
          color: inherit;
          will-change: transform, opacity;
        }

        .rnm-item-single span {
          color: inherit;
        }

        .rnm-item--idle {
          transform: translateY(0);
          opacity: 1;
        }

        .rnm-item--enter {
          animation: rnmSlideIn 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .rnm-item--exit {
          animation: rnmSlideOut 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes rnmSlideIn {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0); opacity: 1; }
        }

        @keyframes rnmSlideOut {
          from { transform: translateY(0); opacity: 1; }
          to   { transform: translateY(-100%); opacity: 0; }
        }

        .rnm-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          color: var(--brand-teal, #2bbfb3);
          flex-shrink: 0;
        }

        .rnm-opt-icon {
          width: 14px;
          height: 14px;
          stroke-width: 2;
        }

        /* ── Dropdown panel styled identically to LanguageSwitcher (.ls-dd) ── */
        .rnm-dd {
          position: fixed;
          min-width: 180px;
          background: var(--glass-bg-raise, rgba(13, 22, 33, 0.96));
          border: 1px solid var(--glass-border, rgba(43, 191, 179, 0.35));
          border-top: 2px solid var(--brand-teal, #2bbfb3);
          border-radius: 10px;
          -webkit-backdrop-filter: blur(var(--glass-blur-lg, 20px)) saturate(var(--glass-sat, 1.6));
                  backdrop-filter: blur(var(--glass-blur-lg, 20px)) saturate(var(--glass-sat, 1.6));
          box-shadow: 0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 var(--glass-highlight, rgba(255,255,255,0.15));
          z-index: 9200;
          padding: 0.4rem;
          animation: rnmDdIn 0.24s var(--ease-fluid, cubic-bezier(0.16, 1, 0.3, 1)) both;
        }
        @keyframes rnmDdIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rnm-dd { animation: none; }
        }

        /* Dropdown options ── */
        .rnm-opt {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          width: 100%; padding: 0.55rem 0.75rem;
          border-radius: 6px;
          background: none; border: none; cursor: pointer;
          font-family: var(--ff-body, inherit); font-size: 0.85rem; font-weight: 500;
          color: rgba(255,255,255,0.85); text-decoration: none; text-align: left;
          transition: background 0.14s, color 0.14s;
          box-sizing: border-box;
        }
        .rnm-opt:hover {
          background: rgba(255,255,255,0.08); color: #ffffff;
        }
        .rnm-opt--on {
          color: var(--brand-teal, #2bbfb3) !important; font-weight: 600;
          background: rgba(43, 191, 179, 0.1);
        }
        .rnm-opt-left {
          display: flex; align-items: center; gap: 0.6rem;
        }
        .rnm-opt__check {
          width: 14px; height: 14px; flex-shrink: 0; opacity: 0; stroke: currentColor;
        }
        .rnm-opt--on .rnm-opt__check { opacity: 1; }

        /* ── LIGHT MODE OVERRIDES: Direct JS State Classes ── */
        .rnm-btn--light {
          background: rgba(13, 34, 32, 0.06) !important;
          border: 1px solid rgba(13, 34, 32, 0.18) !important;
          color: #0d2220 !important;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 1px 3px rgba(0,0,0,0.05) !important;
        }
        .rnm-btn--light *,
        .rnm-btn--light span {
          color: #0d2220 !important;
        }
        .rnm-btn--light .rnm-icon-wrap,
        .rnm-btn--light .rnm-icon-wrap svg {
          color: #1fa39a !important;
          stroke: #1fa39a !important;
        }
        .rnm-btn--light:hover,
        .rnm-wrap--open .rnm-btn--light {
          background: rgba(43,191,179,0.18) !important;
          border-color: rgba(43,191,179,0.45) !important;
          color: #0d2220 !important;
        }
        .rnm-btn--light svg.rnm-chevron {
          opacity: 0.95 !important;
          stroke: #0d2220 !important;
        }

        .rnm-dd--light {
          background: #ffffff !important;
          border: 1px solid rgba(13,34,32,0.18) !important;
          border-top: 2px solid #1fa39a !important;
          box-shadow: 0 12px 32px rgba(13,34,32,0.18) !important;
        }
        .rnm-dd--light .rnm-opt,
        .rnm-dd--light .rnm-opt span {
          color: #0d2220 !important;
          font-weight: 500 !important;
        }
        .rnm-dd--light .rnm-opt:hover {
          background: rgba(43,191,179,0.14) !important;
          color: #0d2220 !important;
        }
        .rnm-dd--light .rnm-opt--on,
        .rnm-dd--light .rnm-opt--on span {
          color: #1fa39a !important;
          font-weight: 700 !important;
        }
        .rnm-dd--light .rnm-opt__check {
          stroke: #1fa39a !important;
        }

        /* Attribute selectors as fallback */
        html[data-theme="light"] .rnm-btn,
        [data-theme="light"] .rnm-btn {
          background: rgba(13, 34, 32, 0.06) !important;
          border: 1px solid rgba(13, 34, 32, 0.18) !important;
          color: #0d2220 !important;
        }
        html[data-theme="light"] .rnm-btn *,
        [data-theme="light"] .rnm-btn * {
          color: #0d2220 !important;
        }
      `}</style>

      <div
        className={`rnm-wrap${open ? " rnm-wrap--open" : ""}`}
        ref={wrapRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          ref={btnRef}
          type="button"
          className={`rnm-btn${isLight ? " rnm-btn--light" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Navigation sections"
        >
          {/* Precision Single-Item Window */}
          <div className="rnm-roller">
            {items.map((item, idx) => {
              const isCurrent = idx === currIndex;
              const isPrevious = idx === prevIndex;
              if (!isCurrent && !isPrevious) return null;

              let stateClass = "rnm-item--idle";
              if (animating) {
                if (isCurrent) stateClass = "rnm-item--enter";
                if (isPrevious) stateClass = "rnm-item--exit";
              }

              return (
                <div key={item.id} className={`rnm-item-single ${stateClass}`}>
                  <span className="rnm-icon-wrap">{item.icon}</span>
                  <span>{formatLabel(item.labelKey)}</span>
                </div>
              );
            })}
          </div>

          <svg className="rnm-chevron" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 1l4 4 4-4" />
          </svg>
        </button>
      </div>

      {/* Portal Dropdown Panel — styled 1:1 like LanguageSwitcher (.ls-dd) */}
      {mounted && open && ddPos && createPortal(
        <div
          className={`rnm-dd${isLight ? " rnm-dd--light" : ""}`}
          role="listbox"
          style={{ top: ddPos.top, left: ddPos.left }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {items.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <TransitionLink
                key={item.id}
                href={item.href}
                className={`rnm-opt${isActive ? " rnm-opt--on" : ""}`}
                onClick={() => setOpen(false)}
              >
                <span className="rnm-opt-left">
                  {item.icon}
                  <span>{formatLabel(item.labelKey)}</span>
                </span>
                <svg
                  className="rnm-opt__check"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 8l3.5 3.5L13 5" />
                </svg>
              </TransitionLink>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}
