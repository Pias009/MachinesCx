"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import { useCms } from "@/lib/useCms";
import type { ProductFamily } from "@/lib/products";

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
  const sliderRef   = useRef<HTMLDivElement>(null);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [isMobile, setIsMobile]   = useState(false);
  const autoSlideTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Filter models based on category tab — must be defined before any effect that uses it
  const filteredModels = MODELS.filter((m) => {
    if (activeCategory === "All Series") return true;
    return m.categoryTag === activeCategory;
  });

  // Reset slider index when category changes
  useEffect(() => {
    setSliderIdx(0);
    if (sliderRef.current) sliderRef.current.scrollLeft = 0;
  }, [activeCategory]);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-advance slider on mobile
  const startAutoSlide = useCallback((count: number) => {
    if (autoSlideTimer.current) clearInterval(autoSlideTimer.current);
    autoSlideTimer.current = setInterval(() => {
      setSliderIdx(prev => {
        const next = (prev + 1) % count;
        if (sliderRef.current) {
          const card = sliderRef.current.children[next] as HTMLElement;
          card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
        return next;
      });
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isMobile) { if (autoSlideTimer.current) clearInterval(autoSlideTimer.current); return; }
    startAutoSlide(filteredModels.length);
    return () => { if (autoSlideTimer.current) clearInterval(autoSlideTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, activeCategory, filteredModels.length]);

  const handleCategorySelect = (category: string) => {
    if (category === activeCategory) return;
    setActiveCategory(category);
  };

  return (
    <section className="fls-section" style={{
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

      <style suppressHydrationWarning>{`
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
          transition: all 0.2s ease;
        }
        .fls-cat-btn:hover {
          background: rgba(255, 255, 255, 0.09);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.25);
        }
        .fls-cat-btn--active {
          background: var(--brand-teal) !important;
          border-color: var(--brand-teal) !important;
          color: #0d2220 !important;
          font-weight: 700;
          box-shadow: 0 4px 18px rgba(43, 191, 179, 0.35);
        }

        /* ── Desktop Grid & Cards ── */
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
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1),
                      border-color 0.25s ease,
                      box-shadow 0.3s ease;
        }
        .fls-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: var(--brand-teal);
          box-shadow: 0 20px 42px -15px rgba(43,191,179,0.32);
        }
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
          transition: transform .5s cubic-bezier(0.16,1,0.3,1);
        }
        .fls-card:hover .fls-card__photo img { transform: scale(1.07); }

        .fls-card__badge {
          position: absolute; top: .75rem; left: .75rem; z-index: 2;
          font-family: var(--ff-mono); font-size: 0.62rem; letter-spacing: .14em;
          text-transform: uppercase; padding: .3rem .65rem; border-radius: 6px;
          backdrop-filter: blur(8px);
        }
        .fls-card__badge--hot { background: var(--brand-teal); color: #0d2220; font-weight: 700; }
        .fls-card__badge--flagship { background: var(--ink); color: var(--bg-base); font-weight: 700; }

        .fls-card__body {
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
          font-size: clamp(1.15rem,1.6vw,1.4rem);
          color: var(--ink); margin: .2rem 0 0;
        }
        .fls-card__tag {
          font-size: .8rem; line-height: 1.45;
          color: var(--ink-60); margin: .35rem 0 0;
        }

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

        /* Light Mode Overrides */
        [data-theme="light"] .fls-section {
          background: var(--bg-base);
          border-top-color: rgba(13,34,32,0.08);
        }
        [data-theme="light"] .fls-cat-btn {
          background: rgba(13,34,32,0.05);
          border-color: rgba(13,34,32,0.14);
          color: #0d2220;
        }
        [data-theme="light"] .fls-cat-btn:hover {
          background: rgba(13,34,32,0.12);
          color: #0d2220;
        }
        [data-theme="light"] .fls-cat-btn--active {
          background: var(--brand-teal) !important;
          color: #0d2220 !important;
        }
        [data-theme="light"] .fls-card {
          background: #ffffff;
          border-color: rgba(13,34,32,0.12);
          box-shadow: 0 4px 16px rgba(13,34,32,0.05);
        }
        [data-theme="light"] .fls-card:hover {
          border-color: var(--brand-teal);
          box-shadow: 0 16px 36px rgba(13,34,32,0.12);
        }

        @media (max-width: 640px) {
          .fls-section { padding: clamp(2.5rem,6vw,3.5rem) 0 clamp(2rem,5vw,3rem) !important; }
          .fls-grid { display: none !important; }
          .fls-cta-row { margin-top: 1rem; }
        }

        /* Mobile horizontal slider */
        .fls-slider { display: none; }
        @media (max-width: 640px) {
          .fls-slider {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            padding: 0 clamp(1rem,5vw,1.5rem) 1rem;
            margin: 0 calc(-1 * clamp(1rem,5vw,1.5rem));
          }
          .fls-slider::-webkit-scrollbar { display: none; }
          .fls-slider .fls-card {
            flex: 0 0 80vw;
            scroll-snap-align: center;
            max-width: 320px;
          }
          .fls-slider-dots {
            display: flex;
            justify-content: center;
            gap: 6px;
            margin-top: 1rem;
          }
          .fls-slider-dot {
            width: 7px; height: 7px; border-radius: 50%;
            background: rgba(255,255,255,0.25);
            border: none; cursor: pointer; padding: 0;
            transition: background 0.3s ease, transform 0.3s ease;
          }
          .fls-slider-dot--active {
            background: var(--brand-teal);
            transform: scale(1.4);
          }
        }
      `}</style>

      <div className="wrap" style={{ position: "relative", zIndex: 1 }}>
        {/* ── Header ── */}
        <div style={{ marginBottom: "clamp(2rem,4vw,3rem)" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: ".75rem",
            fontFamily: "var(--ff-mono)", fontSize: "0.72rem",
            letterSpacing: ".22em", textTransform: "uppercase",
            color: "var(--brand-teal)", marginBottom: ".75rem",
          }}>
            <span style={{ width: "2rem", height: "1px", background: "var(--brand-teal)", display: "inline-block", flexShrink: 0 }} />
            {t("eyebrow")}
          </span>

          <h2 style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(2.8rem,6vw,5.5rem)",
            color: "var(--ink)", lineHeight: .95,
            letterSpacing: ".01em", margin: "0 0 .6rem",
          }}>
            {t("title")}
          </h2>

          <div style={{
            height: "2px", width: "clamp(200px,40%,480px)",
            background: "linear-gradient(to right, var(--brand-teal), var(--brand-red), transparent)",
            margin: ".4rem 0 .8rem",
          }} />

          <span style={{
            fontFamily: "var(--ff-display)",
            fontSize: "clamp(1.1rem,2vw,1.65rem)",
            color: "var(--ink-60)", display: "block",
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

        {/* ── Desktop Cards Grid ── */}
        <div className="fls-grid">
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
                <Image src={m.img} alt={m.label} fill sizes="(max-width:700px) 100vw, 33vw" loading="lazy" />
              </div>
              <div className="fls-card__body">
                <span className="fls-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="fls-card__name">{m.label}</h3>
                <p className="fls-card__tag">{m.tag}</p>
              </div>
            </TransitionLink>
          ))}
        </div>

        {/* ── Mobile Horizontal Swipe Slider ── */}
        <div
          className="fls-slider"
          ref={sliderRef}
          onScroll={() => {
            if (!sliderRef.current) return;
            const el = sliderRef.current;
            const idx = Math.round(el.scrollLeft / (el.scrollWidth / filteredModels.length));
            setSliderIdx(idx);
          }}
        >
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
                <Image src={m.img} alt={m.label} fill sizes="80vw" loading="lazy" />
              </div>
              <div className="fls-card__body">
                <span className="fls-card__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="fls-card__name">{m.label}</h3>
                <p className="fls-card__tag">{m.tag}</p>
              </div>
            </TransitionLink>
          ))}
        </div>

        {/* Slider dots — mobile only */}
        <div className="fls-slider-dots">
          {filteredModels.map((_, i) => (
            <button
              key={i}
              className={`fls-slider-dot${i === sliderIdx ? " fls-slider-dot--active" : ""}`}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                setSliderIdx(i);
                const card = sliderRef.current?.children[i] as HTMLElement;
                card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
              }}
            />
          ))}
        </div>

        <div className="fls-cta-row">
          <TransitionLink href="/products/printing">{t("viewFullSpec")}</TransitionLink>
        </div>

        {/* ── Bottom spec strip ── */}
        <div style={{
          marginTop: "clamp(2.5rem,5vw,4rem)", padding: "1.25rem 1.5rem",
          border: "1px solid var(--line)",
          borderTop: "2px solid var(--brand-teal)",
          borderRadius: "10px",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem",
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
