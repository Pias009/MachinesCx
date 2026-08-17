"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import { families as localFamilies } from "@/lib/products";
import type { ProductFamily } from "@/lib/products";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const ACCENTS = ["#e11d48", "#f59e0b", "#2bbfb3", "#e11d48"];

interface PrintingMachine {
  src: string;
  model: string;
  series: string;
  speed: string;
  reg: string;
  accent: string;
  hot?: boolean;
}

function familyToMachine(f: ProductFamily, idx: number): PrintingMachine {
  const speedSpec = f.specs?.find(s => /speed/i.test(s.label));
  const regSpec = f.specs?.find(s => /regist(?:ration|er)/i.test(s.label));
  const colourSpec = f.specs?.find(s => /colours?/i.test(s.label));
  const images = (f.images?.length ? f.images : f.image ? [f.image] : [`/machines/${f.slug}.png`]);
  const model = f.series?.split("·")[0]?.trim() || f.series;
  const numColours = colourSpec ? colourSpec.values[0] : "";
  return {
    src: images[0],
    model,
    series: numColours ? `${numColours}-Colour Press` : f.name,
    speed: speedSpec ? speedSpec.values[0] : "",
    reg: regSpec ? regSpec.values[0] : "",
    accent: ACCENTS[idx % ACCENTS.length],
    hot: f.slug === "flexo-4c",
  };
}

function buildMachines(families: ProductFamily[]): PrintingMachine[] {
  return families.filter(f => f.category === "printing").map((f, i) => familyToMachine(f, i));
}

const FALLBACK_MACHINES = buildMachines(localFamilies as ProductFamily[]);

const DURATION = 650;

