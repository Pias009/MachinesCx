"use client";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── 3D helpers ──────────────────────────────────────────────
function seeded(n: number) { const x = Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); }
function clampN(v:number,lo:number,hi:number){return Math.max(lo,Math.min(hi,v));}

const COLS=[
  new THREE.Color("#040e0d"),new THREE.Color("#082220"),new THREE.Color("#0d3530"),
  new THREE.Color("#165e58"),new THREE.Color("#1fa39a"),new THREE.Color("#2bbfb3"),
  new THREE.Color("#5dd6cc"),new THREE.Color("#a8ede9"),
];
function pal(t:number,bright=1){
  const s=clampN(t,0,0.9999)*(COLS.length-1);const i=Math.floor(s);
  return COLS[i].clone().lerp(COLS[i+1],s-i).multiplyScalar(bright);
}
function vnoise(x:number,y:number){
  const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
  const ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy);
  const h=(a:number,b:number)=>{const n=Math.sin(a*127.1+b*311.7)*43758.5453;return n-Math.floor(n);};
  return(h(ix,iy)*(1-ux)*(1-uy)+h(ix+1,iy)*ux*(1-uy)+h(ix,iy+1)*(1-ux)*uy+h(ix+1,iy+1)*ux*uy)*2-1;
}

const SMOKE_COUNT=5000;
interface SP{shell:number;angle0:number;y0:number;turbX:number;turbZ:number;colorT:number;rotSpeed:number;riseRate:number;}
function buildSmoke(n:number):SP[]{
  return Array.from({length:n},(_,i)=>{
    const s=i*19,shell=Math.pow(seeded(s),0.6),yRaw=(seeded(s+2)+seeded(s+3)+seeded(s+4))/3;
    return{shell,angle0:seeded(s+1)*Math.PI*2,y0:yRaw*2-1,turbX:seeded(s+7)*100,turbZ:seeded(s+8)*100,
      colorT:shell*0.6+seeded(s+6)*0.4,rotSpeed:(1-shell*0.65)*0.22,riseRate:0.06+seeded(s+10)*0.08};
  });
}
function SmokeVortex({spinRef}:{spinRef:React.MutableRefObject<number>}){
  const geoRef=useRef<THREE.BufferGeometry>(null!);
  const smoke=useMemo(()=>buildSmoke(SMOKE_COUNT),[]);
  const pos=useMemo(()=>new Float32Array(SMOKE_COUNT*3),[]);
  const col=useMemo(()=>new Float32Array(SMOKE_COUNT*3),[]);
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()*0.4,sp=spinRef.current;
    const cH=13.0,bY=-6.0,tB=4.2,bB=3.0,cR=0.28,br=1+Math.sin(t*0.35)*0.10;
    for(let i=0;i<SMOKE_COUNT;i++){
      const p=smoke[i],rawY=p.y0+(t*p.riseRate)%2-1,y01=(rawY+1)*0.5;
      const yW=bY+y01*cH,fR=cR+bB*Math.pow(1-y01,1.8)+tB*Math.pow(y01,2.2);
      const sR=fR*(0.08+p.shell*0.92)*br,ang=p.angle0+t*p.rotSpeed*(1+y01*0.4)+sp;
      const nt=t*0.18+p.turbX*0.01,nf=0.12+p.shell*0.22;
      const nx=vnoise(p.turbX*0.1+nt,yW*0.15+p.turbZ*0.1)*nf;
      const nz=vnoise(p.turbZ*0.1+nt*0.9,yW*0.18)*nf;
      pos[i*3]=Math.cos(ang)*sR+nx;pos[i*3+1]=yW;pos[i*3+2]=Math.sin(ang)*sR+nz;
      const top=Math.max(0,y01-0.7)/0.3,bright=0.35+(1-p.shell)*0.5+top*0.4;
      const ef=Math.min(y01*6,1)*Math.min((1-y01)*5,1),c=pal(p.colorT*0.7+top*0.3,bright);
      col[i*3]=c.r*ef;col[i*3+1]=c.g*ef;col[i*3+2]=c.b*ef;
    }
    if(geoRef.current){geoRef.current.attributes.position.needsUpdate=true;geoRef.current.attributes.color.needsUpdate=true;}
  });
  return(<points><bufferGeometry ref={geoRef}><bufferAttribute attach="attributes-position" args={[pos,3]}/><bufferAttribute attach="attributes-color" args={[col,3]}/></bufferGeometry><pointsMaterial size={0.055} vertexColors transparent opacity={0.88} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}/></points>);
}

