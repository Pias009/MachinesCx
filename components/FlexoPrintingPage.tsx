"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import { CldImage } from "next-cloudinary";
import { familiesByCategory, type ProductFamily } from "@/lib/products";
import SpecTable from "@/components/SpecTable";
import { useScrollReveal } from "@/lib/useScrollReveal";

/* ── gallery photo src list; alt text is translated and pulled from
   flexoPrintingPage.gallery.* at render time, keyed by array index ── */
const GALLERY = [
  { src: "cx-machinery/printing/flexo-2" },
  { src: "cx-machinery/printing/flexo-1" },
  { src: "cx-machinery/printing/flexo-3" },
  { src: "cx-machinery/printing/flexo-4" },
];

/* ── colour-tier selector — slug/sub(speed)/order only; label + badge text
   come from flexoPrintingPage.colourTiers.* at render time ── */
const COLOUR_TIERS = [
  { slug: "flexo-2c", sub: "84–120 m/min" },
  { slug: "flexo-4c", sub: "140–200 m/min" },
  { slug: "flexo-6c", sub: "182–260 m/min" },
  { slug: "flexo-8c", sub: "244–350 m/min" },
];

const WIDTHS = ["500mm", "800mm", "1000mm", "1200mm", "1500mm", "1800mm", "2000mm"];

/* ── key spec values per tier — speed/registration are raw measurements
   (unit values, not translated per house style); "drive" is a display
   label translated via flexoPrintingPage.driveSystem.* at render time ── */
const KEY_SPECS: Record<string, { speed: string; reg: string; drive: "semiServo" | "fullServoGearless" }> = {
  "flexo-2c": { speed: "84–120 m/min", reg: "±0.2 mm",  drive: "semiServo" },
  "flexo-4c": { speed: "140–200 m/min", reg: "±0.15 mm", drive: "fullServoGearless" },
  "flexo-6c": { speed: "182–260 m/min", reg: "±0.1 mm",  drive: "fullServoGearless" },
  "flexo-8c": { speed: "244–350 m/min", reg: "±0.1 mm",  drive: "fullServoGearless" },
};

