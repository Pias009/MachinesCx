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
  Bot, HardHat, User, UserCheck, Send, CheckCircle2,
  type LucideIcon,
} from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

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

const STEP_ACTIONS: Record<(typeof STEP_IDS)[number], { actor: string; text: string; icon: LucideIcon }> = {
  inquiry: {
    actor: "Client Action",
    text: "Client sends project specifications, capacity requirements, and CAD layout for custom machine consultation.",
    icon: User,
  },
  quotation: {
    actor: "Lead Engineer",
    text: "Technical team analyzes engineering feasibility, calculates component costs, and issues a formal commercial proposal.",
    icon: HardHat,
  },
  order: {
    actor: "Sales & Finance",
    text: "Contract terms finalized, purchase order approved, and manufacturing schedule registered in factory ERP.",
    icon: UserCheck,
  },
  manufacturing: {
    actor: "Factory Operations",
    text: "High-precision CNC machining, robotic welding, electrical wiring, and strict quality control testing in progress.",
    icon: Factory,
  },
  delivery: {
    actor: "Logistics Specialist",
    text: "Machinery is heavy-duty export packaged, loaded on heavy transport, and dispatched directly to client site.",
    icon: Truck,
  },
  commissioning: {
    actor: "On-Site Engineer",
    text: "Certified engineers conduct physical positioning, power integration, calibration, and full trial production run.",
    icon: Wrench,
  },
  training: {
    actor: "Technical Instructor",
    text: "Comprehensive hands-on operator training, safety protocols, and daily maintenance procedure certification.",
    icon: GraduationCap,
  },
  aftersales: {
    actor: "Dedicated Support",
    text: "24/7 lifetime engineering support active, with preventive maintenance checks and priority spare parts dispatch.",
    icon: Headphones,
  },
};

const STEP_COLORS = [
  "#2bbfb3", // brand-teal
  "#f59e0b", // brand-amber
  "#e11d48", // brand-rose
  "#2563eb", // blue
  "#8b5cf6", // violet
  "#16a34a", // green
  "#06b6d4", // cyan
  "#ea580c", // orange
];

type StepCopy = { label: string; tagline: string; desc: string; metric1v: string; metric1l: string; metric2v: string; metric2l: string };

function rectPosition(index: number) {
  const POSITIONS = [
    { left: "26%", top: "4.5%" },   // 0: Inquiry (Top-Left)
    { left: "74%", top: "4.5%" },   // 1: Quotation (Top-Right)
    { left: "97.7%", top: "28%" },  // 2: Order (Right-Top)
    { left: "97.7%", top: "72%" },  // 3: Manufacturing (Right-Bottom)
    { left: "74%", top: "95.5%" },  // 4: Delivery (Bottom-Right)
    { left: "26%", top: "95.5%" },  // 5: Commissioning (Bottom-Left)
    { left: "2.3%", top: "72%" },   // 6: Training (Left-Bottom)
    { left: "2.3%", top: "28%" },   // 7: Aftersales (Left-Top)
  ];
  return POSITIONS[index % POSITIONS.length];
}

function popupAlignment(index: number) {
  switch (index) {
    case 0: return "cj__popup--bottom-right";
    case 1: return "cj__popup--bottom-left";
    case 2: return "cj__popup--left-top";
    case 3: return "cj__popup--left-bottom";
    case 4: return "cj__popup--top-left";
    case 5: return "cj__popup--top-right";
    case 6: return "cj__popup--right-bottom";
    case 7: return "cj__popup--right-top";
    default: return "cj__popup--bottom-right";
  }
}

// Total track perimeter for SVG <rect x="20" y="20" width="820" height="400" rx="20" />
const TOTAL_P = 2405.66;
// Fixed train beam length (does not stretch or extend)
const TRAIN_FIXED_LEN = 95;
// Exact stroke-dashoffset locations for 8 step nodes along the track
const STEP_OFFSETS = [193, 587, 918, 1094, 1417, 1811, 2126, 2302];

