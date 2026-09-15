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
function familyImage(f: Pick<ProductFamily, "slug" | "image" | "images">, customImage?: string): string {
  if (customImage && customImage.trim()) return customImage;
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
  items: { slug: string; stat: string; label: string; customImage?: string }[];
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
  const CUSTOM_IMAGES: Record<string, string> =
    cms.items && cms.items.length
      ? Object.fromEntries(cms.items.map(i => [i.slug, i.customImage || ""]))
      : {};
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

    const headTrigger = { trigger: sectionRef.current, start: "top 90%", once: true };
    const trigger = { trigger: gridRef.current, start: "top 92%", once: true };

    const headTl = gsap.timeline({ scrollTrigger: headTrigger });

    if (shutterRef.current) {
      headTl
        .to(shutterMarkRef.current, { scale: 1, opacity: 1, duration: 0.15, ease: "power2.out" }, 0)
        .to(shutterRef.current, { scaleY: 0, duration: 0.25, ease: "power3.inOut", transformOrigin: "top center" }, 0.15)
        .set(shutterRef.current, { display: "none" }, ">");
    }

    headTl
      .fromTo(badgeRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, 0.1)
      .fromTo(titleRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out" }, 0.15)
      .fromTo(subRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" }, 0.2);

    if (tabsRef.current) {
      headTl.fromTo(tabsRef.current, { scaleX: 0 }, { scaleX: 1, transformOrigin: "left center", duration: 0.35, ease: "power2.out" }, 0.2);
      const tabs = Array.from(tabsRef.current.querySelectorAll<HTMLElement>(".mcs__tab"));
      headTl.fromTo(tabs, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.25, ease: "power2.out", stagger: 0.03 }, 0.25);
    }

    if (gridRef.current) {
      gridRef.current.setAttribute("data-mcs-batch-done", "");
      const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>(".mcs-card"));
      gsap.set(cards, { transformPerspective: 1200, transformOrigin: "50% 100%" });
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.96 },
        {
          opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power2.out",
          stagger: { each: 0.03, grid: "auto", from: "start", axis: "x" },
          scrollTrigger: trigger,
        }
      );
    }
  }, { scope: sectionRef });

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
          padding: clamp(4.5rem,8vw,8rem) 0;
          position: relative;
          overflow: hidden;
        }
        .mcs__wrap {
          max-width: 1600px; margin: 0 auto;
          padding-inline: clamp(1rem,3vw,2.5rem);
          position: relative; z-index: 2;
        }

        /* ── Decorative Ambient Lighting Orbs ── */
        .mcs__blob {
          position: absolute; border-radius: 50%; pointer-events: none; z-index: 0;
          filter: blur(60px);
        }
        .mcs__blob--t {
          width: min(45vw, 550px); height: min(45vw, 550px);
          top: -12%; right: -6%;
          background: radial-gradient(circle, rgba(43,191,179,0.09) 0%, transparent 70%);
        }
        .mcs__blob--b {
          width: min(55vw, 650px); height: min(55vw, 650px);
          bottom: -18%; left: -10%;
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%);
        }

        /* ── Header ── */
        .mcs__header {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: clamp(2.5rem,4vw,3.5rem);
        }
        .mcs__badge {
          display: inline-flex; align-items: center; gap: .55rem;
          font-family: var(--ff-mono); font-size: 0.72rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .85rem;
          font-weight: 700;
        }
        .mcs__badge::before {
          content: ""; display: inline-block;
          width: 22px; height: 1.5px;
          background: var(--brand-teal);
          box-shadow: 0 0 8px rgba(43,191,179,0.6);
        }
        .mcs__title {
          font-family: var(--ff-display);
          font-size: clamp(3rem,6vw,6.5rem);
          line-height: .9; letter-spacing: -.025em;
          color: var(--ink); margin: 0 0 .75rem;
        }
        .mcs__title em {
          font-style: normal;
          color: transparent;
          background: linear-gradient(135deg, #2bbfb3 20%, #7ee5dc 100%);
          -webkit-background-clip: text;
          background-clip: text;
        }
        .mcs__sub {
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: var(--ink-60); margin: 0;
          display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;
        }

        /* ── Island Header CTA ── */
        .mcs__cta {
          display: inline-flex; align-items: center; gap: 0.85rem;
          padding: 0.5rem 0.5rem 0.5rem 1.4rem;
          background: rgba(255,255,255,0.05); color: #ffffff;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 9999px;
          -webkit-backdrop-filter: blur(16px);
          backdrop-filter: blur(16px);
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .12em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
          box-shadow: 0 10px 25px -8px rgba(0,0,0,0.3);
        }
        .mcs__cta-disc {
          width: 34px; height: 34px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #ffffff;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mcs__cta:hover {
          background: rgba(43,191,179,0.1);
          border-color: rgba(43,191,179,0.4);
          color: #2bbfb3;
          transform: translateY(-2px);
          box-shadow: 0 16px 32px -10px rgba(43,191,179,0.25);
        }
        .mcs__cta:hover .mcs__cta-disc {
          background: var(--brand-teal);
          color: #040e0d;
          border-color: var(--brand-teal);
          transform: rotate(45deg);
        }
        .mcs__cta:active { transform: translateY(0) scale(0.97); }

        /* ── Floating Hardware Segmented Tabs Dock ── */
        .mcs__tabs-wrapper {
          margin-bottom: clamp(2rem,3.5vw,3rem);
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding-bottom: 4px;
        }
        .mcs__tabs-wrapper::-webkit-scrollbar { display: none; }
        .mcs__tabs {
          display: inline-flex; align-items: center; gap: 0.35rem;
          padding: 0.35rem;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9999px;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 12px 30px -10px rgba(0,0,0,0.35);
        }
        .mcs__tab {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 1.15rem;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9999px;
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          font-weight: 600;
        }
        .mcs__tab:hover {
          color: #ffffff;
          background: rgba(255,255,255,0.06);
        }
        .mcs__tab--active {
          color: #ffffff !important;
          background: rgba(255,255,255,0.12) !important;
          border-color: rgba(255,255,255,0.18) !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.25);
        }
        .mcs__tab--film-blowing.mcs__tab--active {
          background: rgba(43,191,179,0.16) !important;
          border-color: rgba(43,191,179,0.4) !important;
          color: #7ee5dc !important;
        }
        .mcs__tab--bag-making.mcs__tab--active {
          background: rgba(245,158,11,0.16) !important;
          border-color: rgba(245,158,11,0.4) !important;
          color: #fcd34d !important;
        }
        .mcs__tab--recycling.mcs__tab--active {
          background: rgba(34,197,94,0.16) !important;
          border-color: rgba(34,197,94,0.4) !important;
          color: #86efac !important;
        }
        .mcs__tab--printing.mcs__tab--active {
          background: rgba(225,29,72,0.16) !important;
          border-color: rgba(225,29,72,0.4) !important;
          color: #fda4af !important;
        }
        .mcs__tab-icon { font-size: 0.85rem; opacity: 0.9; }
        .mcs__tab-count {
          font-size: 0.65rem;
          background: rgba(255,255,255,0.09);
          padding: 0.12rem 0.45rem;
          border-radius: 9999px;
          color: rgba(255,255,255,0.7);
        }
        .mcs__tab--active .mcs__tab-count {
          background: rgba(255,255,255,0.2);
          color: #ffffff;
        }

        /* ── Hardware Double-Bezel Bento Grid ── */
        .mcs__grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1.25rem;
          background: transparent !important;
          border: none !important;
          perspective: 1400px;
        }

        @media (max-width: 1200px) {
          .mcs__grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1.15rem;
          }
        }

        @media (max-width: 960px) {
          .mcs__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
          }
        }

        /* ── Double-Bezel Card Enclosure (Doppelrand) ── */
        .mcs-card {
          border-radius: 30px;
          padding: 6px;
          position: relative;
          text-decoration: none;
          display: block;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 20px 50px -15px rgba(0,0,0,0.45);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.3s ease,
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          transform-style: preserve-3d;
        }
        .mcs-card:hover {
          transform: translateY(-8px) rotateX(3deg);
          border-color: rgba(43, 191, 179, 0.35);
          box-shadow: 0 32px 70px -18px rgba(0,0,0,0.6), 0 0 30px -10px rgba(43,191,179,0.25);
        }

        /* ── Concentric Inner Core ── */
        .mcs-card__inner {
          border-radius: 24px;
          padding: 2rem 1.85rem;
          min-height: 310px;
          position: relative;
          overflow: hidden !important;
          background: linear-gradient(180deg, rgba(14, 23, 34, 0.88) 0%, rgba(8, 14, 22, 0.95) 100%);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.22);
          display: flex; flex-direction: column; justify-content: space-between;
          transform-style: preserve-3d;
        }

        /* Specular Sheen Effect */
        .mcs-card__inner::before {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,0.09) 50%, transparent 65%);
          transform: translateX(-120%);
          transition: transform 0.75s ease;
          pointer-events: none;
          z-index: 5;
        }
        .mcs-card:hover .mcs-card__inner::before {
          transform: translateX(120%);
        }

        /* Ambient Lighting Inside Card Core */
        .mcs-card__scrim {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          background: radial-gradient(circle at 85% 15%, rgba(255,255,255,0.18) 0%, transparent 60%);
        }
        .mcs-card--film-blowing .mcs-card__scrim {
          background: radial-gradient(circle at 85% 15%, rgba(43,191,179,0.16) 0%, transparent 65%);
        }
        .mcs-card--bag-making .mcs-card__scrim {
          background: radial-gradient(circle at 85% 15%, rgba(245,158,11,0.14) 0%, transparent 65%);
        }
        .mcs-card--recycling .mcs-card__scrim {
          background: radial-gradient(circle at 85% 15%, rgba(34,197,94,0.14) 0%, transparent 65%);
        }
        .mcs-card--printing .mcs-card__scrim {
          background: radial-gradient(circle at 85% 15%, rgba(225,29,72,0.14) 0%, transparent 65%);
        }

        /* 3D Machine Image Container */
        .mcs-card__bg {
          position: absolute;
          bottom: -4%; right: -2%;
          width: 62%; height: 80%;
          max-width: 65%;
          max-height: 85%;
          pointer-events: none;
          z-index: 2;
          transform: translateZ(24px);
        }
        .mcs-card__bg img {
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: right bottom;
          opacity: 0.92;
          filter: drop-shadow(0 16px 28px rgba(0,0,0,0.45));
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mcs-card:hover .mcs-card__bg img {
          transform: scale(1.08) translateY(-6px) translateZ(10px);
        }

        /* Card Top Metadata */
        .mcs-card__top {
          position: relative; z-index: 3;
          transform: translateZ(28px);
        }
        .mcs-card__cat {
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .12em; text-transform: uppercase;
          margin-bottom: .65rem;
          display: inline-flex; align-items: center; gap: .5rem;
          padding: 0.35rem 0.85rem; border-radius: 9999px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff; font-weight: 700;
          width: fit-content;
        }
        .mcs-card__cat-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
          background: currentColor;
          box-shadow: 0 0 8px currentColor;
        }
        .mcs-card__series {
          font-family: var(--ff-mono); font-size: 0.74rem;
          letter-spacing: .14em; text-transform: uppercase;
          font-weight: 700; color: rgba(255,255,255,0.7);
          margin-bottom: .35rem;
        }
        .mcs-card__name {
          font-family: var(--ff-display); font-size: 1.48rem;
          line-height: 1.15; font-weight: 800;
          letter-spacing: -.02em; max-width: 82%;
          color: #ffffff;
        }

        /* Card Bottom Specs & Trailing Disc */
        .mcs-card__bottom {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: .5rem;
          margin-top: 1.85rem; position: relative; z-index: 3;
          transform: translateZ(28px);
        }
        .mcs-card__stat {
          font-family: var(--ff-display); font-size: 1.95rem;
          line-height: 1; font-weight: 900; letter-spacing: -.03em;
          color: #ffffff;
        }
        .mcs-card__stat-label {
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: rgba(255,255,255,0.7); display: block;
          margin-top: .25rem; font-weight: 600;
        }

        /* Button-in-Button Arrow Disc */
        .mcs-card__disc {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.85);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }
        .mcs-card:hover .mcs-card__disc {
          background: var(--brand-teal);
          color: #040e0d;
          border-color: var(--brand-teal);
          transform: rotate(45deg) scale(1.08);
          box-shadow: 0 0 20px rgba(43,191,179,0.5);
        }

        /* Alert badge */
        .new-machine-alert-badge {
          font-family: var(--ff-mono); font-size: 0.65rem;
          letter-spacing: 0.08em; font-weight: 800;
          color: #fcd34d; background: rgba(245,158,11,0.2);
          border: 1px solid rgba(245,158,11,0.4);
          padding: 0.2rem 0.5rem; border-radius: 9999px;
        }

        /* ── Light Mode Overrides ── */
        [data-theme="light"] .mcs-card {
          background: rgba(13,34,32,0.03) !important;
          border-color: rgba(13,34,32,0.1) !important;
          box-shadow: 0 12px 30px -10px rgba(13,34,32,0.06) !important;
        }
        [data-theme="light"] .mcs-card:hover {
          border-color: var(--brand-teal) !important;
          box-shadow: 0 24px 50px -12px rgba(43,191,179,0.25) !important;
        }
        [data-theme="light"] .mcs-card__inner {
          background: #ffffff !important;
          border-color: rgba(13,34,32,0.08) !important;
          box-shadow: inset 0 1px 1px 0 rgba(255,255,255,1), 0 4px 16px rgba(13,34,32,0.04) !important;
        }
        [data-theme="light"] .mcs-card__cat {
          background: rgba(13,34,32,0.06) !important;
          border-color: rgba(13,34,32,0.1) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .mcs-card__series { color: rgba(13,34,32,0.7) !important; }
        [data-theme="light"] .mcs-card__name { color: #0d2220 !important; }
        [data-theme="light"] .mcs-card__stat { color: #0d2220 !important; }
        [data-theme="light"] .mcs-card__stat-label { color: rgba(13,34,32,0.6) !important; }
        [data-theme="light"] .mcs-card__disc {
          background: rgba(13,34,32,0.06) !important;
          border-color: rgba(13,34,32,0.12) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .mcs__tabs {
          background: rgba(13,34,32,0.04) !important;
          border-color: rgba(13,34,32,0.08) !important;
        }
        [data-theme="light"] .mcs__tab { color: rgba(13,34,32,0.65) !important; }
        [data-theme="light"] .mcs__tab:hover { color: #0d2220 !important; }
        [data-theme="light"] .mcs__tab--active {
          background: #ffffff !important;
          border-color: rgba(13,34,32,0.12) !important;
          color: #0d2220 !important;
          box-shadow: 0 4px 12px rgba(13,34,32,0.08) !important;
        }
        [data-theme="light"] .mcs__cta {
          background: #ffffff !important;
          border-color: rgba(13,34,32,0.12) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .mcs__cta-disc {
          background: rgba(13,34,32,0.06) !important;
          border-color: rgba(13,34,32,0.1) !important;
          color: #0d2220 !important;
        }

        /* ── Footer ── */
        .mcs__footer {
          margin-top: 2.5rem;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          padding-top: 1.75rem;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        [data-theme="light"] .mcs__footer { border-top-color: rgba(0,0,0,0.08); }
        .mcs__footer-count {
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-60);
        }
        .mcs__footer-count strong {
          font-family: var(--ff-display); font-size: 1.15rem;
          color: var(--ink); letter-spacing: -.01em;
          margin-right: .35rem;
        }
        .mcs__footer-link {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: var(--brand-teal); text-decoration: none;
          transition: all .2s ease;
          font-weight: 700;
        }
        .mcs__footer-link:hover { opacity: .8; transform: translateX(3px); }

        /* ── Animations ── */
        @keyframes mcs-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .mcs-card {
          animation: mcs-fade-in .35s cubic-bezier(0.16,1,0.3,1) both;
        }
        .mcs-card--gsap-entrance { animation: none; }
        @media (prefers-reduced-motion: reduce) {
          .mcs-card { animation: none; transform: none !important; }
        }

        /* ── Responsive — 2 Cards Per Row on Mobile ── */
        @media(max-width:768px) {
          .mcs__wrap { padding-inline: 0.75rem; }
          .mcs__grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.75rem;
          }
          .mcs-card {
            padding: 3px;
            border-radius: 20px;
            box-shadow: 0 10px 25px -8px rgba(0,0,0,0.4);
          }
          .mcs-card:hover {
            transform: translateY(-4px);
          }
          .mcs-card__inner {
            padding: 1.1rem 0.9rem;
            min-height: 225px;
            border-radius: 17px;
          }
          .mcs-card__cat {
            font-size: 0.54rem;
            padding: 0.2rem 0.55rem;
            letter-spacing: 0.08em;
            margin-bottom: 0.35rem;
          }
          .mcs-card__cat-dot {
            width: 4px; height: 4px;
          }
          .mcs-card__disc {
            width: 26px; height: 26px;
          }
          .mcs-card__disc svg {
            width: 10px; height: 10px;
          }
          .mcs-card__series {
            font-size: 0.6rem;
            letter-spacing: 0.1em;
            margin-bottom: 0.2rem;
          }
          .mcs-card__name {
            font-size: 0.95rem;
            line-height: 1.15;
            max-width: 100%;
            font-weight: 800;
          }
          .mcs-card__bottom {
            margin-top: 1rem;
          }
          .mcs-card__stat {
            font-size: 1.2rem;
            line-height: 1;
          }
          .mcs-card__stat-label {
            font-size: 0.56rem;
            letter-spacing: 0.08em;
            margin-top: 0.15rem;
          }
          .mcs-card__bg {
            width: 68%;
            height: 62%;
            bottom: -2%;
            right: -2%;
          }
        }
        @media(max-width:640px) {
          .mcs { padding: clamp(2rem,5vw,3rem) 0; }
          .mcs__header { flex-direction: column; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
          .mcs__title { font-size: clamp(2.2rem,8.5vw,3.2rem); }
          .mcs__sub { font-size: 0.65rem; gap: 0.4rem; }
          .mcs__cta { padding: 0.4rem 0.4rem 0.4rem 1.1rem; font-size: 0.65rem; }
          .mcs__cta-disc { width: 28px; height: 28px; }
          .mcs__tabs { padding: 0.25rem; gap: 0.25rem; }
          .mcs__tab { padding: 0.45rem 0.85rem; font-size: 0.65rem; }
        }
        @media(max-width:400px) {
          .mcs__wrap { padding-inline: 0.5rem; }
          .mcs__grid { gap: 0.5rem; }
          .mcs-card__inner { padding: 0.9rem 0.75rem; min-height: 210px; }
          .mcs-card__name { font-size: 0.86rem; }
          .mcs-card__stat { font-size: 1.1rem; }
        }

        /* ── Press-plate shutter ── */
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
      `}</style>

      <section ref={sectionRef} className="mcs" data-no-anim aria-label={t("sectionAria")}>
        <div ref={shutterRef} className="mcs__shutter" aria-hidden="true">
          <div ref={shutterMarkRef} className="mcs__shutter-mark">
            <Image src="/logo.jpeg" alt="" width={40} height={40} />
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
                <span>{totalFamilies} {t("subFamilies")}</span>
                <span className="mcs__sub-dot" aria-hidden="true" />
                <span>{totalModels}+ {t("subModels")}</span>
                <span className="mcs__sub-dot" aria-hidden="true" />
                <span>{t("subShipped")}</span>
              </p>
            </div>
            <TransitionLink href="/products" className="mcs__cta">
              <span>{t("fullCatalogue")}</span>
              <span className="mcs__cta-disc" aria-hidden="true">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </TransitionLink>
          </div>

          {/* ── Category tabs ── */}
          <div className="mcs__tabs-wrapper">
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
                  >
                    <span className="mcs__tab-icon">{CAT_ICONS[slug] ?? ""}</span>
                    {CAT_LABELS[slug] ?? slug}
                    <span className="mcs__tab-count">{tabCounts[slug]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Machine grid with Double-Bezel Architecture ── */}
          <div ref={gridRef} className="mcs__grid" role="tabpanel">
            {filtered.map((fam, i) => {
              const spec = KEY_SPECS[fam.slug];
              return (
                <TransitionLink
                  key={fam.slug}
                  href={`/products/${fam.category}/${fam.slug}`}
                  prefetch={false}
                  className={`mcs-card mcs-card--${fam.category}${isFirstTabRef.current ? " mcs-card--gsap-entrance" : ""}`}
                  style={{ animationDelay: `${Math.min(i, 15) * 28}ms` }}
                >
                  <div className="mcs-card__inner">
                    <div className="mcs-card__scrim" aria-hidden="true" />
                    <div className="mcs-card__bg" aria-hidden="true">
                      <Image src={familyImage(fam, CUSTOM_IMAGES[fam.slug])} alt="" fill sizes="(max-width: 900px) 65vw, 320px" loading="lazy" />
                    </div>

                    <div className="mcs-card__top">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                        <div className="mcs-card__cat">
                          <span className="mcs-card__cat-dot" />
                          <span>{CAT_LABELS[fam.category]}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          {(fam as any).isNew && (
                            <span className="new-machine-alert-badge">⚡ NEW</span>
                          )}
                          <div className="mcs-card__disc" aria-hidden="true">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="mcs-card__series">{fam.series}</div>
                      <div className="mcs-card__name">{fam.name.split("—")[0].trim()}</div>
                    </div>

                    <div className="mcs-card__bottom">
                      {spec ? (
                        <div>
                          <div className="mcs-card__stat">{spec.stat}</div>
                          <span className="mcs-card__stat-label">{spec.label}</span>
                        </div>
                      ) : (
                        <div />
                      )}
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
              <span>{t("viewAllSpecs")}</span>
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TransitionLink>
          </div>

        </div>
      </section>
    </>
  );
}
