"use client";
import { useEffect, useRef, useState } from "react";
import TransitionLink from "@/components/TransitionLink";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Mail, ClipboardCheck, Factory, Truck, GraduationCap, Headphones
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── Step data with Lucide icons ─────────────────────────
const STEPS = [
  {
    num: "01", label: "Inquiry",       short: "Tell us your needs",
    Icon: Mail,
  },
  {
    num: "02", label: "Order",         short: "Lock your configuration",
    Icon: ClipboardCheck,
  },
  {
    num: "03", label: "Manufacturing", short: "Built in Wenzhou",
    Icon: Factory,
  },
  {
    num: "04", label: "Delivery",      short: "Door-to-door",
    Icon: Truck,
  },
  {
    num: "05", label: "Training",      short: "Your team, fully capable",
    Icon: GraduationCap,
  },
  {
    num: "06", label: "After-Sales",   short: "Lifetime support",
    Icon: Headphones,
  },
];

// ─── Component ───────────────────────────────────────────
export default function ClientJourney() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef   = useRef<(HTMLDivElement | null)[]>([]);
  const lineRef    = useRef<HTMLDivElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const detailRef  = useRef<HTMLDivElement>(null);

  /* ── Entrance animations ── */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(lineRef.current,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 1.4, ease: "expo.out", delay: 0.2,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" } }
      );
      const steps = stepsRef.current.filter(Boolean);
      gsap.fromTo(steps,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.09, delay: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(detailRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", delay: 0.65,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  /* ── Animate detail on step change ── */
  useEffect(() => {
    if (!detailRef.current) return;
    gsap.fromTo(detailRef.current,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.32, ease: "power2.out" }
    );
  }, [active]);

  const step = STEPS[active];
  const StepIcon = step.Icon;

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: #0d1614;
          padding: clamp(5rem,9vw,9rem) 0 clamp(5rem,9vw,8rem);
          overflow: hidden;
        }

        /* Spline 3D bg */
        .cj__spline {
          position: absolute; inset: 0; z-index: 0;
        }
        .cj__spline iframe {
          width: 100%; height: 100%; border: none; display: block;
        }

        /* dark overlay so text stays readable */
        .cj__overlay {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background: rgba(13,22,20,0.62);
        }

        /* engineering grid on top */
        .cj__grid {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background-image:
            linear-gradient(rgba(43,191,179,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,0.04) 1px, transparent 1px);
          background-size: 80px 80px;
        }
        .cj__grid::before {
          content: ""; position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: var(--brand-teal);
        }

        .cj__wrap {
          position: relative; z-index: 3;
          max-width: 1200px; margin: 0 auto;
          padding-inline: clamp(1.5rem,5vw,4rem);
        }

        /* Header */
        .cj__head { text-align: center; margin-bottom: clamp(3rem,6vw,5rem); }
        .cj__title {
          font-family: var(--ff-display);
          font-size: clamp(2.5rem,5vw,4.5rem);
          line-height: .92; color: #fff; letter-spacing: .01em; margin: 0 0 .75rem;
        }
        .cj__title em { font-style: normal; color: var(--brand-teal); }
        .cj__sub {
          font-family: var(--ff-body); font-size: clamp(.88rem,1vw,.95rem);
          color: rgba(255,255,255,.45); line-height: 1.7; max-width: 44ch; margin: 0 auto;
        }

        /* Steps row */
        .cj__steps-wrap { position: relative; margin-bottom: clamp(2.5rem,5vw,4rem); }
        .cj__line {
          position: absolute; top: 38px;
          left: calc(100% / 12); right: calc(100% / 12);
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(43,191,179,0.35) 15%, rgba(43,191,179,0.35) 85%, transparent);
        }
        .cj__steps {
          display: grid; grid-template-columns: repeat(6,1fr);
          gap: 1rem; position: relative; z-index: 1;
        }

        /* Single step */
        .cj__step {
          display: flex; flex-direction: column; align-items: center; gap: .65rem;
          cursor: pointer; padding: .5rem .25rem 1rem;
          transition: transform .22s cubic-bezier(0.16,1,0.3,1);
        }
        .cj__step:hover { transform: translateY(-5px); }

        .cj__step-icon {
          width: 76px; height: 76px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(43,191,179,0.18);
          background: rgba(8,14,13,0.85);
          position: relative;
          transition: border-color .25s, background .25s, box-shadow .25s, color .25s;
          color: rgba(255,255,255,0.38);
          backdrop-filter: blur(8px);
        }
        .cj__step--active .cj__step-icon,
        .cj__step:hover .cj__step-icon {
          border-color: var(--brand-teal);
          background: rgba(43,191,179,0.1);
          box-shadow: 0 0 32px rgba(43,191,179,0.22), inset 0 0 24px rgba(43,191,179,0.07);
          color: var(--brand-teal);
        }
        .cj__step-dot {
          position: absolute; top: -4px; right: -4px;
          width: 10px; height: 10px;
          background: var(--brand-teal);
          opacity: 0; transition: opacity .2s;
          box-shadow: 0 0 10px rgba(43,191,179,0.9);
        }
        .cj__step--active .cj__step-dot { opacity: 1; }

        .cj__step-num {
          font-family: var(--ff-mono); font-size: .48rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: rgba(43,191,179,0.45); transition: color .2s;
        }
        .cj__step--active .cj__step-num,
        .cj__step:hover .cj__step-num { color: var(--brand-teal); }

        .cj__step-label {
          font-family: var(--ff-display); font-size: .82rem;
          letter-spacing: .04em; text-transform: uppercase;
          color: rgba(255,255,255,0.32); text-align: center; line-height: 1.1;
          transition: color .2s;
        }
        .cj__step--active .cj__step-label,
        .cj__step:hover .cj__step-label { color: rgba(255,255,255,0.88); }

        /* Detail panel */
        .cj__detail {
          display: grid; grid-template-columns: 1fr 1fr; gap: 3rem;
          border-top: 1px solid rgba(43,191,179,0.15);
          padding-top: clamp(2rem,4vw,3rem); align-items: center;
        }

        .cj__detail-num {
          font-family: var(--ff-mono); font-size: .52rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: rgba(43,191,179,0.6); margin-bottom: .75rem; display: block;
        }
        .cj__detail-icon {
          width: 96px; height: 96px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid rgba(43,191,179,0.4);
          background: rgba(43,191,179,0.08);
          color: var(--brand-teal);
          margin-bottom: 1.5rem; position: relative;
          box-shadow: 0 0 48px rgba(43,191,179,0.12);
        }
        .cj__detail-icon::before {
          content: ""; position: absolute; inset: -7px;
          border: 1px solid rgba(43,191,179,0.12); pointer-events: none;
        }
        .cj__detail-heading {
          font-family: var(--ff-display);
          font-size: clamp(2rem,4vw,3.2rem);
          color: #fff; line-height: .92; letter-spacing: .01em; margin: 0 0 .6rem;
        }
        .cj__detail-short {
          font-family: var(--ff-body); font-size: .95rem;
          color: rgba(255,255,255,0.48); line-height: 1.6;
        }
        .cj__cta-link {
          display: inline-block; margin-top: 1.5rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: var(--brand-teal);
          border-bottom: 1px solid rgba(43,191,179,0.3);
          padding-bottom: 1px; text-decoration: none;
          transition: border-color .18s;
        }
        .cj__cta-link:hover { border-color: var(--brand-teal); }

        /* Step list (right col) */
        .cj__step-list { display: flex; flex-direction: column; gap: .6rem; }
        .cj__step-row {
          display: flex; align-items: center; gap: .9rem;
          padding: .75rem 1rem;
          border: 1px solid rgba(255,255,255,.05);
          background: rgba(255,255,255,.02);
          cursor: pointer; text-align: left;
          transition: border-color .18s, background .18s;
          backdrop-filter: blur(6px);
        }
        .cj__step-row:hover {
          border-color: rgba(43,191,179,0.28);
          background: rgba(43,191,179,0.05);
        }
        .cj__step-row--active {
          border-color: rgba(43,191,179,0.5) !important;
          background: rgba(43,191,179,0.08) !important;
          border-left-width: 2px !important;
          border-left-color: var(--brand-teal) !important;
        }
        .cj__step-row-icon {
          flex-shrink: 0; color: rgba(255,255,255,.28);
          transition: color .18s;
        }
        .cj__step-row--active .cj__step-row-icon,
        .cj__step-row:hover .cj__step-row-icon { color: var(--brand-teal); }
        .cj__step-row-num {
          font-family: var(--ff-mono); font-size: .46rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: rgba(43,191,179,.5); display: block; margin-bottom: .15rem;
        }
        .cj__step-row-label {
          font-family: var(--ff-display); font-size: .9rem;
          color: rgba(255,255,255,.42); letter-spacing: .04em;
          text-transform: uppercase; display: block; transition: color .18s;
        }
        .cj__step-row--active .cj__step-row-label,
        .cj__step-row:hover .cj__step-row-label { color: rgba(255,255,255,.88); }

        @media (max-width: 720px) {
          .cj__steps { grid-template-columns: repeat(3,1fr); gap: .6rem; }
          .cj__line  { display: none; }
          .cj__detail { grid-template-columns: 1fr; gap: 1.5rem; }
          .cj__step-icon { width: 58px; height: 58px; }
          .cj__detail-icon { width: 72px; height: 72px; }
          .cj__title { font-size: clamp(1.8rem,7vw,3rem); }
          .cj__detail-heading { font-size: clamp(1.6rem,7vw,2.4rem); }
          .cj { padding: clamp(3rem,7vw,5rem) 0; }
        }
        @media (max-width: 480px) {
          .cj__steps { grid-template-columns: repeat(2,1fr); gap: .5rem; }
          .cj__step-icon { width: 50px; height: 50px; }
          .cj__step-label { font-size: .72rem; }
          .cj__step-list { gap: .4rem; }
          .cj__step-row { padding: .6rem .75rem; }
          .cj__title { font-size: clamp(1.6rem,8vw,2.4rem); }
          .cj__sub { font-size: .85rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cj__step, .cj__step-icon, .cj__step-row { transition: none; }
        }

        /* ── Light mode ── */
        [data-theme="light"] .cj { background: #f4fafa; }
        [data-theme="light"] .cj__title  { color: #0d2220; }
        [data-theme="light"] .cj__sub    { color: rgba(13,34,32,0.52); }
        [data-theme="light"] .cj__step-label { color: rgba(13,34,32,0.45); }
        [data-theme="light"] .cj__step--active .cj__step-label,
        [data-theme="light"] .cj__step:hover .cj__step-label { color: #0d2220; }
        [data-theme="light"] .cj__step-icon { background: rgba(13,34,32,0.04); border-color: rgba(43,191,179,0.2); color: rgba(13,34,32,0.4); }
        [data-theme="light"] .cj__step--active .cj__step-icon,
        [data-theme="light"] .cj__step:hover .cj__step-icon { background: rgba(43,191,179,0.08); border-color: var(--brand-teal); color: var(--brand-teal); }
        [data-theme="light"] .cj__detail-heading { color: #0d2220; }
        [data-theme="light"] .cj__detail-short   { color: rgba(13,34,32,0.52); }
        [data-theme="light"] .cj__step-row { background: rgba(13,34,32,0.03); border-color: rgba(13,34,32,0.08); }
        [data-theme="light"] .cj__step-row-label { color: rgba(13,34,32,0.5); }
        [data-theme="light"] .cj__step-row--active .cj__step-row-label,
        [data-theme="light"] .cj__step-row:hover .cj__step-row-label { color: #0d2220; }
        [data-theme="light"] .cj__step-row-icon { color: rgba(13,34,32,0.3); }
        [data-theme="light"] .cj__step-row--active .cj__step-row-icon,
        [data-theme="light"] .cj__step-row:hover .cj__step-row-icon { color: var(--brand-teal); }
      `}</style>

      <section className="cj" ref={sectionRef} aria-label="Our process">

        {/* Original Spline 3D background */}
        <div className="cj__spline" aria-hidden="true">
          <iframe
            src="https://my.spline.design/unchained-d3hHCgdWho7a8ATGzKtB11TU"
            title="decorative"
            loading="lazy"
            tabIndex={-1}
          />
        </div>

        <div className="cj__overlay" aria-hidden="true" />
        <div className="cj__grid"   aria-hidden="true" />

        <div className="cj__wrap">

          {/* Header */}
          <div className="cj__head" ref={headRef}>
            <h2 className="cj__title">
              From inquiry to <em>full production.</em>
            </h2>
            <p className="cj__sub">
              Six stages, one dedicated engineer at every step.
            </p>
          </div>

          {/* Icon row */}
          <div className="cj__steps-wrap">
            <div ref={lineRef} className="cj__line" aria-hidden="true" />
            <div className="cj__steps">
              {STEPS.map((s, i) => (
                <div
                  key={s.num}
                  ref={el => { stepsRef.current[i] = el; }}
                  className={`cj__step${active === i ? " cj__step--active" : ""}`}
                  onClick={() => setActive(i)}
                  role="button" tabIndex={0}
                  aria-label={s.label}
                  onKeyDown={e => e.key === "Enter" && setActive(i)}
                >
                  <div className="cj__step-icon">
                    <s.Icon size={30} strokeWidth={1.4} />
                    <div className="cj__step-dot" aria-hidden="true" />
                  </div>
                  <span className="cj__step-num">{s.num}</span>
                  <span className="cj__step-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detail panel */}
          <div className="cj__detail" ref={detailRef}>

            {/* Left — active step */}
            <div>
              <span className="cj__detail-num">Step {step.num} of {STEPS.length}</span>
              <div className="cj__detail-icon">
                <StepIcon size={44} strokeWidth={1.2} />
              </div>
              <h3 className="cj__detail-heading">{step.label}</h3>
              <p className="cj__detail-short">{step.short}</p>
              <TransitionLink href="/contact" className="cj__cta-link">
                Start your journey →
              </TransitionLink>
            </div>

            {/* Right — step list */}
            <div className="cj__step-list">
              {STEPS.map((s, i) => (
                <button
                  key={s.num}
                  className={`cj__step-row${active === i ? " cj__step-row--active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <div className="cj__step-row-icon">
                    <s.Icon size={20} strokeWidth={1.4} />
                  </div>
                  <div>
                    <span className="cj__step-row-num">{s.num}</span>
                    <span className="cj__step-row-label">{s.label}</span>
                  </div>
                </button>
              ))}
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
