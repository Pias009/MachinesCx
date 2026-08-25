"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";
import localProducts from "@/data/products.json";
import localHeroEn from "@/data/home-hero.json";
import localHeroAr from "@/data/home-hero.ar.json";
import localHeroHi from "@/data/home-hero.hi.json";
import WispBackground from "@/components/WispBackground";

/* the CMS/DB only stores one (English-shaped) copy of this section, so a
   live admin edit always shows in English regardless of locale — these
   locale fallbacks only cover the case where no DB override exists yet */
const HERO_BY_LOCALE: Record<string, typeof localHeroEn> = {
  en: localHeroEn,
  ar: localHeroAr,
  hi: localHeroHi,
};

// react-three-fiber Canvas must be client-only (SSR breaks the hero subtree)
const WaveBackground = dynamic(() => import("@/components/WaveBackground"), {
  ssr: false,
});

const VS = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

// Teal palette — matches logo color #2BBFB3
const FS = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.y -= 0.5;
  uv.x *= u_resolution.x / u_resolution.y;

  vec3 col = vec3(0.0);

  for (float i = 1.0; i <= 6.0; i++) {
    float t = u_time * 0.3 + i * 0.15;
    float y = sin(uv.x * (1.5 + i * 0.2) + t) * 0.15 * cos(t * 0.5);
    y += cos(uv.x * (1.0 + i * 0.3) - t * 0.8) * 0.1;
    float glow = (0.0012 * i) / abs(uv.y - y);
    // Teal palette: #2BBFB3 = vec3(0.17, 0.75, 0.70)
    vec3 c = vec3(0.04 + i * 0.01, 0.38 + i * 0.06, 0.36 + i * 0.05);
    col += c * glow;
  }

  gl_FragColor = vec4(col, 1.0);
}`;

interface ArchPos {
  left: number;
  top: number;
  scale: number;
  opacity: number;
}

/* ── 7 Trajectory Slots along the Arch Curve:
   Index 0: Exit slot off bottom-left circle end (hidden, scale: 0.35, opacity: 0)
   Index 1: Slot 0 (visible far-left, scale: 0.74, opacity: 1)
   Index 2: Slot 1 (visible mid-left, scale: 0.88, opacity: 1)
   Index 3: Slot 2 (visible center apex, scale: 1.0, opacity: 1)
   Index 4: Slot 3 (visible mid-right, scale: 0.88, opacity: 1)
   Index 5: Slot 4 (visible far-right, scale: 0.74, opacity: 1)
   Index 6: Entry slot off bottom-right line (hidden, scale: 0.35, opacity: 0) ── */
const TRAJECTORY: ArchPos[] = [
  { left: -6,  top: 92, scale: 0.35, opacity: 0 },
  { left: 8,   top: 58, scale: 0.74, opacity: 1 },
  { left: 29,  top: 34, scale: 0.88, opacity: 1 },
  { left: 50,  top: 22, scale: 1.0,  opacity: 1 },
  { left: 71,  top: 34, scale: 0.88, opacity: 1 },
  { left: 92,  top: 58, scale: 0.74, opacity: 1 },
  { left: 106, top: 92, scale: 0.35, opacity: 0 },
];

function getTrajectoryPos(cardIndex: number, step: number, totalNodes: number): ArchPos {
  if (totalNodes <= 0) return TRAJECTORY[3];
  if (totalNodes <= 5) {
    const t = totalNodes > 1 ? cardIndex / (totalNodes - 1) : 0.5;
    const left = 8 + t * 84;
    const distFromCenter = Math.abs(t - 0.5) * 2;
    const top = 22 + Math.pow(distFromCenter, 2) * 36;
    const scale = 1.0 - Math.pow(distFromCenter, 2) * 0.26;
    return { left, top, scale, opacity: 1 };
  }

  let rel = (cardIndex - step) % totalNodes;
  if (rel < 0) rel += totalNodes;

  if (rel === 0) return TRAJECTORY[1];
  if (rel === 1) return TRAJECTORY[2];
  if (rel === 2) return TRAJECTORY[3];
  if (rel === 3) return TRAJECTORY[4];
  if (rel === 4) return TRAJECTORY[5];
  if (rel === totalNodes - 1) return TRAJECTORY[0];
  return TRAJECTORY[6];
}

interface HeroFeaturedItem {
  slug: string;
  customImage?: string;
  customSeries?: string;
  customName?: string;
  customHref?: string;
}

interface HeroCms {
  eyebrow: string;
  headline1: string;
  headline2: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  featured: HeroFeaturedItem[];
}

interface CategoryItem {
  slug: string;
  name: string;
}

interface ResolvedHeroNode {
  key: string;
  slug: string;
  category: string;
  categoryName: string;
  series: string;
  name: string;
  image: string;
  href: string;
}

const localFamilies = (localProducts as { families: ProductFamily[] }).families;

function getFamilyImage(f: Pick<ProductFamily, "slug" | "image" | "images">): string {
  if (f.images && f.images.length > 0 && f.images[0]?.trim()) return f.images[0];
  if (f.image && f.image.trim()) return f.image;
  return `/machines/${f.slug}.png`;
}

export default function HeroSplash() {
  const archRef   = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setMounted(true);
    const check = () =>
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const t = useTranslations("heroSplash");
  const locale = useLocale();
  const localHero = HERO_BY_LOCALE[locale] ?? localHeroEn;
  const hero = useCms<HeroCms>("home-hero", localHero as unknown as HeroCms);
  const products = useCms<{ categories?: CategoryItem[]; families: ProductFamily[] }>("products", localProducts as any);
  const categories: CategoryItem[] = products.categories ?? (localProducts.categories as CategoryItem[]);
  const families: ProductFamily[] = products.families ?? localFamilies;

  /* Resolve admin-configured machines for the hero arch section */
  const nodes: ResolvedHeroNode[] = (() => {
    const localBySlug = new Map(localFamilies.map((f) => [f.slug, f]));
    const bySlug = new Map(families.map((f) => [f.slug, f]));
    const cmsItems = hero.featured ?? [];

    if (cmsItems.length > 0) {
      return cmsItems.map((item, idx) => {
        const family = bySlug.get(item.slug) ?? localBySlug.get(item.slug);
        const image = item.customImage?.trim()
          ? item.customImage
          : family
          ? getFamilyImage(family)
          : `/machines/${item.slug || "abcde-2200"}.png`;

        const category = family?.category || "film-blowing";
        const categoryName = categories.find((c) => c.slug === category)?.name || category;
        const series = item.customSeries?.trim() || family?.series || "SERIES";
        const name = item.customName?.trim() || family?.name || item.slug || "Machine";
        const href = item.customHref?.trim() || (family ? `/products/${category}/${family.slug}` : "/products");

        return {
          key: `${item.slug}-${idx}`,
          slug: item.slug || `node-${idx}`,
          category,
          categoryName,
          series,
          name,
          image,
          href,
        };
      });
    }

    const categoriesOrder = ["film-blowing", "bag-making", "printing", "recycling", "film-blowing"];
    const representativeFamilies: ProductFamily[] = [];
    const usedSlugs = new Set<string>();

    for (const catSlug of categoriesOrder) {
      const match = families.find((f) => f.category === catSlug && !usedSlugs.has(f.slug));
      if (match) {
        usedSlugs.add(match.slug);
        representativeFamilies.push(match);
      }
    }

    return representativeFamilies.map((f, idx) => ({
      key: `${f.slug}-rep-${idx}`,
      slug: f.slug,
      category: f.category,
      categoryName: categories.find((c) => c.slug === f.category)?.name || f.category,
      series: f.series,
      name: f.name,
      image: getFamilyImage(f),
      href: `/products/${f.category}/${f.slug}`,
    }));
  })();

  /* Step-and-pause arch trajectory loop:
     Cards sit anchored at 5 arch slots for 2.35s, then advance 1 step along
     the arch trajectory over 0.85s. Cards entering emerge from bottom-right,
     cards exiting fade out into bottom-left. */
  useEffect(() => {
    if (isPaused || nodes.length <= 5) return;

    const timer = setInterval(() => {
      setStep((prev) => prev + 1);
    }, 3200);

    return () => clearInterval(timer);
  }, [isPaused, nodes.length]);

  /* GSAP: reveal media cards left → right, fading in one after another */
  useEffect(() => {
    const root = archRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const { gsap } = await import("gsap");
      if (cancelled || !root) return;
      const cards = Array.from(root.querySelectorAll<HTMLElement>(".hs__node-inner"));
      ctx = gsap.context(() => {
        gsap.set(cards, { opacity: 0, scale: 0.7, y: 35 });
        gsap.to(cards, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.0,
          ease: "back.out(1.4)",
          stagger: 0.12,
          delay: 0.3,
        });
      }, root);
    })();

    return () => { cancelled = true; ctx?.revert(); };
  }, []);

  /* mouse-tracked tilt on the arch cards — each card leans toward the
     cursor independently (distance-weighted so only nearby cards react
     noticeably), lerped toward its target every frame for a smooth
     settle instead of snapping. Pointer-driven only; skipped entirely
     on touch/coarse pointers and under reduced-motion, same guard used
     by ProductStage3D's tilt so the two interactions stay consistent. */
  useEffect(() => {
    const root = archRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (reduced || coarse) return;

    const cards = Array.from(root.querySelectorAll<HTMLElement>(".hs__node-tilt"));
    const targets = cards.map(() => ({ rx: 0, ry: 0 }));
    const current = cards.map(() => ({ rx: 0, ry: 0 }));
    let raf = 0;

    const apply = () => {
      let settled = true;
      cards.forEach((card, i) => {
        const c = current[i];
        const t = targets[i];
        c.rx += (t.rx - c.rx) * 0.12;
        c.ry += (t.ry - c.ry) * 0.12;
        card.style.setProperty("--tilt-x", `${c.rx.toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${c.ry.toFixed(2)}deg`);
        if (Math.abs(t.rx - c.rx) > 0.01 || Math.abs(t.ry - c.ry) > 0.01) settled = false;
      });
      if (!settled) raf = requestAnimationFrame(apply);
    };

    const onMove = (e: PointerEvent) => {
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        // falls off past ~420px so only cards near the cursor react
        const falloff = Math.max(0, 1 - dist / 420);
        targets[i] = {
          rx: (-dy / rect.height) * 10 * falloff,
          ry: (dx / rect.width) * 12 * falloff,
        };
      });
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      targets.forEach((t) => { t.rx = 0; t.ry = 0; });
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  /* scroll parallax — the WebGL background drifts slower than the arch
     as the hero scrolls past, giving the section real depth instead of
     everything moving at the same flat rate. rAF-throttled scroll
     handler (not a scroll-linked CSS var read every event) so it can't
     flood re-renders; writes a CSS var directly, no React state. */
  useEffect(() => {
    const root = archRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const section = root.closest<HTMLElement>(".hs");
    if (!section) return;

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = section.getBoundingClientRect();
        // 0 at the top of viewport, growing as the section scrolls up out of view
        const progress = Math.min(Math.max(-rect.top / Math.max(rect.height, 1), 0), 1);
        section.style.setProperty("--hs-parallax", `${(progress * 90).toFixed(1)}px`);
        section.style.setProperty("--hs-parallax-arch", `${(progress * 40).toFixed(1)}px`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .hs {
          position: relative;
          background: var(--bg-base);
          min-height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Colorful decorative circles */
        .hs__shape {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
        }
        .hs__shape--1 {
          width: min(50vw, 600px);
          height: min(50vw, 600px);
          top: -10%;
          right: -5%;
          background: radial-gradient(circle, rgba(43,191,179,0.15) 0%, transparent 70%);
          animation: hs-float 8s ease-in-out infinite;
        }
        .hs__shape--2 {
          width: min(30vw, 400px);
          height: min(30vw, 400px);
          bottom: 5%;
          left: -8%;
          background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%);
          animation: hs-float 11s ease-in-out infinite reverse;
        }
        .hs__shape--3 {
          width: min(20vw, 260px);
          height: min(20vw, 260px);
          top: 40%;
          left: 45%;
          background: radial-gradient(circle, rgba(225,29,72,0.08) 0%, transparent 70%);
          animation: hs-float 14s ease-in-out infinite 2s;
        }
        @keyframes hs-float {
          0%,100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(10px, -20px) scale(1.03); }
          66%      { transform: translate(-8px, 15px) scale(0.97); }
        }

        /* WebGL canvas — pointer-events none so scroll passes through.
           Drifts on --hs-parallax (set by the scroll handler below) so the
           background reads as sitting further back than the arch/copy in
           front of it, instead of the whole section moving as one flat
           plane. */
        .hs__canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
          opacity: .45;
          mix-blend-mode: screen;
          pointer-events: none;
          transform: translateY(calc(var(--hs-parallax, 0px) * -1));
          will-change: transform;
        }

        /* dark bottom fade */
        .hs__fade {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 220px;
          z-index: 2;
          pointer-events: none;
          background: linear-gradient(to bottom, transparent, var(--bg-base));
        }

        /* ── Light mode overrides ── */
        /* Fully white hero with a subtle light 3D wave texture → text must be dark */
        [data-theme="light"] .hs__shape--1 {
          background: radial-gradient(circle, rgba(43,191,179,0.10) 0%, transparent 70%);
        }
        [data-theme="light"] .hs__shape--2 {
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%);
        }
        [data-theme="light"] .hs__shape--3 {
          background: radial-gradient(circle, rgba(225,29,72,0.06) 0%, transparent 70%);
        }
        [data-theme="light"] section.hs h1.hs__h1 { color: #0d2220 !important; }
        [data-theme="light"] .hs__h1 em { color: var(--brand-teal) !important; }
        [data-theme="light"] .hs__desc { color: rgba(13,34,32,0.72) !important; }
        [data-theme="light"] .hs__btn-secondary {
          color: rgba(13,34,32,0.72) !important;
          border-color: rgba(13,34,32,0.18) !important;
        }
        [data-theme="light"] .hs__btn-secondary:hover {
          border-color: var(--brand-teal) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .hs__node-card {
          background: #eef1f0;
          border-color: rgba(13,34,32,0.10);
          box-shadow: 0 24px 60px -28px rgba(13,34,32,0.25);
        }
        [data-theme="light"] .hs__node-shade {
          background: linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.82) 28%, transparent 58%);
        }
        [data-theme="light"] .hs__node-series { color: var(--brand-teal); }
        [data-theme="light"] .hs__node-name { color: #0d2220; }
        [data-theme="light"] .hs__eyebrow { color: var(--brand-teal) !important; }

        /* JS-driven light state — guarantees dark hero text even if the
           [data-theme] attribute isn't matched at first paint (same isLight
           that swaps the background, so it can never disagree) */
        .hs--light { background: #ffffff; }
        .hs--light .hs__h1  { color: #0d2220 !important; }
        .hs--light .hs__h1 em { color: var(--brand-teal) !important; }
        .hs--light .hs__desc { color: rgba(13,34,32,0.72) !important; }
        .hs--light .hs__eyebrow { color: var(--brand-teal) !important; }
        .hs--light .hs__btn-secondary {
          color: rgba(13,34,32,0.72) !important;
          border-color: rgba(13,34,32,0.18) !important;
        }
        .hs--light .hs__node-card {
          /* Product photos are studio shots on a near-white background —
             a pure white card made them invisible (white-on-white). A
             light neutral gray keeps the light-theme look while giving
             every photo real contrast. */
          background: #eef1f0;
          border-color: rgba(13,34,32,0.10);
          box-shadow: 0 24px 60px -28px rgba(13,34,32,0.25);
        }
        .hs--light .hs__node-shade {
          background: linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.82) 28%, transparent 58%);
        }
        .hs--light .hs__node-series { color: var(--brand-teal); }
        .hs--light .hs__node-name { color: #0d2220; }

        /* Red top accent line — same as SiteNav */
        .hs::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--brand-red);
          z-index: 10;
        }

        /* ── hero copy — pinned to the TOP ── */
        .hs__main {
          position: relative;
          z-index: 6;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: clamp(5.5rem, 10vh, 7.5rem) 1.5rem 1.5rem;
        }

        .hs__eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .26em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1.4rem;
          opacity: 1; animation: hs-rise .8s cubic-bezier(.2,.7,.2,1) .05s both;
        }
        .hs__eyebrow::before, .hs__eyebrow::after {
          content: ""; width: 2rem; height: 1px; background: var(--brand-teal); opacity: .6;
        }

        .hs__h1 {
          font-family: var(--ff-display);
          font-size: clamp(3rem, 7.5vw, 6.5rem);
          line-height: .9;
          letter-spacing: -.01em;
          color: var(--ink);
          margin: 0 0 1.5rem;
          text-wrap: balance;
          opacity: 1; animation: hs-rise .9s cubic-bezier(.2,.7,.2,1) .12s both;
          text-shadow:
            0 1px 0 rgba(255, 255, 255, 0.4),
            0 3px 6px rgba(0, 0, 0, 0.4),
            0 10px 28px rgba(0, 0, 0, 0.6);
        }
        .hs__h1 em {
          font-style: normal;
          color: var(--brand-teal);
          display: block;
          filter: drop-shadow(0 6px 18px rgba(43,191,179,0.45));
        }

        .hs__desc {
          font-family: var(--ff-body);
          font-size: clamp(.95rem, 1.1vw, 1.05rem);
          color: var(--ink-60);
          line-height: 1.7;
          max-width: 46ch;
          margin: 0 0 2.25rem;
          letter-spacing: .01em;
          opacity: 1; animation: hs-rise .9s cubic-bezier(.2,.7,.2,1) .2s both;
        }

        .hs__actions {
          display: flex; align-items: center; gap: 1rem;
          flex-wrap: wrap; justify-content: center;
          opacity: 1; animation: hs-rise .9s cubic-bezier(.2,.7,.2,1) .28s both;
        }

        @keyframes hs-rise {
          from { opacity: 0; transform: translateY(26px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* live stat strip — real, sitewide-consistent claims (not counters
           that fake precision on numbers we don't actually track live) */
        .hs__stats {
          display: flex; align-items: center; gap: 1.5rem;
          margin-top: 2.5rem;
          opacity: 1; animation: hs-rise .9s cubic-bezier(.2,.7,.2,1) .36s both;
        }
        .hs__stat {
          display: flex; flex-direction: column; align-items: center; gap: .3rem;
        }
        .hs__stat-val {
          font-family: var(--ff-display); font-size: clamp(1.15rem, 1.8vw, 1.5rem);
          letter-spacing: -.01em; color: var(--ink); line-height: 1;
        }
        .hs__stat-label {
          font-family: var(--ff-mono); font-size: .62rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-35); white-space: nowrap;
        }
        .hs__stat-div {
          width: 1px; height: 28px;
          background: var(--ink-15);
          flex-shrink: 0;
        }
        .hs--light .hs__stat-label { color: rgba(13,34,32,0.5) !important; }
        .hs--light .hs__stat-div { background: rgba(13,34,32,0.14) !important; }
        [data-theme="light"] .hs__stat-label { color: rgba(13,34,32,0.5) !important; }
        [data-theme="light"] .hs__stat-div { background: rgba(13,34,32,0.14) !important; }

        @media(max-width:640px){
          .hs__stats { gap: 1rem; margin-top: 1.75rem; }
          .hs__stat-div { height: 22px; }
        }
        @media(max-width:480px){
          .hs__stats { gap: .75rem; }
          .hs__stat-label { font-size: .56rem; }
        }

        .hs__btn-primary {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .65rem 1.4rem;
          background: var(--brand-red); color: #fff;
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .09em; text-transform: uppercase; font-weight: 600;
          text-decoration: none; border: 1px solid var(--brand-red);
          transition: background .18s, box-shadow .18s; white-space: nowrap;
        }
        .hs__btn-primary:hover {
          background: #1fa39a;
          box-shadow: 0 4px 20px rgba(43,191,179,0.45);
        }
        .hs__btn-secondary {
          display: inline-flex; align-items: center; gap: .4rem;
          padding: .65rem 1.4rem;
          background: var(--glass-bg); color: var(--ink-60);
          border: 1px solid var(--ink-15);
          -webkit-backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-sat));
                  backdrop-filter: blur(var(--glass-blur-sm)) saturate(var(--glass-sat));
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .09em; text-transform: uppercase;
          text-decoration: none;
          transition: border-color .18s, color .18s, background .18s; white-space: nowrap;
        }
        .hs__btn-secondary:hover {
          border-color: var(--brand-red); color: var(--brand-red);
          background: var(--glass-bg-raise);
        }

        /* ── ARCH of media cards, bottom half ── */
        .hs__arch {
          position: relative;
          z-index: 5;
          flex: 1;
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          min-height: clamp(340px, 42vw, 560px);
          /* rises slightly faster than the background canvas as the
             section scrolls up, so the arch reads as sitting in front of
             it rather than pasted on the same flat plane */
          transform: translateY(calc(var(--hs-parallax-arch, 0px) * -1));
          will-change: transform;
        }

        /* the curved guide line */
        .hs__arch-line {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          pointer-events: none;
          overflow: visible;
        }
        .hs__arch-line path {
          animation: hsArchFlow 12s linear infinite;
        }
        @keyframes hsArchFlow {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -120; }
        }

        /* each media node, positioned along the curve. */
        .hs__node {
          position: absolute;
          transform: translateX(-50%);
          width: clamp(118px, 14vw, 205px);
          transition: left 0.85s cubic-bezier(0.25, 1, 0.5, 1),
                      top 0.85s cubic-bezier(0.25, 1, 0.5, 1),
                      width 0.85s cubic-bezier(0.25, 1, 0.5, 1),
                      opacity 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          will-change: left, top, width, opacity;
        }

        .hs__node-inner {
          animation: hsFloat 4.2s ease-in-out infinite alternate;
          animation-delay: var(--float-delay, 0s);
        }
        @keyframes hsFloat {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-7px); }
        }

        /* mouse-tracked tilt layer — its own transform property so it
           never fights GSAP's entrance tween (on .hs__node-inner, one
           level up) or the hover lift/scale (on .hs__node-card, one level
           down). --tilt-x/--tilt-y are written every frame by the RAF
           lerp loop in the pointermove handler. */
        .hs__node-tilt {
          perspective: 700px;
        }
        .hs__node-tilt > .hs__node-card {
          transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
        }
        .hs__node-tilt > .hs__node-card:hover {
          transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg)) translateY(-8px) scale(1.03);
        }

        .hs__node-card {
          position: relative;
          display: flex;
          flex-direction: column;
          aspect-ratio: 4 / 5;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.18);
          background: radial-gradient(circle at 50% 35%, rgba(43, 191, 179, 0.35) 0%, rgba(12, 22, 20, 0.98) 75%), #0d1614;
          box-shadow: 0 28px 60px -26px rgba(0,0,0,0.85);
          transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s, border-color .3s;
          text-decoration: none;
        }
        .hs__node-card:hover {
          transform: translateY(-8px) scale(1.03);
          border-color: rgba(43,191,179,0.7);
          box-shadow: 0 34px 70px -22px rgba(0,0,0,0.9), 0 0 40px -6px rgba(43,191,179,0.45);
        }

        .hs__node-img-wrap {
          position: relative;
          width: 100%;
          flex: 1 1 auto;
          min-height: 0;
        }

        .hs__node-img {
          object-fit: contain;
          padding: 6%;
          filter: drop-shadow(0 6px 14px rgba(0,0,0,0.7));
          transition: transform .5s cubic-bezier(.2,.7,.2,1);
        }
        .hs__node-card:hover .hs__node-img { transform: scale(1.08); }

        /* liquid glass caption strip */
        .hs__node-meta {
          position: relative;
          width: 100%;
          flex: 0 0 auto;
          padding: .45rem .6rem .55rem;
          text-align: left;
          background: rgba(8, 14, 13, 0.92);
          -webkit-backdrop-filter: blur(12px) saturate(1.5);
                  backdrop-filter: blur(12px) saturate(1.5);
          border-top: 1px solid rgba(255,255,255,0.12);
          z-index: 3;
        }
        .hs__node-series {
          display: block;
          font-family: var(--ff-mono); font-size: .55rem;
          font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--brand-teal);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          margin-bottom: .12rem;
        }
        .hs__node-name {
          display: block;
          font-family: var(--ff-display); font-size: .74rem;
          font-weight: 700;
          line-height: 1.15; color: #ffffff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        @media(prefers-reduced-motion:reduce){
          .hs__canvas { display: none; }
        }

        /* ── responsive: same half-circle arch, scaled down ── */
        @media(max-width: 900px){
          .hs { min-height: auto; }
          .hs__canvas { opacity: .18; }
          .hs__arch {
            min-height: clamp(260px, 75vw, 380px);
            padding: 0 0.5rem 1.5rem;
            margin-bottom: 0.5rem;
          }
          .hs__node { width: calc(22vw * var(--hs-node-scale, 1)) !important; }
          .hs__node-meta { padding: .35rem .45rem .4rem; }
          .hs__node-series { font-size: .46rem; margin-bottom: .05rem; }
          .hs__node-name { font-size: .62rem; }

          /* Elevate arch cards on mobile view so bottom dip cards stay fully inside viewport */
          .hs__arch .hs__node:nth-child(2),
          .hs__arch .hs__node:nth-child(6) {
            top: 44% !important;
          }
          .hs__arch .hs__node:nth-child(3),
          .hs__arch .hs__node:nth-child(5) {
            top: 26% !important;
          }
          .hs__arch .hs__node:nth-child(4) {
            top: 14% !important;
          }
        }
        @media(max-width:640px){
          .hs__main { padding: clamp(5.5rem, 14vh, 7rem) 1.25rem 1.25rem; }
          .hs__h1 { font-size: clamp(2.2rem, 10vw, 3.2rem); }
          .hs__desc { font-size: 0.9rem; }
        }
        @media(max-width:480px){
          .hs__actions { flex-direction: column; width: 100%; max-width: 320px; }
          .hs__btn-primary, .hs__btn-secondary { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className={`hs${mounted && isLight ? " hs--light" : ""}`} aria-label={t("sectionAria")}>

        {/* Decorative floating shapes */}
        <div className="hs__shape hs__shape--1" aria-hidden="true" />
        <div className="hs__shape hs__shape--2" aria-hidden="true" />
        <div className="hs__shape hs__shape--3" aria-hidden="true" />

        {/* 3D background — dark wave scene in light mode, original teal wisp in dark mode */}
        {mounted && isLight ? <WaveBackground /> : <WispBackground />}

        {/* bottom fade */}
        <div className="hs__fade" aria-hidden="true" />

        {/* Hero copy — pinned to the top */}
        <div className="hs__main">
          {hero.eyebrow && <span className="hs__eyebrow" suppressHydrationWarning>{hero.eyebrow}</span>}
          <h1 className="hs__h1">
            <span>{hero.headline1}</span>
            {hero.headline2 && <em>{hero.headline2}</em>}
          </h1>
          {hero.description && (
            <p className="hs__desc">{hero.description}</p>
          )}
          <div className="hs__actions">
            <Link href={hero.primaryHref} className="hs__btn-primary">
              {hero.primaryLabel}
            </Link>
            <Link href={hero.secondaryHref} className="hs__btn-secondary">
              {hero.secondaryLabel}
            </Link>
          </div>

          {/* live stat strip — same real claims used sitewide (trust
              section, delivery timeline, footer), not invented numbers */}
          <div className="hs__stats" role="group" aria-label={t("statsAria")}>
            <div className="hs__stat">
              <span className="hs__stat-val">{t("stat1v")}</span>
              <span className="hs__stat-label">{t("stat1l")}</span>
            </div>
            <span className="hs__stat-div" aria-hidden="true" />
            <div className="hs__stat">
              <span className="hs__stat-val">{t("stat2v")}</span>
              <span className="hs__stat-label">{t("stat2l")}</span>
            </div>
            <span className="hs__stat-div" aria-hidden="true" />
            <div className="hs__stat">
              <span className="hs__stat-val">{t("stat3v")}</span>
              <span className="hs__stat-label">{t("stat3l")}</span>
            </div>
          </div>
        </div>

        {/* ── ARCH of 5 video/media cards ── */}
        <div
          className="hs__arch"
          ref={archRef}
          aria-label={t("archAria")}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* curved guide line */}
          <svg
            className="hs__arch-line"
            viewBox="0 0 1000 400"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="hs-arch-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0"   stopColor="rgba(43,191,179,0)" />
                <stop offset="0.5" stopColor="rgba(43,191,179,0.55)" />
                <stop offset="1"   stopColor="rgba(43,191,179,0)" />
              </linearGradient>
            </defs>
            <path
              d="M0,330 C 250,70 750,70 1000,330"
              fill="none"
              stroke="url(#hs-arch-grad)"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {nodes.map((f, i) => {
            const pos = getTrajectoryPos(i, step, nodes.length);
            const isUnoptimized = f.image.startsWith("http") || f.image.startsWith("/uploads");
            return (
              <div
                key={f.key}
                className="hs__node"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: `calc(clamp(118px, 14vw, 205px) * ${pos.scale})`,
                  opacity: pos.opacity,
                  "--hs-node-scale": pos.scale,
                  "--float-delay": `${(i * 0.45) % 3}s`,
                  zIndex: Math.round(pos.scale * 100),
                  pointerEvents: pos.opacity === 0 ? "none" : "auto",
                } as React.CSSProperties}
              >
                <div className="hs__node-inner">
                  <div className="hs__node-tilt">
                  <Link
                    href={f.href}
                    className="hs__node-card"
                    aria-label={f.name}
                  >
                    <div className="hs__node-img-wrap">
                      <Image
                        src={f.image}
                        alt={f.name}
                        fill
                        sizes="(max-width: 900px) 25vw, 220px"
                        className="hs__node-img"
                        priority={i === 2}
                        loading={i === 2 ? undefined : "lazy"}
                        unoptimized={isUnoptimized}
                      />
                    </div>
                    <span className="hs__node-meta">
                      <span className="hs__node-series">{f.series}</span>
                      <span className="hs__node-name">{f.name}</span>
                    </span>
                  </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>
    </>
  );
}
