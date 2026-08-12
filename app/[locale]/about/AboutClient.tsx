"use client";

import { useState, useEffect, useRef, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import TransitionLink from "@/components/TransitionLink";
import AboutAtmosphere from "@/components/AboutAtmosphere";
import Image from "next/image";

gsap.registerPlugin(useGSAP);

const HQ_BUILDING_PHOTO = "/about-photos/hq-building-generated.png";
const WAREHOUSE_1 = "/about-photos/warehouse-building-1.jpeg";
const WAREHOUSE_2 = "/about-photos/warehouse-building-2.jpeg";

// ─────────────────────────────────────────────
// DATA — real-shaped figures the charts render.
// Copy (labels/captions/timeline text) comes from the `about` translation
// namespace; only the numeric shape of the charts is fixed here.
// ─────────────────────────────────────────────
const EXPORT_GROWTH_VALUES = [32, 41, 47, 55, 60, 60];
const EXPORT_GROWTH_YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];

const FAMILY_MIX_VALUES = [38, 29, 18, 15];
const FAMILY_MIX_COLORS = ["var(--brand-teal)", "var(--brand-amber)", "var(--brand-rose)", "#7c9cff"];

const OUTPUT_CAPACITY_VALUES = [
  { label: "S-Series", value: 120, subKey: "sSeries" },
  { label: "ABA", value: 220, subKey: "aba" },
  { label: "ABC", value: 300, subKey: "abc" },
  { label: "ABCDE-2200", value: 400, subKey: "abcde" },
];

const STAT_VALUES = [2008, 60, 400, 18];

// ─────────────────────────────────────────────
// Count-up hook — triggers once on intersection
// ─────────────────────────────────────────────
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setDisplay(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return display;
}

function useInView<T extends HTMLElement>(threshold = 0.25) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); ob.disconnect(); }
    }, { threshold });
    ob.observe(el);
    return () => ob.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─────────────────────────────────────────────
