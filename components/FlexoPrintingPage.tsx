"use client";

import { useState } from "react";
import Link from "next/link";
import AetherBtn from "@/components/AetherBtn";
import { CldImage } from "next-cloudinary";
import { familiesByCategory, type ProductFamily } from "@/lib/products";
import SpecTable from "@/components/SpecTable";

const GALLERY = [
  { src: "cx-machinery/printing/flexo-2", alt: "AI-4C Flexo press — studio render" },
  { src: "cx-machinery/printing/flexo-1", alt: "AI-2C Flexo press — angled view" },
  { src: "cx-machinery/printing/flexo-3", alt: "Flexo press in production — factory floor" },
  { src: "cx-machinery/printing/flexo-4", alt: "AI-6C Flexo press — teal accent panels" },
];

const COLOUR_TIERS = [
  { slug: "flexo-2c", label: "2 Colour", sub: "84–120 m/min", badge: "Entry" },
  { slug: "flexo-4c", label: "4 Colour", sub: "140–200 m/min", badge: "Mid" },
  { slug: "flexo-6c", label: "6 Colour", sub: "182–260 m/min", badge: "Pro" },
  { slug: "flexo-8c", label: "8 Colour", sub: "244–350 m/min", badge: "Flagship" },
];

const WIDTHS = ["500mm", "800mm", "1000mm", "1200mm", "1500mm", "1800mm", "2000mm"];

const KEY_SPECS: Record<string, { speed: string; reg: string; drive: string }> = {
  "flexo-2c": { speed: "84–120 m/min", reg: "±0.2 mm",  drive: "Semi-Servo" },
  "flexo-4c": { speed: "140–200 m/min", reg: "±0.15 mm", drive: "Full Servo Gearless" },
  "flexo-6c": { speed: "182–260 m/min", reg: "±0.1 mm",  drive: "Full Servo Gearless" },
  "flexo-8c": { speed: "244–350 m/min", reg: "±0.1 mm",  drive: "Full Servo Gearless" },
};