// Typewriter sub-component with completion callback
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayedText("");
    setIsDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i <= text.length) {
        setDisplayedText(text.slice(0, i));
      } else {
        setIsDone(true);
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 22);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <p className="cj__popup-text">
      {displayedText}
      {!isDone && <span className="cj__typing-cursor">|</span>}
    </p>
  );
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
      action: STEP_ACTIONS[id],
    };
  });

  const ringRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayCardRef = useRef<HTMLDivElement>(null);

  const [openId, setOpenId] = useState<string | null>(null);
  const openStep = STEPS.find((s) => s.id === openId) ?? null;

  // Train Movement State Engine
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [trainOffset, setTrainOffset] = useState<number>(STEP_OFFSETS[0]);
  const [isTravelling, setIsTravelling] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const currentStepRef = useRef<number>(0);
  const travelRafRef = useRef<number>(0);
  const nextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Train Traveling Function: moves single fixed-length train from current logo to target logo
  const goToStep = useCallback((targetIndex: number) => {
    if (travelRafRef.current) cancelAnimationFrame(travelRafRef.current);
    if (nextTimerRef.current) clearTimeout(nextTimerRef.current);

    const fromStep = currentStepRef.current;
    const fromOffset = STEP_OFFSETS[fromStep];
    let toOffset = STEP_OFFSETS[targetIndex];

    if (toOffset <= fromOffset && targetIndex !== fromStep) {
      toOffset += TOTAL_P; // Loop around rectangle
    }

    const startTime = performance.now();
    const duration = 1200; // 1.2 seconds travel time between logos

    setIsTravelling(true);

    function animateTravel(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth Easing (cubic ease-in-out)
      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      // Current train head position
      const rawOffset = fromOffset + (toOffset - fromOffset) * eased;
      setTrainOffset(rawOffset % TOTAL_P);

      if (progress < 1) {
        travelRafRef.current = requestAnimationFrame(animateTravel);
      } else {
        // Train STOPPED at target logo!
        setIsTravelling(false);
        setTrainOffset(STEP_OFFSETS[targetIndex]);
        currentStepRef.current = targetIndex;
        setActiveIndex(targetIndex);
      }
    }

    travelRafRef.current = requestAnimationFrame(animateTravel);
  }, []);

  // When Typewriter completes typing at the current stopped logo:
  const handleTypewriterComplete = useCallback(() => {
    if (isHovered || openId || isTravelling) return;

    // Pause 1 second after text typing ends, then move train to next logo
    nextTimerRef.current = setTimeout(() => {
      if (!isHovered && !openId) {
        const nextStep = (currentStepRef.current + 1) % STEPS.length;
        goToStep(nextStep);
      }
    }, 1000);
  }, [isHovered, openId, isTravelling, STEPS.length, goToStep]);

  // Initial trigger
  useEffect(() => {
    currentStepRef.current = 0;
    setTrainOffset(STEP_OFFSETS[0]);
    return () => {
      if (travelRafRef.current) cancelAnimationFrame(travelRafRef.current);
      if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
    };
  }, []);

  const stepContext = (s: typeof STEPS[number]) =>
    t("agentContext", { step: s.label, tagline: s.tagline });

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
    failsafeRef.current = setTimeout(finish, 400);
  }, []);

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

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeOverlay(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, closeOverlay]);

  useGSAP(() => {
    const el = ringRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const icons = el.querySelectorAll<HTMLElement>(".cj__ring-icon-pos");
    if (!icons.length) return;

    if (reduced) {
      gsap.set(icons, { opacity: 1, scale: 1 });
      return;
    }

    gsap.set(icons, { opacity: 0, scale: 0.3 });

    ScrollTrigger.create({
      trigger: el,
      start: "top 75%",
      once: true,
      onEnter: () => {
        gsap.to(icons, {
          opacity: 1, scale: 1,
          duration: 0.7, ease: "back.out(1.4)", stagger: 0.08,
        });
      },
    });
  }, { scope: ringRef });

  const activeStep = STEPS[activeIndex];

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: var(--bg-base);
          padding: clamp(5rem,8vw,7.5rem) 0;
          overflow: hidden;
        }
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

        /* ── RECTANGULAR TRACK CONTAINER WITH TRAIN LIGHT ENGINE ── */
        .cj__ring-wrap {
          display: flex;
          justify-content: center;
          padding-block: clamp(2rem, 4vw, 3.5rem);
        }
        .cj__ring {
          position: relative;
          width: min(860px, 88vw);
          height: 440px;
        }

        /* SVG Single Traveling Train Light */
        .cj__track-svg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          overflow: visible;
          pointer-events: none;
        }
        .cj__track-bg {
          stroke: var(--bg-line);
          stroke-width: 1.5;
          stroke-dasharray: 6 6;
          fill: none;
        }
        .cj__track-pulse {
          stroke: var(--active-color, var(--brand-teal));
          stroke-width: 4;
          fill: none;
          stroke-linecap: round;
          filter: drop-shadow(0 0 14px var(--active-color, var(--brand-teal)));
          transition: stroke 0.3s ease;
        }

        .cj__ring-center {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center;
          gap: .35rem;
          pointer-events: none;
        }
        .cj__ring-center-value {
          font-family: var(--ff-display); font-weight: 700; font-size: 1.3rem;
          color: var(--ink);
        }
        .cj__ring-center-label {
          font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .12em;
          text-transform: uppercase; color: var(--ink-35);
        }
        .cj__ring-center-live {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .25rem .75rem; border-radius: 999px;
          background: color-mix(in srgb, var(--active-color) 12%, var(--bg-surface));
          border: 1px solid color-mix(in srgb, var(--active-color) 35%, transparent);
          font-family: var(--ff-mono); font-size: .62rem; font-weight: 700;
          color: var(--active-color); text-transform: uppercase; letter-spacing: .08em;
          margin-top: .3rem;
          transition: border-color 0.3s ease, background 0.3s ease, color 0.3s ease;
        }
        .cj__live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--active-color);
          box-shadow: 0 0 8px var(--active-color);
          animation: cjDotPulse 1.4s ease-in-out infinite alternate;
        }
        @keyframes cjDotPulse {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.3); opacity: 1; }
        }

        /* ── Step Logo Positioning ── */
        .cj__ring-icon-pos {
          position: absolute;
          transform: translate(-50%, -50%);
          width: 110px; height: 86px;
          z-index: 10;
        }
        .cj__ring-icon-pos--active {
          z-index: 40;
        }

        .cj__ring-icon {
          width: 100%; height: 100%;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: .45rem;
          padding: .3rem;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          outline: none;
        }
        .cj__ring-icon-pos--active .cj__ring-icon,
        .cj__ring-icon:hover {
          transform: translateY(-4px);
        }

        /* Logo Icon Glass Badge */
        .cj__ring-icon-badge {
          width: 56px; height: 56px;
          border-radius: 14px;
          background: color-mix(in srgb, var(--step-color) 12%, var(--bg-surface));
          border: 1px solid color-mix(in srgb, var(--step-color) 35%, transparent);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px color-mix(in srgb, var(--step-color) 15%, transparent);
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          position: relative;
          z-index: 1;
        }
        .cj__ring-icon-badge svg {
          width: 28px; height: 28px;
          color: var(--step-color);
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 2px 6px color-mix(in srgb, var(--step-color) 35%, transparent));
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        /* Active / Hover Pop-Up Animation on Logo */
        .cj__ring-icon-pos--active .cj__ring-icon-badge,
        .cj__ring-icon:hover .cj__ring-icon-badge {
          transform: scale(1.18);
          background: color-mix(in srgb, var(--step-color) 25%, var(--bg-raise));
          border-color: var(--step-color);
          box-shadow: 0 12px 28px -4px color-mix(in srgb, var(--step-color) 45%, transparent), 0 0 20px -2px var(--step-color);
        }
        .cj__ring-icon-pos--active .cj__ring-icon-badge svg,
        .cj__ring-icon:hover .cj__ring-icon-badge svg {
          transform: scale(1.12);
          filter: drop-shadow(0 0 12px var(--step-color));
        }

        .cj__ring-icon-label {
          font-family: var(--ff-mono); font-size: .65rem; font-weight: 700;
          letter-spacing: .06em; text-transform: uppercase; color: var(--ink-60);
          white-space: nowrap;
          transition: color 0.2s ease;
        }
        .cj__ring-icon-pos--active .cj__ring-icon-label,
        .cj__ring-icon:hover .cj__ring-icon-label {
          color: var(--step-color);
        }

        /* ── POP-UP ACTION BOX (Renders when train STOPS on logo or on hover) ── */
        .cj__popup {
          position: absolute;
          width: clamp(260px, 28vw, 320px);
          padding: .85rem 1rem;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 1.5px solid var(--step-color);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.55), 0 0 28px -4px var(--step-color);
          pointer-events: none;
          z-index: 60;
          animation: cjPopupIn 0.35s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes cjPopupIn {
          0% { opacity: 0; transform: scale(0.86) translateY(8px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* Popup Alignment Variations around rectangle */
        .cj__popup--bottom-right { top: 105%; left: 0; }
        .cj__popup--bottom-left { top: 105%; right: 0; }
        .cj__popup--top-right { bottom: 105%; left: 0; }
        .cj__popup--top-left { bottom: 105%; right: 0; }
        .cj__popup--left-top { top: 0; right: 105%; }
        .cj__popup--left-bottom { bottom: 0; right: 105%; }
        .cj__popup--right-top { top: 0; left: 105%; }
        .cj__popup--right-bottom { bottom: 0; left: 105%; }

        .cj__popup-head {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: .45rem;
          padding-bottom: .35rem;
          border-bottom: 1px dashed var(--bg-line);
        }
        .cj__popup-actor {
          display: flex; align-items: center; gap: .45rem;
          font-family: var(--ff-mono); font-size: .64rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase; color: var(--step-color);
        }
        .cj__popup-actor svg {
          width: 15px; height: 15px; color: var(--step-color);
          animation: cjHumanPulse 1.2s ease-in-out infinite alternate;
        }
        @keyframes cjHumanPulse {
          0% { transform: scale(0.9); }
          100% { transform: scale(1.15); }
        }
        .cj__popup-step {
          font-family: var(--ff-mono); font-size: .6rem; font-weight: 700;
          color: var(--ink-35);
        }
        .cj__popup-text {
          font-family: var(--ff-body); font-size: .8rem; line-height: 1.45;
          color: var(--ink); margin: 0; font-weight: 500; min-height: 2.8em;
        }
        .cj__typing-cursor {
          display: inline-block;
          margin-left: 2px;
          font-weight: 700;
          color: var(--step-color);
          animation: cjBlink 0.6s step-end infinite alternate;
        }
        @keyframes cjBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .cj__popup-bar {
          width: 100%; height: 3px; border-radius: 999px;
          background: color-mix(in srgb, var(--step-color) 20%, transparent);
          margin-top: .6rem; overflow: hidden;
        }
        .cj__popup-bar-fill {
          height: 100%; width: 100%;
          background: var(--step-color);
          animation: cjProgressRun 3.8s linear infinite;
          transform-origin: left;
        }
        @keyframes cjProgressRun {
          0% { transform: scaleX(0); }
          100% { transform: scaleX(1); }
        }

        @media (max-width: 768px) {
          .cj__wrap { padding-inline: 0.5rem; }
          .cj__ring-wrap { padding-inline: 46px; padding-block: 1.5rem; }
          .cj__ring { width: 100%; max-width: 480px; height: 350px; }
          .cj__ring-icon-pos { width: 80px; height: 70px; }
          .cj__ring-icon-badge { width: 44px; height: 44px; }
          .cj__ring-icon-badge svg { width: 22px; height: 22px; }
          .cj__ring-icon-label { font-size: .52rem; letter-spacing: 0.02em; }
          .cj__popup { width: 220px; padding: .65rem .75rem; }
          .cj__popup-text { font-size: .72rem; }
        }
        @media (max-width: 480px) {
          .cj__ring-wrap { padding-inline: 38px; padding-block: 1rem; }
          .cj__ring { width: 100%; height: 320px; }
          .cj__ring-icon-pos { width: 72px; height: 64px; }
          .cj__ring-icon-badge { width: 38px; height: 38px; border-radius: 10px; }
          .cj__ring-icon-badge svg { width: 18px; height: 18px; }
          .cj__ring-icon-label { font-size: .48rem; letter-spacing: 0; }
          .cj__ring-center-value { font-size: 1.1rem; }
          .cj__ring-center-label { font-size: .58rem; }
          .cj__popup { display: none; }
        }

        .cj__desc {
          font-family: var(--ff-body); font-size: .85rem; line-height: 1.6;
          color: var(--ink-60);
          margin-top: .75rem;
          padding-top: .75rem;
          border-top: 1px solid var(--bg-line);
        }

        /* ── Overlay Modal ── */
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
          box-shadow: 0 30px 70px -20px rgba(0,0,0,0.55), 0 0 50px -18px var(--step-color);
        }
        .cj__overlay-close {
          position: absolute; top: 1rem; right: 1rem;
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          color: var(--ink-60);
          cursor: pointer;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .cj__overlay-close:hover { color: var(--ink); border-color: var(--step-color); }
        .cj__badge {
          position: relative;
          flex: 0 0 auto;
          width: 54px; height: 54px;
          border-radius: 14px;
          background: color-mix(in srgb, var(--step-color) 15%, var(--bg-raise));
          border: 1.5px solid var(--step-color);
          display: flex; align-items: center; justify-content: center;
          color: var(--step-color);
        }
        .cj__badge svg { width: 26px; height: 26px; }

        .cj__num {
          font-family: var(--ff-body); font-weight: 700; font-size: .72rem;
          letter-spacing: .08em; color: var(--step-color); display: block;
        }
        .cj__label {
          font-family: var(--ff-body); font-weight: 700; font-size: 1.35rem;
          color: var(--ink); margin: .15rem 0 0;
        }
        .cj__tagline {
          font-family: var(--ff-body); font-size: .88rem; line-height: 1.5;
          color: var(--ink-60); margin: .35rem 0 0;
        }
        .cj__metrics {
          display: flex; flex-wrap: wrap; gap: .4rem 1.2rem;
          border-top: 1px solid color-mix(in srgb, var(--step-color) 30%, transparent);
          padding-top: .65rem; margin-top: .75rem;
        }
        .cj__metric {
          display: flex; align-items: baseline; gap: .4rem;
          font-family: var(--ff-body); font-size: .75rem;
        }
        .cj__metric-v { color: var(--step-color); font-weight: 700; }
        .cj__metric-l { color: var(--ink-35); letter-spacing: .04em; text-transform: uppercase; }

        .cj__ask {
          margin-top: 1.25rem;
          padding-top: 1.1rem;
          border-top: 1px solid var(--bg-line);
        }
        .cj__ask-label {
          display: block;
          font-family: var(--ff-mono); font-size: .68rem; font-weight: 600;
          letter-spacing: .12em; text-transform: uppercase;
          color: var(--ink-35); margin-bottom: .65rem;
        }
        .cj__ask-btns {
          display: grid; grid-template-columns: 1fr 1fr; gap: .65rem;
        }
        .cj__ask-btn {
          display: flex; align-items: flex-start; gap: .6rem;
          padding: .75rem .85rem; border-radius: 10px;
          background: color-mix(in srgb, var(--step-color) 8%, var(--bg-base));
          border: 1px solid color-mix(in srgb, var(--step-color) 30%, transparent);
          color: var(--ink); text-align: left; text-decoration: none; cursor: pointer;
          transition: border-color 0.16s ease, background 0.16s ease, transform 0.16s ease;
        }
        .cj__ask-btn svg { flex: 0 0 auto; margin-top: .15rem; color: var(--step-color); }
        .cj__ask-btn span {
          display: flex; flex-direction: column; gap: .1rem;
          font-family: var(--ff-body); font-size: .78rem; line-height: 1.35;
          color: var(--ink-60);
        }
        .cj__ask-btn strong {
          font-family: var(--ff-display); font-weight: 700; font-size: .88rem; color: var(--ink);
        }
        .cj__ask-btn:hover {
          border-color: var(--step-color); background: var(--bg-surface); transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .cj__footer { flex-direction: column; text-align: center; gap: 1rem; }
          .cj__head-meta { display: none; }
          .cj__ask-btns { grid-template-columns: 1fr; }
        }

        .cj__footer {
          margin-top: clamp(2.5rem,4vw,3.5rem);
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.25rem; flex-wrap: wrap;
          border-top: 1px solid var(--bg-line);
          padding-top: clamp(1.5rem, 3vw, 2rem);
        }
        .cj__footer-text {
          font-family: var(--ff-body); font-size: .9rem; color: var(--ink-60);
        }
        .cj__footer-text strong { color: var(--ink); font-weight: 600; }
        .cj__cta {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .75rem 1.6rem; border-radius: 999px;
          background: var(--brand-teal); color: #0d2220;
          font-family: var(--ff-mono); font-weight: 700; font-size: .72rem;
          letter-spacing: .06em; text-transform: uppercase; text-decoration: none;
          transition: background 0.15s ease, transform 0.15s ease;
        }
        .cj__cta:hover { background: #1fa39a; }
        .cj__cta:active { transform: scale(0.97); }
      `}</style>

      <section
        className="cj"
        data-no-anim
        aria-label={t("sectionAria")}
        style={{ ["--active-color" as string]: activeStep.color }}
      >
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
            <span className="cj__head-meta">{t("stepOfLabel", { num: activeStep.num, total: "08" })}</span>
          </div>

          {/* RECTANGULAR TRACK WITH SINGLE TRAIN LIGHT ENGINE */}
          <div className="cj__ring-wrap">
            <div className="cj__ring" role="list" aria-label={t("stepsAria")} ref={ringRef}>

              {/* SVG Single Traveling Train Light Beam */}
              <svg className="cj__track-svg" viewBox="0 0 860 440" preserveAspectRatio="none">
                <rect className="cj__track-bg" x="20" y="20" width="820" height="400" rx="20" />
                <rect
                  className="cj__track-pulse"
                  x="20" y="20" width="820" height="400" rx="20"
                  style={{
                    strokeDasharray: `${TRAIN_FIXED_LEN} ${TOTAL_P - TRAIN_FIXED_LEN}`,
                    strokeDashoffset: -trainOffset,
                  }}
                />
              </svg>

              {/* Central Status Display */}
              <div className="cj__ring-center" aria-hidden="true">
                <span className="cj__ring-center-value">08 STAGES</span>
                <span className="cj__ring-center-label">Connected Client Journey</span>
                <div className="cj__ring-center-live">
                  <span className="cj__live-dot" />
                  <span>Phase {activeStep.num}: {activeStep.label}</span>
                </div>
              </div>

              {/* 8 Step Nodes */}
              {STEPS.map((s, i) => {
                const pos = rectPosition(i);
                const isActive = i === activeIndex;
                const HumanIcon = s.action.icon;
                const popupAlignClass = popupAlignment(i);

                return (
                  <div
                    className={`cj__ring-icon-pos ${isActive ? "cj__ring-icon-pos--active" : ""}`}
                    role="listitem"
                    key={s.id}
                    style={{ left: pos.left, top: pos.top }}
                  >
                    <button
                      type="button"
                      className="cj__ring-icon"
                      style={{ ["--step-color" as string]: s.color }}
                      onMouseEnter={() => {
                        setIsHovered(true);
                        goToStep(i);
                      }}
                      onMouseLeave={() => setIsHovered(false)}
                      onClick={() => {
                        goToStep(i);
                        openCard(s.id);
                      }}
                      onFocus={() => {
                        setIsHovered(true);
                        goToStep(i);
                      }}
                      onBlur={() => setIsHovered(false)}
                      aria-label={s.label}
                    >
                      <div className="cj__ring-icon-badge">
                        <s.Icon strokeWidth={1.8} aria-hidden="true" />
                      </div>
                      <span className="cj__ring-icon-label">{s.label}</span>
                    </button>

                    {/* Pop-Up Action Box Renders When Train STOPS at Logo */}
                    {isActive && !isTravelling && (
                      <div
                        className={`cj__popup ${popupAlignClass}`}
                        style={{ ["--step-color" as string]: s.color }}
                        key={`popup-${s.id}`}
                      >
                        <div className="cj__popup-head">
                          <div className="cj__popup-actor">
                            <HumanIcon strokeWidth={2} />
                            <span>{s.action.actor}</span>
                          </div>
                          <span className="cj__popup-step">STEP {s.num}</span>
                        </div>

                        {/* Character Typewriter Text -> Calls handleTypewriterComplete when finished */}
                        <TypewriterText
                          text={s.action.text}
                          onComplete={handleTypewriterComplete}
                        />

                        <div className="cj__popup-bar">
                          <div className="cj__popup-bar-fill" />
                        </div>
                      </div>
                    )}
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
            <div className="cj__badge">
              <openStep.Icon strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="cj__step-text">
              <span className="cj__num">STEP {openStep.num}</span>
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
