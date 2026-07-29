"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Step order + icons — copy comes from the clientJourney.steps
// translation namespace, keyed by id ─────────────────────────────
const STEP_META = [
  {
    id: "inquiry",
    num: "01",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="26" height="18" rx="1.5" fill="currentColor" fillOpacity=".14" stroke="none"/>
        <rect x="3" y="7" width="26" height="18" rx="1.5"/>
        <path d="M3 9.5l13 9 13-9" fill="currentColor" fillOpacity=".2"/>
        <path d="M22 20l4 4M10 20l-4 4" opacity=".55"/>
      </svg>
    ),
  },
  {
    id: "quotation",
    num: "02",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="3" width="20" height="26" rx="1.5" fill="currentColor" fillOpacity=".14" stroke="none"/>
        <rect x="6" y="3" width="20" height="26" rx="1.5"/>
        <path d="M11 10h10M11 15h10M11 20h6" opacity=".85"/>
        <circle cx="23" cy="22" r="5" fill="currentColor" fillOpacity=".25" stroke="none"/>
        <path d="M20.5 22l1.7 1.7 3.3-3.4" opacity=".9"/>
      </svg>
    ),
  },
  {
    id: "order",
    num: "03",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h14l6 6v18H6z" fill="currentColor" fillOpacity=".14" stroke="none"/>
        <path d="M6 4h14l6 6v18H6z"/>
        <path d="M20 4v6h6" opacity=".7"/>
        <path d="M11 16l3 3 7-7" fill="none"/>
      </svg>
    ),
  },
  {
    id: "manufacturing",
    num: "04",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 26V14l7-5v5l7-5v5l7-5v17" fill="currentColor" fillOpacity=".1" stroke="none"/>
        <path d="M3 26V14l7-5v5l7-5v5l7-5v17"/>
        <path d="M3 26h26" opacity=".85"/>
        <rect x="12" y="19" width="8" height="7" fill="currentColor" fillOpacity=".22" stroke="none"/>
        <rect x="12" y="19" width="8" height="7"/>
        <path d="M7 19h3v4H7z" opacity=".5"/>
        <path d="M22 19h3v4h-3z" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "delivery",
    num: "05",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="11" width="18" height="14" rx="1.5" fill="currentColor" fillOpacity=".14" stroke="none"/>
        <rect x="1" y="11" width="18" height="14" rx="1.5"/>
        <path d="M19 15h7l4 6v4h-11" fill="currentColor" fillOpacity=".1" stroke="currentColor"/>
        <circle cx="7" cy="26" r="2.5" fill="currentColor" fillOpacity=".3"/>
        <circle cx="24" cy="26" r="2.5" fill="currentColor" fillOpacity=".3"/>
        <path d="M10 11V7l6-4" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "commissioning",
    num: "06",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="5" fill="currentColor" fillOpacity=".22"/>
        <path d="M16 3v4M16 25v4M3 16h4M25 16h4"/>
        <path d="M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "training",
    num: "07",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity=".22"/>
        <path d="M4 28v-3a8 8 0 0116 0v3" fill="currentColor" fillOpacity=".1"/>
        <circle cx="25" cy="8" r="3" opacity=".5"/>
        <path d="M22 14l2 2 4-4" opacity=".9"/>
      </svg>
    ),
  },
  {
    id: "aftersales",
    num: "08",
    icon: (
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10a10 10 0 0120 0c0 8-10 18-10 18S6 18 6 10z" fill="currentColor" fillOpacity=".16" stroke="currentColor"/>
        <circle cx="16" cy="10" r="3" fill="currentColor" fillOpacity=".3"/>
        <path d="M10 28h12" opacity=".4"/>
      </svg>
    ),
  },
];

type StepCopy = { label: string; tagline: string; desc: string; metric1v: string; metric1l: string; metric2v: string; metric2l: string };

