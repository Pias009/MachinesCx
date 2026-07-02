"use client";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ForgeBackground from "@/components/ForgeBackground";

gsap.registerPlugin(ScrollTrigger);

// ─── data ──────────────────────────────────────────────────
interface Machine {
  slug: string;
  cat: string;
  name: string;
  tagline: string;
  specs: [string, string][];
}

const MACHINES: Machine[] = [
  {
    slug: "abcde-2200",
    cat: "Film Blowing",
    name: "ABCDE-2200 Five-Layer Co-Extrusion",
    tagline: "The flagship — 5 layers, 2,100 mm web, 400 kg/h output.",
    specs: [["Output","400 kg/h"],["Web Width","2100 mm"],["Layers","5"],["Screw Ø","60mm × 5"]],
  },
  {
    slug: "abc-multilayer-large",
    cat: "Film Blowing",
    name: "ABC Multi-Layer Line",
    tagline: "Three-layer co-extrusion from 1500 to 2300 mm width.",
    specs: [["Width Range","1500–2300 mm"],["Layers","3"],["Screw L/D","30:1"],["Drive","AC servo"]],
  },
  {
    slug: "t-pro-heatseal",
    cat: "Bag Making",
    name: "T-PRO Heat-Seal Bag Machine",
    tagline: "Multi-lane heat-seal at 300 pcs/min — the production workhorse.",
    specs: [["Speed","300 pcs/min"],["Lanes","2–3"],["Bag Width","500–600 mm"],["Film","PE/LDPE"]],
  },
  {
    slug: "f-pro-bottomseal",
    cat: "Bag Making",
    name: "F-PRO Bottom-Seal Bag Machine",
    tagline: "Bottom-seal converter for wide format PE and PBAT film.",
    specs: [["Width","1000–1600 mm"],["Type","Bottom-seal"],["Material","PE/PBAT"],["Drive","Servo"]],
  },
  {
    slug: "cx-pelletizing",
    cat: "Recycling",
    name: "CX Recycling & Pelletizing Line",
    tagline: "Close the loop — 99% resin recovery from scrap and trim.",
    specs: [["Recovery","99%"],["Output","100–120 kg/h"],["Input","PE film scrap"],["Screen","Auto-changer"]],
  },
  {
    slug: "flexo-6c",
    cat: "Flexo Printing",
    name: "AI-6C CI Flexo Printing Machine",
    tagline: "6-colour central impression press at 260 m/min with servo gearless drive.",
    specs: [["Colours","6"],["Speed","260 m/min"],["Width","500–2000 mm"],["Register","±0.1 mm"]],
  },
  {
    slug: "s-wide",
    cat: "Film Blowing",
    name: "S Single-Layer Wide Line",
    tagline: "2100 mm roller width for high-volume mono film production.",
    specs: [["Width","2100 mm"],["Film","LDPE/HDPE"],["Output","180 kg/h"],["Haul-off","Tower"]],
  },
  {
    slug: "rgb-rollbag",
    cat: "Bag Making",
    name: "CX-RGB Roll Bag Machine",
    tagline: "Continuous roll bag production up to 1200 mm.",
    specs: [["Width","1000–1200 mm"],["Type","Roll bag"],["Perforation","Yes"],["Core","Auto-cut"]],
  },
];

const TICKER_ITEMS = [
  "400 kg/h output", "80+ countries", "2100 mm web", "25 years",
  "500+ installations", "6 colours", "300 pcs/min", "ISO 9001",
  "±0.1 mm register", "5-layer co-ex", "99% recovery", "24/7 support",
];

const IMG_MAP: Record<string,string> = {
  "flexo-6c": "flexo-6c-nobg",
};
function mImg(slug:string){ return `/machines/${IMG_MAP[slug]??slug}.png`; }