// CHART: Export growth — animated bar chart
// ─────────────────────────────────────────────
function ExportGrowthChart() {
  const t = useTranslations("about.charts");
  const { ref, inView } = useInView<HTMLDivElement>();
  const max = Math.max(...EXPORT_GROWTH_VALUES);
  return (
    <div className="ab-chart" ref={ref}>
      <div className="ab-chart__head">
        <span className="ab-chart__title">{t("exportTitle")}</span>
        <span className="ab-chart__unit">{t("exportUnit")}</span>
      </div>
      <div className="ab-chart__bars" role="img" aria-label={t("exportAria")}>
        {EXPORT_GROWTH_VALUES.map((value, i) => {
          const fillStyle = {
            "--fill": inView ? value / max : 0,
            transitionDelay: `${i * 90}ms`,
          } as CSSProperties;
          return (
            <div className="ab-bar" key={EXPORT_GROWTH_YEARS[i]}>
              <div className="ab-bar__track">
                <div className="ab-bar__fill" style={fillStyle} />
                <span className="ab-bar__val" style={fillStyle}>{value}</span>
              </div>
              <span className="ab-bar__label">{EXPORT_GROWTH_YEARS[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CHART: Machine family mix — donut chart (SVG)
// ─────────────────────────────────────────────
function FamilyDonutChart({ isDark }: { isDark: boolean }) {
  const t = useTranslations("about.charts");
  const familyNameKeys = ["blownFilm", "bagMaking", "recycling", "printing"] as const;
  const { ref, inView } = useInView<HTMLDivElement>();
  const R = 60;
  const CIRC = 2 * Math.PI * R;
  let cursor = 0;
  const trackColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div className="ab-chart" ref={ref}>
      <div className="ab-chart__head">
        <span className="ab-chart__title">{t("familyTitle")}</span>
        <span className="ab-chart__unit">{t("familyUnit")}</span>
      </div>
      <div className="ab-donut">
        <svg viewBox="0 0 160 160" className="ab-donut__svg" role="img" aria-label={t("familyAria")}>
          <circle cx="80" cy="80" r={R} fill="none" stroke={trackColor} strokeWidth="20" />
          {FAMILY_MIX_VALUES.map((value, i) => {
            const len = (value / 100) * CIRC;
            const dash = `${inView ? len : 0} ${CIRC}`;
            const offset = -cursor;
            cursor += len;
            return (
              <circle
                key={familyNameKeys[i]}
                cx="80" cy="80" r={R} fill="none"
                stroke={FAMILY_MIX_COLORS[i]}
                strokeWidth="20"
                strokeDasharray={dash}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                transform="rotate(-90 80 80)"
                style={{ transition: `stroke-dasharray 1s cubic-bezier(.16,1,.3,1) ${i * 120}ms` }}
              />
            );
          })}
          <text x="80" y="76" textAnchor="middle" className="ab-donut__num">18+</text>
          <text x="80" y="94" textAnchor="middle" className="ab-donut__sub">{t("familiesLabel")}</text>
        </svg>
        <ul className="ab-donut__legend">
          {FAMILY_MIX_VALUES.map((value, i) => (
            <li key={familyNameKeys[i]} className="ab-donut__legend-item">
              <span className="ab-donut__swatch" style={{ background: FAMILY_MIX_COLORS[i] }} />
              <span className="ab-donut__legend-name">{t(`familyNames.${familyNameKeys[i]}`)}</span>
              <span className="ab-donut__legend-val">{value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CHART: Output capacity — horizontal bar comparison
// ─────────────────────────────────────────────
function CapacityChart() {
  const t = useTranslations("about.charts");
  const { ref, inView } = useInView<HTMLDivElement>();
  const max = Math.max(...OUTPUT_CAPACITY_VALUES.map((d) => d.value));
  return (
    <div className="ab-chart" ref={ref}>
      <div className="ab-chart__head">
        <span className="ab-chart__title">{t("capacityTitle")}</span>
        <span className="ab-chart__unit">{t("capacityUnit")}</span>
      </div>
      <div className="ab-hbars" role="img" aria-label={t("capacityAria")}>
        {OUTPUT_CAPACITY_VALUES.map((d, i) => (
          <div className="ab-hbar" key={d.label}>
            <div className="ab-hbar__meta">
              <span className="ab-hbar__label">{d.label}</span>
              <span className="ab-hbar__sub">{t(`capacitySubs.${d.subKey}`)}</span>
            </div>
            <div className="ab-hbar__track">
              <div
                className="ab-hbar__fill"
                style={{
                  "--fill": inView ? d.value / max : 0,
                  transitionDelay: `${i * 100}ms`,
                } as CSSProperties}
              />
            </div>
            <span className="ab-hbar__val">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatItem({ v, suffix, l }: { v: number; suffix: string; l: string }) {
  const { ref, inView } = useInView<HTMLDivElement>(0.4);
  const n = useCountUp(v, inView);
  return (
    <div className="ab-stat" ref={ref}>
      <div className="ab-stat__val">{n}{suffix}</div>
      <div className="ab-stat__label">{l}</div>
    </div>
  );
}

export default function AboutPage() {
  const t = useTranslations("about");
  const [isDark, setIsDark] = useState(true);
  const atmosphereSectionRef = useRef<HTMLElement>(null);
  const atmosphereCopyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = t("pageTitle");
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute("data-theme");
      setIsDark(theme !== "light");
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => { observer.disconnect(); };
  }, [t]);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled || !atmosphereCopyRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(
        atmosphereCopyRef.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: atmosphereSectionRef.current, start: "top 78%" },
        }
      );
    });
    return () => { cancelled = true; };
  }, { scope: atmosphereSectionRef });

  const darkBg = "#0a0e1a";
  const lightBg = "#f8fafc";
  const bg = isDark ? darkBg : lightBg;
  const textPrimary = isDark ? "#fff" : "#111827";
  const textMuted = isDark ? "rgba(255,255,255,0.72)" : "rgba(0,0,0,0.65)";
  const textBody = isDark ? "rgba(255,255,255,0.82)" : "rgba(0,0,0,0.75)";
  const textBodyAlt = isDark ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.7)";
  const textDim = isDark ? "rgba(255,255,255,0.60)" : "rgba(0,0,0,0.55)";
  const border = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const gridBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const cardBg = isDark ? "#0f1420" : "#fff";

  return (
    <div>
      <style suppressHydrationWarning>{`
        @keyframes aboutArrowBounce { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(10px); opacity: 1; } }

        /* ── charts ── */
        .ab-chart { display: flex; flex-direction: column; }
        .ab-chart__head { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; margin-bottom: 1.75rem; flex-wrap: wrap; }
        .ab-chart__title { font-family: var(--ff-display); font-size: 1.15rem; letter-spacing: 0.02em; color: ${textPrimary}; }
        .ab-chart__unit { font-family: var(--ff-mono); font-size: 0.62rem; letter-spacing: 0.12em; text-transform: uppercase; color: ${textDim}; }

        /* bar chart */
        .ab-chart__bars { display: flex; align-items: flex-end; gap: clamp(0.6rem, 1.6vw, 1.25rem); height: 220px; padding-top: 1.5rem; }
        .ab-bar { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; }
        .ab-bar__track { width: 100%; height: 100%; position: relative; border-bottom: 1px solid ${border}; }
        .ab-bar__fill { position: absolute; left: 0; right: 0; bottom: 0; top: 0; width: 100%; height: 100%; background: linear-gradient(180deg, var(--brand-teal), var(--brand-teal-dk, var(--brand-teal))); border-radius: 4px 4px 0 0; transform: scaleY(var(--fill, 0)); transform-origin: bottom; transition: transform 0.9s cubic-bezier(.16,1,.3,1); }
        .ab-bar__val { position: absolute; left: 0; right: 0; bottom: 0; transform: translateY(calc(var(--fill, 0) * -100% - 1.5rem)); text-align: center; font-family: var(--ff-mono); font-size: 0.7rem; color: ${textPrimary}; white-space: nowrap; transition: transform 0.9s cubic-bezier(.16,1,.3,1); }
        .ab-bar__label { margin-top: 0.6rem; font-family: var(--ff-mono); font-size: 0.65rem; letter-spacing: 0.08em; color: ${textMuted}; }

        /* donut chart */
        .ab-donut { display: flex; align-items: center; gap: clamp(1.5rem, 3vw, 3rem); flex-wrap: wrap; }
        .ab-donut__svg { width: clamp(160px, 20vw, 200px); height: auto; flex-shrink: 0; }
        .ab-donut__num { font-family: var(--ff-display); font-size: 1.6rem; fill: ${textPrimary}; }
        .ab-donut__sub { font-family: var(--ff-mono); font-size: 0.42rem; letter-spacing: 0.1em; fill: ${textDim}; }
        .ab-donut__legend { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.85rem; flex: 1; min-width: 180px; }
        .ab-donut__legend-item { display: flex; align-items: center; gap: 0.65rem; font-family: var(--ff-body); font-size: 0.85rem; color: ${textBody}; }
        .ab-donut__swatch { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
        .ab-donut__legend-name { flex: 1; color: ${textPrimary}; }
        .ab-donut__legend-val { font-family: var(--ff-mono); font-size: 0.75rem; color: ${textDim}; }

        /* horizontal bars */
        .ab-hbars { display: flex; flex-direction: column; gap: 1.5rem; }
        .ab-hbar { display: grid; grid-template-columns: 140px 1fr 50px; align-items: center; gap: 1rem; }
        .ab-hbar__meta { display: flex; flex-direction: column; }
        .ab-hbar__label { font-family: var(--ff-display); font-size: 0.95rem; letter-spacing: 0.02em; color: ${textPrimary}; }
        .ab-hbar__sub { font-family: var(--ff-mono); font-size: 0.6rem; color: ${textDim}; text-transform: uppercase; letter-spacing: 0.06em; }
        .ab-hbar__track { height: 10px; background: ${gridBg}; border-radius: 5px; overflow: hidden; }
        .ab-hbar__fill { width: 100%; height: 100%; background: linear-gradient(90deg, var(--brand-amber), var(--brand-teal)); border-radius: 5px; transform: scaleX(var(--fill, 0)); transform-origin: left; transition: transform 1s cubic-bezier(.16,1,.3,1); }
        .ab-hbar__val { font-family: var(--ff-mono); font-size: 0.8rem; color: ${textPrimary}; text-align: right; }

        /* stats */
        .ab-stat { text-align: center; padding: 1rem; }
        .ab-stat__val { font-family: var(--ff-display); font-size: clamp(1.8rem,4vw,3rem); color: #fff; line-height: 1; }
        .ab-stat__label { font-family: var(--ff-mono); font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.8); margin-top: 0.5rem; }

        /* photo strip */
        .ab-photo-strip { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1px; background: ${gridBg}; }
        .ab-photo-strip__figure { position: relative; overflow: hidden; background: ${cardBg}; }
        .ab-photo-strip__figure img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(.16,1,.3,1); }
        .ab-photo-strip__figure:hover img { transform: scale(1.04); }
        .ab-photo-strip__figure--tall { grid-row: span 2; min-height: 340px; }
        .ab-photo-strip__cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 1.25rem 1.5rem; background: linear-gradient(0deg, rgba(0,0,0,0.7), transparent); font-family: var(--ff-mono); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: #fff; z-index: 1; }
        .ab-photo-tile { min-height: 168px; }

        @media (max-width: 768px) {
          .about-hero { height: 62vh !important; min-height: 420px !important; }
          .about-hero__sticky { position: relative !important; top: auto !important; height: 100% !important; }
          .about-hero__img { object-fit: cover !important; }
          .about-hero__eyebrow { margin-bottom: 0.5rem !important; }
          .about-hero__title { font-size: clamp(1.6rem,6.5vw,2.2rem) !important; }
          .about-section { padding-top: 1.75rem !important; padding-bottom: 1.75rem !important; padding-left: 1.25rem !important; padding-right: 1.25rem !important; }
          .about-section h3 { font-size: 1.5rem !important; margin-bottom: 1.25rem !important; }
          .about-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .about-stats > div { padding: 0.5rem !important; }
          .about-story { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .about-values { grid-template-columns: repeat(2, 1fr) !important; }
          .about-values > div { padding: 1.1rem 0.9rem !important; }
          .about-values h4 { font-size: 0.95rem !important; margin-bottom: 0.4rem !important; }
          .about-values p { font-size: 0.72rem !important; line-height: 1.45 !important; }
          .about-specs { grid-template-columns: 1fr !important; gap: 1.75rem !important; }
          .about-materials { grid-template-columns: repeat(2, 1fr) !important; }
          .about-materials > div { padding: 0.75rem 0.85rem !important; flex-direction: column !important; align-items: flex-start !important; gap: 0.15rem !important; }
          .about-categories { grid-template-columns: repeat(2, 1fr) !important; }
          .about-categories > div { padding: 1.25rem 0.9rem !important; }
          .about-categories img { height: 80px !important; margin-bottom: 0.75rem !important; }
          .about-categories h4 { font-size: 0.95rem !important; }
          .about-global { grid-template-columns: 1fr !important; gap: 1.5rem !important; }
          .about-support { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .about-contact { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .about-charts { grid-template-columns: 1fr !important; gap: 2.5rem !important; }
          .ab-chart__bars { height: 170px; gap: 0.5rem !important; }
          .ab-bar__val { font-size: 0.6rem !important; transform: translateY(calc(var(--fill, 0) * -100% - 1.2rem)) !important; }
          .ab-bar__label { font-size: 0.56rem !important; }
          .ab-donut { flex-direction: column; align-items: flex-start !important; gap: 1.5rem !important; }
          .ab-donut__svg { width: 140px !important; margin: 0 auto; align-self: center; }
          .ab-hbar { grid-template-columns: 96px 1fr 38px !important; gap: 0.6rem !important; }
          .ab-hbar__label { font-size: 0.8rem !important; }
          .ab-hbar__sub { font-size: 0.52rem !important; }
          .ab-photo-strip { grid-template-columns: 1fr !important; }
          .ab-photo-strip__figure--tall { min-height: 220px !important; }
          .ab-photo-tile { min-height: 200px !important; }
        }

        .about-cta {
          position: relative; overflow: hidden;
          font-family: var(--ff-display); font-size: 0.9rem;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 0.85rem 2rem; text-decoration: none; font-weight: 700;
          transition: background .2s var(--ease-out, ease), color .2s var(--ease-out, ease),
                      border-color .2s var(--ease-out, ease), transform .16s var(--ease-out, ease),
                      box-shadow .2s var(--ease-out, ease);
        }
        .about-cta--solid {
          color: #080e0d; background: var(--brand-red); border: 1px solid var(--brand-red);
          box-shadow: 0 1px 0 rgba(255,255,255,0.15) inset, 0 8px 20px -14px rgba(43,191,179,0);
        }
        .about-cta--solid::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.4) 48%, transparent 66%);
          transform: translateX(-120%);
        }
        .about-cta--solid:hover {
          background: var(--brand-teal-dk);
          transform: translateY(-2px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.18) inset, 0 14px 30px -12px rgba(43,191,179,0.55);
        }
        .about-cta--solid:hover::before { animation: about-cta-shine 0.9s var(--ease-out, ease); }
        .about-cta--ghost {
          background: transparent;
          font-weight: 500;
        }
        .about-cta--ghost:hover { border-color: var(--brand-teal) !important; color: var(--brand-teal) !important; transform: translateY(-2px); }
        .about-cta:active { transform: translateY(0) scale(0.97); transition-duration: .08s; }
        @keyframes about-cta-shine { to { transform: translateX(120%); } }
        @media (prefers-reduced-motion: reduce) {
          .about-cta { transform: none !important; }
          .about-cta--solid::before { display: none; }
        }
      `}</style>

      {/* CONTENT SECTION */}
      <div style={{ background: bg, position: "relative", zIndex: 20, overflow: "hidden" }}>

        {/* Hero — real HQ building photo, sticky pin-and-release */}
        <section
          className="about-hero"
          style={{ position: "relative", height: "120vh" }}
        >
          <div className="about-hero__sticky" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", background: "#000" }}>
            <Image
              className="about-hero__img"
              src={HQ_BUILDING_PHOTO}
              alt={t("hero.imgAlt")}
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.25) 100%)" }} />

            <div style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "flex-end", justifyContent: "flex-start", padding: "clamp(1.5rem,4vw,3rem)" }}>
              <div style={{ textAlign: "left", maxWidth: "42ch", marginBottom: "clamp(1.5rem,5vw,3rem)" }}>
                <span className="about-hero__eyebrow" style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#fff", display: "block", marginBottom: "1.25rem", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>{t("hero.eyebrow")}</span>
                <h1 className="about-hero__title" style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2.3rem,5.5vw,4.5rem)", color: "#fff", lineHeight: 0.95, textShadow: "0 4px 24px rgba(0,0,0,0.65)" }}>
                  {t("hero.titleLine1")}<br /><span style={{ color: "var(--brand-red)" }}>{t("hero.titleLine2")}</span>
                </h1>
              </div>
            </div>
          </div>
        </section>

        {/* Company profile copy — atmospheric smoke background, always dark
            (like the hero/stats bands) regardless of site theme */}
        <section
          ref={atmosphereSectionRef}
          className="about-section"
          style={{
            position: "relative", overflow: "hidden", isolation: "isolate",
            background: "#070b12",
            padding: "clamp(4rem,8vw,8rem) clamp(1.5rem,4vw,3rem)",
            borderBottom: "1px solid " + border,
          }}
        >
          <AboutAtmosphere />
          <div ref={atmosphereCopyRef} style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-teal)", display: "block", marginBottom: "1.5rem" }}>{t("whoWeAre.kicker")}</span>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "rgba(242,239,230,0.88)", lineHeight: 1.8, maxWidth: "60ch", marginBottom: "1.5rem" }}>{t("whoWeAre.p1")}</p>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "1rem", color: "rgba(242,239,230,0.72)", lineHeight: 1.8, maxWidth: "60ch" }}>{t("whoWeAre.p2")}</p>
          </div>
        </section>

        {/* Stats */}
        <section style={{ background: "var(--brand-red)", padding: "clamp(2rem,4vw,3rem) clamp(1.5rem,4vw,3rem)", position: "relative", zIndex: 5 }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px" }} className="about-stats">
            {STAT_VALUES.map((v, i) => {
              const s = (t.raw("stats") as { suffix: string; label: string }[])[i];
              return <StatItem key={s.label} v={v} suffix={s.suffix} l={s.label} />;
            })}
          </div>
        </section>

        {/* Photo strip — real facility photography */}
        <section style={{ padding: 0 }}>
          <div className="ab-photo-strip">
            <div className="ab-photo-strip__figure ab-photo-strip__figure--tall">
              <Image src={HQ_BUILDING_PHOTO} alt={t("photoStrip.hqAlt")} fill sizes="(max-width: 768px) 100vw, 58vw" style={{ objectFit: "cover" }} />
              <span className="ab-photo-strip__cap">{t("photoStrip.hqCaption")}</span>
            </div>
            <div className="ab-photo-strip__figure ab-photo-tile">
              <Image src={WAREHOUSE_1} alt={t("photoStrip.floorAlt")} fill sizes="(max-width: 768px) 100vw, 42vw" style={{ objectFit: "cover" }} />
              <span className="ab-photo-strip__cap">{t("photoStrip.floorCaption")}</span>
            </div>
            <div className="ab-photo-strip__figure ab-photo-tile">
              <Image src={WAREHOUSE_2} alt={t("photoStrip.assemblyAlt")} fill sizes="(max-width: 768px) 100vw, 42vw" style={{ objectFit: "cover" }} />
              <span className="ab-photo-strip__cap">{t("photoStrip.assemblyCaption")}</span>
            </div>
          </div>
        </section>

        {/* Charts — Data & Performance */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("charts.kicker")}</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2.5rem,5vw,4rem)" }}>{t("charts.title")}</h3>
            <div className="about-charts" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(3rem,6vw,5rem)", marginBottom: "clamp(3rem,6vw,5rem)" }}>
              <ExportGrowthChart />
              <FamilyDonutChart isDark={isDark} />
            </div>
            <div style={{ borderTop: "1px solid " + border, paddingTop: "clamp(2.5rem,5vw,4rem)" }}>
              <CapacityChart />
            </div>
          </div>
        </section>

        {/* Timeline + Story */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-story">
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("story.kicker")}</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "1.5rem" }}>{t("story.title")}</h3>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8, marginBottom: "1rem" }}>{t("story.p1")}</p>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8 }}>{t("story.p2")}</p>
            </div>
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1.5rem" }}>{t("timeline.kicker")}</span>
              <div style={{ position: "relative", paddingLeft: "1.5rem", borderLeft: "1px solid " + (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)") }}>
                {(t.raw("timeline.items") as { y: string; e: string }[]).map((item, i) => (
                  <div key={item.y} style={{ paddingBottom: i < 6 ? "1.5rem" : 0, position: "relative" }}>
                    <div style={{ position: "absolute", left: "-1.75rem", top: "0.3rem", width: 8, height: 8, borderRadius: "50%", background: i === 6 ? "var(--brand-red)" : isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)", border: "2px solid " + bg }} />
                    <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "0.25rem" }}>{item.y}</span>
                    <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.6, margin: 0 }}>{item.e}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Machine Categories */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("categories.kicker")}</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2rem,4vw,3rem)" }}>{t("categories.title")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: gridBg }} className="about-categories">
              {[
                { name: t("categories.items.0.name"), img: "/machines/abc-multilayer-large.png", desc: t("categories.items.0.desc") },
                { name: t("categories.items.1.name"), img: "/machines/f-pro-bottomseal.png", desc: t("categories.items.1.desc") },
                { name: t("categories.items.2.name"), img: "/machines/rgb-rollbag.png", desc: t("categories.items.2.desc") },
                { name: t("categories.items.3.name"), img: "/machines/flexo-4.png", desc: t("categories.items.3.desc") },
              ].map((c) => (
                <div key={c.name} style={{ background: cardBg, padding: "2rem 1.5rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div style={{ position: "relative", width: "100%", height: 140, marginBottom: "1.5rem", filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.4))" }}>
                    <Image src={c.img} alt={c.name} fill sizes="(max-width: 768px) 50vw, 25vw" style={{ objectFit: "contain" }} />
                  </div>
                  <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, letterSpacing: "0.04em", marginBottom: "0.5rem" }}>{c.name}</h4>
                  <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.75rem", color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)", lineHeight: 1.5, margin: 0 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("values.kicker")}</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2rem,4vw,3rem)" }}>{t("values.title")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: gridBg }} className="about-values">
              {(t.raw("values.items") as { h: string; b: string }[]).map((v) => (
                <div key={v.h} style={{ background: cardBg, padding: "2rem 1.75rem" }}>
                  <div style={{ width: "2rem", height: 2, background: "var(--brand-red)", marginBottom: "1.25rem" }} />
                  <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, letterSpacing: "0.02em", marginBottom: "0.75rem" }}>{v.h}</h4>
                  <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.7, margin: 0 }}>{v.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Materials */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("materials.kicker")}</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "clamp(2rem,4vw,3rem)" }}>{t("materials.title")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1px", background: gridBg }} className="about-materials">
              {(t.raw("materials.items") as { n: string; f: string }[]).map((m) => (
                <div key={m.n} style={{ background: cardBg, padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--ff-display)", fontSize: "1.1rem", color: textPrimary, letterSpacing: "0.02em" }}>{m.n}</span>
                  <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: textDim }}>{m.f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Specs */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-specs">
            {(t.raw("specs.groups") as { label: string; specs: [string, string][] }[]).map((s) => (
              <div key={s.label}>
                <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{s.label}</span>
                <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.8rem", color: textPrimary, marginBottom: "1.5rem" }}>{t("specs.keySpecs")}</h4>
                {s.specs.map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid " + border }}>
                    <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted }}>{l}</span>
                    <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textPrimary, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Global */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("global.kicker")}</span>
            <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "2rem" }}>{t("global.title")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: gridBg }} className="about-global">
              <div style={{ background: cardBg, padding: "2rem" }}>
                <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, marginBottom: "1rem" }}>{t("global.marketsTitle")}</h4>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.7, margin: 0 }}>{t("global.markets")}</p>
              </div>
              <div style={{ background: cardBg, padding: "2rem" }}>
                <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.2rem", color: textPrimary, marginBottom: "1rem" }}>{t("global.officesTitle")}</h4>
                <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted, lineHeight: 1.7, margin: 0 }}><strong style={{ color: textPrimary }}>{t("global.officeGermany")}</strong> {t("global.officeGermanyDesc")}<br /><strong style={{ color: textPrimary }}>{t("global.officeVietnam")}</strong> {t("global.officeVietnamDesc")}<br /><strong style={{ color: textPrimary }}>{t("global.officeHQ")}</strong> {t("global.officeHQDesc")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)", borderBottom: "1px solid " + border }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-support">
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("support.kicker")}</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "1.5rem" }}>{t("support.title")}</h3>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textBodyAlt, lineHeight: 1.8 }}>{t("support.desc")}</p>
            </div>
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("support.deliveryKicker")}</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "1.5rem" }}>{t("support.deliveryTitle")}</h3>
              {(t.raw("support.deliveryItems") as [string, string][]).map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid " + border }}>
                  <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textMuted }}>{l}</span>
                  <span style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: textPrimary, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="about-section" style={{ padding: "clamp(4rem,8vw,7rem) clamp(1.5rem,4vw,3rem)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(3rem,6vw,6rem)" }} className="about-contact">
            <div>
              <span style={{ fontFamily: "var(--ff-mono)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--brand-red)", display: "block", marginBottom: "1rem" }}>{t("contact.kicker")}</span>
              <h3 style={{ fontFamily: "var(--ff-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: textPrimary, lineHeight: 0.95, marginBottom: "2rem" }}>{t("contact.title")}</h3>
              {(t.raw("contact.items") as [string, string][]).map(([l, v]) => (
                <div key={l} style={{ marginBottom: "1.25rem" }}>
                  <div style={{ fontFamily: "var(--ff-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: textDim, marginBottom: "0.25rem" }}>{l}</div>
                  <div style={{ fontFamily: "var(--ff-body)", fontSize: "0.95rem", color: textPrimary, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ background: cardBg, border: "1px solid " + border, padding: "2.5rem", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <h4 style={{ fontFamily: "var(--ff-display)", fontSize: "1.5rem", color: textPrimary, marginBottom: "1rem" }}>{t("contact.cardTitle")}</h4>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.9rem", color: textMuted, lineHeight: 1.7, marginBottom: "2rem" }}>{t("contact.cardDesc")}</p>
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <TransitionLink href="/inquiries" className="about-cta about-cta--solid">{t("contact.requestQuote")}</TransitionLink>
                <TransitionLink href="/products" className="about-cta about-cta--ghost" style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)", border: "1px solid " + (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)") }}>{t("contact.browseMachines")}</TransitionLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
