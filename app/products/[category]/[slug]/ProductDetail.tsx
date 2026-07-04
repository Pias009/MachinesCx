"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import ProcessIcon, { resolveIcon, type IconName } from "@/components/ProcessIcon";
import type { ProductFamily, Category } from "@/lib/products";
import { familyImage, familyImages } from "@/lib/products";

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

/* ── tab labels + output-sample copy per category (bag-making genuinely
   makes bags; other categories get an honest "what it produces" label
   instead of pretending everything is a bag) ── */
const SAMPLE_TAB: Record<string, { label: string; heading: string; blurb: string; img: string }> = {
  "film-blowing": { label: "Film Output", heading: "What This Line Produces", blurb: "Continuous blown film rolls, ready for bag-making, lamination or printing downstream.", img: "/machines/s-wide.png" },
  "bag-making":   { label: "Bag Sample Size", heading: "Bag Types This Machine Makes", blurb: "Finished bags straight off the line — heat-sealed, cut and stacked, ready to pack.", img: "/machines/bag-samples.png" },
  "recycling":    { label: "Pellet Output", heading: "What This Line Produces", blurb: "Recycled resin pellets, consistent size and quality, ready to feed back into production.", img: "/machines/cx-pelletizing.png" },
  "printing":     { label: "Print Sample", heading: "What This Press Produces", blurb: "Multi-colour printed film, registered and dried, ready for bag-making or lamination.", img: "/machines/flexo-6c-nobg.png" },
};

/* ── "Part N" breakdown rows — same real product photo, cropped/zoomed to
   3 different regions per part via CSS object-position + scale. This
   mirrors the reference site's component-photo rows without fabricating
   distinct component photography we don't actually have. ── */
interface PartDef { title: string; detail: string; icon: IconName; crops: { pos: string; zoom: number }[] }
const PART_CROPS: Record<string, PartDef[]> = {
  "film-blowing": [
    { title: "Extrusion & Screw", icon: "power",       detail: "Multi-screw co-extrusion feeds molten resin into the die head at controlled temperature zones.", crops: [{ pos: "20% 40%", zoom: 2.2 }, { pos: "35% 30%", zoom: 2.6 }, { pos: "15% 55%", zoom: 2.0 }] },
    { title: "Die Head & Bubble", icon: "calibration", detail: "The film bubble forms above the die, cooled by the air ring for consistent gauge.", crops: [{ pos: "50% 15%", zoom: 1.8 }, { pos: "50% 5%",  zoom: 2.0 }, { pos: "45% 25%", zoom: 1.9 }] },
    { title: "Haul-Off & Winding", icon: "assembly",   detail: "Collapsed film is drawn up the tower and wound into finished rolls.", crops: [{ pos: "60% 70%", zoom: 1.7 }, { pos: "75% 80%", zoom: 1.9 }, { pos: "65% 60%", zoom: 1.8 }] },
  ],
  "bag-making": [
    { title: "Unwind & Feeding",  icon: "power",       detail: "Photocell-tracked unwind feeds film into the machine at controlled tension.", crops: [{ pos: "15% 50%", zoom: 2.1 }, { pos: "25% 60%", zoom: 2.3 }, { pos: "10% 40%", zoom: 2.0 }] },
    { title: "Sealing & Cutting", icon: "assembly",    detail: "Heat-seal bars and rotary cutters form and separate each bag at speed.", crops: [{ pos: "50% 45%", zoom: 2.0 }, { pos: "55% 55%", zoom: 2.2 }, { pos: "45% 35%", zoom: 1.9 }] },
    { title: "Control Panel",     icon: "calibration", detail: "PLC touchscreen sets bag length, seal temperature and lane speed.", crops: [{ pos: "80% 30%", zoom: 2.4 }, { pos: "85% 20%", zoom: 2.6 }, { pos: "75% 40%", zoom: 2.2 }] },
  ],
  "recycling": [
    { title: "Crusher & Feeding", icon: "power",       detail: "Scrap film and edge trim are crushed and fed into the extruder at a controlled rate.", crops: [{ pos: "20% 45%", zoom: 2.0 }, { pos: "30% 55%", zoom: 2.2 }, { pos: "15% 35%", zoom: 1.9 }] },
    { title: "Screen Changer",    icon: "assembly",    detail: "Auto screen-changer filters contamination without stopping the line.", crops: [{ pos: "50% 40%", zoom: 2.1 }, { pos: "55% 50%", zoom: 2.3 }, { pos: "45% 30%", zoom: 2.0 }] },
    { title: "Pelletizing Head",  icon: "calibration", detail: "Molten resin is cut into uniform pellets and cooled for reuse.", crops: [{ pos: "75% 60%", zoom: 2.2 }, { pos: "80% 70%", zoom: 2.4 }, { pos: "70% 50%", zoom: 2.1 }] },
  ],
  "printing": [
    { title: "Unwind & Registration", icon: "power",       detail: "Web tension and registration marks are tracked before the film reaches the first print station.", crops: [{ pos: "15% 45%", zoom: 2.0 }, { pos: "25% 55%", zoom: 2.2 }, { pos: "10% 35%", zoom: 1.9 }] },
    { title: "CI Print Drum",         icon: "assembly",    detail: "Each colour station transfers ink from the anilox roller onto the central impression drum.", crops: [{ pos: "50% 40%", zoom: 2.1 }, { pos: "55% 30%", zoom: 2.3 }, { pos: "45% 50%", zoom: 2.0 }] },
    { title: "Drying & Rewind",       icon: "calibration", detail: "Inline dryers set each colour before the finished print is wound onto the rewind shaft.", crops: [{ pos: "80% 55%", zoom: 2.2 }, { pos: "85% 65%", zoom: 2.4 }, { pos: "75% 45%", zoom: 2.1 }] },
  ],
};

