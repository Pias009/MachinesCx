"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import {
  MessageSquare, FileText, ShoppingCart, Factory,
  Truck, Wrench, GraduationCap, Headphones,
  type LucideIcon,
} from "lucide-react";

// ─── Step order — copy comes from the clientJourney.steps translation
// namespace, keyed by id. Each step gets its own real icon instead of the
// company logo repeated eight times. ─────────────────────────────
const STEP_IDS = [
  "inquiry",
  "quotation",
  "order",
  "manufacturing",
  "delivery",
  "commissioning",
  "training",
  "aftersales",
] as const;

const STEP_ICONS: Record<(typeof STEP_IDS)[number], LucideIcon> = {
  inquiry: MessageSquare,
  quotation: FileText,
  order: ShoppingCart,
  manufacturing: Factory,
  delivery: Truck,
  commissioning: Wrench,
  training: GraduationCap,
  aftersales: Headphones,
};

const STEP_COLORS = ["var(--brand-teal)", "var(--brand-amber)", "var(--brand-rose)"];

type StepCopy = { label: string; tagline: string; desc: string; metric1v: string; metric1l: string; metric2v: string; metric2l: string };

export default function ClientJourney() {
  const t = useTranslations("clientJourney");
  const stepsCopy = t.raw("steps") as Record<string, StepCopy>;
  const STEPS = STEP_IDS.map((id, i) => {
    const c = stepsCopy[id];
    return {
      id,
      num: String(i + 1).padStart(2, "0"),
      label: c.label,
      tagline: c.tagline,
      desc: c.desc,
      metrics: [{ v: c.metric1v, l: c.metric1l }, { v: c.metric2v, l: c.metric2l }],
      color: STEP_COLORS[i % STEP_COLORS.length],
      Icon: STEP_ICONS[id],
    };
  });

  const sectionRef = useRef<HTMLElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Array<HTMLDivElement | null>>([]);

  // which step's detail is open in the centered overlay — null when closed
  const [activeStep, setActiveStep] = useState<number | null>(null);

  // Esc closes the open overlay, same as clicking outside it
  useEffect(() => {
    if (activeStep === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setActiveStep(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeStep]);

  const active = activeStep !== null ? STEPS[activeStep] : null;

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: #fafafa;
          padding: clamp(8rem,14vw,13rem) 0;
        }
        .cj__wrap {
          max-width: none; margin: 0 auto;
          padding-inline: clamp(1.5rem,7vw,7rem);
        }
        .cj__head {
          margin-bottom: clamp(2.5rem,5vw,4rem);
          text-align: center;
        }
        .cj__label {
          font-family: var(--ff-mono); font-weight: 600; font-size: .72rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: #71717a; margin-bottom: .75rem;
          display: inline-flex; align-items: center; gap: .6rem;
        }
        .cj__title {
          font-family: var(--ff-display); font-weight: 800;
          font-size: clamp(2rem,3.6vw,3.2rem);
          line-height: 1; letter-spacing: -.02em;
          color: #18181b; margin: 0;
        }
        .cj__title em {
          font-style: normal;
          color: var(--brand-teal);
        }

        /* ── all 8 steps sit on one continuous line so the zigzag reads as
           a single clean wave, never broken by a row-wrap ── */
        .cj__row-wrap {
          position: relative;
        }
        .cj__timeline {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: clamp(0.75rem, 2vw, 1.75rem);
          /* room for the zigzag swing below — odd cards ride up, even
             cards drop down, both need slack or they clip against the
             section edge */
          padding-block: clamp(7.5rem, 12vw, 10.5rem);
        }

        .cj__row {
          position: relative;
          flex: 1 1 0;
          min-width: 0;
          max-width: 140px;
          display: flex; flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 1.1rem;
          cursor: pointer;
        }
        /* full up/down zigzag — odd cards ride high above the baseline,
           even cards drop well below it, one continuous wave across the
           whole row */
        .cj__row:nth-child(odd)  { transform: translateY(clamp(-6rem, -10vw, -8rem)); }
        .cj__row:nth-child(even) { transform: translateY(clamp(6rem, 10vw, 8rem)); }

        @media (max-width: 900px) {
          .cj__timeline {
            flex-wrap: nowrap;
            overflow-x: auto;
            justify-content: flex-start;
            scrollbar-width: none;
          }
          .cj__timeline::-webkit-scrollbar { display: none; }
          .cj__row { flex: 0 0 auto; width: 110px; max-width: none; }
        }

        .cj__badge {
          position: relative;
          width: clamp(64px, 7vw, 84px);
          height: clamp(64px, 7vw, 84px);
          border-radius: 18px;
          background: var(--step-color, var(--brand-teal));
          transform: rotate(45deg);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 16px 28px -12px color-mix(in srgb, var(--step-color, var(--brand-teal)) 55%, transparent),
            inset 0 1px 0 rgba(255,255,255,0.25);
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
        }
        .cj__row:hover .cj__badge {
          transform: rotate(45deg) scale(1.06);
          box-shadow:
            0 20px 34px -12px color-mix(in srgb, var(--step-color, var(--brand-teal)) 65%, transparent),
            inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .cj__row:active .cj__badge { transform: rotate(45deg) scale(0.95); }
        .cj__badge-inner {
          transform: rotate(-45deg);
          display: flex; align-items: center; justify-content: center;
        }
        .cj__badge-inner svg {
          width: 72%; height: 72%;
          color: #fff;
        }

        .cj__text { min-width: 0; }
        .cj__num {
          font-family: var(--ff-mono); font-weight: 700; font-size: .68rem;
          letter-spacing: .12em; color: var(--step-color, var(--brand-teal));
          display: block; margin-bottom: .3rem;
        }
        .cj__row-label {
          font-family: var(--ff-display); font-weight: 700; font-size: 0.82rem;
          letter-spacing: -.005em; color: #18181b;
          margin: 0; text-transform: uppercase;
        }

        /* ── centered overlay — click a diamond, its icon + readable text
           fade in as a real modal-style card in the middle of the screen,
           with a dimmed backdrop. Click the backdrop, the close button,
           or the same diamond again (or press Esc) to fade it back out. ── */
        .cj__overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
        }
        .cj__overlay-backdrop {
          position: absolute; inset: 0;
          background: rgba(15,15,17,0.55);
          backdrop-filter: blur(6px);
          opacity: 0;
          animation: cj-fade-in 0.3s ease forwards;
        }
        .cj__overlay-card {
          position: relative;
          width: min(26rem, 100%);
          padding: 2.25rem 2rem 2rem;
          border-radius: 24px;
          background: var(--step-color, var(--brand-teal));
          box-shadow: 0 40px 80px -24px rgba(0,0,0,0.5);
          text-align: center;
          opacity: 0;
          transform: scale(0.92) translateY(10px);
          animation: cj-pop-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes cj-fade-in { to { opacity: 1; } }
        @keyframes cj-pop-in { to { opacity: 1; transform: scale(1) translateY(0); } }

        .cj__overlay-close {
          position: absolute; top: 1rem; right: 1rem;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
          color: #fff;
          border: none; cursor: pointer;
          transition: background 0.15s ease;
        }
        .cj__overlay-close:hover { background: rgba(255,255,255,0.3); }

        .cj__overlay-icon {
          width: 72px; height: 72px;
          margin: 0 auto 1.25rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.16);
          display: flex; align-items: center; justify-content: center;
        }
        .cj__overlay-icon svg { width: 40px; height: 40px; color: #fff; }
        .cj__overlay-num {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(255,255,255,0.75);
          display: block; margin-bottom: 0.4rem;
        }
        .cj__overlay-label {
          font-family: var(--ff-display); font-weight: 700; font-size: 1.4rem;
          letter-spacing: -0.01em; color: #fff;
          margin: 0 0 0.9rem; text-transform: uppercase;
        }
        .cj__overlay-desc {
          margin: 0;
          font-family: var(--ff-body); font-size: 0.98rem;
          line-height: 1.65; color: rgba(255,255,255,0.95);
        }

        @media (prefers-reduced-motion: reduce) {
          .cj__overlay-backdrop, .cj__overlay-card { animation-duration: 0.15s; }
        }

        .cj__row:focus-visible {
          outline: 2px solid var(--step-color, var(--brand-teal));
          outline-offset: 6px;
          border-radius: 12px;
        }

        .cj__footer {
          margin-top: clamp(2.5rem,4vw,3.5rem);
          display: flex; align-items: center; justify-content: center;
          gap: 1.25rem; flex-wrap: wrap;
          text-align: center;
        }
        .cj__footer-text {
          font-family: var(--ff-body); font-size: .85rem;
          color: #71717a;
        }
        .cj__footer-text strong { color: #18181b; font-weight: 600; }
        .cj__cta {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .7rem 1.5rem;
          border-radius: 999px;
          background: #18181b;
          color: #fff;
          font-family: var(--ff-body); font-weight: 500; font-size: .85rem;
          text-decoration: none;
          transition: background 0.15s ease, transform 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .cj__cta:hover { background: #3f3f46; }
        .cj__cta:active { transform: scale(0.98); }

        [data-theme="dark"] .cj { background: #09090b; }
        [data-theme="dark"] .cj__label { color: #a1a1aa; }
        [data-theme="dark"] .cj__title { color: #fafafa; }
        [data-theme="dark"] .cj__row-label { color: #fafafa; }
        [data-theme="dark"] .cj__footer-text { color: #a1a1aa; }
        [data-theme="dark"] .cj__footer-text strong { color: #fafafa; }
        [data-theme="dark"] .cj__cta { background: #fafafa; color: #18181b; }
        [data-theme="dark"] .cj__cta:hover { background: #e4e4e7; }
      `}</style>

      <section className="cj" ref={sectionRef} aria-label={t("sectionAria")}>
        <div className="cj__wrap">
          <div className="cj__head" ref={headRef} data-no-anim>
            <div className="cj__label">{t("eyebrow")}</div>
            <h2 className="cj__title">
              {t("titleLine1")} {t("titleLine2")} <em>{t("titleEm")}</em>
            </h2>
          </div>

          <div className="cj__row-wrap">
            <div className="cj__timeline" role="list" aria-label={t("stepsAria")}>
              {STEPS.map((s, i) => (
                <div
                  className="cj__row"
                  key={s.id}
                  role="listitem"
                  tabIndex={0}
                  ref={el => { rowRefs.current[i] = el; }}
                  data-no-anim
                  onClick={() => setActiveStep(cur => (cur === i ? null : i))}
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveStep(cur => (cur === i ? null : i));
                    }
                  }}
                  aria-haspopup="dialog"
                  aria-expanded={activeStep === i}
                >
                  <div className="cj__badge" style={{ ["--step-color" as string]: s.color }}>
                    <div className="cj__badge-inner">
                      <s.Icon strokeWidth={1.75} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="cj__text">
                    <span className="cj__num">{s.num}</span>
                    <h3 className="cj__row-label">{s.label}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cj__footer">
            <p className="cj__footer-text">
              {t("footerText")}&nbsp;<strong>{t("footerStrong")}</strong>
            </p>
            <TransitionLink href="/inquiries" className="cj__cta">
              {t("cta")}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TransitionLink>
          </div>
        </div>
      </section>

      {/* centered click-to-open overlay — icon + readable full description,
          detached from the diamond's position, dimmed backdrop behind it */}
      {active && (
        <div
          className="cj__overlay"
          role="dialog"
          aria-modal="true"
          aria-label={active.label}
        >
          <div className="cj__overlay-backdrop" onClick={() => setActiveStep(null)} />
          <div className="cj__overlay-card" style={{ ["--step-color" as string]: active.color }}>
            <button
              type="button"
              className="cj__overlay-close"
              onClick={() => setActiveStep(null)}
              aria-label={t("closeAria")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
            <div className="cj__overlay-icon">
              <active.Icon strokeWidth={1.75} aria-hidden="true" />
            </div>
            <span className="cj__overlay-num">{active.num}</span>
            <h3 className="cj__overlay-label">{active.label}</h3>
            <p className="cj__overlay-desc">{active.desc}</p>
          </div>
        </div>
      )}
    </>
  );
}
