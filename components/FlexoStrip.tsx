"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AetherBtn from "@/components/AetherBtn";
import { CldImage } from "next-cloudinary";
import TransitionLink from "@/components/TransitionLink";

const MODELS = [
  { slug:"flexo-2c", label:"AI-2C",  colours:2, speed:"120", reg:"±0.2mm",  img:"cx-machinery/printing/flexo-1", tag:"Entry CI Press" },
  { slug:"flexo-4c", label:"AI-4C",  colours:4, speed:"200", reg:"±0.15mm", img:"cx-machinery/printing/flexo-2", tag:"Mid-range · Hot Model", hot:true },
  { slug:"flexo-6c", label:"AI-6C",  colours:6, speed:"260", reg:"±0.1mm",  img:"cx-machinery/printing/flexo-4", tag:"High-speed CI Press" },
  { slug:"flexo-8c", label:"AI-8C",  colours:8, speed:"350", reg:"±0.1mm",  img:"cx-machinery/printing/flexo-3", tag:"Flagship · Max Output", flagship:true },
];

const SPECS = [
  { label:"Substrates",  value:"PE · PP · PET · BOPP · Paper · Non-woven" },
  { label:"Plate types", value:"1.14 / 1.7 / 2.84 mm" },
  { label:"Anilox",      value:"Ceramic, 200–600 LPI" },
  { label:"Power",       value:"380V 3PH 50/60Hz" },
];

// 3-D layer config per card: z depth, x offset %, y offset %, rotation degrees
const LAYERS = [
  { z: -180, xPct: -38, yPct:  14, ry: 18,  rx: -6,  scale: 0.72, opacity: 0.55 },
  { z:  -80, xPct: -14, yPct:   6, ry:  9,  rx: -3,  scale: 0.86, opacity: 0.78 },
  { z:    0, xPct:  10, yPct:  -4, ry: -4,  rx:  2,  scale: 1.00, opacity: 1.00 },
  { z:   80, xPct:  32, yPct: -14, ry:-14,  rx:  5,  scale: 0.90, opacity: 0.88 },
];

