"use client";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ForgeBackground from "@/components/ForgeBackground";
import { useCms } from "@/lib/useCms";

gsap.registerPlugin(ScrollTrigger);

// ─── Production line — real end-to-end setup order ─────────
interface Step {
  slug: string;          // links to /products/[cat]/[slug]
  img: string;           // transparent png
  cat: string;           // route category
  stage: string;         // process stage name
  name: string;          // machine name
  role: string;          // what it does in the line
  quality: [string, string][]; // quality details
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

// ─── Component ─────────────────────────────────────────────
export default function ParticlePortfolio(){
  const sectionRef = useRef<HTMLDivElement>(null!);
  const scrollRef  = useRef(0);
  const [active, setActive] = useState(0);

  // live CMS content (editable in the admin panel) with hardcoded fallback
  const cms   = useCms<{ items: Step[] }>("production-line", { items: DEFAULT_STEPS });
  const STEPS = cms.items && cms.items.length ? cms.items : DEFAULT_STEPS;
  const N     = STEPS.length;

  const heroRef  = useRef<HTMLDivElement>(null);
  const ringRef  = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el = sectionRef.current; if(!el) return;

    const camST = ScrollTrigger.create({
      trigger:el, start:"top top", end:"bottom bottom", scrub:1.5,
      onUpdate:(s)=>{ scrollRef.current = s.progress; },
    });

    const master = gsap.timeline({
      scrollTrigger:{ trigger:el, start:"top top", end:"bottom bottom", scrub:1.8 }
    });

    // Phase 1 (0–0.14): hero statement
    master.fromTo(heroRef.current,
      { opacity:0, y:60 }, { opacity:1, y:0, ease:"power3.out", duration:0.10 }, 0);
    master.to(heroRef.current,
      { opacity:0, y:-40, ease:"power2.in", duration:0.06 }, 0.14);

    // Phase 2 (0.20–1.0): production ring
    master.fromTo(ringRef.current,
      { opacity:0, scale:0.92 },
      { opacity:1, scale:1, ease:"power2.out", duration:0.08 }, 0.20);

    // Step through the line 01 → 05
    const range = 0.70;               // 0.26 → 0.96
    const slot  = range / N;
    STEPS.forEach((_, i) => {
      master.call(()=>{ setActive(i); }, [], 0.26 + i * slot);
    });

    return ()=>{ camST.kill(); master.kill(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [N]);

  // Animate info panel swap on step change
  useEffect(()=>{
    if(!panelRef.current) return;
    gsap.fromTo(panelRef.current,
      { opacity:0, y:18 }, { opacity:1, y:0, duration:0.45, ease:"power3.out" });
  }, [active]);

  const step = STEPS[active];

  // ── pipeline geometry: roadmap points generated for any step count ──
  // machines alternate low/high across the floor; PROD ends the line
  const NODES = STEPS.map((_, i) => ({
    x: 8 + (N > 1 ? (66 * i) / (N - 1) : 0),
    y: i % 2 === 0 ? 48 : 30,
  }));
  const PROD = { x: 90, y: 32 };
  const pts = [...NODES, PROD];
  // smooth S-curve: horizontal tangents at every node
  const PIPE_D = pts.map((p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const dx = (p.x - prev.x) / 2;
    return `C ${(prev.x + dx).toFixed(1)} ${prev.y} ${(p.x - dx).toFixed(1)} ${p.y} ${p.x} ${p.y}`;
  }).join(" ");
  // lit portion of the pipe — node i sits ~i/N of the way along the path
  const progress = active === N - 1 ? 100 : ((active + 0.4) / N) * 100;

  return(
    <section ref={sectionRef} className="pp-section" style={{height:"600vh", position:"relative"}}>

      <style suppressHydrationWarning>{`
        .pp-section { isolation: isolate; }
        .pp-mobile  { display: none; }
        .pp-desktop { display: block; }

        @media (max-width: 900px) {
          .pp-mobile  { display: block; }
          .pp-desktop { display: none !important; }
          .pp-section { height: auto !important; }
        }

        /* flow ring — dashed ellipse, slow conveyor drift */
        @keyframes pp-flow { to { stroke-dashoffset: -400; } }
        .pp-ring-path {
          fill: none; stroke: rgba(43,191,179,0.35);
          stroke-width: 1.5; stroke-dasharray: 10 8;
          animation: pp-flow 30s linear infinite;
        }
        .pp-ring-path--glow {
          fill: none; stroke: rgba(43,191,179,0.1);
          stroke-width: 6; filter: blur(4px);
        }

        /* machine node */
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

        /* finished-product disc at the end of the line */
        .pp-core {
          position: absolute;
          transform: translate(-50%, -50%);
          display: flex; flex-direction: column; align-items: center; gap: 0.6rem;
          pointer-events: none;
        }
        .pp-core__disc {
          width: clamp(100px, 10vw, 150px); height: clamp(100px, 10vw, 150px);
          border-radius: 50%;
          border: 2px solid rgba(43,191,179,0.5);
          box-shadow: 0 0 40px rgba(43,191,179,0.25), inset 0 0 30px rgba(0,0,0,0.4);
          overflow: hidden;
          background: #0a1413;
        }
        .pp-core__disc img {
          width: 100%; height: 100%; object-fit: cover;
        }
        .pp-core__label {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--brand-teal);
          display: flex; align-items: center; gap: 0.5rem;
        }
        .pp-core__label::before, .pp-core__label::after {
          content: ""; width: 1.2rem; height: 1px; background: var(--brand-teal); opacity: 0.6;
        }

        /* info HUD — slim full-width bar along the bottom, never covers machines */
        .pp-panel {
          position: absolute; bottom: clamp(1rem, 2.5vh, 2rem);
          left: clamp(1.25rem, 3vw, 3rem); right: clamp(1.25rem, 3vw, 3rem);
          z-index: 25;
          display: flex; align-items: center; gap: clamp(1rem, 2.5vw, 2.5rem);
          background: rgba(5,12,11,0.78);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(43,191,179,0.2);
          padding: 0.9rem clamp(1rem, 2vw, 1.75rem);
        }
        .pp-panel__id { flex-shrink: 0; }
        .pp-panel__quality {
          display: flex; align-items: center; gap: 0.5rem;
          flex-wrap: nowrap; flex-shrink: 0; margin-left: auto;
        }
        .pp-panel__step {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 0.3rem;
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
          border-left: none;
        }
        .pp-panel__q {
          display: flex; align-items: baseline; gap: 0.4rem;
          border: 1px solid rgba(43,191,179,0.2);
          padding: 0.4rem 0.7rem; white-space: nowrap;
        }
        .pp-panel__q-label {
          font-family: var(--ff-mono); font-size: 0.6rem;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: rgba(255,255,255,0.55);
        }
        .pp-panel__q-val {
          font-family: var(--ff-display); font-size: 0.95rem;
          color: var(--brand-teal); letter-spacing: 0;
        }
        .pp-panel__cta {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 0.6rem 1.1rem; flex-shrink: 0;
          border: 1px solid rgba(43,191,179,0.35);
          color: var(--brand-teal); text-decoration: none;
          font-family: var(--ff-mono); font-size: 0.64rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          transition: background 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .pp-panel__cta:hover { background: rgba(43,191,179,0.1); border-color: var(--brand-teal); }
        @media (max-width: 1400px) { .pp-panel__role { display: none; } }
        @media (max-width: 1100px) { .pp-panel__q--extra { display: none; } }

        /* section title chip (ring phase) */
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
          color: var(--brand-teal);
        }

        /* ── LIGHT MODE ── */
        [data-theme="light"] .pp-desktop-bg { background: transparent !important; }
        [data-theme="light"] .pp-vignette   { opacity: 0 !important; }
        [data-theme="light"] .pp-headline   { color: #0d2220 !important; }
        [data-theme="light"] .pp-sub        { color: rgba(13,34,32,0.65) !important; }
        [data-theme="light"] .pp-stat-val   { color: #0d2220 !important; }
        [data-theme="light"] .pp-ring-title h3 { color: #0d2220; }
        [data-theme="light"] .pp-node__name--dim { color: rgba(13,34,32,0.55) !important; }
        [data-theme="light"] .pp-panel {
          background: rgba(255,255,255,0.86); border-color: rgba(43,191,179,0.3);
        }
        [data-theme="light"] .pp-panel__stage  { color: #0d2220; }
        [data-theme="light"] .pp-panel__name   { color: rgba(13,34,32,0.65); }
        [data-theme="light"] .pp-panel__role   { color: rgba(13,34,32,0.7); }
        [data-theme="light"] .pp-panel__q-label{ color: rgba(13,34,32,0.6); }
        [data-theme="light"] .pp-core__disc    { background: #e8f4f3; }
        [data-theme="light"] .pp-mobile-wrap   { background: #f0faf9 !important; }
        [data-theme="light"] .pp-mobile-headline { color: #0d2220 !important; }
        [data-theme="light"] .pp-mobile-sub    { color: rgba(13,34,32,0.62) !important; }
        [data-theme="light"] .pp-mstep         { background: #fff !important; border-color: rgba(43,191,179,0.2) !important; }
        [data-theme="light"] .pp-mstep__stage  { color: #0d2220 !important; }
        [data-theme="light"] .pp-mstep__name   { color: rgba(13,34,32,0.65) !important; }
        [data-theme="light"] .pp-mstep__role   { color: rgba(13,34,32,0.7) !important; }
        [data-theme="light"] .pp-mstep__q      { color: rgba(13,34,32,0.7) !important; border-color: rgba(43,191,179,0.15) !important; }
        [data-theme="light"] .pp-mstep__img    { filter: drop-shadow(0 3px 10px rgba(0,0,0,0.12)) !important; }

        @media (prefers-reduced-motion: reduce) {
          .pp-ring-path { animation: none; }
          .pp-node { transition: none; }
        }

      `}</style>

      {/* ══ MOBILE — numbered production timeline ══ */}
      <div className="pp-mobile pp-mobile-wrap" style={{
        background:"#070f0e", borderTop:"1px solid rgba(43,191,179,0.12)",
        padding:"3.5rem 1.25rem 3rem", position:"relative", overflow:"hidden",
      }}>
        <div style={{marginBottom:"2.25rem"}}>
          <div style={{fontFamily:"var(--ff-mono)",fontSize:"0.62rem",letterSpacing:"0.2em",
            textTransform:"uppercase",color:"var(--brand-teal)",marginBottom:"0.75rem"}}>
            One floor · One line · Setup 01–{String(N).padStart(2,"0")}
          </div>
          <h2 className="pp-mobile-headline" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(2.6rem,9vw,3.6rem)",
            color:"#fff",lineHeight:0.88,letterSpacing:"-0.02em",margin:"0 0 0.85rem"}}>
            Built for<br/><span style={{color:"var(--brand-teal)"}}>the floor.</span>
          </h2>
          <p className="pp-mobile-sub" style={{fontFamily:"var(--ff-body)",fontSize:"0.9rem",
            color:"rgba(255,255,255,0.65)",lineHeight:1.7,maxWidth:"40ch",margin:0}}>
            Five machines, one connected production line — from raw resin to finished bags, with the scrap looped straight back in.
          </p>
        </div>

        <div style={{position:"relative", paddingLeft:"1.9rem"}}>
          {/* vertical connector */}
          <div aria-hidden style={{position:"absolute",left:"12px",top:"14px",bottom:"14px",width:"2px",
            background:"linear-gradient(to bottom, var(--brand-teal), rgba(43,191,179,0.15))"}}/>
          {STEPS.map((s,i)=>(
            <div key={s.slug} style={{position:"relative", marginBottom: i<N-1 ? "1.1rem" : 0}}>
              {/* number pip */}
              <div style={{position:"absolute",left:"-1.9rem",top:"1rem",width:"26px",height:"26px",
                borderRadius:"50%",background:"var(--brand-teal)",color:"#04211e",
                fontFamily:"var(--ff-mono)",fontSize:"0.66rem",fontWeight:700,
                display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>
                {i+1}
              </div>
              <div className="pp-mstep" style={{
                background:"rgba(6,14,13,0.9)", border:"1px solid rgba(43,191,179,0.14)",
                padding:"1rem 1.1rem",
              }}>
                <div style={{display:"flex",gap:"1rem",alignItems:"center",marginBottom:"0.6rem"}}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.img} alt={s.name} className="pp-mstep__img"
                    style={{width:"88px",height:"64px",objectFit:"contain",flexShrink:0,
                      filter:"drop-shadow(0 3px 10px rgba(0,0,0,0.7))"}}/>
                  <div>
                    <div className="pp-mstep__stage" style={{fontFamily:"var(--ff-display)",fontSize:"1.15rem",
                      color:"#fff",lineHeight:1,textTransform:"uppercase",marginBottom:"0.25rem"}}>{s.stage}</div>
                    <div className="pp-mstep__name" style={{fontFamily:"var(--ff-mono)",fontSize:"0.62rem",
                      letterSpacing:"0.1em",textTransform:"uppercase",color:"rgba(255,255,255,0.65)"}}>{s.name}</div>
                  </div>
                </div>
                <p className="pp-mstep__role" style={{fontFamily:"var(--ff-body)",fontSize:"0.82rem",
                  color:"rgba(255,255,255,0.65)",lineHeight:1.6,margin:"0 0 0.6rem"}}>{s.role}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"0.4rem"}}>
                  {s.quality.map(([l,v])=>(
                    <span key={l} className="pp-mstep__q" style={{
                      fontFamily:"var(--ff-mono)",fontSize:"0.62rem",letterSpacing:"0.06em",
                      border:"1px solid rgba(43,191,179,0.2)",padding:"0.28rem 0.55rem",
                      color:"rgba(255,255,255,0.72)"}}>
                      {l}: <span style={{color:"var(--brand-teal)"}}>{v}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ DESKTOP — sticky production ring ══ */}
      <div className="pp-desktop pp-desktop-bg" style={{position:"sticky",top:0,height:"100vh",overflow:"hidden",background:"#070f0e"}}>

        {/* 3D floor */}
        <div style={{position:"absolute",inset:0,zIndex:1}}>
          <ForgeBackground scrollProgress={scrollRef.current} />
        </div>
        <div className="pp-vignette" aria-hidden style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
          background:"radial-gradient(ellipse 80% 60% at 50% 50%,transparent 40%,rgba(4,10,9,0.82) 100%)"}}/>

        {/* ── PHASE 1 — hero ── */}
        <div ref={heroRef} style={{
          position:"absolute",inset:0,zIndex:10,
          display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
          textAlign:"center",padding:"2rem",opacity:0,pointerEvents:"none",
        }}>
          <div style={{display:"flex",alignItems:"center",gap:"0.9rem",
            fontFamily:"var(--ff-mono)",fontSize:"0.64rem",letterSpacing:"0.22em",
            textTransform:"uppercase",color:"var(--brand-teal)",marginBottom:"1.75rem"}}>
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
            One floor · one connected line
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
          </div>
          <h2 className="pp-headline" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(5rem,13vw,12rem)",
            lineHeight:0.84,letterSpacing:"-0.03em",color:"#fff",margin:0,textTransform:"uppercase"}}>
            Built for<br/><span style={{color:"var(--brand-teal)"}}>the floor.</span>
          </h2>
          <p className="pp-sub" style={{fontFamily:"var(--ff-body)",fontSize:"clamp(0.9rem,1.2vw,1.05rem)",
            color:"rgba(255,255,255,0.65)",lineHeight:1.7,maxWidth:"46ch",margin:"2rem 0 0",letterSpacing:"0.01em"}}>
            Keep scrolling to walk the full production line — five machines set up in order,
            from raw resin to the finished product at the centre.
          </p>
        </div>

        {/* ── PHASE 2 — production ring ── */}
        <div ref={ringRef} style={{position:"absolute",inset:0,zIndex:10,opacity:0}}>

          {/* title */}
          <div className="pp-ring-title">
            <span>The complete setup — in order</span>
            <h3>End-to-end production line</h3>
          </div>

          {/* pipeline road — dashed base + lit progress */}
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none"
            style={{position:"absolute",inset:0,width:"100%",height:"100%",zIndex:5,pointerEvents:"none"}}>
            {/* soft glow under the whole road */}
            <path className="pp-ring-path--glow" d={PIPE_D} vectorEffect="non-scaling-stroke"/>
            {/* dashed conveyor base */}
            <path className="pp-ring-path" d={PIPE_D} vectorEffect="non-scaling-stroke"/>
            {/* lit segment up to the active machine */}
            <path d={PIPE_D} pathLength={100} vectorEffect="non-scaling-stroke"
              style={{
                fill:"none", stroke:"var(--brand-teal)", strokeWidth:2.5,
                strokeLinecap:"round",
                strokeDasharray:`${progress} 100`,
                transition:"stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)",
                filter:"drop-shadow(0 0 6px rgba(43,191,179,0.6))",
              }}/>
            {/* junction dots at every machine point */}
            {[...NODES, PROD].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="0.5"
                fill={i <= active || i === NODES.length ? "var(--brand-teal)" : "rgba(43,191,179,0.35)"}
                style={{transition:"fill 0.5s"}}/>
            ))}
          </svg>

          {/* end of the line — finished product */}
          <div className="pp-core" style={{zIndex:8, left:`${PROD.x}%`, top:`${PROD.y}%`}}>
            <div className="pp-core__disc">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/machines/bag-samples.png" alt="Finished bag products"/>
            </div>
            <div className="pp-core__label">Finished product</div>
          </div>

          {/* machines along the pipeline */}
          {STEPS.map((s, i) => {
            const p = NODES[i];
            const isOn = i === active;
            const done = i < active;
            // scale from 240px base — active machine big, the rest small
            const sc = isOn ? 1 : 0.42;
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
                  background: isOn ? "var(--brand-teal)" : done ? "rgba(43,191,179,0.25)" : "rgba(5,12,11,0.8)",
                  color: isOn ? "#04211e" : "var(--brand-teal)",
                  border: "1px solid " + (isOn ? "var(--brand-teal)" : "rgba(43,191,179,0.4)"),
                  boxShadow: isOn ? "0 0 18px rgba(43,191,179,0.5)" : "none",
                }}>{i+1}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt="" className="pp-node__img" style={{
                  transform:`scale(${sc})`,
                  filter: isOn
                    ? "drop-shadow(0 10px 30px rgba(43,191,179,0.3)) drop-shadow(0 6px 18px rgba(0,0,0,0.8))"
                    : "drop-shadow(0 4px 12px rgba(0,0,0,0.7)) saturate(0.7) brightness(0.85)",
                }}/>
                <span className={`pp-node__name${isOn?"":" pp-node__name--dim"}`} style={{
                  color: isOn ? "var(--brand-teal)" : "rgba(255,255,255,0.55)",
                }}>{s.stage}</span>
              </button>
            );
          })}

          {/* info HUD — slim bottom bar with active step details */}
          <div ref={panelRef} className="pp-panel">
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
