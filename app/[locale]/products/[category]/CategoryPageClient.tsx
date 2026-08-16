"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import type { Category, ProductFamily } from "@/lib/products";
import { familyImage } from "@/lib/products";
import { useScrollReveal } from "@/lib/useScrollReveal";

/* ── per-category feature badges — icon + ordering only; the display
   label text is translated and pulled from the categoryPage.features.*
   namespace at render time, keyed by category slug + index ── */
const CATEGORY_FEATURES: Record<string, { icon: string }[]> = {
  "film-blowing": [
    { icon: "layers" },
    { icon: "gauge" },
    { icon: "width" },
    { icon: "servo" },
    { icon: "corona" },
    { icon: "scope" },
  ],
  "bag-making": [
    { icon: "speed" },
    { icon: "multilane" },
    { icon: "bio" },
    { icon: "seal" },
    { icon: "roll" },
    { icon: "vest" },
  ],
  "recycling": [
    { icon: "recycle" },
    { icon: "output" },
    { icon: "lab" },
    { icon: "hdpe" },
  ],
  "printing": [
    { icon: "colours" },
    { icon: "speed" },
    { icon: "register" },
    { icon: "servo" },
    { icon: "width" },
    { icon: "substrates" },
  ],
};

/* ── per-category hero image grids ───────────────────────────────── */
const HERO_IMAGES: Record<string, string[]> = {
  "film-blowing": [
    "/machines/abcde-2200.png",
    "/machines/abc-multilayer-small.png",
    "/machines/aba-1000-1500.png",
    "/machines/abc-cx-series.png",
  ],
  "bag-making": [
    "/machines/t-pro-heatseal.png",
    "/machines/f-pro-bottomseal.png",
    "/machines/rb-vegetable.png",
    "/machines/rgb-rollbag.png",
  ],
  "recycling": [
    "/machines/cx-pelletizing.png",
    "/machines/cx-25-lab.png",
  ],
  "printing": [
    "/machines/flexo-2-nobg.png",
    "/machines/flexo-4-nobg.png",
    "/machines/flexo-5-nobg.png",
    "/machines/flexo-6c-nobg.png",
  ],
};

/* ── feature-badge accent colors — cycled per badge so the strip reads
   as colorful/varied rather than one flat teal outline repeated ── */
const FEAT_ACCENTS = ["#2bbfb3", "#f59e0b", "#e11d48", "#38bdf8", "#a78bfa", "#22c55e"];

/* ── SVG icon library — filled duotone glyphs (solid shape, not just
   stroke outline) so each badge reads as a real colorful icon ── */
function FeatureIcon({ id }: { id: string }) {
  const icons: Record<string, JSX.Element> = {
    layers:     <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
    gauge:      <><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>,
    width:      <><path d="M21 6H3M21 12H3M21 18H3"/><path d="M3 3v18M21 3v18"/></>,
    servo:      <><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 17.66l-1.41 1.41M4.93 4.93l1.41 1.41M18.66 17.66l1.41 1.41M12 2v3M12 19v3M2 12h3M19 12h3"/></>,
    corona:     <><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></>,
    scope:      <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></>,
    speed:      <><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><path d="M16 11V7a2 2 0 0 0-2-2H7"/></>,
    multilane:  <><path d="M5 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2"/><path d="M19 3h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2"/><path d="M12 3v18"/></>,
    bio:        <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    seal:       <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    roll:       <><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></>,
    vest:       <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></>,
    recycle:    <><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></>,
    output:     <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
    lab:        <><path d="M10 2v8L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45L14 10V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></>,
    hdpe:       <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></>,
    colours:    <><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></>,
    register:   <><path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/><path d="M15 5l4 4"/></>,
    substrates: <><path d="M2 20h20"/><path d="M5 20V8l7-5 7 5v12"/><path d="M9 20v-8h6v8"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icons[id] ?? icons.gauge}
    </svg>
  );
}

