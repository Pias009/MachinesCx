"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";

const SPECS = [
  { label:"Substrates",  value:"PE · PP · PET · BOPP · Paper · Non-woven" },
  { label:"Plate types", value:"1.14 / 1.7 / 2.84 mm" },
  { label:"Anilox",      value:"Ceramic, 200–600 LPI" },
  { label:"Power",       value:"380V 3PH 50/60Hz" },
];

const localFamilies: ProductFamily[] = [
  { slug:"flexo-2c", category:"printing", series:"AI-2C · 2-colour", name:"AI-2C", tagline:"Entry CI Press", models:["AI-2C-500"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-1.png"], specs:[
    { label:"Printing Colours",      values:["2"] },
    { label:"Max Mechanical Speed",  values:["120m/min"] },
    { label:"Registration Accuracy", values:["±0.2mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-4c", category:"printing", series:"AI-4C · 4-colour", name:"AI-4C", tagline:"Mid-range · Hot Model", models:["AI-4C-800"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-2.png"], specs:[
    { label:"Printing Colours",      values:["4"] },
    { label:"Max Mechanical Speed",  values:["200m/min"] },
    { label:"Registration Accuracy", values:["±0.15mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-6c", category:"printing", series:"AI-6C · 6-colour", name:"AI-6C", tagline:"High-speed CI Press", models:["AI-6C-1200"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-6c-nobg.png"], specs:[
    { label:"Printing Colours",      values:["6"] },
    { label:"Max Mechanical Speed",  values:["260m/min"] },
    { label:"Registration Accuracy", values:["±0.1mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-8c", category:"printing", series:"AI-8C · 8-colour", name:"AI-8C", tagline:"Flagship · Max Output", models:["AI-8C-1600"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-4.png"], specs:[
    { label:"Printing Colours",      values:["8"] },
    { label:"Max Mechanical Speed",  values:["350m/min"] },
    { label:"Registration Accuracy", values:["±0.1mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
];

interface FlexoModel {
  slug: string;
  label: string;
  colours: number;
  speed: string;
  reg: string;
  img: string;
  tag: string;
  hot?: boolean;
  flagship?: boolean;
}

function findSpec(family: ProductFamily, label: string): string {
  return family.specs?.find(s => s.label === label)?.values?.[0] ?? "";
}

function buildModels(list: ProductFamily[]): FlexoModel[] {
  return list.map(f => ({
    slug: f.slug,
    label: f.series.split("·")[0].trim(),
    colours: parseInt(findSpec(f, "Printing Colours")) || 2,
    speed:   (findSpec(f, "Max Mechanical Speed").match(/\d+/) || ["120"])[0],
    reg:     findSpec(f, "Registration Accuracy") || "±0.2mm",
    img:     f.images?.[0] ?? "/machines/flexo-1.png",
    tag:     f.tagline ?? "",
    hot:      f.slug === "flexo-4c",
    flagship: f.slug === "flexo-8c",
  }));
}

const DEFAULT_MODELS: FlexoModel[] = buildModels(localFamilies);

export default function FlexoStrip() {
  const cms = useCms<{ items?: FlexoModel[] }>("flexo-strip", { items: DEFAULT_MODELS });
  const MODELS = cms.items && cms.items.length ? cms.items : DEFAULT_MODELS;

  const sectionRef  = useRef<HTMLElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const stripRef    = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLSpanElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);

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

        /* ── Cards fade/lift in, staggered ── */
        const cards = gridRef.current
          ? Array.from(gridRef.current.querySelectorAll<HTMLElement>(".fls-card"))
          : [];
        gsap.fromTo(cards,
          { y: 32, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: easeExp, stagger: 0.08, delay: 0.2,
            scrollTrigger: { trigger: gridRef.current, start: "top 85%", toggleActions: "play none none none" } }
        );

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

  return (
    <section ref={sectionRef} style={{
      background: "var(--bg-base)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "clamp(5rem,9vw,9rem) 0 clamp(4rem,7vw,7rem)",
      overflow: "hidden",
      position: "relative",
    }}>

      <style suppressHydrationWarning>{`
        /* Title overflow clip for SplitText */
        .fls-title-clip { overflow: hidden; }

        /* ── Plain 4-up card grid — every model visible at once, no
           active-state switching, no full-bleed, no overlay text on
           images. Simple, boxed, hard to get visually wrong. ── */
        .fls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .fls-card {
          position: relative;
          display: block;
          background: #0d1018;
          border: 1px solid rgba(255,255,255,0.08);
          text-decoration: none;
          transition: border-color .25s, transform .25s;
        }
        .fls-card:hover {
          border-color: rgba(225,29,72,0.4);
          transform: translateY(-4px);
        }
        .fls-card__media {
          position: relative;
          width: 100%;
          aspect-ratio: 4 / 3;
          background: #0d1614;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .fls-card__media img {
          width: 82%; height: 82%; object-fit: contain;
          filter: drop-shadow(0 10px 24px rgba(0,0,0,0.5));
          transition: transform .4s cubic-bezier(0.16,1,0.3,1);
        }
        .fls-card:hover .fls-card__media img { transform: scale(1.05); }

        .fls-badge { position:absolute; top:.75rem; left:.75rem; z-index:2; font-family:var(--ff-mono); font-size:0.6rem; letter-spacing:.16em; text-transform:uppercase; padding:.25rem .55rem; }
        .fls-badge--hot      { background:var(--brand-red); color:#fff; }
        .fls-badge--flagship { background:#fff; color:var(--bg-base); }

        .fls-card__body { padding: 1.1rem 1.25rem 1.3rem; display: flex; flex-direction: column; gap: .4rem; }
        .fls-card__series { font-family: var(--ff-mono); font-size: 0.62rem; letter-spacing: .18em; text-transform: uppercase; color: var(--brand-red); }
        .fls-card__name   { font-family: var(--ff-display); font-size: 1.6rem; color: #fff; line-height: 1; }
        .fls-card__tag    { font-size: 0.82rem; color: rgba(255,255,255,0.6); line-height: 1.4; }

        .fls-card__specs { margin-top: .5rem; display: flex; flex-direction: column; gap: .1rem; }
        .fls-card__spec-row { display: flex; justify-content: space-between; font-family: var(--ff-mono); font-size: 0.68rem; padding: .3rem 0; border-top: 1px solid rgba(255,255,255,0.06); }
        .fls-card__spec-row span:first-child { color: rgba(255,255,255,0.5); letter-spacing: .06em; text-transform: uppercase; }
        .fls-card__spec-row span:last-child  { color: rgba(255,255,255,0.85); font-weight: 600; }

        .fls-card__cta {
          margin-top: .75rem;
          display: inline-flex; align-items: center; gap: .4rem;
          background: none; border: none; padding: 0;
          font-family: var(--ff-mono); font-size: 0.76rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--brand-red);
        }

        /* ── Light mode: keep cards dark with white text ── */
        [data-theme="light"] .fls-card { background: #0d1018 !important; border-color: rgba(255,255,255,0.08) !important; }
        [data-theme="light"] .fls-card:hover { border-color: rgba(225,29,72,0.4) !important; }
        [data-theme="light"] .fls-card__media { background: #0d1614 !important; }
        [data-theme="light"] .fls-card [style*="color: #fff"],
        [data-theme="light"] .fls-card [style*="color:#fff"],
        [data-theme="light"] .fls-card [style*="color: white"],
        [data-theme="light"] .fls-card [style*="color:white"] { color: #fff !important; }
        [data-theme="light"] .fls-card [style*="color: rgba(255"] { color: rgba(255,255,255,0.7) !important; }
        [data-theme="light"] .fls-card [style*="color: rgba(255,255,255,0.85"],
        [data-theme="light"] .fls-card [style*="color: rgba(255,255,255,.85"] { color: rgba(255,255,255,0.85) !important; }
        [data-theme="light"] .fls-card [style*="color: rgba(255,255,255,0.6"],
        [data-theme="light"] .fls-card [style*="color: rgba(255,255,255,.6"] { color: rgba(255,255,255,0.6) !important; }
        [data-theme="light"] .fls-card [style*="color: rgba(255,255,255,0.5"],
        [data-theme="light"] .fls-card [style*="color: rgba(255,255,255,.5"] { color: rgba(255,255,255,0.5) !important; }

        @media (max-width: 640px) {
          .fls-title-clip h2 { font-size: clamp(2rem, 9vw, 3.2rem) !important; }
        }
      `}</style>

      <div className="wrap" style={{ position:"relative", zIndex:1 }}>
        {/* ── Header ── */}
        <div style={{ marginBottom:"clamp(2.5rem,5vw,4rem)" }}>
          <span ref={eyebrowRef} style={{
            display:"inline-flex", alignItems:"center", gap:".75rem",
            fontFamily:"var(--ff-mono)", fontSize:"0.7rem",
            letterSpacing:".22em", textTransform:"uppercase",
            color:"var(--brand-red)", marginBottom:".75rem",
            opacity:0,
          }}>
            <span style={{ width:"2rem", height:"1px", background:"var(--brand-red)", display:"inline-block", flexShrink:0 }} />
            New — Flexographic Printing
          </span>

          <div className="fls-title-clip">
            <h2 ref={titleRef} data-no-anim style={{
              fontFamily:"var(--ff-display)",
              fontSize:"clamp(3rem,6vw,6rem)",
              color:"var(--ink)", lineHeight:.88,
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
            color:"var(--ink-60)", display:"block",
          }}>
            2 to 8 colours, 500–2000 mm.
          </span>
        </div>

        {/* ── 4-up card grid — every model visible, click through to its spec page ── */}
        <div ref={gridRef} className="fls-grid">
          {MODELS.map(model => (
            <TransitionLink key={model.slug} href={`/products/printing#${model.slug}`} className="fls-card">
              <div className="fls-card__media">
                {model.hot      && <span className="fls-badge fls-badge--hot">Hot</span>}
                {model.flagship && <span className="fls-badge fls-badge--flagship">Flagship</span>}
                <img src={model.img} alt={model.label} />
              </div>
              <div className="fls-card__body">
                <span className="fls-card__series">AI · {model.colours}-colour</span>
                <span className="fls-card__name">{model.label}</span>
                <span className="fls-card__tag">{model.tag}</span>

                <div className="fls-card__specs">
                  <div className="fls-card__spec-row"><span>Speed</span><span>{model.speed} m/min</span></div>
                  <div className="fls-card__spec-row"><span>Registration</span><span>{model.reg}</span></div>
                </div>

                <span className="fls-card__cta">View full spec →</span>
              </div>
            </TransitionLink>
          ))}
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
                <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.64rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(255,255,255,0.55)" }}>{kv.label}</span>
                <span style={{ fontFamily:"var(--ff-mono)", fontSize:".65rem", letterSpacing:".06em", color:"rgba(255,255,255,0.75)" }}>{kv.value}</span>
              </div>
            ))}
          </div>
          <AetherBtn><Link href="/inquiries">Request spec sheet →</Link></AetherBtn>
        </div>
      </div>
    </section>
  );
}