export default function FlexoPrintingPage() {
  const t = useTranslations("flexoPrintingPage");
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
  const galleryCopy = t.raw("gallery") as { alt: string }[];
  const colourTierCopy = t.raw("colourTiers") as Record<string, { label: string; badge: string }>;
  const driveSystemCopy = t.raw("driveSystem") as Record<string, string>;

  // entrance animation — each section/card reveals as it scrolls into
  // view instead of appearing all at once; see lib/useScrollReveal.ts
  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div ref={rootRef}>
      <style suppressHydrationWarning>{`
        .fp-tier-btn {
          display:flex; flex-direction:column; align-items:flex-start;
          gap:0.2rem; padding:1rem 1.4rem;
          border:1px solid var(--bg-line); background:var(--bg-surface);
          cursor:pointer; text-align:left;
          transition:border-color .2s cubic-bezier(.16,1,.3,1), background .2s cubic-bezier(.16,1,.3,1), transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s cubic-bezier(.16,1,.3,1);
        }
        .fp-tier-btn:hover {
          border-color:var(--brand-teal);
          transform:translateY(-3px);
          box-shadow:0 12px 24px -14px rgba(43,191,179,0.35);
        }
        .fp-tier-btn:active { transform:translateY(-1px) scale(0.99); }
        .fp-tier-btn--active {
          border-color:var(--brand-red) !important;
          background:var(--brand-teal-glow) !important;
          box-shadow:0 12px 24px -14px rgba(43,191,179,0.4);
        }
        .fp-tier-label { font-family:var(--ff-display); font-size:1.35rem; letter-spacing:.02em; color:var(--ink); line-height:1; }
        .fp-tier-sub   { font-family:var(--ff-mono); font-size:0.68rem; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-60); }
        .fp-tier-badge {
          font-family:var(--ff-mono); font-size:0.64rem; letter-spacing:.18em;
          text-transform:uppercase; padding:.15rem .4rem;
          background:var(--brand-red); color:#fff; border-radius:2px;
          transition:transform .2s cubic-bezier(.34,1.56,.64,1);
        }
        .fp-tier-btn:hover .fp-tier-badge { transform:scale(1.06); }

        .fp-width-btn {
          padding:.45rem .9rem;
          border:1px solid var(--bg-line); background:var(--bg-surface);
          font-family:var(--ff-mono); font-size:.7rem; letter-spacing:.1em;
          color:var(--ink-60); cursor:pointer;
          transition:border-color .15s ease, color .15s ease, background .15s ease, transform .15s cubic-bezier(.16,1,.3,1);
        }
        .fp-width-btn:hover { border-color:var(--brand-teal); color:var(--ink); transform:translateY(-2px); }
        .fp-width-btn:active { transform:translateY(0) scale(0.96); }
        .fp-width-btn--active {
          border-color:var(--brand-teal) !important;
          background:var(--brand-teal) !important;
          color:#06110f !important;
        }

        .fp-gallery-thumb {
          width:72px; height:52px; object-fit:cover;
          border:2px solid transparent; cursor:pointer;
          transition:border-color .2s ease, opacity .2s ease, transform .2s cubic-bezier(.16,1,.3,1);
          opacity:.55;
        }
        .fp-gallery-thumb:hover { opacity:.85; transform:translateY(-2px); }

        /* main hero photo crossfades in on gallery swap instead of popping
           — key={activeImg} on the <CldImage> forces a fresh mount per
           photo so this animation replays every time. */
        @keyframes fp-photo-in { from { opacity:0; transform:scale(1.02); } to { opacity:1; transform:scale(1); } }
        .fp-hero-photo { animation:fp-photo-in .45s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .fp-hero-photo { animation:none; }
        }
        .fp-gallery-thumb--active { border-color:var(--brand-red) !important; opacity:1 !important; }

        .fp-kv { display:flex; flex-direction:column; gap:.25rem; }
        .fp-kv__label { font-family:var(--ff-mono); font-size:0.68rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(255,255,255,0.65); }
        .fp-kv__value { font-family:var(--ff-display); font-size:1.45rem; color:var(--ink); line-height:1; }

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

        @media (max-width: 860px) {
          .fp-hero-grid { grid-template-columns: 1fr !important; }
          .fp-hero-img { aspect-ratio: 4/3 !important; }
          .fp-tier-grid { grid-template-columns: repeat(2,1fr) !important; }
          .fp-kv-grid { grid-template-columns: repeat(2,1fr) !important; }
          .fp-series-row { grid-template-columns: 1fr !important; }
          .fp-substrate-grid { grid-template-columns: 1fr !important; }
        }

        /* ── Large phone ── */
        @media (max-width: 640px) {
          /* Hero section: tighter top padding so it doesn't feel buried */
          .fp-hero-section { padding-top: 4rem !important; }

          /* Hero image: make room by reducing aspect ratio & thumb strip */
          .fp-hero-img { aspect-ratio: 3/2 !important; }
          .fp-hero-thumbs { gap: .35rem !important; }
          .fp-gallery-thumb { width: 56px !important; height: 42px !important; }

          /* Hero text content: reduce internal spacing */
          .fp-hero-text { padding-bottom: 1.25rem !important; gap: .9rem !important; }
          .fp-hero-text h1 { font-size: clamp(2rem, 9vw, 3rem) !important; }

          /* Key stats under hero title: keep 3-col but compress */
          .fp-hero-kv-row { gap: .6rem !important; padding-top: .4rem !important; }
          .fp-kv__value { font-size: 1.15rem !important; }

          /* Tier selector section: tighter */
          .fp-tier-section { padding: 2.5rem 0 3.5rem !important; }
          .fp-tier-btn { padding: .75rem 1rem !important; }
          .fp-tier-label { font-size: 1.1rem !important; }

          /* Key-specs grid: 2×2 instead of 4×1 (already applied above at 860px) */

          /* CTA section: stack vertically */
          .fp-cta-section { flex-direction: column !important; align-items: flex-start !important; }

          /* All-series section: reduce padding */
          .fp-series-section { padding: 3rem 0 !important; }
          .fp-series-section h2 { margin-bottom: 2rem !important; }

          /* Substrate section: reduce gap after stacking */
          .fp-substrate-section { padding: 3rem 0 !important; }
        }

        /* ── Small phone ── */
        @media (max-width: 480px) {
          /* Tier grid: keep 2-col but tighter padding */
          .fp-tier-grid { gap: .5rem !important; }
          .fp-tier-btn { padding: .65rem .85rem !important; gap: .15rem !important; }
          .fp-tier-label { font-size: 1rem !important; }
          .fp-tier-sub { font-size: .62rem !important; }
          .fp-tier-badge { font-size: .6rem !important; }

          /* Key-specs grid: 2 columns, tighter cells */
          .fp-kv-grid { grid-template-columns: repeat(2,1fr) !important; }
          .fp-kv-grid > div { padding: 1rem 1.1rem !important; }
          .fp-kv-grid > div > div:last-child { font-size: 1rem !important; }

          /* Width selector pills: allow wrap, smaller text */
          .fp-width-btn { padding: .35rem .65rem !important; font-size: .65rem !important; }

          /* Hero thumbnail strip: hide on tiny screens (swipe not needed at this size) */
          .fp-hero-thumbs { display: none !important; }

          /* Substrate grid: single column already, but reduce padding */
          .fp-substrate-grid > div:first-child { order: 2; }
          .fp-substrate-grid > div:last-child { order: 1; }
          .fp-substrate-grid > div > div { padding: .85rem 1rem !important; }
        }
      `}</style>

      {/* ── HERO GALLERY ── */}
      <section className="fp-dark fp-hero-section" style={{
        background: "#0d1614",
        padding: "5rem 0 0",
        overflow: "hidden",
      }}>
        <div className="wrap" style={{ display:"flex", flexDirection:"column", gap:"2rem" }}>

          {/* breadcrumb */}
          <p style={{ fontFamily:"var(--ff-mono)", fontSize:".72rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,0.65)" }}>
            <Link href="/" style={{ color:"rgba(255,255,255,0.65)" }}>{t("breadcrumbHome")}</Link> /&nbsp;
            <Link href="/products" style={{ color:"rgba(255,255,255,0.65)" }}>{t("breadcrumbCatalogue")}</Link> /&nbsp;
            <span style={{ color:"rgba(255,255,255,0.78)" }}>{t("breadcrumbCurrent")}</span>
          </p>

          <div className="fp-hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr clamp(260px,34vw,480px)", gap:"3rem", alignItems:"end" }}>

            {/* main image */}
            <div className="fp-hero-img" data-reveal="scale" style={{ position:"relative", aspectRatio:"16/9", background:"#0d1614", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <CldImage
                key={activeImg}
                src={GALLERY[activeImg].src}
                alt={galleryCopy[activeImg]?.alt ?? ""}
                width={1280} height={720}
                className="fp-hero-photo"
                style={{ width:"100%", height:"100%", objectFit:"contain", padding:"1.5rem" }}
                sizes="60vw"
              />
              {/* thumbnail strip */}
              <div className="fp-hero-thumbs" style={{ position:"absolute", bottom:"1rem", left:"1rem", display:"flex", gap:".5rem" }}>
                {GALLERY.map((g,i) => (
                  <CldImage key={i} src={g.src} alt="" onClick={() => setActiveImg(i)}
                    width={144} height={104} sizes="72px"
                    className={`fp-gallery-thumb${activeImg===i?" fp-gallery-thumb--active":""}`} />
                ))}
              </div>
            </div>

            {/* hero text */}
            <div className="fp-hero-text" data-reveal="blur" style={{ paddingBottom:"2.5rem", display:"flex", flexDirection:"column", gap:"1.2rem" }}>
              <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--brand-red)" }}>
                {t("heroEyebrow")}
              </span>
              <h1 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(2.4rem,4.5vw,3.8rem)", color:"#fff", lineHeight:.9, letterSpacing:".01em" }}>
                {t.rich("heroTitle", { br: () => <br /> })}
              </h1>
              <p style={{ fontFamily:"var(--ff-body)", fontSize:".95rem", lineHeight:1.7, color:"rgba(255,255,255,0.75)", maxWidth:"38ch" }}>
                {t("heroDescription")}
              </p>

              {/* key stats */}
              <div className="fp-hero-kv-row" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", paddingTop:".5rem", borderTop:"1px solid rgba(255,255,255,.08)" }}>
                <div className="fp-kv">
                  <span className="fp-kv__label">{t("maxSpeed")}</span>
                  <span className="fp-kv__value" style={{ color:"#fff" }}>350 m/min</span>
                </div>
                <div className="fp-kv">
                  <span className="fp-kv__label">{t("colours")}</span>
                  <span className="fp-kv__value" style={{ color:"#fff" }}>2 – 8</span>
                </div>
                <div className="fp-kv">
                  <span className="fp-kv__label">{t("webWidth")}</span>
                  <span className="fp-kv__value" style={{ color:"#fff" }}>500–2000mm</span>
                </div>
              </div>

              <AetherBtn style={{ alignSelf:"flex-start", marginTop:".5rem" }}><Link href="/inquiries">{t("requestQuote")}</Link></AetherBtn>
            </div>
          </div>
        </div>
      </section>

      {/* ── COLOUR TIER + WIDTH SELECTOR ── */}
      <section className="fp-tier-section" style={{ background:"var(--bg-base)", borderTop:"1px solid var(--bg-line)", padding:"4rem 0 5rem" }}>
        <div className="wrap" style={{ display:"flex", flexDirection:"column", gap:"3rem" }}>

          {/* heading */}
          <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
            <div>
              <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--ink-60)", display:"block", marginBottom:".4rem" }}>
                {t("selectConfiguration")}
              </span>
              <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.8rem,3vw,2.6rem)", color:"var(--ink)", lineHeight:.95 }}>
                {t("chooseColourAndWidth")}
              </h2>
            </div>
          </div>

          {/* colour tier cards */}
          <div>
            <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--slate-30)", marginBottom:".8rem" }}>
              {t("printingColours")}
            </div>
            <div className="fp-tier-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:".75rem" }}>
              {COLOUR_TIERS.map(ct => (
                <button key={ct.slug} onClick={() => setActiveTier(ct.slug)} data-reveal
                  className={`fp-tier-btn${activeTier===ct.slug?" fp-tier-btn--active":""}`}>
                  <span className="fp-tier-badge">{colourTierCopy[ct.slug]?.badge}</span>
                  <span className="fp-tier-label" style={{ marginTop:".5rem" }}>{colourTierCopy[ct.slug]?.label}</span>
                  <span className="fp-tier-sub">{ct.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* width selector */}
          <div>
            <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--slate-30)", marginBottom:".8rem" }}>
              {t("maxWebWidth")}
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
          <div className="fp-kv-grid" data-reveal="scale" style={{
            display:"grid", gridTemplateColumns:"repeat(4,1fr)",
            gap:"1px", background:"var(--bg-line)",
            border:"1px solid var(--bg-line)",
          }}>
            {[
              { label: t("model"),        value: singleModel.models[0] },
              { label: t("maxSpeed"),     value: ks.speed },
              { label: t("registration"), value: ks.reg },
              { label: t("driveSystemLabel"), value: driveSystemCopy[ks.drive] },
            ].map(kv => (
              <div key={kv.label} style={{ background:"var(--bg-surface)", padding:"1.4rem 1.6rem" }}>
                <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--ink-60)", marginBottom:".4rem" }}>{kv.label}</div>
                <div style={{ fontFamily:"var(--ff-display)", fontSize:"1.2rem", color:"var(--ink)", lineHeight:1 }}>{kv.value}</div>
              </div>
            ))}
          </div>

          {/* full spec table for selected model */}
          <div data-reveal>
            <div style={{ fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--slate-30)", marginBottom:"1rem" }}>
              {t("fullSpecificationFor", { model: singleModel.models[0] })}
            </div>
            <SpecTable family={singleModel} />
          </div>

        </div>
      </section>

      {/* ── ALL SERIES OVERVIEW ── */}
      <section className="fp-series-section" style={{ background:"var(--bg-surface)", borderTop:"1px solid var(--bg-line)", padding:"5rem 0" }}>
        <div className="wrap">
          <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--ink-60)", display:"block", marginBottom:".6rem" }}>
            {t("completeRange")}
          </span>
          <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.8rem,3vw,2.6rem)", color:"var(--ink)", lineHeight:.95, marginBottom:"3rem" }}>
            {t("allSeriesConfigurations")}
          </h2>

          <div style={{ display:"flex", flexDirection:"column", gap:"3rem" }}>
            {families.map((f, fi) => (
              <article key={f.slug} className="fp-series-row" data-reveal style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:"3rem", paddingBottom:"3rem", borderBottom:"1px solid var(--bg-line)" }}>

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
                    <h3 style={{ fontFamily:"var(--ff-display)", fontSize:"1.4rem", color:"var(--ink)", lineHeight:1, marginBottom:".5rem" }}>{f.name}</h3>
                    <p style={{ fontFamily:"var(--ff-body)", fontSize:".88rem", color:"var(--ink-60)", lineHeight:1.6 }}>{f.tagline}</p>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:".35rem" }}>
                    {f.models.map(m => (
                      <span key={m} style={{
                        fontFamily:"var(--ff-mono)", fontSize:"0.68rem", letterSpacing:".1em",
                        padding:".25rem .55rem", border:"1px solid var(--bg-line)",
                        color:"var(--ink-60)", background:"var(--bg-base)",
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
      <section className="fp-dark fp-substrate-section" style={{ background:"#0d1614", padding:"4rem 0" }}>
        <div className="wrap">
          <div className="fp-substrate-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center" }}>
            <div data-reveal="blur">
              <span style={{ fontFamily:"var(--ff-mono)", fontSize:"0.7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--brand-red)", display:"block", marginBottom:".6rem" }}>
                {t("substrateCompatibility")}
              </span>
              <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.8rem,3vw,2.6rem)", color:"#fff", lineHeight:.95, marginBottom:"1.5rem" }}>
                {t.rich("substrateHeading", { br: () => <br /> })}
              </h2>
              <p style={{ fontFamily:"var(--ff-body)", fontSize:".95rem", lineHeight:1.7, color:"rgba(255,255,255,0.75)", marginBottom:"2rem", maxWidth:"42ch" }}>
                {t("substrateDescription")}
              </p>
              <AetherBtn><Link href="/inquiries">{t("talkToPrintSpecialist")}</Link></AetherBtn>
            </div>
            <div data-reveal="scale" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1px", background:"rgba(255,255,255,.08)" }}>
              {(t.raw("substrateList") as string[]).map(sub => (
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
      <section className="fp-cta-section" style={{
        background:"var(--bg-surface)", borderTop:"1px solid var(--bg-line)",
        padding:"clamp(2.5rem,5vw,4rem) clamp(1.25rem,4vw,3rem)",
        display:"flex", justifyContent:"space-between", alignItems:"center", gap:"2rem", flexWrap:"wrap",
      }} data-reveal>
        <h2 style={{ fontFamily:"var(--ff-display)", fontSize:"clamp(1.75rem,4vw,2.8rem)", color:"var(--ink)", lineHeight:.98 }}>
          {t("needHelpChoosing")}
        </h2>
        <AetherBtn><Link href="/inquiries">{t("talkToEngineer")}</Link></AetherBtn>
      </section>
    </div>
  );
}
