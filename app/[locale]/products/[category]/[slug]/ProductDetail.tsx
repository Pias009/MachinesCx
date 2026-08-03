"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import AetherBtn from "@/components/AetherBtn";
import TransitionLink from "@/components/TransitionLink";
import ProcessIcon, { resolveIcon, type IconName } from "@/components/ProcessIcon";
import DeliveryStageIcon, { resolveDeliveryStage } from "@/components/DeliveryStageIcon";
import { openAshaChat } from "@/components/ChatWidget";
import CustomSections from "@/components/CustomSections";
import MachineParts from "@/components/MachineParts";
import ProductStage3D from "@/components/ProductStage3D";
import { Grain, PlusMark, SectionHead, SubHead } from "@/components/EditorialKit";
import type { ProductFamily, Category, DeliveryPhase, SetupStep } from "@/lib/products";
import { familyImage, familyImages, parseYouTubeId, stagePhotos } from "@/lib/products";

const MachineDiagram = dynamic(() => import("@/components/MachineDiagram"), { ssr: false });

interface Props {
  family: ProductFamily;
  category: Category;
  related: ProductFamily[];
}

/* ── fixed 3-stage delivery proof boxes — packing / freight / install.
   Keys + icon order only; label text comes from productDetail.deliveryStages.*
   at render time. ── */
const DELIVERY_STAGES: { key: "packing" | "freight" | "install"; icon: IconName }[] = [
  { key: "packing", icon: "shipping" },
  { key: "freight", icon: "factory" },
  { key: "install", icon: "install" },
];


/* ── tab labels + output-sample copy per category (bag-making genuinely
   makes bags; other categories get an honest "what it produces" label
   instead of pretending everything is a bag). Copy text comes from
   productDetail.sampleTab.* at render time — this map only carries the
   category → image association. ── */
const SAMPLE_TAB_IMG: Record<string, string> = {
  "film-blowing": "/machines/s-wide.png",
  "bag-making":   "/machines/bag-samples.png",
  "recycling":    "/machines/cx-pelletizing.png",
  "printing":     "/machines/flexo-6c-nobg.png",
};

/* ── "Part N" breakdown rows — same real product photo shown in full per
   part. This mirrors the reference site's component-photo rows without
   fabricating distinct component photography we don't actually have.
   Icon + ordering only; title/detail copy comes from
   productDetail.partCrops.* at render time. ── */
