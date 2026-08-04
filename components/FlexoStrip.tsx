"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";

gsap.registerPlugin(useGSAP);

// model tagline ("tag") text comes from the flexoStrip.models translation
// namespace, keyed by slug — everything else here is fixed catalogue data
const FAMILY_BASE: Omit<ProductFamily, "tagline">[] = [
  { slug:"flexo-2c", category:"printing", series:"AI-2C · 2-colour", name:"AI-2C", models:["AI-2C-500"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-1.png"], specs:[
    { label:"Printing Colours",      values:["2"] },
    { label:"Max Mechanical Speed",  values:["120m/min"] },
    { label:"Registration Accuracy", values:["±0.2mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-4c", category:"printing", series:"AI-4C · 4-colour", name:"AI-4C", models:["AI-4C-800"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-2.png"], specs:[
    { label:"Printing Colours",      values:["4"] },
    { label:"Max Mechanical Speed",  values:["200m/min"] },
    { label:"Registration Accuracy", values:["±0.15mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-6c", category:"printing", series:"AI-6C · 6-colour", name:"AI-6C", models:["AI-6C-1200"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-6c-nobg.png"], specs:[
    { label:"Printing Colours",      values:["6"] },
    { label:"Max Mechanical Speed",  values:["260m/min"] },
    { label:"Registration Accuracy", values:["±0.1mm"] },
  ], installation:[], deliveryGuide:[], gallery:[], videos:[], reviews:[], deliveryStagePhotos:{}, customSections:[], parts:[] },
  { slug:"flexo-8c", category:"printing", series:"AI-8C · 8-colour", name:"AI-8C", models:["AI-8C-1600"], materials:"PE, PP, PET, BOPP, Paper", images:["/machines/flexo-4.png"], specs:[
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

export default function FlexoStrip() {
  const t = useTranslations("flexoStrip");
  const modelTags = t.raw("models") as Record<string, { tag: string }>;
  const localFamilies: ProductFamily[] = FAMILY_BASE.map((f) => ({ ...f, tagline: modelTags[f.slug]?.tag ?? "" }));
  const DEFAULT_MODELS: FlexoModel[] = buildModels(localFamilies);
  const SPECS = t.raw("specs") as { label: string; value: string }[];

  const cms = useCms<{ items?: FlexoModel[] }>("flexo-strip", { items: DEFAULT_MODELS });
  const MODELS = cms.items && cms.items.length ? cms.items : DEFAULT_MODELS;

  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef  = useRef<HTMLSpanElement>(null);
  const lineRef     = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const gridRef     = useRef<HTMLDivElement>(null);
  const stripRef    = useRef<HTMLDivElement>(null);

  const revealAll = () => {
    [eyebrowRef, lineRef, gridRef, stripRef].forEach(r => {
      if (r.current) { r.current.style.opacity = "1"; r.current.style.transform = "none"; }
    });
    if (titleRef.current) titleRef.current.style.opacity = "1";
  };

  const [pluginReady, setPluginReady] = useState(false);
  const SplitTextRef = useRef<typeof import("gsap/SplitText").SplitText | null>(null);
  useEffect(() => {
    let cancelled = false;
    Promise.all([import("gsap/ScrollTrigger"), import("gsap/SplitText")])
      .then(([{ ScrollTrigger }, { SplitText }]) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger, SplitText);
        SplitTextRef.current = SplitText;
        setPluginReady(true);
      })
      .catch(() => { if (!cancelled) revealAll(); });
    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 4000);
    return () => { cancelled = true; clearTimeout(fallback); };
  }, []);

  useGSAP(() => {
    if (!pluginReady) return;
    const easeExp = "expo.out";
    const revTrigger = (target: Element | null, start: string) =>
      ({ trigger: target, start, end: "bottom top", toggleActions: "play reverse play reverse" });

    const headerTl = gsap.timeline({ scrollTrigger: revTrigger(sectionRef.current, "top 85%") });
    headerTl.fromTo(eyebrowRef.current, { opacity: 0, x: -24 }, { opacity: 1, x: 0, duration: 1, ease: easeExp }, SECTION_ELEMENT_DELAY);
    headerTl.fromTo(lineRef.current, { scaleX: 0, transformOrigin: "left center", opacity: 0 }, { scaleX: 1, opacity: 1, duration: 1.4, ease: easeExp }, SECTION_ELEMENT_DELAY + 0.2);

    if (titleRef.current && SplitTextRef.current) {
      const split = new SplitTextRef.current(titleRef.current, { type: "chars" });
      headerTl.fromTo(split.chars,
        { y: "110%", opacity: 0, rotateX: -50, transformOrigin: "0% 50% -20px" },
        { y: "0%", opacity: 1, rotateX: 0, duration: 0.9, ease: easeExp, stagger: 0.022 },
        SECTION_ELEMENT_DELAY + 0.1
      );
    }

    // grid cards reveal staggered, left-to-right — replaces the old
    // single-photo clip-path wipe now that all 4 models render at once
    const cards = gridRef.current
      ? Array.from(gridRef.current.querySelectorAll<HTMLElement>(".fls-card"))
      : [];
    gsap.fromTo(cards, { y: 40, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.7, ease: easeExp, stagger: 0.1,
      delay: SECTION_ELEMENT_DELAY + 0.15,
      scrollTrigger: revTrigger(gridRef.current, "top 85%"),
    });

    gsap.fromTo(stripRef.current, { y: 36, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: easeExp, delay: SECTION_ELEMENT_DELAY,
      scrollTrigger: revTrigger(stripRef.current, "top 90%"),
    });
  }, { scope: sectionRef, dependencies: [pluginReady] });

  return (
    <section ref={sectionRef} className="fls-section" style={{
      background: "var(--bg-base)",
      borderTop: "1px solid var(--line)",
      padding: "clamp(6rem,11vw,11rem) 0 clamp(5rem,9vw,9rem)",
      overflow: "hidden",
      position: "relative",
    }}>
      <style suppressHydrationWarning>{`
        .fls-title-clip { overflow: hidden; }

        /* ── 4-card grid: all models shown at once, no rotation. Each
           card is its own bordered surface with a photo up top and a
           specs panel that slides up from beneath the photo on hover
           instead of showing by default — keeps the resting grid clean
           and gives hover somewhere real to go. ── */
        .fls-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        .fls-card {
          position: relative;
          display: flex;
          flex-direction: column;
          border-radius: 16px;
          overflow: hidden;
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .fls-card:hover,
        .fls-card:focus-visible {
          transform: translateY(-6px);
          border-color: var(--brand-teal);
          box-shadow: 0 24px 48px -20px rgba(43,191,179,0.35);
        }
        .fls-card:focus-visible { outline: 2px solid var(--brand-teal); outline-offset: 2px; }

        .fls-card__photo {
          position: relative;
          width: 100%;
          height: clamp(180px, 20vw, 240px);
          background: #fafafa;
          overflow: hidden;
        }
        .fls-card__photo img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .6s cubic-bezier(0.16,1,0.3,1);
        }
        .fls-card:hover .fls-card__photo img { transform: scale(1.08); }
        .fls-card__badge {
          position: absolute; top: .75rem; left: .75rem; z-index: 2;
          font-family: var(--ff-mono); font-size: 0.6rem; letter-spacing: .14em;
          text-transform: uppercase; padding: .28rem .55rem; border-radius: 4px;
        }
        .fls-card__badge--hot { background: var(--brand-teal); color: #0d2220; font-weight: 700; }
        .fls-card__badge--flagship { background: var(--ink); color: var(--bg-base); font-weight: 700; }

        .fls-card__body {
          position: relative;
          padding: 1.1rem 1.25rem 1.25rem;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
        }
        .fls-card__num {
          font-family: var(--ff-mono); font-size: 0.6rem; font-weight: 700;
          letter-spacing: .1em; color: var(--brand-teal);
        }
        .fls-card__name {
          font-family: var(--ff-display); font-weight: 700;
          font-size: clamp(1.1rem, 1.6vw, 1.35rem);
          letter-spacing: -0.005em; color: var(--ink);
          margin: .15rem 0 0;
        }
        .fls-card__tag {
          font-family: var(--ff-body); font-size: .78rem; line-height: 1.4;
          color: var(--ink-60); margin: .3rem 0 0;
        }

        /* specs panel — hidden by default (opacity/translate), revealed
           on hover/focus by sliding up over the card body; base name/tag
           fade out just enough to hand off focus to the numbers */
        .fls-card__specs {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; justify-content: center;
          gap: .55rem;
          padding: 1.1rem 1.25rem;
          background: var(--bg-raise);
          opacity: 0;
          transform: translateY(12px);
          transition: opacity .28s ease, transform .28s cubic-bezier(0.16,1,0.3,1);
          pointer-events: none;
        }
        .fls-card:hover .fls-card__specs,
        .fls-card:focus-visible .fls-card__specs {
          opacity: 1;
          transform: translateY(0);
        }
        .fls-card__spec-row {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: .75rem;
          border-bottom: 1px solid var(--bg-line);
          padding-bottom: .4rem;
        }
        .fls-card__spec-label {
          font-family: var(--ff-mono); font-size: 0.6rem; letter-spacing: .14em;
          text-transform: uppercase; color: var(--ink-35);
        }
        .fls-card__spec-value {
          font-family: var(--ff-display); font-size: 1rem; color: var(--ink);
        }
        .fls-card__spec-unit { font-family: var(--ff-body); font-size: .78rem; color: var(--ink-60); margin-left: .25rem; }

        .fls-cta-row {
          margin-top: 1.75rem;
          display: flex; justify-content: center;
        }
        .fls-cta-row a {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: 0.8rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--brand-teal);
          text-decoration: none;
          transition: gap .15s ease;
        }
        .fls-cta-row a:hover { gap: .7rem; }

        @media (max-width: 980px) {
          .fls-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .fls-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .fls-section { padding: clamp(2rem,6vw,3rem) 0 clamp(1.5rem,4vw,2.5rem) !important; }
          .fls-header { margin-bottom: clamp(1rem,3vw,1.5rem) !important; }
          .fls-title-clip h2 { font-size: clamp(1.8rem, 8vw, 2.6rem) !important; }
          .fls-grid { gap: .75rem !important; }
          .fls-card__photo { height: clamp(120px, 35vw, 180px) !important; }
          .fls-card__body { padding: .75rem .9rem .85rem !important; }
          .fls-card__name { font-size: clamp(0.95rem, 3.5vw, 1.15rem) !important; }
          .fls-card__tag { font-size: .7rem !important; margin-top: .2rem !important; }
          .fls-card__badge { font-size: .5rem !important; padding: .2rem .4rem !important; top: .5rem !important; left: .5rem !important; }
          .fls-card__specs { padding: .75rem .9rem !important; gap: .4rem !important; }
          .fls-card__spec-label { font-size: .5rem !important; }
          .fls-card__spec-value { font-size: .85rem !important; }
          .fls-cta-row { margin-top: 1.25rem !important; }
          .fls-cta-row a { font-size: .7rem !important; }
          .fls-strip { padding: .85rem 1rem !important; gap: 1rem !important; flex-direction: column !important; align-items: flex-start !important; }
          .fls-strip > div { gap: 1rem !important; }
          .fls-strip > div > div { gap: .15rem !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fls-card, .fls-card__photo img, .fls-card__specs { transition: none; }
        }
      `}</style>

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* ── Header ── */}
        <div className="fls-header" style={{ marginBottom: "clamp(2.5rem,5vw,4rem)" }}>
          <span ref={eyebrowRef} style={{
            display: "inline-flex", alignItems: "center", gap: ".75rem",
            fontFamily: "var(--ff-mono)", fontSize: "0.7rem",
            letterSpacing: ".22em", textTransform: "uppercase",
            color: "var(--brand-teal)", marginBottom: ".75rem",
            opacity: 0,
          }}>
            <span style={{ width: "2rem", height: "1px", background: "var(--brand-teal)", display: "inline-block", flexShrink: 0 }} />
            {t("eyebrow")}
          </span>

          <div className="fls-title-clip">
            <h2 ref={titleRef} data-no-anim style={{
              fontFamily: "var(--ff-display)",
              fontSize: "clamp(3rem,6vw,6rem)",
              color: "var(--ink)", lineHeight: .88,
              letterSpacing: ".01em", margin: 0,
              perspective: "600px",
            }}>
              {t("title")}
            </h2>
          </div>

          <div ref={lineRef} style={{
            height: "2px", width: "clamp(200px,40%,480px)",
            background: "linear-gradient(to right, var(--brand-teal), var(--brand-teal-dim), transparent)",
            margin: ".7rem 0 .9rem", opacity: 0,
          }} />

          <span style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(1.1rem,2vw,1.65rem)",
            color: "var(--ink-60)", display: "block",
          }}>
            {t("subtitle")}
          </span>
        </div>

        {/* ── 4-card grid: every model visible at once, specs reveal on
           hover/focus instead of one auto-rotating hero photo ── */}
        <div className="fls-grid" ref={gridRef}>
          {MODELS.map((m, i) => (
            <TransitionLink
              key={m.slug}
              href={`/products/printing/${m.slug}`}
              className="fls-card"
              aria-label={`${m.label} — ${t("viewFullSpec")}`}
            >
              <div className="fls-card__photo">
                {m.hot && <span className="fls-card__badge fls-card__badge--hot">{t("hotBadge")}</span>}
                {m.flagship && <span className="fls-card__badge fls-card__badge--flagship">{t("flagshipBadge")}</span>}
                <Image src={m.img} alt={m.label} fill sizes="(max-width: 700px) 100vw, 33vw" loading="lazy" />
              </div>
              <div className="fls-card__body">
                <span className="fls-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="fls-card__name">{m.label}</h3>
                <p className="fls-card__tag">{m.tag}</p>

                <div className="fls-card__specs" aria-hidden="true">
                  <div className="fls-card__spec-row">
                    <span className="fls-card__spec-label">{t("speedLabel")}</span>
                    <span className="fls-card__spec-value">{m.speed}<span className="fls-card__spec-unit">m/min</span></span>
                  </div>
                  <div className="fls-card__spec-row">
                    <span className="fls-card__spec-label">{t("registrationLabel")}</span>
                    <span className="fls-card__spec-value">{m.reg}</span>
                  </div>
                  <div className="fls-card__spec-row">
                    <span className="fls-card__spec-label">AI · {t("colourLabel")}</span>
                    <span className="fls-card__spec-value">{m.colours}</span>
                  </div>
                </div>
              </div>
            </TransitionLink>
          ))}
        </div>

        <div className="fls-cta-row">
          <TransitionLink href="/products/printing">{t("viewFullSpec")}</TransitionLink>
        </div>

        {/* ── Bottom spec strip ── */}
        <div ref={stripRef} className="fls-strip" style={{
          marginTop: "clamp(2.5rem,5vw,4rem)", padding: "1.25rem 1.5rem",
          border: "1px solid var(--line)",
          borderTop: "2px solid var(--brand-teal)",
          borderRadius: "10px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem",
          opacity: 0,
        }}>
          <div style={{ display: "flex", gap: "clamp(1.5rem,3vw,3rem)", flexWrap: "wrap" }}>
            {SPECS.map(kv => (
              <div key={kv.label} style={{ display: "flex", flexDirection: "column", gap: ".2rem" }}>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.64rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--ink-35)" }}>{kv.label}</span>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: ".65rem", letterSpacing: ".06em", color: "var(--ink-60)" }}>{kv.value}</span>
              </div>
            ))}
          </div>
          <AetherBtn><TransitionLink href="/inquiries">{t("requestSpecSheet")}</TransitionLink></AetherBtn>
        </div>
      </div>
    </section>
  );
}
