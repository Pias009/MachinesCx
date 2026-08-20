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
  categoryTag: string;
  hot?: boolean;
  flagship?: boolean;
}

function findSpec(family: ProductFamily, label: string): string {
  return family.specs?.find(s => s.label === label)?.values?.[0] ?? "";
}

function buildModels(list: ProductFamily[]): FlexoModel[] {
  return list.map(f => {
    let catTag = "All Series";
    if (f.slug === "flexo-2c") catTag = "Entry Level";
    else if (f.slug === "flexo-4c") catTag = "Mid-Range";
    else if (f.slug === "flexo-6c") catTag = "High Speed";
    else if (f.slug === "flexo-8c") catTag = "Flagship";

    return {
      slug: f.slug,
      label: f.series.split("·")[0].trim(),
      colours: parseInt(findSpec(f, "Printing Colours")) || 2,
      speed:   (findSpec(f, "Max Mechanical Speed").match(/\d+/) || ["120"])[0],
      reg:     findSpec(f, "Registration Accuracy") || "±0.2mm",
      img:     f.images?.[0] ?? "/machines/flexo-1.png",
      tag:     f.tagline ?? "",
      categoryTag: catTag,
      hot:      f.slug === "flexo-4c",
      flagship: f.slug === "flexo-8c",
    };
  });
}

const CATEGORY_TABS = ["All Series", "Entry Level", "Mid-Range", "High Speed", "Flagship"];

