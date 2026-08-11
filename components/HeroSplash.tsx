"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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

/* ── 5 media nodes distributed along the arch ──
   left  → horizontal position (%) across the section
   top   → vertical offset (%) — apex (center) is highest, edges dip down
   scale → depth: apex biggest, edges smaller                        */
const ARCH = [
  { left: 8,  top: 58, scale: 0.74 },
  { left: 29, top: 34, scale: 0.88 },
  { left: 50, top: 22, scale: 1.0  },
  { left: 71, top: 34, scale: 0.88 },
  { left: 92, top: 58, scale: 0.74 },
] as const;

interface HeroCms {
  eyebrow: string;
  headline1: string;
  headline2: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  featured: { slug: string }[];
}

const localFamilies = (localProducts as { families: ProductFamily[] }).families;

function familyImage(f: Pick<ProductFamily, "slug" | "image" | "images">): string {
  if (f.images && f.images.length > 0) return f.images[0];
  if (f.image) return f.image;
  return `/machines/${f.slug}.png`;
}

export default function HeroSplash() {
  const archRef   = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
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
  const hero = useCms<HeroCms>("home-hero", localHero as HeroCms);
  const products = useCms<{ families: ProductFamily[] }>("products", localProducts as { families: ProductFamily[] });
  const families = products.families ?? localFamilies;

  /* Resolve admin-picked featured slugs → real machine data.
     Falls back to the first machines with photos if none are configured. */
  const nodes: ProductFamily[] = (() => {
    const bySlug = new Map(families.map((f) => [f.slug, f]));
    const picked = (hero.featured ?? [])
      .map((x) => bySlug.get(x.slug))
      .filter((f): f is ProductFamily => !!f)
      .slice(0, 5);
    if (picked.length) return picked;
    return families.slice(0, 5);
  })();

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
        gsap.set(cards, { opacity: 0, x: -80, y: 24 });
        gsap.to(cards, {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.16,
          delay: 0.4,
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
          background: #ffffff;
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
          background: #ffffff;
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
        }
        .hs__h1 em {
          font-style: normal;
          color: var(--brand-teal);
          display: block;
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
          background: transparent; color: var(--ink-60);
          border: 1px solid var(--ink-15);
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .09em; text-transform: uppercase;
          text-decoration: none;
          transition: border-color .18s, color .18s; white-space: nowrap;
        }
        .hs__btn-secondary:hover {
          border-color: var(--brand-red); color: var(--brand-red);
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

        /* each media node, positioned along the curve.
           x/y offset is applied to .hs__node-inner by GSAP so the
           translate(-50%) centering on .hs__node stays intact */
        .hs__node {
          position: absolute;
          transform: translateX(-50%);
          width: clamp(118px, 14vw, 205px);
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
          display: block;
          aspect-ratio: 4 / 5;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          background: #0d1614;
          box-shadow: 0 28px 60px -26px rgba(0,0,0,0.85);
          transition: transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s, border-color .3s;
          text-decoration: none;
        }
        .hs__node-card:hover {
          transform: translateY(-8px) scale(1.03);
          border-color: rgba(43,191,179,0.6);
          box-shadow: 0 34px 70px -22px rgba(0,0,0,0.9), 0 0 40px -6px rgba(43,191,179,0.35);
        }
        .hs__node-img {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          transition: transform .5s cubic-bezier(.2,.7,.2,1);
        }
        .hs__node-card:hover .hs__node-img { transform: scale(1.08); }
        .hs__node-shade {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(5,10,9,0.9) 0%, rgba(5,10,9,0.15) 45%, transparent 75%);
        }

        .hs__node-meta {
          position: absolute; left: 0; right: 0; bottom: 0;
          padding: .7rem .8rem;
          text-align: left;
        }
        .hs__node-series {
          font-family: var(--ff-mono); font-size: .58rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .2rem;
        }
        .hs__node-name {
          font-family: var(--ff-display); font-size: .8rem;
          line-height: 1.15; color: #f8fafc;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media(prefers-reduced-motion:reduce){
          .hs__canvas { display: none; }
        }

        /* ── responsive: same half-circle arch, scaled down — the nodes
           keep their absolute left/top % positions from the ARCH array
           (set inline per-node), so the curve shape is identical to
           desktop, just smaller ── */
        @media(max-width: 900px){
          .hs { min-height: auto; }
          /* the dot/line network is dense relative to a narrow viewport and
             clutters the headline — fade it down instead of showing it full
             strength like on desktop, where it has room to breathe */
          .hs__canvas { opacity: .18; }
          .hs__arch {
            min-height: clamp(220px, 62vw, 340px);
            padding: 0 0.5rem 2rem;
          }
          /* smaller cards so the 8%/29%/50%/71%/92% arch positions don't
             overlap on a narrow viewport — the base clamp() floor (118px)
             is desktop-sized, so this needs !important to win over the
             inline width set per-node from the ARCH array. ~21vw at the
             apex (scale 1) matches the ~21% gap between arch positions,
             so adjacent cards touch edge-to-edge instead of overlapping */
          .hs__node { width: calc(21vw * var(--hs-node-scale, 1)) !important; }
          .hs__node-meta { padding: .5rem .55rem; }
          .hs__node-series { font-size: .5rem; }
          .hs__node-name { font-size: .66rem; -webkit-line-clamp: 1; }
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

      <section className={`hs${isLight ? " hs--light" : ""}`} aria-label={t("sectionAria")}>

        {/* Decorative floating shapes */}
        <div className="hs__shape hs__shape--1" aria-hidden="true" />
        <div className="hs__shape hs__shape--2" aria-hidden="true" />
        <div className="hs__shape hs__shape--3" aria-hidden="true" />

        {/* 3D background — dark wave scene in light mode, original teal wisp in dark mode */}
        {isLight ? <WaveBackground /> : <WispBackground />}

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
        <div className="hs__arch" ref={archRef} aria-label={t("archAria")}>
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
            const pos = ARCH[i];
            return (
              <div
                key={f.slug}
                className="hs__node"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  width: `calc(clamp(118px, 14vw, 205px) * ${pos.scale})`,
                  "--hs-node-scale": pos.scale,
                } as React.CSSProperties}
              >
                <div className="hs__node-inner">
                  <div className="hs__node-tilt">
                  <Link
                    href={`/products/${f.category}/${f.slug}`}
                    className="hs__node-card"
                    aria-label={f.name}
                  >
                    <img
                      src={familyImage(f)}
                      alt={f.name}
                      className="hs__node-img"
                      loading="lazy"
                    />
                    <span className="hs__node-shade" aria-hidden="true" />
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