function SmokeWisps(){
  const WC=800;
  const geoRef=useRef<THREE.BufferGeometry>(null!);
  const pos=useMemo(()=>new Float32Array(WC*3),[]);
  const col=useMemo(()=>new Float32Array(WC*3),[]);
  const data=useMemo(()=>Array.from({length:WC},(_,i)=>{const s=i*23+90000;return{ox:seeded(s)*200,oy:seeded(s+1)*200,oz:seeded(s+2)*200,r:1.5+seeded(s+3)*3.5,y0:(seeded(s+4)-0.5)*10,colorT:seeded(s+5),speed:0.025+seeded(s+6)*0.04};}),[]);
  useFrame(({clock})=>{
    const t=clock.getElapsedTime()*0.4;
    for(let i=0;i<WC;i++){const d=data[i],a=t*d.speed+d.ox*0.06,yd=Math.sin(t*d.speed*0.7+d.oy*0.08)*1.5;
      const nx=vnoise(d.ox*0.05+t*0.07,d.oz*0.04)*0.8,nz=vnoise(d.oz*0.05+t*0.06,d.ox*0.04)*0.8;
      pos[i*3]=Math.cos(a)*d.r+nx;pos[i*3+1]=d.y0+yd;pos[i*3+2]=Math.sin(a)*d.r+nz;
      const c=pal(d.colorT,0.15);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
    if(geoRef.current){geoRef.current.attributes.position.needsUpdate=true;geoRef.current.attributes.color.needsUpdate=true;}
  });
  return(<points><bufferGeometry ref={geoRef}><bufferAttribute attach="attributes-position" args={[pos,3]}/><bufferAttribute attach="attributes-color" args={[col,3]}/></bufferGeometry><pointsMaterial size={0.07} vertexColors transparent opacity={0.6} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending}/></points>);
}

