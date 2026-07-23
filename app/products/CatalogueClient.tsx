"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { familyImage } from "@/lib/products";
import type { Category, ProductFamily } from "@/lib/products";

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

export default function CatalogueClient({
  categories,
  families,
}: {
  categories: Category[];
  families: ProductFamily[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return families.filter((f) => {
      if (activeCategory !== "all" && f.category !== activeCategory) return false;
      if (!q) return true;
      const haystack = [f.name, f.tagline, f.series, ...f.models].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [families, query, activeCategory]);

  const countFor = (slug: string | "all") =>
    slug === "all" ? families.length : families.filter((f) => f.category === slug).length;

  return (
    <>
      <header className="cat-hero">
        <div className="cat-hero__media" aria-hidden>
          <Image
            src="/machines/abcde-2200.png"
            alt=""
            fill
            sizes="46vw"
            priority
            style={{ inset: 0, margin: "auto", width: "90%", height: "78%", objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(15,23,42,0.15))" }}
          />
        </div>
        <div className="wrap">
          <p style={{ fontFamily: "var(--ff-mono)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-35)" }}>
            <Link href="/" style={{ color: "var(--ink-35)" }}>Home</Link> /&nbsp;
            <span style={{ color: "var(--ink)" }}>Catalogue</span>
          </p>
          <h1>Full catalogue.</h1>
          <p style={{ color: "var(--ink-35)", maxWidth: "52ch", marginTop: "1rem" }}>
            Every machine family, with full bilingual specification tables. Search
            by name or model, or filter by category.
          </p>

          <div className="cat-search">
            <span className="cat-search__icon"><SearchIcon /></span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search machines, models, keywords…"
              aria-label="Search catalogue"
              className="cat-search__input"
            />
            {query && (
              <button
                type="button"
                className="cat-search__clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <ClearIcon />
              </button>
            )}
          </div>

          <nav className="cat-filter" aria-label="Filter by category">
            <button
              type="button"
              className={`cat-filter__pill ${activeCategory === "all" ? "cat-filter__pill--active" : ""}`}
              onClick={() => setActiveCategory("all")}
            >
              All <span className="cat-filter__count">{countFor("all")}</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                type="button"
                className={`cat-filter__pill ${activeCategory === c.slug ? "cat-filter__pill--active" : ""}`}
                onClick={() => setActiveCategory(c.slug)}
              >
                {c.name} <span className="cat-filter__count">{countFor(c.slug)}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      <section style={{ background: "var(--bg-base)", padding: "clamp(3rem,6vw,5rem) 0" }}>
        <div className="wrap">
          <div className="cat-results-head">
            <span className="cat-results-count">
              {filtered.length} machine{filtered.length !== 1 ? "s" : ""}
              {query && <> matching “{query}”</>}
            </span>
          </div>

          {filtered.length > 0 ? (
            <div className="families-scroll">
              {filtered.map((f) => (
                <Link key={f.slug} href={`/products/${f.category}#${f.slug}`} className="fam-card">
                  <div className="machine-stage">
                    <Image
                      src={familyImage(f)}
                      alt={f.name}
                      fill
                      sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw"
                      loading="lazy"
                      style={{ inset: 0, margin: "auto", width: "88%", height: "86%", objectFit: "contain", filter: "drop-shadow(0 12px 22px rgba(15,23,42,0.12))" }}
                      className="machine-stage__img"
                    />
                  </div>
                  <div className="fam-card__body">
                    <span className="fam-card__series">{f.series}</span>
                    <span className="fam-card__name">{f.name}</span>
                    <span className="fam-card__tag">{f.tagline}</span>
                    <div className="fam-card__models">
                      {f.models.map((m) => <span key={m} className="chip">{m}</span>)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="cat-empty">
              <p>No machines match your search.</p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => { setQuery(""); setActiveCategory("all"); }}
              >
                Reset filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