/* ── extract top specs for the panel ── */
const PANEL_SPEC_KEYS: Record<string, string[]> = {
  "film-blowing": ["Film Width", "Max Extrusion Output", "Total Power", "Screw Diameter", "Roller Width"],
  "bag-making":   ["Max Bag Width", "Bag Making Speed", "Total Power", "Film Thickness", "Dimension / Weight"],
  "recycling":    ["Max Extrusion Output", "Screw Diameter", "Main Motor", "Dimension / Weight"],
  "printing":     ["Max Web Width", "Max Mechanical Speed", "Registration Accuracy", "Drive System", "Anilox Roller"],
};

/* ── callout pins on the product photo — 4 fixed positions (x%, y% of the
   image frame) matched to the 4 specs that matter most per category. This
   turns the wall-of-spec-text into a visual diagram anchored on the real
   product photo, instead of adding fake component photography we don't have. */
const CALLOUT_SPECS: Record<string, string[]> = {
  "film-blowing": ["Screw Diameter", "Die Head", "Film Width", "Total Power"],
  "bag-making":   ["Max Unwind Roll Dia.", "Bag Making Speed", "Max Bag Width", "Total Power"],
  "recycling":    ["Screw Diameter", "Main Motor", "Max Extrusion Output", "Gear Box"],
  "printing":     ["Anilox Roller", "Registration Accuracy", "Max Web Width", "Drive System"],
};
const CALLOUT_POS = [
  { x: 12, y: 22 }, { x: 82, y: 18 }, { x: 16, y: 78 }, { x: 80, y: 76 },
];

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

const TABS = ["details", "sample", "packing"] as const;
type TabKey = (typeof TABS)[number];