function BaseRipples(){
  const grpRef=useRef<THREE.Group>(null!);
  const rings=useMemo(()=>Array.from({length:5},(_,i)=>({phase:i/5})),[]);
  useFrame(({clock})=>{const t=clock.getElapsedTime()*0.28;grpRef.current?.children.forEach((m,i)=>{const c=((t*0.4+rings[i].phase)%1);m.scale.set(0.3+c*7,0.3+c*7,0.3+c*7);((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity=Math.max(0,(1-c)*0.3);});});
  return(<group ref={grpRef} position={[0,-4.5,0]} rotation={[-Math.PI/2,0,0]}>{rings.map((_,i)=>(<mesh key={i}><ringGeometry args={[0.1,0.16,80]}/><meshBasicMaterial color="#2bbfb3" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending}/></mesh>))}</group>);
}

function ScrollCamera({scrollRef}:{scrollRef:React.MutableRefObject<number>}){
  const{camera}=useThree();const smooth=useRef(0);
  useFrame((_,dt)=>{
    smooth.current+=(scrollRef.current-smooth.current)*(1-Math.pow(0.008,dt));
    const s=smooth.current,ang=s*Math.PI*0.4,R=9;
    camera.position.set(Math.sin(ang)*R,0.5+s*1.0,Math.cos(ang)*R);
    camera.lookAt(0,0.5+s*0.4,0);
  });
  return null;
}

function Scene({scrollRef}:{scrollRef:React.MutableRefObject<number>}){
  const spinRef=useRef(0);
  useFrame((_,dt)=>{spinRef.current+=(scrollRef.current*Math.PI*3-spinRef.current)*(1-Math.pow(0.012,dt));});
  return(<>
    <pointLight position={[0,-4,0]} intensity={6}   color="#2bbfb3"/>
    <pointLight position={[0, 0,0]} intensity={3.5} color="#1fa39a"/>
    <pointLight position={[0, 5,0]} intensity={2.5} color="#5dd6cc"/>
    <pointLight position={[-4,1,2]} intensity={1.8} color="#0d3530"/>
    <pointLight position={[4,1,-2]} intensity={1.5} color="#2bbfb3"/>
    <ScrollCamera scrollRef={scrollRef}/>
    <SmokeVortex spinRef={spinRef}/>
    <SmokeWisps/>
    <BaseRipples/>
  </>);
}

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

        /* ticker infinite scroll */
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

        /* machine spec row */
        .pp-spec-row {
          display: flex; align-items: baseline;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid rgba(43,191,179,0.1);
        }
        .pp-spec-row:first-child { border-top: 1px solid rgba(43,191,179,0.1); }

        /* dot indicator */
        .pp-dot { width:6px; height:6px; background:rgba(255,255,255,0.18); flex-shrink:0; transition:background .2s; }
        .pp-dot--active { background:var(--brand-teal); }

        @media(prefers-reduced-motion:reduce){
          .pp-ticker-track { animation:none; }
        }
      `}</style>

      {/* ── MOBILE flat layout ── */}
      <div className="pp-mobile" style={{
        background:"#070f0e", borderTop:"1px solid rgba(43,191,179,0.12)",
        padding:"3.5rem 1.25rem 3rem", position:"relative", overflow:"hidden",
      }}>
        <div aria-hidden style={{
          position:"absolute",top:"-20%",left:"50%",transform:"translateX(-50%)",
          width:"80vw",height:"60vw",pointerEvents:"none",
          background:"radial-gradient(ellipse at 50% 0%,rgba(43,191,179,0.12) 0%,transparent 70%)",
        }}/>
        <div style={{position:"relative",zIndex:1,marginBottom:"2rem"}}>
          <div style={{fontFamily:"var(--ff-mono)",fontSize:"0.6rem",letterSpacing:"0.2em",
            textTransform:"uppercase",color:"var(--brand-teal)",marginBottom:"0.75rem"}}>
            Engineered · Proven · Supported
          </div>
          <h2 style={{fontFamily:"var(--ff-display)",fontSize:"clamp(2.8rem,9vw,4rem)",
            color:"#fff",lineHeight:0.88,letterSpacing:"-0.02em",margin:"0 0 0.85rem"}}>
            Built for<br/><span style={{color:"var(--brand-teal)"}}>the floor.</span>
          </h2>
          <p style={{fontFamily:"var(--ff-body)",fontSize:"0.9rem",
            color:"rgba(255,255,255,0.45)",lineHeight:1.7,maxWidth:"38ch",margin:0}}>
            Industrial plastic-processing lines engineered in Wenzhou, proven across 80+ countries, supported for life.
          </p>
        </div>
        <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",gap:"1px",
          background:"rgba(43,191,179,0.08)",border:"1px solid rgba(43,191,179,0.12)"}}>
          {MACHINES.slice(0,4).map((m,i)=>(
            <div key={m.slug} style={{
              display:"flex",gap:"1rem",alignItems:"center",
              padding:"1rem 1.1rem",background:"rgba(6,10,9,0.9)",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mImg(m.slug)} alt={m.name}
                style={{width:"72px",height:"56px",objectFit:"contain",
                  filter:"drop-shadow(0 2px 8px rgba(0,0,0,0.8))",flexShrink:0}}/>
              <div>
                <div style={{fontFamily:"var(--ff-mono)",fontSize:"0.5rem",
                  letterSpacing:"0.12em",textTransform:"uppercase",
                  color:"var(--brand-teal)",marginBottom:"0.2rem"}}>{m.cat}</div>
                <div style={{fontFamily:"var(--ff-display)",fontSize:"0.95rem",
                  color:"rgba(255,255,255,0.9)",lineHeight:1.1}}>{m.name.split("—")[0].trim()}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{position:"relative",zIndex:1,display:"flex",gap:0,marginTop:"1px",
          background:"rgba(43,191,179,0.08)",border:"1px solid rgba(43,191,179,0.12)"}}>
          {[{v:"400 kg/h",l:"Max output"},{v:"80+",l:"Countries"},{v:"6",l:"Max colours"}].map((s,i)=>(
            <div key={i} style={{flex:1,padding:"1rem 0.75rem",textAlign:"center",
              borderRight:i<2?"1px solid rgba(43,191,179,0.1)":"none"}}>
              <div style={{fontFamily:"var(--ff-display)",fontSize:"1.6rem",
                color:"var(--brand-teal)",lineHeight:1,letterSpacing:"-0.02em"}}>{s.v}</div>
              <div style={{fontFamily:"var(--ff-mono)",fontSize:"0.48rem",
                letterSpacing:"0.12em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.38)",marginTop:"0.3rem"}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP scroll-driven experience ── */}
      <div className="pp-desktop" style={{position:"sticky",top:0,height:"100vh",overflow:"hidden",background:"#070f0e"}}>

        {/* 3D vortex */}
        <Canvas style={{position:"absolute",inset:0,zIndex:1}}
          camera={{position:[0,0.5,9],fov:55}}
          gl={{antialias:false,alpha:false,powerPreference:"high-performance"}}
          dpr={[1,1.5]} frameloop="always" performance={{min:0.5}}>
          <Scene scrollRef={scrollRef}/>
        </Canvas>

        {/* radial vignette over 3D */}
        <div aria-hidden style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",
          background:"radial-gradient(ellipse 70% 80% at 50% 50%,transparent 30%,rgba(5,12,11,0.88) 100%)"}}/>

        {/* ═══════════════════════════════════════
            PHASE 1 — "BUILT FOR THE FLOOR" HERO
        ═══════════════════════════════════════ */}
        <div ref={heroRef} style={{
          position:"absolute",inset:0,zIndex:10,
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          textAlign:"center",padding:"2rem",
          opacity:0,pointerEvents:"none",
        }}>
          {/* kicker line */}
          <div style={{
            display:"flex",alignItems:"center",gap:"0.9rem",
            fontFamily:"var(--ff-mono)",fontSize:"0.62rem",
            letterSpacing:"0.22em",textTransform:"uppercase",
            color:"var(--brand-teal)",marginBottom:"1.75rem",
          }}>
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
            Wenzhou Ashal Innomach
            <span style={{width:"2.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block",opacity:0.6}}/>
          </div>

          {/* main headline */}
          <h2 style={{
            fontFamily:"var(--ff-display)",
            fontSize:"clamp(5rem,14vw,14rem)",
            lineHeight:0.84,letterSpacing:"-0.03em",
            color:"#fff",margin:0,textTransform:"uppercase",
          }}>
            Built for<br/>
            <span style={{color:"var(--brand-teal)"}}>the floor.</span>
          </h2>

          {/* sub */}
          <p style={{
            fontFamily:"var(--ff-body)",
            fontSize:"clamp(0.9rem,1.2vw,1.05rem)",
            color:"rgba(255,255,255,0.42)",
            lineHeight:1.7,maxWidth:"44ch",margin:"2rem 0 0",
            letterSpacing:"0.01em",
          }}>
            Industrial plastic-processing lines — engineered in Wenzhou, proven in 80+ countries, supported for life.
          </p>

          {/* 3 stat pills */}
          <div style={{
            display:"flex",gap:"1px",marginTop:"2.5rem",
            background:"rgba(43,191,179,0.1)",
            border:"1px solid rgba(43,191,179,0.14)",
          }}>
            {[
              {v:"400 kg/h", l:"Max output"},
              {v:"80+",      l:"Countries"},
              {v:"25 yrs",   l:"Experience"},
            ].map((s,i)=>(
              <div key={i} style={{
                padding:"0.85rem 2rem",
                borderRight:i<2?"1px solid rgba(43,191,179,0.1)":"none",
                textAlign:"center",
              }}>
                <div style={{fontFamily:"var(--ff-display)",fontSize:"clamp(1.4rem,2.5vw,2rem)",
                  color:"#fff",lineHeight:1,letterSpacing:"-0.02em"}}>{s.v}</div>
                <div style={{fontFamily:"var(--ff-mono)",fontSize:"0.55rem",
                  letterSpacing:"0.14em",textTransform:"uppercase",
                  color:"rgba(43,191,179,0.6)",marginTop:"0.3rem"}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            PHASE 2 — TICKER STRIP
        ═══════════════════════════════════════ */}
        <div ref={tickerRef} style={{
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
              <span key={i} style={{
                display:"inline-flex",alignItems:"center",gap:"1.5rem",
                padding:"0 2rem",
                fontFamily:"var(--ff-mono)",fontSize:"0.65rem",
                letterSpacing:"0.16em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.5)",whiteSpace:"nowrap",
              }}>
                <span style={{color:"var(--brand-teal)",fontSize:"0.5rem"}}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            PHASE 3 — MACHINE SHOWCASE
        ═══════════════════════════════════════ */}
        <div ref={showcaseRef} style={{
          position:"absolute",inset:0,zIndex:10,
          display:"grid",gridTemplateColumns:"1fr 1fr",
          opacity:0,
        }}>

          {/* LEFT — machine image */}
          <div style={{
            position:"relative",display:"flex",
            alignItems:"center",justifyContent:"center",
            padding:"clamp(2rem,5vw,4rem)",
            borderRight:"1px solid rgba(43,191,179,0.1)",
          }}>
            {/* category badge */}
            <div style={{
              position:"absolute",top:"2rem",left:"clamp(1.5rem,4vw,3rem)",
              fontFamily:"var(--ff-mono)",fontSize:"0.58rem",
              letterSpacing:"0.18em",textTransform:"uppercase",
              color:"var(--brand-teal)",
              display:"flex",alignItems:"center",gap:"0.6rem",
            }}>
              <span style={{width:"1.5rem",height:"1px",background:"var(--brand-teal)",display:"inline-block"}}/>
              {machine.cat}
            </div>

            {/* progress dots */}
            <div style={{
              position:"absolute",bottom:"2.5rem",left:"clamp(1.5rem,4vw,3rem)",
              display:"flex",gap:"0.4rem",alignItems:"center",
            }}>
              {MACHINES.map((_,i)=>(
                <div key={i} className={`pp-dot${i===activeIdx?" pp-dot--active":""}`}/>
              ))}
            </div>

            {/* machine counter */}
            <div style={{
              position:"absolute",bottom:"2.5rem",right:"clamp(1.5rem,4vw,3rem)",
              fontFamily:"var(--ff-mono)",fontSize:"0.58rem",
              letterSpacing:"0.1em",color:"rgba(255,255,255,0.25)",
            }}>
              {String(activeIdx+1).padStart(2,"0")} / {String(MACHINES.length).padStart(2,"0")}
            </div>

            {/* the machine image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={mImg(machine.slug)}
              alt={machine.name}
              style={{
                maxWidth:"80%",maxHeight:"60vh",
                objectFit:"contain",
                filter:"drop-shadow(0 8px 40px rgba(43,191,179,0.18)) drop-shadow(0 4px 20px rgba(0,0,0,0.9))",
              }}
            />
          </div>

          {/* RIGHT — specs panel */}
          <div ref={specsRef} style={{
            display:"flex",flexDirection:"column",justifyContent:"center",
            padding:"clamp(2rem,5vw,4rem) clamp(2rem,6vw,5rem)",
          }}>

            {/* machine name */}
            <div style={{marginBottom:"2rem"}}>
              <h3 style={{
                fontFamily:"var(--ff-display)",
                fontSize:"clamp(2rem,3.5vw,3.5rem)",
                lineHeight:0.9,letterSpacing:"-0.02em",
                color:"#fff",margin:"0 0 0.75rem",textTransform:"uppercase",
              }}>
                {machine.name}
              </h3>
              <p style={{
                fontFamily:"var(--ff-body)",
                fontSize:"clamp(0.82rem,1vw,0.92rem)",
                color:"rgba(255,255,255,0.42)",
                lineHeight:1.72,margin:0,maxWidth:"36ch",
              }}>
                {machine.tagline}
              </p>
            </div>

            {/* spec table */}
            <div style={{marginBottom:"2.5rem"}}>
              {machine.specs.map(([label,value])=>(
                <div key={label} className="pp-spec-row">
                  <span style={{
                    fontFamily:"var(--ff-mono)",fontSize:"0.6rem",
                    letterSpacing:"0.12em",textTransform:"uppercase",
                    color:"rgba(255,255,255,0.35)",
                  }}>{label}</span>
                  <span style={{
                    fontFamily:"var(--ff-display)",fontSize:"clamp(1.1rem,1.8vw,1.5rem)",
                    color:"#fff",letterSpacing:"-0.01em",
                  }}>{value}</span>
                </div>
              ))}
            </div>

            {/* progress bar */}
            <div style={{marginBottom:"2rem"}}>
              <div style={{
                display:"flex",justifyContent:"space-between",
                fontFamily:"var(--ff-mono)",fontSize:"0.52rem",
                letterSpacing:"0.12em",textTransform:"uppercase",
                color:"rgba(255,255,255,0.25)",marginBottom:"0.5rem",
              }}>
                <span>Catalogue</span>
                <span>{activeIdx+1} of {MACHINES.length}</span>
              </div>
              <div style={{
                height:"2px",background:"rgba(255,255,255,0.08)",
                position:"relative",overflow:"hidden",
              }}>
                <div ref={progressRef} className="pp-progress-bar" style={{transform:`scaleX(${(activeIdx+1)/MACHINES.length})`}}/>
              </div>
            </div>

            {/* CTA */}
            <a href={`/products/${machine.slug.includes("flexo")?"printing":machine.cat.toLowerCase().replace(" ","-")}/${machine.slug}`}
              style={{
                display:"inline-flex",alignItems:"center",gap:"0.75rem",
                padding:"0.85rem 1.75rem",
                background:"transparent",
                border:"1px solid rgba(43,191,179,0.35)",
                color:"var(--brand-teal)",
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