/* ── key spec extractor ──────────────────────────────────────────── */
function firstSpec(f: ProductFamily, key: string): string | null {
  const row = f.specs.find(s => s.label === key || s.label.startsWith(key));
  return row?.values[0] ?? null;
}

/* ── highlight stat labels per category ─────────────────────────── */
const CARD_STATS: Record<string, string[]> = {
  "film-blowing": ["Film Width", "Max Extrusion Output", "Total Power"],
  "bag-making":   ["Max Bag Width", "Bag Making Speed", "Total Power"],
  "recycling":    ["Max Extrusion Output", "Screw Diameter", "Max Film Thickness"],
  "printing":     ["Max Mechanical Speed", "Registration Accuracy", "Max Web Width"],
};

interface Props {
  category: Category;
  families: ProductFamily[];
  allCategories: Category[];
}

export default function CategoryPageClient({ category, families, allCategories }: Props) {
  const t = useTranslations("categoryPage");
  const heroImgs  = HERO_IMAGES[category.slug] ?? [];
  const featureLabels = (t.raw("features") as Record<string, string[]>)[category.slug] ?? [];
  const features  = (CATEGORY_FEATURES[category.slug] ?? []).map((f, i) => ({ ...f, label: featureLabels[i] ?? "" }));
  const statKeys  = CARD_STATS[category.slug] ?? [];
  const cardsRef  = useRef<HTMLDivElement>(null);
  // mobile-only: category tabs collapse into a tap-to-expand dropdown
  // showing the active category, instead of a horizontal swipe row
  const [tabsOpen, setTabsOpen] = useState(false);

  /* stagger-reveal cards on scroll */
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const cards = cardsRef.current?.querySelectorAll<HTMLElement>(".ccp-card");
    if (!cards) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement;
          const i  = Number(el.dataset.idx ?? 0);
          el.style.transitionDelay = `${i * 0.07}s`;
          el.classList.add("ccp-card--visible");
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, []);

  const rootRef = useRef<HTMLDivElement>(null);
  useScrollReveal(rootRef);

  return (
    <div ref={rootRef}>
      {/* ── HERO ── */}
      <header className="ccp-hero">
        {/* engineering grid via ::before */}

        {/* machine mosaic */}
        {heroImgs.length > 0 && (
          <div className={`ccp-hero__mosaic${heroImgs.length <= 2 ? " ccp-hero__mosaic--single" : ""}`} aria-hidden="true">
            {heroImgs.slice(0, 4).map((src, i) => (
              <div key={i} className="ccp-hero__mosaic-cell">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 880px) 0px, 26vw"
                  priority={i === 0}
                  loading={i === 0 ? undefined : "lazy"}
                />
              </div>
            ))}
          </div>
        )}

        <div className="ccp-hero__content" data-reveal="blur">
          {/* breadcrumb */}
          <nav className="ccp-crumb" aria-label={t("breadcrumbAria")}>
            <Link href="/">{t("breadcrumbHome")}</Link>
            <span className="ccp-crumb__sep" aria-hidden="true">›</span>
            <Link href="/products">{t("breadcrumbCatalogue")}</Link>
            <span className="ccp-crumb__sep" aria-hidden="true">›</span>
            <span className="ccp-crumb__cur">{category.name}</span>
          </nav>

          <p className="ccp-hero__tag">{category.tagline}</p>
          <h1 className="ccp-hero__h1">{category.name}</h1>
          <p className="ccp-hero__blurb">{category.blurb}</p>

          {/* category tabs — on mobile this collapses into a tap-to-expand
              dropdown (see .ccp-tabs-toggle CSS); desktop shows the full
              row and hides the toggle button entirely */}
          <div className={`ccp-tabs-wrap${tabsOpen ? " ccp-tabs-wrap--open" : ""}`}>
            <button
              type="button"
              className="ccp-tabs-toggle"
              onClick={() => setTabsOpen(o => !o)}
              aria-expanded={tabsOpen}
            >
              {category.name}
              <svg width="12" height="12" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>
            <nav className="ccp-tabs" aria-label={t("categoriesAria")}>
              {allCategories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products/${c.slug}`}
                  className={`ccp-tab${c.slug === category.slug ? " ccp-tab--active" : ""}`}
                  onClick={() => setTabsOpen(false)}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="ccp-hero__scan" aria-hidden="true" />
      </header>

      {/* ── FEATURE BADGES ── */}
      {features.length > 0 && (
        <div className="ccp-features">
          <div className="ccp-features__inner">
            {features.map((f, i) => {
              const accent = FEAT_ACCENTS[i % FEAT_ACCENTS.length];
              return (
                <div key={f.label} className="ccp-feat">
                  <div className="ccp-feat__icon" style={{ "--accent": accent } as React.CSSProperties}>
                    <FeatureIcon id={f.icon} />
                  </div>
                  <span className="ccp-feat__label">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── PRODUCT GRID ── */}
      <section className="ccp-grid-section" aria-label={t("productCatalogueAria")}>
        <div className="ccp-grid-section__wrap">
          <div className="ccp-grid-header" data-reveal>
            <h2>
              {families.length !== 1
                ? t.rich("machinesInRange", { count: families.length, em: (chunks) => <em>{chunks}</em> })
                : t.rich("machineInRangeSingular", { count: families.length, em: (chunks) => <em>{chunks}</em> })}
            </h2>
            <span className="ccp-count">{t("totalModels", { count: families.reduce((n, f) => n + f.models.length, 0) })}</span>
          </div>

          <div className="ccp-grid" ref={cardsRef}>
            {families.map((f, idx) => {
              const specPills = statKeys
                .map(key => ({ label: key, val: firstSpec(f, key) }))
                .filter(s => s.val);

              return (
                <Link
                  key={f.slug}
                  href={`/products/${f.category}/${f.slug}`}
                  prefetch={false}
                  className="ccp-card"
                  data-idx={idx}
                >
                  {/* machine image */}
                  <div className="ccp-card__img">
                    <span className="ccp-card__badge">{f.series}</span>
                    <Image
                      src={familyImage(f)}
                      alt={f.name}
                      fill
                      sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
                      loading="lazy"
                    />
                  </div>

                  {/* body */}
                  <div className="ccp-card__body">
                    <h3 className="ccp-card__name">{f.name}</h3>
                    <p className="ccp-card__tagline">{f.tagline}</p>

                    {/* key spec pills */}
                    {specPills.length > 0 && (
                      <div className="ccp-card__specs">
                        {specPills.map(s => (
                          <div key={s.label} className="ccp-spec-pill">
                            <span className="ccp-spec-pill__label">{s.label}</span>
                            <span className="ccp-spec-pill__val">{s.val}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* model chips */}
                    {f.models.length > 1 && (
                      <div className="ccp-card__models">
                        {f.models.slice(0, 5).map(m => (
                          <span key={m} className="ccp-card__model">{m}</span>
                        ))}
                        {f.models.length > 5 && (
                          <span className="ccp-card__model">+{f.models.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* footer */}
                  <div className="ccp-card__footer">
                    {f.materials ? (
                      <span className="ccp-card__materials">{f.materials}</span>
                    ) : (
                      <span />
                    )}
                    <span className="ccp-card__cta">
                      {t("viewDetails")}
                      <span className="ccp-card__cta-arrow" aria-hidden="true">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section className="ccp-cta" aria-label={t("contactAria")} data-reveal>
        <div className="ccp-cta__inner">
          <div>
            <h2 className="ccp-cta__h2">{t.rich("ctaHeading", { em: (chunks) => <em>{chunks}</em> })}</h2>
            <p className="ccp-cta__p">{t("ctaBody")}</p>
          </div>
          <AetherBtn>
            <TransitionLink href="/inquiries">{t("ctaButton")}</TransitionLink>
          </AetherBtn>
        </div>
      </section>
    </div>
  );
}
