"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import TransitionLink from "@/components/TransitionLink";
import { latestArticles, type NewsArticle } from "@/lib/news";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_ELEMENT_DELAY } from "@/components/SectionReveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function getReadTime(excerpt: string) {
  const words = excerpt ? excerpt.split(" ").length : 30;
  const mins = Math.max(2, Math.ceil(words / 15));
  return `${mins} min read`;
}

export default function NewsStrip() {
  const t = useTranslations("newsStrip");
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isHoveredRef = useRef<boolean>(false);

  // Fetch news data
  useEffect(() => {
    let alive = true;
    fetch("/api/content/news")
      .then((r) => r.json())
      .then((j) => {
        if (alive && Array.isArray(j.articles) && j.articles.length > 0) {
          setArticles(j.articles);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Compute available unique categories
  const categories = useMemo(() => {
    if (!articles.length) return ["All"];
    const set = new Set<string>();
    articles.forEach((a) => {
      if (a.category) {
        if (a.category.toLowerCase().includes("product")) set.add("Product Launch");
        else if (a.category.toLowerCase().includes("tech")) set.add("Technical");
        else if (a.category.toLowerCase().includes("sustain") || a.category.toLowerCase().includes("recycl")) set.add("Sustainability");
        else if (a.category.toLowerCase().includes("event")) set.add("Events");
        else set.add(a.category);
      }
    });
    return ["All", ...Array.from(set).slice(0, 5)];
  }, [articles]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    if (!articles.length) return [];
    if (selectedCategory === "All") return articles.slice(0, 8);

    return articles
      .filter((a) => {
        const cat = (a.category || "").toLowerCase();
        const sel = selectedCategory.toLowerCase();
        if (sel === "product launch") return cat.includes("product");
        if (sel === "technical") return cat.includes("tech") || cat.includes("guide");
        if (sel === "sustainability") return cat.includes("sustain") || cat.includes("recycl");
        if (sel === "events") return cat.includes("event");
        return cat.includes(sel);
      })
      .slice(0, 8);
  }, [articles, selectedCategory]);

  // Auto-scroll loop for carousel mode
  useEffect(() => {
    if (viewMode !== "carousel" || !isPlaying || filteredArticles.length <= 1) return;

    const interval = setInterval(() => {
      if (!isHoveredRef.current) {
        setCurrentIndex((prev) => (prev + 1) % filteredArticles.length);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [viewMode, isPlaying, filteredArticles.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? filteredArticles.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredArticles.length);
  };

  useGSAP(
    () => {
      if (filteredArticles.length === 0) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
          once: true,
        },
        delay: SECTION_ELEMENT_DELAY,
      });

      if (eyebrowRef.current) {
        tl.fromTo(
          eyebrowRef.current,
          { opacity: 0, x: -20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          0
        );
      }

      if (headRef.current) {
        tl.fromTo(
          headRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          0.05
        );
      }

      if (trackRef.current) {
        tl.fromTo(
          trackRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          0.1
        );
      }
    },
    { scope: sectionRef, dependencies: [filteredArticles.length] }
  );

  return (
    <section
      ref={sectionRef}
      className="ns-section"
      aria-label="Latest Industry & Machinery News"
    >
      {/* Top accent border */}
      <div className="ns-accent-bar" />

      {/* Ambient lighting glow */}
      <div className="ns-ambient-glow" aria-hidden />

      <style suppressHydrationWarning>{`
        .ns-section {
          background: var(--bg-base);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: clamp(3.5rem, 6vw, 6rem) 0 clamp(4rem, 7vw, 6rem);
          position: relative;
          overflow: hidden;
        }

        .ns-accent-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--brand-red) 0%, var(--brand-teal) 100%);
        }

        .ns-ambient-glow {
          position: absolute; top: -100px; left: 50%; transform: translateX(-50%);
          width: 60%; height: 300px;
          background: radial-gradient(ellipse at 50% 0%, rgba(225,29,72,0.08) 0%, rgba(43,191,179,0.04) 50%, transparent 70%);
          pointer-events: none;
        }

        .ns-container {
          max-width: 1320px;
          margin: 0 auto;
          padding: 0 clamp(1.25rem, 4vw, 3rem);
        }

        /* Header layout */
        .ns-header-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1.5rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .ns-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--ff-mono);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--brand-red);
          margin-bottom: 0.6rem;
        }

        .ns-title {
          font-family: var(--ff-display);
          font-size: clamp(2.4rem, 5vw, 4.2rem);
          line-height: 0.96;
          color: var(--ink);
          letter-spacing: -0.01em;
          margin: 0;
        }

        .ns-title-em {
          color: var(--brand-red);
        }

        /* Category Filter Tabs & Toolbar */
        .ns-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2.2rem;
          padding-bottom: 1.2rem;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .ns-tabs {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .ns-tabs::-webkit-scrollbar { display: none; }

        .ns-tab-btn {
          font-family: var(--ff-mono);
          font-size: 0.75rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 0.45rem 0.9rem;
          border-radius: 20px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .ns-tab-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #ffffff;
          border-color: rgba(255,255,255,0.2);
        }
        .ns-tab-btn--active {
          background: var(--brand-red) !important;
          border-color: var(--brand-red) !important;
          color: #ffffff !important;
          font-weight: 600;
          box-shadow: 0 4px 14px rgba(225,29,72,0.35);
        }

        /* Controls: View Mode & Arrows */
        .ns-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .ns-mode-btn, .ns-nav-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          padding: 0 0.85rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.85);
          font-family: var(--ff-mono);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          gap: 0.4rem;
        }
        .ns-mode-btn:hover, .ns-nav-btn:hover {
          background: rgba(255,255,255,0.12);
          color: #ffffff;
          border-color: rgba(255,255,255,0.25);
        }
        .ns-nav-btn {
          width: 38px;
          padding: 0;
        }

        /* Carousel View Track */
        .ns-carousel-outer {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        .ns-carousel-track {
          display: flex;
          gap: 1.5rem;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform;
        }

        .ns-carousel-slide {
          flex: 0 0 calc(33.333% - 1rem);
          min-width: 300px;
        }
        @media (max-width: 1024px) {
          .ns-carousel-slide { flex: 0 0 calc(50% - 0.75rem); }
        }
        @media (max-width: 640px) {
          .ns-carousel-slide { flex: 0 0 100%; }
        }

        /* Grid View Layout */
        .ns-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        @media (max-width: 640px) {
          .ns-grid-layout { grid-template-columns: 1fr; }
        }

        /* Card Component Styling */
        .ns-card {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          overflow: hidden;
          text-decoration: none;
          position: relative;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      border-color 0.25s ease,
                      box-shadow 0.3s ease,
                      background 0.25s ease;
        }
        .ns-card:hover {
          transform: translateY(-6px);
          border-color: rgba(225, 29, 72, 0.4);
          background: rgba(255, 255, 255, 0.045);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35), 0 0 20px rgba(225, 29, 72, 0.1);
        }

        .ns-card-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: rgba(0, 0, 0, 0.2);
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ns-card-img {
          object-fit: cover;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ns-card:hover .ns-card-img {
          transform: scale(1.06);
        }

        .ns-card-cat-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          background: rgba(13, 34, 32, 0.82);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          font-family: var(--ff-mono);
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #2bbfb3;
          z-index: 2;
        }

        .ns-card-body {
          padding: 1.25rem 1.35rem 1.4rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .ns-card-meta {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.6rem;
          font-family: var(--ff-mono);
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .ns-card-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
        }

        .ns-card-title {
          font-family: var(--ff-body);
          font-size: clamp(1.02rem, 1.3vw, 1.15rem);
          font-weight: 600;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.95);
          margin: 0 0 0.6rem 0;
          transition: color 0.2s ease;
        }
        .ns-card:hover .ns-card-title {
          color: #ffffff;
        }

        .ns-card-excerpt {
          font-family: var(--ff-body);
          font-size: 0.82rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.65);
          margin: 0 0 1.1rem 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        .ns-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ns-card-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--ff-mono);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--brand-red);
          transition: transform 0.2s ease, color 0.2s ease;
        }
        .ns-card:hover .ns-card-cta {
          transform: translateX(4px);
          color: #ff3b5c;
        }

        .ns-footer-link-wrap {
          display: flex;
          justify-content: center;
          margin-top: 2.8rem;
        }
        .ns-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.8rem;
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.9);
          font-family: var(--ff-mono);
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .ns-all-link:hover {
          background: var(--brand-red);
          border-color: var(--brand-red);
          color: #ffffff;
          box-shadow: 0 8px 24px rgba(225,29,72,0.3);
          transform: translateY(-2px);
        }

        /* ── LIGHT MODE OVERRIDES ── */
        [data-theme="light"] .ns-section {
          background: var(--bg-base);
          border-top-color: rgba(13, 34, 32, 0.08);
        }
        [data-theme="light"] .ns-title {
          color: #0d2220;
        }
        [data-theme="light"] .ns-tab-btn {
          background: rgba(13, 34, 32, 0.05);
          border-color: rgba(13, 34, 32, 0.12);
          color: #0d2220;
        }
        [data-theme="light"] .ns-tab-btn:hover {
          background: rgba(13, 34, 32, 0.1);
          color: #0d2220;
        }
        [data-theme="light"] .ns-tab-btn--active {
          background: var(--brand-red) !important;
          color: #ffffff !important;
        }
        [data-theme="light"] .ns-mode-btn,
        [data-theme="light"] .ns-nav-btn {
          background: rgba(13, 34, 32, 0.05);
          border-color: rgba(13, 34, 32, 0.15);
          color: #0d2220;
        }
        [data-theme="light"] .ns-mode-btn:hover,
        [data-theme="light"] .ns-nav-btn:hover {
          background: rgba(13, 34, 32, 0.12);
          color: #0d2220;
        }
        [data-theme="light"] .ns-card {
          background: #ffffff;
          border-color: rgba(13, 34, 32, 0.12);
          box-shadow: 0 4px 16px rgba(13, 34, 32, 0.05);
        }
        [data-theme="light"] .ns-card:hover {
          border-color: var(--brand-red);
          box-shadow: 0 12px 32px rgba(13, 34, 32, 0.12);
        }
        [data-theme="light"] .ns-card-cat-badge {
          background: #ffffff;
          border-color: rgba(13, 34, 32, 0.15);
          color: #1fa39a;
        }
        [data-theme="light"] .ns-card-meta {
          color: rgba(13, 34, 32, 0.65);
        }
        [data-theme="light"] .ns-card-dot {
          background: rgba(13, 34, 32, 0.3);
        }
        [data-theme="light"] .ns-card-title {
          color: #0d2220;
        }
        [data-theme="light"] .ns-card:hover .ns-card-title {
          color: #e11d48;
        }
        [data-theme="light"] .ns-card-excerpt {
          color: rgba(13, 34, 32, 0.72);
        }
        [data-theme="light"] .ns-card-footer {
          border-top-color: rgba(13, 34, 32, 0.08);
        }
        [data-theme="light"] .ns-all-link {
          background: #ffffff;
          border-color: rgba(13, 34, 32, 0.18);
          color: #0d2220;
        }
        [data-theme="light"] .ns-all-link:hover {
          background: var(--brand-red);
          color: #ffffff;
        }
      `}</style>

      <div className="ns-container">
        {/* Title Header */}
        <div className="ns-header-row">
          <div>
            <span ref={eyebrowRef} className="ns-eyebrow">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <circle cx="5" cy="5" r="4" />
              </svg>
              {t("eyebrow")}
            </span>
            <div ref={headRef}>
              <h2 className="ns-title">
                {t("titleLine1")}{" "}
                <span className="ns-title-em">{t("titleEm")}</span>
              </h2>
            </div>
          </div>
        </div>

        {/* Toolbar & Category Filters */}
        <div className="ns-toolbar">
          {/* Categories */}
          <div className="ns-tabs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`ns-tab-btn${selectedCategory === cat ? " ns-tab-btn--active" : ""}`}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="ns-controls">
            {/* View toggle button */}
            <button
              type="button"
              className="ns-mode-btn"
              onClick={() => setViewMode(viewMode === "carousel" ? "grid" : "carousel")}
              title={viewMode === "carousel" ? "Switch to Grid View" : "Switch to Carousel View"}
            >
              {viewMode === "carousel" ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                  <span>Grid</span>
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                  <span>Slider</span>
                </>
              )}
            </button>

            {/* Play/Pause for carousel */}
            {viewMode === "carousel" && (
              <button
                type="button"
                className="ns-mode-btn"
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "Pause auto-scroll" : "Play auto-scroll"}
              >
                {isPlaying ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>Play</span>
                  </>
                )}
              </button>
            )}

            {/* Arrow Nav (only in carousel) */}
            {viewMode === "carousel" && (
              <>
                <button
                  type="button"
                  className="ns-nav-btn"
                  onClick={prevSlide}
                  aria-label="Previous article"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="ns-nav-btn"
                  onClick={nextSlide}
                  aria-label="Next article"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content Display: Carousel or Grid */}
        <div ref={trackRef}>
          {viewMode === "carousel" ? (
            <div
              className="ns-carousel-outer"
              onMouseEnter={() => { isHoveredRef.current = true; }}
              onMouseLeave={() => { isHoveredRef.current = false; }}
            >
              <div
                className="ns-carousel-track"
                style={{
                  transform: `translateX(-${currentIndex * (100 / Math.min(3, Math.max(1, filteredArticles.length)))}%)`,
                }}
              >
                {filteredArticles.map((article, idx) => (
                  <div key={`${article.slug}-${idx}`} className="ns-carousel-slide">
                    <ArticleCard article={article} readLabel={t("readArticle")} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="ns-grid-layout">
              {filteredArticles.map((article, idx) => (
                <ArticleCard key={`${article.slug}-${idx}`} article={article} readLabel={t("readArticle")} />
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="ns-footer-link-wrap">
          <TransitionLink href="/news" className="ns-all-link">
            {t("allNews")}
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article, readLabel }: { article: NewsArticle; readLabel: string }) {
  return (
    <TransitionLink href={`/news/${article.slug}`} className="ns-card">
      <div className="ns-card-img-wrap">
        <Image
          src={article.image || "/machines/s-standard.png"}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
          className="ns-card-img"
        />
        <span className="ns-card-cat-badge">{article.category || "News"}</span>
      </div>

      <div className="ns-card-body">
        <div className="ns-card-meta">
          <span>{fmtDate(article.date)}</span>
          <span className="ns-card-dot" />
          <span>{getReadTime(article.excerpt)}</span>
        </div>

        <h3 className="ns-card-title">{article.title}</h3>
        <p className="ns-card-excerpt">{article.excerpt}</p>

        <div className="ns-card-footer">
          <span className="ns-card-cta">{readLabel}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--brand-red)" }}>
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </TransitionLink>
  );
}

