"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import ProcessIcon, { resolveIcon, type IconName } from "@/components/ProcessIcon";
import DeliveryStageIcon, { resolveDeliveryStage } from "@/components/DeliveryStageIcon";
import CustomSections from "@/components/CustomSections";
import MachineParts from "@/components/MachineParts";
import ProductStage3D from "@/components/ProductStage3D";
import type { ProductFamily, Category } from "@/lib/products";
import { familyImage, familyImages, parseYouTubeId, stagePhotos } from "@/lib/products";

const MachineDiagram = dynamic(() => import("@/components/MachineDiagram"), { ssr: false });

interface Props {
  family: ProductFamily;
  category: Category;
  related: ProductFamily[];
}

/* ── fixed 3-stage delivery proof boxes — packing / freight / install ── */
const DELIVERY_STAGES: { key: "packing" | "freight" | "install"; label: string; icon: IconName }[] = [
  { key: "packing", label: "Export Packing", icon: "shipping" },
  { key: "freight", label: "Ocean / Air Freight", icon: "factory" },
  { key: "install", label: "On-Site Install", icon: "install" },
];


/* ── tab labels + output-sample copy per category (bag-making genuinely
   makes bags; other categories get an honest "what it produces" label
   instead of pretending everything is a bag) ── */
const SAMPLE_TAB: Record<string, { label: string; heading: string; blurb: string; img: string }> = {
  "film-blowing": { label: "Film Output", heading: "What This Line Produces", blurb: "Continuous blown film rolls, ready for bag-making, lamination or printing downstream.", img: "/machines/s-wide.png" },
  "bag-making":   { label: "Bag Sample Size", heading: "Bag Types This Machine Makes", blurb: "Finished bags straight off the line — heat-sealed, cut and stacked, ready to pack.", img: "/machines/bag-samples.png" },
  "recycling":    { label: "Pellet Output", heading: "What This Line Produces", blurb: "Recycled resin pellets, consistent size and quality, ready to feed back into production.", img: "/machines/cx-pelletizing.png" },
  "printing":     { label: "Print Sample", heading: "What This Press Produces", blurb: "Multi-colour printed film, registered and dried, ready for bag-making or lamination.", img: "/machines/flexo-6c-nobg.png" },
};

/* ── "Part N" breakdown rows — same real product photo shown in full per
   part. This mirrors the reference site's component-photo rows without
   fabricating distinct component photography we don't actually have. ── */
