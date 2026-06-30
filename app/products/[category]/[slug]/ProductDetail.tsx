"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import type { ProductFamily, Category } from "@/lib/products";

interface Props {
  family: ProductFamily;
  category: Category;
  related: ProductFamily[];
}

/* ── static testimonials ── */
const TESTIMONIALS = [
  {
    name: "Mark Hamill",
    title: "Production Director, PackTech GmbH",
    rating: 5,
    text: "The ABC multi-layer line exceeded our output targets from week one. Registration accuracy is exactly as spec'd — we've had zero downtime in six months.",
  },
  {
    name: "Liu Wei",
    title: "Plant Manager, SinoFilm Co.",
    rating: 5,
    text: "After-sales support is what sets Ashal Innomach apart. Engineers responded within the hour and resolved our screw alignment issue remotely.",
  },
  {
    name: "Ahmed Al-Rashid",
    title: "CEO, Gulf Packaging Industries",
    rating: 5,
    text: "We ordered two lines simultaneously. Both arrived on schedule, commissioning was smooth, and film quality is consistent across both units.",
  },
];

/* ── YouTube video IDs per category (placeholder) ── */
const CATEGORY_VIDEOS: Record<string, { id: string; title: string }[]> = {
  "film-blowing": [
    { id: "dQw4w9WgXcQ", title: "ABC Multi-layer Film Blowing Line — Live Run" },
    { id: "dQw4w9WgXcQ", title: "Five-Layer Co-extrusion Setup Walkthrough" },
  ],
  "bag-making": [
    { id: "dQw4w9WgXcQ", title: "T-PRO Heat-Seal Converter — 300 pcs/min" },
    { id: "dQw4w9WgXcQ", title: "Vest Bag Machine Production Demo" },
  ],
  "recycling": [
    { id: "dQw4w9WgXcQ", title: "CX Pelletizing Line — Edge Trim Recovery" },
  ],
  "printing": [
    { id: "dQw4w9WgXcQ", title: "AI-8C Flexo Press — 350 m/min Production Run" },
    { id: "dQw4w9WgXcQ", title: "8-Colour Registration Demonstration" },
  ],
};

/* ── extract top specs for the panel ── */
const PANEL_SPEC_KEYS: Record<string, string[]> = {
  "film-blowing": ["Film Width", "Max Extrusion Output", "Total Power", "Screw Diameter", "Roller Width"],
  "bag-making":   ["Max Bag Width", "Bag Making Speed", "Total Power", "Film Thickness", "Dimension / Weight"],
  "recycling":    ["Max Extrusion Output", "Screw Diameter", "Main Motor", "Dimension / Weight"],
  "printing":     ["Max Web Width", "Max Mechanical Speed", "Registration Accuracy", "Drive System", "Anilox Roller"],
};

function StarRating({ n }: { n: number }) {
  return (
    <span className="pdv2-stars" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 16 16" width="14" height="14" fill={i < n ? "var(--brand-teal)" : "none"} stroke="var(--brand-teal)" strokeWidth="1.2">
          <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.2-.8z" />
        </svg>
      ))}
    </span>
  );
}