interface PartDef { icon: IconName }
const PART_CROPS: Record<string, PartDef[]> = {
  "film-blowing": [
    { icon: "power" },
    { icon: "calibration" },
    { icon: "assembly" },
  ],
  "bag-making": [
    { icon: "power" },
    { icon: "assembly" },
    { icon: "calibration" },
  ],
  "recycling": [
    { icon: "power" },
    { icon: "assembly" },
    { icon: "calibration" },
  ],
  "printing": [
    { icon: "power" },
    { icon: "assembly" },
    { icon: "calibration" },
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

/* Sums every deliveryGuide phase's "duration" text (e.g. "1–2 days",
   "35–45 days") into one real low–high day range for the roadmap's
   running-total bar. Falls back gracefully (returns null) if any phase's
   duration doesn't parse as a day range, rather than showing a wrong sum. */
function sumDurationRange(durations: string[]): { low: number; high: number } | null {
  let low = 0, high = 0;
  for (const d of durations) {
    const m = d.match(/(\d+)\s*[–-]\s*(\d+)/);
    if (!m) return null;
    low += parseInt(m[1], 10);
    high += parseInt(m[2], 10);
  }
  return { low, high };
}

/* Shared expanded view for a roadmap/guide node — opened by clicking any
   card in either DeliveryRoadmap or InstallationWalkthrough. Bigger
   type, the step's icon animated in, every field the compact card has
   plus room for more (kept generic via optional extraFacts), and a
   direct hand-off into the AI chat pre-filled with this step's context
   so a visitor can ask a follow-up without retyping what they're asking
   about. */
function RoadmapDetailModal({
  icon, photo, stepLabel, title, meta, detail, extraFacts, askContext, onClose,
}: {
  icon?: React.ReactNode;
  photo?: string;
  stepLabel: string;
  title: string;
  meta?: string;
  detail: string;
  extraFacts?: { label: string; value: string }[];
  askContext: string;
  onClose: () => void;
}) {
  const t = useTranslations("productDetail");

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="pdv2-rmodal-veil" onClick={onClose}>
      <div
        className="pdv2-rmodal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="pdv2-rmodal__close" aria-label={t("close")} onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>

        <div className="pdv2-rmodal__mark">
          {photo ? (
            <span className="pdv2-rmodal__photo"><Image src={photo} alt="" fill sizes="120px" /></span>
          ) : (
            <span className="pdv2-rmodal__icon">{icon}</span>
          )}
        </div>

        <span className="pdv2-rmodal__stage">{stepLabel}</span>
        <h3 className="pdv2-rmodal__title">{title}</h3>
        {meta && <span className="pdv2-rmodal__meta">{meta}</span>}
        <p className="pdv2-rmodal__detail">{detail}</p>

        {extraFacts && extraFacts.length > 0 && (
          <dl className="pdv2-rmodal__facts">
            {extraFacts.map((f) => (
              <div key={f.label} className="pdv2-rmodal__fact">
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <button
          type="button"
          className="pdv2-rmodal__ask"
          onClick={() => { openAshaChat(askContext); onClose(); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3a7 7 0 0 0-7 7c0 2 .8 3.8 2.1 5.1L6 20l4.4-1.8c.5.1 1.1.2 1.6.2a7 7 0 0 0 0-14z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
          {t("askAboutStep")}
        </button>
      </div>
    </div>
  );
}

/* Horizontal row of icon-only badges on a shared rail, every stage's
   card visible at once. Clicking a card opens the bigger RoadmapDetailModal
   with the animated icon, full copy, and a direct "ask AI" hand-off. */
function DeliveryRoadmap({ phases }: { phases: DeliveryPhase[] }) {
  const t = useTranslations("productDetail");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const total = sumDurationRange(phases.map((p) => p.duration));
  const open = openIdx !== null ? phases[openIdx] : null;

  return (
    <>
      <div
        className="pdv2-roadmap"
        data-reveal="scale"
        style={{ "--road-count": phases.length } as React.CSSProperties}
      >
        {phases.map((phase, i) => (
          <button
            key={i}
            type="button"
            className="pdv2-roadmap-node"
            style={{ "--road-i": i } as React.CSSProperties}
            onClick={() => setOpenIdx(i)}
            aria-haspopup="dialog"
          >
            <span className="pdv2-roadmap-node__marker" aria-hidden="true">
              <DeliveryStageIcon name={resolveDeliveryStage(phase.label)} size={32} />
              <span className="pdv2-roadmap-node__num">{i + 1}</span>
            </span>
            <span className="pdv2-roadmap-node__drop" aria-hidden="true" />
            <div className="pdv2-roadmap-node__body">
              <div className="pdv2-roadmap-node__top">
                <span className="pdv2-roadmap-node__stage">{t("deliveryRoadmapStageLabel", { num: i + 1 })}</span>
                <span className="pdv2-roadmap-node__duration">{phase.duration}</span>
              </div>
              <h3 className="pdv2-roadmap-node__title">{phase.label}</h3>
              <p className="pdv2-roadmap-node__detail">{phase.detail}</p>
            </div>
          </button>
        ))}
      </div>

      {total && (
        <div className="pdv2-roadmap-total">
          <span className="pdv2-roadmap-total__label">{t("deliveryRoadmapTotalLabel")}</span>
          <span className="pdv2-roadmap-total__val">
            {t("deliveryRoadmapTotalVal", { low: total.low, high: total.high })}
          </span>
        </div>
      )}

      {open && (
        <RoadmapDetailModal
          icon={<DeliveryStageIcon name={resolveDeliveryStage(open.label)} size={56} />}
          stepLabel={t("deliveryRoadmapStageLabel", { num: (openIdx as number) + 1 })}
          title={open.label}
          meta={open.duration}
          detail={open.detail}
          askContext={t("askDeliveryStageContext", { stage: open.label, detail: open.detail })}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </>
  );
}

/* These 5 URLs are the only installation-step images in the whole catalog
   (data/products.json) and all 5 resolve to the same company-logo image —
   an upstream upload mistake, not per-product content. Until real
   installation photos are uploaded, treat any step using one of these as
   unphotographed and fall back to the schematic icon panel instead of
   stretching the logo across a full-bleed photo frame. */
const PLACEHOLDER_INSTALL_IMAGES = new Set([
  "https://res.cloudinary.com/dpyhwgsqk/image/upload/v1784475562/cx-machinery/zozsjky029iyownsltvu.jpg",
  "https://res.cloudinary.com/dpyhwgsqk/image/upload/v1784475565/cx-machinery/ng70kjlqjyw09ks53fst.jpg",
  "https://res.cloudinary.com/dpyhwgsqk/image/upload/v1784475570/cx-machinery/vcgmjlbeiwyemzegqeud.jpg",
  "https://res.cloudinary.com/dpyhwgsqk/image/upload/v1784475582/cx-machinery/norwig4mx5puijehnnaa.jpg",
  "https://res.cloudinary.com/dpyhwgsqk/image/upload/v1784475586/cx-machinery/hbm6bsjplk1yqxbvyfvx.jpg",
]);

/* Installation guide — every step shown at once along a connecting line
   (same "roadmap" pattern as DeliveryRoadmap above), instead of one card
   at a time behind a tab strip. Each marker carries the step icon; the
   card under it holds the full title + detail text, no line-clamping.
   Clicking a card opens the same shared RoadmapDetailModal. */
function InstallationWalkthrough({ steps }: { steps: SetupStep[] }) {
  const t = useTranslations("productDetail");
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const open = openIdx !== null ? steps[openIdx] : null;
  const openIsPlaceholder = open ? (!open.image || PLACEHOLDER_INSTALL_IMAGES.has(open.image)) : true;

  return (
    <>
      <div
        className="pdv2-roadmap"
        data-reveal="scale"
        style={{ "--road-count": steps.length } as React.CSSProperties}
      >
        {steps.map((step, i) => {
          const stepIsPlaceholder = !step.image || PLACEHOLDER_INSTALL_IMAGES.has(step.image);
          return (
            <button
              key={i}
              type="button"
              className="pdv2-roadmap-node"
              style={{ "--road-i": i } as React.CSSProperties}
              onClick={() => setOpenIdx(i)}
              aria-haspopup="dialog"
            >
              <span className="pdv2-roadmap-node__marker" aria-hidden="true">
                {step.image && !stepIsPlaceholder ? (
                  <span className="pdv2-roadmap-node__photo">
                    <Image src={step.image} alt="" fill sizes="68px" />
                  </span>
                ) : (
                  <ProcessIcon name={resolveIcon(step.title)} size={32} />
                )}
                <span className="pdv2-roadmap-node__num">{i + 1}</span>
              </span>
              <span className="pdv2-roadmap-node__drop" aria-hidden="true" />
              <div className="pdv2-roadmap-node__body">
                <div className="pdv2-roadmap-node__top">
                  <span className="pdv2-roadmap-node__stage">{t("installStepBadge", { num: i + 1, total: steps.length })}</span>
                </div>
                <h3 className="pdv2-roadmap-node__title">{step.title}</h3>
                <p className="pdv2-roadmap-node__detail">{step.detail}</p>
              </div>
            </button>
          );
        })}
      </div>

      {open && (
        <RoadmapDetailModal
          icon={<ProcessIcon name={resolveIcon(open.title)} size={56} />}
          photo={!openIsPlaceholder ? open.image : undefined}
          stepLabel={t("installStepBadge", { num: (openIdx as number) + 1, total: steps.length })}
          title={open.title}
          detail={open.detail}
          askContext={t("askInstallStepContext", { step: open.title, detail: open.detail })}
          onClose={() => setOpenIdx(null)}
        />
      )}
    </>
  );
}

function StarRating({ n }: { n: number }) {
  const t = useTranslations("productDetail");
  return (
    <span className="pdv2-stars" aria-label={t("starsAria", { n })}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} viewBox="0 0 16 16" width="14" height="14" fill={i < n ? "var(--brand-teal)" : "none"} stroke="var(--brand-teal)" strokeWidth="1.2">
          <path d="M8 1l1.8 3.6L14 5.4l-3 2.9.7 4.1L8 10.4l-3.7 2 .7-4.1-3-2.9 4.2-.8z" />
        </svg>
      ))}
    </span>
  );
}

function InquiryButton({ slug, name }: { slug: string; name: string }) {
  const t = useTranslations("productDetail");
  const href = `/inquiries/talk-to-engineer?machine=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`;
  return (
    <AetherBtn>
      <TransitionLink href={href}>{t("requestQuote")}</TransitionLink>
    </AetherBtn>
  );
}

const TABS = ["details", "sample", "packing"] as const;
type TabKey = (typeof TABS)[number];

export default function ProductDetail({ family, category, related }: Props) {
  const t = useTranslations("productDetail");
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
    .map(v => ({ id: parseYouTubeId(v.url), title: v.title || t("productDemoFallback") }))
    .filter((v): v is { id: string; title: string } => !!v.id);
  const specKeys = PANEL_SPEC_KEYS[family.category]  ?? PANEL_SPEC_KEYS["film-blowing"];
  const sampleTabCopy = t.raw("sampleTab") as Record<string, { label: string; heading: string; blurb: string }>;
  const sampleCategoryKey = SAMPLE_TAB_IMG[family.category] ? family.category : "film-blowing";
  const sample = { ...sampleTabCopy[sampleCategoryKey], img: SAMPLE_TAB_IMG[sampleCategoryKey] };
  const partCropsCopy = t.raw("partCrops") as Record<string, { title: string; detail: string }[]>;
  const partCategoryKey = PART_CROPS[family.category] ? family.category : "film-blowing";
  const parts = PART_CROPS[partCategoryKey].map((p, i) => ({ ...p, ...partCropsCopy[partCategoryKey][i] }));
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

  /* hero glass-panel content — model switcher, title, tagline, headline
     specs, CTA, trust row. Rendered inside an absolute-positioned overlay
     on the cinematic photo from sm: up, and as a plain static-flow block
     below a shorter photo banner on mobile (an overlay would either clip
     or, if sized to fit, force the photo down to an unusable sliver on a
     narrow viewport — so mobile gets its own non-overlapping shell). */
  const heroPanelContent = (
    <>
      <div className="min-w-0" data-reveal="blur">
        {/* model switcher — raised, skeuomorphic pill buttons: gradient fill,
            top highlight + drop shadow for bevel, active state looks
            physically pressed in (inset shadow, no lift) */}
        {hasModels && (
          <div className="pdv2-model-rail mb-4 flex flex-wrap items-center gap-2 self-start rounded-full border border-white/15 bg-black/40 px-2 py-2 backdrop-blur-md" role="group" aria-label={t("selectModelAria")}>
            {family.models.map((m, i) => (
              <button
                key={m}
                className={`pdv2-model-btn ${activeModel === i ? "pdv2-model-btn--on" : ""}`}
                onClick={() => setActiveModel(i)}
                aria-pressed={activeModel === i}
              >
                {m}
              </button>
            ))}
          </div>
        )}
        <p className="mb-2 flex items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[var(--brand-teal)]">
          <span className="h-px w-7 bg-[var(--brand-teal)]" />
          {category.tagline}
        </p>
        <h1 className="text-[clamp(1.9rem,4.2vw,3.4rem)] leading-[0.98] tracking-[0.01em] text-white" style={{ textWrap: "balance", fontFamily: "var(--ff-display)" }}>
          {family.name}
        </h1>
        <p className="mt-3 max-w-[52ch] text-[1rem] leading-[1.65] text-white/75">
          {family.tagline}
        </p>

        {/* trust row */}
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.64rem] uppercase tracking-[0.1em] text-white/65">
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" className="text-[var(--brand-teal)]"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>{t("isoCertified")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" className="text-[var(--brand-teal)]"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>{t("shipsWorldwide")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="15" height="15" className="text-[var(--brand-teal)]"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>{t("support24h")}</span>
          </div>
        </div>
      </div>

      {/* headline specs + CTA */}
      <div className="pdv2-quote-anchor flex shrink-0 flex-col gap-5 lg:items-end">
        {panelSpecs.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-2">
            {panelSpecs.slice(0, 4).map(s => (
              <div key={s.label} className="min-w-0">
                <p className="truncate font-mono text-[0.6rem] uppercase tracking-[0.1em] text-white/50" style={{ overflowWrap: "anywhere" }}>{s.label}</p>
                <p className="text-[1.05rem] font-bold tracking-[0.02em] text-white" style={{ fontFamily: "var(--ff-mono)", overflowWrap: "anywhere" }}>{s.value}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <InquiryButton slug={family.slug} name={family.name} />
          <Link href={`/products/${category.slug}`} className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/60 underline decoration-transparent underline-offset-4 transition-colors hover:text-[var(--brand-teal)] hover:decoration-[var(--brand-teal)]">
            {t("backToCategory", { category: category.name })}
          </Link>
        </div>
      </div>
    </>
  );

  return (
    <div className="pdv2" ref={rootRef} data-no-anim>

      {/* ══════════════════════════════════════════════════
          HERO — cinematic photo stacked on top, own full-width block, no
          text overlaid on it. Breadcrumb sits quietly over the photo top
          edge. Title, headline specs, CTA and the model switcher live in a
          separate solid dark panel directly below. Trimmed to headline
          specs only — the exhaustive table lives in the tabs section's
          "Full Specifications" panel further down the page.
      ══════════════════════════════════════════════════ */}
      <section className="relative isolate overflow-hidden bg-[var(--bg-surface)] pt-24 sm:pt-28">
        {/* photo — its own block, full width, nothing overlaid except the
            breadcrumb (which sits on the photo's top edge) and the photo
            thumbnail rail */}
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2/1] xl:aspect-[21/9]">
          <ProductStage3D
            src={heroImg}
            alt={family.name}
            photoKey={activePhoto}
            priority
            bare
            cover
          />

          {/* scrim so the breadcrumb stays legible over any photo */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%)" }}
          />

          {/* breadcrumb — floats over the top of the photo */}
          <nav
            className="absolute inset-x-0 top-0 z-[2] flex flex-wrap items-center gap-2 px-6 py-5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--ink-60)] sm:px-10 lg:px-14"
            aria-label={t("breadcrumbAria")}
            data-reveal
          >
            <Link href="/" className="transition-colors hover:text-[var(--brand-teal)]">{t("breadcrumbHome")}</Link>
            <span className="text-white/25">›</span>
            <Link href="/products" className="transition-colors hover:text-[var(--brand-teal)]">{t("breadcrumbCatalogue")}</Link>
            <span className="text-white/25">›</span>
            <Link href={`/products/${category.slug}`} className="transition-colors hover:text-[var(--brand-teal)]">{category.name}</Link>
            <span className="text-white/25">›</span>
            <span className="text-white/90">{family.series}</span>
          </nav>

          {/* photo thumbnail rail — top-right */}
          {photos.length > 1 && (
            <div className="absolute right-6 top-20 z-[2] hidden flex-col gap-2 sm:right-10 sm:flex lg:right-14" role="tablist" aria-label={t("productPhotosAria")}>
              {photos.map((p, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={activePhoto === i}
                  className={`relative h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 p-0.5 backdrop-blur-sm transition-all duration-200 ${
                    activePhoto === i
                      ? "border-[var(--brand-teal)] bg-black/30 opacity-100"
                      : "border-white/20 bg-black/20 opacity-70 hover:-translate-y-0.5 hover:border-[var(--brand-teal)]/60 hover:opacity-100"
                  }`}
                  onClick={() => setActivePhoto(i)}
                  aria-label={t("photoOfLabel", { num: i + 1, total: photos.length })}
                >
                  <Image src={p} alt="" fill loading="eager" sizes="48px" style={{ objectFit: "contain", padding: "3px" }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* info panel — solid dark block directly below the photo: model
            switcher, title, tagline, headline specs, CTA, trust row */}
        <div className="bg-[#0d1614] px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="mx-auto flex max-w-[1560px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            {heroPanelContent}
          </div>
        </div>

        {/* facility strip — quiet row of related-category machines directly below the cinematic frame */}
        <div className="mx-auto max-w-[1560px] px-6 py-6 sm:px-10 lg:px-14">
          <div className="rounded-xl border border-[var(--bg-line)] bg-[var(--bg-surface)] px-5 py-4">
            <div className="mb-3 flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.14em] text-[var(--ink-35)]">
              <span>{family.series} :&nbsp;{hasModels ? family.models[activeModel] : family.models[0]}</span>
              <span>{photos.length}&nbsp;{t("productPhotosAria")}</span>
            </div>
            <div className="flex h-16 gap-px overflow-hidden rounded-md bg-[var(--bg-line)]">
              {collagePool.map((f, i) => (
                <div key={`${f.slug}-${i}`} className="relative flex-1 bg-[var(--bg-raise)]">
                  <Image src={familyImage(f)} alt="" fill sizes="20vw" style={{ objectFit: "contain", padding: "6px", opacity: 0.85 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          VIDEO — sits above the tabs, like the reference page
      ══════════════════════════════════════════════════ */}
      <section className="bg-[var(--bg-base)] py-16 sm:py-20" aria-label={t("productVideosAria")}>
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          <SectionHead
            eyebrow={t("productionDemo")}
            title={t.rich("seeItInAction", { em: (chunks) => <em className="text-[var(--brand-teal)] not-italic">{chunks}</em> })}
          />

          {videos.length === 0 ? (
            /* honest empty state — never falls back to a fake/placeholder video */
            <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-[var(--bg-line)] px-6 py-16 text-center" data-reveal>
              <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--ink-35)]">
                <rect x="2.5" y="5" width="19" height="14" rx="2" />
                <path d="M9.5 9.5v5l5-2.5z" fill="currentColor" stroke="none" />
              </svg>
              <p className="text-[var(--ink-60)]"><strong className="text-[var(--ink)]">{t("videoComingSoon")}</strong><br />{t("videoComingSoonSub")}</p>
              <InquiryButton slug={family.slug} name={family.name} />
            </div>
          ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]" data-reveal>
            {/* main video */}
            <div className="relative aspect-video overflow-hidden rounded-xl border border-[var(--bg-line)]" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 3% 100%)" }}>
              {!videoPlaying ? (
                <button
                  className="group relative block h-full w-full"
                  onClick={() => setVideoPlaying(true)}
                  aria-label={t("playVideoAria")}
                >
                  <Image
                    src={`https://img.youtube.com/vi/${videos[activeVideo].id}/maxresdefault.jpg`}
                    alt={videos[activeVideo].title}
                    fill
                    sizes="(max-width: 900px) 90vw, 56vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--brand-teal)] text-[#06110f] shadow-[0_8px_28px_-6px_rgba(43,191,179,0.6)] transition-transform duration-200 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--brand-teal)]">{t("productionDemo")}</span>
                    <span className="text-left text-[1.05rem] font-semibold text-white">{videos[activeVideo].title}</span>
                  </div>
                </button>
              ) : (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={`https://www.youtube.com/embed/${videos[activeVideo].id}?autoplay=1&rel=0`}
                  title={videos[activeVideo].title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* video list */}
            {videos.length > 1 && (
              <div className="flex flex-row gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
                {videos.map((v, i) => (
                  <button
                    key={i}
                    className={`flex shrink-0 items-center gap-3 rounded-lg border p-2 text-left transition-colors duration-150 lg:shrink ${
                      activeVideo === i ? "border-[var(--brand-teal)] bg-[var(--brand-teal-glow)]" : "border-[var(--bg-line)] hover:border-[var(--brand-teal)]/40"
                    }`}
                    onClick={() => { setActiveVideo(i); setVideoPlaying(false); }}
                  >
                    <div className="relative h-[52px] w-[72px] shrink-0 overflow-hidden rounded-md">
                      <Image src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt="" fill sizes="72px" style={{ objectFit: "cover" }} />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
                        <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12"><path d="M5 3.5l8 4.5-8 4.5z"/></svg>
                      </div>
                    </div>
                    <span className="min-w-0 flex-1 truncate text-[0.82rem] text-[var(--ink-60)]">{v.title}</span>
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
      <section className="pdv2-tabsection" aria-label={t("productInfoTabsAria")}>
        <div className="pdv2-wrap">
          <div className="mb-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-b border-[var(--bg-line)]" role="tablist" data-reveal>
            {[
              { key: "details" as const, label: t("tabProductDetails") },
              { key: "sample" as const, label: sample.label },
              ...(uniqueGalleryPhotos.length > 1 ? [{ key: "packing" as const, label: t("tabPackingShipping") }] : []),
            ].map(({ key, label }) => (
              <button
                key={key}
                role="tab"
                aria-selected={activeTab === key}
                className={`relative -mb-px border-b-2 pb-3 font-mono text-[0.78rem] uppercase tracking-[0.1em] transition-colors duration-150 ${
                  activeTab === key
                    ? "border-[var(--brand-teal)] text-[var(--brand-teal)]"
                    : "border-transparent text-[var(--ink-35)] hover:text-[var(--ink-60)]"
                }`}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
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
                  <div className="pdv2-part__head">{t("partHeading", { num: i + 1, title: part.title })}</div>
                  <div className="pdv2-part__shot">
                    <Image src={heroImg} alt={`${family.name} — ${part.title}`} fill sizes="(max-width: 900px) 90vw, 70vw" />
                    <span className="pdv2-part__icon"><ProcessIcon name={part.icon} size={26} /></span>
                  </div>
                  <p className="pdv2-part__detail">{part.detail}</p>
                </div>
              ))}

              {/* installation guide — a real step-by-step walkthrough (photo +
                  full instructions + progress + prev/next), not a grid of
                  cards to skim. See InstallationWalkthrough above. */}
              {family.installation && family.installation.length > 0 && (
                <>
                  <SubHead title={t("setupInstallationGuide")} />
                  <InstallationWalkthrough steps={family.installation} />
                </>
              )}

              {/* full spec table — a real <table> from sm: up (where columns
                  side-by-side genuinely help comparison), and a stacked
                  "one spec per card, one row per model" list below that:
                  a table forced to fit a narrow phone screen either
                  truncates columns or scrolls sideways, and buyers
                  comparing models by feel/thumb shouldn't have to scroll
                  in two directions at once. */}
              <SubHead title={t("fullSpecifications")} note={hasModels && t("clickColumnToHighlight")} />
              <div className="pdv2-table-wrap" data-reveal>
                <table className="pdv2-table">
                  <thead>
                    <tr>
                      <th>{t("specification")}</th>
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

                <div className="pdv2-speccards" data-reveal>
                  {family.specs.map(row => (
                    <div className="pdv2-speccard" key={row.label}>
                      <span className="pdv2-speccard__label">{row.label}</span>
                      <div className="pdv2-speccard__rows">
                        {row.values.map((v, i) => (
                          <div
                            key={i}
                            className={`pdv2-speccard__row${hasModels && i === activeModel ? " pdv2-speccard__row--on" : ""}`}
                            onClick={() => hasModels && setActiveModel(i)}
                            role={hasModels ? "button" : undefined}
                            tabIndex={hasModels ? 0 : undefined}
                          >
                            <span className="pdv2-speccard__model">{family.models[i]}</span>
                            <span className="pdv2-speccard__val">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                      <span className="pdv2-mats__label">{t("compatibleMaterials")}</span>
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
                  <SubHead title={t("onTheFactoryFloor")} />
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
        <section className="pdv2-delivery" aria-label={t("deliveryInstallationTimelineAria")}>
          <div className="pdv2-wrap">
            <SectionHead
              eyebrow={t("deliveryInstallationTimelineAria")}
              title={t.rich("deliveryInstallationHeading", { em: (chunks) => <em className="text-[var(--brand-teal)] not-italic">{chunks}</em> })}
            />
          </div>

          {/* proof sections — packing / freight / install, each its own
              full-width banner: title on top, full-bleed photo below.
              Falls back to the technical icon until at least one real photo
              is uploaded per stage from the admin panel. Each stage can hold
              multiple photos — arrows + counter step through them, same
              banner never changes size or crop between photos. */}
          {DELIVERY_STAGES.map(stage => {
            const stageLabel = t(`deliveryStages.${stage.key}`);
            const photos = stagePhotos(deliveryStagePhotos[stage.key]);
            const idx = Math.min(dvIdx[stage.key] ?? 0, Math.max(photos.length - 1, 0));
            const setIdx = (next: number) =>
              setDvIdx(prev => ({ ...prev, [stage.key]: (next + photos.length) % photos.length }));
            return (
              <div key={stage.key} className="relative border-t border-[var(--bg-line)] first:border-t-0" data-reveal="scale">
                <div className="pdv2-wrap">
                  <span className="relative z-[1] mt-6 inline-flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.2em] text-[var(--ink-35)]">
                    <PlusMark className="text-[var(--brand-teal)]" />
                    {stageLabel}
                  </span>
                </div>
                {photos.length > 0 ? (
                  <div className="pdv2-wrap">
                    <div className="pdv2-dv-box__media">
                      <Image src={photos[idx]} alt={t("stagePhotoAlt", { stage: stageLabel, num: idx + 1, total: photos.length })} fill sizes="(max-width: 900px) 100vw, 1280px" key={idx} />
                      {photos.length > 1 && (
                        <div className="pdv2-dv-box__nav">
                          <button type="button" className="pdv2-dv-box__nav-btn" onClick={() => setIdx(idx - 1)} aria-label={t("previousPhotoAria")}>‹</button>
                          <span className="pdv2-dv-box__nav-count">{idx + 1} / {photos.length}</span>
                          <button type="button" className="pdv2-dv-box__nav-btn" onClick={() => setIdx(idx + 1)} aria-label={t("nextPhotoAria")}>›</button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* no photo uploaded yet for this stage — a compact,
                     designed placeholder strip instead of a tiny icon
                     lost in the full 21:9 photo banner's empty space */
                  <div className="relative flex h-28 items-center gap-4 overflow-hidden border-y border-[var(--bg-line)] bg-[var(--bg-surface)] px-6 sm:h-32">
                    <Grain opacity={0.05} />
                    <span className="relative z-[1] flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-[var(--bg-line)] bg-[var(--bg-raise)] text-[var(--brand-teal)]">
                      <ProcessIcon name={stage.icon} size={26} />
                    </span>
                    <span className="relative z-[1] font-mono text-[0.72rem] uppercase tracking-[0.14em] text-[var(--ink-35)]">
                      {t("stagePhotoComingSoon")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          <div className="pdv2-wrap">
            <DeliveryRoadmap phases={family.deliveryGuide} />
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
      <section className="bg-[var(--bg-base)] py-16 sm:py-20" aria-label={t("customerReviewsAria")}>
        {reviews.length === 0 ? (
          <div className="pdv2-wrap flex flex-col items-center gap-4 py-8 text-center" data-reveal>
            <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[0.95] text-[var(--ink)]" style={{ fontFamily: "var(--ff-display)" }}>
              {t.rich("beFirstToReview", { em: (chunks) => <em className="text-[var(--brand-teal)] not-italic">{chunks}</em> })}
            </h2>
            <p className="text-[var(--ink-60)]">{t("noReviewYet")}</p>
            <InquiryButton slug={family.slug} name={family.name} />
          </div>
        ) : (
          <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            {/* left — grain-textured rating block, echoing the hero's diagonal panel */}
            <div
              className="relative flex flex-col justify-center gap-6 overflow-hidden bg-[#050b0a] px-8 py-14 sm:px-12"
              style={{ clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)" }}
              data-reveal
            >
              <Grain opacity={0.14} />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-10 -inset-y-10"
                style={{ background: "radial-gradient(ellipse 55% 45% at 75% 25%, rgba(43,191,179,0.28) 0%, transparent 62%)" }}
              />
              <div className="relative z-[1] font-mono text-[3.5rem] font-bold leading-none text-white">{avgRating.toFixed(1)}</div>
              <div className="relative z-[1]"><StarRating n={Math.round(avgRating)} /></div>
              <p className="relative z-[1] font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--brand-teal)]">{t("overallRating")}</p>
              <p className="relative z-[1] text-[0.85rem] text-white/60">
                {reviews.length === 1
                  ? t("basedOnReviewsSingular", { count: reviews.length })
                  : t("basedOnReviewsPlural", { count: reviews.length })}
              </p>
              <div className="relative z-[1] flex flex-col gap-2 border-t border-white/10 pt-6">
                {[5,4,3,2,1].map((s, i) => (
                  <div key={s} className="flex items-center gap-3 font-mono text-[0.7rem] text-white/70">
                    <span className="w-3">{s}</span>
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[var(--brand-teal)]" style={{ width: `${Math.round((ratingCounts[i] / reviews.length) * 100)}%` }} />
                    </div>
                    <span className="w-9 text-right">{Math.round((ratingCounts[i] / reviews.length) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right — review carousel */}
            <div className="flex flex-col justify-center gap-8 px-6 py-14 sm:px-10 lg:px-16" data-reveal>
              <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[0.95] text-[var(--ink)]" style={{ fontFamily: "var(--ff-display)" }}>
                {t.rich("whatCustomersThink", { em: (chunks) => <em className="text-[var(--brand-teal)] not-italic">{chunks}</em>, br: () => <br /> })}
              </h2>

              <div className="relative rounded-xl border border-[var(--bg-line)] p-8">
                <div className="mb-2 text-[3rem] leading-none text-[var(--brand-teal)]" style={{ fontFamily: "var(--ff-display)" }}>&ldquo;</div>
                <p className="text-[1.05rem] leading-relaxed text-[var(--ink-60)]">{reviews[reviewIdx % reviews.length].text}</p>
                <div className="mt-6 flex items-center gap-4 border-t border-[var(--bg-line)] pt-6">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--brand-teal-glow)] font-mono font-bold text-[var(--brand-teal)]" aria-hidden="true">
                    {reviews[reviewIdx % reviews.length].name.charAt(0)}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <strong className="truncate text-[var(--ink)]">{reviews[reviewIdx % reviews.length].name}</strong>
                    <span className="truncate text-[0.8rem] text-[var(--ink-35)]">{reviews[reviewIdx % reviews.length].title}</span>
                  </div>
                  <StarRating n={reviews[reviewIdx % reviews.length].rating} />
                </div>
              </div>

              {reviews.length > 1 && (
                <div className="flex items-center gap-4">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bg-line)] text-[var(--ink-60)] transition-colors hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                    onClick={() => setReviewIdx(i => (i - 1 + reviews.length) % reviews.length)}
                    aria-label={t("previousReviewAria")}
                  >←</button>
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--ink-35)]">{(reviewIdx % reviews.length) + 1} / {reviews.length}</span>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bg-line)] text-[var(--ink-60)] transition-colors hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]"
                    onClick={() => setReviewIdx(i => (i + 1) % reviews.length)}
                    aria-label={t("nextReviewAria")}
                  >→</button>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════
          RELATED MACHINES
      ══════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="pdv2-related" aria-label={t("relatedMachinesAria")}>
          <div className="pdv2-wrap">
            <SectionHead
              eyebrow={category.name}
              title={t.rich("relatedMachines", { em: (chunks) => <em className="text-[var(--brand-teal)] not-italic">{chunks}</em> })}
              note={
                <Link href={`/products/${category.slug}`} className="text-[var(--brand-teal)] transition-opacity hover:opacity-70">
                  {t("viewAll")}
                </Link>
              }
            />
            <div className="pdv2-related-grid" data-reveal>
              {related.map(r => (
                <Link
                  key={r.slug}
                  href={`/products/${r.category}/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-[var(--bg-line)] bg-[var(--bg-surface)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--brand-teal)]/40 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-base)]">
                    <Image src={familyImage(r)} alt={r.name} fill sizes="(max-width: 700px) 45vw, 22vw" className="object-contain p-4 transition-transform duration-300 group-hover:scale-105" />
                  </div>
                  <div className="flex flex-col gap-1.5 border-t border-[var(--bg-line)] p-4">
                    <span className="font-mono text-[0.64rem] uppercase tracking-[0.16em] text-[var(--brand-teal)]">{r.series}</span>
                    <span className="text-[0.9rem] leading-snug text-[var(--ink)]">{r.name.length > 48 ? r.name.slice(0,48)+"…" : r.name}</span>
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
      <section className="grid grid-cols-1 lg:grid-cols-2" aria-label={t("getInTouchAria")}>
        <div
          className="relative flex min-h-[280px] items-end overflow-hidden bg-[#050b0a] p-8 sm:p-12 lg:min-h-[420px]"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 92%, 0 100%)" }}
          aria-hidden="true"
        >
          <Image src="/machines/bag-samples.png" alt="" fill sizes="(max-width: 700px) 100vw, 50vw" style={{ objectFit: "cover", opacity: 0.4 }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <Grain opacity={0.12} />
          <p className="relative z-[1] max-w-md text-[1.4rem] font-light leading-snug text-white">
            {t.rich("newsletterText", { br: () => <br /> })}
          </p>
        </div>
        <div className="flex flex-col justify-center gap-5 bg-[var(--bg-surface)] p-8 sm:p-12 lg:p-16">
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-[var(--brand-teal)]">{t("contact")}</span>
          <h2 className="text-[clamp(1.8rem,3.5vw,2.6rem)] leading-[0.95] text-[var(--ink)]" style={{ fontFamily: "var(--ff-display)" }}>
            {t.rich("needCustomConfig", { em: (chunks) => <em className="text-[var(--brand-teal)] not-italic">{chunks}</em> })}
          </h2>
          <p className="text-[var(--ink-60)]">
            {t("dontKnowHowToSpecify")}<br/>
            {t("callUs")} <a href="tel:+8657788888888" className="text-[var(--brand-teal)] underline-offset-2 hover:underline">+86 577 8888 8888</a>
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <InquiryButton slug={family.slug} name={family.name} />
            <Link href="/inquiries" className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-[var(--ink-35)] underline decoration-transparent underline-offset-4 transition-colors hover:text-[var(--brand-teal)] hover:decoration-[var(--brand-teal)]">
              {t("seeAllContactOptions")}
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FLOATING CONTACT STACK (persistent, right-anchored)
      ══════════════════════════════════════════════════ */}
      <div className="pdv2-float" aria-label={t("quickContactAria")}>
        <button
          className="pdv2-float__icn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label={t("backToTopAria")}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
        </button>
        <a
          className="pdv2-float__icn pdv2-float__icn--whatsapp"
          href="https://wa.me/8657788888888"
          target="_blank" rel="noopener noreferrer"
          aria-label={t("chatOnWhatsAppAria")}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.06c-.24.68-1.4 1.3-1.93 1.35-.5.05-1.03.24-3.43-.72-2.9-1.16-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.75-2.11 1.02-2.4.27-.29.58-.36.78-.36.2 0 .39.002.56.01.18.008.42-.07.66.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.15.31-.3.47-.15.17-.31.37-.44.5-.15.14-.3.3-.13.59.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.14.47.12.65-.07.18-.19.75-.88.95-1.18.2-.3.4-.25.66-.15.27.1 1.71.81 2 .96.29.14.48.21.55.33.07.12.07.68-.17 1.36Z"/></svg>
        </a>
        <a className="pdv2-float__icn" href="tel:+8657788888888" aria-label={t("callUsAria")}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
        <button
          className="pdv2-float__icn pdv2-float__icn--quote"
          onClick={() => document.querySelector(".pdv2-quote-anchor")?.scrollIntoView({ behavior: "smooth", block: "center" })}
          aria-label={t("jumpToRequestQuoteAria")}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v12H8l-4 4V4Z"/></svg>
        </button>
      </div>

    </div>
  );
}
