"use client";
import React, { useRef, useEffect, useState } from "react";
import NextImage from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ForgeBackground from "@/components/ForgeBackground";
import { useCms } from "@/lib/useCms";

gsap.registerPlugin(ScrollTrigger);

const ACCENTS = [
  { hex: "#2bbfb3", name: "teal" },
  { hex: "#f59e0b", name: "amber" },
  { hex: "#e11d48", name: "rose" },
  { hex: "#2bbfb3", name: "teal" },
  { hex: "#f59e0b", name: "amber" },
];

function accentFor(i: number) {
  return ACCENTS[i % ACCENTS.length];
}

interface Step {
  slug: string;
  img: string;
  cat: string;
  stage: string;
  name: string;
  role: string;
  quality: [string, string][];
}

const DEFAULT_STEPS: Step[] = [
  {
    slug: "abcde-2200", img: "/machines/abcde-2200.png", cat: "film-blowing",
    stage: "Film Extrusion",
    name: "ABCDE-2200 Five-Layer",
    role: "The line starts here — resin is melted and blown into a 5-layer co-extruded film, 2100 mm wide.",
    quality: [["Thickness tolerance", "±2%"], ["Output", "400 kg/h"], ["Layers", "5"]],
  },
  {
    slug: "flexo-6c", img: "/machines/flexo-6c-nobg.png", cat: "printing",
    stage: "Flexo Printing",
    name: "AI-6C CI Flexo Press",
    role: "The blown film is printed in up to 6 colours on the central-impression drum at 260 m/min.",
    quality: [["Registration", "±0.1 mm"], ["Print speed", "260 m/min"], ["Colours", "6"]],
  },
  {
    slug: "t-pro-heatseal", img: "/machines/t-pro-heatseal.png", cat: "bag-making",
    stage: "Bag Converting",
    name: "T-PRO Heat-Seal Machine",
    role: "Printed film is sealed and cut into finished bags across multiple lanes at production speed.",
    quality: [["Seal speed", "300 pcs/min"], ["Lanes", "2–3"], ["Bag width", "500–600 mm"]],
  },
  {
    slug: "rgb-rollbag", img: "/machines/rgb-rollbag.png", cat: "bag-making",
    stage: "Roll Winding",
    name: "CX-RGB Roll Bag Machine",
    role: "Bags are perforated and wound onto rolls with automatic core cutting for retail-ready packs.",
    quality: [["Roll width", "1000–1200 mm"], ["Perforation", "Inline"], ["Core", "Auto-cut"]],
  },
  {
    slug: "cx-pelletizing", img: "/machines/cx-pelletizing.png", cat: "recycling",
    stage: "Closed-Loop Recycling",
    name: "CX Pelletizing Line",
    role: "Edge trim and scrap from every stage return here — recovered into resin and fed back to step 01.",
    quality: [["Resin recovery", "99%"], ["Output", "100–120 kg/h"], ["Screen", "Auto-changer"]],
  },
];