export default function ProductDetail({ family, category, related }: Props) {
  const [activeModel,  setActiveModel]  = useState(0);
  const [activeVideo,  setActiveVideo]  = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [reviewIdx,    setReviewIdx]    = useState(0);
  const [activeTab,    setActiveTab]    = useState<TabKey>("details");
  const [activePhoto,  setActivePhoto]  = useState(0);

  const videos   = CATEGORY_VIDEOS[family.category] ?? CATEGORY_VIDEOS["film-blowing"];
  const specKeys = PANEL_SPEC_KEYS[family.category]  ?? PANEL_SPEC_KEYS["film-blowing"];
  const sample    = SAMPLE_TAB[family.category] ?? SAMPLE_TAB["film-blowing"];
  const parts     = PART_CROPS[family.category] ?? PART_CROPS["film-blowing"];
  const hasModels = family.models.length > 1;
  const materials = family.materials?.split(",").map(s => s.trim()) ?? [];
  const photos    = familyImages(family);
  const heroImg = photos[Math.min(activePhoto, photos.length - 1)];

  /* facility strip — 3 diagonal panels of real machines from this category
     (this one + up to 2 related), standing in for a factory-floor collage
     without fabricating photography we don't have */
  const collagePool = [family, ...related].slice(0, 3);
  while (collagePool.length < 3) collagePool.push(family);

  /* find a spec row by label — exact match first, falling back to a prefix
     match only when nothing exact exists (avoids e.g. "Max Bag Width"
     shadowing "Max Unwind Roll Dia." just because both start with "Max") */
  const findSpec = (key: string) =>
    family.specs.find(s => s.label === key) ??
    family.specs.find(s => s.label.startsWith(key.split(" ")[0]));

  /* callout pins — same "top spec" pattern as the panel, positioned on the photo */
  const calloutKeys = CALLOUT_SPECS[family.category] ?? CALLOUT_SPECS["film-blowing"];
  const callouts = calloutKeys.flatMap((key, i) => {
    const row = findSpec(key);
    if (!row) return [];
    return [{ label: row.label, value: row.values[Math.min(activeModel, row.values.length - 1)], pos: CALLOUT_POS[i] }];
  });

  /* panel specs for active model */
  const panelSpecs = specKeys.flatMap(key => {
    const row = findSpec(key);
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

        {/* facility strip — diagonal 3-panel collage of the category's machines */}
        <div className="pdv2-collage" aria-hidden="true">
          {collagePool.map((f, i) => (
            <div key={`${f.slug}-${i}`} className="pdv2-collage__panel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={familyImage(f)} alt="" />
            </div>
          ))}
        </div>

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

            {/* ── LEFT: product photo gallery (unlimited photos) ── */}
            <div className="pdv2-gallery" data-reveal>
              <div className="pdv2-main-img pdv2-main-img--solo">
                <div className="pdv2-main-img__teal-bar" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImg} alt={family.name} key={activePhoto} />
                <span className="pdv2-main-img__badge">{family.series}</span>
              </div>
              {photos.length > 1 && (
                <div className="pdv2-thumbs" role="tablist" aria-label="Product photos">
                  {photos.map((p, i) => (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={activePhoto === i}
                      className={`pdv2-thumb${activePhoto === i ? " pdv2-thumb--on" : ""}`}
                      onClick={() => setActivePhoto(i)}
                      aria-label={`Photo ${i + 1} of ${photos.length}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p} alt="" />
                    </button>
                  ))}
                </div>
              )}
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
          VIDEO — sits above the tabs, like the reference page
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
          TABS — Product Details / Output Sample / Packing & Shipping
      ══════════════════════════════════════════════════ */}
      <section className="pdv2-tabsection" aria-label="Product information tabs">
        <div className="pdv2-wrap">
          <div className="pdv2-tabbar" role="tablist" data-reveal>
            <button role="tab" aria-selected={activeTab === "details"} className={`pdv2-tab${activeTab === "details" ? " pdv2-tab--on" : ""}`} onClick={() => setActiveTab("details")}>Product Details</button>
            <button role="tab" aria-selected={activeTab === "sample"} className={`pdv2-tab${activeTab === "sample" ? " pdv2-tab--on" : ""}`} onClick={() => setActiveTab("sample")}>{sample.label}</button>
            <button role="tab" aria-selected={activeTab === "packing"} className={`pdv2-tab${activeTab === "packing" ? " pdv2-tab--on" : ""}`} onClick={() => setActiveTab("packing")}>Packing &amp; Shipping</button>
          </div>

          {/* ── Product Details ── */}
          {activeTab === "details" && (
            <div className="pdv2-tabpane">

              {/* machine breakdown — callout pins on the photo */}
              {callouts.length > 0 && (
                <div className="pdv2-breakdown-frame" data-reveal>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={heroImg} alt={family.name} className="pdv2-breakdown-frame__img" />
                  {callouts.map((c) => (
                    <div key={c.label} className="pdv2-pin" style={{ left: `${c.pos.x}%`, top: `${c.pos.y}%` }}>
                      <span className="pdv2-pin__dot" aria-hidden="true" />
                      <div className="pdv2-pin__card">
                        <span className="pdv2-pin__label">{c.label}</span>
                        <span className="pdv2-pin__value">{c.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Part N breakdown — real photo, cropped/zoomed per part, not fabricated component shots */}
              {parts.map((part, i) => (
                <div key={part.title} className="pdv2-part" data-reveal>
                  <div className="pdv2-part__head">Part {i + 1} — {part.title}</div>
                  <div className="pdv2-part__row">
                    {part.crops.map((crop, ci) => (
                      <div key={ci} className="pdv2-part__shot">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={heroImg} alt={`${family.name} — ${part.title}`} style={{ objectPosition: crop.pos, transform: `scale(${crop.zoom})` }} />
                        <span className="pdv2-part__icon"><ProcessIcon name={part.icon} size={22} /></span>
                      </div>
                    ))}
                  </div>
                  <p className="pdv2-part__detail">{part.detail}</p>
                </div>
              ))}

              {/* installation steps */}
              {family.installation && family.installation.length > 0 && (
                <>
                  <div className="pdv2-section-head pdv2-section-head--tab" data-reveal>
                    <span className="pdv2-section-head__line" />
                    <h3>Setup &amp; Installation</h3>
                  </div>
                  <div className="pdv2-install-grid" data-reveal>
                    {family.installation.map((step, i) => (
                      <div key={i} className="pdv2-install-step">
                        <div className="pdv2-install-step__head">
                          <span className="pico-badge">
                            <ProcessIcon name={resolveIcon(step.title)} />
                          </span>
                          <span className="pdv2-install-step__num">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <h3 className="pdv2-install-step__title">{step.title}</h3>
                        <p className="pdv2-install-step__detail">{step.detail}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* full spec table */}
              <div className="pdv2-section-head pdv2-section-head--tab" data-reveal>
                <span className="pdv2-section-head__line" />
                <h3>Full Specifications</h3>
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
          )}

          {/* ── Output Sample ── */}
          {activeTab === "sample" && (
            <div className="pdv2-tabpane">
              <div className="pdv2-sample" data-reveal>
                <div className="pdv2-sample__img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sample.img} alt={sample.heading} />
                </div>
                <div className="pdv2-sample__body">
                  <h3>{sample.heading}</h3>
                  <p>{sample.blurb}</p>
                  {materials.length > 0 && (
                    <div className="pdv2-mats">
                      <span className="pdv2-mats__label">Compatible materials</span>
                      <div className="pdv2-mats__tags">
                        {materials.map(m => <span key={m} className="pdv2-mat-tag">{m}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Packing & Shipping ── */}
          {activeTab === "packing" && (
            <div className="pdv2-tabpane">
              {family.deliveryGuide && family.deliveryGuide.length > 0 && (
                <>
                  {/* visual pictogram band — packing → shipping → install, at a glance */}
                  <div className="pdv2-delivery-visual" data-reveal aria-hidden="true">
                    <div className="pdv2-dv-item">
                      <span className="pdv2-dv-icon"><ProcessIcon name="shipping" size={36} /></span>
                      <span>Export Packing</span>
                    </div>
                    <span className="pdv2-dv-connector" />
                    <div className="pdv2-dv-item">
                      <span className="pdv2-dv-icon"><ProcessIcon name="factory" size={36} /></span>
                      <span>Ocean / Air Freight</span>
                    </div>
                    <span className="pdv2-dv-connector" />
                    <div className="pdv2-dv-item">
                      <span className="pdv2-dv-icon"><ProcessIcon name="install" size={36} /></span>
                      <span>On-Site Install</span>
                    </div>
                  </div>

                  <div className="pdv2-delivery-timeline" data-reveal>
                    {family.deliveryGuide.map((phase, i) => (
                      <div key={i} className="pdv2-delivery-phase">
                        <span className="pdv2-delivery-phase__dot">
                          <span className="pico-badge">
                            <ProcessIcon name={resolveIcon(phase.label)} />
                          </span>
                        </span>
                        <div className="pdv2-delivery-phase__body">
                          <h3 className="pdv2-delivery-phase__label">{phase.label}</h3>
                          <p className="pdv2-delivery-phase__detail">{phase.detail}</p>
                        </div>
                        <span className="pdv2-delivery-phase__duration">{phase.duration}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {family.gallery && family.gallery.length > 0 && (
                <>
                  <div className="pdv2-section-head pdv2-section-head--tab" data-reveal>
                    <span className="pdv2-section-head__line" />
                    <h3>On the Factory Floor</h3>
                  </div>
                  <div className="pdv2-gallery-grid" data-reveal>
                    {family.gallery.map((img, i) => (
                      <div key={i} className="pdv2-gallery-cell">
                        <div className="pdv2-gallery-cell__img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img.src} alt={img.caption} loading="lazy" />
                        </div>
                        <span className="pdv2-gallery-cell__caption">{img.caption}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
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
                    <img src={familyImage(r)} alt={r.name} loading="lazy" />
                  </div>
                  <div className="pdv2-rel-card__body">
                    <span className="pdv2-rel-card__series">{r.series}</span>
                    <span className="pdv2-rel-card__name">{r.name.length > 48 ? r.name.slice(0,48)+"…" : r.name}</span>
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

      {/* ══════════════════════════════════════════════════
          FLOATING CONTACT STACK (persistent, right-anchored)
      ══════════════════════════════════════════════════ */}
      <div className="pdv2-float" aria-label="Quick contact">
        <button
          className="pdv2-float__icn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
        <a
          className="pdv2-float__icn pdv2-float__icn--whatsapp"
          href="https://wa.me/8657788888888"
          target="_blank" rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.03.24-3.43-.72-2.9-1.16-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.02-2.4.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.07.66.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.47-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.14.47.12.65-.07.18-.19.75-.88.95-1.18.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.29.14.48.21.55.33.07.12.07.68-.17 1.36Z"/></svg>
        </a>
        <a className="pdv2-float__icn" href="tel:+8657788888888" aria-label="Call us">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
        <button
          className="pdv2-float__icn pdv2-float__icn--quote"
          onClick={() => document.querySelector(".pdv2-info-card")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          aria-label="Jump to request a quote"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H8l-4 4V4Z"/></svg>
        </button>
      </div>

    </div>
  );
}
