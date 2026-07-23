"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import NextImage from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import { families as localFamilies } from "@/lib/products";
import type { ProductFamily } from "@/lib/products";

const ACCENTS = ["#e11d48", "#f59e0b", "#2bbfb3", "#e11d48"];

interface PrintingMachine {
  src: string;
  model: string;
  series: string;
  speed: string;
  reg: string;
  accent: string;
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
  };
}

function buildMachines(families: ProductFamily[]): PrintingMachine[] {
  return families.filter(f => f.category === "printing").map((f, i) => familyToMachine(f, i));
}

const FALLBACK_MACHINES = buildMachines(localFamilies as ProductFamily[]);

const DURATION = 650;

export default function PrintingShowcase() {
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

  // ── "Press Warm-Up" scroll-in — GSAP + ScrollTrigger, fires once ──
  // Animates a dedicated wrapper div per carousel item (never the role()-
  // positioned item div itself, which the existing carousel/auto-advance
  // logic owns exclusively via inline transform/filter) so this entrance
  // can never fight the carousel's own repositioning or the 3s auto-advance
  // interval. Never touches .ps-ghost-wrap or its children — that stays
  // fully owned by the existing CSS rise-in/drop-out keyframes.
  useEffect(() => {
    let ctx: { revert?: () => void } = {};

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        const itemWraps = carouselWrapRef.current
          ? Array.from(carouselWrapRef.current.querySelectorAll<HTMLElement>("[data-ps-carousel-item]"))
          : [];

        const els = [brandLabelRef.current, counterRef.current, infoBlockRef.current, ctaBlockRef.current, ...itemWraps];
        if (reduced) {
          gsap.set(els, { opacity: 1, clearProps: "all" });
          return;
        }

        const trigger = { trigger: sectionElRef.current, start: "top 70%", toggleActions: "play none none none" };

        // Brand label — masked rise (parent has overflow:hidden)
        gsap.fromTo(brandLabelRef.current, { y: "100%" }, { y: "0%", duration: 0.7, ease: "expo.out", scrollTrigger: trigger });
        gsap.fromTo(counterRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", delay: 0.15, scrollTrigger: trigger });

        // Carousel — back-to-front settle: back role first, sides next, center last with overshoot
        itemWraps.forEach(wrap => {
          const roleAttr = wrap.getAttribute("data-ps-carousel-item");
          const isCenter = roleAttr === "center";
          const isBack = roleAttr === "back";
          const delay = isBack ? 0 : (isCenter ? 0.36 : 0.18);
          gsap.fromTo(wrap,
            { opacity: 0, scale: 0.85, filter: "blur(6px)" },
            {
              opacity: 1, scale: 1, filter: "blur(0px)",
              duration: isCenter ? 0.6 : 0.5,
              ease: isCenter ? "back.out(1.2)" : "power2.out",
              delay,
              scrollTrigger: trigger,
            }
          );
        });

        // Bottom info block + CTA — rise in after the carousel settles
        gsap.fromTo(infoBlockRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.55, scrollTrigger: trigger });
        gsap.fromTo(ctaBlockRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.65, scrollTrigger: trigger });
      }, sectionElRef);
    })();

    return () => { ctx.revert?.(); };
    // Depends on `mounted`: this component renders `null` until mounted
    // becomes true (see the `if (!mounted) return null` below), so refs
    // aren't attached to real DOM nodes until that first true render —
    // running this effect only on `mounted` (not on initial `[]` mount)
    // ensures gsap.context() actually has real elements to work with.
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    // Preload all images
    MACHINES.forEach(m => { const img = new Image(); img.src = m.src; });
    return () => window.removeEventListener("resize", check);
  }, []);

  const navigate = useCallback((dir: "next" | "prev") => {
    if (animating) return;
    setAnimating(true);

    // Compute next index immediately
    const next = dir === "next"
      ? (active + 1) % N
      : (active + N - 1) % N;

    pendingRef.current = next;

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
  }, [animating, active]);

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
              Flexo{" "}
              <span style={{ color: "var(--brand-teal)" }}>Printing Lines</span>
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
            <span>AI Series CI Press</span>
            <span style={{ color: "var(--brand-teal)" }}>·</span>
            <span>
              <span style={{ color: "#fff", fontWeight: 700 }}>{String(active + 1).padStart(2,"0")}</span>
              {" / "}{String(N).padStart(2,"0")}
            </span>
          </div>
        </div>

        {/* ── Carousel ── */}
        <div ref={carouselWrapRef} style={{ position: "absolute", inset: 0, zIndex: 3 }}>
          {MACHINES.map((machine, i) => (
            <div key={machine.model} style={itemStyle(role(i))}>
              {/* Entrance-only wrapper — GSAP exclusively owns this element's
                  scale/opacity/filter for the one-time "Press Warm-Up" reveal.
                  The parent div above keeps its own role-based positioning
                  transform untouched, so the entrance can never fight the
                  carousel's auto-advance repositioning. */}
              <div data-ps-carousel-item={role(i)} style={{ width: "100%", height: "100%", position: "relative" }}>
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
          ))}
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
                { label: "Max speed", value: m.speed },
                { label: "Registration", value: m.reg },
                { label: "Substrates", value: "9 types" },
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
                aria-label={dir === "prev" ? "Previous" : "Next"}
                className="ps-nav-btn"
                style={{
                  width:           isMobile ? 44 : 56,
                  height:          isMobile ? 44 : 56,
                  borderRadius:    "50%",
                  background:      "transparent",
                  border:          "2px solid rgba(255,255,255,0.35)",
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
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.35)";
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
            View all presses
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
                    color: i === active ? "var(--brand-teal)" : "rgba(255,255,255,0.35)",
                    display: "block", minWidth: 28,
                    transition: `color ${DURATION}ms ${ease}`,
                  }}>
                    {String(i + 1).padStart(2,"0")}
                  </span>
                  <span style={{
                    fontFamily: "var(--ff-display)", fontSize: "0.75rem",
                    color: i === active ? "#fff" : "rgba(255,255,255,0.45)",
                    letterSpacing: "0.02em", textTransform: "uppercase",
                    transition: `color ${DURATION}ms ${ease}`,
                  }}>
                    {mac.model}
                  </span>
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
