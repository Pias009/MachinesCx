"use client";
import React, { useRef, useEffect, useState } from "react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import { useCms } from "@/lib/useCms";

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

// step order + image/category — copy (stage/name/role/quality) comes from
// the particlePortfolio.steps translation namespace, keyed by slug
const STEP_ORDER: { slug: string; img: string; cat: string }[] = [
  { slug: "abcde-2200", img: "/machines/abcde-2200.png", cat: "film-blowing" },
  { slug: "flexo-6c", img: "/machines/flexo-6c-nobg.png", cat: "printing" },
  { slug: "t-pro-heatseal", img: "/machines/t-pro-heatseal.png", cat: "bag-making" },
  { slug: "rgb-rollbag", img: "/machines/rgb-rollbag.png", cat: "bag-making" },
  { slug: "cx-pelletizing", img: "/machines/cx-pelletizing.png", cat: "recycling" },
];

function rgbFromHex(hex: string, a = 1) {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function ParticlePortfolio(){
  const t = useTranslations("particlePortfolio");
  const stepsCopy = t.raw("steps") as Record<string, { stage: string; name: string; role: string; quality: [string, string][] }>;
  const DEFAULT_STEPS: Step[] = STEP_ORDER.map((s) => ({ ...s, ...stepsCopy[s.slug] }));

  const sectionRef = useRef<HTMLDivElement>(null!);
  const [active, setActive] = useState(0);
  const [mobileOpen, setMobileOpen] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cms = useCms<{ items: Step[] }>("production-line", { items: DEFAULT_STEPS });
  // skip unfinished admin drafts (blank slug/name) so a half-filled CMS
  // entry can never surface a broken card on the live site
  const cmsItems = (cms.items ?? []).filter(it => it.slug && it.name);
  const STEPS = cmsItems.length ? cmsItems : DEFAULT_STEPS;
  const N     = STEPS.length;

  // Simple, reliable entrance — fade the whole section in once when it
  // scrolls into view. No pinning, no scrub, no scroll-tied timeline.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setVisible(true); return; }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);

    // Safety net — never leave the section permanently hidden.
    const fallback = setTimeout(() => setVisible(true), 3000);

    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, []);

  // Auto-advance through the steps, same pattern as ClientJourney.
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % N);
    }, 4000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [N]);

  const restartTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setActive(a => (a + 1) % N), 4000);
  };

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
    <section ref={sectionRef} className="pp-section">

      <style suppressHydrationWarning>{`
        .pp-section { position: relative; isolation: isolate; }
        .pp-mobile  { display: none; }
        .pp-desktop { display: block; }

        @media (max-width: 900px) {
          .pp-mobile  { display: block; }
          .pp-desktop { display: none !important; }
        }

        .pp-desktop-in {
          opacity: 0; transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .pp-desktop-in--visible { opacity: 1; transform: translateY(0); }

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
          position: relative;
          margin-top: clamp(1.5rem, 3vh, 2.5rem);
          z-index: 25;
          display: flex; align-items: center; gap: clamp(1rem, 2.5vw, 2.5rem);
          background: rgba(5,12,11,0.78);
          backdrop-filter: blur(12px);
          border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
          padding: 0.9rem clamp(1rem, 2vw, 1.75rem);
          transition: border-color 0.4s, opacity 0.35s ease;
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
          text-align: center; margin-bottom: clamp(1.5rem, 4vh, 2.5rem);
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

        .pp-diagram {
          position: relative;
          height: clamp(360px, 46vw, 560px);
        }

        [data-theme="light"] .pp-headline   { color: #0d2220 !important; }
        [data-theme="light"] .pp-sub        { color: rgba(13,34,32,0.65) !important; }
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
          .pp-desktop-in { transition: none; }
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
            {t("mobileKicker", { count: String(N).padStart(2,"0") })}
          </div>
          <h2 className="pp-mobile-headline" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(2.6rem,9vw,3.6rem)",
            color:"#fff",lineHeight:0.88,letterSpacing:"-0.02em",margin:"0 0 0.85rem"}}>
            {t("mobileHeadlineLine1")}<br/><span style={{background:"linear-gradient(135deg,var(--brand-teal),var(--brand-amber))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{t("mobileHeadlineEm")}</span>
          </h2>
          <p className="pp-mobile-sub" style={{fontFamily:"var(--ff-body)",fontSize:"0.9rem",
            color:"rgba(255,255,255,0.65)",lineHeight:1.7,maxWidth:"40ch",margin:0}}>
            {t("mobileSub")}
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
      <div className={`pp-desktop pp-desktop-in${visible ? " pp-desktop-in--visible" : ""}`} style={{
        padding: "clamp(3rem,6vw,5rem) clamp(1.25rem,4vw,3rem)",
        background: "#070f0e",
      }}>
        <div style={{textAlign:"center", marginBottom:"clamp(2.5rem,5vw,4rem)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"0.9rem",
            fontFamily:"var(--ff-mono)",fontSize:"0.64rem",letterSpacing:"0.22em",
            textTransform:"uppercase",marginBottom:"1.25rem",
            background:"linear-gradient(135deg, var(--brand-teal), var(--brand-amber))",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
            One floor · one connected line
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-amber)",display:"inline-block",opacity:0.6}}/>
          </div>
          <h2 className="pp-headline" style={{fontFamily:"var(--ff-display)",fontSize:"clamp(2.6rem,5.5vw,5rem)",
            lineHeight:0.9,letterSpacing:"-0.02em",color:"#fff",margin:0,textTransform:"uppercase"}}>
            {t("desktopHeadlinePrefix")} <span style={{background:"linear-gradient(135deg,var(--brand-teal),var(--brand-amber))",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{t("desktopHeadlineEm")}</span>
          </h2>
          <p className="pp-sub" style={{fontFamily:"var(--ff-body)",fontSize:"clamp(0.9rem,1.1vw,1.05rem)",
            color:"rgba(255,255,255,0.65)",lineHeight:1.7,maxWidth:"46ch",margin:"1.25rem auto 0",letterSpacing:"0.01em"}}>
            {t("desktopSub")}
          </p>
        </div>

        <div className="pp-ring-title">
          <span>{t("ringEyebrow")}</span>
          <h3>{t("ringTitle")}</h3>
        </div>

        <div className="pp-diagram">
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
              <NextImage src="/machines/bag-samples.png" alt={t("finishedProductAlt")} fill sizes="150px" />
            </div>
            <div className="pp-core__label">{t("finishedProduct")}</div>
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
                onClick={()=>{ setActive(i); restartTimer(); }}
                aria-label={t("stepAriaLabel", { num: i+1, stage: s.stage })}
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
        </div>

        <div className="pp-panel" style={{"--accent": curAccent.hex} as React.CSSProperties}>
          <div className="pp-panel__id">
            <div className="pp-panel__step">{t("setupLabel", { num: String(active+1).padStart(2,"0"), total: String(N).padStart(2,"0") })}</div>
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
            {t("viewMachine")}
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
