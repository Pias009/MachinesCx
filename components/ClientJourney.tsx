"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENTS = [
  { hex: "#2bbfb3", name: "teal" },
  { hex: "#f59e0b", name: "amber" },
  { hex: "#e11d48", name: "rose" },
];

function accentFor(i: number) {
  return ACCENTS[i % ACCENTS.length];
}

// ─── Step data ────────────────────────────────────────────
const STEPS = [
  {
    id: "inquiry",
    num: "01",
    label: "Inquiry",
    tagline: "Tell us what you need",
    desc: "Send us your film specs, bag type, or print requirements. Our engineers reply within 24 hours with a tailored recommendation.",
    metrics: [{ v: "24h", l: "Response time" }, { v: "Free", l: "Consultation" }],
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
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 10a10 10 0 0120 0c0 8-10 18-10 18S6 18 6 10z"/>
        <circle cx="16" cy="10" r="3"/>
        <path d="M10 28h12" opacity=".4"/>
      </svg>
    ),
  },
];

export default function ClientJourney() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const pipeRef    = useRef<HTMLDivElement>(null);
  const detailRef  = useRef<HTMLDivElement>(null);
  const lineRef    = useRef<SVGLineElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % STEPS.length);
    }, 4000);
  };
  useEffect(() => { startTimer(); return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  useEffect(() => {
    if (!lineRef.current) return;
    const pct = active / (STEPS.length - 1);
    const totalW = (STEPS.length - 1) * 160;
    gsap.to(lineRef.current, { attr: { x2: pct * totalW }, duration: 0.5, ease: "power3.out" });
  }, [active]);

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

  useEffect(() => {
    if (!detailRef.current) return;
    gsap.fromTo(detailRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.38, ease: "power3.out" });
  }, [active]);

  const step = STEPS[active];
  const curAccent = accentFor(active);

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: #070f0e;
          padding: clamp(5rem,9vw,9rem) 0 clamp(4rem,8vw,8rem);
          overflow: hidden;
        }

        /* Color blobs */
        .cj__blob {
          position: absolute; border-radius: 50%; pointer-events: none;
        }
        .cj__blob--1 {
          width: min(50vw, 600px); height: min(50vw, 600px);
          top: -20%; right: -10%;
          background: radial-gradient(circle, rgba(43,191,179,0.07) 0%, transparent 70%);
          animation: cj-float 16s ease-in-out infinite;
        }
        .cj__blob--2 {
          width: min(35vw, 400px); height: min(35vw, 400px);
          bottom: -5%; left: -5%;
          background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
          animation: cj-float 20s ease-in-out infinite reverse;
        }
        .cj__blob--3 {
          width: min(20vw, 240px); height: min(20vw, 240px);
          top: 40%; left: 40%;
          background: radial-gradient(circle, rgba(225,29,72,0.05) 0%, transparent 70%);
          animation: cj-float 14s ease-in-out infinite 5s;
        }
        @keyframes cj-float {
          0%,100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(20px, -20px) scale(1.04); }
        }

        .cj::after {
          content: "";
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: linear-gradient(90deg, var(--brand-teal), var(--brand-amber), var(--brand-rose));
          z-index: 1;
        }

        .cj__wrap {
          position: relative; z-index: 2;
          max-width: 1400px; margin: 0 auto;
          padding-inline: clamp(1.25rem,4vw,3.5rem);
        }

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
        .cj__title em {
          font-style: normal;
          background: linear-gradient(135deg, var(--brand-teal), var(--brand-amber));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cj__head-right {
          display: flex; flex-direction: column; align-items: flex-end; gap: .5rem;
          padding-bottom: .25rem;
        }
        .cj__count {
          font-family: var(--ff-display); font-size: clamp(3rem,5vw,4.5rem);
          line-height: 1; letter-spacing: -.04em;
          color: rgba(43,191,179,0.12);
        }
        .cj__count-label {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }

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

        .cj__node {
          display: flex; flex-direction: column; align-items: center;
          gap: .55rem; padding: .4rem .2rem 1rem;
          cursor: pointer; position: relative; z-index: 1;
          transition: transform .22s cubic-bezier(0.16,1,0.3,1);
        }
        .cj__node:hover { transform: translateY(-6px); }

        .cj__node-hex {
          width: 76px; height: 76px;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: rgba(8,18,16,0.9);
          color: rgba(255,255,255,0.6);
          transition: color .22s, background .22s;
        }
        .cj__node-hex::before {
          content: "";
          position: absolute; inset: 0;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: color-mix(in srgb, var(--accent) 0%, transparent);
          transition: background .22s;
          z-index: -1;
        }
        .cj__node-hex-border {
          position: absolute; inset: -2px;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          z-index: -2;
          transition: background .22s;
        }

        .cj__node--active .cj__node-hex,
        .cj__node:hover .cj__node-hex {
          color: var(--accent);
          background: color-mix(in srgb, var(--accent) 12%, transparent);
        }
        .cj__node--active .cj__node-hex::before,
        .cj__node:hover .cj__node-hex::before {
          background: color-mix(in srgb, var(--accent) 8%, transparent);
        }
        .cj__node--active .cj__node-hex-border,
        .cj__node:hover .cj__node-hex-border {
          background: color-mix(in srgb, var(--accent) 55%, transparent);
        }

        .cj__node-pulse {
          position: absolute; inset: -8px;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: color-mix(in srgb, var(--accent) 8%, transparent);
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
          color: color-mix(in srgb, var(--accent) 50%, transparent);
          transition: color .2s;
        }
        .cj__node--active .cj__node-num,
        .cj__node:hover .cj__node-num { color: var(--accent); }

        .cj__node-label {
          font-family: var(--ff-display); font-size: .78rem;
          letter-spacing: .04em; text-transform: uppercase;
          color: rgba(255,255,255,0.7); text-align: center;
          line-height: 1.2; transition: color .2s;
        }
        .cj__node--active .cj__node-label,
        .cj__node:hover .cj__node-label { color: #fff; }

        .cj__progress-track {
          height: 2px; background: rgba(255,255,255,0.06);
          margin-top: 1rem; position: relative; overflow: hidden;
        }
        .cj__progress-fill {
          position: absolute; left: 0; top: 0; bottom: 0;
          background: var(--accent, var(--brand-teal));
          transform-origin: left;
          transition: transform .5s cubic-bezier(0.16,1,0.3,1), background .4s;
        }

        .cj__detail {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 1px;
          background: color-mix(in srgb, var(--accent) 7%, transparent);
          border: 1px solid color-mix(in srgb, var(--accent) 10%, transparent);
          transition: background .4s, border-color .4s;
        }

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
          color: var(--accent);
          display: flex; align-items: center; gap: .55rem;
          margin-bottom: 1.5rem;
          transition: color .4s;
        }
        .cj__col-badge span { width: 1.2rem; height: 1px; background: var(--accent); display: inline-block; transition: background .4s; }
        .cj__big-icon {
          width: 96px; height: 96px;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: color-mix(in srgb, var(--accent) 12%, transparent);
          color: var(--accent);
          position: relative; margin-bottom: 1.5rem;
          box-shadow: 0 0 48px color-mix(in srgb, var(--accent) 20%, transparent);
          transition: background .4s, color .4s, box-shadow .4s;
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
          gap: 1px; background: color-mix(in srgb, var(--accent) 7%, transparent);
          transition: background .4s;
        }
        .cj__metric {
          background: color-mix(in srgb, var(--accent) 5%, transparent);
          padding: 1.1rem 1.25rem;
          transition: background .4s;
        }
        .cj__metric-val {
          font-family: var(--ff-display);
          font-size: clamp(1.8rem,3vw,2.5rem);
          line-height: 1; letter-spacing: -.02em; color: #fff;
        }
        .cj__metric-label {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: color-mix(in srgb, var(--accent) 70%, transparent);
          margin-top: .35rem; display: block;
          transition: color .4s;
        }

        .cj__col-nav {
          background: #070f0e;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .cj__nav-item {
          display: flex; align-items: center; gap: .85rem;
          padding: .85rem 1.25rem;
          border-bottom: 1px solid color-mix(in srgb, var(--accent) 6%, transparent);
          cursor: pointer; background: transparent;
          text-align: left; width: 100%;
          border-left: 2px solid transparent;
          transition: background .15s, border-color .15s;
        }
        .cj__nav-item:last-child { border-bottom: none; }
        .cj__nav-item:hover {
          background: color-mix(in srgb, var(--accent) 4%, transparent);
          border-left-color: color-mix(in srgb, var(--accent) 30%, transparent);
        }
        .cj__nav-item--active {
          background: color-mix(in srgb, var(--accent) 6%, transparent) !important;
          border-left-color: var(--accent) !important;
        }
        .cj__nav-icon {
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          clip-path: polygon(50% 0%,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%);
          background: color-mix(in srgb, var(--accent) 6%, transparent);
          color: rgba(255,255,255,0.55);
          flex-shrink: 0;
          transition: background .18s, color .18s;
        }
        .cj__nav-item--active .cj__nav-icon,
        .cj__nav-item:hover .cj__nav-icon {
          background: color-mix(in srgb, var(--accent) 18%, transparent);
          color: var(--accent);
        }
        .cj__nav-num {
          font-family: var(--ff-mono); font-size: 0.66rem;
          letter-spacing: .16em; text-transform: uppercase;
          color: color-mix(in srgb, var(--accent) 50%, transparent);
          display: block;
          transition: color .15s;
        }
        .cj__nav-label {
          font-family: var(--ff-display); font-size: 1rem;
          letter-spacing: .02em; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
          transition: color .15s; display: block;
        }
        .cj__nav-item--active .cj__nav-label,
        .cj__nav-item:hover .cj__nav-label { color: #fff; }

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
        .cj__footer-text strong {
          background: linear-gradient(135deg, var(--brand-teal), var(--brand-amber));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: .78rem;
        }
        .cj__cta {
          display: inline-flex; align-items: center; gap: .65rem;
          padding: .8rem 1.75rem;
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
          color: var(--accent);
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none;
          transition: background .18s, border-color .18s, color .4s, border-color .4s;
        }
        .cj__cta:hover {
          background: color-mix(in srgb, var(--accent) 8%, transparent);
          border-color: var(--accent);
        }

        @media (max-width: 1024px) {
          .cj__detail { grid-template-columns: 1fr 1fr; }
          .cj__col-nav { grid-column: span 2; flex-direction: row; flex-wrap: wrap; }
          .cj__nav-item { flex: 1; min-width: 140px; border-bottom: none; border-top: 1px solid color-mix(in srgb, var(--accent) 6%, transparent); }
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
        }
        @media (prefers-reduced-motion: reduce) {
          .cj__node-pulse { animation: none; }
          .cj__node { transition: none; }
        }

        [data-theme="light"] .cj { background: #f2f9f8; }
        [data-theme="light"] .cj__title { color: #0d2220; }
        [data-theme="light"] .cj__col-icon,
        [data-theme="light"] .cj__col-desc,
        [data-theme="light"] .cj__col-nav { background: #fff; }
        [data-theme="light"] .cj__step-heading { color: #0d2220; }
        [data-theme="light"] .cj__step-tagline { color: rgba(13,34,32,0.7); }
        [data-theme="light"] .cj__step-desc { color: rgba(13,34,32,0.72); }
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
        <div className="cj__blob cj__blob--1" aria-hidden />
        <div className="cj__blob cj__blob--2" aria-hidden />
        <div className="cj__blob cj__blob--3" aria-hidden />

        <div className="cj__wrap">
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

          <div className="cj__pipe-wrap" ref={pipeRef}>
            <div className="cj__pipe">
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
                <line x1="0" y1="1" x2="1120" y2="1" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeDasharray="4 4"/>
                <line ref={lineRef} x1="0" y1="1" x2="0" y2="1" stroke={curAccent.hex} strokeWidth="1.5" style={{ transition: "stroke 0.4s" }}/>
              </svg>

              {STEPS.map((s, i) => {
                const a = accentFor(i);
                return (
                  <div
                    key={s.id}
                    className={`cj__node${active === i ? " cj__node--active" : ""}`}
                    onClick={() => { setActive(i); startTimer(); }}
                    role="button" tabIndex={0}
                    aria-label={s.label}
                    onKeyDown={e => e.key === "Enter" && setActive(i)}
                    style={{ "--accent": a.hex } as React.CSSProperties}
                  >
                    <div className="cj__node-hex">
                      <div className="cj__node-hex-border" />
                      <div className="cj__node-pulse" aria-hidden />
                      {s.icon}
                    </div>
                    <span className="cj__node-num">{s.num}</span>
                    <span className="cj__node-label">{s.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="cj__progress-track">
              <div
                className="cj__progress-fill"
                style={{
                  transform: `scaleX(${(active + 1) / STEPS.length})`,
                  "--accent": curAccent.hex,
                } as React.CSSProperties}
              />
            </div>
          </div>

          <div
            className="cj__detail"
            ref={detailRef}
            style={{ "--accent": curAccent.hex } as React.CSSProperties}
          >
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

            <div className="cj__col-nav">
              {STEPS.map((s, i) => {
                const a = accentFor(i);
                return (
                  <button
                    key={s.id}
                    className={`cj__nav-item${active === i ? " cj__nav-item--active" : ""}`}
                    onClick={() => { setActive(i); startTimer(); }}
                    style={{ "--accent": a.hex } as React.CSSProperties}
                  >
                    <div className="cj__nav-icon" aria-hidden>
                      {s.icon}
                    </div>
                    <div>
                      <span className="cj__nav-num">{s.num}</span>
                      <span className="cj__nav-label">{s.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cj__footer">
            <p className="cj__footer-text">
              Ready when you are —&nbsp;
              <strong>engineers available 24/7</strong>
            </p>
            <Link
              href="/contact"
              className="cj__cta"
              style={{ "--accent": curAccent.hex } as React.CSSProperties}
            >
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
