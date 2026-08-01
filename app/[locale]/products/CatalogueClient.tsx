"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { familyImage } from "@/lib/products";
import type { Category, ProductFamily } from "@/lib/products";
import ProductStage3D from "@/components/ProductStage3D";

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path d="M2.5 6.5h8M8 3l3 3.5-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CatalogueClient({
  categories,
  families,
}: {
  categories: Category[];
  families: ProductFamily[];
}) {
  const t = useTranslations("catalogueClient");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");
  const [heroIdx, setHeroIdx] = useState(0);

  // ── rotating hero showcase — one representative machine per category,
  // cycling automatically so the hero itself reads as a live product tour,
  // not a single static photo. Pauses would add complexity for no real gain
  // here since the tilt/glow interaction already rewards a lingering cursor.
  const heroMachines = useMemo(
    () => categories.map((c) => families.find((f) => f.category === c.slug)).filter((f): f is ProductFamily => !!f),
    [categories, families]
  );
  useEffect(() => {
    if (heroMachines.length < 2) return;
    const id = setInterval(() => setHeroIdx((i) => (i + 1) % heroMachines.length), 5000);
    return () => clearInterval(id);
  }, [heroMachines.length]);
  const heroFamily = heroMachines[heroIdx % Math.max(heroMachines.length, 1)];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return families.filter((f) => {
      if (activeCategory !== "all" && f.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = [f.name, f.tagline, f.series, ...f.models].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [families, query, activeCategory]);

  // grouped by category only in the unfiltered "all" browse state — the
  // moment someone searches or filters, a flat result grid answers the
  // question faster than category scaffolding around it.
  const grouped = activeCategory === "all" && !query.trim()
    ? categories
        .map((c) => ({ category: c, items: filtered.filter((f) => f.category === c.slug) }))
        .filter((g) => g.items.length > 0)
    : null;

  const countFor = (slug: string | "all") =>
    slug === "all" ? families.length : families.filter((f) => f.category === slug).length;

  return (
    <>
      <header className="cat2-hero">
        <div className="cat2-hero__grid" aria-hidden="true" />
        <div className="wrap cat2-hero__inner">
          <div className="cat2-hero__col">
            <p className="cat2-crumb">
              <Link href="/">{t("breadcrumbHome")}</Link>
              <span>/</span>
              <span className="cat2-crumb__cur">{t("breadcrumbCatalogue")}</span>
            </p>
            <h1 className="cat2-hero__h1">{t("heroTitle")}</h1>
            <p className="cat2-hero__sub">
              {t("heroSub", { familyCount: families.length, categoryCount: categories.length })}
            </p>

            <div className="cat2-toolbar">
              <div className="cat2-search">
                <span className="cat2-search__icon"><SearchIcon /></span>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  aria-label={t("searchAria")}
                  className="cat2-search__input"
                />
                {query && (
                  <button type="button" className="cat2-search__clear" onClick={() => setQuery("")} aria-label={t("clearSearchAria")}>
                    <ClearIcon />
                  </button>
                )}
              </div>

              <nav className="cat2-filter" aria-label={t("filterAria")}>
                <button
                  type="button"
                  className={`cat2-filter__pill ${activeCategory === "all" ? "cat2-filter__pill--active" : ""}`}
                  onClick={() => setActiveCategory("all")}
                >
                  {t("allPill")} <span className="cat2-filter__count">{countFor("all")}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    type="button"
                    className={`cat2-filter__pill ${activeCategory === c.slug ? "cat2-filter__pill--active" : ""}`}
                    onClick={() => setActiveCategory(c.slug)}
                  >
                    {c.name} <span className="cat2-filter__count">{countFor(c.slug)}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {heroFamily && (
            <div className="cat2-hero__stage">
              <ProductStage3D
                variant="hero"
                src={familyImage(heroFamily)}
                alt={heroFamily.name}
                badge={heroFamily.series}
                photoKey={heroFamily.slug}
                priority
                sizes="(max-width: 900px) 90vw, 42vw"
              />
              {heroMachines.length > 1 && (
                <div className="cat2-hero__dots" role="tablist" aria-label={t("featuredMachineAria")}>
                  {heroMachines.map((f, i) => (
                    <button
                      key={f.slug}
                      role="tab"
                      aria-selected={i === heroIdx}
                      aria-label={f.name}
                      className={`cat2-hero__dot${i === heroIdx ? " cat2-hero__dot--on" : ""}`}
                      onClick={() => setHeroIdx(i)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="cat2-results">
        <div className="wrap">
          <div className="cat2-results-head">
            <span className="cat2-results-count">
              {filtered.length === 1 ? t("resultsCountSingular", { count: filtered.length }) : t("resultsCountPlural", { count: filtered.length })}
              {query && <> {t("resultsMatching", { query })}</>}
            </span>
          </div>

          {filtered.length === 0 && (
            <div className="cat2-empty">
              <p>{t("emptyMessage")}</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { setQuery(""); setActiveCategory("all"); }}
              >
                {t("resetFilters")}
              </button>
            </div>
          )}

          {grouped
            ? grouped.map(({ category, items }) => (
                <div key={category.slug} className="cat2-group">
                  <div className="cat2-group__head">
                    <h2 className="cat2-group__title">{category.name}</h2>
                    <p className="cat2-group__tag">{category.tagline}</p>
                    <Link href={`/products/${category.slug}`} className="cat2-group__link">
                      {t("viewLine")} <ArrowIcon />
                    </Link>
                  </div>
                  <FamilyGrid items={items} />
                </div>
              ))
            : filtered.length > 0 && <FamilyGrid items={filtered} />}
        </div>
      </section>
    </>
  );
}

function FamilyGrid({ items }: { items: ProductFamily[] }) {
  // the first item is pulled out into its own full-width feature strip so
  // it can never leave a dangling hole in the grid below — a spanning cell
  // inside an auto-fill grid only tiles cleanly for specific item counts,
  // and this catalogue's group sizes are admin-controlled, so it can't
  // assume a count that divides evenly.
  const [lead, ...rest] = items;
  if (!lead) return null;
  return (
    <>
      <FeatureCard family={lead} />
      {rest.length > 0 && (
        <div className="cat2-grid">
          {rest.map((f) => <FamilyCard key={f.slug} family={f} />)}
        </div>
      )}
    </>
  );
}

function FeatureCard({ family: f }: { family: ProductFamily }) {
  return (
    <Link href={`/products/${f.category}/${f.slug}`} className="cat2-feature">
      <div className="cat2-feature__stage">
        <ProductStage3D
          variant="hero"
          src={familyImage(f)}
          alt={f.name}
          badge={f.series}
          photoKey={f.slug}
          eager
          sizes="(max-width: 900px) 90vw, 48vw"
        />
      </div>
      <div className="cat2-feature__body">
        <span className="cat2-card__series">{f.series}</span>
        <span className="cat2-feature__name">{f.name}</span>
        <span className="cat2-card__tag">{f.tagline}</span>
        <div className="cat2-card__models">
          {f.models.map((m) => <span key={m} className="chip">{m}</span>)}
        </div>
      </div>
    </Link>
  );
}

function FamilyCard({ family: f }: { family: ProductFamily }) {
  return (
    <Link href={`/products/${f.category}/${f.slug}`} className="cat2-card">
      <ProductStage3D
        variant="card"
        src={familyImage(f)}
        alt={f.name}
        photoKey={f.slug}
        eager
        sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
      />
      <div className="cat2-card__body">
        <span className="cat2-card__series">{f.series}</span>
        <span className="cat2-card__name">{f.name}</span>
        <span className="cat2-card__tag">{f.tagline}</span>
        <div className="cat2-card__models">
          {f.models.map((m) => <span key={m} className="chip">{m}</span>)}
        </div>
      </div>
    </Link>
  );
}
