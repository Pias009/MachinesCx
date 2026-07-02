"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Step data ────────────────────────────────────────────
const STEPS = [
  {
    id: "inquiry",
    num: "01",
    label: "Inquiry",
    tagline: "Tell us what you need",
    desc: "Send us your film specs, bag type, or print requirements. Our engineers reply within 24 hours with a tailored recommendation.",
    metrics: [{ v: "24h", l: "Response time" }, { v: "Free", l: "Consultation" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="26" height="18" rx="1"/>
        <path d="M3 10l13 8 13-8"/>
        <path d="M22 20l4 4M10 20l-4 4" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "quotation",
    num: "02",
    label: "Quotation",
    tagline: "Exact price, no surprises",
    desc: "You receive a detailed technical quotation with machine spec sheet, power requirements, footprint, and lead time — before any commitment.",
    metrics: [{ v: "72h", l: "Full quote" }, { v: "Fixed", l: "Price guaranteed" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="3" width="20" height="26" rx="1"/>
        <path d="M11 10h10M11 15h10M11 20h6"/>
        <path d="M20 20l2 2 4-4" opacity=".7"/>
      </svg>
    ),
  },
  {
    id: "order",
    num: "03",
    label: "Order",
    tagline: "Lock your configuration",
    desc: "PI signed, deposit received. Your machine enters the production queue with a dedicated build number and factory engineer assigned.",
    metrics: [{ v: "30%", l: "Deposit" }, { v: "Named", l: "Engineer" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 4h14l6 6v18H6z"/>
        <path d="M20 4v6h6"/>
        <path d="M11 16l3 3 7-7"/>
      </svg>
    ),
  },
  {
    id: "manufacturing",
    num: "04",
    label: "Manufacturing",
    tagline: "Built in Wenzhou",
    desc: "Your line is built to order in our ISO 9001 certified factory. Steel cutting, extrusion screw grinding, electrical assembly — all in-house. Video updates on request.",
    metrics: [{ v: "ISO", l: "9001 certified" }, { v: "100%", l: "In-house" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 26V14l7-5v5l7-5v5l7-5v17"/>
        <path d="M3 26h26"/>
        <rect x="12" y="19" width="8" height="7"/>
        <path d="M7 19h3v4H7z" opacity=".5"/>
        <path d="M22 19h3v4h-3z" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "delivery",
    num: "05",
    label: "Delivery",
    tagline: "Door-to-door, worldwide",
    desc: "Seaworthy packaging, full export documentation, and real-time container tracking. We handle customs HS codes. Delivery to 80+ countries.",
    metrics: [{ v: "80+", l: "Countries" }, { v: "Full", l: "Documentation" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="11" width="18" height="14" rx="1"/>
        <path d="M19 15h7l4 6v4h-11"/>
        <circle cx="7" cy="26" r="2.5"/>
        <circle cx="24" cy="26" r="2.5"/>
        <path d="M10 11V7l6-4" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "commissioning",
    num: "06",
    label: "Commissioning",
    tagline: "Running in days, not weeks",
    desc: "Our technician arrives on-site to install, calibrate, and run the first production batch beside your operators. Average installation: 5–8 days.",
    metrics: [{ v: "5–8", l: "Days install" }, { v: "On-site", l: "Technician" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="16" r="5"/>
        <path d="M16 3v4M16 25v4M3 16h4M25 16h4"/>
        <path d="M7.5 7.5l2.8 2.8M21.7 21.7l2.8 2.8M7.5 24.5l2.8-2.8M21.7 10.3l2.8-2.8" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "training",
    num: "07",
    label: "Training",
    tagline: "Your team, fully capable",
    desc: "Hands-on operator training, maintenance schedules, and a full spare-parts kit. Manuals in English and your local language.",
    metrics: [{ v: "2–3", l: "Days training" }, { v: "Manual", l: "Included" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 28v-3a8 8 0 0116 0v3"/>
        <path d="M22 14l2 2 4-4" />
        <circle cx="25" cy="8" r="3" opacity=".5"/>
      </svg>
    ),
  },
  {
    id: "aftersales",
    num: "08",
    label: "After-Sales",
    tagline: "Lifetime support",
    desc: "Remote diagnostics via video call, spare parts dispatched within 48h, and optional annual service contracts. We're with you for the life of the machine.",
    metrics: [{ v: "48h", l: "Parts dispatch" }, { v: "Lifetime", l: "Support" }],
    color: "#2bbfb3",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10a10 10 0 0120 0c0 8-10 18-10 18S6 18 6 10z"/>
        <circle cx="16" cy="10" r="3"/>
        <path d="M10 28h12" opacity=".4"/>
      </svg>
    ),
  },
];

// ─── Animated connection SVG between nodes ────────────────
function PipelineSVG({ count, active }: { count: number; active: number }) {
  return (
    <svg
      viewBox={`0 0 ${(count - 1) * 160} 2`}
      preserveAspectRatio="none"
      style={{ position: "absolute", top: "38px", left: "calc(100%/16)", width: "calc(100% - 100%/8)", height: "2px", zIndex: 0 }}
      aria-hidden
    >
      {/* base track */}
      <line x1="0" y1="1" x2={(count - 1) * 160} y2="1" stroke="rgba(43,191,179,0.12)" strokeWidth="1.5" />
      {/* filled segment up to active */}
      <line
        x1="0" y1="1"
        x2={active * 160}
        y2="1"
        stroke="rgba(43,191,179,0.55)"
        strokeWidth="1.5"
        style={{ transition: "x2 0.4s cubic-bezier(0.16,1,0.3,1)" }}
      />
    </svg>
  );
}

export default function ClientJourney() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const pipeRef    = useRef<HTMLDivElement>(null);
  const detailRef  = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<SVGLineElement>(null);

  // auto-advance every 4s
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % STEPS.length);
    }, 4000);
  };
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  // animate line progress
  useEffect(() => {
    if (!lineRef.current) return;
    const pct = active / (STEPS.length - 1);
    const totalW = (STEPS.length - 1) * 160;
    gsap.to(lineRef.current, { attr: { x2: pct * totalW }, duration: 0.5, ease: "power3.out" });
  }, [active]);

  // entrance
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
      });
      gsap.fromTo(pipeRef.current, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.9, delay: 0.15, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" },
      });
      gsap.fromTo(detailRef.current, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.8, delay: 0.35, ease: "expo.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%", toggleActions: "play none none none" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // detail swap animation
  useEffect(() => {
    if (!detailRef.current) return;
    gsap.fromTo(detailRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" });
  }, [active]);

  const step = STEPS[active];

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: #070f0e;
          padding: clamp(5rem,9vw,9rem) 0 clamp(4rem,8vw,8rem);
          overflow: hidden;
        }

        /* ── bg engineering grid ── */
        .cj::before {
          content: "";
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(43,191,179,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,0.03) 1px, transparent 1px);
          background-size: 72px 72px;
        }
        /* top teal accent */
        .cj::after {
          content: "";
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: var(--brand-teal); z-index: 1;
        }
        /* radial glow */
        .cj__glow {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(ellipse 65% 50% at 50% 0%, rgba(43,191,179,0.07) 0%, transparent 70%);
        }

        .cj__wrap {
          position: relative; z-index: 2;
          max-width: 1400px; margin: 0 auto;
          padding-inline: clamp(1.25rem,4vw,3.5rem);
        }

        /* ── Header ── */
        .cj__head {
          display: grid; grid-template-columns: 1fr auto;
          gap: 2rem; align-items: flex-end;
          margin-bottom: clamp(3rem,6vw,5rem);
        }
        .cj__label {
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .75rem;
          display: flex; align-items: center; gap: .7rem;
        }
        .cj__label::before {
          content: ""; display: inline-block;
          width: 1.75rem; height: 1px; background: var(--brand-teal);
        }
        .cj__title {
          font-family: var(--ff-display);
          font-size: clamp(3.2rem,6vw,6rem);
          line-height: .88; letter-spacing: -.02em;
          color: #fff; margin: 0;
        }
        .cj__title em { font-style: normal; color: var(--brand-teal); }
        .cj__head-right {
          display: flex; flex-direction: column; align-items: flex-end; gap: .5rem;
          padding-bottom: .25rem;
        }
        .cj__count {
          font-family: var(--ff-display); font-size: clamp(3rem,5vw,4.5rem);
          line-height: 1; letter-spacing: -.04em; color: rgba(43,191,179,0.15);
        }
        .cj__count-label {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }

        /* ── Pipeline nodes ── */
        .cj__pipe-wrap {
          position: relative;
          margin-bottom: clamp(2.5rem,5vw,4.5rem);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .cj__pipe-wrap::-webkit-scrollbar { display: none; }
        .cj__pipe {
          display: grid;
          grid-template-columns: repeat(8, 1fr);
          gap: 0;
          min-width: 640px;
          position: relative;
        }

        /* SVG connector line */
        .cj__connector {
          position: absolute;
          top: 38px; left: calc(100%/16); right: calc(100%/16);
          height: 1px; z-index: 0;
          overflow: visible;
        }

        /* single node */
        .cj__node {
          display: flex; flex-direction: column; align-items: center;
          gap: .55rem; padding: .4rem .2rem 1rem;
          cursor: pointer; position: relative; z-index: 1;
          transition: transform .22s cubic-bezier(0.16,1,0.3,1);
        }
        .cj__node:hover { transform: translateY(-6px); }

        /* hexagonal node icon */
        .cj__node-hex {
          width: 76px; height: 76px;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: rgba(8,18,16,0.9);
          border: none;
          color: rgba(255,255,255,0.6);
          transition: color .22s, background .22s;
        }
        .cj__node-hex::before {
          content: "";
          position: absolute; inset: 0;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: rgba(43,191,179,0.0);
          transition: background .22s;
          z-index: -1;
        }
        /* hex border via outline mask */
        .cj__node-hex-border {
          position: absolute; inset: -2px;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: rgba(43,191,179,0.15);
          z-index: -2;
          transition: background .22s;
        }

        .cj__node--active .cj__node-hex,
        .cj__node:hover .cj__node-hex {
          color: var(--brand-teal);
          background: rgba(43,191,179,0.12);
        }
        .cj__node--active .cj__node-hex::before,
        .cj__node:hover .cj__node-hex::before {
          background: rgba(43,191,179,0.08);
        }
        .cj__node--active .cj__node-hex-border,
        .cj__node:hover .cj__node-hex-border {
          background: rgba(43,191,179,0.7);
        }

        /* active pulse ring */
        .cj__node-pulse {
          position: absolute; inset: -8px;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: rgba(43,191,179,0.08);
          opacity: 0; z-index: -3;
          animation: cj-pulse 2s ease-in-out infinite;
        }
        .cj__node--active .cj__node-pulse { opacity: 1; }
        @keyframes cj-pulse {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.08); opacity: 0; }
        }

        .cj__node-num {
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: rgba(43,191,179,0.55); transition: color .2s;
        }
        .cj__node--active .cj__node-num,
        .cj__node:hover .cj__node-num { color: var(--brand-teal); }

        .cj__node-label {
          font-family: var(--ff-display); font-size: .78rem;
          letter-spacing: .04em; text-transform: uppercase;
          color: rgba(255,255,255,0.7); text-align: center;
          line-height: 1.2; transition: color .2s;
        }
        .cj__node--active .cj__node-label,
        .cj__node:hover .cj__node-label { color: #fff; }

        /* progress bar under pipeline */
        .cj__progress-track {
          height: 2px; background: rgba(255,255,255,0.06);
          margin-top: 1rem; position: relative; overflow: hidden;
        }
        .cj__progress-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: var(--brand-teal);
          transform-origin: left;
          transition: transform .5s cubic-bezier(0.16,1,0.3,1);
        }

        /* ── Detail panel ── */
        .cj__detail {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1px;
          background: rgba(43,191,179,0.08);
          border: 1px solid rgba(43,191,179,0.1);
        }

        /* col 1 — big icon + step info */
        .cj__col-icon {
          background: #070f0e;
          padding: clamp(2rem,4vw,3rem);
          display: flex; flex-direction: column;
          justify-content: space-between;
          min-height: 280px;
        }
        .cj__col-badge {
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--brand-teal);
          display: flex; align-items: center; gap: .55rem;
          margin-bottom: 1.5rem;
        }
        .cj__col-badge span { width: 1.2rem; height: 1px; background: var(--brand-teal); display: inline-block; }
        .cj__big-icon {
          width: 96px; height: 96px;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: rgba(43,191,179,0.12);
          color: var(--brand-teal);
          position: relative; margin-bottom: 1.5rem;
          box-shadow: 0 0 48px rgba(43,191,179,0.2);
        }
        .cj__step-heading {
          font-family: var(--ff-display);
          font-size: clamp(2.2rem,3.5vw,3.5rem);
          line-height: .9; letter-spacing: -.02em; color: #fff;
          margin: 0 0 .65rem;
        }
        .cj__step-tagline {
          font-family: var(--ff-body); font-size: 1rem;
          color: rgba(255,255,255,.65); line-height: 1.6;
          font-weight: 500;
        }

        /* col 2 — description + metrics */
        .cj__col-desc {
          background: #070f0e;
          padding: clamp(2rem,4vw,3rem);
          display: flex; flex-direction: column;
          justify-content: space-between;
        }
        .cj__step-desc {
          font-family: var(--ff-body);
          font-size: clamp(1rem,1.25vw,1.1rem);
          color: rgba(255,255,255,.72); line-height: 1.85;
          margin: 0 0 2rem;
        }
        .cj__metrics {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: rgba(43,191,179,0.08);
        }
        .cj__metric {
          background: rgba(43,191,179,0.05);
          padding: 1.1rem 1.25rem;
        }
        .cj__metric-val {
          font-family: var(--ff-display);
          font-size: clamp(1.8rem,3vw,2.5rem);
          line-height: 1; letter-spacing: -.02em; color: #fff;
        }
        .cj__metric-label {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: rgba(43,191,179,.75); margin-top: .35rem;
          display: block;
        }

        /* col 3 — step list navigation */
        .cj__col-nav {
          background: #070f0e;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .cj__nav-item {
          display: flex; align-items: center; gap: .85rem;
          padding: .85rem 1.25rem;
          border-bottom: 1px solid rgba(43,191,179,0.07);
          cursor: pointer; background: transparent;
          transition: background .18s;
          text-align: left; width: 100%;
          border-left: 2px solid transparent;
          transition: background .15s, border-color .15s;
        }
        .cj__nav-item:last-child { border-bottom: none; }
        .cj__nav-item:hover {
          background: rgba(43,191,179,0.04);
          border-left-color: rgba(43,191,179,0.35);
        }
        .cj__nav-item--active {
          background: rgba(43,191,179,0.07) !important;
          border-left-color: var(--brand-teal) !important;
        }
        .cj__nav-icon {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: rgba(43,191,179,0.06);
          color: rgba(255,255,255,0.55);
          flex-shrink: 0;
          transition: background .18s, color .18s;
        }
        .cj__nav-item--active .cj__nav-icon,
        .cj__nav-item:hover .cj__nav-icon {
          background: rgba(43,191,179,0.18);
          color: var(--brand-teal);
        }
        .cj__nav-num {
          font-family: var(--ff-mono); font-size: 0.66rem;
          letter-spacing: .16em; text-transform: uppercase;
          color: rgba(43,191,179,.6); display: block;
        }
        .cj__nav-label {
          font-family: var(--ff-display); font-size: 1rem;
          letter-spacing: .02em; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          transition: color .15s; display: block;
        }
        .cj__nav-item--active .cj__nav-label,
        .cj__nav-item:hover .cj__nav-label { color: #fff; }

        /* ── Footer CTA ── */
        .cj__footer {
          margin-top: 2.5rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap;
        }
        .cj__footer-text {
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }
        .cj__footer-text strong { color: var(--brand-teal); font-size: .78rem; }
        .cj__cta {
          display: inline-flex; align-items: center; gap: .65rem;
          padding: .8rem 1.75rem;
          border: 1px solid rgba(43,191,179,0.35);
          color: var(--brand-teal);
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none;
          transition: background .18s, border-color .18s;
        }
        .cj__cta:hover {
          background: rgba(43,191,179,0.08);
          border-color: var(--brand-teal);
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .cj__detail { grid-template-columns: 1fr 1fr; }
          .cj__col-nav { grid-column: span 2; flex-direction: row; flex-wrap: wrap; }
          .cj__nav-item { flex: 1; min-width: 140px; border-bottom: none; border-top: 1px solid rgba(43,191,179,0.07); }
        }
        @media (max-width: 720px) {
          .cj__head { grid-template-columns: 1fr; }
          .cj__head-right { display: none; }
          .cj__detail { grid-template-columns: 1fr; }
          .cj__col-nav { flex-direction: column; }
          .cj__nav-item { min-width: auto; }
          .cj__pipe { grid-template-columns: repeat(4,1fr); }
        }
        @media (max-width: 480px) {
          .cj__pipe { grid-template-columns: repeat(4,1fr); }
          .cj__node-hex { width: 56px; height: 56px; }
          .cj__connector { top: 28px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .cj__node-pulse { animation: none; }
          .cj__node { transition: none; }
        }

        /* ── Light mode ── */
        [data-theme="light"] .cj { background: #f2f9f8; }
        [data-theme="light"] .cj__title { color: #0d2220; }
        [data-theme="light"] .cj__title em { color: var(--brand-teal); }
        [data-theme="light"] .cj__col-icon,
        [data-theme="light"] .cj__col-desc,
        [data-theme="light"] .cj__col-nav { background: #fff; }
        [data-theme="light"] .cj__step-heading { color: #0d2220; }
        [data-theme="light"] .cj__step-tagline { color: rgba(13,34,32,0.7); }
        [data-theme="light"] .cj__step-desc { color: rgba(13,34,32,0.72); }
        [data-theme="light"] .cj__metric { background: rgba(43,191,179,0.05); }
        [data-theme="light"] .cj__metric-val { color: #0d2220; }
        [data-theme="light"] .cj__node-label { color: rgba(13,34,32,0.65); }
        [data-theme="light"] .cj__node--active .cj__node-label,
        [data-theme="light"] .cj__node:hover .cj__node-label { color: #0d2220; }
        [data-theme="light"] .cj__nav-label { color: rgba(13,34,32,0.65); }
        [data-theme="light"] .cj__nav-item--active .cj__nav-label,
        [data-theme="light"] .cj__nav-item:hover .cj__nav-label { color: #0d2220; }
        [data-theme="light"] .cj__nav-item { border-color: rgba(13,34,32,.07); }
        [data-theme="light"] .cj__footer-text { color: rgba(13,34,32,0.6); }
      `}</style>

      <section className="cj" ref={sectionRef} aria-label="Our process — inquiry to production">
        <div className="cj__glow" aria-hidden />

        <div className="cj__wrap">

          {/* ── Header ── */}
          <div className="cj__head" ref={headRef}>
            <div>
              <div className="cj__label">End-to-end process</div>
              <h2 className="cj__title">
                From inquiry<br />to <em>full production.</em>
              </h2>
            </div>
            <div className="cj__head-right" aria-hidden>
              <span className="cj__count">08</span>
              <span className="cj__count-label">Stages</span>
            </div>
          </div>

          {/* ── Pipeline ── */}
          <div className="cj__pipe-wrap" ref={pipeRef}>
            <div className="cj__pipe">

              {/* SVG connector */}
              <svg
                viewBox="0 0 1120 2"
                preserveAspectRatio="none"
                aria-hidden
                style={{
                  position: "absolute", top: "38px",
                  left: "calc(100%/16)", width: "calc(100% - 12.5%)",
                  height: "2px", zIndex: 0, overflow: "visible",
                }}
              >
                <line x1="0" y1="1" x2="1120" y2="1" stroke="rgba(43,191,179,0.1)" strokeWidth="1.5" strokeDasharray="4 4"/>
                <line ref={lineRef} x1="0" y1="1" x2="0" y2="1" stroke="rgba(43,191,179,0.6)" strokeWidth="1.5"/>
              </svg>

              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`cj__node${active === i ? " cj__node--active" : ""}`}
                  onClick={() => { setActive(i); startTimer(); }}
                  role="button" tabIndex={0}
                  aria-label={s.label}
                  onKeyDown={e => e.key === "Enter" && setActive(i)}
                >
                  <div className="cj__node-hex">
                    <div className="cj__node-hex-border" />
                    <div className="cj__node-pulse" aria-hidden />
                    {s.icon}
                  </div>
                  <span className="cj__node-num">{s.num}</span>
                  <span className="cj__node-label">{s.label}</span>
                </div>
              ))}
            </div>

            {/* progress bar */}
            <div className="cj__progress-track">
              <div
                className="cj__progress-fill"
                style={{ transform: `scaleX(${(active + 1) / STEPS.length})` }}
              />
            </div>
          </div>

          {/* ── Detail panel ── */}
          <div className="cj__detail" ref={detailRef}>

            {/* Col 1 — icon + title */}
            <div className="cj__col-icon">
              <div>
                <div className="cj__col-badge">
                  <span />
                  Step {step.num} of {STEPS.length}
                </div>
                <div className="cj__big-icon" aria-hidden>
                  {step.icon}
                </div>
                <h3 className="cj__step-heading">{step.label}</h3>
                <p className="cj__step-tagline">{step.tagline}</p>
              </div>
            </div>

            {/* Col 2 — description + metrics */}
            <div className="cj__col-desc">
              <p className="cj__step-desc">{step.desc}</p>
              <div className="cj__metrics">
                {step.metrics.map(m => (
                  <div key={m.l} className="cj__metric">
                    <div className="cj__metric-val">{m.v}</div>
                    <span className="cj__metric-label">{m.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 3 — step nav list */}
            <div className="cj__col-nav">
              {STEPS.map((s, i) => (
                <button
                  key={s.id}
                  className={`cj__nav-item${active === i ? " cj__nav-item--active" : ""}`}
                  onClick={() => { setActive(i); startTimer(); }}
                >
                  <div className="cj__nav-icon" aria-hidden>
                    {s.icon}
                  </div>
                  <div>
                    <span className="cj__nav-num">{s.num}</span>
                    <span className="cj__nav-label">{s.label}</span>
                  </div>
                </button>
              ))}
            </div>

          </div>

          {/* ── Footer ── */}
          <div className="cj__footer">
            <p className="cj__footer-text">
              Ready when you are —&nbsp;
              <strong>engineers available 24/7</strong>
            </p>
            <Link href="/contact" className="cj__cta">
              Start your inquiry
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
