"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";

gsap.registerPlugin(useGSAP);
import localData from "@/data/products.json";
const localFamilies = (localData as { families: ProductFamily[] }).families;

/* helpers that work with both local and live CMS product data */
function familyImage(f: Pick<ProductFamily, "slug" | "image" | "images">): string {
  if (f.images && f.images.length > 0) return f.images[0];
  if (f.image) return f.image;
  return `/machines/${f.slug}.png`;
}

const CAT_COLORS: Record<string, { accent: string; bg: string }> = {
  "film-blowing": { accent: "#2bbfb3", bg: "rgba(43,191,179,0.08)" },
  "bag-making":   { accent: "#f59e0b", bg: "rgba(245,158,11,0.08)"  },
  "recycling":    { accent: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
  "printing":     { accent: "#e11d48", bg: "rgba(225,29,72,0.08)"   },
};

const CAT_ICONS: Record<string, string> = {
  "film-blowing": "◈",
  "bag-making":   "◇",
  "recycling":    "↺",
  "printing":     "▦",
};

interface CatalogCms {
  headline1: string;
  headline2: string;
  items: { slug: string; stat: string; label: string }[];
}

export default function MachineCatalogSection() {
  const t = useTranslations("machineCatalog");
  const CAT_LABELS = t.raw("categories") as Record<string, string>;
  const DEFAULT_KEY_SPECS = t.raw("specs") as Record<string, { stat: string; label: string }>;

  const cms = useCms<CatalogCms>("machine-catalog", {
    headline1: t("headline1"),
    headline2: t("headline2"),
    items: [],
  });
  const productsCms = useCms<{ families?: ProductFamily[] }>("products", {});

  const allFamilies = (productsCms.families && productsCms.families.length > 0)
    ? productsCms.families
    : localFamilies;

  const KEY_SPECS: Record<string, { stat: string; label: string }> =
    cms.items && cms.items.length
      ? Object.fromEntries(cms.items.map(i => [i.slug, { stat: i.stat, label: i.label }]))
      : DEFAULT_KEY_SPECS;
  const [activeTab, setActiveTab] = useState<string>("all");
  // true only while showing the tab state active on first paint — used to
  // opt those cards out of the CSS mount-fade in favor of the GSAP entrance.
  // Any tab click sets this false permanently, restoring normal CSS-driven
  // re-renders for every later filter change.
  const isFirstTabRef = useRef(true);

  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef   = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const subRef     = useRef<HTMLParagraphElement>(null);
  const tabsRef    = useRef<HTMLDivElement>(null);
  const gridRef    = useRef<HTMLDivElement>(null);
  const shutterRef = useRef<HTMLDivElement>(null);
  const shutterMarkRef = useRef<HTMLDivElement>(null);

  const revealAll = () => {
    [badgeRef.current, titleRef.current, subRef.current, tabsRef.current].filter(Boolean).forEach(el => {
      const e = el as HTMLElement;
      e.style.opacity = "1"; e.style.transform = "none";
    });
    if (gridRef.current) {
      gridRef.current.setAttribute("data-mcs-batch-done", "");
      gridRef.current.querySelectorAll<HTMLElement>(".mcs-card").forEach(el => { el.style.opacity = "1"; el.style.transform = "none"; });
    }
    if (shutterRef.current) shutterRef.current.style.display = "none";
  };

  // ScrollTrigger is a separate plugin bundle — load it lazily since this
  // section is below the fold, then hand off to useGSAP once it's ready.
  const [pluginReady, setPluginReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      setPluginReady(true);
    }).catch(() => { if (!cancelled) revealAll(); });
    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 4000);
    return () => { cancelled = true; clearTimeout(fallback); };
  }, []);

  // ── "Batch Load" scroll-in — GSAP + ScrollTrigger, fires once ever ──
  // Deliberately NOT dependent on activeTab: individual .mcs-card nodes
  // are unmounted/remounted on every tab-filter click (different
  // `filtered` array), so this entrance binds only to the stable grid
  // container and plays exactly once. Subsequent tab-driven re-renders
  // are handled entirely by the existing CSS `mcs-fade-in` keyframe.
  useGSAP(() => {
    if (!pluginReady) return;
    if (gridRef.current?.hasAttribute("data-mcs-batch-done")) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = [badgeRef.current, titleRef.current, subRef.current, tabsRef.current];
    if (reduced) {
      gsap.set(els, { opacity: 1, clearProps: "all" });
      if (gridRef.current) gsap.set(gridRef.current.querySelectorAll(".mcs-card"), { opacity: 1, clearProps: "all" });
      gridRef.current?.setAttribute("data-mcs-batch-done", "");
      return;
    }

    // reversible: plays on the way down, reverses on the way back up
    const headTrigger = { trigger: sectionRef.current, start: "top 85%", end: "bottom top", toggleActions: "play reverse play reverse" };
    const trigger = { trigger: gridRef.current, start: "top 88%", end: "bottom top", toggleActions: "play reverse play reverse" };

    // Press-plate shutter: a bordered panel with the company mark centered
    // covers the whole section, then scales down and clears before the
    // header/grid content underneath starts its own reveal. Everything
    // else below is offset by SHUTTER_CLEAR so it only starts moving once
    // the shutter has finished wiping away.
    const SHUTTER_CLEAR = 0.95;

    // One timeline per unique trigger element instead of one ScrollTrigger
    // per tween (was 6 separate instances all watching sectionRef) — same
    // relative timing, fewer ScrollTrigger instances to track on scroll.
    const headTl = gsap.timeline({ scrollTrigger: headTrigger, delay: SECTION_ELEMENT_DELAY });

    if (shutterRef.current) {
      headTl
        .to(shutterMarkRef.current, { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
        .to(shutterRef.current, { scaleY: 0, duration: 0.55, ease: "power3.inOut", transformOrigin: "top center" }, 0.4)
        .set(shutterRef.current, { display: "none" }, ">");
    }

    headTl
      .fromTo(badgeRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, SHUTTER_CLEAR)
      .fromTo(titleRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out" }, SHUTTER_CLEAR + 0.08)
      .fromTo(subRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" }, SHUTTER_CLEAR + 0.18);

    // Tabs — border draws in, then each tab lifts with a fast stagger
    if (tabsRef.current) {
      headTl.fromTo(tabsRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 0.5, ease: "power2.out" }, SHUTTER_CLEAR + 0.25);
      const tabs = Array.from(tabsRef.current.querySelectorAll<HTMLElement>(".mcs__tab"));
      headTl.fromTo(tabs, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", stagger: 0.04 }, SHUTTER_CLEAR + 0.35);
    }

    // Grid — column-major "batch load" stagger, auto-detects columns from layout,
    // cards tilt up out of real depth (steeper rotateX + perspective than
    // before for a more physically 3D feel, not just a flat lift). Mark the
    // grid done immediately (not just on tween start) so the CSS mount-fade
    // is suppressed for the same frame GSAP takes over — otherwise the
    // still-running CSS animation's computed opacity can briefly outrank
    // GSAP's inline opacity:0 before the tween begins. Kept as its own
    // timeline since it watches gridRef, a different trigger element.
    if (gridRef.current) {
      gridRef.current.setAttribute("data-mcs-batch-done", "");
      const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>(".mcs-card"));
      gsap.set(cards, { transformPerspective: 1200, transformOrigin: "50% 100%" });
      gsap.fromTo(cards,
        { opacity: 0, y: 34, scale: 0.92, rotateX: -32 },
        {
          opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.6, ease: "power2.out",
          stagger: { each: 0.05, grid: "auto", from: "start", axis: "x" },
          delay: SECTION_ELEMENT_DELAY + SHUTTER_CLEAR,
          scrollTrigger: trigger,
        }
      );
    }

  }, { scope: sectionRef, dependencies: [pluginReady] });

  const totalFamilies = allFamilies.length;
  const totalModels   = allFamilies.reduce((n, f) => n + f.models.length, 0);

  const filtered = activeTab === "all"
    ? allFamilies
    : allFamilies.filter(f => f.category === activeTab);

  const tabSlugs = [...new Set(allFamilies.map(f => f.category))];
  const tabCounts: Record<string, number> = { all: allFamilies.length };
  tabSlugs.forEach(s => { tabCounts[s] = allFamilies.filter(f => f.category === s).length; });

  return (
    <>
      <style suppressHydrationWarning>{`
        .mcs {
          background: var(--bg-base);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: clamp(4rem,8vw,8rem) 0;
          position: relative;
          overflow: hidden;
        }
        .mcs__wrap {
          max-width: 1600px; margin: 0 auto;
          padding-inline: clamp(1rem,3vw,2.5rem);
          position: relative; z-index: 2;
        }

        /* ── Decorative color blobs ── */
        .mcs__blob {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
        }
        .mcs__blob--t {
          width: min(40vw, 500px); height: min(40vw, 500px);
          top: -10%; right: -5%;
          background: radial-gradient(circle, rgba(43,191,179,0.06) 0%, transparent 70%);
        }
        .mcs__blob--b {
          width: min(50vw, 600px); height: min(50vw, 600px);
          bottom: -15%; left: -10%;
          background: radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%);
        }

        /* ── Header ── */
        .mcs__header {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: clamp(2rem,4vw,3.5rem);
        }
        .mcs__badge {
          display: inline-flex; align-items: center; gap: .45rem;
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: var(--brand-red); margin-bottom: .75rem;
        }
        .mcs__badge::before {
          content: ""; display: inline-block;
          width: 18px; height: 1px;
          background: var(--brand-red);
        }
        .mcs__title {
          font-family: var(--ff-display);
          font-size: clamp(3rem,6vw,6.5rem);
          line-height: .88; letter-spacing: -.02em;
          color: var(--ink); margin: 0 0 .6rem;
        }
        .mcs__title em { font-style: normal; color: var(--brand-teal); }
        .mcs__sub {
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--ink-60); margin: 0;
        }
        .mcs__cta {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .75rem 1.75rem;
          background: transparent; color: var(--ink-60);
          border: 1px solid rgba(255,255,255,0.12);
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .1em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap;
          transition: border-color .18s, color .18s;
          flex-shrink: 0;
        }
        .mcs__cta:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
        [data-theme="light"] .mcs__cta { border-color: rgba(0,0,0,0.15); }
        [data-theme="light"] .mcs__cta:hover { border-color: var(--brand-teal); color: var(--brand-teal); }

        /* ── Tabs ── */
        .mcs__tabs {
          display: flex; align-items: center; gap: .5rem;
          flex-wrap: wrap;
          margin-bottom: clamp(1.5rem,3vw,2.5rem);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding-bottom: 0;
        }
        [data-theme="light"] .mcs__tabs { border-bottom-color: rgba(0,0,0,0.08); }

        .mcs__tab {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .65rem 1.1rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-60);
          cursor: pointer;
          transition: color .15s, border-color .15s;
          white-space: nowrap;
        }
        .mcs__tab:hover { color: var(--ink); }
        .mcs__tab--active { color: var(--ink); border-bottom-color: var(--brand-teal); }

        /* per-category active tab color */
        .mcs__tab--film-blowing { color: var(--ink); border-bottom-color: #2bbfb3; }
        .mcs__tab--bag-making { color: var(--ink); border-bottom-color: #f59e0b; }
        .mcs__tab--recycling { color: var(--ink); border-bottom-color: #22c55e; }
        .mcs__tab--printing { color: var(--ink); border-bottom-color: #e11d48; }

        .mcs__tab-icon { font-size: 1rem; }
        .mcs__tab-count {
          font-size: 0.66rem;
          background: rgba(255,255,255,0.08);
          padding: .15rem .4rem;
          border-radius: 2px;
          color: var(--ink-60);
        }
        [data-theme="light"] .mcs__tab-count { background: rgba(0,0,0,0.07); }
        .mcs__tab--active .mcs__tab-count {
          background: rgba(43,191,179,0.12);
          color: var(--brand-teal);
        }

        /* ── Grid ── */
        .mcs__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
        }
        [data-theme="light"] .mcs__grid {
          background: rgba(0,0,0,0.07);
          border-color: rgba(0,0,0,0.07);
        }

        /* ── Machine card ── */
        .mcs-card {
          background: var(--bg-base);
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
          min-height: 180px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: background .18s, transform .25s cubic-bezier(0.16,1,0.3,1);
        }
        .mcs-card:hover { transform: translateY(-4px); }

        /* machine image — bottom-right, partially visible */
        .mcs-card__bg {
          position: absolute;
          bottom: -8%; right: -4%;
          width: 65%; height: 90%;
          pointer-events: none;
        }
        .mcs-card__bg img {
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: right bottom;
          filter: blur(1.5px) saturate(0.7);
          opacity: 0.22;
          transition: opacity .3s, transform .4s cubic-bezier(0.16,1,0.3,1);
          transform: scale(1);
        }
        .mcs-card:hover .mcs-card__bg img {
          opacity: 0.38;
          transform: scale(1.04);
        }
        [data-theme="light"] .mcs-card__bg img {
          filter: blur(1.5px) saturate(0.5);
          opacity: 0.18;
        }
        [data-theme="light"] .mcs-card:hover .mcs-card__bg img { opacity: 0.3; }

        /* left-side fade so image doesn't clash with text */
        .mcs-card__scrim {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            var(--bg-base) 30%,
            transparent 75%
          );
          pointer-events: none;
        }
        [data-theme="light"] .mcs-card__scrim {
          background: linear-gradient(
            to right,
            #fff 30%,
            transparent 75%
          );
        }

        /* color-coded top accent line */
        .mcs-card::after {
          content: "";
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--brand-teal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .22s cubic-bezier(0.16,1,0.3,1);
        }
        .mcs-card:hover::after { transform: scaleX(1); }
        .mcs-card--film-blowing::after { background: #2bbfb3; }
        .mcs-card--bag-making::after { background: #f59e0b; }
        .mcs-card--recycling::after { background: #22c55e; }
        .mcs-card--printing::after { background: #e11d48; }
        [data-theme="light"] .mcs-card { background: #fff; }

        .mcs-card__cat {
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: .14em; text-transform: uppercase;
          margin-bottom: .4rem;
          display: inline-flex; align-items: center; gap: .45rem;
        }
        .mcs-card__cat-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }
        .mcs-card__series {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-red);
          margin-bottom: .35rem;
        }
        .mcs-card__name {
          font-family: var(--ff-display); font-size: 1.05rem;
          line-height: 1.1; color: var(--ink);
          letter-spacing: -.01em;
        }

        .mcs-card__bottom {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: .5rem;
          margin-top: 1.25rem;
        }
        .mcs-card__stat {
          font-family: var(--ff-display); font-size: 1.6rem;
          line-height: 1; color: var(--ink); letter-spacing: -.02em;
        }
        .mcs-card__stat-label {
          font-family: var(--ff-mono); font-size: 0.66rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-60); display: block; margin-top: .15rem;
        }
        .mcs-card__arrow {
          width: 30px; height: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-60); flex-shrink: 0;
          transition: background .18s, border-color .18s, color .18s;
        }
        [data-theme="light"] .mcs-card__arrow { border-color: rgba(0,0,0,0.12); }
        .mcs-card:hover .mcs-card__arrow {
          background: var(--brand-teal);
          border-color: var(--brand-teal);
          color: #fff;
        }

        /* ── Footer ── */
        .mcs__footer {
          margin-top: 2rem;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        [data-theme="light"] .mcs__footer { border-top-color: rgba(0,0,0,0.07); }
        .mcs__footer-count {
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--ink-60);
        }
        .mcs__footer-count strong {
          font-family: var(--ff-display); font-size: 1.1rem;
          color: var(--ink); letter-spacing: -.01em;
          margin-right: .3rem;
        }
        .mcs__footer-link {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-teal); text-decoration: none;
          transition: opacity .15s;
        }
        .mcs__footer-link:hover { opacity: .7; }

        /* ── Animation ── */
        @keyframes mcs-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .mcs-card {
          animation: mcs-fade-in .32s cubic-bezier(0.16,1,0.3,1) both;
        }
        /* The very first paint's cards are owned entirely by the one-time
           GSAP "Batch Load" entrance (see the effect above) — this class
           opts them out of the CSS mount-fade so the two never fight over
           opacity. Every later tab-filter re-render mounts fresh card
           elements without this class, so they keep using the CSS fade
           exactly as before. */
        .mcs-card--gsap-entrance {
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .mcs-card { animation: none; }
        }

        /* ── Responsive ── */
        @media(max-width:900px) {
          .mcs__grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
        }
        @media(max-width:640px) {
          .mcs { padding: clamp(1.75rem,5vw,2.75rem) 0; }
          .mcs__header { flex-direction: column; align-items: flex-start; gap: 1rem; margin-bottom: clamp(1.25rem,3vw,2rem); }
          .mcs__title { font-size: clamp(2.5rem,9vw,3.5rem); }
          .mcs__grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
          .mcs-card { padding: 1.1rem; min-height: 150px; }
          .mcs-card__name { font-size: .92rem; }
          .mcs-card__stat { font-size: 1.25rem; }
        }
        @media(max-width:480px) {
          .mcs__grid { grid-template-columns: repeat(3, 1fr); }
          .mcs-card { padding: .6rem; min-height: 118px; }
          .mcs-card__cat { gap: .3rem; margin-bottom: .25rem; }
          .mcs-card__cat-label { display: none; }
          .mcs-card__series { font-size: .5rem; margin-bottom: .2rem; }
          .mcs-card__name { font-size: .68rem; line-height: 1.15; }
          .mcs-card__bottom { margin-top: .6rem; gap: .25rem; }
          .mcs-card__stat { font-size: .9rem; }
          .mcs-card__stat-label { font-size: .48rem; margin-top: .1rem; }
          .mcs-card__arrow { width: 20px; height: 20px; }
          .mcs-card__arrow svg { width: 10px; height: 10px; }
          .mcs-card__bg { width: 55%; height: 75%; }
        }

        /* ── Light mode ── */
        [data-theme="light"] .mcs { background: #f5f8f8; }
        [data-theme="light"] .mcs__title { color: #0d2220; }
        [data-theme="light"] .mcs__sub   { color: rgba(13,34,32,0.7); }
        [data-theme="light"] .mcs__badge { color: var(--brand-red); }
        [data-theme="light"] .mcs__tab   { color: rgba(13,34,32,0.7); }
        [data-theme="light"] .mcs__tab:hover { color: #0d2220; }
        [data-theme="light"] .mcs-card__name { color: #0d2220; }
        [data-theme="light"] .mcs-card__stat { color: #0d2220; }
        [data-theme="light"] .mcs-card__stat-label { color: rgba(13,34,32,0.7); }

        /* ── Press-plate shutter — blue/red bordered frame with the
           company mark centered, covers the section on scroll-in and
           wipes away from the bottom up before the grid reveals ── */
        .mcs__shutter {
          position: absolute; inset: 0; z-index: 30;
          background: var(--bg-base);
          border: 3px solid transparent;
          border-image: linear-gradient(135deg, var(--brand-teal), var(--brand-red)) 1;
          display: flex; align-items: center; justify-content: center;
          transform-origin: top center;
          pointer-events: none;
        }
        .mcs__shutter-mark {
          width: clamp(64px, 8vw, 96px); height: clamp(64px, 8vw, 96px);
          border-radius: 50%;
          border: 2px solid var(--brand-teal);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          transform: scale(0.5);
          opacity: 0;
          box-shadow: 0 0 40px rgba(43,191,179,0.25);
        }
        .mcs__shutter-mark img { width: 70%; height: 70%; object-fit: contain; }
        @media (prefers-reduced-motion: reduce) {
          .mcs__shutter { display: none; }
        }

        /* ── 3D card feel: real perspective tilt on hover, not just a
           flat lift, plus a light sheen that sweeps to sell depth ── */
        .mcs__grid { perspective: 1400px; }
        .mcs-card {
          transform-style: preserve-3d;
          transition: background .18s, transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s;
        }
        .mcs-card:hover {
          transform: translateY(-6px) rotateX(6deg) rotateY(-4deg) scale(1.015);
          box-shadow: 0 30px 60px -20px rgba(0,0,0,0.5);
        }
        .mcs-card__top, .mcs-card__bottom { transform: translateZ(24px); }
        .mcs-card::before {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform .6s ease;
          pointer-events: none;
          z-index: 2;
        }
        .mcs-card:hover::before { transform: translateX(100%); }
      `}</style>

      <section ref={sectionRef} className="mcs" data-no-anim aria-label={t("sectionAria")}>
        <div ref={shutterRef} className="mcs__shutter" aria-hidden="true">
          <div ref={shutterMarkRef} className="mcs__shutter-mark">
            <img src="/logo.jpeg" alt="" />
          </div>
        </div>
        <div className="mcs__blob mcs__blob--t" aria-hidden="true" />
        <div className="mcs__blob mcs__blob--b" aria-hidden="true" />
        <div className="mcs__wrap">

          {/* ── Header ── */}
          <div className="mcs__header">
            <div>
              <div ref={badgeRef} className="mcs__badge">{t("badge")}</div>
              <h2 ref={titleRef} className="mcs__title">
                {cms.headline1}<br />
                <em>{cms.headline2}</em>
              </h2>
              <p ref={subRef} className="mcs__sub">
                {totalFamilies} {t("subFamilies")} · {totalModels}+ {t("subModels")} · {t("subShipped")}
              </p>
            </div>
            <TransitionLink href="/products" className="mcs__cta">
              {t("fullCatalogue")}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TransitionLink>
          </div>

          {/* ── Category tabs ── */}
          <div ref={tabsRef} className="mcs__tabs" role="tablist" aria-label={t("filterAria")}>
            <button
              role="tab"
              aria-selected={activeTab === "all"}
              className={`mcs__tab${activeTab === "all" ? " mcs__tab--active" : ""}`}
              onClick={() => { isFirstTabRef.current = false; setActiveTab("all"); }}
            >
              {t("allMachines")}
              <span className="mcs__tab-count">{tabCounts.all}</span>
            </button>
            {tabSlugs.map(slug => {
              const col = CAT_COLORS[slug];
              return (
                <button
                  key={slug}
                  role="tab"
                  aria-selected={activeTab === slug}
                  className={`mcs__tab${activeTab === slug ? ` mcs__tab--active mcs__tab--${slug}` : ""}`}
                  onClick={() => { isFirstTabRef.current = false; setActiveTab(slug); }}
                  style={activeTab === slug ? { borderBottomColor: col?.accent } : undefined}
                >
                  <span className="mcs__tab-icon">{CAT_ICONS[slug] ?? ""}</span>
                  {CAT_LABELS[slug] ?? slug}
                  <span className="mcs__tab-count">{tabCounts[slug]}</span>
                </button>
              );
            })}
          </div>

          {/* ── Machine grid ── */}
          <div ref={gridRef} className="mcs__grid" role="tabpanel">
            {filtered.map((fam, i) => {
              const spec = KEY_SPECS[fam.slug];
              const col = CAT_COLORS[fam.category];
              return (
                <TransitionLink
                  key={fam.slug}
                  href={`/products/${fam.category}/${fam.slug}`}
                  className={`mcs-card mcs-card--${fam.category}${isFirstTabRef.current ? " mcs-card--gsap-entrance" : ""}`}
                  style={{ animationDelay: `${Math.min(i, 15) * 28}ms` }}
                >
                  <div className="mcs-card__bg" aria-hidden="true">
                    <Image src={familyImage(fam)} alt="" fill sizes="(max-width: 900px) 65vw, 320px" loading="lazy" />
                  </div>
                  <div className="mcs-card__scrim" aria-hidden="true" />
                  <div className="mcs-card__top" style={{ position: "relative", zIndex: 1 }}>
                    <div className="mcs-card__cat">
                      <span className="mcs-card__cat-dot" style={{ background: col?.accent }} />
                      <span className="mcs-card__cat-label">{CAT_LABELS[fam.category]}</span>
                    </div>
                    <div className="mcs-card__series" style={{ color: col?.accent }}>{fam.series}</div>
                    <div className="mcs-card__name">{fam.name.split("—")[0].trim()}</div>
                  </div>
                  <div className="mcs-card__bottom" style={{ position: "relative", zIndex: 1 }}>
                    {spec ? (
                      <div>
                        <div className="mcs-card__stat">{spec.stat}</div>
                        <span className="mcs-card__stat-label">{spec.label}</span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="mcs-card__arrow" aria-hidden="true"
                      style={{ borderColor: col ? `${col.accent}44` : undefined }}
                    >
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </TransitionLink>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div className="mcs__footer">
            <p className="mcs__footer-count">
              <strong>{filtered.length}</strong>
              {filtered.length === 1 ? t("footerFamily") : t("footerFamilies")} {t("footerShown")}
            </p>
            <TransitionLink href="/products" className="mcs__footer-link">
              {t("viewAllSpecs")}
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TransitionLink>
          </div>

        </div>
      </section>
    </>
  );
}
