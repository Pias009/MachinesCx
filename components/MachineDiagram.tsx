"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import {
  Globe2, DollarSign, BarChart3, Gauge, Ruler, Zap, Weight, Settings2, Layers,
} from "lucide-react";
import type { SpecRow, ProductFamily } from "@/lib/products";

interface Props {
  image: string;
  name: string;
  specs: SpecRow[];
  specKeys: string[];
  modelIndex: number;
  family: ProductFamily;
  category?: string;
}

function extractNum(v: string): number {
  const m = v.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function formatValue(v: number): string {
  if (v === 0) return "0";
  if (v < 10) return (Math.round(v * 100) / 100).toString();
  return Math.round(v).toString();
}

function extractUnit(v: string): string {
  // everything after the last number — handles both "240 KG/H" (unit
  // legitimately contains a slash) and "65/75/65mm" (slash-separated
  // multi-layer value, unit is just the trailing "mm")
  const m = v.match(/[\d.]+(?!.*[\d.])/);
  if (!m) return "";
  return v.slice(m.index! + m[0].length).trim();
}

/* pick a representative icon for a spec label — purely decorative, mirrors
   the icon-per-ring pattern in the reference gauge */
function iconForLabel(label: string) {
  const l = label.toLowerCase();
  if (l.includes("power") || l.includes("motor")) return Zap;
  if (l.includes("width")) return Ruler;
  if (l.includes("weight")) return Weight;
  if (l.includes("speed") || l.includes("output") || l.includes("capacity")) return Gauge;
  if (l.includes("layer")) return Layers;
  if (l.includes("colour") || l.includes("color")) return Globe2;
  if (l.includes("diameter") || l.includes("screw")) return Settings2;
  if (l.includes("length")) return BarChart3;
  return DollarSign;
}

/* readout bar color per position — all four keyed off the same brand teal
   (full → dimmed) rather than a rainbow, since these are one instrument's
   four channels, not four unrelated categories. The lead spec (the one
   that actually differentiates this machine) gets full brand teal; the
   rest step down in opacity so the eye still lands on it first. */
const GAUGE_TINTS = [1, 0.78, 0.58, 0.4];

/* model-comparison categorical palette — fixed order, one hue per model
   position across every panel (never re-cycled or re-assigned by value).
   Deepened from the raw brand tokens (--brand-teal/-amber/-rose + the
   ClientJourney blue) specifically to clear the OKLCH lightness band for
   data marks on both the dark and light chart surfaces; validated with
   dataviz's validate_palette.js (all 4 checks pass, one CVD pair sits in
   the legal 6-8 floor band, which is why every bar also carries a direct
   label — never relies on color alone). */
const MODEL_COLORS = ["#1fa39a", "#c9760a", "#e11d48", "#2563eb"];

/* catalogue-wide ceilings per spec label, used to normalize each ring's
   fill — a single-model family (or the top model of one) would otherwise
   always read ~100%, since there's nothing bigger to compare against */
const GAUGE_CEILINGS: Record<string, number> = {
  "Screw Diameter": 130,
  "Max Extrusion Output": 450,
  "Total Power": 550,
  "Film Width": 2300,
  "Roller Width": 2300,
  "Main Motor": 200,
  "Max Bag Width": 1800,
  "Max Web Width": 2200,
  "Max Mechanical Speed": 400,
  "Mechanical Speed": 400,
  "Bag Making Speed": 280,
  "Line Speed": 300,
  "Film Thickness": 200,
  "Produce Length": 1000,
  "Max Unwind Roll Dia.": 1200,
  "Output Capacity": 500,
  "Pelletizer Speed": 400,
  "Printing Colours": 10,
  "Max Printing Width": 1400,
  "Repeat Length Range": 900,
  "Machine Weight": 20000,
  "Max Unwind/Rewind Dia.": 1200,
};

const RADAR_DEFAULTS: Record<string, string[]> = {
  "film-blowing": ["Screw Diameter", "Max Extrusion Output", "Total Power", "Film Width", "Roller Width", "Main Motor", "Max Bag Width", "Max Web Width", "Max Mechanical Speed"],
  "bag-making": ["Max Bag Width", "Total Power", "Mechanical Speed", "Bag Making Speed", "Line Speed", "Film Thickness", "Produce Length", "Max Unwind Roll Dia."],
  "recycling": ["Screw Diameter", "Max Extrusion Output", "Main Motor", "Total Power", "Output Capacity", "Film Width", "Pelletizer Speed"],
  "printing": ["Max Web Width", "Max Mechanical Speed", "Printing Colours", "Max Printing Width", "Repeat Length Range", "Machine Weight", "Max Unwind/Rewind Dia."],
};

export default function MachineDiagram({ image, name, specs, specKeys, modelIndex, family, category }: Props) {
  const t = useTranslations("machineDiagram");

  const radarSpecs = useMemo(() => {
    const defaults = RADAR_DEFAULTS[category ?? ""] ?? RADAR_DEFAULTS["film-blowing"];
    const keys = family.radarSpecs?.length
      ? family.radarSpecs
      : defaults;
    return keys
      .map((key) => {
        const row = specs.find((s) => s.label === key);
        if (!row) return null;
        const v = extractNum(row.values[Math.min(modelIndex, row.values.length - 1)]);
        return { label: key, value: v, unit: extractUnit(row.values[Math.min(modelIndex, row.values.length - 1)]) };
      })
      .filter((x): x is { label: string; value: number; unit: string } => x !== null && x.value > 0)
      .slice(0, 8);
  }, [specs, modelIndex, family.radarSpecs, category]);

  /* top 4 specs, normalized against a catalogue-wide ceiling per label so
     each ring's fill reflects the spec's real-world scale — falls back to
     this family's own max (with headroom) for labels with no fixed ceiling */
  const gaugeSpecs = useMemo(() => {
    return radarSpecs.slice(0, 4).map((s) => {
      const row = specs.find((r) => r.label === s.label);
      const familyMax = row ? Math.max(...row.values.map(extractNum), s.value) : s.value;
      const ceiling = GAUGE_CEILINGS[s.label] ?? familyMax * 1.35;
      const pct = ceiling > 0 ? Math.round((s.value / ceiling) * 100) : 0;
      return { ...s, pct: Math.min(Math.max(pct, 10), 96) };
    });
  }, [radarSpecs, specs]);

  /* model-comparison small multiples — one panel per spec (up to all 8 in
     radarSpecs, not just the ring's top 4), each a per-model bar group.
     Only rendered when the family actually has more than one model: with a
     single model there is nothing to compare, and a lone bar isn't a chart. */
  const compareSpecs = useMemo(() => {
    if (family.models.length < 2) return [];
    return radarSpecs
      .map((s) => {
        const row = specs.find((r) => r.label === s.label);
        if (!row) return null;
        const bars = family.models.map((m, i) => ({
          model: m,
          value: extractNum(row.values[Math.min(i, row.values.length - 1)]),
          unit: extractUnit(row.values[Math.min(i, row.values.length - 1)]),
        }));
        const max = Math.max(...bars.map((b) => b.value), 1);
        if (max <= 0) return null;
        return { label: s.label, bars, max };
      })
      .filter((x): x is { label: string; bars: { model: string; value: number; unit: string }[]; max: number } => x !== null);
  }, [radarSpecs, specs, family.models]);

  /* live-animated ring fill + counter — rings sweep from 0 the first time
     the section scrolls into view, then re-sweep from their current value
     to the new one whenever the model chip switches (never snaps
     instantly, and never re-plays from 0 on a switch since that would
     read as the page resetting rather than the number updating). */
  const [animGauge, setAnimGauge] = useState(() => gaugeSpecs.map((s) => ({ ...s, pct: 0, value: 0 })));
  const gaugeBoxRef = useRef<HTMLDivElement>(null);
  const hasRevealed = useRef(false);
  const gaugeSpecsRef = useRef(gaugeSpecs);
  gaugeSpecsRef.current = gaugeSpecs;

  const animateTo = (targets: typeof gaugeSpecs) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setAnimGauge(targets.map((s) => ({ ...s })));
      return;
    }
    // one proxy object + tween per ring, staggered slightly so the sweep
    // reads outermost-ring-first like the legend numbering — a single
    // gsap.to() can't target per-index properties on an array, so each
    // ring gets its own tween instead.
    const proxies = targets.map((s, i) => ({ ...(animGauge[i] ?? { pct: 0, value: 0 }) }));
    targets.forEach((s, i) => {
      gsap.to(proxies[i], {
        pct: s.pct,
        value: s.value,
        duration: 1.1,
        ease: "power3.out",
        delay: i * 0.08,
        onUpdate: () => {
          setAnimGauge((prev) => {
            const next = prev.length === targets.length ? [...prev] : targets.map((t) => ({ ...t }));
            next[i] = { ...targets[i], pct: proxies[i].pct, value: proxies[i].value };
            return next;
          });
        },
      });
    });
  };

  // first reveal — wait until the gauge is actually scrolled into view
  useEffect(() => {
    const el = gaugeBoxRef.current;
    if (!el || hasRevealed.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || hasRevealed.current) return;
        hasRevealed.current = true;
        animateTo(gaugeSpecsRef.current);
        obs.disconnect();
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // subsequent changes (model switch) — re-sweep from the current value,
  // only once the first reveal has already happened
  useEffect(() => {
    if (!hasRevealed.current) return;
    animateTo(gaugeSpecs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gaugeSpecs]);

  if (radarSpecs.length < 3) return null;

  return (
    <div className="md-section">
      <style suppressHydrationWarning>{`
        .md-section {
          padding: 0.5rem 0 4.5rem;
          width: 100%;
        }

        /* ═══ SECTION HEADING ═══ */
        .md-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2.75rem;
        }
        .md-head__line {
          flex: 0 0 36px;
          height: 2px;
          background: var(--brand-teal);
        }
        .md-head__title {
          font-family: var(--ff-display);
          font-size: clamp(2rem, 4.8vw, 3.2rem);
          letter-spacing: -0.01em;
          color: var(--ink);
        }
        .md-head__title em {
          font-style: normal;
          color: var(--brand-teal);
        }

        /* ═══ RING GAUGE HERO ═══ */
        /* ═══ READOUT — instrument-panel bars, one per key spec. Modeled on
           a machine's own gauge strip (tick scale + fill + digital numeral)
           rather than a dashboard chart: full-width bars read left-to-right
           at any viewport, so there's no arc geometry to break on mobile. ═══ */
        .md-readout {
          max-width: 1200px;
          margin: 0 auto 2.5rem;
          border: 1px solid var(--bg-line);
          border-radius: 14px;
          background: var(--bg-surface);
          overflow: hidden;
        }
        .md-readout-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.5rem 1.5rem;
          padding: 1.15rem 1.5rem;
          border-bottom: 1px solid var(--bg-line);
          opacity: 0;
          transform: translateX(-12px);
          animation: md-fade-side 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .md-readout-row:last-child { border-bottom: none; }
        .md-readout-row__head {
          grid-column: 1 / -1;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
        }
        .md-readout-row__label {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          font-family: var(--ff-mono);
          font-size: 0.76rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-60);
        }
        .md-readout-row__icon {
          display: flex;
          color: var(--gauge-color, var(--brand-teal));
          opacity: var(--gauge-opacity, 1);
        }
        .md-readout-row__val {
          font-family: var(--ff-display);
          font-size: clamp(1.35rem, 2.6vw, 1.85rem);
          letter-spacing: 0.01em;
          color: var(--ink);
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }
        .md-readout-row__val small {
          font-family: var(--ff-mono);
          font-size: 0.6em;
          font-weight: 600;
          color: var(--ink-35);
          letter-spacing: 0.04em;
          margin-left: 0.15em;
        }
        .md-readout-row__track {
          grid-column: 1 / -1;
          position: relative;
          height: 10px;
          border-radius: 5px;
          background: var(--bg-line);
          overflow: hidden;
        }
        /* tick marks every 10% — reads as a calibrated scale, not a
           decorative progress bar */
        .md-readout-row__track::before {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0, transparent calc(10% - 1px),
            var(--bg-base) calc(10% - 1px), var(--bg-base) 10%
          );
          opacity: 0.5;
          pointer-events: none;
        }
        .md-readout-row__fill {
          position: absolute; inset: 0;
          width: 100%;
          border-radius: 5px;
          background: var(--gauge-color, var(--brand-teal));
          opacity: var(--gauge-opacity, 1);
          transform: scaleX(var(--gauge-scale, 0));
          transform-origin: left center;
          transition: transform 1s cubic-bezier(0.16,1,0.3,1);
        }
        [dir="rtl"] .md-readout-row__fill { transform-origin: right center; }

        @keyframes md-fade-side {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes md-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ═══ MODEL COMPARISON — small multiples ═══ */
        .md-compare {
          max-width: 1200px;
          margin: 0 auto;
          padding-top: 2.75rem;
        }
        .md-compare__title {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--ff-mono);
          font-size: 0.76rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-35);
          margin-bottom: 1.5rem;
        }
        .md-compare__title::before {
          content: "";
          flex: 0 0 20px;
          height: 1px;
          background: var(--bg-line);
        }
        .md-compare__grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          border-radius: 14px;
          overflow: hidden;
        }
        .md-compare__panel {
          background: var(--bg-surface);
          border-left: 1px solid var(--bg-line);
          border-top: 1px solid var(--bg-line);
          padding: 1.25rem 1.4rem 1.4rem;
          opacity: 0;
          transform: translateY(10px);
          animation: md-fade-up 0.5s ease forwards;
        }
        .md-compare__panel-label {
          display: block;
          font-family: var(--ff-mono);
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-60);
          margin-bottom: 1.1rem;
        }
        .md-compare__bars {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .md-compare__bar-row {
          display: grid;
          grid-template-columns: minmax(4rem, auto) 1fr auto;
          align-items: center;
          gap: 0.65rem;
        }
        .md-compare__bar-name {
          font-family: var(--ff-mono);
          font-size: 0.64rem;
          letter-spacing: 0.02em;
          color: var(--ink-60);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .md-compare__bar-track {
          position: relative;
          height: 8px;
          background: var(--bg-line);
          border-radius: 4px;
          overflow: hidden;
        }
        /* same tick-scale language as the readout bars above — one visual
           system, not two different chart styles on the same page */
        .md-compare__bar-track::before {
          content: "";
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0, transparent calc(20% - 1px),
            var(--bg-base) calc(20% - 1px), var(--bg-base) 20%
          );
          opacity: 0.5;
          pointer-events: none;
        }
        .md-compare__bar-fill {
          position: absolute;
          inset: 0;
          width: 100%;
          border-radius: 4px;
          background: var(--bar-color);
          opacity: 0.55;
          transform: scaleX(var(--bar-scale, 0));
          transform-origin: left center;
          transition: transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        [dir="rtl"] .md-compare__bar-fill { transform-origin: right center; }
        .md-compare__bar-fill--on { opacity: 1; }
        .md-compare__bar-val {
          font-family: var(--ff-mono);
          font-weight: 700;
          font-size: 0.7rem;
          color: var(--ink);
          white-space: nowrap;
          text-align: right;
          min-width: 3.4rem;
          font-variant-numeric: tabular-nums;
        }
        .md-compare__legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          margin-top: 1.25rem;
        }
        .md-compare__legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--ff-mono);
          font-size: 0.7rem;
          letter-spacing: 0.04em;
          color: var(--ink-60);
        }
        .md-compare__legend-dot {
          width: 7px; height: 7px;
          border-radius: 50%;
          background: var(--bar-color);
          flex-shrink: 0;
        }

        @media (max-width: 700px) {
          .md-compare__grid { grid-template-columns: 1fr; border-radius: 12px; }
          .md-compare__bar-row { grid-template-columns: minmax(3.6rem, auto) 1fr auto; gap: 0.4rem; }
          .md-compare__bar-name { font-size: 0.6rem; }
        }

        @media (max-width: 700px) {
          .md-readout-row { padding: 1rem 1.1rem; }
          .md-readout-row__label { font-size: 0.68rem; }
          .md-readout-row__icon svg { width: 15px; height: 15px; }
          .md-head__title { font-size: 1rem; }
          .md-head { margin-bottom: 1.25rem; }
        }
      `}</style>

      {/* section heading */}
      <div className="md-head">
        <span className="md-head__line" />
        <h2 className="md-head__title">{t("titlePrefix")} &nbsp;<em>{t("titleEm")}</em></h2>
      </div>

      {/* instrument readout — one full-width bar per key spec, styled like
          a machine's own gauge strip (tick scale + fill + digital numeral).
          Fill and value live-animated (see animGauge/animateTo above).
          Always one column at any width — there's no arc geometry to break
          on a narrow screen, the bars just get shorter. */}
      <div className="md-readout" ref={gaugeBoxRef}>
        {animGauge.map((s, i) => {
          const Icon = iconForLabel(s.label);
          const opacity = GAUGE_TINTS[i % GAUGE_TINTS.length];
          return (
            <div
              key={s.label}
              className="md-readout-row"
              style={{
                "--gauge-color": "var(--brand-teal)",
                "--gauge-opacity": opacity,
                "--gauge-scale": s.pct / 100,
                animationDelay: `${0.15 + i * 0.08}s`,
              } as React.CSSProperties}
            >
              <div className="md-readout-row__head">
                <span className="md-readout-row__label">
                  <span className="md-readout-row__icon"><Icon size={16} strokeWidth={2} /></span>
                  {s.label}
                </span>
                <span className="md-readout-row__val">
                  {formatValue(s.value)}<small>{s.unit}</small>
                </span>
              </div>
              <div className="md-readout-row__track">
                <div className="md-readout-row__fill" />
              </div>
            </div>
          );
        })}
      </div>

      {/* model comparison — small multiples: one panel per spec, each a
          per-model bar group. Every spec keeps its own scale (mixing mm,
          kW, m/min on one shared axis would misrepresent the data), and
          color encodes the model consistently across every panel. */}
      {compareSpecs.length > 0 && (
        <div className="md-compare">
          <h3 className="md-compare__title">{t("compareTitle")}</h3>
          <div className="md-compare__grid" role="group" aria-label={t("compareAria")}>
            {compareSpecs.map((s, si) => (
              <div key={s.label} className="md-compare__panel" style={{ animationDelay: `${si * 0.06}s` } as React.CSSProperties}>
                <span className="md-compare__panel-label">{s.label}</span>
                <div className="md-compare__bars">
                  {s.bars.map((b, i) => (
                    <div className="md-compare__bar-row" key={b.model}>
                      <span className="md-compare__bar-name">{b.model}</span>
                      <div className="md-compare__bar-track">
                        <div
                          className={`md-compare__bar-fill${b.model === (family.models[modelIndex] ?? "") ? " md-compare__bar-fill--on" : ""}`}
                          style={{
                            "--bar-scale": Math.max(b.value / s.max, 0.04),
                            "--bar-color": MODEL_COLORS[i % MODEL_COLORS.length],
                          } as React.CSSProperties}
                        />
                      </div>
                      <span className="md-compare__bar-val">{formatValue(b.value)}{b.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="md-compare__legend">
            {family.models.map((m, i) => (
              <span className="md-compare__legend-item" key={m}>
                <span className="md-compare__legend-dot" style={{ "--bar-color": MODEL_COLORS[i % MODEL_COLORS.length] } as React.CSSProperties} />
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