export default function PrintingShowcase() {
  const t = useTranslations("printingShowcase");
  const cms = useCms<{ items?: PrintingMachine[] }>("printing-showcase", { items: FALLBACK_MACHINES });
  const MACHINES = cms.items && cms.items.length ? cms.items : FALLBACK_MACHINES;
  const N = MACHINES.length;

  const [active,      setActive]      = useState(0);
  const [displayed,   setDisplayed]   = useState(0);   // what's currently shown
  const [exiting,     setExiting]     = useState(false); // true = drop-out playing
  const [animating,   setAnimating]   = useState(false);
  const [isMobile,    setIsMobile]    = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const pendingRef    = useRef<number | null>(null);
  const sectionElRef  = useRef<HTMLElement>(null);
  const brandLabelRef = useRef<HTMLHeadingElement>(null);
  const counterRef    = useRef<HTMLDivElement>(null);
  const carouselWrapRef = useRef<HTMLDivElement>(null);
  const infoBlockRef   = useRef<HTMLDivElement>(null);
  const ctaBlockRef    = useRef<HTMLDivElement>(null);
  // Book page-turn: the just-outgoing center machine flips away like a
  // page (hinged on its leading edge) to reveal the incoming one underneath,
  // rather than the plain cross-fade the CSS role-transitions still handle
  // for the side/back items. dirRef tracks which way to hinge.
  const pageRef  = useRef<HTMLDivElement>(null);
  const dirRef   = useRef<"next" | "prev">("next");
  const prevActiveRef = useRef(0);

  // ── "Press Warm-Up" scroll-in — GSAP + ScrollTrigger, fires once ──
  // Animates a dedicated wrapper div per carousel item (never the role()-
  // positioned item div itself, which the existing carousel/auto-advance
  // logic owns exclusively via inline transform/filter) so this entrance
  // can never fight the carousel's own repositioning or the 3s auto-advance
  // interval. Never touches .ps-ghost-wrap or its children — that stays
  // fully owned by the existing CSS rise-in/drop-out keyframes.
  const revealAll = () => {
    const itemWraps = carouselWrapRef.current
      ? Array.from(carouselWrapRef.current.querySelectorAll<HTMLElement>("[data-ps-carousel-item]"))
      : [];
    [brandLabelRef.current, counterRef.current, infoBlockRef.current, ctaBlockRef.current, ...itemWraps]
      .filter(Boolean)
      .forEach(el => {
        const e = el as HTMLElement;
        e.style.opacity = "1"; e.style.transform = "none"; e.style.filter = "none";
      });
  };

  // ScrollTrigger is a separate plugin bundle — load it lazily since this
  // section is below the fold, then hand off to useGSAP once it's ready.
  const [pluginReady, setPluginReady] = useState(false);
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      setPluginReady(true);
    }).catch(() => { if (!cancelled) revealAll(); });
    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 4000);
    return () => { cancelled = true; clearTimeout(fallback); };
  }, [mounted]);

  // ── "Press Warm-Up" scroll-in — GSAP + ScrollTrigger, fires once ──
  // Animates a dedicated wrapper div per carousel item (never the role()-
  // positioned item div itself, which the existing carousel/auto-advance
  // logic owns exclusively via inline transform/filter) so this entrance
  // can never fight the carousel's own repositioning or the 3s auto-advance
  // interval. Never touches .ps-ghost-wrap or its children — that stays
  // fully owned by the existing CSS rise-in/drop-out keyframes.
  useGSAP(() => {
    if (!mounted || !pluginReady) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const itemWraps = carouselWrapRef.current
      ? Array.from(carouselWrapRef.current.querySelectorAll<HTMLElement>("[data-ps-carousel-item]"))
      : [];

    const els = [brandLabelRef.current, counterRef.current, infoBlockRef.current, ctaBlockRef.current, ...itemWraps];
    if (reduced) {
      gsap.set(els, { opacity: 1, clearProps: "all" });
      return;
    }

    // Fires as soon as the section is ~20% into the viewport (was 70% — a
    // scroll-triggered section shouldn't still be waiting to start once
    // it's already substantially on-screen) and every internal delay/
    // duration below is compressed to a fraction of the old timing — this
    // used to take ~1.15s from trigger to fully settled (on top of a
    // separate 0.7s outer section-push, since removed for this section);
    // now the whole thing lands in well under 0.3s.
    const trigger = { trigger: sectionElRef.current, start: "top 85%", end: "bottom 20%", toggleActions: "play reverse play reverse" };

    // One timeline, one ScrollTrigger for the whole entrance — was 5
    // separate ScrollTrigger instances all watching the same trigger.
    const tl = gsap.timeline({ scrollTrigger: trigger });

    // Brand label — masked rise (parent has overflow:hidden)
    tl.fromTo(brandLabelRef.current, { y: "100%" }, { y: "0%", duration: 0.22, ease: "power3.out" }, 0);
    tl.fromTo(counterRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.04);

    // Carousel — back-to-front settle: back role first, sides next, center
    // last with overshoot. Side items swing in with rotateY (left side from
    // its own left, right side from its own right) so the settle reads as
    // panels rotating into a real 3D carousel, not a flat scale/blur pop.
    itemWraps.forEach(wrap => {
      const roleAttr = wrap.getAttribute("data-ps-carousel-item");
      const isCenter = roleAttr === "center";
      const isBack = roleAttr === "back";
      const isLeft = roleAttr === "left";
      const delay = isBack ? 0 : (isCenter ? 0.1 : 0.05);
      const fromRotateY = isCenter || isBack ? 0 : (isLeft ? 35 : -35);
      gsap.set(wrap, { transformPerspective: 1000 });
      tl.fromTo(wrap,
        { opacity: 0, scale: 0.85, filter: "blur(6px)", rotateY: fromRotateY, willChange: "filter, transform, opacity" },
        {
          opacity: 1, scale: 1, filter: "blur(0px)", rotateY: 0,
          duration: isCenter ? 0.22 : 0.18,
          ease: isCenter ? "back.out(1.2)" : "power2.out",
          clearProps: "willChange",
        },
        delay
      );
    });

    // Bottom info block + CTA — rise in right after the carousel settles
    tl.fromTo(infoBlockRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, 0.15);
    tl.fromTo(ctaBlockRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.16, ease: "power2.out" }, 0.18);
    // Depends on `mounted`: this component renders `null` until mounted
    // becomes true (see the `if (!mounted) return null` below), so refs
    // aren't attached to real DOM nodes until that first true render —
    // running this effect only once mounted+pluginReady ensures GSAP
    // actually has real elements to work with.
  }, { scope: sectionElRef, dependencies: [mounted, pluginReady] });

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Preload all machine images — re-runs when live CMS data swaps in over
  // the fallback (cms.items only changes reference on that one swap, so
  // this doesn't refire on every render like depending on MACHINES would).
  useEffect(() => {
    MACHINES.forEach(m => { const img = new Image(); img.src = m.src; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cms.items]);

  const navigate = useCallback((dir: "next" | "prev") => {
    if (animating) return;
    setAnimating(true);

    // Compute next index immediately
    const next = dir === "next"
      ? (active + 1) % N
      : (active + N - 1) % N;

    pendingRef.current = next;
    dirRef.current = dir;

    // 1. Trigger carousel + accent changes immediately
    setActive(next);

    // 2. Start drop-out of current ghost text
    setExiting(true);

    // 3. After exit animation (400ms), swap displayed text and rise in
    setTimeout(() => {
      setDisplayed(next);
      setExiting(false);
    }, 400);

    // 4. Release animating lock after full cycle
    setTimeout(() => setAnimating(false), DURATION);
  }, [animating, active, N]);

  // ── Book page-turn: whenever the center machine changes, the new page
  // swings in from edge-on (hinged on its leading edge — left for "next",
  // as if the previous page turned away left-to-right; right for "prev",
  // reversed) down to flat, like a page landing into place. Runs on top of
  // the existing role-based CSS positioning, which still handles the
  // side/back items' cross-fade. ──
  useGSAP(() => {
    if (prevActiveRef.current === active) return; // skip initial mount
    prevActiveRef.current = active;
    const page = pageRef.current;
    if (!page) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isNext = dirRef.current === "next";
    gsap.set(page, {
      transformPerspective: 1600,
      transformOrigin: isNext ? "left center" : "right center",
    });
    gsap.fromTo(page,
      { rotateY: isNext ? 100 : -100 },
      { rotateY: 0, duration: DURATION / 1000, ease: "power2.out" }
    );
  }, { dependencies: [active] });

  // ── auto-advance every 3s, only when section is visible ──
  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        id = setInterval(() => navigate("next"), 3000);
      } else {
        if (id) { clearInterval(id); id = null; }
      }
    }, { threshold: 0.2 });
    const el = sectionElRef.current;
    if (el) ob.observe(el);
    return () => { if (id) clearInterval(id); ob.disconnect(); };
  }, [navigate]);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigate("next");
      if (e.key === "ArrowLeft")  navigate("prev");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const m    = MACHINES[active];
  const ease = "cubic-bezier(0.4,0,0.2,1)";
  const tr   = (props: string) => props.split(",").map(p => `${p.trim()} ${DURATION}ms ${ease}`).join(", ");

  const role = (i: number) => {
    if (i === active)               return "center";
    if (i === (active + N - 1) % N) return "left";
    if (i === (active + 1) % N)     return "right";
    return "back";
  };

  // All items share the same fixed height anchored to bottom.
  // transformOrigin: "bottom center" means scale() grows/shrinks upward from
  // the bottom edge — so every role sits flush at the bottom with no gap.
  const BASE_H = isMobile ? "46%" : "58%";
  const S_SIDE = isMobile ? 0.55  : 0.58;
  const S_BACK = isMobile ? 0.38  : 0.40;
  const S_CTR  = isMobile ? 1.0   : 1.0;

  const itemStyle = (r: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      position:        "absolute",
      aspectRatio:     "1.55 / 1",
      height:          BASE_H,
      bottom:          isMobile ? "22%" : 0,   // push up on mobile
      transformOrigin: "bottom center",
      transition:      tr("transform, filter, opacity, left"),
      willChange:      "transform, filter, opacity",
    };
    switch (r) {
      case "center": return { ...base,
        left:      "50%",
        transform: `translateX(-50%) scale(${S_CTR})`,
        filter:    "none",
        opacity:   1,
        zIndex:    20,
      };
      case "left": return { ...base,
        left:      isMobile ? "15%" : "24%",
        transform: `translateX(-50%) scale(${S_SIDE})`,
        filter:    "blur(1.5px)",
        opacity:   0.6,
        zIndex:    10,
      };
      case "right": return { ...base,
        left:      isMobile ? "85%" : "76%",
        transform: `translateX(-50%) scale(${S_SIDE})`,
        filter:    "blur(1.5px)",
        opacity:   0.6,
        zIndex:    10,
      };
      default: return { ...base,
        left:      "50%",
        transform: `translateX(-50%) scale(${S_BACK})`,
        filter:    "blur(3px)",
        opacity:   0.25,
        zIndex:    5,
      };
    }
  };

  if (!mounted) return null;

  return (
    <section ref={sectionElRef} data-ps data-no-anim style={{
      backgroundColor: "var(--bg-base)",
      fontFamily:      "var(--ff-body)",
      position:        "relative",
      width:           "100%",
      overflow:        "hidden",
      borderTop:       "1px solid rgba(255,255,255,0.06)",
    }}>
      <div style={{ position: "relative", width: "100%", height: isMobile ? "52vh" : "100vh", overflow: "hidden" }}>

        {/* ── Accent floor glow behind machines ── */}
        <div style={{
          position:     "absolute",
          bottom:       0, left: "50%",
          transform:    "translateX(-50%)",
          width:        "60%", height: "35%",
          background:   `radial-gradient(ellipse at 50% 100%, ${m.accent}22 0%, transparent 70%)`,
          transition:   `background ${DURATION}ms ${ease}`,
          pointerEvents:"none",
          zIndex:       2,
        }} />

        {/* ── Bottom fade — hides machine base / floor reflection ── */}
        <div style={{
          position:     "absolute",
          bottom:       0, left: 0, right: 0,
          height:       "18%",
          background:   "linear-gradient(to top, var(--bg-base) 0%, var(--bg-base) 30%, transparent 100%)",
          pointerEvents:"none",
          zIndex:       25,
        }} />

        {/* ── Grain overlay ── */}
        <div style={{
          position:       "absolute", inset: 0,
          pointerEvents:  "none",
          zIndex:         50,
          opacity:        0.35,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.08'/%3E%3C/svg%3E")`,
          backgroundSize:  "200px 200px",
          backgroundRepeat: "repeat",
        }} />

        {/* ── Ghost model name — slides up on change ── */}
        <style suppressHydrationWarning>{`
          @keyframes ps-rise-in {
            from { transform: translateY(60px); opacity: 0; }
            to   { transform: translateY(0);    opacity: 1; }
          }
          @keyframes ps-drop-out {
            from { transform: translateY(0);    opacity: 1; }
            to   { transform: translateY(60px); opacity: 0; }
          }
          .ps-ghost-wrap {
            position: absolute;
            inset: 0 0 auto;
            top: 14%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            user-select: none;
            z-index: 2;
          }
          .ps-ghost-text {
            font-family: var(--ff-display);
            font-size: clamp(48px, 18vw, 340px);
            font-weight: 900;
            color: rgba(255,255,255,0.03);
            -webkit-text-stroke: 0.5px rgba(255,255,255,0.07);
            line-height: 1;
            letter-spacing: -0.02em;
            white-space: nowrap;
            text-transform: uppercase;
          }
          .ps-ghost-text--out {
            animation: ps-drop-out 0.38s cubic-bezier(0.4, 0, 1, 1) both;
          }
          .ps-ghost-text--in {
            animation: ps-rise-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          }
          .ps-hot-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-family: var(--ff-mono);
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #fff;
            background: linear-gradient(135deg, var(--brand-rose), #ff6b6b);
            padding: 0.3rem 0.65rem;
            border-radius: 999px;
            margin-bottom: 0.7rem;
            box-shadow: 0 4px 16px -4px rgba(225,29,72,0.6);
            animation: ps-hot-pulse 2s ease-in-out infinite;
          }
          .ps-hot-badge svg { width: 11px; height: 11px; }
          @keyframes ps-hot-pulse {
            0%, 100% { box-shadow: 0 4px 16px -4px rgba(225,29,72,0.6); }
            50%      { box-shadow: 0 4px 22px -2px rgba(225,29,72,0.9); }
          }
          @media (prefers-reduced-motion: reduce) {
            .ps-hot-badge { animation: none; }
          }
          [data-theme="light"] .ps-hot-badge { color: #fff !important; }

          /* ── Light mode overrides ── */
          [data-theme="light"] section[data-ps] {
            background-color: #ffffff !important;
          }
          [data-theme="light"] .ps-ghost-text {
            color: rgba(13,34,32,0.04) !important;
            -webkit-text-stroke: 0.5px rgba(13,34,32,0.08) !important;
          }
          [data-theme="light"] .ps-model-name   { color: #0d2220 !important; }
          [data-theme="light"] .ps-series-label { color: var(--brand-teal) !important; }
          [data-theme="light"] .ps-spec-label   { color: rgba(13,34,32,0.6) !important; }
          [data-theme="light"] .ps-spec-val     { color: #0d2220 !important; }
          [data-theme="light"] .ps-brand-label  { color: rgba(13,34,32,0.65) !important; }
          [data-theme="light"] .ps-counter      { color: rgba(13,34,32,0.55) !important; }
          [data-theme="light"] .ps-view-all     { color: rgba(13,34,32,0.72) !important; }
          [data-theme="light"] .ps-dot-active   { background: var(--brand-teal) !important; }
          [data-theme="light"] .ps-dot-inactive { background: rgba(13,34,32,0.22) !important; }
          [data-theme="light"] .ps-nav-btn      {
            border-color: rgba(13,34,32,0.2) !important;
            color: #0d2220 !important;
          }
          [data-theme="light"] .ps-nav-btn:hover {
            background-color: rgba(13,34,32,0.06) !important;
            border-color: rgba(13,34,32,0.35) !important;
          }
          [data-theme="light"] .ps-col-card {
            background: rgba(13,34,32,0.04) !important;
            border-color: rgba(13,34,32,0.1) !important;
          }
          [data-theme="light"] .ps-col-card--active {
            background: rgba(43,191,179,0.08) !important;
            border-color: var(--brand-teal) !important;
          }
          [data-theme="light"] .ps-col-label { color: #0d2220 !important; }
          [data-theme="light"] .ps-col-num   { color: rgba(13,34,32,0.6) !important; }
          [data-theme="light"] .ps-col-speed { color: rgba(13,34,32,0.55) !important; }
        `}</style>

        <div className="ps-ghost-wrap">
          <span
            key={`ghost-${displayed}-${exiting ? "out" : "in"}`}
            className={`ps-ghost-text ${exiting ? "ps-ghost-text--out" : "ps-ghost-text--in"}`}
          >
            {MACHINES[displayed].model}
          </span>
        </div>

        {/* ── Top center — section label + counter ── */}
        <div style={{
          position:      "absolute",
          top:           0, left: 0, right: 0,
          zIndex:        60,
          display:       "flex",
          flexDirection: "column",
          alignItems:    "center",
          paddingTop:    "clamp(1rem,3vh,1.75rem)",
          gap:           "0.4rem",
          pointerEvents: "none",
        }}>
          <div style={{ overflow: "hidden" }}>
            <h2 ref={brandLabelRef} className="ps-brand-label" style={{
              fontFamily:    "var(--ff-display)",
              fontSize:      "clamp(2.4rem, 6vw, 4.5rem)",
              letterSpacing: "0.01em",
              lineHeight:    1,
              color:         "#fff",
              textAlign:     "center",
              margin:        0,
            }}>
              {t("titlePrefix")}{" "}
              <span style={{ color: "var(--brand-teal)" }}>{t("titleEm")}</span>
            </h2>
          </div>

          <div ref={counterRef} className="ps-counter" style={{
            fontFamily:    "var(--ff-mono)",
            fontSize:      "clamp(0.66rem, 1vw, 0.68rem)",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color:         "rgba(255,255,255,0.7)",
            display:       "flex",
            alignItems:    "center",
            gap:           "0.6rem",
          }}>
            <span>{t("seriesLabel")}</span>
            <span style={{ color: "var(--brand-teal)" }}>·</span>
            <span>
              <span style={{ color: "#fff", fontWeight: 700 }}>{String(active + 1).padStart(2,"0")}</span>
              {" / "}{String(N).padStart(2,"0")}
            </span>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div ref={carouselWrapRef} style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          {MACHINES.map((machine, i) => {
            const isCenter = role(i) === "center";
            return (
            <div key={machine.model} style={itemStyle(role(i))}>
              {/* Entrance-only wrapper — GSAP exclusively owns this element's
                  scale/opacity/filter for the one-time "Press Warm-Up" reveal.
                  The parent div above keeps its own role-based positioning
                  transform untouched, so the entrance can never fight the
                  carousel's auto-advance repositioning. */}
              <div
                data-ps-carousel-item={role(i)}
                ref={isCenter ? pageRef : undefined}
                style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
              >
                <NextImage
                  src={machine.src}
                  alt={machine.model}
                  fill
                  sizes="(max-width: 700px) 90vw, 45vw"
                  draggable={false}
                  style={{
                    objectFit:      "contain",
                    objectPosition: "bottom center",
                    userSelect:     "none",
                    filter: role(i) === "center"
                      ? `drop-shadow(0 12px 32px rgba(0,0,0,0.95))
                         drop-shadow(0 32px 64px rgba(0,0,0,0.6))
                         drop-shadow(0 0 60px ${machine.accent}33)`
                      : `drop-shadow(0 6px 16px rgba(0,0,0,0.85))
                         brightness(0.85)`,
                    transition: `filter ${DURATION}ms ${ease}`,
                  }}
                />
              </div>
            </div>
            );
          })}
        </div>

        {/* ── Bottom-left info + nav ── */}
        <div ref={infoBlockRef} style={{
          position:  "absolute",
          bottom:    "clamp(1.5rem,5vh,4rem)",
          left:      "clamp(1rem,6vw,5rem)",
          zIndex:    60,
          maxWidth:  360,
        }}>
          {/* Accent line */}
          <div style={{
            width:      40,
            height:     2,
            background: m.accent,
            marginBottom: "0.8rem",
            transition: `background ${DURATION}ms ${ease}`,
          }} />

          {/* Hot model badge */}
          {m.hot && (
            <span className="ps-hot-badge">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-.4 3.5-2.2 5.6-4 7.5-1.8 2-3 3.8-3 6.2C5 20.1 8.1 22 12 22s7-1.9 7-6.3c0-2-.8-3.6-1.8-5-.4 1.6-1.3 2.6-2.4 2.6-1.4 0-2.3-1.2-1.9-2.8.6-2.3-.2-5.4-1.9-6.5z"/></svg>
              {t("hotModel")}
            </span>
          )}

          {/* Model + series */}
          <p className="ps-model-name" style={{
            fontFamily:    "var(--ff-display)",
            fontSize:      isMobile ? "clamp(1.2rem,5vw,1.6rem)" : "clamp(2rem,4vw,3.2rem)",
            color:         "white",
            lineHeight:    0.95,
            letterSpacing: "0.01em",
            marginBottom:  "0.3rem",
          }}>
            {m.model}
          </p>
          <p className="ps-series-label" style={{
            fontFamily:    "var(--ff-mono)",
            fontSize:      "0.7rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color:         m.accent,
            marginBottom:  "1rem",
            transition:    `color ${DURATION}ms ${ease}`,
          }}>
            {m.series}
          </p>

          {/* Key specs — hidden on mobile */}
          {!isMobile && (
            <div style={{
              display:       "flex",
              gap:           "1.5rem",
              marginBottom:  "1.5rem",
            }}>
              {[
                { label: t("maxSpeed"), value: m.speed },
                { label: t("registration"), value: m.reg },
                { label: t("substrates"), value: t("substratesValue") },
              ].map(kv => (
                <div key={kv.label}>
                  <div className="ps-spec-label" style={{ fontFamily:"var(--ff-mono)", fontSize:"0.64rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,0.6)", marginBottom:".2rem" }}>{kv.label}</div>
                  <div className="ps-spec-val" style={{ fontFamily:"var(--ff-display)", fontSize:"1.1rem", color:"rgba(255,255,255,.85)", lineHeight:1 }}>{kv.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: "0.65rem" }}>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => navigate(dir)}
                aria-label={dir === "prev" ? t("prev") : t("next")}
                className="ps-nav-btn"
                style={{
                  width:           isMobile ? 44 : 56,
                  height:          isMobile ? 44 : 56,
                  borderRadius:    "50%",
                  background:      "transparent",
                  border:          "2px solid rgba(255,255,255,0.55)",
                  color:           "white",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  cursor:          "pointer",
                  transition:      "transform 150ms ease, background-color 150ms ease, border-color 150ms ease",
                  flexShrink:      0,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.1)";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.12)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.7)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "";
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.55)";
                }}
              >
                {dir === "prev"
                  ? <ArrowLeft  size={isMobile ? 20 : 24} strokeWidth={2} />
                  : <ArrowRight size={isMobile ? 20 : 24} strokeWidth={2} />
                }
              </button>
            ))}
          </div>
        </div>

        {/* ── Bottom-right CTA ── */}
        <div ref={ctaBlockRef} style={{
          position:  "absolute",
          bottom:    "clamp(1.5rem,5vh,4rem)",
          right:     "clamp(1rem,4vw,2.5rem)",
          zIndex:    60,
        }}>
          <TransitionLink
            href="/products/printing"
            className="ps-view-all"
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              gap:           "0.4rem",
              fontFamily:    "var(--ff-mono)",
              fontSize:      "0.72rem",
              fontWeight:    600,
              color:         "rgba(255,255,255,0.75)",
              letterSpacing: "0.12em",
              lineHeight:    1,
              textTransform: "uppercase",
              textDecoration:"none",
              padding:       "0.65rem 1.1rem",
              border:        "1px solid rgba(255,255,255,0.2)",
              transition:    "color 180ms ease, border-color 180ms ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#fff";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.75)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
            }}
          >
            {t("viewAll")}
            <ArrowRight size={14} strokeWidth={2} />
          </TransitionLink>

          {/* mobile: compact column cards / desktop: dot indicators */}
          {isMobile ? (
            <div style={{
              display: "flex", flexDirection: "column",
              gap: "0.35rem", marginTop: "0.75rem",
            }}>
              {MACHINES.map((mac, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (animating || i === active) return;
                    setAnimating(true); setActive(i);
                    setTimeout(() => setAnimating(false), DURATION);
                  }}
                  className={`ps-col-card${i === active ? " ps-col-card--active" : ""}`}
                  style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.4rem 0.6rem",
                    background: i === active ? "rgba(43,191,179,0.1)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${i === active ? "rgba(43,191,179,0.4)" : "rgba(255,255,255,0.07)"}`,
                    borderTop: `2px solid ${i === active ? "var(--brand-teal)" : "transparent"}`,
                    cursor: "pointer", textAlign: "left",
                    transition: `background ${DURATION}ms ${ease}, border-color ${DURATION}ms ${ease}`,
                  }}
                >
                  <span className="ps-col-num" style={{
                    fontFamily: "var(--ff-mono)", fontSize: "0.62rem",
                    letterSpacing: "0.14em", textTransform: "uppercase",
                    color: i === active ? "var(--brand-teal)" : "rgba(255,255,255,0.55)",
                    display: "block", minWidth: 28,
                    transition: `color ${DURATION}ms ${ease}`,
                  }}>
                    {String(i + 1).padStart(2,"0")}
                  </span>
                  <span style={{
                    fontFamily: "var(--ff-display)", fontSize: "0.75rem",
                    color: i === active ? "#fff" : "rgba(255,255,255,0.65)",
                    letterSpacing: "0.02em", textTransform: "uppercase",
                    transition: `color ${DURATION}ms ${ease}`,
                  }}>
                    {mac.model}
                  </span>
                  {mac.hot && (
                    <span style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "var(--brand-rose)", flexShrink: 0,
                    }} aria-label={t("hotModel")} />
                  )}
                  <span style={{
                    fontFamily: "var(--ff-mono)", fontSize: "0.62rem",
                    color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em",
                    marginLeft: "auto", textTransform: "uppercase",
                  }}>
                    {mac.series.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div style={{
              display: "flex", justifyContent: "flex-end",
              gap: "0.35rem", marginTop: "0.8rem",
            }}>
              {MACHINES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (animating || i === active) return;
                    setAnimating(true); setActive(i);
                    setTimeout(() => setAnimating(false), DURATION);
                  }}
                  style={{
                    width: 20, height: 6, borderRadius: 3,
                    background: i === active ? m.accent : "rgba(255,255,255,0.25)",
                    border: "none", cursor: "pointer", padding: 0,
                    transformOrigin: "left center",
                    transform: `scaleX(${i === active ? 1 : 0.3})`,
                    transition: `transform ${DURATION}ms ${ease}, background ${DURATION}ms ${ease}`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
