"use client";

import { useState, useMemo } from "react";
import TransitionLink from "@/components/TransitionLink";
import type { Category, ProductFamily } from "@/lib/products";
import { CATEGORY_ORDER } from "@/lib/productSeo";

const GROUP_LABEL: Record<string, string> = {
  "film-blowing": "Film Blowing",
  "bag-making": "Bag Making",
  "recycling": "Recycling",
  "printing": "Flexographic Printing",
};

const GROUP_DESC: Record<string, string> = {
  "film-blowing": "Multi-layer co-extrusion & high-output blown film extrusion lines.",
  "bag-making": "High-speed heat seal, bottom seal, T-shirt & roll bag conversion systems.",
  "recycling": "Industrial plastic scrap pelletizing & reclaiming extrusion systems.",
  "printing": "High-precision 2, 4, 6 and 8-color CI central impression flexographic presses.",
};

export default function AllModelsIndex({
  categories,
  families,
}: {
  categories: Category[];
  families: ProductFamily[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const order = useMemo(
    () => [
      ...CATEGORY_ORDER,
      ...categories
        .map((c) => c.slug)
        .filter((s) => !(CATEGORY_ORDER as readonly string[]).includes(s)),
    ],
    [categories]
  );

  const groups = useMemo(
    () =>
      order
        .map((slug) => ({
          slug,
          label: GROUP_LABEL[slug] ?? categories.find((c) => c.slug === slug)?.name ?? slug,
          desc: GROUP_DESC[slug] ?? "High-performance industrial machinery.",
          fams: families.filter((f) => f.category === slug),
        }))
        .filter((g) => g.fams.length > 0),
    [order, categories, families]
  );

  const totalModels = families.length;

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return groups
      .filter((g) => activeCategory === "all" || g.slug === activeCategory)
      .map((g) => {
        if (!q) return g;
        const matchingFams = g.fams.filter((f) => {
          const name = (f.name || "").toLowerCase();
          const h1 = (f.seo?.h1 || "").toLowerCase();
          const series = (f.series || "").toLowerCase();
          const tagline = (f.tagline || "").toLowerCase();
          const slug = (f.slug || "").toLowerCase();
          return (
            name.includes(q) ||
            h1.includes(q) ||
            series.includes(q) ||
            tagline.includes(q) ||
            slug.includes(q)
          );
        });
        return { ...g, fams: matchingFams };
      })
      .filter((g) => g.fams.length > 0);
  }, [groups, activeCategory, searchQuery]);

  const visibleCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.fams.length, 0);
  }, [filteredGroups]);

  const handleChipClick = (slug: string) => {
    if (!isOpen) {
      setIsOpen(true);
    }
    setActiveCategory(slug);
  };

  return (
    <section className="ami" aria-labelledby="ami-heading">
      <style>{`
        .ami {
          --ami-bg: var(--bg-surface);
          --ami-card-bg: var(--bg-raise);
          --ami-card-hover: rgba(43, 191, 179, 0.07);
          --ami-border: var(--bg-line);
          --ami-text: var(--ink);
          --ami-muted: var(--ink-60);
          --ami-subtle: var(--ink-35);
          background: var(--ami-bg);
          border-top: 1px solid var(--ami-border);
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        [data-theme="light"] .ami {
          --ami-bg: #f8fbfa;
          --ami-card-bg: #ffffff;
          --ami-card-hover: rgba(43, 191, 179, 0.08);
          --ami-border: rgba(13, 34, 32, 0.12);
          --ami-text: #0d2220;
          --ami-muted: rgba(13, 34, 32, 0.78);
          --ami-subtle: rgba(13, 34, 32, 0.52);
        }

        .ami__wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: clamp(2rem, 4vw, 3.5rem) clamp(1.25rem, 4vw, 3rem);
        }

        /* ── Header banner card ── */
        .ami__banner {
          background: var(--ami-card-bg);
          border: 1px solid var(--ami-border);
          border-radius: var(--radius-md);
          padding: clamp(1.5rem, 3vw, 2.25rem);
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.15);
          position: relative;
          overflow: hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .ami__banner:hover {
          border-color: rgba(43, 191, 179, 0.35);
        }

        .ami__top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .ami__eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--ff-mono);
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--brand-teal);
          font-weight: 600;
        }

        .ami__pulse-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--brand-teal);
          box-shadow: 0 0 10px var(--brand-teal);
          animation: amiPulse 2s infinite ease-in-out;
        }

        @keyframes amiPulse {
          0%, 100% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        .ami__stat-badge {
          display: inline-flex;
          align-items: center;
          font-family: var(--ff-mono);
          font-size: 0.72rem;
          color: var(--ami-subtle);
          background: var(--ami-bg);
          padding: 0.25rem 0.65rem;
          border-radius: 999px;
          border: 1px solid var(--ami-border);
        }

        .ami__main-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.25rem;
        }

        .ami h2 {
          font-family: var(--ff-display);
          font-size: clamp(2rem, 3.8vw, 3rem);
          color: var(--ami-text);
          line-height: 1;
          margin: 0 0 0.5rem;
          letter-spacing: 0.02em;
        }

        .ami__lead {
          font-family: var(--ff-body);
          font-size: clamp(0.9rem, 1.4vw, 1rem);
          color: var(--ami-muted);
          line-height: 1.5;
          margin: 0;
          max-width: 640px;
        }

        .ami__toggle-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          background: var(--brand-teal);
          color: #080e0d;
          font-family: var(--ff-mono);
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 0.85rem 1.4rem;
          border-radius: var(--radius-sm);
          border: none;
          cursor: pointer;
          transition: transform 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 14px rgba(43, 191, 179, 0.25);
          white-space: nowrap;
        }

        .ami__toggle-btn:hover {
          background: var(--brand-teal-dk);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(43, 191, 179, 0.35);
        }

        .ami__toggle-btn:active {
          transform: translateY(0);
        }

        .ami__chevron {
          width: 16px;
          height: 16px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ami__toggle-btn.is-open .ami__chevron {
          transform: rotate(180deg);
        }

        /* ── Category quick pills ── */
        .ami__chips-bar {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--ami-border);
        }

        .ami__chips-label {
          font-family: var(--ff-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ami-subtle);
          margin-right: 0.25rem;
        }

        .ami__chip {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: var(--ami-bg);
          border: 1px solid var(--ami-border);
          border-radius: 999px;
          padding: 0.35rem 0.75rem;
          color: var(--ami-muted);
          font-family: var(--ff-body);
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .ami__chip:hover {
          border-color: var(--brand-teal);
          color: var(--ami-text);
          background: rgba(43, 191, 179, 0.08);
          transform: translateY(-1px);
        }

        .ami__chip-count {
          font-family: var(--ff-mono);
          font-size: 0.72rem;
          color: var(--brand-teal);
          font-weight: 600;
        }

        /* ── Collapsible Body (Smooth Grid Animation & SSR SEO Safe) ── */
        .ami__body-collapse {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ami__body-collapse.is-open {
          grid-template-rows: 1fr;
        }

        .ami__body-inner {
          overflow: hidden;
          min-height: 0;
          visibility: hidden;
          opacity: 0;
          transition: opacity 0.25s ease, visibility 0.25s ease;
        }

        .ami__body-collapse.is-open .ami__body-inner {
          visibility: visible;
          opacity: 1;
        }

        .ami__directory-content {
          padding-top: 2rem;
        }

        /* ── Controls: Tabs & Search ── */
        .ami__controls-box {
          background: var(--ami-card-bg);
          border: 1px solid var(--ami-border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .ami__tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .ami__tab-btn {
          font-family: var(--ff-mono);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          padding: 0.5rem 0.85rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--ami-border);
          background: var(--ami-bg);
          color: var(--ami-muted);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .ami__tab-btn:hover {
          border-color: var(--brand-teal);
          color: var(--ami-text);
        }

        .ami__tab-btn.is-active {
          background: var(--brand-teal);
          color: #080e0d;
          border-color: var(--brand-teal);
          font-weight: 700;
        }

        .ami__search-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
        }

        .ami__search-icon {
          position: absolute;
          left: 0.85rem;
          width: 16px;
          height: 16px;
          color: var(--ami-subtle);
          pointer-events: none;
        }

        .ami__search-input {
          width: 100%;
          background: var(--ami-bg);
          border: 1px solid var(--ami-border);
          border-radius: var(--radius-sm);
          padding: 0.7rem 2.4rem 0.7rem 2.4rem;
          font-family: var(--ff-body);
          font-size: 0.88rem;
          color: var(--ami-text);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .ami__search-input:focus {
          border-color: var(--brand-teal);
          box-shadow: 0 0 0 3px rgba(43, 191, 179, 0.15);
        }

        .ami__search-input::placeholder {
          color: var(--ami-subtle);
        }

        .ami__clear-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--ami-subtle);
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          padding: 0.25rem;
        }

        .ami__clear-btn:hover {
          color: var(--ami-text);
        }

        .ami__filter-status {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: var(--ff-mono);
          font-size: 0.72rem;
          color: var(--ami-subtle);
        }

        /* ── Categorized List Layout ── */
        .ami__category-section {
          margin-bottom: 2.5rem;
        }

        .ami__category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--ami-border);
          margin-bottom: 1rem;
        }

        .ami__category-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .ami__category-title {
          font-family: var(--ff-display);
          font-size: 1.45rem;
          letter-spacing: 0.05em;
          color: var(--ami-text);
          margin: 0;
        }

        .ami__category-badge {
          font-family: var(--ff-mono);
          font-size: 0.68rem;
          background: rgba(43, 191, 179, 0.12);
          color: var(--brand-teal);
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          border: 1px solid rgba(43, 191, 179, 0.25);
          font-weight: 600;
        }

        .ami__category-link {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-family: var(--ff-mono);
          font-size: 0.75rem;
          letter-spacing: 0.04em;
          color: var(--brand-teal);
          text-decoration: none;
          transition: color 0.15s ease, transform 0.15s ease;
        }

        .ami__category-link:hover {
          color: var(--brand-teal-dk);
          transform: translateX(2px);
        }

        /* ── Model List Rows (Balanced & Clean Grid) ── */
        .ami__list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.65rem;
        }

        @media (min-width: 860px) {
          .ami__list {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
        }

        .ami__item {
          display: flex;
        }

        .ami__item-link {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          background: var(--ami-card-bg);
          border: 1px solid var(--ami-border);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1.15rem;
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ami__item-link:hover {
          background: var(--ami-card-hover);
          border-color: var(--brand-teal);
          transform: translateX(3px);
          box-shadow: 0 4px 16px -4px rgba(43, 191, 179, 0.2);
        }

        .ami__item-left {
          display: flex;
          align-items: baseline;
          gap: 0.85rem;
          min-width: 0;
        }

        .ami__item-num {
          font-family: var(--ff-mono);
          font-size: 0.72rem;
          color: var(--brand-teal);
          font-weight: 600;
          flex-shrink: 0;
        }

        .ami__item-info {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          min-width: 0;
        }

        .ami__item-name {
          font-family: var(--ff-body);
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--ami-text);
          line-height: 1.35;
          word-break: break-word;
        }

        .ami__item-tagline {
          font-family: var(--ff-body);
          font-size: 0.75rem;
          color: var(--ami-subtle);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ami__item-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .ami__item-action {
          font-family: var(--ff-mono);
          font-size: 0.68rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ami-subtle);
          display: none;
        }

        @media (min-width: 520px) {
          .ami__item-action {
            display: inline;
          }
        }

        .ami__item-link:hover .ami__item-action {
          color: var(--brand-teal);
        }

        .ami__item-arrow {
          color: var(--brand-teal);
          transition: transform 0.2s ease;
        }

        .ami__item-link:hover .ami__item-arrow {
          transform: translateX(4px);
        }

        /* ── Empty search state ── */
        .ami__empty {
          text-align: center;
          padding: 3rem 1rem;
          background: var(--ami-card-bg);
          border: 1px dashed var(--ami-border);
          border-radius: var(--radius-md);
        }

        .ami__empty-text {
          font-family: var(--ff-body);
          font-size: 0.95rem;
          color: var(--ami-muted);
          margin-bottom: 1rem;
        }

        .ami__reset-btn {
          font-family: var(--ff-mono);
          font-size: 0.75rem;
          color: var(--brand-teal);
          background: rgba(43, 191, 179, 0.1);
          border: 1px solid var(--brand-teal);
          border-radius: var(--radius-sm);
          padding: 0.4rem 0.9rem;
          cursor: pointer;
        }

        /* ── Bottom collapse bar ── */
        .ami__bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 1.25rem;
          background: var(--ami-card-bg);
          border: 1px solid var(--ami-border);
          border-radius: var(--radius-md);
          margin-top: 1rem;
        }

        .ami__bottom-note {
          font-family: var(--ff-body);
          font-size: 0.82rem;
          color: var(--ami-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .ami__bottom-collapse-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--ami-bg);
          border: 1px solid var(--ami-border);
          color: var(--ami-text);
          font-family: var(--ff-mono);
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.55rem 1rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .ami__bottom-collapse-btn:hover {
          border-color: var(--brand-teal);
          color: var(--brand-teal);
        }
      `}</style>

      <div className="ami__wrap">
        {/* ── Summary / Collapsible Banner Card ── */}
        <div className="ami__banner">
          <div className="ami__top-row">
            <span className="ami__eyebrow">
              <span className="ami__pulse-dot" />
              Complete Machinery Directory
            </span>
            <span className="ami__stat-badge">
              {totalModels} Models · {groups.length} Production Sectors
            </span>
          </div>

          <div className="ami__main-row">
            <div>
              <h2 id="ami-heading">All machine models</h2>
              <p className="ami__lead">
                Explore our full engineering catalogue of industrial blown film lines, high-speed bag making
                converters, recycling extruders, and central impression flexographic presses.
              </p>
            </div>

            <button
              type="button"
              className={`ami__toggle-btn ${isOpen ? "is-open" : ""}`}
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="ami-directory-content"
            >
              <span>{isOpen ? "Collapse Directory" : `Browse All ${totalModels} Models`}</span>
              <svg
                className="ami__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          </div>

          {/* ── Quick category chips ── */}
          <div className="ami__chips-bar">
            <span className="ami__chips-label">Quick Sectors:</span>
            {groups.map((g) => (
              <button
                key={g.slug}
                type="button"
                className="ami__chip"
                onClick={() => handleChipClick(g.slug)}
                title={`Filter to ${g.label}`}
              >
                <span>{g.label}</span>
                <span className="ami__chip-count">({g.fams.length})</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Collapsible Body (Rendered in DOM for SEO Crawlers) ── */}
        <div
          id="ami-directory-content"
          className={`ami__body-collapse ${isOpen ? "is-open" : ""}`}
          aria-hidden={!isOpen}
        >
          <div className="ami__body-inner">
            <div className="ami__directory-content">
              {/* ── Filter & Search Bar ── */}
              <div className="ami__controls-box">
                <div className="ami__tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeCategory === "all"}
                    className={`ami__tab-btn ${activeCategory === "all" ? "is-active" : ""}`}
                    onClick={() => setActiveCategory("all")}
                  >
                    All Models ({totalModels})
                  </button>
                  {groups.map((g) => (
                    <button
                      key={g.slug}
                      type="button"
                      role="tab"
                      aria-selected={activeCategory === g.slug}
                      className={`ami__tab-btn ${activeCategory === g.slug ? "is-active" : ""}`}
                      onClick={() => setActiveCategory(g.slug)}
                    >
                      {g.label} ({g.fams.length})
                    </button>
                  ))}
                </div>

                <div className="ami__search-row">
                  <svg
                    className="ami__search-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    className="ami__search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by machine model, width, or series (e.g. ABCDE, AI CX-260, 2200, blown film)..."
                    aria-label="Search machine models"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="ami__clear-btn"
                      onClick={() => setSearchQuery("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="ami__filter-status">
                  <span>
                    Showing {visibleCount} of {totalModels} models
                    {searchQuery ? ` matching "${searchQuery}"` : ""}
                  </span>
                  {activeCategory !== "all" && (
                    <button
                      type="button"
                      onClick={() => setActiveCategory("all")}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--brand-teal)",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        fontFamily: "var(--ff-mono)",
                        textDecoration: "underline",
                      }}
                    >
                      Show all sectors
                    </button>
                  )}
                </div>
              </div>

              {/* ── Render List of Machine Models ── */}
              {filteredGroups.length === 0 ? (
                <div className="ami__empty">
                  <p className="ami__empty-text">
                    No machine models found matching &quot;{searchQuery}&quot;.
                  </p>
                  <button
                    type="button"
                    className="ami__reset-btn"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                  >
                    Reset Search & Filters
                  </button>
                </div>
              ) : (
                filteredGroups.map((g) => (
                  <div key={g.slug} className="ami__category-section">
                    <div className="ami__category-header">
                      <div className="ami__category-title-wrap">
                        <h3 className="ami__category-title">{g.label}</h3>
                        <span className="ami__category-badge">{g.fams.length} Models</span>
                      </div>
                      <TransitionLink
                        href={`/products/${g.slug}`}
                        className="ami__category-link"
                      >
                        <span>Explore {g.label} Hub</span>
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </TransitionLink>
                    </div>

                    <ul className="ami__list" role="list">
                      {g.fams.map((f, idx) => (
                        <li key={f.slug} className="ami__item">
                          <TransitionLink
                            href={`/products/${f.category}/${f.slug}`}
                            prefetch={false}
                            className="ami__item-link"
                          >
                            <div className="ami__item-left">
                              <span className="ami__item-num">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                              <div className="ami__item-info">
                                <span className="ami__item-name">
                                  {f.seo?.h1 ?? f.name}
                                </span>
                                {f.tagline && (
                                  <span className="ami__item-tagline">
                                    {f.tagline}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="ami__item-right">
                              <span className="ami__item-action">Specs &amp; Quote</span>
                              <svg
                                className="ami__item-arrow"
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </div>
                          </TransitionLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}

              {/* ── Bottom Collapse Action Bar ── */}
              <div className="ami__bottom-bar">
                <span className="ami__bottom-note">
                  Direct factory supply with CE certification, warranty, and worldwide commissioning.
                </span>
                <button
                  type="button"
                  className="ami__bottom-collapse-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                  <span>Collapse Directory</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
