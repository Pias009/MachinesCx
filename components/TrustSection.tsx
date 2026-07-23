"use client";
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─────────────────────────────────────────────
// NEBULA BACKGROUND
// ─────────────────────────────────────────────
function seededRand(seed: number) {
  const x = Math.sin(seed + 1) * 43758.5453123;
  return x - Math.floor(x);
}
function noise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = x-ix, fy = y-iy, fz = z-iz;
  const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy), uz = fz*fz*(3-2*fz);
  const r = (a:number,b:number,c:number) => seededRand(a*127+b*311+c*74);
  return (
    r(ix,iy,iz)*(1-ux)*(1-uy)*(1-uz)   + r(ix+1,iy,iz)*ux*(1-uy)*(1-uz)+
    r(ix,iy+1,iz)*(1-ux)*uy*(1-uz)      + r(ix+1,iy+1,iz)*ux*uy*(1-uz)+
    r(ix,iy,iz+1)*(1-ux)*(1-uy)*uz      + r(ix+1,iy,iz+1)*ux*(1-uy)*uz+
    r(ix,iy+1,iz+1)*(1-ux)*uy*uz        + r(ix+1,iy+1,iz+1)*ux*uy*uz
  );
}
const PALETTE = [
  new THREE.Color("#040e0d"), new THREE.Color("#082220"),
  new THREE.Color("#0d3530"), new THREE.Color("#165e58"),
  new THREE.Color("#1fa39a"), new THREE.Color("#2bbfb3"),
  new THREE.Color("#5dd6cc"), new THREE.Color("#a8ede9"),
  new THREE.Color("#fcd34d"), new THREE.Color("#f59e0b"),
  new THREE.Color("#fb7185"), new THREE.Color("#e11d48"),
];
function pickColor(t: number) {
  const s = Math.max(0,Math.min(0.9999,t))*(PALETTE.length-1);
  const i = Math.floor(s);
  return PALETTE[i].clone().lerp(PALETTE[i+1], s-i);
}
// 22 000 particles across 7 dense overlapping lobes — fills the full viewport
const COUNT = 8000;

// 7 lobe centres spread wide so particles cover the whole background
const LOBES = [
  [-3.5, 1.5,-1], [3,-1, 0.5], [-1,-2, 2 ], [2, 2.5,-2],
  [ 0,   0,  0 ], [-4,-1,-2 ], [4,  2,  1 ],
] as const;