export default function FlexoPrintingPage() {
  const families = familiesByCategory("printing");
  const [activeImg,    setActiveImg]    = useState(0);
  const [activeTier,   setActiveTier]   = useState("flexo-4c");
  const [activeWidth,  setActiveWidth]  = useState(1); // index into WIDTHS

  const family   = families.find(f => f.slug === activeTier) ?? families[1];
  const widthIdx = activeWidth;

  // Narrow family to just the selected width column
  const singleModel: ProductFamily = {
    ...family,
    models: [family.models[widthIdx]],
    specs:  family.specs.map(row => ({
      ...row,
      values: [row.values[widthIdx]],
    })),
  };

  const ks = KEY_SPECS[activeTier];

  return (
    <>
      <style suppressHydrationWarning>{`
        .fp-tier-btn {
          display:flex; flex-direction:column; align-items:flex-start;
          gap:0.2rem; padding:1rem 1.4rem;
          border:1px solid var(--line); background:var(--surface);
          cursor:pointer; transition:border-color .18s, background .18s;
          text-align:left;
        }
        .fp-tier-btn:hover { border-color:var(--slate-60); }
        .fp-tier-btn--active {
          border-color:var(--brand-red) !important;
          background:rgba(225,29,72,0.04) !important;
        }
        .fp-tier-label { font-family:var(--ff-display); font-size:1.35rem; letter-spacing:.02em; color:var(--slate); line-height:1; }
        .fp-tier-sub   { font-family:var(--ff-mono); font-size:0.68rem; letter-spacing:.12em; text-transform:uppercase; color:var(--slate-60); }
        .fp-tier-badge {
          font-family:var(--ff-mono); font-size:0.64rem; letter-spacing:.18em;
          text-transform:uppercase; padding:.15rem .4rem;
          background:var(--brand-red); color:#fff; border-radius:2px;
        }

        .fp-width-btn {
          padding:.45rem .9rem;
          border:1px solid var(--line); background:var(--surface);
          font-family:var(--ff-mono); font-size:.7rem; letter-spacing:.1em;
          color:var(--slate-60); cursor:pointer;
          transition:border-color .15s, color .15s;
        }
        .fp-width-btn:hover { border-color:var(--slate); color:var(--slate); }
        .fp-width-btn--active {
          border-color:var(--slate) !important;
          background:var(--slate) !important;
          color:#fff !important;
        }

        .fp-gallery-thumb {
          width:72px; height:52px; object-fit:cover;
          border:2px solid transparent; cursor:pointer;
          transition:border-color .15s, opacity .15s;
          opacity:.55;
        }
        .fp-gallery-thumb:hover { opacity:.85; }
        .fp-gallery-thumb--active { border-color:var(--brand-red) !important; opacity:1 !important; }

        .fp-kv { display:flex; flex-direction:column; gap:.25rem; }
        .fp-kv__label { font-family:var(--ff-mono); font-size:0.68rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,255,255,0.65); }
        .fp-kv__value { font-family:var(--ff-display); font-size:1.45rem; color:var(--slate); line-height:1; }

        /* ── Light mode: keep dark sections dark with white text ── */
        [data-theme="light"] .fp-dark { background: #0d1614 !important; }
        [data-theme="light"] .fp-dark [style*="color: rgba(255"] { color: rgba(255,255,255,0.7) !important; }
        [data-theme="light"] .fp-dark [style*="color: rgba(255,255,255,0.65"],
        [data-theme="light"] .fp-dark [style*="color: rgba(255,255,255,.65"] { color: rgba(255,255,255,0.65) !important; }
        [data-theme="light"] .fp-dark [style*="color: rgba(255,255,255,0.75"],
        [data-theme="light"] .fp-dark [style*="color: rgba(255,255,255,.75"] { color: rgba(255,255,255,0.75) !important; }
        [data-theme="light"] .fp-dark [style*="color: rgba(255,255,255,0.78"],
        [data-theme="light"] .fp-dark [style*="color: rgba(255,255,255,.78"] { color: rgba(255,255,255,0.78) !important; }
        [data-theme="light"] .fp-dark [style*="color: #fff"],
        [data-theme="light"] .fp-dark [style*="color:#fff"],
        [data-theme="light"] .fp-dark [style*="color: white"],
        [data-theme="light"] .fp-dark [style*="color:white"] { color: #fff !important; }
      `}</style>

      {/* ── HERO GALLERY ── */}
      <section className="fp-dark" style={{
        background: "#0d1614",
        padding: "5rem 0 0",
        overflow: "hidden",
      }}>
        <div className="wrap" style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>

          {/* breadcrumb */}
          <p style={{ fontFamily:"var(--ff-mono)", fontSize:".72rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,0.65)" }}>
            <Link href="/" style={{ color:"rgba(255,255,255,0.65)" }}>Home</Link> /&nbsp;
            <Link href="/products" style={{ color:"rgba(255,255,255,0.65)" }}>Catalogue</Link> /&nbsp;
            <span style={{ color:"rgba(255,255,255,0.78)" }}>Flexographic Printing</span>
          </p>

          <div style={{ display:"grid", gridTemplateColumns:"1fr clamp(260px,34vw,480px)", gap:"3rem", alignItems:"end" }}>

            {/* main image */}
            <div style={{ position:"relative", aspectRatio:"16/9", background:"#0d1614", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CldImage
                src={GALLERY[activeImg].src}
                alt={GALLERY[activeImg].alt}
                width={1280} height={720}
                style={{ width:"100%", height:"100%", objectFit:"contain", padding:"1.5rem" }}
                sizes="60vw"
              />
              {/* thumbnail strip */}
              <div style={{ position:"absolute", bottom:"1rem", left:"1rem", display:"flex", gap:".5rem" }}>
                {GALLERY.map((g,i) => (
                  <CldImage key={i} src={g.src} alt="" onClick={() => setActiveImg(i)}
                    width={144} height={104} sizes="72px"
                    className={`fp-gallery-thumb${activeImg===i?" fp-gallery-thumb--active":""}`} />
                ))}
              </div>
            </div>

            {/* hero text */}
            <div style={{ paddingBottom:"2.5rem", display:"flex", flexDirection:"column", gap:"1.2rem" }}>
              <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--brand-red)" }}>
                Flexographic Printing
              </span>
              <h1 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2.4rem,4.5vw,3.8rem)", color:"#fff", lineHeight:.9, letterSpacing:".01em" }}>
                AI Series<br />Flexo Press
              </h1>
              <p style={{ fontFamily:"var(--ff-body)", fontSize:".95rem", lineHeight:1.7, color:"rgba(255,255,255,0.75)", maxWidth:"38ch" }}>
                2 to 8 printing colours. Web widths 500–2000 mm. Full servo gearless drive with ±0.1 mm registration on PE, PP, PET, BOPP, paper and non-woven substrates.
              </p>

              {/* key stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", paddingTop:".5rem", borderTop:"1px solid rgba(255,255,255,.08)" }}>
                <div className="fp-kv">
                  <span className="fp-kv__label">Max speed</span>
                  <span className="fp-kv__value" style={{ color:"#fff" }}>350 m/min</span>
                </div>
                <div className="fp-kv">
                  <span className="fp-kv__label">Colours</span>
                  <span className="fp-kv__value" style={{ color:"#fff" }}>2 – 8</span>
                </div>
                <div className="fp-kv">
                  <span className="fp-kv__label">Web width</span>
                  <span className="fp-kv__value" style={{ color:"#fff" }}>500–2000mm</span>
                </div>
              </div>

              <AetherBtn style={{ alignSelf:"flex-start", marginTop:".5rem" }}><Link href="/inquiries">Request a quote →</Link></AetherBtn>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLOUR TIER + WIDTH SELECTOR ── */}
      <section style={{ background:"var(--canvas-bg)", borderTop:"1px solid var(--line)", padding:"4rem 0 5rem" }}>
        <div className="wrap" style={{ display:"flex", flexDirection:"column", gap:"3rem" }}>

          {/* heading */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--slate-60)", display:"block", marginBottom:".4rem" }}>
                Select configuration
              </span>
              <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.8rem,3vw,2.6rem)", color:"var(--slate)", lineHeight:.95 }}>
                Choose your colour count &amp; web width
              </h2>
            </div>
          </div>

          {/* colour tier cards */}
          <div>
            <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--slate-30)", marginBottom:".8rem" }}>
              Printing colours
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:".75rem" }}>
              {COLOUR_TIERS.map(ct => (
                <button key={ct.slug} onClick={() => setActiveTier(ct.slug)}
                  className={`fp-tier-btn${activeTier===ct.slug?" fp-tier-btn--active":""}`}>
                  <span className="fp-tier-badge">{ct.badge}</span>
                  <span className="fp-tier-label" style={{ marginTop:".5rem" }}>{ct.label}</span>
                  <span className="fp-tier-sub">{ct.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* width selector */}
          <div>
            <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--slate-30)", marginBottom:".8rem" }}>
              Max web width
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:".5rem" }}>
              {WIDTHS.map((w,i) => (
                <button key={w} onClick={() => setActiveWidth(i)}
                  className={`fp-width-btn${activeWidth===i?" fp-width-btn--active":""}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* selected model key specs */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)",
            gap:"1px", background:"var(--line)",
            border:"1px solid var(--line)",
          }}>
            {[
              { label:"Model",            value: singleModel.models[0] },
              { label:"Max Speed",        value: ks.speed },
              { label:"Registration",     value: ks.reg },
              { label:"Drive System",     value: ks.drive },
            ].map(kv => (
              <div key={kv.label} style={{ background:"var(--surface)", padding:"1.4rem 1.6rem" }}>
                <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--slate-60)", marginBottom:".4rem" }}>{kv.label}</div>
                <div style={{ fontFamily:"var(--ff-display)", fontSize:"1.2rem", color:"var(--slate)", lineHeight:1 }}>{kv.value}</div>
              </div>
            ))}
          </div>

          {/* full spec table for selected model */}
          <div>
            <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--slate-30)", marginBottom:"1rem" }}>
              Full specification — {singleModel.models[0]}
            </div>
            <SpecTable family={singleModel} />
          </div>

        </div>
      </section>

      {/* ── ALL SERIES OVERVIEW ── */}
      <section style={{ background:"var(--surface)", borderTop:"1px solid var(--line)", padding:"5rem 0" }}>
        <div className="wrap">
          <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--slate-60)", display:"block", marginBottom:".6rem" }}>
            Complete range
          </span>
          <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.8rem,3vw,2.6rem)", color:"var(--slate)", lineHeight:.95, marginBottom:"3rem" }}>
            All AI Series configurations
          </h2>

          <div style={{ display:"flex", flexDirection:"column", gap:"3rem" }}>
            {families.map((f, fi) => (
              <article key={f.slug} style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:"3rem", paddingBottom:"3rem", borderBottom:"1px solid var(--line)" }}>

                {/* left — machine image + tier info */}
                <div style={{ display:"flex", flexDirection:"column", gap:"1.2rem" }}>
                  <CldImage
                    src={GALLERY[fi % GALLERY.length].src}
                    alt={f.name}
                    width={560} height={420}
                    sizes="280px"
                    style={{ width:"100%", aspectRatio:"4/3", objectFit:"contain", background:"#f1f5f9", padding:"1rem" }}
                  />
                  <div>
                    <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.66rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--brand-red)", display:"block", marginBottom:".3rem" }}>{f.series}</span>
                    <h3 style={{ fontFamily:"var(--ff-display)", fontSize:"1.4rem", color:"var(--slate)", lineHeight:1, marginBottom:".5rem" }}>{f.name}</h3>
                    <p style={{ fontFamily:"var(--ff-body)", fontSize:".88rem", color:"var(--slate-60)", lineHeight:1.6 }}>{f.tagline}</p>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem" }}>
                    {f.models.map(m => (
                      <span key={m} style={{
                        fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".1em",
                        padding:".25rem .55rem", border:"1px solid var(--line)",
                        color:"var(--slate-60)", background:"var(--canvas-bg)",
                      }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* right — full spec table */}
                <SpecTable family={f} />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBSTRATE SECTION ── */}
      <section className="fp-dark" style={{ background:"#0d1614", padding:"4rem 0" }}>
        <div className="wrap">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }}>
            <div>
              <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--brand-red)", display:"block", marginBottom:".6rem" }}>
                Substrate compatibility
              </span>
              <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.8rem,3vw,2.6rem)", color:"#fff", lineHeight:.95, marginBottom:"1.5rem" }}>
                Prints on virtually<br />any flexible substrate
              </h2>
              <p style={{ fontFamily:"var(--ff-body)", fontSize:".95rem", lineHeight:1.7, color:"rgba(255,255,255,0.75)", marginBottom:"2rem", maxWidth:"42ch" }}>
                Ceramic anilox rollers at 200–600 LPI deliver consistent ink transfer across thin film, paper and woven materials. Independent IR drying per colour station prevents back-bleed.
              </p>
              <AetherBtn><Link href="/inquiries">Talk to a print specialist →</Link></AetherBtn>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"rgba(255,255,255,.08)" }}>
              {["PE Film","PP Film","PET Film","NY (Nylon)","BOPP Film","CPP Film","Kraft Paper","Non-woven Fabric","Corrugated Paper","Metalised Film"].map(sub => (
                <div key={sub} style={{
                  background:"#0d1614", padding:"1.1rem 1.3rem",
                  fontFamily:"var(--ff-mono)", fontSize:".72rem",
                  letterSpacing:".1em", textTransform:"uppercase",
                  color:"rgba(255,255,255,0.75)",
                  display:"flex", alignItems:"center", gap:".6rem",
                }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--brand-red)", flexShrink:0 }} />
                  {sub}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        background:"var(--surface)", borderTop:"1px solid var(--line)",
        padding:"clamp(2.5rem,5vw,4rem) clamp(1.25rem,4vw,3rem)",
        display:"flex", justifyContent:"space-between", alignItems:"center", gap:"2rem", flexWrap:"wrap",
      }}>
        <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.75rem,4vw,2.8rem)", color:"var(--slate)", lineHeight:.98 }}>
          Need help choosing a model?
        </h2>
        <AetherBtn><Link href="/inquiries">Talk to an engineer →</Link></AetherBtn>
      </section>
    </>
  );
}
