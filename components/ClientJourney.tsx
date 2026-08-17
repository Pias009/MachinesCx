"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import TransitionLink from "@/components/TransitionLink";
import { openAshaChat } from "@/components/ChatWidget";
import {
  MessageSquare, FileText, ShoppingCart, Factory,
  Truck, Wrench, GraduationCap, Headphones,
  Bot, HardHat,
  type LucideIcon,
} from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

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

// ─── one distinct color per step (8 unique, not a 4-color repeat) —
// still the brand family (teal/amber/rose/blue) extended with disciplined
// siblings (violet/green/cyan/orange) so it reads as one system, not a
// rainbow. Flat, solid — no gradients, no pastel/candy tints. ───
const STEP_COLORS = [
  "var(--brand-teal)",
  "var(--brand-amber)",
  "var(--brand-rose)",
  "var(--cj-blue)",
  "var(--cj-violet)",
  "var(--cj-green)",
  "var(--cj-cyan)",
  "var(--cj-orange)",
];

type StepCopy = { label: string; tagline: string; desc: string; metric1v: string; metric1l: string; metric2v: string; metric2l: string };

// evenly space `count` points around a circle, starting at 12 o'clock —
// returns each point as a % offset from the ring center so the layout
// scales with the container instead of using fixed pixel radii
const RING_RADIUS_PCT = 42;
function ringPosition(index: number, count: number) {
  const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
  return {
    left: `${50 + RING_RADIUS_PCT * Math.cos(angle)}%`,
    top: `${50 + RING_RADIUS_PCT * Math.sin(angle)}%`,
  };
}

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

  const ringRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayCardRef = useRef<HTMLDivElement>(null);

  // clicking a ring icon opens the same step as a larger centered overlay,
  // which fades and scales in/out — previously this flipped the source
  // icon away (rotateY across two separate elements handing off to each
  // other) before the overlay appeared, which was both janky and prone to
  // getting stuck if a GSAP callback didn't fire. A single fade+scale
  // tween on one element is simpler, has nothing to desync, and reads as
  // "the card is here" without a spinning transition.
  const [openId, setOpenId] = useState<string | null>(null);
  const openStep = STEPS.find((s) => s.id === openId) ?? null;

  // Shared context handed to whichever agent the visitor picks — names the
  // step so they don't have to re-explain what they're asking about. Lands
  // in an editable field on both paths (ASHA's input box, the human-engineer
  // form's message textarea), never sent on their behalf.
  const stepContext = (s: typeof STEPS[number]) =>
    t("agentContext", { step: s.label, tagline: s.tagline });

  // Animation phase, tracked outside React state so click handlers can
  // read/guard it synchronously without waiting for a re-render — guards
  // against a rapid double-click re-triggering close mid-close (or vice
  // versa). Every tween gets a bounded setTimeout failsafe that
  // force-advances the phase even if GSAP's onComplete is ever skipped
  // (e.g. an interrupted tween), so the overlay can never get stuck open
  // or stuck closing.
  const phaseRef = useRef<"closed" | "open" | "closing">("closed");
  const failsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearFailsafe = () => {
    if (failsafeRef.current) { clearTimeout(failsafeRef.current); failsafeRef.current = null; }
  };

  useEffect(() => () => clearFailsafe(), []);

  const openCard = (id: string) => {
    if (phaseRef.current !== "closed") return;
    phaseRef.current = "open";
    setOpenId(id);
  };

  const closeOverlay = useCallback(() => {
    if (phaseRef.current !== "open") return;

    const overlay = overlayRef.current;
    const card = overlayCardRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!overlay || !card || reduced) {
      phaseRef.current = "closed";
      setOpenId(null);
      return;
    }

    phaseRef.current = "closing";
    clearFailsafe();
    const finish = () => {
      clearFailsafe();
      if (phaseRef.current !== "closing") return;
      phaseRef.current = "closed";
      setOpenId(null);
    };
    gsap.to(card, {
      opacity: 0,
      scale: 0.94,
      y: 8,
      duration: 0.2,
      ease: "power2.in",
      overwrite: true,
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: "power1.in",
      overwrite: true,
      onComplete: finish,
    });
    // failsafe: force the close through even if onComplete never fires
    // (e.g. the overlay unmounts mid-tween)
    failsafeRef.current = setTimeout(finish, 400);
  }, []);

  // fade + scale the overlay card in once it mounts
  useGSAP(() => {
    if (!openId) return;
    const overlay = overlayRef.current;
    const card = overlayCardRef.current;
    if (!overlay || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(overlay, { opacity: 1 });
      gsap.set(card, { opacity: 1, scale: 1, y: 0 });
      return;
    }

    gsap.set(overlay, { opacity: 0 });
    gsap.set(card, { opacity: 0, scale: 0.94, y: 8 });
    gsap.to(overlay, { opacity: 1, duration: 0.2, ease: "power1.out", overwrite: true });
    gsap.to(card, {
      opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power3.out",
      overwrite: true,
    });
  }, { dependencies: [openId] });

  // Escape closes the overlay, same as clicking the backdrop or the × button
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeOverlay(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, closeOverlay]);

  // one-time reveal when the ring enters view: every icon starts collapsed
  // at the circle's center (scale 0, no opacity), then flies out to its
  // resting position on the ring — staggered clockwise around the circle,
  // not a generic fade. Runs once; icons stay in place after.
  useGSAP(() => {
    const el = ringRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const icons = el.querySelectorAll<HTMLElement>(".cj__ring-icon");
    if (!icons.length) return;

    if (reduced) {
      gsap.set(icons, { opacity: 1, scale: 1, x: 0, y: 0 });
      return;
    }

    // read each icon's authored (CSS-positioned) offset from the ring
    // center before collapsing it, so the "fly out" animates back to
    // exactly where the circular layout already placed it
    const targets = Array.from(icons).map((icon) => {
      const rect = icon.getBoundingClientRect();
      const parentRect = el.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - (parentRect.left + parentRect.width / 2),
        y: rect.top + rect.height / 2 - (parentRect.top + parentRect.height / 2),
      };
    });

    gsap.set(icons, { opacity: 0, scale: 0.2, x: (i) => -targets[i].x, y: (i) => -targets[i].y });

    ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.to(icons, {
          opacity: 1, scale: 1, x: 0, y: 0,
          duration: 0.8, ease: "back.out(1.4)", stagger: 0.09,
        });
      },
    });
  }, { scope: ringRef });

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: var(--bg-base);
          padding: clamp(5rem,8vw,7.5rem) 0;
          --cj-blue: #2563eb;
          --cj-violet: #8b5cf6;
          --cj-green: #16a34a;
          --cj-cyan: #06b6d4;
          --cj-orange: #ea580c;
          overflow: hidden;
        }
        /* ── section-level backdrop: two soft brand-color glows, no grid —
           a hairline grid overlay reads as generic "blueprint" filler unless
           the surface is an actual canvas/map/measurement context, which
           this isn't, so depth comes from color glow only ── */
        .cj__bg-glow {
          position: absolute; z-index: 0; pointer-events: none;
          top: -12%; right: -8%; width: 48%; aspect-ratio: 1;
          background: radial-gradient(circle, var(--brand-teal-glow) 0%, transparent 70%);
          filter: blur(20px);
        }
        .cj__bg-glow--2 {
          position: absolute; z-index: 0; pointer-events: none;
          bottom: -15%; left: -10%; width: 40%; aspect-ratio: 1;
          background: radial-gradient(circle, var(--brand-amber-dim) 0%, transparent 70%);
          filter: blur(24px);
        }
        .cj__wrap {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding-inline: clamp(1.5rem,5vw,4.5rem);
        }
        .cj__head {
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 1.5rem;
          margin-bottom: clamp(3rem,5vw,4.5rem);
          border-bottom: 1px solid var(--bg-line);
          padding-bottom: clamp(1.5rem,3vw,2.25rem);
        }
        .cj__eyebrow {
          font-family: var(--ff-mono); font-weight: 600; font-size: .7rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .75rem;
          display: flex; align-items: center; gap: .6rem;
        }
        .cj__eyebrow-tick { display: inline-block; width: 22px; height: 1px; background: var(--brand-teal); }
        .cj__title {
          font-family: var(--ff-display); font-weight: 700;
          font-size: clamp(1.9rem,3.4vw,3rem);
          line-height: 0.98; letter-spacing: -.01em;
          color: var(--ink); margin: 0;
        }
        .cj__title em {
          font-style: normal;
          color: var(--brand-teal);
        }
        .cj__head-meta {
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-35);
          white-space: nowrap;
        }

        /* ── ring: all 8 steps arranged in a circle, the section's main
           visual. Each icon's left/top (% of the ring) is computed in JS
           via ringPosition() and set inline, so the layout scales cleanly
           with the responsive ring size instead of using fixed pixel
           offsets. A thin circular guide-line sits behind the icons so the
           ring shape reads even before/without hover. ── */
        .cj__ring-wrap {
          display: flex;
          justify-content: center;
          padding-block: clamp(1rem, 3vw, 2rem);
        }
        .cj__ring {
          position: relative;
          width: min(560px, 92vw);
          aspect-ratio: 1;
        }
        .cj__ring-guide {
          position: absolute; inset: 8%;
          border: 1px dashed var(--bg-line);
          border-radius: 50%;
        }
        .cj__ring-center {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center;
          gap: .3rem;
          pointer-events: none;
        }
        .cj__ring-center-label {
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .12em;
          text-transform: uppercase; color: var(--ink-35);
        }
        .cj__ring-center-value {
          font-family: var(--ff-display); font-weight: 700; font-size: 1.1rem;
          color: var(--ink);
        }
        /* positioning wrapper — left/top set inline per icon (percent of
           ring), plain CSS transform for centering only. */
        .cj__ring-icon-pos {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 104px; height: 118px;
        }
        .cj__ring-icon {
          width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .4rem;
          padding: .6rem .4rem .55rem;
          border-radius: 18px;
          background: color-mix(in srgb, var(--step-color) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--step-color) 35%, transparent);
          cursor: pointer;
          perspective: 600px;
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .cj__ring-icon:hover,
        .cj__ring-icon:focus-visible {
          background: color-mix(in srgb, var(--step-color) 18%, transparent);
          border-color: var(--step-color);
        }
        .cj__ring-icon-badge {
          width: 84px; height: 84px;
          border-radius: 22px;
          background: linear-gradient(155deg, var(--step-color) 0%, color-mix(in srgb, var(--step-color) 70%, #000) 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 10px 22px -9px var(--step-color);
          transition: transform 0.25s cubic-bezier(0.16,1,0.3,1), box-shadow 0.25s ease;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .cj__ring-icon-badge svg { width: 32px; height: 32px; color: #fff; }
        .cj__ring-icon:hover .cj__ring-icon-badge,
        .cj__ring-icon:focus-visible .cj__ring-icon-badge {
          transform: rotateX(10deg) rotateY(-10deg) scale(1.14) translateY(-3px);
          box-shadow: 0 18px 34px -10px var(--step-color);
        }
        .cj__ring-icon:active .cj__ring-icon-badge {
          transform: rotateX(4deg) rotateY(-4deg) scale(1.05);
        }
        .cj__ring-icon:focus-visible .cj__ring-icon-badge { outline: 2px solid var(--step-color); outline-offset: 3px; }
        .cj__ring-icon-label {
          font-family: var(--ff-mono); font-size: .62rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase; color: var(--ink-60);
          white-space: nowrap;
        }
        @media (max-width: 640px) {
          .cj__ring { width: min(360px, 90vw); }
          .cj__ring-icon-pos { width: 78px; height: 88px; }
          .cj__ring-icon { padding: .4rem .3rem .4rem; border-radius: 14px; gap: .3rem; }
          .cj__ring-icon-badge { width: 64px; height: 64px; border-radius: 16px; }
          .cj__ring-icon-badge svg { width: 24px; height: 24px; }
          .cj__ring-icon-label { font-size: .56rem; }
        }

        .cj__desc {
          font-family: var(--ff-body); font-size: .85rem; line-height: 1.6;
          color: var(--ink-60);
          margin-top: .75rem;
          padding-top: .75rem;
          border-top: 1px solid var(--bg-line);
        }

        /* ── expanded-card overlay — dimmed backdrop + a centered, larger
           copy of the clicked card. GSAP fades + scales it in from a
           slightly-smaller, slightly-lower resting state. ── */
        .cj__overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 5vh 1.5rem;
          background: rgba(4,8,7,0.7);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
        }
        .cj__overlay-card {
          position: relative;
          width: min(680px, 100%);
          max-height: 86vh;
          overflow-y: auto;
          overflow-x: hidden;
          isolation: isolate;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 1.5rem;
          padding: clamp(1.75rem, 3vw, 2.5rem);
          background:
            radial-gradient(circle at 85% -10%, color-mix(in srgb, var(--step-color) 30%, transparent) 0%, transparent 60%),
            radial-gradient(circle at 5% 110%, color-mix(in srgb, var(--step-color) 16%, transparent) 0%, transparent 55%),
            var(--bg-surface);
          border: 2px solid var(--step-color);
          border-radius: 20px;
          box-shadow: 0 30px 70px -20px rgba(0,0,0,0.55), 0 0 50px -18px var(--step-color), 0 0 0 1px rgba(0,0,0,0.2);
        }
        /* ── icon-themed animated backdrop: oversized ghost copies of the
           step's own icon, tinted in its color, drifting slowly behind the
           content — reinforces "which step is this" even from a glance at
           the backdrop, not just the small badge ── */
        .cj__overlay-motif {
          position: absolute; inset: 0; z-index: -1;
          overflow: hidden;
          border-radius: inherit;
          pointer-events: none;
        }
        .cj__overlay-motif svg {
          position: absolute;
          color: var(--step-color);
          opacity: 0.16;
        }
        .cj__overlay-motif svg:nth-child(1) {
          width: 240px; height: 240px;
          top: -60px; right: -50px;
          animation: cj-motif-drift-1 14s ease-in-out infinite;
        }
        .cj__overlay-motif svg:nth-child(2) {
          width: 150px; height: 150px;
          bottom: -30px; left: -30px;
          opacity: 0.12;
          animation: cj-motif-drift-2 18s ease-in-out infinite;
        }
        @keyframes cj-motif-drift-1 {
          0%, 100% { transform: rotate(-8deg) translate(0, 0) scale(1); }
          50% { transform: rotate(6deg) translate(-10px, 12px) scale(1.06); }
        }
        @keyframes cj-motif-drift-2 {
          0%, 100% { transform: rotate(6deg) translate(0, 0) scale(1); }
          50% { transform: rotate(-8deg) translate(8px, -10px) scale(1.08); }
        }
        @media (prefers-reduced-motion: reduce) {
          .cj__overlay-motif svg { animation: none !important; }
        }
        .cj__overlay-close {
          position: absolute; top: 1rem; right: 1rem;
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          color: var(--ink-60);
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .cj__overlay-close:hover { color: var(--ink); border-color: var(--step-color); }
        .cj__overlay-card .cj__badge {
          width: 68px; height: 68px; border-radius: 18px;
        }
        .cj__overlay-card .cj__badge svg { width: 28px; height: 28px; }
        .cj__overlay-card .cj__label { font-size: 1.35rem; margin-top: .3rem; font-family: var(--ff-body); }
        .cj__overlay-card .cj__tagline { font-size: .95rem; margin-top: .4rem; font-family: var(--ff-body); }
        .cj__overlay-card .cj__desc { font-size: .92rem; }

        /* ── ask-an-agent — two equal paths handed off from this step's
           own context, so the visitor doesn't retype what stage they're
           asking about. Text answer (AI, instant) vs. a person (engineer,
           async) are framed as different tools for different needs, not
           a "fast vs slow" ranking. ── */
        .cj__ask {
          margin-top: 1.25rem;
          padding-top: 1.1rem;
          border-top: 1px solid var(--bg-line);
        }
        .cj__ask-label {
          display: block;
          font-family: var(--ff-mono); font-size: .68rem; font-weight: 600;
          letter-spacing: .12em; text-transform: uppercase;
          color: var(--ink-35);
          margin-bottom: .65rem;
        }
        .cj__ask-btns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: .65rem;
        }
        .cj__ask-btn {
          display: flex;
          align-items: flex-start;
          gap: .6rem;
          padding: .75rem .85rem;
          border-radius: 10px;
          background: color-mix(in srgb, var(--step-color) 8%, var(--bg-base));
          border: 1px solid color-mix(in srgb, var(--step-color) 30%, transparent);
          color: var(--ink);
          text-align: left;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
        }
        .cj__ask-btn svg { flex: 0 0 auto; margin-top: .15rem; color: var(--step-color); }
        .cj__ask-btn span {
          display: flex; flex-direction: column; gap: .1rem;
          font-family: var(--ff-body); font-size: .78rem; line-height: 1.35;
          color: var(--ink-60);
        }
        .cj__ask-btn strong {
          font-family: var(--ff-display); font-weight: 700; font-size: .88rem;
          letter-spacing: -.005em; color: var(--ink);
        }
        .cj__ask-btn:hover {
          border-color: var(--step-color);
          background: var(--bg-surface);
          transform: translateY(-2px);
        }
        .cj__ask-btn:focus-visible { outline: 2px solid var(--step-color); outline-offset: 2px; }

        @media (max-width: 480px) {
          .cj__ask-btns { grid-template-columns: 1fr; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cj__overlay, .cj__overlay-card { transition: none; }
        }

        /* larger, illustrated icon tile — layered ring + glow behind the
           icon instead of a flat solid square, more like a badge of rank
           than a plain color chip */
        .cj__badge {
          position: relative;
          flex: 0 0 auto;
          width: 54px; height: 54px;
          border-radius: 14px;
          background: linear-gradient(155deg, var(--step-color) 0%, color-mix(in srgb, var(--step-color) 70%, #000) 100%);
          border: 2px solid var(--step-color);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 8px 18px -9px var(--step-color);
        }
        .cj__badge::before {
          content: "";
          position: absolute; inset: -6px;
          border-radius: 17px;
          border: 1px solid var(--step-color);
          opacity: 0.6;
        }
        .cj__badge svg { width: 22px; height: 22px; color: #fff; }

        .cj__num {
          font-family: var(--ff-body); font-weight: 700; font-size: .72rem;
          letter-spacing: .08em; color: var(--step-color);
          display: block;
        }
        .cj__label {
          font-family: var(--ff-body); font-weight: 700; font-size: 1.05rem;
          letter-spacing: -.005em; color: var(--ink);
          margin: .15rem 0 0;
        }
        .cj__tagline {
          font-family: var(--ff-body); font-size: .88rem; line-height: 1.5;
          color: var(--ink-60);
          margin: .35rem 0 0;
          flex: 1 1 auto;
        }
        .cj__metrics {
          display: flex; flex-wrap: wrap; gap: .4rem 1.2rem;
          border-top: 2px solid color-mix(in srgb, var(--step-color) 40%, transparent);
          padding-top: .65rem;
          margin-top: auto;
        }
        .cj__metric {
          display: flex; align-items: baseline; gap: .4rem;
          font-family: var(--ff-body); font-size: .75rem;
        }
        .cj__metric-v { color: var(--step-color); font-weight: 700; }
        .cj__metric-l { color: var(--ink-35); letter-spacing: .04em; text-transform: uppercase; }

        @media (max-width: 640px) {
          .cj__footer { flex-direction: column; text-align: center; gap: 1rem; }
          .cj__head-meta { display: none; }
        }

        .cj__footer {
          margin-top: clamp(2.5rem,4vw,3.5rem);
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.25rem; flex-wrap: wrap;
          border-top: 1px solid var(--bg-line);
          padding-top: clamp(1.5rem, 3vw, 2rem);
        }
        .cj__footer-text {
          font-family: var(--ff-body); font-size: .9rem;
          color: var(--ink-60);
        }
        .cj__footer-text strong { color: var(--ink); font-weight: 600; }
        .cj__cta {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .75rem 1.6rem;
          border-radius: 999px;
          background: var(--brand-teal);
          color: #0d2220;
          font-family: var(--ff-mono); font-weight: 700; font-size: .72rem;
          letter-spacing: .06em; text-transform: uppercase;
          text-decoration: none;
          transition: background 0.15s ease, transform 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .cj__cta:hover { background: var(--brand-teal-dk); }
        .cj__cta:active { transform: scale(0.97); }

        @media (prefers-reduced-motion: reduce) {
          .cj__badge, .cj__ring-icon-badge { transition: none; }
        }
      `}</style>

      <section className="cj" data-no-anim aria-label={t("sectionAria")}>
        <div className="cj__bg-glow" aria-hidden="true" />
        <div className="cj__bg-glow--2" aria-hidden="true" />
        <div className="cj__wrap">
          <div className="cj__head">
            <div>
              <div className="cj__eyebrow"><span className="cj__eyebrow-tick" />{t("eyebrow")}</div>
              <h2 className="cj__title">
                {t("titleLine1")} {t("titleLine2")} <em>{t("titleEm")}</em>
              </h2>
            </div>
            <span className="cj__head-meta">{t("stepOfLabel", { num: "01", total: "08" })}</span>
          </div>

          <div className="cj__ring-wrap">
            <div className="cj__ring" role="list" aria-label={t("stepsAria")} ref={ringRef}>
              <div className="cj__ring-guide" aria-hidden="true" />
              <div className="cj__ring-center" aria-hidden="true">
                <span className="cj__ring-center-value">08</span>
                <span className="cj__ring-center-label">{t("stepsAria")}</span>
              </div>
              {STEPS.map((s, i) => {
                const pos = ringPosition(i, STEPS.length);
                return (
                  <div className="cj__ring-icon-pos" role="listitem" key={s.id} style={{ left: pos.left, top: pos.top }}>
                    <button
                      type="button"
                      className="cj__ring-icon"
                      style={{ ["--step-color" as string]: s.color }}
                      onClick={() => openCard(s.id)}
                      aria-label={s.label}
                    >
                      <span className="cj__ring-icon-badge">
                        <s.Icon strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <span className="cj__ring-icon-label">{s.label}</span>
                    </button>
                  </div>
                );
              })}
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

      {openStep && (
        <div
          className="cj__overlay"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={openStep.label}
          onClick={(e) => { if (e.target === e.currentTarget) closeOverlay(); }}
        >
          <div
            className="cj__overlay-card"
            ref={overlayCardRef}
            style={{ ["--step-color" as string]: openStep.color }}
          >
            <button type="button" className="cj__overlay-close" aria-label={t("closeLabel")} onClick={closeOverlay}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="cj__overlay-motif" aria-hidden="true">
              <openStep.Icon strokeWidth={1} />
              <openStep.Icon strokeWidth={1} />
            </div>
            <div className="cj__badge">
              <openStep.Icon strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="cj__step-text">
              <span className="cj__num">{openStep.num}</span>
              <h3 className="cj__label">{openStep.label}</h3>
              <p className="cj__tagline">{openStep.tagline}</p>
              <div className="cj__metrics">
                {openStep.metrics.map((m, mi) => (
                  <div className="cj__metric" key={mi}>
                    <span className="cj__metric-v">{m.v}</span>
                    <span className="cj__metric-l">{m.l}</span>
                  </div>
                ))}
              </div>
              <p className="cj__desc">{openStep.desc}</p>

              <div className="cj__ask">
                <span className="cj__ask-label">{t("askLabel")}</span>
                <div className="cj__ask-btns">
                  <button
                    type="button"
                    className="cj__ask-btn"
                    onClick={() => { openAshaChat(stepContext(openStep)); closeOverlay(); }}
                  >
                    <Bot size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span>
                      <strong>{t("askAiTitle")}</strong>
                      {t("askAiSub")}
                    </span>
                  </button>
                  <TransitionLink
                    href={`/inquiries/talk-to-engineer?note=${encodeURIComponent(stepContext(openStep))}`}
                    className="cj__ask-btn"
                  >
                    <HardHat size={16} strokeWidth={1.75} aria-hidden="true" />
                    <span>
                      <strong>{t("askEngineerTitle")}</strong>
                      {t("askEngineerSub")}
                    </span>
                  </TransitionLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