function NebulaCloud() {
  const pointsRef = useRef<THREE.Points>(null!);
  const { positions, colors, speeds, offsets } = useMemo(() => {
    const positions = new Float32Array(COUNT*3);
    const colors    = new Float32Array(COUNT*3);
    const speeds    = new Float32Array(COUNT);
    const offsets   = new Float32Array(COUNT*3);
    for (let i=0;i<COUNT;i++) {
      const s=i*7;
      const lobe=Math.floor(seededRand(s)*LOBES.length);
      const [cx,cy,cz]=LOBES[lobe];
      // wider spread so particles cover full canvas width
      const spread=3.0+seededRand(s+1)*4.5;
      const gx=(seededRand(s+2)+seededRand(s+3)-1)*spread;
      const gy=(seededRand(s+4)+seededRand(s+5)-1)*spread;
      const gz=(seededRand(s+6)+seededRand(s+7)-1)*spread*0.55;
      positions[i*3]=cx+gx; positions[i*3+1]=cy+gy; positions[i*3+2]=cz+gz;
      const dist=Math.sqrt(gx*gx+gy*gy+gz*gz)/(spread*1.3);
      const t=Math.max(0,1-dist)*seededRand(s+8)*1.6;
      const col=pickColor(Math.min(t,1));
      // boost brightness — multiply each channel toward full saturation
      colors[i*3]=Math.min(col.r*1.6,1);
      colors[i*3+1]=Math.min(col.g*1.6,1);
      colors[i*3+2]=Math.min(col.b*1.6,1);
      speeds[i]=0.03+seededRand(s+9)*0.06;
      offsets[i*3]=seededRand(s+10)*100; offsets[i*3+1]=seededRand(s+11)*100; offsets[i*3+2]=seededRand(s+12)*100;
    }
    return { positions, colors, speeds, offsets };
  }, []);
  const basePos = useMemo(()=>new Float32Array(positions),[positions]);
  const geoRef = useRef<THREE.BufferGeometry>(null!);

  useFrame(({ clock }) => {
    const t=clock.getElapsedTime();
    const pos=geoRef.current.attributes.position.array as Float32Array;
    for (let i=0;i<COUNT;i++) {
      const sp=speeds[i];
      const ox=offsets[i*3],oy=offsets[i*3+1],oz=offsets[i*3+2];
      const bx=basePos[i*3],by=basePos[i*3+1],bz=basePos[i*3+2];
      const ts=t*sp;
      pos[i*3]  =bx+(noise3(ox+ts*0.7,oy,oz)-0.5)*0.8;
      pos[i*3+1]=by+(noise3(ox,oy+ts*0.5,oz)-0.5)*0.8;
      pos[i*3+2]=bz+(noise3(ox,oy,oz+ts*0.6)-0.5)*0.4;
    }
    geoRef.current.attributes.position.needsUpdate=true;
    if (pointsRef.current) {
      pointsRef.current.rotation.y=t*0.018;
      pointsRef.current.rotation.x=Math.sin(t*0.01)*0.06;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry
        ref={geoRef}
        onUpdate={(g) => g.computeBoundingSphere()}
      >
        <bufferAttribute attach="attributes-position" args={[positions,3]}/>
        <bufferAttribute attach="attributes-color"    args={[colors,3]}/>
      </bufferGeometry>
      <pointsMaterial size={0.032} vertexColors transparent opacity={0.95}
        sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}/>
    </points>
  );
}

function NebulaBackground() {
  return (
    <Canvas style={{position:"absolute",inset:0,width:"100%",height:"100%"}}
      camera={{position:[0,0,11],fov:60}}
      gl={{antialias:false, alpha:true, powerPreference:"high-performance"}}
      dpr={[1, 1.5]}
      frameloop="always"
      performance={{ min: 0.5 }}>
      <NebulaCloud/>
    </Canvas>
  );
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const STATS = [
  { value:"25+",  label:"Years Manufacturing", sub:"Est. since the early 2000s" },
  { value:"80+",  label:"Countries Served",    sub:"Active global export network" },
  { value:"4",    label:"Machine Categories",  sub:"Film · Bag · Recycling · Print" },
  { value:"500+", label:"Machines Installed",  sub:"Across four continents" },
];

// ─────────────────────────────────────────────
// COUNT-UP
// ─────────────────────────────────────────────
function useCountUp(target: string, duration = 1600) {
  const ref = useRef<HTMLSpanElement>(null);
  const num = parseFloat(target.replace(/[^0-9.]/g,""));
  const sfx = target.replace(/[0-9.]/g,"");
  useEffect(()=>{
    const el=ref.current;
    if(!el||isNaN(num)){if(el)el.textContent=target;return;}
    const ob=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return; ob.disconnect();
      const start=performance.now();
      const tick=(now:number)=>{
        const p=Math.min((now-start)/duration,1);
        el.textContent=Math.round((1-Math.pow(1-p,3))*num)+sfx;
        if(p<1)requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    },{threshold:0.3});
    ob.observe(el);
    return()=>ob.disconnect();
  },[num,sfx,duration,target]);
  return ref;
}

function StatItem({value,label,sub}:{value:string;label:string;sub:string}) {
  const ref=useCountUp(value);
  return (
    <div className="ts-stat">
      <span className="ts-stat__val" ref={ref}>{value}</span>
      <span className="ts-stat__label">{label}</span>
      <span className="ts-stat__sub">{sub}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROLLING WORDS — fixed lead-in text + one word/phrase that rolls
// vertically in place, cycling through what the brand actually does.
// ─────────────────────────────────────────────
const ROLL_WORDS = [
  "Film Blowing.",
  "Bag Making.",
  "Recycling Lines.",
  "Flexographic Printing.",
  "80+ Countries.",
  "Lifetime Support.",
];

function RollingWords() {
  const [i, setI] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = setInterval(() => {
      setI(n => {
        setPrev(n);
        return (n + 1) % ROLL_WORDS.length;
      });
    }, 2400);
    return () => clearInterval(id);
  }, []);

  // clear the outgoing word once its exit animation has finished
  useEffect(() => {
    if (prev === null) return;
    const t = setTimeout(() => setPrev(null), 650);
    return () => clearTimeout(t);
  }, [prev]);

  return (
    <span className="ts-roll" aria-live="off">
      <span className="ts-roll__glow" aria-hidden="true" />
      {ROLL_WORDS.map((w, idx) => {
        if (idx !== i && idx !== prev) return null;
        const state = idx === i ? "in" : "out";
        return (
          <span className={`ts-roll__word ts-roll__word--${state}`} key={idx} aria-hidden={idx !== i}>
            {w}
          </span>
        );
      })}
      <span className="sr-only">{ROLL_WORDS[i]}</span>
    </span>
  );
}

// ─────────────────────────────────────────────
// CAPABILITY DOSSIER — right-side panel replacing the plain paragraph.
// Reads like a spec sheet: a proof-line with rolling word, then the
// concrete reasons a manufacturer picks this vendor.
// ─────────────────────────────────────────────
const DOSSIER = [
  { tag: "01", title: "Engineering", copy: "In-house R&D team designs and stress-tests every line before it ships." },
  { tag: "02", title: "Export",      copy: "Direct factory pricing with full documentation for customs in 80+ countries." },
  { tag: "03", title: "Aftercare",   copy: "Spare parts and technical support for the life of the machine, not just the warranty." },
];

function CapabilityDossier() {
  return (
    <div className="ts-dossier">
      <p className="ts-desc">
        Wenzhou Asal Innomach Technology, trusted in
        <br/><RollingWords />
      </p>

      <ul className="ts-dossier__list">
        {DOSSIER.map((d) => (
          <li className="ts-dossier__item" key={d.tag}>
            <span className="ts-dossier__tag">{d.tag}</span>
            <span className="ts-dossier__body">
              <span className="ts-dossier__title">{d.title}</span>
              <span className="ts-dossier__copy">{d.copy}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function TrustSection() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    const el=headerRef.current; if(!el)return;
    el.style.opacity="0"; el.style.transform="translateY(20px)";
    const ob=new IntersectionObserver(([e])=>{
      if(!e.isIntersecting)return; ob.disconnect();
      el.style.transition="opacity 0.7s cubic-bezier(0.16,1,0.3,1),transform 0.7s cubic-bezier(0.16,1,0.3,1)";
      el.style.opacity="1"; el.style.transform="translateY(0)";
    },{threshold:0.2});
    ob.observe(el);
    return()=>ob.disconnect();
  },[]);

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── section ── */
        .trust-section {
          position: relative;
          background: #0d1614;
          overflow: hidden;
          padding-top: clamp(5rem, 10vw, 9rem);
          padding-bottom: clamp(4rem, 8vw, 7rem);
        }
        .ts__blob {
          position: absolute; border-radius: 50%; pointer-events: none;
        }
        .ts__blob--1 {
          width: min(45vw, 500px); height: min(45vw, 500px);
          bottom: -15%; right: -10%;
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%);
          animation: ts-float 18s ease-in-out infinite;
        }
        .ts__blob--2 {
          width: min(25vw, 280px); height: min(25vw, 280px);
          top: 10%; left: 5%;
          background: radial-gradient(circle, rgba(225,29,72,0.05) 0%, transparent 70%);
          animation: ts-float 14s ease-in-out infinite reverse;
        }
        @keyframes ts-float {
          0%,100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(15px, -25px) scale(1.05); }
        }
        .ts-bg {
          position: absolute; inset: 0; z-index: 0;
          -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
        .ts-inner {
          position: relative; z-index: 1;
          max-width: 1280px; margin: 0 auto;
          padding-inline: clamp(1.25rem, 4vw, 3rem);
        }

        /* ── header ── */
        .ts-header {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 2rem 4rem; align-items: start;
          margin-bottom: clamp(3rem, 5vw, 5rem);
          border-bottom: 1px solid rgba(255,255,255,.07);
          padding-bottom: clamp(2rem, 3.5vw, 3.5rem);
        }
        @media(max-width:720px){.ts-header{grid-template-columns:1fr;}}

        .ts-kicker {
          display: inline-flex; align-items: center; gap: .75rem;
          font-family: var(--ff-mono); font-size: .67rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--brand-amber); margin-bottom: 1.1rem;
        }
        .ts-kicker::before{content:"";width:2rem;height:1px;background:var(--brand-amber);}
        .ts-headline {
          font-family: var(--ff-display);
          font-size: clamp(2.6rem, 5.2vw, 5rem);
          line-height: .95; letter-spacing: -.01em;
          color: #f8fafc; text-wrap: balance; margin: 0;
        }
        .ts-headline em{
          font-style:normal;
          background: linear-gradient(135deg, var(--brand-amber), var(--brand-rose));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ts-dossier {
          display: flex; flex-direction: column;
          gap: clamp(1.25rem, 2.2vw, 1.75rem);
          position: relative;
          padding: clamp(1.5rem, 2.4vw, 2.25rem);
          background: linear-gradient(155deg, rgba(20,38,35,0.65) 0%, rgba(10,22,20,0.55) 100%);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 24px 48px -24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
        }
        .ts-dossier::before {
          content: "";
          position: absolute; top: 0; left: clamp(1.5rem, 2.4vw, 2.25rem);
          width: 2.5rem; height: 2px;
          background: linear-gradient(90deg, var(--brand-amber), var(--brand-rose));
        }
        .ts-desc {
          color: #ffffff;
          font-weight: 700;
          font-size: clamp(1rem, 1.35vw, 1.15rem);
          line-height: 1.6; max-width: 42ch;
          letter-spacing: -.005em;
        }
        .ts-roll {
          display: block;
          position: relative;
          height: clamp(1.9rem, 2.8vw, 2.4rem);
          margin-top: .35rem;
          perspective: 600px;
        }
        .ts-roll__glow {
          position: absolute;
          left: -1rem; top: 50%;
          width: clamp(2.5rem, 6vw, 4rem); height: clamp(2.5rem, 6vw, 4rem);
          transform: translateY(-50%);
          background: radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 72%);
          filter: blur(6px);
          pointer-events: none;
          animation: ts-roll-glow-pulse 2.4s ease-in-out infinite;
        }
        @keyframes ts-roll-glow-pulse {
          0%, 100% { opacity: .5; transform: translateY(-50%) scale(0.9); }
          50%      { opacity: 1;  transform: translateY(-50%) scale(1.15); }
        }
        .ts-roll__word {
          position: absolute;
          left: 0; top: 0;
          display: block;
          height: 100%;
          line-height: clamp(1.9rem, 2.8vw, 2.4rem);
          font-family: var(--ff-display);
          font-size: clamp(1.3rem, 2.4vw, 1.9rem);
          letter-spacing: .01em;
          background: linear-gradient(135deg, var(--brand-amber), var(--brand-rose));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
          transform-style: preserve-3d;
          will-change: transform, filter, opacity;
        }
        .ts-roll__word--in {
          animation: ts-roll-in .6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .ts-roll__word--out {
          animation: ts-roll-out .5s cubic-bezier(0.4,0,0.7,0.4) both;
        }
        @keyframes ts-roll-in {
          0%   { opacity: 0; transform: rotateX(-70deg) translateY(30%); filter: blur(10px); }
          60%  { filter: blur(1px); }
          100% { opacity: 1; transform: rotateX(0deg) translateY(0); filter: blur(0); }
        }
        @keyframes ts-roll-out {
          0%   { opacity: 1; transform: rotateX(0deg) translateY(0); filter: blur(0); }
          100% { opacity: 0; transform: rotateX(70deg) translateY(-30%); filter: blur(10px); }
        }

        /* ── dossier list ── */
        .ts-dossier__list {
          list-style: none; margin: 0; padding: 0;
          display: flex; flex-direction: column;
        }
        .ts-dossier__item {
          display: flex; align-items: baseline; gap: 1rem;
          padding: .85rem 0;
          border-top: 1px solid rgba(255,255,255,.08);
        }
        .ts-dossier__tag {
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .08em; color: var(--brand-amber);
          flex: 0 0 auto; padding-top: .18rem;
        }
        .ts-dossier__body {
          display: flex; flex-direction: column; gap: .2rem;
        }
        .ts-dossier__title {
          font-family: var(--ff-display);
          font-size: clamp(.95rem, 1.3vw, 1.05rem);
          color: #f8fafc; letter-spacing: -.005em;
        }
        .ts-dossier__copy {
          font-size: .82rem; line-height: 1.55;
          color: rgba(248,250,252,.8); max-width: 40ch;
        }

        /* ── stats ── */
        .ts-stats {
          display: grid; grid-template-columns: repeat(4,1fr);
          border: 1px solid rgba(255,255,255,.07);
          margin-bottom: 0;
        }
        @media(max-width:860px){.ts-stats{grid-template-columns:repeat(2,1fr);}}
        @media(max-width:440px){.ts-stats{grid-template-columns:1fr;}}

        .ts-stat {
          display: flex; flex-direction: column; gap: .28rem;
          padding: clamp(1.25rem,2.5vw,2rem) clamp(1rem,2vw,1.75rem);
          border-right: 1px solid rgba(255,255,255,.07); position: relative;
        }
        .ts-stat:last-child{border-right:none;}
        .ts-stat::after {
          content:""; position:absolute; bottom:0; left:0; right:0;
          height:2px;
          background: linear-gradient(90deg, var(--brand-teal), var(--brand-amber), var(--brand-rose));
          transform:scaleX(0); transform-origin:left;
          transition:transform .4s cubic-bezier(.16,1,.3,1);
        }
        .ts-stat:hover::after{transform:scaleX(1);}
        .ts-stat__val {
          font-family: var(--ff-display);
          font-size: clamp(2.2rem,3.8vw,3.6rem);
          line-height: 1; color: #f8fafc; letter-spacing: -.01em;
        }
        .ts-stat__label{font-size:.8rem;font-weight:600;color:rgba(248,250,252,.8);letter-spacing:.02em;}
        .ts-stat__sub{font-family:var(--ff-mono);font-size:0.7rem;color:rgba(248,250,252,0.6);letter-spacing:.08em;text-transform:uppercase;}

        /* ── bottom fade — blends into next section ── */
        .ts-fade {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 120px; z-index: 2; pointer-events: none;
          background: linear-gradient(to bottom, transparent, #0d1614);
        }

        @media(max-width:640px){
          .trust-section { padding-top: clamp(3rem,8vw,5rem); padding-bottom: clamp(2.5rem,6vw,4rem); }
          .ts-header { gap: 1.25rem 1.5rem; margin-bottom: clamp(2rem,4vw,3rem); padding-bottom: clamp(1.5rem,3vw,2rem); }
          .ts-headline { font-size: clamp(2rem,8vw,3.2rem); }
          .ts-desc { font-size: 0.88rem; }
          .ts-stat__val { font-size: clamp(1.8rem,7vw,2.8rem); }
          .ts-dossier__item { padding: .7rem 0; gap: .75rem; }
        }
        @media(max-width:440px){
          .ts-stats { grid-template-columns: repeat(2,1fr); }
          .ts-stat { padding: 1rem; }
        }
        @media(prefers-reduced-motion:reduce){
          .ts-header{opacity:1!important;transform:none!important;transition:none!important;}
          .ts-stat::after{display:none;}
          .ts-roll__word{animation:none!important;opacity:1!important;transform:none!important;filter:none!important;}
          .ts-roll__glow{animation:none!important;}
        }

        /* ── Light mode ── */
        [data-theme="light"] .trust-section { background: #ffffff; }
        [data-theme="light"] .ts-kicker     { color: var(--brand-amber); }
        [data-theme="light"] .ts-kicker::before { background: var(--brand-amber); }
        [data-theme="light"] .ts-headline   { color: #0d2220; }
        [data-theme="light"] .ts-headline em { background: none; -webkit-text-fill-color: initial; color: var(--brand-amber); }
        [data-theme="light"] .ts-desc       { color: rgba(13,34,32,0.85); }
        [data-theme="light"] .ts-dossier {
          background: linear-gradient(155deg, rgba(255,255,255,0.7) 0%, rgba(240,253,251,0.55) 100%);
          border-color: rgba(43,191,179,0.18);
          box-shadow: 0 24px 48px -28px rgba(13,34,32,0.18), inset 0 1px 0 rgba(255,255,255,0.5);
        }
        [data-theme="light"] .ts-stat__val   { color: #0d2220; }
        [data-theme="light"] .ts-stat__label { color: rgba(13,34,32,0.72); }
        [data-theme="light"] .ts-stat__sub   { color: rgba(13,34,32,0.6); }
        [data-theme="light"] .ts-stats       { border-color: rgba(43,191,179,0.2); }
        [data-theme="light"] .ts-stat        { border-right-color: rgba(43,191,179,0.15); }
        [data-theme="light"] .ts-header      { border-bottom-color: rgba(43,191,179,0.18); }
        [data-theme="light"] .ts-roll__word { background: none; -webkit-text-fill-color: initial; color: var(--brand-amber); }
        [data-theme="light"] .ts-dossier__item  { border-top-color: rgba(43,191,179,0.18); }
        [data-theme="light"] .ts-dossier__title { color: #0d2220; }
        [data-theme="light"] .ts-dossier__copy  { color: rgba(13,34,32,0.6); }
      `}</style>

      <section className="trust-section" aria-label="Why trust CX Machinery">

        <div className="ts__blob ts__blob--1" aria-hidden="true" />
        <div className="ts__blob ts__blob--2" aria-hidden="true" />

        <div className="ts-bg" aria-hidden="true">
          <NebulaBackground/>
        </div>

        <div className="ts-inner">

          {/* Header */}
          <div className="ts-header" ref={headerRef} data-no-anim>
            <div>
              <div className="ts-kicker">Why manufacturers choose us</div>
              <h2 className="ts-headline">
                Engineered.<br/>
                <em>Proven.</em><br/>
                Supported.
              </h2>
            </div>
            <CapabilityDossier />
          </div>

          {/* Stats */}
          <div className="ts-stats" role="list">
            {STATS.map(s=>(
              <div role="listitem" key={s.label}>
                <StatItem {...s}/>
              </div>
            ))}
          </div>

        </div>

        <div className="ts-fade" aria-hidden="true" />

      </section>
    </>
  );
}