// ─── Component ─────────────────────────────────────────────
export default function ParticlePortfolio(){
  const sectionRef   = useRef<HTMLDivElement>(null!);
  const scrollRef    = useRef(0);
  const [activeIdx, setActiveIdx] = useState(0);

  // GSAP refs — phase layers
  const heroRef      = useRef<HTMLDivElement>(null);
  const tickerRef    = useRef<HTMLDivElement>(null);
  const showcaseRef  = useRef<HTMLDivElement>(null);
  const imgRef       = useRef<HTMLImageElement>(null);
  const specsRef     = useRef<HTMLDivElement>(null);
  const progressRef  = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el = sectionRef.current; if(!el) return;

    // Drive 3D camera
    const camST = ScrollTrigger.create({
      trigger:el, start:"top top", end:"bottom bottom", scrub:1.5,
      onUpdate:(s)=>{ scrollRef.current = s.progress; },
    });

    const master = gsap.timeline({
      scrollTrigger:{ trigger:el, start:"top top", end:"bottom bottom", scrub:1.8 }
    });

    // ── Phase 1 (0–0.18): hero statement fades in
    master.fromTo(heroRef.current,
      { opacity:0, y:60 },
      { opacity:1, y:0, ease:"power3.out", duration:0.12 },
      0
    );

    // ── Phase 2 (0.18–0.30): ticker slides in from bottom
    master.fromTo(tickerRef.current,
      { opacity:0, y:40 },
      { opacity:1, y:0, ease:"power2.out", duration:0.08 },
      0.18
    );

    // ── Phase 3 (0.30–0.38): hero + ticker fade out
    master.to([heroRef.current, tickerRef.current],
      { opacity:0, y:-40, ease:"power2.in", duration:0.07 },
      0.30
    );

    // ── Phase 4 (0.38–0.98): showcase fades in, machines cycle
    master.fromTo(showcaseRef.current,
      { opacity:0 },
      { opacity:1, ease:"power2.out", duration:0.06 },
      0.38
    );

    // Cycle through 8 machines across the showcase phase (0.38–0.95)
    const machineRange = 0.57;
    const slot = machineRange / MACHINES.length;
    MACHINES.forEach((_, i) => {
      master.call(()=>{ setActiveIdx(i); }, [], 0.38 + i * slot);
    });

    // ── Phase 5 (0.95–1.0): everything fades out
    master.to(showcaseRef.current,
      { opacity:0, ease:"power2.in", duration:0.04 },
      0.95
    );

    return ()=>{ camST.kill(); master.kill(); };
  }, []);

  // Animate image + specs swap on machine change
  useEffect(()=>{
    if(!imgRef.current || !specsRef.current) return;
    gsap.fromTo([imgRef.current, specsRef.current],
      { opacity:0, x:30 },
      { opacity:1, x:0, duration:0.4, ease:"power3.out", stagger:0.06 }
    );
    if(progressRef.current){
      gsap.to(progressRef.current, { scaleX:(activeIdx+1)/MACHINES.length, duration:0.5, ease:"power2.out" });
    }
  }, [activeIdx]);

  const machine = MACHINES[activeIdx];

  return(
    <section ref={sectionRef} className="pp-section" style={{height:"600vh", position:"relative"}}>

      <style suppressHydrationWarning>{`
        .pp-section { isolation: isolate; }
        .pp-mobile  { display: none; }
        .pp-desktop { display: block; }

        @media (max-width: 768px) {
          .pp-mobile  { display: block; }
          .pp-desktop { display: none !important; }
          .pp-section { height: auto !important; }
        }

        /* ticker */
        @keyframes pp-ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .pp-ticker-track {
          display: flex; gap: 0;
          animation: pp-ticker 28s linear infinite;
          width: max-content;
        }
        .pp-ticker-track:hover { animation-play-state: paused; }

        /* progress bar */
        .pp-progress-bar {
          position: absolute; left:0; top:0; height:100%; width:100%;
          background: var(--brand-teal);
          transform-origin: left center;
        }

        /* spec row */
        .pp-spec-row {
          display: flex; align-items: baseline;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(43,191,179,0.12);
        }
        .pp-spec-row:first-child { border-top: 1px solid rgba(43,191,179,0.12); }

        /* dot */
        .pp-dot { width:6px; height:6px; background:rgba(255,255,255,0.18); flex-shrink:0; transition:background .2s; }
        .pp-dot--active { background:var(--brand-teal); }

        /* ── LIGHT MODE ── */
        [data-theme="light"] .pp-dot         { background: rgba(13,34,32,0.15); }
        [data-theme="light"] .pp-dot--active  { background: var(--brand-teal); }
        [data-theme="light"] .pp-spec-row    { border-color: rgba(43,191,179,0.18); }
        [data-theme="light"] .pp-desktop-bg  { background: transparent !important; }

        /* headline */
        [data-theme="light"] .pp-headline    { color: #0d2220 !important; }
        [data-theme="light"] .pp-sub         { color: rgba(13,34,32,0.7) !important; }
        [data-theme="light"] .pp-stat-val    { color: #0d2220 !important; }
        [data-theme="light"] .pp-stat-label  { color: rgba(43,191,179,0.8) !important; }
        [data-theme="light"] .pp-stat-pill   {
          background: rgba(43,191,179,0.08) !important;
          border-color: rgba(43,191,179,0.2) !important;
        }
        [data-theme="light"] .pp-stat-divider { border-color: rgba(43,191,179,0.15) !important; }

        /* ticker */
        [data-theme="light"] .pp-ticker-wrap {
          background: rgba(255,255,255,0.72) !important;
          border-color: rgba(43,191,179,0.2) !important;
          backdrop-filter: blur(12px);
        }
        [data-theme="light"] .pp-ticker-item { color: rgba(13,34,32,0.72) !important; }

        /* showcase left panel */
        [data-theme="light"] .pp-showcase-divider { border-color: rgba(43,191,179,0.15) !important; }
        [data-theme="light"] .pp-machine-img      { filter: drop-shadow(0 8px 32px rgba(43,191,179,0.15)) drop-shadow(0 4px 16px rgba(0,0,0,0.12)) !important; }
        [data-theme="light"] .pp-counter-text     { color: rgba(13,34,32,0.55) !important; }

        /* showcase right panel */
        [data-theme="light"] .pp-machine-name     { color: #0d2220 !important; }
        [data-theme="light"] .pp-machine-tagline  { color: rgba(13,34,32,0.7) !important; }
        [data-theme="light"] .pp-spec-label       { color: rgba(13,34,32,0.65) !important; }
        [data-theme="light"] .pp-spec-val         { color: #0d2220 !important; }
        [data-theme="light"] .pp-progress-track   { background: rgba(13,34,32,0.08) !important; }
        [data-theme="light"] .pp-progress-meta    { color: rgba(13,34,32,0.55) !important; }

        /* vignette hidden in light mode */
        [data-theme="light"] .pp-vignette { opacity: 0 !important; }

        /* mobile */
        [data-theme="light"] .pp-mobile-wrap {
          background: #f0faf9 !important;
          border-color: rgba(43,191,179,0.15) !important;
        }
        [data-theme="light"] .pp-mobile-headline { color: #0d2220 !important; }
        [data-theme="light"] .pp-mobile-sub      { color: rgba(13,34,32,0.7) !important; }
        [data-theme="light"] .pp-mobile-card     { background: #fff !important; }
        [data-theme="light"] .pp-mobile-cat      { color: var(--brand-teal) !important; }
        [data-theme="light"] .pp-mobile-name     { color: #0d2220 !important; }
        [data-theme="light"] .pp-mobile-img      { filter: drop-shadow(0 2px 8px rgba(0,0,0,0.1)) !important; }
        [data-theme="light"] .pp-mobile-stat-v   { color: var(--brand-teal) !important; }
        [data-theme="light"] .pp-mobile-stat-l   { color: rgba(13,34,32,0.6) !important; }
        [data-theme="light"] .pp-mobile-stats    {
          background: rgba(43,191,179,0.06) !important;
          border-color: rgba(43,191,179,0.15) !important;
        }
        [data-theme="light"] .pp-mobile-stat-divider { border-color: rgba(43,191,179,0.12) !important; }

        @media(prefers-reduced-motion:reduce){
          .pp-ticker-track { animation:none; }
        }
      `}</style>

      {/* ── MOBILE flat layout ── */}
      <div className="pp-mobile pp-mobile-wrap" style={{
        background:"#070f0e", borderTop:"1px solid rgba(43,191,179,0.12)",
        padding:"3.5rem 1.25rem 3rem", position:"relative", overflow:"hidden",
      }}>
        <div aria-hidden style={{
          position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",
          width:"80vw",height:"60vw",pointerEvents:"none",
          background:"radial-gradient(ellipse at 50% 0%,rgba(43,191,179,0.12) 0%,transparent 70%)",
        }}/>
        <div style={{position:"relative",zIndex:1,marginBottom:"2rem"}}>
          <div style={{fontFamily:"var(--ff-mono)",fontSize:"0.7rem",letterSpacing:"0.2em",
            textTransform:"uppercase",color:"var(--brand-teal)",marginBottom:"0.75rem"}}>
            Engineered · Proven · Supported
          </div>
          <h2 className="pp-mobile-headline" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(2.8rem,9vw,4rem)",
            color:"#fff",lineHeight:0.88,letterSpacing:"-0.02em",margin:"0 0 0.85rem"}}>
            Built for<br/><span style={{color:"var(--brand-teal)"}}>the floor.</span>
          </h2>
          <p className="pp-mobile-sub" style={{fontFamily:"var(--ff-body)",fontSize:"0.9rem",
            color:"rgba(255,255,255,0.7)",lineHeight:1.7,maxWidth:"38ch",margin:0}}>
            Industrial plastic-processing lines engineered in Wenzhou, proven across 80+ countries, supported for life.
          </p>
        </div>
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:"1px",
          background:"rgba(43,191,179,0.08)",border:"1px solid rgba(43,191,179,0.12)"}}>
          {MACHINES.slice(0,4).map((m,i)=>(
            <div key={m.slug} className="pp-mobile-card" style={{
              display:"flex",gap:"1rem",alignItems:"center",
              padding:"1rem 1.1rem",background:"rgba(6,10,9,0.9)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mImg(m.slug)} alt={m.name} className="pp-mobile-img"
                style={{width:"72px",height:"56px",objectFit:"contain",
                  filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.8))",flexShrink:0}}/>
              <div>
                <div className="pp-mobile-cat" style={{fontFamily:"var(--ff-mono)",fontSize:"0.64rem",
                  letterSpacing:"0.12em",textTransform:"uppercase",
                  color:"var(--brand-teal)",marginBottom:"0.2rem"}}>{m.cat}</div>
                <div className="pp-mobile-name" style={{fontFamily:"var(--ff-display)",fontSize:"0.95rem",
                  color:"rgba(255,255,255,0.9)",lineHeight:1.1}}>{m.name.split("—")[0].trim()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="pp-mobile-stats" style={{position:"relative",zIndex:1,display:"flex",gap:0,marginTop:"1px",
          background:"rgba(43,191,179,0.08)",border:"1px solid rgba(43,191,179,0.12)"}}>
          {[{v:"400 kg/h",l:"Max output"},{v:"80+",l:"Countries"},{v:"6",l:"Max colours"}].map((s,i)=>(
            <div key={i} className="pp-mobile-stat-divider" style={{flex:1,padding:"1rem 0.75rem",textAlign:"center",
              borderRight:i<2?"1px solid rgba(43,191,179,0.1)":"none"}}>
              <div className="pp-mobile-stat-v" style={{fontFamily:"var(--ff-display)",fontSize:"1.6rem",
                color:"var(--brand-teal)",lineHeight:1,letterSpacing:"-0.02em"}}>{s.v}</div>
              <div className="pp-mobile-stat-l" style={{fontFamily:"var(--ff-mono)",fontSize:"0.62rem",
                letterSpacing:"0.12em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.65)",marginTop:"0.3rem"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP scroll-driven experience ── */}
      <div className="pp-desktop pp-desktop-bg" style={{position:"sticky",top:0,height:"100vh",overflow:"hidden",background:"#070f0e"}}>

        {/* Forge 3D background */}
        <div style={{position:"absolute",inset:0,zIndex:1}}>
          <ForgeBackground scrollProgress={scrollRef.current} />
        </div>

        {/* radial vignette — hidden in light mode via CSS */}
        <div className="pp-vignette" aria-hidden style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
          background:"radial-gradient(ellipse 80% 60% at 50% 50%,transparent 40%,rgba(4,10,9,0.82) 100%)"}}/>

        {/* ── PHASE 1 — HERO ── */}
        <div ref={heroRef} style={{
          position:"absolute",inset:0,zIndex:10,
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          textAlign:"center",padding:"2rem",
          opacity:0,pointerEvents:"none",
        }}>
          <div style={{
            display:"flex",alignItems:"center",gap:"0.9rem",
            fontFamily:"var(--ff-mono)",fontSize:"0.7rem",
            letterSpacing:"0.22em",textTransform:"uppercase",
            color:"var(--brand-teal)",marginBottom:"1.75rem",
          }}>
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
            Wenzhou Ashal Innomach
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
          </div>

          <h2 className="pp-headline" style={{
            fontFamily:"var(--ff-display)",
            fontSize:"clamp(5rem,14vw,14rem)",
            lineHeight:0.84,letterSpacing:"-0.03em",
            color:"#fff",margin:0,textTransform:"uppercase",
          }}>
            Built for<br/>
            <span style={{color:"var(--brand-teal)"}}>the floor.</span>
          </h2>

          <p className="pp-sub" style={{
            fontFamily:"var(--ff-body)",
            fontSize:"clamp(0.9rem,1.2vw,1.05rem)",
            color:"rgba(255,255,255,0.7)",
            lineHeight:1.7,maxWidth:"44ch",margin:"2rem 0 0",
            letterSpacing:"0.01em",
          }}>
            Industrial plastic-processing lines — engineered in Wenzhou, proven in 80+ countries, supported for life.
          </p>

          <div className="pp-stat-pill" style={{
            display:"flex",gap:"1px",marginTop:"2.5rem",
            background:"rgba(43,191,179,0.1)",
            border:"1px solid rgba(43,191,179,0.14)",
          }}>
            {[
              {v:"400 kg/h", l:"Max output"},
              {v:"80+",      l:"Countries"},
              {v:"25 yrs",   l:"Experience"},
            ].map((s,i)=>(
              <div key={i} className="pp-stat-divider" style={{
                padding:"0.85rem 2rem",
                borderRight:i<2?"1px solid rgba(43,191,179,0.1)":"none",
                textAlign:"center",
              }}>
                <div className="pp-stat-val" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(1.4rem,2.5vw,2rem)",
                  color:"#fff",lineHeight:1,letterSpacing:"-0.02em"}}>{s.v}</div>
                <div className="pp-stat-label" style={{fontFamily:"var(--ff-mono)",fontSize:"0.66rem",
                  letterSpacing:"0.14em",textTransform:"uppercase",
                  color:"rgba(43,191,179,0.6)",marginTop:"0.3rem"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PHASE 2 — TICKER ── */}
        <div ref={tickerRef} className="pp-ticker-wrap" style={{
          position:"absolute",bottom:"5rem",left:0,right:0,
          zIndex:10,overflow:"hidden",opacity:0,
          borderTop:"1px solid rgba(43,191,179,0.14)",
          borderBottom:"1px solid rgba(43,191,179,0.14)",
          background:"rgba(5,12,11,0.7)",
          backdropFilter:"blur(12px)",
          WebkitBackdropFilter:"blur(12px)",
        }}>
          <div className="pp-ticker-track" style={{padding:"0.7rem 0"}}>
            {[...TICKER_ITEMS,...TICKER_ITEMS].map((item,i)=>(
              <span key={i} className="pp-ticker-item" style={{
                display:"inline-flex",alignItems:"center",gap:"1.5rem",
                padding:"0 2rem",
                fontFamily:"var(--ff-mono)",fontSize:"0.65rem",
                letterSpacing:"0.16em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.75)",whiteSpace:"nowrap",
              }}>
                <span style={{color:"var(--brand-teal)",fontSize:"0.64rem"}}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── PHASE 3 — MACHINE SHOWCASE ── */}
        <div ref={showcaseRef} style={{
          position:"absolute",inset:0,zIndex:10,
          display:"grid",gridTemplateColumns:"1fr 1fr",
          opacity:0,
        }}>

          {/* LEFT — image */}
          <div className="pp-showcase-divider" style={{
            position:"relative",display:"flex",
            alignItems:"center",justifyContent:"center",
            padding:"clamp(2rem,5vw,4rem)",
            borderRight:"1px solid rgba(43,191,179,0.1)",
          }}>
            <div style={{
              position:"absolute",top:"2rem",left:"clamp(1.5rem,4vw,3rem)",
              fontFamily:"var(--ff-mono)",fontSize:"0.68rem",
              letterSpacing:"0.18em",textTransform:"uppercase",
              color:"var(--brand-teal)",
              display:"flex",alignItems:"center",gap:"0.6rem",
            }}>
              <span style={{width:"1.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block"}}/>
              {machine.cat}
            </div>

            <div style={{
              position:"absolute",bottom:"2.5rem",left:"clamp(1.5rem,4vw,3rem)",
              display:"flex",gap:"0.4rem",alignItems:"center",
            }}>
              {MACHINES.map((_,i)=>(
                <div key={i} className={`pp-dot${i===activeIdx?" pp-dot--active":""}`}/>
              ))}
            </div>

            <div className="pp-counter-text" style={{
              position:"absolute",bottom:"2.5rem",right:"clamp(1.5rem,4vw,3rem)",
              fontFamily:"var(--ff-mono)",fontSize:"0.68rem",
              letterSpacing:"0.1em",color:"rgba(255,255,255,0.55)",
            }}>
              {String(activeIdx+1).padStart(2,"0")} / {String(MACHINES.length).padStart(2,"0")}
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={mImg(machine.slug)}
              alt={machine.name}
              className="pp-machine-img"
              style={{
                maxWidth:"80%",maxHeight:"60vh",objectFit:"contain",
                filter:"drop-shadow(0 8px 40px rgba(43,191,179,0.18)) drop-shadow(0 4px 20px rgba(0,0,0,0.9))",
              }}
            />
          </div>

          {/* RIGHT — specs */}
          <div ref={specsRef} style={{
            display:"flex",flexDirection:"column",justifyContent:"center",
            padding:"clamp(2rem,5vw,4rem) clamp(2rem,6vw,5rem)",
          }}>
            <div style={{marginBottom:"2rem"}}>
              <h3 className="pp-machine-name" style={{
                fontFamily:"var(--ff-display)",
                fontSize:"clamp(2rem,3.5vw,3.5rem)",
                lineHeight:0.9,letterSpacing:"-0.02em",
                color:"#fff",margin:"0 0 0.75rem",textTransform:"uppercase",
              }}>
                {machine.name}
              </h3>
              <p className="pp-machine-tagline" style={{
                fontFamily:"var(--ff-body)",
                fontSize:"clamp(0.82rem,1vw,0.92rem)",
                color:"rgba(255,255,255,0.7)",
                lineHeight:1.72,margin:0,maxWidth:"36ch",
              }}>
                {machine.tagline}
              </p>
            </div>

            <div style={{marginBottom:"2.5rem"}}>
              {machine.specs.map(([label,value])=>(
                <div key={label} className="pp-spec-row">
                  <span className="pp-spec-label" style={{
                    fontFamily:"var(--ff-mono)",fontSize:"0.7rem",
                    letterSpacing:"0.12em",textTransform:"uppercase",
                    color:"rgba(255,255,255,0.65)",
                  }}>{label}</span>
                  <span className="pp-spec-val" style={{
                    fontFamily:"var(--ff-display)",fontSize:"clamp(1.1rem,1.8vw,1.5rem)",
                    color:"#fff",letterSpacing:"-0.01em",
                  }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{marginBottom:"2rem"}}>
              <div className="pp-progress-meta" style={{
                display:"flex",justifyContent:"space-between",
                fontFamily:"var(--ff-mono)",fontSize:"0.64rem",
                letterSpacing:"0.12em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.55)",marginBottom:"0.5rem",
              }}>
                <span>Catalogue</span>
                <span>{activeIdx+1} of {MACHINES.length}</span>
              </div>
              <div className="pp-progress-track" style={{
                height:"2px",background:"rgba(255,255,255,0.08)",
                position:"relative",overflow:"hidden",
              }}>
                <div ref={progressRef} className="pp-progress-bar" style={{transform:`scaleX(${(activeIdx+1)/MACHINES.length})`}}/>
              </div>
            </div>

            <a href={`/products/${machine.slug.includes("flexo")?"printing":machine.cat.toLowerCase().replace(" ","-")}/${machine.slug}`}
              style={{
                display:"inline-flex",alignItems:"center",gap:"0.75rem",
                padding:"0.85rem 1.75rem",background:"transparent",
                border:"1px solid rgba(43,191,179,0.35)",color:"var(--brand-teal)",
                fontFamily:"var(--ff-mono)",fontSize:"0.68rem",
                letterSpacing:"0.14em",textTransform:"uppercase",
                textDecoration:"none",alignSelf:"flex-start",
                transition:"background .18s,border-color .18s",
              }}
              onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.background="rgba(43,191,179,0.08)";(e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(43,191,179,0.7)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.background="transparent";(e.currentTarget as HTMLAnchorElement).style.borderColor="rgba(43,191,179,0.35)";}}
            >
              View full specs
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