function InquiryButton({ slug, name }: { slug: string; name: string }) {
  const href = `/contact?machine=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
  return (
    <AetherBtn>
      <TransitionLink href={href}>Request a Quote →</TransitionLink>
    </AetherBtn>
  );
}

export default function ProductDetail({ family, category, related }: Props) {
  const [activeModel,  setActiveModel]  = useState(0);
  const [activeThumb,  setActiveThumb]  = useState(0);
  const [activeVideo,  setActiveVideo]  = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [reviewIdx,    setReviewIdx]    = useState(0);

  const videos   = CATEGORY_VIDEOS[family.category] ?? CATEGORY_VIDEOS["film-blowing"];
  const specKeys = PANEL_SPEC_KEYS[family.category]  ?? PANEL_SPEC_KEYS["film-blowing"];
  const hasModels = family.models.length > 1;
  const materials = family.materials?.split(",").map(s => s.trim()) ?? [];

  /* thumbnail list — main image + related angles (reuse same image for demo) */
  const thumbs = [
    `/machines/${family.slug}.png`,
    `/machines/${family.slug}.png`,
    `/machines/${family.slug}.png`,
  ];

  /* panel specs for active model */
  const panelSpecs = specKeys.flatMap(key => {
    const row = family.specs.find(s => s.label === key || s.label.startsWith(key.split(" ")[0]));
    if (!row) return [];
    return [{ label: row.label, value: row.values[Math.min(activeModel, row.values.length - 1)] }];
  });

  /* entrance animation */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const els = rootRef.current.querySelectorAll<HTMLElement>("[data-reveal]");
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(22px)";
      el.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i*0.08}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i*0.08}s`;
    });
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      els.forEach(el => { el.style.opacity = "1"; el.style.transform = "none"; });
    }));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pdv2" ref={rootRef}>

      {/* ══════════════════════════════════════════════════
          HERO — breadcrumb + two-col (gallery | panel)
      ══════════════════════════════════════════════════ */}
      <section className="pdv2-hero">
        {/* grid bg */}
        <div className="pdv2-hero__grid" aria-hidden="true" />

        <div className="pdv2-wrap">

          {/* breadcrumb */}
          <nav className="pdv2-crumb" aria-label="Breadcrumb" data-reveal>
            <Link href="/">Home</Link>
            <span>›</span>
            <Link href="/products">Catalogue</Link>
            <span>›</span>
            <Link href={`/products/${category.slug}`}>{category.name}</Link>
            <span>›</span>
            <span className="pdv2-crumb__cur">{family.series}</span>
          </nav>

          {/* ── TITLE BLOCK — above columns ── */}
          <div className="pdv2-title-block" data-reveal>
            <p className="pdv2-title-block__cat">{category.tagline}</p>
            <h1 className="pdv2-title-block__h1">{family.name}</h1>
            <p className="pdv2-title-block__tagline">{family.tagline}</p>
          </div>

          <div className="pdv2-hero__cols">

            {/* ── LEFT: thumbnail strip + main image ── */}
            <div className="pdv2-gallery" data-reveal>
              {/* thumbnail strip */}
              <div className="pdv2-thumbs">
                {thumbs.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <button
                    key={i}
                    className={`pdv2-thumb${activeThumb === i ? " pdv2-thumb--active" : ""}`}
                    onClick={() => setActiveThumb(i)}
                    aria-label={`View image ${i + 1}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>

              {/* main image */}
              <div className="pdv2-main-img">
                <div className="pdv2-main-img__teal-bar" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbs[activeThumb]}
                  alt={family.name}
                  key={activeThumb}
                />
                {/* series badge */}
                <span className="pdv2-main-img__badge">{family.series}</span>
              </div>
            </div>

            {/* ── RIGHT: info card ── */}
            <div className="pdv2-info-card" data-reveal>

              {/* model selector */}
              {hasModels && (
                <div className="pdv2-model-strip" role="group" aria-label="Select model">
                  <span className="pdv2-model-strip__label">Model</span>
                  <div className="pdv2-model-strip__chips">
                    {family.models.map((m, i) => (
                      <button
                        key={m}
                        className={`pdv2-mchip${activeModel === i ? " pdv2-mchip--on" : ""}`}
                        onClick={() => setActiveModel(i)}
                        aria-pressed={activeModel === i}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* key spec table */}
              <div className="pdv2-spec-panel">
                <div className="pdv2-spec-panel__head">
                  <span>Specification</span>
                  <span>{hasModels ? family.models[activeModel] : family.models[0]}</span>
                </div>
                {panelSpecs.map(s => (
                  <div key={s.label} className="pdv2-spec-row">
                    <span className="pdv2-spec-row__label">{s.label}</span>
                    <span className="pdv2-spec-row__val">{s.value}</span>
                  </div>
                ))}
              </div>

              {/* materials */}
              {materials.length > 0 && (
                <div className="pdv2-mats">
                  <span className="pdv2-mats__label">Substrates</span>
                  <div className="pdv2-mats__tags">
                    {materials.map(m => <span key={m} className="pdv2-mat-tag">{m}</span>)}
                  </div>
                </div>
              )}

              {/* CTAs */}
              <div className="pdv2-panel__ctas">
                <InquiryButton slug={family.slug} name={family.name} />
                <Link href={`/products/${category.slug}`} className="pdv2-back-btn">
                  ← {category.name}
                </Link>
              </div>

              {/* trust row */}
              <div className="pdv2-trust-row">
                <div className="pdv2-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>ISO Certified</span>
                </div>
                <div className="pdv2-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Ships Worldwide</span>
                </div>
                <div className="pdv2-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>24 h Support</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FULL SPEC TABLE
      ══════════════════════════════════════════════════ */}
      <section className="pdv2-specs-section" aria-label="Full specifications">
        <div className="pdv2-wrap">
          <div className="pdv2-section-head" data-reveal>
            <span className="pdv2-section-head__line" />
            <h2>Full <em>Specifications</em></h2>
            {hasModels && <span className="pdv2-section-head__note">Click a column to highlight</span>}
          </div>

          <div className="pdv2-table-wrap" data-reveal>
            <table className="pdv2-table">
              <thead>
                <tr>
                  <th>Specification</th>
                  {family.models.map((m, i) => (
                    <th
                      key={m}
                      className={hasModels && i === activeModel ? "pdv2-col--on" : ""}
                      onClick={() => hasModels && setActiveModel(i)}
                      style={hasModels ? { cursor: "pointer" } : undefined}
                    >{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {family.specs.map(row => (
                  <tr key={row.label}>
                    <td className="pdv2-table__label">{row.label}</td>
                    {row.values.map((v, i) => (
                      <td key={i} className={hasModels ? i === activeModel ? "pdv2-col--on" : "pdv2-col--dim" : ""}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          VIDEO SECTION
      ══════════════════════════════════════════════════ */}
      <section className="pdv2-video-section" aria-label="Product videos">
        <div className="pdv2-wrap">
          <div className="pdv2-section-head" data-reveal>
            <span className="pdv2-section-head__line" />
            <h2>See it <em>in Action</em></h2>
          </div>

          <div className="pdv2-video-layout" data-reveal>
            {/* main video */}
            <div className="pdv2-video-main">
              {!videoPlaying ? (
                <button
                  className="pdv2-video-poster"
                  onClick={() => setVideoPlaying(true)}
                  aria-label="Play video"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${videos[activeVideo].id}/maxresdefault.jpg`}
                    alt={videos[activeVideo].title}
                    className="pdv2-video-poster__img"
                  />
                  <div className="pdv2-video-poster__overlay" />
                  <div className="pdv2-play-btn" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <div className="pdv2-video-poster__meta">
                    <span className="pdv2-video-poster__tag">Production Demo</span>
                    <span className="pdv2-video-poster__title">{videos[activeVideo].title}</span>
                  </div>
                </button>
              ) : (
                <div className="pdv2-video-frame">
                  <iframe
                    src={`https://www.youtube.com/embed/${videos[activeVideo].id}?autoplay=1&rel=0`}
                    title={videos[activeVideo].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* video list */}
            {videos.length > 1 && (
              <div className="pdv2-video-list">
                {videos.map((v, i) => (
                  <button
                    key={i}
                    className={`pdv2-vlist-item${activeVideo === i ? " pdv2-vlist-item--on" : ""}`}
                    onClick={() => { setActiveVideo(i); setVideoPlaying(false); }}
                  >
                    <div className="pdv2-vlist-thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt="" />
                      <div className="pdv2-vlist-play">
                        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M5 3.5l8 4.5-8 4.5z"/></svg>
                      </div>
                    </div>
                    <span className="pdv2-vlist-title">{v.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="pdv2-reviews" aria-label="Customer reviews">
        <div className="pdv2-reviews__bg" aria-hidden="true" />
        <div className="pdv2-wrap pdv2-reviews__inner">

          {/* left — overall rating */}
          <div className="pdv2-rating-block" data-reveal>
            <div className="pdv2-rating-block__score">4.8</div>
            <div className="pdv2-rating-block__stars"><StarRating n={5} /></div>
            <p className="pdv2-rating-block__label">Overall Rating</p>
            <p className="pdv2-rating-block__sub">Based on verified buyer reviews</p>
            <div className="pdv2-rating-bars">
              {[5,4,3,2,1].map((s, i) => (
                <div key={s} className="pdv2-rating-bar">
                  <span>{s}</span>
                  <div className="pdv2-rating-bar__track">
                    <div className="pdv2-rating-bar__fill" style={{ width: `${[92,5,2,1,0][i]}%` }} />
                  </div>
                  <span className="pdv2-rating-bar__pct">{[92,5,2,1,0][i]}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* right — review carousel */}
          <div className="pdv2-review-carousel" data-reveal>
            <h2 className="pdv2-reviews__h2">What our customers<br/><em>think about us?</em></h2>

            <div className="pdv2-review-card">
              <div className="pdv2-review-card__quote">"</div>
              <p className="pdv2-review-card__text">{TESTIMONIALS[reviewIdx].text}</p>
              <div className="pdv2-review-card__author">
                <div className="pdv2-review-card__avatar" aria-hidden="true">
                  {TESTIMONIALS[reviewIdx].name.charAt(0)}
                </div>
                <div>
                  <strong className="pdv2-review-card__name">{TESTIMONIALS[reviewIdx].name}</strong>
                  <span className="pdv2-review-card__title">{TESTIMONIALS[reviewIdx].title}</span>
                </div>
                <div className="pdv2-review-card__stars"><StarRating n={TESTIMONIALS[reviewIdx].rating} /></div>
              </div>
            </div>

            <div className="pdv2-review-nav">
              <button
                className="pdv2-review-nav__btn"
                onClick={() => setReviewIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                aria-label="Previous review"
              >←</button>
              <span className="pdv2-review-nav__count">{reviewIdx + 1} / {TESTIMONIALS.length}</span>
              <button
                className="pdv2-review-nav__btn pdv2-review-nav__btn--next"
                onClick={() => setReviewIdx(i => (i + 1) % TESTIMONIALS.length)}
                aria-label="Next review"
              >→</button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          RELATED MACHINES
      ══════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="pdv2-related" aria-label="Related machines">
          <div className="pdv2-wrap">
            <div className="pdv2-section-head" data-reveal>
              <span className="pdv2-section-head__line" />
              <h2>Related <em>Machines</em></h2>
              <Link href={`/products/${category.slug}`} className="pdv2-section-head__link">
                View all →
              </Link>
            </div>
            <div className="pdv2-related-grid" data-reveal>
              {related.map(r => (
                <Link key={r.slug} href={`/products/${r.category}/${r.slug}`} className="pdv2-rel-card">
                  <div className="pdv2-rel-card__img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/machines/${r.slug}.png`} alt={r.name} loading="lazy" />
                  </div>
                  <div className="pdv2-rel-card__body">
                    <span className="pdv2-rel-card__series">{r.series}</span>
                    <span className="pdv2-rel-card__name">{r.name.length > 48 ? r.name.slice(0,48)+"…" : r.name}</span>
                    <span className="pdv2-rel-card__cta">View Details →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          NEWSLETTER / CTA BAND
      ══════════════════════════════════════════════════ */}
      <section className="pdv2-cta-band" aria-label="Get in touch">
        <div className="pdv2-cta-band__img-side" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/machines/bag-samples.png" alt="" />
          <div className="pdv2-cta-band__img-overlay" />
          <div className="pdv2-cta-band__img-text">
            <p>Be up to date with the latest<br/>news about Ashal Innomach</p>
          </div>
        </div>
        <div className="pdv2-cta-band__form-side">
          <span className="pdv2-cta-band__eyebrow">Contact</span>
          <h2 className="pdv2-cta-band__h2">
            Need a <em>custom</em> configuration?
          </h2>
          <p className="pdv2-cta-band__sub">
            Don't know how to specify your requirements?<br/>
            Call us: <a href="tel:+8657788888888">+86 577 8888 8888</a>
          </p>
          <div className="pdv2-cta-band__actions">
            <InquiryButton slug={family.slug} name={family.name} />
            <Link href="/contact" className="pdv2-ghost-btn">See all contact options</Link>
          </div>
        </div>
      </section>

    </div>
  );
}
