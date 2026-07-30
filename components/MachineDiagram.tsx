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

/* SVG path for a ring segment sweeping from startAngle to endAngle (deg,
   0 = +x axis, clockwise) at given inner/outer radius, centered at cx/cy */
function ringPath(cx: number, cy: number, rInner: number, rOuter: number, startDeg: number, endDeg: number) {
  const toXY = (r: number, deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };
  const [x1, y1] = toXY(rOuter, startDeg);
  const [x2, y2] = toXY(rOuter, endDeg);
  const [x3, y3] = toXY(rInner, endDeg);
  const [x4, y4] = toXY(rInner, startDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

/* ring color per position, outermost first — echoes the reference's
   orange/teal/graphite/blue band coloring */
const GAUGE_COLORS = ["#f5822a", "#2bbfb3", "#516168", "#2b8ce6"];

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
          padding: 3.5rem 0 4.5rem;
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
        .md-gauge-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 2.25rem;
          position: relative;
        }
        .md-gauge-box {
          position: relative;
          width: 100%;
          max-width: 1600px;
          aspect-ratio: 1.55;
          opacity: 0;
          animation: md-fade-up 0.7s ease 0.15s forwards;
        }
        .md-gauge-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }
        .md-gauge-ring {
          transition: opacity 0.3s;
        }
        .md-gauge-ring-bg {
          fill: var(--bg-line);
          opacity: 0.5;
        }
        .md-gauge-ring-fill {
          fill: var(--ring-color, var(--brand-teal));
          filter: drop-shadow(0 2px 10px rgba(43,191,179,0.18));
        }
        .md-gauge-center {
          fill: var(--bg-base);
          stroke: var(--bg-line);
          stroke-width: 1;
        }
        .md-gauge-center-label {
          font-family: var(--ff-mono);
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          fill: var(--ink-60);
        }
        .md-gauge-center-em {
          font-family: var(--ff-display);
          font-size: 15px;
          fill: var(--brand-teal);
          font-weight: 700;
        }
        .md-gauge-dot {
          fill: var(--ring-color, var(--brand-teal));
        }
        .md-gauge-line {
          stroke: var(--ring-color, var(--brand-teal));
          stroke-width: 1;
          opacity: 0.55;
        }

        .md-gauge-callout {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 1.1rem;
          opacity: 0;
          transform: translateX(-10px);
          animation: md-fade-side 0.5s ease forwards;
        }
        .md-gauge-callout__icon {
          flex: 0 0 auto;
          width: 84px;
          height: 84px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-base);
          border: 1px solid var(--bg-line);
          box-shadow: 0 6px 18px -8px rgba(0,0,0,0.25);
          color: var(--ring-color, var(--brand-teal));
        }
        .md-gauge-callout__text {
          display: flex;
          flex-direction: column;
          line-height: 1.15;
        }
        .md-gauge-callout__val {
          font-family: var(--ff-display);
          font-size: 2.4rem;
          font-weight: 700;
          color: var(--ring-color, var(--brand-teal));
        }
        .md-gauge-callout__label {
          font-family: var(--ff-mono);
          font-size: 1rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--ink-35);
          white-space: nowrap;
        }

        @keyframes md-fade-side {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* ═══ LEGEND LIST ═══ */
        .md-legend {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 0;
          max-width: 1600px;
          margin: 0 auto 2rem;
          border-top: 1px solid var(--bg-line);
        }
        .md-legend-item {
          padding: 2rem 2rem 2rem 0;
          opacity: 0;
          transform: translateY(10px);
          animation: md-fade-up 0.5s ease forwards;
        }
        .md-legend-item:nth-child(1) { animation-delay: 0.25s; }
        .md-legend-item:nth-child(2) { animation-delay: 0.32s; }
        .md-legend-item:nth-child(3) { animation-delay: 0.39s; }
        .md-legend-item:nth-child(4) { animation-delay: 0.46s; }
        .md-legend-item__num {
          font-family: var(--ff-mono);
          font-size: 1.05rem;
          letter-spacing: 0.08em;
          color: var(--ring-color, var(--brand-teal));
          font-weight: 700;
        }
        .md-legend-item__num::before {
          content: "";
          display: inline-block;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: var(--ring-color, var(--brand-teal));
          margin-right: 0.5rem;
          vertical-align: middle;
        }
        .md-legend-item__label {
          font-family: var(--ff-mono);
          font-size: 1.1rem;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ink);
          font-weight: 600;
          margin-top: 0.4rem;
        }
        .md-legend-item__val {
          font-family: var(--ff-body);
          font-size: 1.25rem;
          color: var(--ink-60);
          margin-top: 0.3rem;
        }

        @keyframes md-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media(max-width: 700px) {
          .md-gauge-box { max-width: 92vw; aspect-ratio: 1.05; }
          .md-gauge-callout__icon { width: 26px; height: 26px; }
          .md-gauge-callout__val { font-size: 0.8rem; }
          .md-gauge-callout__label { font-size: 0.5rem; }
          .md-legend { grid-template-columns: repeat(2, 1fr); gap: 0.75rem 0; }
          .md-head__title { font-size: 1rem; }
          .md-head { margin-bottom: 1.25rem; }
        }
      `}</style>

      {/* section heading */}
      <div className="md-head">
        <span className="md-head__line" />
        <h2 className="md-head__title">{t("titlePrefix")} &nbsp;<em>{t("titleEm")}</em></h2>
      </div>

      {/* concentric ring gauge — top specs as nested quarter-arcs, fill
          and value live-animated (see animGauge/animateTo above) */}
      <div className="md-gauge-wrap">
        <div className="md-gauge-box" ref={gaugeBoxRef}>
          <svg viewBox="0 0 620 400" className="md-gauge-svg">
            {animGauge.map((s, i) => {
              const rOuter = 190 - i * 44;
              const rInner = rOuter - 34;
              const color = GAUGE_COLORS[i % GAUGE_COLORS.length];
              const sweep = (s.pct / 100) * 90;
              const tipY = 380 - rOuter;
              return (
                <g key={s.label} className="md-gauge-ring" style={{ "--ring-color": color } as React.CSSProperties}>
                  <path d={ringPath(240, 380, rInner, rOuter, -90, 0)} className="md-gauge-ring-bg" />
                  <path
                    d={ringPath(240, 380, rInner, rOuter, -90, -90 + sweep)}
                    className="md-gauge-ring-fill"
                    style={{ "--ring-color": color } as React.CSSProperties}
                  />
                  {/* callout line from the arc's leading tip out to the left */}
                  <line
                    x1={240}
                    y1={tipY}
                    x2={70 - i * 6}
                    y2={tipY}
                    className="md-gauge-line"
                    style={{ "--ring-color": color } as React.CSSProperties}
                  />
                  <circle cx={240} cy={tipY} r={3.5} className="md-gauge-dot" style={{ "--ring-color": color } as React.CSSProperties} />
                </g>
              );
            })}
          </svg>

          {/* icon + value callouts, positioned to match each ring's tip */}
          {animGauge.map((s, i) => {
            const rOuter = 190 - i * 44;
            const topPct = ((380 - rOuter) / 400) * 100;
            const leftPct = ((70 - i * 6) / 620) * 100;
            const Icon = iconForLabel(s.label);
            const color = GAUGE_COLORS[i % GAUGE_COLORS.length];
            return (
              <div
                key={s.label}
                className="md-gauge-callout"
                style={{
                  top: `${topPct}%`,
                  left: `${leftPct}%`,
                  transform: "translate(-100%, -50%)",
                  "--ring-color": color,
                  animationDelay: `${0.25 + i * 0.08}s`,
                } as React.CSSProperties}
              >
                <span className="md-gauge-callout__icon"><Icon size={38} strokeWidth={2} /></span>
                <span className="md-gauge-callout__text">
                  <span className="md-gauge-callout__val">{formatValue(s.value)}{s.unit}</span>
                  <span className="md-gauge-callout__label">{s.label}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* numbered legend — one row per ring, outermost first */}
      {animGauge.length > 0 && (
        <div className="md-legend">
          {animGauge.map((s, i) => (
            <div key={s.label} className="md-legend-item" style={{ "--ring-color": GAUGE_COLORS[i % GAUGE_COLORS.length] } as React.CSSProperties}>
              <span className="md-legend-item__num">0{i + 1}</span>
              <span className="md-legend-item__label">{s.label}</span>
              <span className="md-legend-item__val">{formatValue(s.value)}{s.unit}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