function rgbFromHex(hex: string, a = 1) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function ParticlePortfolio(){
  const sectionRef = useRef<HTMLDivElement>(null!);
  const scrollRef  = useRef(0);
  const [active, setActive] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);

  const cms = useCms<{ items: Step[] }>("production-line", { items: DEFAULT_STEPS });
  // skip unfinished admin drafts (blank slug/name) so a half-filled CMS
  // entry can never surface a broken card on the live site
  const cmsItems = (cms.items ?? []).filter(it => it.slug && it.name);
  const STEPS = cmsItems.length ? cmsItems : DEFAULT_STEPS;
  const N     = STEPS.length;

  const heroRef  = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el = sectionRef.current; if(!el) return;

    let camST: ScrollTrigger | null = null;
    let master: gsap.core.Timeline | null = null;
    let cancelled = false;

    // Guaranteed-visible fallback — if the scrub timeline never engages
    // (setup throws, trigger measurement race, etc.) the hero/ring panels
    // must not be left sitting at opacity:0 forever.
    const revealAll = () => {
      if (heroRef.current) { heroRef.current.style.opacity = "1"; heroRef.current.style.transform = "none"; }
      if (ringRef.current) { ringRef.current.style.opacity = "1"; ringRef.current.style.transform = "none"; }
    };

    try {
      camST = ScrollTrigger.create({
        trigger:el, start:"top top", end:"bottom bottom", scrub:1.5,
        onUpdate:(s)=>{ scrollRef.current = s.progress; },
      });

      master = gsap.timeline({
        scrollTrigger:{ trigger:el, start:"top top", end:"bottom bottom", scrub:1.8 }
      });

      gsap.set(heroRef.current, { opacity: 0 });
      gsap.set(ringRef.current, { opacity: 0 });

      master.fromTo(heroRef.current,
        { opacity:0, y:60 }, { opacity:1, y:0, ease:"power3.out", duration:0.10 }, 0);
      master.to(heroRef.current,
        { opacity:0, y:-40, ease:"power2.in", duration:0.06 }, 0.14);

      master.fromTo(ringRef.current,
        { opacity:0, scale:0.92 },
        { opacity:1, scale:1, ease:"power2.out", duration:0.08 }, 0.20);
      // hold the ring fully visible for the rest of the scroll — without
      // this the timeline has no tween covering 0.28→1.0, so anything
      // that nudges the scrub off-sync leaves it stuck at a fractional
      // opacity for the remaining ~70% of this section's scroll distance
      master.to(ringRef.current, { opacity:1, scale:1, duration:0.72 }, 0.28);

      const range = 0.70;
      const slot  = range / N;
      STEPS.forEach((_, i) => {
        master!.call(()=>{ setActive(i); }, [], 0.26 + i * slot);
      });
    } catch {
      if (!cancelled) revealAll();
    }

    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 4000);

    return ()=>{ cancelled = true; clearTimeout(fallback); camST?.kill(); master?.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  useEffect(()=>{
    if(!panelRef.current) return;
    gsap.fromTo(panelRef.current,
      { opacity:0, y:18 }, { opacity:1, y:0, duration:0.45, ease:"power3.out" });
  }, [active]);

  const step = STEPS[active];

  const NODES = STEPS.map((_, i) => ({
    x: 8 + (N > 1 ? (66 * i) / (N - 1) : 0),
    y: i % 2 === 0 ? 48 : 30,
  }));
  const PROD = { x: 90, y: 32 };
  const pts = [...NODES, PROD];
  const PIPE_D = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const dx = (p.x - prev.x) / 2;
    return `C ${(prev.x + dx).toFixed(1)} ${prev.y} ${(p.x - dx).toFixed(1)} ${p.y} ${p.x} ${p.y}`;
  }).join(" ");
  const progress = active === N - 1 ? 100 : ((active + 0.4) / N) * 100;
  const curAccent = accentFor(active);

  return(
    <section ref={sectionRef} className="pp-section" style={{height:"350vh", position:"relative"}}>

      <style suppressHydrationWarning>{`
        .pp-section { isolation: isolate; }
        .pp-mobile  { display: none; }
        .pp-desktop { display: block; }

        @media (max-width: 900px) {
          .pp-mobile  { display: block; }
          .pp-desktop { display: none !important; }
          .pp-section { height: auto !important; }
        }

        @keyframes pp-flow { to { stroke-dashoffset: -400; } }
        .pp-ring-path {
          fill: none; stroke: rgba(255,255,255,0.12);
          stroke-width: 1.5; stroke-dasharray: 10 8;
          animation: pp-flow 30s linear infinite;
        }
        .pp-ring-path--glow {
          fill: none; stroke: rgba(255,255,255,0.05);
          stroke-width: 6; filter: blur(4px);
        }

        .pp-node {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex; flex-direction: column; align-items: center;
          transition: left 0.9s cubic-bezier(0.16,1,0.3,1),
                      top 0.9s cubic-bezier(0.16,1,0.3,1),
                      opacity 0.6s ease;
          cursor: pointer;
          background: none; border: none; padding: 0;
        }
        .pp-node__img {
          width: clamp(200px, 22vw, 320px);
          object-fit: contain;
          transform-origin: center bottom;
          transition: transform 0.9s cubic-bezier(0.16,1,0.3,1),
                      filter 0.6s ease;
          pointer-events: none;
        }
        .pp-node__badge {
          font-family: var(--ff-mono); font-size: 0.66rem; font-weight: 700;
          letter-spacing: 0.08em;
          width: 26px; height: 26px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.4rem;
          transition: background 0.4s, color 0.4s, box-shadow 0.4s;
        }
        .pp-node__name {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          white-space: nowrap; margin-top: 0.35rem;
          transition: color 0.4s;
        }

        .pp-core {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
          pointer-events: none;
        }
        .pp-core__disc {
          position: relative;
          width: clamp(100px, 10vw, 150px); height: clamp(100px, 10vw, 150px);
          border-radius: 50%;
          border: 2px solid color-mix(in srgb, var(--accent) 40%, transparent);
          box-shadow: 0 0 40px color-mix(in srgb, var(--accent) 20%, transparent), inset 0 0 30px rgba(0,0,0,0.4);
          overflow: hidden;
          background: #0a1413;
          transition: border-color 0.4s, box-shadow 0.4s;
        }
        .pp-core__disc img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .pp-core__label {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--accent);
          display: flex; align-items: center; gap: 0.5rem;
          transition: color 0.4s;
        }
        .pp-core__label::before, .pp-core__label::after {
          content: ""; width: 1.2rem; height: 1px; background: var(--accent); opacity: 0.6;
          transition: background 0.4s;
        }

        .pp-panel {
          position: absolute; bottom: clamp(1rem, 2.5vh, 2rem);
          left: clamp(1.25rem, 3vw, 3rem); right: clamp(1.25rem, 3vw, 3rem);
          z-index: 25;
          display: flex; align-items: center; gap: clamp(1rem, 2.5vw, 2.5rem);
          background: rgba(5,12,11,0.78);
          backdrop-filter: blur(12px);
          border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
          padding: 0.9rem clamp(1rem, 2vw, 1.75rem);
          transition: border-color 0.4s;
        }
        .pp-panel__id { flex-shrink: 0; }
        .pp-panel__quality {
          display: flex; align-items: center; gap: 0.5rem;
          flex-wrap: nowrap; flex-shrink: 0; margin-left: auto;
        }
        .pp-panel__step {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--accent); margin-bottom: 0.3rem;
          transition: color 0.4s;
        }
        .pp-panel__stage {
          font-family: var(--ff-display); font-size: clamp(1.2rem, 1.6vw, 1.6rem);
          color: #fff; line-height: 0.95; text-transform: uppercase;
          letter-spacing: -0.01em; margin: 0 0 0.2rem;
          white-space: nowrap;
        }
        .pp-panel__name {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: rgba(255,255,255,0.65);
          white-space: nowrap;
        }
        .pp-panel__role {
          font-family: var(--ff-body); font-size: 0.8rem;
          color: rgba(255,255,255,0.7); line-height: 1.55;
          margin: 0; max-width: 44ch;
        }
        .pp-panel__q {
          display: flex; align-items: baseline; gap: 0.4rem;
          border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
          padding: 0.4rem 0.7rem; white-space: nowrap;
          transition: border-color 0.4s;
        }
        .pp-panel__q-label {
          font-family: var(--ff-mono); font-size: 0.6rem;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        .pp-panel__q-val {
          font-family: var(--ff-display); font-size: 0.95rem;
          color: var(--accent); letter-spacing: 0;
          transition: color 0.4s;
        }
        .pp-panel__cta {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 1.1rem; flex-shrink: 0;
          border: 1px solid color-mix(in srgb, var(--accent) 30%, transparent);
          color: var(--accent); text-decoration: none;
          font-family: var(--ff-mono); font-size: 0.64rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          transition: background 0.2s, border-color 0.2s, color 0.4s, border-color 0.4s;
          white-space: nowrap;
        }
        .pp-panel__cta:hover { background: color-mix(in srgb, var(--accent) 10%, transparent); border-color: var(--accent); }
        @media (max-width: 1400px) { .pp-panel__role { display: none; } }
        @media (max-width: 1100px) { .pp-panel__q--extra { display: none; } }

        .pp-ring-title {
          position: absolute; top: clamp(1.5rem, 4vh, 3rem); left: 50%;
          transform: translateX(-50%);
          text-align: center; z-index: 20; pointer-events: none;
        }
        .pp-ring-title h3 {
          font-family: var(--ff-display); font-size: clamp(1.6rem, 2.6vw, 2.6rem);
          color: #fff; line-height: 0.95; letter-spacing: 0.01em;
          text-transform: uppercase; margin: 0;
        }
        .pp-ring-title span {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--accent);
          transition: color 0.4s;
        }

        [data-theme="light"] .pp-desktop-bg { background: transparent !important; }
        [data-theme="light"] .pp-vignette   { opacity: 0 !important; }
        [data-theme="light"] .pp-headline   { color: #0d2220 !important; }
        [data-theme="light"] .pp-sub        { color: rgba(13,34,32,0.65) !important; }
        [data-theme="light"] .pp-stat-val   { color: #0d2220 !important; }
        [data-theme="light"] .pp-ring-title h3 { color: #0d2220; }
        [data-theme="light"] .pp-node__name--dim { color: rgba(13,34,32,0.55) !important; }
        [data-theme="light"] .pp-panel {
          background: rgba(255,255,255,0.86);
        }
        [data-theme="light"] .pp-panel__stage  { color: #0d2220; }
        [data-theme="light"] .pp-panel__name   { color: rgba(13,34,32,0.65); }
        [data-theme="light"] .pp-panel__role   { color: rgba(13,34,32,0.7); }
        [data-theme="light"] .pp-panel__q-label{ color: rgba(13,34,32,0.6); }
        [data-theme="light"] .pp-core__disc    { background: #e8f4f3; }
        [data-theme="light"] .pp-mobile-wrap   { background: #f0faf9 !important; }
        [data-theme="light"] .pp-mobile-headline { color: #0d2220 !important; }
        [data-theme="light"] .pp-mobile-sub    { color: rgba(13,34,32,0.62) !important; }
        [data-theme="light"] .pp-mstep         { background: #fff !important; }
        [data-theme="light"] .pp-mstep__stage  { color: #0d2220 !important; }
        [data-theme="light"] .pp-mstep__name   { color: rgba(13,34,32,0.65) !important; }
        [data-theme="light"] .pp-mstep__role   { color: rgba(13,34,32,0.7) !important; }
        [data-theme="light"] .pp-mstep__q      { color: rgba(13,34,32,0.7) !important; }
        [data-theme="light"] .pp-mstep__img    { filter: drop-shadow(0 3px 10px rgba(0,0,0,0.12)) !important; }

        @media (prefers-reduced-motion: reduce) {
          .pp-ring-path { animation: none; }
          .pp-node { transition: none; }
        }
      `}</style>

      {/* ══ MOBILE ══ */}
      <div className="pp-mobile pp-mobile-wrap" style={{
        background:"#070f0e", borderTop:"1px solid rgba(43,191,179,0.12)",
        padding:"1.75rem 1.25rem 1.5rem", position:"relative", overflow:"hidden",
      }}>
        <div style={{marginBottom:"1.1rem"}}>
          <div style={{fontFamily:"var(--ff-mono)",fontSize:"0.62rem",letterSpacing:"0.2em",
            textTransform:"uppercase",marginBottom:"0.75rem",
            background:"linear-gradient(135deg, var(--brand-teal), var(--brand-amber))",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            One floor · One line · Setup 01–{String(N).padStart(2,"0")}
          </div>
          <h2 className="pp-mobile-headline" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(2.6rem,9vw,3.6rem)",
            color:"#fff",lineHeight:0.88,letterSpacing:"-0.02em",margin:"0 0 0.85rem"}}>
            Built for<br/><span style={{background:"linear-gradient(135deg,var(--brand-teal),var(--brand-amber))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>the floor.</span>
          </h2>
          <p className="pp-mobile-sub" style={{fontFamily:"var(--ff-body)",fontSize:"0.9rem",
            color:"rgba(255,255,255,0.65)",lineHeight:1.7,maxWidth:"40ch",margin:0}}>
            Five machines, one connected production line — from raw resin to finished bags, with the scrap looped straight back in.
          </p>
        </div>

        <div style={{position:"relative", paddingLeft:"1.6rem"}}>
          <div aria-hidden style={{position:"absolute",left:"10px",top:"12px",bottom:"12px",width:"2px",
            background:"linear-gradient(to bottom, var(--brand-teal), rgba(43,191,179,0.15))"}}/>
          {STEPS.map((s,i)=>{
            const a = accentFor(i);
            const stepCss = { "--accent": a.hex } as React.CSSProperties;
            const isOpen = mobileOpen === i;
            return (
            <div key={s.slug} style={{position:"relative", marginBottom: i<N-1 ? "0.5rem" : 0, ...stepCss}}>
              <div style={{position:"absolute",left:"-1.6rem",top:"0.7rem",width:"20px",height:"20px",
                borderRadius:"50%",background:a.hex,color:"#04211e",
                fontFamily:"var(--ff-mono)",fontSize:"0.58rem",fontWeight:700,
                display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>
                {i+1}
              </div>
              <div className="pp-mstep" style={{
                background:"rgba(6,14,13,0.9)", border:`1px solid ${rgbFromHex(a.hex, 0.14)}`,
              }}>
                <button
                  type="button"
                  onClick={() => setMobileOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{
                    display:"flex", width:"100%", gap:"0.65rem", alignItems:"center",
                    padding:"0.6rem 0.8rem", background:"none", border:"none", cursor:"pointer",
                    textAlign:"left", font:"inherit", color:"inherit",
                  }}>
                  <NextImage src={s.img} alt={s.name} className="pp-mstep__img" width={44} height={34}
                    style={{objectFit:"contain",flexShrink:0,
                      filter:"drop-shadow(0 3px 10px rgba(0,0,0,0.7))"}}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div className="pp-mstep__stage" style={{fontFamily:"var(--ff-display)",fontSize:"0.9rem",
                      color:"#fff",lineHeight:1,textTransform:"uppercase",marginBottom:"0.2rem"}}>{s.stage}</div>
                    <div className="pp-mstep__name" style={{fontFamily:"var(--ff-mono)",fontSize:"0.55rem",
                      letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.65)"}}>{s.name}</div>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 10 6" fill="none" stroke={a.hex} strokeWidth="1.5"
                    style={{flexShrink:0, transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s ease"}}>
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                </button>
                {isOpen && (
                  <div style={{padding:"0 0.8rem 0.65rem"}}>
                    <p className="pp-mstep__role" style={{fontFamily:"var(--ff-body)",fontSize:"0.74rem",
                      color:"rgba(255,255,255,0.65)",lineHeight:1.5,margin:"0 0 0.45rem"}}>{s.role}</p>
                    <div style={{display:"flex",flexWrap:"wrap",gap:"0.3rem"}}>
                      {s.quality.map(([l,v])=>(
                        <span key={l} className="pp-mstep__q" style={{
                          fontFamily:"var(--ff-mono)",fontSize:"0.56rem",letterSpacing:"0.05em",
                          border:`1px solid ${rgbFromHex(a.hex, 0.2)}`,padding:"0.2rem 0.45rem",
                          color:"rgba(255,255,255,0.72)"}}>
                          {l}: <span style={{color:a.hex}}>{v}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );})}
        </div>
      </div>

      {/* ══ DESKTOP ══ */}
      <div className="pp-desktop pp-desktop-bg" style={{position:"sticky",top:0,height:"100vh",overflow:"hidden",background:"#070f0e"}}>

        <div style={{position:"absolute",inset:0,zIndex:1}}>
          <ForgeBackground scrollProgress={scrollRef.current} />
        </div>
        <div className="pp-vignette" aria-hidden style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
          background:"radial-gradient(ellipse 80% 60% at 50% 50%,transparent 40%,rgba(4,10,9,0.82) 100%)"}}/>

        {/* ── PHASE 1 — hero ── */}
        <div ref={heroRef} style={{
          position:"absolute",inset:0,zIndex:10,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          textAlign:"center",padding:"2rem",pointerEvents:"none",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:"0.9rem",
            fontFamily:"var(--ff-mono)",fontSize:"0.64rem",letterSpacing:"0.22em",
            textTransform:"uppercase",marginBottom:"1.75rem",
            background:"linear-gradient(135deg, var(--brand-teal), var(--brand-amber))",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
            One floor · one connected line
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-amber)",display:"inline-block",opacity:0.6}}/>
          </div>
          <h2 className="pp-headline" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(5rem,13vw,12rem)",
            lineHeight:0.84,letterSpacing:"-0.03em",color:"#fff",margin:0,textTransform:"uppercase"}}>
            Built for<br/><span style={{background:"linear-gradient(135deg,var(--brand-teal),var(--brand-amber))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>the floor.</span>
          </h2>
          <p className="pp-sub" style={{fontFamily:"var(--ff-body)",fontSize:"clamp(0.9rem,1.2vw,1.05rem)",
            color:"rgba(255,255,255,0.65)",lineHeight:1.7,maxWidth:"46ch",margin:"2rem 0 0",letterSpacing:"0.01em"}}>
            Keep scrolling to walk the full production line — five machines set up in order,
            from raw resin to the finished product at the centre.
          </p>
        </div>

        {/* ── PHASE 2 — production ring ── */}
        <div ref={ringRef} style={{position:"absolute",inset:0,zIndex:10}}>

          <div className="pp-ring-title" style={{"--accent": curAccent.hex} as React.CSSProperties}>
            <span>The complete setup — in order</span>
            <h3>End-to-end production line</h3>
          </div>

          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:5,pointerEvents:"none"}}>
            <path className="pp-ring-path--glow" d={PIPE_D} vectorEffect="non-scaling-stroke"/>
            <path className="pp-ring-path" d={PIPE_D} vectorEffect="non-scaling-stroke"/>
            <path d={PIPE_D} pathLength={100} vectorEffect="non-scaling-stroke"
              style={{
                fill:"none", stroke: curAccent.hex, strokeWidth:2.5,
                strokeLinecap:"round",
                strokeDasharray:`${progress} 100`,
                transition:"stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1), stroke 0.4s",
                filter:`drop-shadow(0 0 6px ${rgbFromHex(curAccent.hex, 0.6)})`,
              }}/>
            {[...NODES, PROD].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="0.5"
                fill={i <= active || i === NODES.length ? curAccent.hex : "rgba(255,255,255,0.15)"}
                style={{transition:"fill 0.5s"}}/>
            ))}
          </svg>

          <div className="pp-core" style={{zIndex:8, left:`${PROD.x}%`, top:`${PROD.y}%`, "--accent": curAccent.hex} as React.CSSProperties}>
            <div className="pp-core__disc">
              <NextImage src="/machines/bag-samples.png" alt="Finished bag products" fill sizes="150px" />
            </div>
            <div className="pp-core__label">Finished product</div>
          </div>

          {STEPS.map((s, i) => {
            const p = NODES[i];
            const isOn = i === active;
            const done = i < active;
            const sc = isOn ? 1 : 0.42;
            const a = accentFor(i);
            return (
              <button
                key={s.slug}
                className="pp-node"
                onClick={()=>setActive(i)}
                aria-label={`Step ${i+1}: ${s.stage}`}
                style={{
                  left:`${p.x}%`, top:`${p.y}%`,
                  zIndex: isOn ? 16 : 10,
                  opacity: isOn ? 1 : done ? 0.85 : 0.6,
                }}
              >
                <span className="pp-node__badge" style={{
                  background: isOn ? a.hex : done ? rgbFromHex(a.hex, 0.25) : "rgba(5,12,11,0.8)",
                  color: isOn ? "#04211e" : a.hex,
                  border: `1px solid ${isOn ? a.hex : rgbFromHex(a.hex, 0.4)}`,
                  boxShadow: isOn ? `0 0 18px ${rgbFromHex(a.hex, 0.5)}` : "none",
                  transition: "background 0.4s, color 0.4s, box-shadow 0.4s, border-color 0.4s",
                }}>{i+1}</span>
                <NextImage src={s.img} alt="" className="pp-node__img" width={320} height={320} style={{
                  height: "auto",
                  transform:`scale(${sc})`,
                  filter: isOn
                    ? `drop-shadow(0 10px 30px ${rgbFromHex(a.hex, 0.3)}) drop-shadow(0 6px 18px rgba(0,0,0,0.8))`
                    : "drop-shadow(0 4px 12px rgba(0,0,0,0.7)) saturate(0.7) brightness(0.85)",
                }}/>
                <span className={`pp-node__name${isOn?"":" pp-node__name--dim"}`} style={{
                  color: isOn ? a.hex : "rgba(255,255,255,0.55)",
                  transition: "color 0.4s",
                }}>{s.stage}</span>
              </button>
            );
          })}

          <div ref={panelRef} className="pp-panel" style={{"--accent": curAccent.hex} as React.CSSProperties}>
            <div className="pp-panel__id">
              <div className="pp-panel__step">Setup {String(active+1).padStart(2,"0")} / {String(N).padStart(2,"0")}</div>
              <h4 className="pp-panel__stage">{step.stage}</h4>
              <div className="pp-panel__name">{step.name}</div>
            </div>
            <p className="pp-panel__role">{step.role}</p>
            <div className="pp-panel__quality">
              {step.quality.map(([l,v],qi)=>(
                <div key={l} className={`pp-panel__q${qi>1?" pp-panel__q--extra":""}`}>
                  <span className="pp-panel__q-label">{l}</span>
                  <span className="pp-panel__q-val">{v}</span>
                </div>
              ))}
            </div>
            <a className="pp-panel__cta" href={`/products/${step.cat}/${step.slug}`}>
              View machine
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