interface PartDef { title: string; detail: string; icon: IconName }
const PART_CROPS: Record<string, PartDef[]> = {
  "film-blowing": [
    { title: "Extrusion & Screw", icon: "power",       detail: "Multi-screw co-extrusion feeds molten resin into the die head at controlled temperature zones." },
    { title: "Die Head & Bubble", icon: "calibration", detail: "The film bubble forms above the die, cooled by the air ring for consistent gauge." },
    { title: "Haul-Off & Winding", icon: "assembly",   detail: "Collapsed film is drawn up the tower and wound into finished rolls." },
  ],
  "bag-making": [
    { title: "Unwind & Feeding",  icon: "power",       detail: "Photocell-tracked unwind feeds film into the machine at controlled tension." },
    { title: "Sealing & Cutting", icon: "assembly",    detail: "Heat-seal bars and rotary cutters form and separate each bag at speed." },
    { title: "Control Panel",     icon: "calibration", detail: "PLC touchscreen sets bag length, seal temperature and lane speed." },
  ],
  "recycling": [
    { title: "Crusher & Feeding", icon: "power",       detail: "Scrap film and edge trim are crushed and fed into the extruder at a controlled rate." },
    { title: "Screen Changer",    icon: "assembly",    detail: "Auto screen-changer filters contamination without stopping the line." },
    { title: "Pelletizing Head",  icon: "calibration", detail: "Molten resin is cut into uniform pellets and cooled for reuse." },
  ],
  "printing": [
    { title: "Unwind & Registration", icon: "power",       detail: "Web tension and registration marks are tracked before the film reaches the first print station." },
    { title: "CI Print Drum",         icon: "assembly",    detail: "Each colour station transfers ink from the anilox roller onto the central impression drum." },
    { title: "Drying & Rewind",       icon: "calibration", detail: "Inline dryers set each colour before the finished print is wound onto the rewind shaft." },
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
  const href = `/inquiries/talk-to-engineer?machine=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
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
  const [dvIdx, setDvIdx] = useState<Record<string, number>>({});

  /* real videos only — an unset/invalid URL never falls back to a fake
     placeholder video, it just means the section shows "coming soon" */
  const videos = (family.videos ?? [])
    .map(v => ({ id: parseYouTubeId(v.url), title: v.title || "Product demo" }))
    .filter((v): v is { id: string; title: string } => !!v.id);
  const specKeys = PANEL_SPEC_KEYS[family.category]  ?? PANEL_SPEC_KEYS["film-blowing"];
  const sample    = SAMPLE_TAB[family.category] ?? SAMPLE_TAB["film-blowing"];
  const parts     = PART_CROPS[family.category] ?? PART_CROPS["film-blowing"];
  const materials = family.materials?.split(",").map(s => s.trim()) ?? [];
  const photos    = familyImages(family);
  const heroImg = photos[Math.min(activePhoto, photos.length - 1)];

  /* facility strip — 3 diagonal panels of real machines from this category
     (this one + up to 2 related), standing in for a factory-floor collage
     without fabricating photography we don't have */
  const collagePool = [family, ...related].slice(0, 3);
  while (collagePool.length < 3) collagePool.push(family);

  /* real reviews only — rating average and star-distribution bars are
     computed from actual admin-entered reviews, never a fixed fake number */
  const reviews = family.reviews ?? [];
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(
    s => reviews.filter(r => Math.round(r.rating) === s).length
  );

  /* dedupe factory-floor gallery photos by src — the same image reused
     under different captions is misleading, not a real gallery */
  const uniqueGalleryPhotos = (family.gallery ?? []).filter(
    (img, i, arr) => arr.findIndex(x => x.src === img.src) === i
  );

  const deliveryStagePhotos = family.deliveryStagePhotos ?? {};

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

  /* the model selector is only worth showing when picking a different
     model actually changes something the visitor can see — matching it
     against the same rows the panel displays (not the raw spec sheet)
     means a product whose panel keys don't resolve to any real spec rows
     (e.g. a fixture using placeholder label names) correctly hides the
     picker instead of offering chips that click but change nothing */
  const hasModels = family.models.length > 1 && specKeys.some(key => {
    const row = findSpec(key);
    if (!row) return false;
    const seen = new Set(family.models.map((_, i) => row.values[Math.min(i, row.values.length - 1)]));
    return seen.size > 1;
  });

  /* entrance animation — each section reveals as it scrolls into view,
     not all at once on mount. `data-reveal` value picks the motion:
     "scale" for photos/frames, "blur" for hero text, default = fade-up. */
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const els = Array.from(rootRef.current.querySelectorAll<HTMLElement>("[data-reveal]"));

    const HIDDEN: Record<string, { opacity: string; transform: string; filter?: string }> = {
      scale: { opacity: "0", transform: "scale(0.94)" },
      blur:  { opacity: "0", transform: "translateY(16px)", filter: "blur(6px)" },
      default: { opacity: "0", transform: "translateY(22px)" },
    };

    els.forEach(el => {
      const kind = el.dataset.reveal || "default";
      const hidden = HIDDEN[kind] ?? HIDDEN.default;
      el.style.opacity = hidden.opacity;
      el.style.transform = hidden.transform;
      if (hidden.filter) el.style.filter = hidden.filter;
      el.style.transition = "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1)";
    });

    const groups = new Map<Element, HTMLElement[]>();
    els.forEach(el => {
      const parent = el.parentElement ?? el;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent)!.push(el);
    });

    const seen = new WeakSet<HTMLElement>();
    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const el = entry.target as HTMLElement;
          if (!entry.isIntersecting || seen.has(el)) return;
          seen.add(el);
          const siblings = groups.get(el.parentElement ?? el) ?? [el];
          const idx = siblings.indexOf(el);
          const delay = Math.max(0, idx) * 0.08;
          el.style.transitionDelay = `${delay}s`;
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.filter = "none";
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="pdv2" ref={rootRef} data-no-anim>

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
              <Image
                src={familyImage(f)}
                alt=""
                fill
                sizes="33vw"
              />
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
          <div className="pdv2-title-block" data-reveal="blur">
            <p className="pdv2-title-block__cat">{category.tagline}</p>
            <h1 className="pdv2-title-block__h1">{family.name}</h1>
            <p className="pdv2-title-block__tagline">{family.tagline}</p>
          </div>

          <div className="pdv2-hero__cols">

            {/* ── LEFT: product photo gallery (unlimited photos) ── */}
            <div className="pdv2-gallery" data-reveal="scale">
              <ProductStage3D
                src={heroImg}
                alt={family.name}
                badge={family.series}
                photoKey={activePhoto}
                priority
              />
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
                      <Image src={p} alt="" fill loading="eager" sizes="68px" style={{ objectFit: "contain", padding: "4px" }} />
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
                {panelSpecs.length > 0 ? panelSpecs.map(s => (
                  <div key={s.label} className="pdv2-spec-row">
                    <span className="pdv2-spec-row__label">{s.label}</span>
                    <span className="pdv2-spec-row__val">{s.value}</span>
                  </div>
                )) : (
                  <div className="pdv2-spec-row pdv2-spec-row--empty">
                    <span className="pdv2-spec-row__label">Full specification available on request</span>
                  </div>
                )}
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <span>ISO Certified</span>
                </div>
                <div className="pdv2-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>Ships Worldwide</span>
                </div>
                <div className="pdv2-trust-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
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

          {videos.length === 0 ? (
            /* honest empty state — never falls back to a fake/placeholder video */
            <div className="pdv2-video-empty" data-reveal>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2.5" y="5" width="19" height="14" rx="2" />
                <path d="M9.5 9.5v5l5-2.5z" fill="currentColor" stroke="none" />
              </svg>
              <p><strong>Production video coming soon.</strong><br />Ask us for a live video call demo or on-site footage from a recent install.</p>
              <InquiryButton slug={family.slug} name={family.name} />
            </div>
          ) : (
          <div className="pdv2-video-layout" data-reveal>
            {/* main video */}
            <div className="pdv2-video-main">
              {!videoPlaying ? (
                <button
                  className="pdv2-video-poster"
                  onClick={() => setVideoPlaying(true)}
                  aria-label="Play video"
                >
                  <Image
                    src={`https://img.youtube.com/vi/${videos[activeVideo].id}/maxresdefault.jpg`}
                    alt={videos[activeVideo].title}
                    fill
                    sizes="(max-width: 900px) 90vw, 56vw"
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
                      <Image src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
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
          )}
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
            {uniqueGalleryPhotos.length > 1 && (
              <button role="tab" aria-selected={activeTab === "packing"} className={`pdv2-tab${activeTab === "packing" ? " pdv2-tab--on" : ""}`} onClick={() => setActiveTab("packing")}>Packing &amp; Shipping</button>
            )}
          </div>

          {/* ── Product Details ── */}
          {activeTab === "details" && (
            <div className="pdv2-tabpane">

              {/* circular diagram — key specs around machine image */}
              <MachineDiagram
                image={heroImg}
                name={family.name}
                specs={family.specs}
                specKeys={calloutKeys}
                modelIndex={activeModel}
                onModelChange={setActiveModel}
                models={family.models}
                family={family}
                category={category.slug}
              />

              {/* machine breakdown — callout pins on the photo */}
              {callouts.length > 0 && (
                <div className="pdv2-breakdown-frame" data-reveal="scale">
                  <Image src={heroImg} alt={family.name} fill sizes="(max-width: 900px) 90vw, 70vw" className="pdv2-breakdown-frame__img" />
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

              {/* Part N breakdown — same real product photo shown in full per part, not fabricated component shots */}
              {parts.map((part, i) => (
                <div key={part.title} className="pdv2-part" data-reveal>
                  <div className="pdv2-part__head">Part {i + 1} — {part.title}</div>
                  <div className="pdv2-part__shot">
                    <Image src={heroImg} alt={`${family.name} — ${part.title}`} fill sizes="(max-width: 900px) 90vw, 70vw" />
                    <span className="pdv2-part__icon"><ProcessIcon name={part.icon} size={26} /></span>
                  </div>
                  <p className="pdv2-part__detail">{part.detail}</p>
                </div>
              ))}

              {/* installation guide — engineering-spec-sheet cards. Every
                  card carries its step on schematic linework + index
                  typography (real SVG icons, not a photo/logo placeholder)
                  so the set stays consistent and premium regardless of
                  whether a site photo has been uploaded for this step. */}
              {family.installation && family.installation.length > 0 && (
                <>
                  <div className="pdv2-section-head pdv2-section-head--tab" data-reveal>
                    <span className="pdv2-section-head__line" />
                    <h3>Setup &amp; Installation Guide</h3>
                  </div>
                  <div className="pdv2-guide-grid" data-reveal="scale">
                    {family.installation.map((step, i) => (
                      <div key={i} className="pdv2-guide-card">
                        <div className="pdv2-guide-card__media pdv2-guide-card__media--schematic">
                          <span className="pdv2-guide-card__ghost" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                          <span className="pdv2-guide-card__bracket pdv2-guide-card__bracket--tl" aria-hidden="true" />
                          <span className="pdv2-guide-card__bracket pdv2-guide-card__bracket--br" aria-hidden="true" />
                          <span className="pdv2-guide-card__icon">
                            <ProcessIcon name={resolveIcon(step.title)} size={48} />
                          </span>
                          <span className="pdv2-guide-card__num">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <div className="pdv2-guide-card__body">
                          <h3 className="pdv2-guide-card__title">{step.title}</h3>
                          <p className="pdv2-guide-card__detail">{step.detail}</p>
                        </div>
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
              <div className="pdv2-sample" data-reveal="scale">
                <div className="pdv2-sample__img">
                  <Image src={sample.img} alt={sample.heading} fill sizes="(max-width: 700px) 90vw, 380px" />
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
              {/* only real, distinct photos — the same image reused under
                  different captions reads as fake to a buyer, so this
                  section stays hidden until there are 2+ unique photos */}
              {uniqueGalleryPhotos.length > 1 && (
                <>
                  <div className="pdv2-section-head pdv2-section-head--tab" data-reveal>
                    <span className="pdv2-section-head__line" />
                    <h3>On the Factory Floor</h3>
                  </div>
                  <div className="pdv2-gallery-grid" data-reveal>
                    {uniqueGalleryPhotos.map((img, i) => (
                      <div key={i} className="pdv2-gallery-cell">
                        <div className="pdv2-gallery-cell__img">
                          <Image src={img.src} alt={img.caption} fill sizes="(max-width: 700px) 45vw, 30vw" />
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
          DELIVERY & INSTALLATION — always visible, not gated behind a
          tab click. Lead time is a top-of-mind decision factor for a
          capital-equipment buyer, so it stays in view by default.
      ══════════════════════════════════════════════════ */}
      {family.deliveryGuide && family.deliveryGuide.length > 0 && (
        <section className="pdv2-delivery" aria-label="Delivery and installation timeline">
          <div className="pdv2-wrap">
            <div className="pdv2-section-head" data-reveal>
              <span className="pdv2-section-head__line" />
              <h2>Delivery &amp; <em>Installation</em></h2>
            </div>
          </div>

          {/* proof sections — packing / freight / install, each its own
              full-width banner: title on top, full-bleed photo below.
              Falls back to the technical icon until at least one real photo
              is uploaded per stage from the admin panel. Each stage can hold
              multiple photos — arrows + counter step through them, same
              banner never changes size or crop between photos. */}
          {DELIVERY_STAGES.map(stage => {
            const photos = stagePhotos(deliveryStagePhotos[stage.key]);
            const idx = Math.min(dvIdx[stage.key] ?? 0, Math.max(photos.length - 1, 0));
            const setIdx = (next: number) =>
              setDvIdx(prev => ({ ...prev, [stage.key]: (next + photos.length) % photos.length }));
            return (
              <div key={stage.key} className="pdv2-dv-box" data-reveal="scale">
                <div className="pdv2-wrap">
                  <span className="pdv2-dv-box__label">{stage.label}</span>
                </div>
                <div className="pdv2-dv-box__media">
                  {photos.length > 0 ? (
                    <>
                      <Image src={photos[idx]} alt={`${stage.label} — photo ${idx + 1} of ${photos.length}`} fill sizes="(max-width: 900px) 100vw, 1280px" key={idx} />
                      {photos.length > 1 && (
                        <div className="pdv2-dv-box__nav">
                          <button type="button" className="pdv2-dv-box__nav-btn" onClick={() => setIdx(idx - 1)} aria-label="Previous photo">‹</button>
                          <span className="pdv2-dv-box__nav-count">{idx + 1} / {photos.length}</span>
                          <button type="button" className="pdv2-dv-box__nav-btn" onClick={() => setIdx(idx + 1)} aria-label="Next photo">›</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="pdv2-dv-box__icon">
                      <ProcessIcon name={stage.icon} size={44} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          <div className="pdv2-wrap">
            <div className="pdv2-delivery-grid" data-reveal="scale">
              {family.deliveryGuide.map((phase, i, arr) => (
                <div key={i} className="pdv2-delivery-card">
                  <span className="pdv2-delivery-card__step">{String(i + 1).padStart(2, "0")}</span>
                  <span className="pdv2-delivery-card__icon">
                    <DeliveryStageIcon name={resolveDeliveryStage(phase.label)} size={44} />
                  </span>
                  <h3 className="pdv2-delivery-card__label">{phase.label}</h3>
                  <p className="pdv2-delivery-card__detail">{phase.detail}</p>
                  <span className="pdv2-delivery-card__duration">{phase.duration}</span>
                  {i < arr.length - 1 && (
                    <svg className="pdv2-delivery-card__connector" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M4 12h13m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          MACHINE PARTS — real, admin-added components, each with its
          own photos and an optional install-step sequence. Renders
          nothing until an admin actually adds a part.
      ══════════════════════════════════════════════════ */}
      <MachineParts parts={family.parts} />

      {/* ══════════════════════════════════════════════════
          CUSTOM SECTIONS — admin-authored, fixed safe templates.
          Renders automatically from the admin panel; empty array
          renders nothing.
      ══════════════════════════════════════════════════ */}
      <CustomSections sections={family.customSections} />

      {/* ══════════════════════════════════════════════════
          REVIEWS — real, admin-entered reviews only. No fabricated
          rating or testimonials; an honest empty state otherwise.
      ══════════════════════════════════════════════════ */}
      <section className={`pdv2-reviews${reviews.length === 0 ? " pdv2-reviews--empty" : ""}`} aria-label="Customer reviews">
        <div className="pdv2-reviews__bg" aria-hidden="true" />
        <div className="pdv2-wrap pdv2-reviews__inner">

          {reviews.length === 0 ? (
            <div className="pdv2-reviews-empty" data-reveal>
              <h2 className="pdv2-reviews__h2">Be the first to <em>review this machine</em></h2>
              <p>We haven't published a review for this specific model yet. Ask us to connect you with an existing customer running this line, or check back after your installation.</p>
              <InquiryButton slug={family.slug} name={family.name} />
            </div>
          ) : (
          <>
          {/* left — overall rating */}
          <div className="pdv2-rating-block" data-reveal>
            <div className="pdv2-rating-block__score">{avgRating.toFixed(1)}</div>
            <div className="pdv2-rating-block__stars"><StarRating n={Math.round(avgRating)} /></div>
            <p className="pdv2-rating-block__label">Overall Rating</p>
            <p className="pdv2-rating-block__sub">Based on {reviews.length} verified buyer review{reviews.length === 1 ? "" : "s"}</p>
            <div className="pdv2-rating-bars">
              {[5,4,3,2,1].map((s, i) => (
                <div key={s} className="pdv2-rating-bar">
                  <span>{s}</span>
                  <div className="pdv2-rating-bar__track">
                    <div className="pdv2-rating-bar__fill" style={{ width: `${Math.round((ratingCounts[i] / reviews.length) * 100)}%` }} />
                  </div>
                  <span className="pdv2-rating-bar__pct">{Math.round((ratingCounts[i] / reviews.length) * 100)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* right — review carousel */}
          <div className="pdv2-review-carousel" data-reveal>
            <h2 className="pdv2-reviews__h2">What our customers<br/><em>think about us?</em></h2>

            <div className="pdv2-review-card">
              <div className="pdv2-review-card__quote">"</div>
              <p className="pdv2-review-card__text">{reviews[reviewIdx % reviews.length].text}</p>
              <div className="pdv2-review-card__author">
                <div className="pdv2-review-card__avatar" aria-hidden="true">
                  {reviews[reviewIdx % reviews.length].name.charAt(0)}
                </div>
                <div className="pdv2-review-card__meta">
                  <strong className="pdv2-review-card__name">{reviews[reviewIdx % reviews.length].name}</strong>
                  <span className="pdv2-review-card__title">{reviews[reviewIdx % reviews.length].title}</span>
                </div>
                <div className="pdv2-review-card__stars"><StarRating n={reviews[reviewIdx % reviews.length].rating} /></div>
              </div>
            </div>

            {reviews.length > 1 && (
              <div className="pdv2-review-nav">
                <button
                  className="pdv2-review-nav__btn"
                  onClick={() => setReviewIdx(i => (i - 1 + reviews.length) % reviews.length)}
                  aria-label="Previous review"
                >←</button>
                <span className="pdv2-review-nav__count">{(reviewIdx % reviews.length) + 1} / {reviews.length}</span>
                <button
                  className="pdv2-review-nav__btn pdv2-review-nav__btn--next"
                  onClick={() => setReviewIdx(i => (i + 1) % reviews.length)}
                  aria-label="Next review"
                >→</button>
              </div>
            )}
          </div>
          </>
          )}
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
                    <Image src={familyImage(r)} alt={r.name} fill sizes="(max-width: 700px) 45vw, 22vw" />
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
          <Image src="/machines/bag-samples.png" alt="" fill sizes="(max-width: 700px) 100vw, 50vw" style={{ objectFit: "cover", opacity: 0.55 }} />
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
            <Link href="/inquiries" className="pdv2-ghost-btn">See all contact options</Link>
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
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
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
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
        <button
          className="pdv2-float__icn pdv2-float__icn--quote"
          onClick={() => document.querySelector(".pdv2-info-card")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          aria-label="Jump to request a quote"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H8l-4 4V4Z"/></svg>
        </button>
      </div>

    </div>
  );
}