export default function FlexoStrip() {
  const sectionRef  = useRef<HTMLElement>(null);
  const headerRef   = useRef<HTMLDivElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const stripRef    = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLSpanElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const [active, setActive] = useState(2); // start on AI-6C (index 2)

  useEffect(() => {
    let ctx: { revert?: () => void } = {};

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText }     = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);

      ctx = gsap.context(() => {
        const easeExp = "expo.out";

        /* ── Eyebrow draw ── */
        gsap.fromTo(eyebrowRef.current,
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 1, ease: easeExp,
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" } }
        );

        /* ── Ink line ── */
        gsap.fromTo(lineRef.current,
          { scaleX: 0, transformOrigin: "left center", opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 1.4, ease: easeExp, delay: 0.2,
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" } }
        );

        /* ── Title split ── */
        if (titleRef.current) {
          const split = new SplitText(titleRef.current, { type: "chars" });
          gsap.fromTo(split.chars,
            { y: "110%", opacity: 0, rotateX: -50, transformOrigin: "0% 50% -20px" },
            { y: "0%", opacity: 1, rotateX: 0, duration: 0.9, ease: easeExp,
              stagger: 0.022, delay: 0.1,
              scrollTrigger: { trigger: sectionRef.current, start: "top 82%", toggleActions: "play none none none" } }
          );
        }

        /* ── 3-D stage entrance: whole stack drops in from above ── */
        gsap.fromTo(stageRef.current,
          { y: 80, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.2, ease: easeExp, delay: 0.35,
            scrollTrigger: { trigger: stageRef.current, start: "top 85%", toggleActions: "play none none none" } }
        );

        /* ── Each layer card fans in from center ── */
        const cards = stageRef.current
          ? Array.from(stageRef.current.querySelectorAll<HTMLElement>(".fls-card"))
          : [];
        gsap.fromTo(cards,
          { x: 0, y: 30, rotateY: 0, opacity: 0, scale: 0.88 },
          { x: (i) => `${LAYERS[i]?.xPct ?? 0}%`,
            y: (i) => `${LAYERS[i]?.yPct ?? 0}%`,
            rotateY: (i) => LAYERS[i]?.ry ?? 0,
            rotateX: (i) => LAYERS[i]?.rx ?? 0,
            scale: (i) => LAYERS[i]?.scale ?? 1,
            opacity: (i) => LAYERS[i]?.opacity ?? 1,
            duration: 1.2, ease: easeExp, stagger: 0.1, delay: 0.5,
            scrollTrigger: { trigger: stageRef.current, start: "top 85%", toggleActions: "play none none none" } }
        );

        /* ── Scroll-driven subtle parallax on the whole stage ── */
        gsap.to(stageRef.current, {
          y: -40,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          },
        });

        /* ── Bottom strip slides up ── */
        gsap.fromTo(stripRef.current,
          { y: 36, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9, ease: easeExp,
            scrollTrigger: { trigger: stripRef.current, start: "top 90%", toggleActions: "play none none none" } }
        );

      }, sectionRef);
    })();

    return () => { ctx.revert?.(); };
  }, []);

  /* ── Magnetic mouse on active card ── */
  const bindMagnet = (el: HTMLElement | null, isActive: boolean) => {
    if (!el || !isActive) return;
    const onMove = (e: MouseEvent) => {
      const r  = el.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * 0.06;
      const dy = (e.clientY - r.top  - r.height / 2) * 0.06;
      el.style.transform = `translateX(calc(${LAYERS[2].xPct}% + ${dx}px)) translateY(calc(${LAYERS[2].yPct}% + ${dy}px)) scale(1.03)`;
    };
    const onLeave = () => { el.style.transform = ""; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  };

  const handleSelect = async (idx: number) => {
    if (idx === active) return;
    const { gsap } = await import("gsap");
    const cards = stageRef.current
      ? Array.from(stageRef.current.querySelectorAll<HTMLElement>(".fls-card"))
      : [];

    // Rotate the stack: clicked card becomes "front" (index 2)
    const shift  = idx - active;
    const newLayers = LAYERS.map((_, i) => {
      const src = ((i + shift) % 4 + 4) % 4;
      return LAYERS[src];
    });

    cards.forEach((card, i) => {
      const l = newLayers[i];
      gsap.to(card, {
        x: `${l.xPct}%`, y: `${l.yPct}%`,
        rotateY: l.ry, rotateX: l.rx,
        scale: l.scale, opacity: l.opacity,
        duration: 0.75, ease: "power3.inOut",
        zIndex: l.z > 0 ? 10 : l.z === 0 ? 20 : 5,
      });
    });
    setActive(idx);
  };

  const m = MODELS[active];

  return (
    <section ref={sectionRef} style={{
      background: "var(--bg-base)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "clamp(5rem,9vw,9rem) 0 clamp(4rem,7vw,7rem)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Ambient red glow behind stage */}
      <div aria-hidden="true" style={{
        position:"absolute", bottom:"10%", left:"55%", transform:"translateX(-50%)",
        width:"55vw", height:"55vw", maxWidth:"700px", maxHeight:"700px",
        background:"radial-gradient(circle, rgba(225,29,72,0.09) 0%, transparent 68%)",
        filter:"blur(60px)", pointerEvents:"none", zIndex:0,
      }} />

      <style suppressHydrationWarning>{`
        /* 3-D stage */
        .fls-stage {
          position: relative;
          width: 100%;
          height: clamp(340px, 52vw, 580px);
          perspective: 1400px;
          perspective-origin: 50% 42%;
        }

        /* Each card absolutely positioned — GSAP drives x/y/rotateY */
        .fls-card {
          position: absolute;
          top: 50%; left: 50%;
          width: clamp(220px, 28vw, 340px);
          background: #0d1018;
          border: 1px solid rgba(255,255,255,0.07);
          overflow: hidden;
          transform-style: preserve-3d;
          cursor: pointer;
          transition: border-color .3s;
          will-change: transform, opacity;
          backface-visibility: hidden;
          margin-top: -50%;
          margin-left: -14vw;
        }
        .fls-card--active {
          border-color: rgba(225,29,72,0.5) !important;
          box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(225,29,72,0.25);
        }

        /* Image inside each card */
        .fls-card__img {
          width: 100%; aspect-ratio: 4/3;
          object-fit: contain; padding: 1.2rem;
          background: radial-gradient(ellipse at 50% 60%, #122120, #0d1614);
          display: block;
          transition: transform .5s cubic-bezier(0.16,1,0.3,1), filter .4s;
          pointer-events: none;
        }
        .fls-card--active .fls-card__img {
          filter: drop-shadow(0 12px 28px rgba(225,29,72,0.2));
        }

        /* Shimmer on active hover */
        .fls-card::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(108deg, transparent 34%, rgba(255,255,255,0.04) 50%, transparent 66%);
          transform: translateX(-140%); pointer-events: none; z-index: 3;
        }
        .fls-card--active:hover::after {
          animation: fls-shim 0.75s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes fls-shim { to { transform: translateX(160%); } }

        /* Bottom red accent bar */
        .fls-card__bar {
          position: absolute; bottom:0; left:0; right:0; height:2px;
          background: var(--brand-red);
          transform: scaleX(0); transform-origin: left;
          transition: transform .4s cubic-bezier(0.16,1,0.3,1); z-index:5;
        }
        .fls-card--active .fls-card__bar { transform: scaleX(1); }

        /* Card label strip */
        .fls-card__foot {
          padding: .75rem 1rem .9rem;
          border-top: 1px solid rgba(255,255,255,.06);
          display: flex; flex-direction: column; gap: .3rem;
        }
        .fls-card__series { font-family: var(--ff-mono); font-size: .48rem; letter-spacing: .2em; text-transform: uppercase; color: var(--brand-red); }
        .fls-card__name   { font-family: var(--ff-display); font-size: 1.45rem; color: #fff; line-height: 1; }
        .fls-card__tag    { font-family: var(--ff-mono); font-size: .48rem; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); }

        /* Badge */
        .fls-badge { position:absolute; top:.8rem; left:.8rem; z-index:6; font-family:var(--ff-mono); font-size:.44rem; letter-spacing:.18em; text-transform:uppercase; padding:.22rem .5rem; }
        .fls-badge--hot      { background:var(--brand-red); color:#fff; }
        .fls-badge--flagship { background:#fff; color:var(--bg-base); }

        /* Right panel — specs for active model */
        .fls-panel {
          display: flex; flex-direction: column; justify-content: center;
          gap: 1.75rem;
        }
        .fls-spec-row {
          display: flex; justify-content: space-between; align-items: baseline;
          padding: .6rem 0; border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .fls-spec-label {
          font-family: var(--ff-mono); font-size: .55rem; letter-spacing: .14em;
          text-transform: uppercase; color: rgba(255,255,255,.3);
        }
        .fls-spec-val {
          font-family: var(--ff-display); font-size: 1rem; color: rgba(255,255,255,.88);
        }

        /* Dot selector */
        .fls-dots {
          display: flex; gap: .5rem; align-items: center; flex-wrap: wrap;
        }
        .fls-dot-btn {
          display: flex; align-items: center; gap: .55rem;
          padding: .5rem .9rem;
          border: 1px solid rgba(255,255,255,.1);
          background: transparent; color: rgba(255,255,255,.45);
          font-family: var(--ff-mono); font-size: .58rem; letter-spacing: .1em;
          text-transform: uppercase; cursor: pointer;
          transition: border-color .2s, color .2s, background .2s;
        }
        .fls-dot-btn:hover { border-color: rgba(255,255,255,.28); color: rgba(255,255,255,.75); }
        .fls-dot-btn--active {
          border-color: var(--brand-red) !important;
          color: #fff !important;
          background: rgba(225,29,72,.1) !important;
        }
        .fls-dot-pip {
          width: 6px; height: 6px;
          background: var(--brand-red);
          opacity: 0;
          transition: opacity .2s;
          flex-shrink: 0;
        }
        .fls-dot-btn--active .fls-dot-pip { opacity: 1; }

        /* Colour bars */
        .fls-colours { display: flex; gap: 2px; align-items: flex-end; height: 14px; }
        .fls-cbar    { width: 6px; border-radius: 0; }

        /* Title overflow clip for SplitText */
        .fls-title-clip { overflow: hidden; }

        /* Layout grid */
        .fls-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: clamp(2rem, 5vw, 5rem);
          align-items: center;
          position: relative; z-index: 1;
        }
        @media (max-width: 900px) {
          .fls-layout { grid-template-columns: 1fr; }
        }

        /* ── Mobile: hide 3D stage, show flat card row ── */
        .fls-mobile-row {
          display: none;
        }
        @media (max-width: 768px) {
          .fls-stage-wrap { display: none !important; }
          .fls-mobile-row {
            display: flex;
            gap: 1px; overflow-x: auto; scrollbar-width: none;
            background: rgba(255,255,255,0.06);
            margin-bottom: 1.5rem;
          }
          .fls-mobile-row::-webkit-scrollbar { display: none; }
          .fls-mobile-card {
            flex-shrink: 0; width: 44vw; min-width: 140px; max-width: 180px;
            background: rgba(255,255,255,0.025);
            display: flex; flex-direction: column;
            border-top: 2px solid transparent;
            transition: border-color .2s;
          }
          .fls-mobile-card--active { border-top-color: var(--brand-teal); background: rgba(43,191,179,0.07); }
          .fls-mobile-card img { width:100%; aspect-ratio:4/3; object-fit:contain; padding:.6rem; background:#0d1614; }
          .fls-mobile-card-label {
            padding: .4rem .6rem .55rem;
            font-family: var(--ff-mono); font-size: .5rem;
            letter-spacing: .12em; text-transform: uppercase;
            color: rgba(255,255,255,.4);
          }
          .fls-mobile-card--active .fls-mobile-card-label { color: var(--brand-teal); }

          .fls-layout { grid-template-columns: 1fr; gap: 1.5rem; }
          .fls-title-clip h2 { font-size: clamp(2rem, 9vw, 3.2rem) !important; }
          .fls-spec-row { flex-direction: column; gap: .15rem; }
          .fls-spec-val { font-size: .85rem; }
          .fls-dot-btn  { padding: .4rem .65rem; font-size: .55rem; }
          .fls-detail-icon { width: 72px; height: 72px; }
          .fls-detail-icon::before { inset: -4px; }
          .fls-detail-heading { font-size: clamp(1.5rem, 8vw, 2.2rem) !important; }
          .fls-panel { gap: 1rem; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fls-card { transition: none !important; }
        }
      `}</style>

      <div className="wrap" style={{ position:"relative", zIndex:1 }}>

        {/* ── Header ── */}
        <div ref={headerRef} style={{ marginBottom:"clamp(2.5rem,5vw,4rem)" }}>
          <span ref={eyebrowRef} style={{
            display:"inline-flex", alignItems:"center", gap:".75rem",
            fontFamily:"var(--ff-mono)", fontSize:".6rem",
            letterSpacing:".22em", textTransform:"uppercase",
            color:"var(--brand-red)", marginBottom:".75rem",
            opacity:0,
          }}>
            <span style={{ width:"2rem", height:"1px", background:"var(--brand-red)", display:"inline-block", flexShrink:0 }} />
            New — Flexographic Printing
          </span>

          <div className="fls-title-clip">
            <h2 ref={titleRef} style={{
              fontFamily:"var(--ff-display)",
              fontSize:"clamp(3rem,6vw,6rem)",
              color:"#fff", lineHeight:.88,
              letterSpacing:".01em", margin:0,
              perspective:"600px",
            }}>
              AI Series Flexo Press.
            </h2>
          </div>

          <div ref={lineRef} style={{
            height:"2px", width:"clamp(200px,40%,480px)",
            background:"linear-gradient(to right, var(--brand-red), rgba(225,29,72,0.15), transparent)",
            margin:".7rem 0 .9rem", opacity:0,
          }} />

          <span style={{
            fontFamily:"var(--ff-display)",
            fontSize:"clamp(1.1rem,2vw,1.65rem)",
            color:"rgba(255,255,255,.28)", display:"block",
          }}>
            2 to 8 colours, 500–2000 mm.
          </span>
        </div>

        {/* ── Mobile flat card row (hidden on desktop) ── */}
        <div className="fls-mobile-row">
          {MODELS.map((model, i) => (
            <div
              key={model.slug}
              className={`fls-mobile-card${i === active ? " fls-mobile-card--active" : ""}`}
              onClick={() => handleSelect(i)}
            >
              <CldImage src={model.img} alt={model.label} width={240} height={180} sizes="44vw" style={{ width:"100%", aspectRatio:"4/3", objectFit:"contain", padding:".6rem", background:"#0d1614", display:"block" }} />
              <div className="fls-mobile-card-label">{model.label} · {model.colours}C</div>
            </div>
          ))}
        </div>

        {/* ── Main layout: 3D stage left + spec panel right ── */}
        <div className="fls-layout">

          {/* 3-D Gallery Stage */}
          <div ref={stageRef} className="fls-stage fls-stage-wrap" style={{ opacity: 0 }}>
            {MODELS.map((model, i) => {
              const l       = LAYERS[i];
              const isActive = i === active;

              return (
                <div
                  key={model.slug}
                  className={`fls-card${isActive ? " fls-card--active" : ""}`}
                  style={{
                    transform: `translateX(${l.xPct}%) translateY(${l.yPct}%) translateZ(${l.z}px) rotateY(${l.ry}deg) rotateX(${l.rx}deg) scale(${l.scale})`,
                    opacity: l.opacity,
                    zIndex: isActive ? 20 : i < 2 ? 5 : 10,
                  }}
                  onClick={() => handleSelect(i)}
                  ref={(el) => { if (el && isActive) bindMagnet(el, true); }}
                >
                  {model.hot      && <span className="fls-badge fls-badge--hot">Hot</span>}
                  {model.flagship && <span className="fls-badge fls-badge--flagship">Flagship</span>}

                  <CldImage
                    src={model.img}
                    alt={model.label}
                    width={480} height={360}
                    className="fls-card__img"
                    sizes="28vw"
                  />

                  <div className="fls-card__foot">
                    <span className="fls-card__series">AI · {model.colours}-colour</span>
                    <span className="fls-card__name">{model.label}</span>
                    <span className="fls-card__tag">{model.tag}</span>
                  </div>

                  <div className="fls-card__bar" />
                </div>
              );
            })}
          </div>

          {/* Spec panel — updates when active changes */}
          <div className="fls-panel">

            {/* Model selector dots */}
            <div>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:".52rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginBottom:".75rem" }}>
                Select model
              </div>
              <div className="fls-dots">
                {MODELS.map((model, i) => (
                  <button
                    key={model.slug}
                    className={`fls-dot-btn${i === active ? " fls-dot-btn--active" : ""}`}
                    onClick={() => handleSelect(i)}
                  >
                    <span className="fls-dot-pip" />
                    {model.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active model headline */}
            <div>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:".52rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--brand-red)", marginBottom:".4rem" }}>
                AI Series · {m.colours}-colour
              </div>
              <div style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2.4rem,4vw,3.6rem)", color:"#fff", lineHeight:.92, letterSpacing:".01em" }}>
                {m.label}
              </div>
              <div style={{ fontFamily:"var(--ff-mono)", fontSize:".6rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.3)", marginTop:".4rem" }}>
                {m.tag}
              </div>

              {/* Colour bars */}
              <div className="fls-colours" style={{ marginTop:"1rem" }}>
                {Array.from({length: m.colours}).map((_,j) => (
                  <div key={j} className="fls-cbar" style={{
                    height: `${5 + (j / (m.colours - 1 || 1)) * 9}px`,
                    background:`rgba(225,29,72,${0.25 + (j / (m.colours - 1 || 1)) * 0.75})`,
                  }} />
                ))}
              </div>
            </div>

            {/* Specs */}
            <div>
              {[
                { label:"Max print speed", value:`${m.speed} m/min` },
                { label:"Registration",    value:m.reg },
                { label:"Print colours",   value:`${m.colours} colours` },
                { label:"Web widths",      value:"500 – 2000 mm" },
              ].map(s => (
                <div key={s.label} className="fls-spec-row">
                  <span className="fls-spec-label">{s.label}</span>
                  <span className="fls-spec-val">{s.value}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div style={{ display:"flex", gap:"1rem", flexWrap:"wrap", alignItems:"center" }}>
              <TransitionLink
                href={`/products/printing#${m.slug}`}
                style={{
                  display:"inline-flex", alignItems:"center", gap:".5rem",
                  fontFamily:"var(--ff-mono)", fontSize:".72rem", letterSpacing:".1em",
                  textTransform:"uppercase", padding:".8rem 1.6rem",
                  background:"var(--brand-red)", color:"#fff", border:"1px solid var(--brand-red)",
                  textDecoration:"none", transition:"background .18s",
                }}
              >
                View full spec →
              </TransitionLink>
              <TransitionLink
                href="/products/printing"
                style={{
                  fontFamily:"var(--ff-mono)", fontSize:".62rem", letterSpacing:".14em",
                  textTransform:"uppercase", color:"rgba(255,255,255,.4)",
                  borderBottom:"1px solid rgba(255,255,255,.16)", paddingBottom:"1px",
                  textDecoration:"none",
                }}
              >
                All configurations
              </TransitionLink>
            </div>
          </div>
        </div>

        {/* ── Bottom spec strip ── */}
        <div ref={stripRef} style={{
          marginTop:"clamp(2.5rem,5vw,4rem)", padding:"1.25rem 1.5rem",
          border:"1px solid rgba(255,255,255,.07)",
          borderTop:"2px solid var(--brand-red)",
          display:"flex", alignItems:"center",
          justifyContent:"space-between", flexWrap:"wrap", gap:"1.5rem",
          opacity:0,
        }}>
          <div style={{ display:"flex", gap:"clamp(1.5rem,3vw,3rem)", flexWrap:"wrap" }}>
            {SPECS.map(kv => (
              <div key={kv.label} style={{ display:"flex", flexDirection:"column", gap:".2rem" }}>
                <span style={{ fontFamily:"var(--ff-mono)", fontSize:".5rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,.25)" }}>{kv.label}</span>
                <span style={{ fontFamily:"var(--ff-mono)", fontSize:".65rem", letterSpacing:".06em", color:"rgba(255,255,255,.55)" }}>{kv.value}</span>
              </div>
            ))}
          </div>
          <AetherBtn><Link href="/contact">Request spec sheet →</Link></AetherBtn>
        </div>

      </div>
    </section>
  );
}
