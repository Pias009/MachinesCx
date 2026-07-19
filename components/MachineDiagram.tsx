"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import type { SpecRow, ProductFamily } from "@/lib/products";

interface Props {
  image: string;
  name: string;
  specs: SpecRow[];
  specKeys: string[];
  modelIndex: number;
  models: string[];
  family: ProductFamily;
  category?: string;
}

function extractNum(v: string): number {
  const m = v.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function extractUnit(v: string): string {
  const m = v.match(/[a-zA-Z/%°²³]+/);
  return m ? m[0] : "";
}

function SpecCounter({ value, suffix, label, decimals = 0 }: { value: number; suffix: string; label: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const t = Math.min((now - start) / 1200, 1);
          setCount((1 - Math.pow(1 - t, 3)) * value);
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="md-metric">
      <span className="md-metric__num">{count.toFixed(decimals)}<span className="md-metric__suffix">{suffix}</span></span>
      <span className="md-metric__label">{label}</span>
    </div>
  );
}

const RADAR_DEFAULTS: Record<string, string[]> = {
  "film-blowing": ["Screw Diameter", "Max Extrusion Output", "Total Power", "Film Width", "Roller Width", "Main Motor", "Max Bag Width", "Max Web Width", "Max Mechanical Speed"],
  "bag-making": ["Max Bag Width", "Total Power", "Mechanical Speed", "Bag Making Speed", "Line Speed", "Film Thickness", "Produce Length", "Max Unwind Roll Dia."],
  "recycling": ["Screw Diameter", "Max Extrusion Output", "Main Motor", "Total Power", "Output Capacity", "Film Width", "Pelletizer Speed"],
  "printing": ["Max Web Width", "Max Mechanical Speed", "Printing Colours", "Max Printing Width", "Repeat Length Range", "Machine Weight", "Max Unwind/Rewind Dia."],
};

export default function MachineDiagram({ image, name, specs, specKeys, modelIndex, models, family, category }: Props) {
  const radarRef = useRef<HTMLCanvasElement>(null);
  const radarChart = useRef<{ destroy: () => void } | null>(null);
  const [chartsReady, setChartsReady] = useState(false);

  const centerImg = family.radarImage || image;

  const metricSpecs = useMemo(() => {
    const priority = ["Max Extrusion Output", "Film Width", "Max Bag Width", "Total Power", "Max Mechanical Speed", "Bag Making Speed", "Screw Diameter", "Max Web Width"];
    const picked: { label: string; value: number; unit: string }[] = [];
    for (const key of priority) {
      if (picked.length >= 5) break;
      const row = specs.find((s) => s.label === key);
      if (row) {
        const v = row.values[Math.min(modelIndex, row.values.length - 1)];
        picked.push({ label: key, value: extractNum(v), unit: extractUnit(v) });
      }
    }
    return picked;
  }, [specs, modelIndex]);

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

  useEffect(() => { setChartsReady(true); }, []);

  useEffect(() => {
    if (!chartsReady) return;

    const initCharts = async () => {
      const { Chart, RadarController, BarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } = await import("chart.js");
      Chart.register(RadarController, BarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      const ink = isLight ? "#0d2220" : "#ffffff";
      const ink60 = isLight ? "rgba(13,34,32,0.6)" : "rgba(255,255,255,0.6)";
      const ink35 = isLight ? "rgba(13,34,32,0.35)" : "rgba(255,255,255,0.35)";
      const gridColor = isLight ? "rgba(43,191,179,0.12)" : "rgba(43,191,179,0.25)";
      const angleColor = isLight ? "rgba(13,34,32,0.07)" : "rgba(255,255,255,0.08)";

      const valueLabelsPlugin = {
        id: "valueLabels",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        afterDraw(chart: any) {
          const ctx = chart.ctx;
          const meta = chart.getDatasetMeta(0);
          if (!meta || !meta.data) return;
          ctx.save();
          ctx.font = `bold 12px ui-monospace,SFMono-Regular,Menlo,monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          meta.data.forEach((element: any, i: number) => {
            const pt = element.getCenterPoint();
            const val = radarSpecs[i];
            const txt = val ? `${Math.round(val.value)}${val.unit}` : "";
            if (!txt) return;
            ctx.fillStyle = "#2bbfb3";
            const yOff = element.active ? -22 : -18;
            ctx.fillText(txt, pt.x, pt.y + yOff);
            ctx.fillStyle = isLight ? "rgba(13,34,32,0.3)" : "rgba(255,255,255,0.15)";
            ctx.font = `10px ui-monospace,SFMono-Regular,Menlo,monospace`;
            ctx.fillText(val.label, pt.x, pt.y + yOff + 16);
          });
          ctx.restore();
        },
      };

      if (radarRef.current && radarSpecs.length >= 3) {
        if (radarChart.current) radarChart.current.destroy();
        const ctx = radarRef.current.getContext("2d");
        if (!ctx) return;

        radarChart.current = new Chart(ctx, {
          type: "radar",
          data: {
            labels: radarSpecs.map((s) => s.label),
            datasets: [{
              label: name,
              data: radarSpecs.map((s) => s.value),
              backgroundColor: "rgba(43,191,179,0.35)",
              borderColor: "#2bbfb3",
              borderWidth: 4,
              pointBackgroundColor: "#2bbfb3",
              pointBorderColor: isLight ? "#ffffff" : "#080e0d",
              pointBorderWidth: 4,
              pointRadius: 7,
              pointHoverRadius: 10,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 1200, easing: "easeOutQuart" },
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: isLight ? "#fff" : "#0d1614",
                titleColor: isLight ? "#0d2220" : "#fff",
                bodyColor: isLight ? "rgba(13,34,32,0.72)" : "rgba(255,255,255,0.78)",
                borderColor: "rgba(43,191,179,0.3)",
                borderWidth: 1,
                padding: 12,
                displayColors: false,
                callbacks: {
                  label: (ctx) => ` ${Math.round(ctx.parsed.r)} ${radarSpecs[ctx.dataIndex]?.unit ?? ""}`,
                },
              },
            },
            scales: {
              r: {
                beginAtZero: true,
                suggestedMin: 0,
                ticks: {
                  color: ink35,
                  backdropColor: "transparent",
                  font: { size: 11 },
                  stepSize: 0,
                  display: false,
                },
                grid: {
                  color: gridColor,
                  lineWidth: 1.5,
                },
                angleLines: {
                  color: angleColor,
                  lineWidth: 1.5,
                },
                pointLabels: {
                  display: false,
                },
              },
            },
          },
          plugins: [valueLabelsPlugin],
        });
      }
    };

    initCharts();
    return () => {
      if (radarChart.current) radarChart.current.destroy();
    };
  }, [chartsReady, radarSpecs, name]);

  if (radarSpecs.length < 3) return null;

  return (
    <div className="md-section">
      <style suppressHydrationWarning>{`
        .md-section {
          padding: 2.5rem 0 3rem;
          width: 100%;
        }

        /* ═══ SECTION HEADING ═══ */
        .md-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }
        .md-head__line {
          flex: 0 0 28px;
          height: 2px;
          background: var(--brand-teal);
        }
        .md-head__title {
          font-family: var(--ff-display);
          font-size: clamp(1.1rem, 2.5vw, 1.5rem);
          letter-spacing: -0.01em;
          color: var(--ink);
        }
        .md-head__title em {
          font-style: normal;
          color: var(--brand-teal);
        }

        /* ═══ RADAR HERO ═══ */
        .md-radar-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
          position: relative;
        }
        .md-radar-box {
          position: relative;
          width: 100%;
          max-width: 720px;
          aspect-ratio: 1;
          opacity: 0;
          animation: md-fade-up 0.7s ease 0.15s forwards;
        }
        .md-radar-box::before {
          content: "";
          position: absolute;
          inset: -40px;
          background: radial-gradient(ellipse at center, rgba(43,191,179,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
          border-radius: 50%;
        }
        .md-radar-canvas {
          width: 100% !important;
          height: 100% !important;
          position: relative;
          z-index: 1;
        }
        .md-radar-img {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid rgba(43,191,179,0.35);
          pointer-events: none;
          z-index: 3;
          box-shadow: 0 0 40px rgba(43,191,179,0.25), 0 0 80px rgba(43,191,179,0.08);
        }

        /* ═══ METRIC CARDS ═══ */
        .md-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto 2rem;
        }
        .md-metric {
          text-align: center;
          padding: 1.25rem 0.75rem;
          border: 1px solid var(--bg-line);
          opacity: 0;
          transform: translateY(16px);
          animation: md-fade-up 0.5s ease forwards;
          background: rgba(43,191,179,0.03);
        }
        .md-metric:nth-child(1) { animation-delay: 0.25s; }
        .md-metric:nth-child(2) { animation-delay: 0.3s; }
        .md-metric:nth-child(3) { animation-delay: 0.35s; }
        .md-metric:nth-child(4) { animation-delay: 0.4s; }
        .md-metric:nth-child(5) { animation-delay: 0.45s; }
        .md-metric__num {
          font-family: var(--ff-display);
          font-size: clamp(1.8rem, 3.5vw, 2.4rem);
          line-height: 1;
          color: var(--brand-teal);
          display: block;
          font-weight: 700;
        }
        .md-metric__suffix {
          font-family: var(--ff-mono);
          font-size: 0.6rem;
          letter-spacing: 0.06em;
          color: var(--ink-35);
          margin-left: 0.15rem;
        }
        .md-metric__label {
          font-family: var(--ff-mono);
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-60);
          display: block;
          margin-top: 0.4rem;
          font-weight: 600;
        }

        /* ═══ MODEL CHIPS ═══ */
        .md-models {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
          opacity: 0;
          animation: md-fade-up 0.5s ease 0.5s forwards;
        }
        .md-model-chip {
          font-family: var(--ff-mono);
          font-size: 0.7rem;
          letter-spacing: 0.06em;
          padding: 0.4rem 0.9rem;
          border: 1px solid var(--bg-line);
          color: var(--ink-60);
          font-weight: 500;
        }
        .md-model-chip--on {
          border-color: var(--brand-teal);
          color: var(--brand-teal);
          background: rgba(43,191,179,0.08);
        }

        @keyframes md-fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media(max-width: 700px) {
          .md-radar-box { max-width: 90vw; }
          .md-radar-box::before { display: none; }
          .md-radar-img { width: 64px; height: 64px; border-width: 2px; }
          .md-metrics { grid-template-columns: repeat(2, 1fr); gap: 0.6rem; }
          .md-metric { padding: 0.85rem 0.5rem; }
          .md-metric__num { font-size: 1.3rem; }
          .md-metric__suffix { font-size: 0.5rem; }
          .md-metric__label { font-size: 0.55rem; }
          .md-model-chip { font-size: 0.6rem; padding: 0.3rem 0.65rem; }
          .md-head__title { font-size: 1rem; }
          .md-head { margin-bottom: 1.25rem; }
        }
      `}</style>

      {/* section heading */}
      <div className="md-head">
        <span className="md-head__line" />
        <h2 className="md-head__title">Performance &nbsp;<em>Dashboard</em></h2>
      </div>

      {/* radar chart — massive hero */}
      <div className="md-radar-wrap">
        <div className="md-radar-box">
          <canvas ref={radarRef} className="md-radar-canvas" />
          <img src={centerImg} alt="" className="md-radar-img" />
        </div>
      </div>

      {/* key metric cards */}
      {metricSpecs.length > 0 && (
        <div className="md-metrics">
          {metricSpecs.map((m) => (
            <SpecCounter key={m.label} value={m.value} suffix={m.unit} label={m.label} />
          ))}
        </div>
      )}

      {/* model chips */}
      {models.length > 1 && (
        <div className="md-models">
          {models.map((m, i) => (
            <span key={m} className={`md-model-chip${i === modelIndex ? " md-model-chip--on" : ""}`}>{m}</span>
          ))}
        </div>
      )}
    </div>
  );
}