export default function FlexoStrip() {
  const t = useTranslations("flexoStrip");
  const modelTags = t.raw("models") as Record<string, { tag: string }>;
  const localFamilies: ProductFamily[] = FAMILY_BASE.map((f) => ({ ...f, tagline: modelTags[f.slug]?.tag ?? "" }));
  const DEFAULT_MODELS: FlexoModel[] = buildModels(localFamilies);
  const SPECS = t.raw("specs") as { label: string; value: string }[];

  const cms = useCms<{ items?: FlexoModel[] }>("flexo-strip", { items: DEFAULT_MODELS });
  const MODELS = cms.items && cms.items.length ? cms.items : DEFAULT_MODELS;

  const [activeCategory, setActiveCategory] = useState<string>("All Series");

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
  const subtitleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("gsap/ScrollTrigger")
      .then(({ ScrollTrigger }) => {
        if (cancelled) return;
        gsap.registerPlugin(ScrollTrigger);
        setPluginReady(true);
      })
      .catch(() => { if (!cancelled) revealAll(); });
    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 2000);
    return () => { cancelled = true; clearTimeout(fallback); };
  }, []);

  // Filter models based on category tab
  const filteredModels = MODELS.filter((m) => {
    if (activeCategory === "All Series") return true;
    return m.categoryTag === activeCategory;
  });

  // Helper to split title into animated word and letter spans
  const renderAnimatedTitle = (text: string) => {
    const words = text.split(" ");
    return words.map((word, wIdx) => (
      <span key={wIdx} className="fls-title-word" style={{ display: "inline-block", whiteSpace: "nowrap", marginRight: "0.25em" }}>
        {Array.from(word).map((char, cIdx) => (
          <span
            key={cIdx}
            className="fls-title-char"
            style={{
              display: "inline-block",
              backfaceVisibility: "hidden",
              willChange: "transform, opacity, filter",
              transformStyle: "preserve-3d",
            }}
          >
            {char}
          </span>
        ))}
      </span>
    ));
  };

  // Initial scroll-triggered GSAP entrance
  useGSAP(() => {
    if (!pluginReady) return;
    const easeExp = "expo.out";
    const revTrigger = (target: Element | null, start: string) =>
      ({ trigger: target, start, end: "bottom top", toggleActions: "play reverse play reverse" });

    const headerTl = gsap.timeline({ scrollTrigger: revTrigger(sectionRef.current, "top 85%") });

    // 1. Eyebrow glide in
    headerTl.fromTo(eyebrowRef.current,
      { opacity: 0, x: -30, filter: "blur(6px)" },
      { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.8, ease: easeExp },
      SECTION_ELEMENT_DELAY
    );

    // 2. Character-by-character 3D Rotate & Bounce reveal
    const chars = titleRef.current?.querySelectorAll<HTMLElement>(".fls-title-char");
    if (chars && chars.length) {
      headerTl.fromTo(chars,
        {
          opacity: 0,
          y: 65,
          rotateX: -85,
          rotateY: 35,
          scale: 0.5,
          filter: "blur(12px)",
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.85,
          ease: "back.out(1.5)",
          stagger: 0.028,
        },
        SECTION_ELEMENT_DELAY + 0.1
      );
    }

    // 3. Glowing line reveal
    headerTl.fromTo(lineRef.current,
      { scaleX: 0, transformOrigin: "left center", opacity: 0 },
      { scaleX: 1, opacity: 1, duration: 1.2, ease: easeExp },
      SECTION_ELEMENT_DELAY + 0.3
    );

    // 4. Subtitle fade up
    headerTl.fromTo(subtitleRef.current,
      { opacity: 0, y: 20, filter: "blur(8px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: easeExp },
      SECTION_ELEMENT_DELAY + 0.4
    );

    const cards = gridRef.current
      ? Array.from(gridRef.current.querySelectorAll<HTMLElement>(".fls-card"))
      : [];
    gsap.fromTo(cards, { y: 40, opacity: 0, scale: 0.96 }, {
      y: 0, opacity: 1, scale: 1, duration: 0.75, ease: "power3.out", stagger: 0.08,
      delay: SECTION_ELEMENT_DELAY + 0.2,
      scrollTrigger: revTrigger(gridRef.current, "top 85%"),
    });

    gsap.fromTo(stripRef.current, { y: 36, opacity: 0 }, {
      y: 0, opacity: 1, duration: 0.9, ease: easeExp, delay: SECTION_ELEMENT_DELAY,
      scrollTrigger: revTrigger(stripRef.current, "top 90%"),
    });
  }, { scope: sectionRef, dependencies: [pluginReady] });

  // Handle smooth GSAP animation when category changes
  const handleCategorySelect = (category: string) => {
    if (category === activeCategory) return;

    if (!gridRef.current) {
      setActiveCategory(category);
      return;
    }

    const cards = Array.from(gridRef.current.querySelectorAll<HTMLElement>(".fls-card"));

    // Animate out current cards
    gsap.to(cards, {
      opacity: 0,
      y: -15,
      scale: 0.95,
      duration: 0.25,
      stagger: 0.04,
      ease: "power2.in",
      onComplete: () => {
        setActiveCategory(category);
        // Animate in newly rendered cards on next tick
        requestAnimationFrame(() => {
          if (!gridRef.current) return;
          const newCards = Array.from(gridRef.current.querySelectorAll<HTMLElement>(".fls-card"));
          gsap.fromTo(
            newCards,
            { opacity: 0, y: 25, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out", stagger: 0.06 }
          );
        });
      },
    });
  };

  return (
    <section ref={sectionRef} className="fls-section" style={{
      background: "var(--bg-base)",
      borderTop: "1px solid var(--line)",
      padding: "clamp(5rem,9vw,9rem) 0 clamp(4.5rem,8vw,8rem)",
      overflow: "hidden",
      position: "relative",
    }}>
      {/* Top accent bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "3px",
        background: "linear-gradient(90deg, var(--brand-teal) 0%, var(--brand-red) 100%)",
      }} />

      {/* Ambient background glow */}
      <div aria-hidden style={{
        position: "absolute", top: "-120px", left: "50%", transform: "translateX(-50%)",
        width: "65%", height: "320px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(43,191,179,0.08) 0%, rgba(225,29,72,0.04) 60%, transparent 75%)",
        pointerEvents: "none",
      }} />

      <style suppressHydrationWarning>{`
        .fls-title-clip { overflow: hidden; }

        /* ── Category Filter Tabs Bar ── */
        .fls-category-nav {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 2.2rem;
          overflow-x: auto;
          padding-bottom: 6px;
          scrollbar-width: none;
        }
        .fls-category-nav::-webkit-scrollbar { display: none; }

        .fls-cat-btn {
          font-family: var(--ff-mono);
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.5rem 1.1rem;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fls-cat-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
          transform: translateY(-1px);
        }
        .fls-cat-btn--active {
          background: var(--brand-teal) !important;
          border-color: var(--brand-teal) !important;
          color: #0d2220 !important;
          font-weight: 700;
          box-shadow: 0 4px 18px rgba(43, 191, 179, 0.35);
        }

        /* ── Grid & Cards ── */
        .fls-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 1.35rem;
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
          text-decoration: none;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.3s ease,
                      box-shadow 0.35s ease;
        }
        .fls-card:hover,
        .fls-card:focus-visible {
          transform: translateY(-8px) scale(1.01);
          border-color: var(--brand-teal);
          box-shadow: 0 20px 42px -15px rgba(43, 191, 179, 0.32),
                      0 0 20px rgba(43, 191, 179, 0.1);
        }
        .fls-card:focus-visible { outline: 2px solid var(--brand-teal); outline-offset: 2px; }

        .fls-card__photo {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          background: #fafafa;
          overflow: hidden;
          border-bottom: 1px solid var(--bg-line);
        }
        .fls-card__photo img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .6s cubic-bezier(0.16,1,0.3,1);
        }
        .fls-card:hover .fls-card__photo img { transform: scale(1.08); }
        
        .fls-card__badge {
          position: absolute; top: .75rem; left: .75rem; z-index: 2;
          font-family: var(--ff-mono); font-size: 0.62rem; letter-spacing: .14em;
          text-transform: uppercase; padding: .3rem .65rem; border-radius: 6px;
          backdrop-filter: blur(8px);
        }
        .fls-card__badge--hot { background: var(--brand-teal); color: #0d2220; font-weight: 700; }
        .fls-card__badge--flagship { background: var(--ink); color: var(--bg-base); font-weight: 700; }

        .fls-card__body {
          position: relative;
          padding: 1.15rem 1.3rem 1.35rem;
          flex: 1 1 auto;
          display: flex;
          flex-direction: column;
        }
        .fls-card__num {
          font-family: var(--ff-mono); font-size: 0.62rem; font-weight: 700;
          letter-spacing: .12em; color: var(--brand-teal);
        }
        .fls-card__name {
          font-family: var(--ff-display); font-weight: 700;
          font-size: clamp(1.15rem, 1.6vw, 1.4rem);
          letter-spacing: -0.005em; color: var(--ink);
          margin: .2rem 0 0;
        }
        .fls-card__tag {
          font-family: var(--ff-body); font-size: .8rem; line-height: 1.45;
          color: var(--ink-60); margin: .35rem 0 0;
        }

        /* Specs panel reveal on hover */
        .fls-card__specs {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; justify-content: center;
          gap: .6rem;
          padding: 1.15rem 1.3rem;
          background: var(--bg-raise);
          opacity: 0;
          transform: translateY(14px);
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
          padding-bottom: .45rem;
        }
        .fls-card__spec-label {
          font-family: var(--ff-mono); font-size: 0.62rem; letter-spacing: .14em;
          text-transform: uppercase; color: var(--ink-35);
        }
        .fls-card__spec-value {
          font-family: var(--ff-display); font-size: 1.05rem; color: var(--ink);
        }
        .fls-card__spec-unit { font-family: var(--ff-body); font-size: .8rem; color: var(--ink-60); margin-left: .25rem; }

        .fls-cta-row {
          margin-top: 2.2rem;
          display: flex; justify-content: center;
        }
        .fls-cta-row a {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: 0.8rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; color: var(--brand-teal);
          text-decoration: none;
          transition: gap .2s ease, color 0.2s ease;
        }
        .fls-cta-row a:hover { gap: .75rem; color: var(--brand-red); }

        /* Light Mode High Contrast Overrides */
        [data-theme="light"] .fls-section {
          background: var(--bg-base);
          border-top-color: rgba(13, 34, 32, 0.08);
        }
        [data-theme="light"] .fls-cat-btn {
          background: rgba(13, 34, 32, 0.05);
          border-color: rgba(13, 34, 32, 0.14);
          color: #0d2220;
        }
        [data-theme="light"] .fls-cat-btn:hover {
          background: rgba(13, 34, 32, 0.12);
          color: #0d2220;
        }
        [data-theme="light"] .fls-cat-btn--active {
          background: var(--brand-teal) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .fls-card {
          background: #ffffff;
          border-color: rgba(13, 34, 32, 0.12);
          box-shadow: 0 4px 16px rgba(13, 34, 32, 0.05);
        }
        [data-theme="light"] .fls-card:hover {
          border-color: var(--brand-teal);
          box-shadow: 0 16px 36px rgba(13, 34, 32, 0.12);
        }

        @media (max-width: 640px) {
          .fls-section { padding: clamp(2.5rem,6vw,3.5rem) 0 clamp(2rem,5vw,3rem) !important; }
          .fls-grid { grid-template-columns: 1fr; gap: 1rem !important; }
        }
      `}</style>

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* ── Header ── */}
        <div className="fls-header" style={{ marginBottom: "clamp(2rem,4vw,3rem)" }}>
          <span ref={eyebrowRef} style={{
            display: "inline-flex", alignItems: "center", gap: ".75rem",
            fontFamily: "var(--ff-mono)", fontSize: "0.72rem",
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
              fontSize: "clamp(2.8rem,6vw,5.5rem)",
              color: "var(--ink)", lineHeight: .95,
              letterSpacing: ".01em", margin: 0,
              perspective: "1000px",
            }}>
              {renderAnimatedTitle(t("title"))}
            </h2>
          </div>

          <div ref={lineRef} style={{
            height: "2px", width: "clamp(200px,40%,480px)",
            background: "linear-gradient(to right, var(--brand-teal), var(--brand-red), transparent)",
            margin: ".7rem 0 .9rem", opacity: 0,
          }} />

          <span ref={subtitleRef} style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(1.1rem,2vw,1.65rem)",
            color: "var(--ink-60)", display: "block",
            opacity: 0,
          }}>
            {t("subtitle")}
          </span>
        </div>

        {/* ── Category Filter Tabs ── */}
        <div className="fls-category-nav" role="tablist" aria-label="Machine Series Categories">
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              className={`fls-cat-btn${activeCategory === cat ? " fls-cat-btn--active" : ""}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Cards Grid ── */}
        <div className="fls-grid" ref={gridRef}>
          {filteredModels.map((m, i) => (
            <TransitionLink
              key={m.slug}
              href={`/products/printing/${m.slug}`}
              prefetch={false}
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