export default function ClientJourney() {
  const t = useTranslations("clientJourney");
  const stepsCopy = t.raw("steps") as Record<string, StepCopy>;
  const STEPS = STEP_META.map((m) => {
    const c = stepsCopy[m.id];
    return {
      ...m,
      label: c.label,
      tagline: c.tagline,
      desc: c.desc,
      metrics: [{ v: c.metric1v, l: c.metric1l }, { v: c.metric2v, l: c.metric2l }],
    };
  });

  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);
  const rowRefs    = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
      });
      gsap.fromTo(panelRef.current, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, delay: 0.15, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // detail-panel content swap: quick fade/rise whenever the selected
  // step changes, keyed to `active` so it replays every switch
  const detailRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!detailRef.current) return;
    gsap.fromTo(detailRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
  }, [active]);

  const step = STEPS[active];
  const STEP_COLORS = ["var(--brand-teal)", "var(--brand-amber)", "var(--brand-rose)"];
  const stepColor = STEP_COLORS[active % STEP_COLORS.length];

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: #070f0e;
          padding: clamp(4rem,7vw,6rem) 0;
          overflow: hidden;
        }
        .cj::after {
          content: "";
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px; background: linear-gradient(90deg, var(--brand-teal), var(--brand-amber), var(--brand-rose), var(--brand-teal));
          background-size: 200% 100%;
          animation: cj-flow 6s linear infinite;
          z-index: 1;
        }
        @keyframes cj-flow {
          0% { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        .cj::before {
          content: "";
          position: absolute; inset: 0;
          background:
            radial-gradient(circle at 12% 20%, rgba(43,191,179,0.16), transparent 45%),
            radial-gradient(circle at 88% 15%, rgba(245,158,11,0.14), transparent 40%),
            radial-gradient(circle at 50% 100%, rgba(225,29,72,0.12), transparent 45%);
          pointer-events: none;
          z-index: 0;
        }

        .cj__wrap {
          position: relative; z-index: 2;
          max-width: 1280px; margin: 0 auto;
          padding-inline: clamp(1.25rem,4vw,3.5rem);
        }

        .cj__head {
          display: grid; grid-template-columns: 1fr auto;
          gap: 2rem; align-items: flex-end;
          margin-bottom: clamp(2rem,4vw,3rem);
        }
        .cj__label {
          font-family: var(--ff-mono); font-weight: 700; font-size: .72rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--brand-amber); margin-bottom: .75rem;
          display: flex; align-items: center; gap: .7rem;
        }
        .cj__label::before {
          content: ""; display: inline-block;
          width: 1.75rem; height: 3px; border-radius: 2px;
          background: linear-gradient(90deg, var(--brand-teal), var(--brand-amber));
        }
        .cj__title {
          font-family: var(--ff-display); font-weight: 800;
          font-size: clamp(2.4rem,4.4vw,4.2rem);
          line-height: .9; letter-spacing: -.02em;
          color: #fff; margin: 0;
        }
        .cj__title em {
          font-style: normal;
          background: linear-gradient(135deg, var(--brand-teal), var(--brand-amber) 55%, var(--brand-rose));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cj__count {
          font-family: var(--ff-mono); font-weight: 700; font-size: .78rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: #fff;
          border: 1px solid transparent;
          background:
            linear-gradient(#0d1716, #0d1716) padding-box,
            linear-gradient(135deg, var(--brand-teal), var(--brand-amber), var(--brand-rose)) border-box;
          padding: .5rem .9rem;
          white-space: nowrap;
        }
        .cj__count b { color: var(--brand-amber); font-weight: 800; }

        /* ── single fixed-height panel: index left, detail right ── */
        .cj__panel {
          display: grid;
          grid-template-columns: 320px 1fr;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.015);
          box-shadow: 0 30px 60px -30px rgba(0,0,0,0.6);
        }

        .cj__index {
          border-right: 1px solid rgba(255,255,255,0.1);
          max-height: 460px;
          overflow-y: auto;
        }
        .cj__index-row {
          width: 100%;
          display: grid;
          grid-template-columns: 40px 1fr;
          align-items: center;
          gap: .85rem;
          padding: .8rem 1.1rem;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: transparent;
          border-left: 2px solid transparent;
          cursor: pointer;
          text-align: left;
          transition: background .2s, border-color .2s;
        }
        .cj__index-row:last-child { border-bottom: none; }
        .cj__index-row:hover { background: rgba(255,255,255,0.03); }
        .cj__index-row--active {
          background: color-mix(in srgb, var(--step-color, var(--brand-teal)) 12%, transparent);
          border-left-color: var(--step-color, var(--brand-teal));
        }
        .cj__index-num {
          font-family: var(--ff-mono); font-weight: 700; font-size: .74rem;
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 50%;
          width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center;
          transition: color .2s, border-color .2s, background .2s;
        }
        .cj__index-row--active .cj__index-num {
          color: #0d1716;
          border-color: var(--step-color, var(--brand-teal));
          background: var(--step-color, var(--brand-teal));
        }
        .cj__index-text { min-width: 0; }
        .cj__index-label {
          font-family: var(--ff-display); font-weight: 800; font-size: .95rem;
          letter-spacing: .01em; text-transform: uppercase;
          color: rgba(255,255,255,0.82);
          display: block; line-height: 1.2;
          transition: color .2s;
        }
        .cj__index-row--active .cj__index-label { color: #fff; }
        .cj__index-tagline {
          font-family: var(--ff-body); font-weight: 500; font-size: .76rem;
          color: rgba(255,255,255,0.48);
          display: block; margin-top: .15rem;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          transition: color .2s;
        }
        .cj__index-row--active .cj__index-tagline { color: rgba(255,255,255,0.7); }

        .cj__detail {
          padding: clamp(1.75rem,3vw,2.75rem);
          min-height: 460px;
          display: flex; flex-direction: column;
        }
        .cj__detail-top {
          display: flex; align-items: flex-start; gap: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .cj__detail-icon {
          width: 60px; height: 60px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          border-radius: 14px;
          border: 1px solid color-mix(in srgb, var(--step-color, var(--brand-teal)) 45%, transparent);
          background: color-mix(in srgb, var(--step-color, var(--brand-teal)) 16%, transparent);
          color: var(--step-color, var(--brand-teal));
          box-shadow: 0 0 24px -6px color-mix(in srgb, var(--step-color, var(--brand-teal)) 55%, transparent);
        }
        .cj__detail-eyebrow {
          font-family: var(--ff-mono); font-weight: 700; font-size: .68rem;
          letter-spacing: .16em; text-transform: uppercase;
          color: var(--step-color, var(--brand-teal)); margin-bottom: .4rem; display: block;
        }
        .cj__detail-heading {
          font-family: var(--ff-display); font-weight: 800;
          font-size: clamp(1.75rem,2.8vw,2.5rem);
          line-height: .95; letter-spacing: -.01em; color: #fff;
          margin: 0 0 .35rem;
        }
        .cj__detail-tagline {
          font-family: var(--ff-body); font-size: .95rem;
          color: rgba(255,255,255,0.55); margin: 0;
        }
        .cj__detail-desc {
          font-family: var(--ff-body); font-size: .95rem;
          line-height: 1.7; color: rgba(255,255,255,0.65);
          max-width: 52ch; margin: 0 0 auto;
        }
        .cj__detail-metrics {
          display: flex; gap: 0; margin-top: 2rem; padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .cj__metric {
          padding: 0 1.75rem 0 0;
          border-right: 1px solid rgba(255,255,255,0.08);
          margin-right: 1.75rem;
        }
        .cj__metric:last-child { border-right: none; margin-right: 0; }
        .cj__metric-val {
          font-family: var(--ff-display); font-weight: 800;
          font-size: 1.75rem; line-height: 1; letter-spacing: -.01em;
          color: #fff;
        }
        .cj__metric-label {
          font-family: var(--ff-mono); font-weight: 700; font-size: .62rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--step-color, var(--brand-teal)); display: block; margin-top: .35rem;
        }

        .cj__footer {
          margin-top: clamp(2rem,3.5vw,3rem);
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap;
        }
        .cj__footer-text {
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }
        .cj__footer-text strong {
          background: linear-gradient(135deg, var(--brand-teal), var(--brand-amber), var(--brand-rose));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 800;
          font-size: .78rem;
        }
        .cj__cta {
          display: inline-flex; align-items: center; gap: .65rem;
          padding: .85rem 1.9rem;
          border: none; border-radius: 999px;
          background: linear-gradient(135deg, var(--brand-teal), var(--brand-amber));
          color: #0d1716;
          font-family: var(--ff-mono); font-weight: 700; font-size: .68rem;
          letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none;
          box-shadow: 0 8px 24px -8px color-mix(in srgb, var(--brand-amber) 60%, transparent);
          transition: transform .18s, box-shadow .18s, background .3s;
        }
        .cj__cta:hover {
          background: linear-gradient(135deg, var(--brand-amber), var(--brand-rose));
          transform: translateY(-2px);
          box-shadow: 0 12px 30px -8px color-mix(in srgb, var(--brand-rose) 55%, transparent);
        }

        @media (max-width: 860px) {
          .cj__panel { grid-template-columns: 1fr; }
          .cj__index {
            border-right: none; border-bottom: 1px solid rgba(255,255,255,0.1);
            max-height: none;
            display: grid; grid-template-columns: repeat(4, 1fr);
          }
          .cj__index-row {
            grid-template-columns: 1fr; justify-items: center; text-align: center;
            border-bottom: none; border-left: none;
            border-right: 1px solid rgba(255,255,255,0.06);
            padding: .75rem .5rem;
          }
          .cj__index-row:nth-child(4n) { border-right: none; }
          .cj__index-tagline { display: none; }
          .cj__detail { min-height: 0; }
          .cj__detail-top { flex-direction: column; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cj__index-row { transition: none; }
        }

        [data-theme="light"] .cj { background: #f2f9f8; background-image: linear-gradient(rgba(13,34,32,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(13,34,32,0.05) 1px, transparent 1px); }
        [data-theme="light"] .cj__title { color: #0d2220; }
        [data-theme="light"] .cj__count { color: rgba(13,34,32,0.5); border-color: rgba(13,34,32,0.14); }
        [data-theme="light"] .cj__panel { background: #fff; border-color: rgba(13,34,32,0.1); }
        [data-theme="light"] .cj__index { border-color: rgba(13,34,32,0.1); }
        [data-theme="light"] .cj__index-row { border-color: rgba(13,34,32,0.06); }
        [data-theme="light"] .cj__index-num { color: rgba(13,34,32,0.55); border-color: rgba(13,34,32,0.2); }
        [data-theme="light"] .cj__index-label { color: rgba(13,34,32,0.72); }
        [data-theme="light"] .cj__index-row--active .cj__index-label { color: #0d2220; }
        [data-theme="light"] .cj__index-tagline { color: rgba(13,34,32,0.5); }
        [data-theme="light"] .cj__index-row--active .cj__index-tagline { color: rgba(13,34,32,0.75); }
        [data-theme="light"] .cj__detail-heading { color: #0d2220; }
        [data-theme="light"] .cj__detail-tagline { color: rgba(13,34,32,0.6); }
        [data-theme="light"] .cj__detail-desc { color: rgba(13,34,32,0.68); }
        [data-theme="light"] .cj__detail-metrics { border-color: rgba(13,34,32,0.1); }
        [data-theme="light"] .cj__metric { border-color: rgba(13,34,32,0.1); }
        [data-theme="light"] .cj__metric-val { color: #0d2220; }
        [data-theme="light"] .cj__footer-text { color: rgba(13,34,32,0.6); }
        [data-theme="light"] .cj__count { background: linear-gradient(#fff,#fff) padding-box, linear-gradient(135deg, var(--brand-teal), var(--brand-amber), var(--brand-rose)) border-box; color: #0d2220; }
        [data-theme="light"] .cj__cta { color: #0d1716; }
      `}</style>

      <section className="cj" ref={sectionRef} aria-label={t("sectionAria")}>
        <div className="cj__wrap">
          <div className="cj__head" ref={headRef} data-no-anim>
            <div>
              <div className="cj__label">{t("eyebrow")}</div>
              <h2 className="cj__title">
                {t("titleLine1")}<br />{t("titleLine2")} <em>{t("titleEm")}</em>
              </h2>
            </div>
            <div className="cj__count" aria-hidden>
              {t("stagePrefix")} <b>{String(active + 1).padStart(2, "0")}</b> / {STEPS.length}
            </div>
          </div>

          <div className="cj__panel" ref={panelRef} data-no-anim style={{ ["--step-color" as string]: stepColor }}>
            <div className="cj__index" role="tablist" aria-label={t("stepsAria")}>
              {STEPS.map((s, i) => {
                const isActive = active === i;
                return (
                  <button
                    key={s.id}
                    ref={el => { rowRefs.current[i] = el; }}
                    className={`cj__index-row${isActive ? " cj__index-row--active" : ""}`}
                    onClick={() => setActive(i)}
                    role="tab"
                    aria-selected={isActive}
                    style={isActive ? { ["--step-color" as string]: STEP_COLORS[i % STEP_COLORS.length] } : undefined}
                  >
                    <span className="cj__index-num">{s.num}</span>
                    <span className="cj__index-text">
                      <span className="cj__index-label">{s.label}</span>
                      <span className="cj__index-tagline">{s.tagline}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="cj__detail" ref={detailRef} role="tabpanel">
              <div className="cj__detail-top">
                <div className="cj__detail-icon" aria-hidden>{step.icon}</div>
                <div>
                  <span className="cj__detail-eyebrow">{t("stepOfLabel", { num: step.num, total: STEPS.length })}</span>
                  <h3 className="cj__detail-heading">{step.label}</h3>
                  <p className="cj__detail-tagline">{step.tagline}</p>
                </div>
              </div>

              <p className="cj__detail-desc">{step.desc}</p>

              <div className="cj__detail-metrics">
                {step.metrics.map(m => (
                  <div key={m.l} className="cj__metric">
                    <div className="cj__metric-val">{m.v}</div>
                    <span className="cj__metric-label">{m.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="cj__footer">
            <p className="cj__footer-text">
              {t("footerText")}&nbsp;
              <strong>{t("footerStrong")}</strong>
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
    </>
  );
}
