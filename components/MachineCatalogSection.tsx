"use client";
import { useState } from "react";
import Link from "next/link";
import { families, categories } from "@/lib/products";

const CAT_LABELS: Record<string, string> = {
  "film-blowing": "Film Blowing",
  "bag-making":   "Bag Making",
  "recycling":    "Recycling",
  "printing":     "Flexo Printing",
};

const CAT_ICONS: Record<string, string> = {
  "film-blowing": "◈",
  "bag-making":   "◇",
  "recycling":    "↺",
  "printing":     "▦",
};

/* quick key specs pulled from family data */
/* slug → actual image filename when it doesn't match 1:1 */
const IMG_OVERRIDE: Record<string, string> = {
  "flexo-2c": "flexo-1",
  "flexo-4c": "flexo-2",
  "flexo-6c": "flexo-6c-nobg",
  "flexo-8c": "flexo-4",
};

function machineImg(slug: string) {
  const name = IMG_OVERRIDE[slug] ?? slug;
  return `/machines/${name}.png`;
}

const KEY_SPECS: Record<string, { stat: string; label: string }> = {
  "abcde-2200":         { stat: "400 kg/h",   label: "Max output"     },
  "abc-multilayer-small":{ stat: "3-layer",   label: "Co-extrusion"   },
  "abc-multilayer-large":{ stat: "5-layer",   label: "Co-extrusion"   },
  "abc-cx-series":      { stat: "3-layer",    label: "Multi-layer"    },
  "aba-1000-1500":      { stat: "3-layer",    label: "ABA"            },
  "aba-800-1200":       { stat: "4-screw",    label: "ABA"            },
  "aba-cx-series":      { stat: "3-layer",    label: "CX Series"      },
  "s-mini-double":      { stat: "×2 heads",   label: "Double-head"    },
  "s-wide":             { stat: "2100 mm",    label: "Roller width"   },
  "s-standard":         { stat: "1000 mm",    label: "Max width"      },
  "sb-printing-line":   { stat: "6-colour",   label: "Blow + print"   },
  "cx-25-lab":          { stat: "25 mm",      label: "Benchtop"       },
  "t-pro-heatseal":     { stat: "300 pcs/min",label: "Throughput"     },
  "tg-pro":             { stat: "500 mm",     label: "Bag width"      },
  "tb-320":             { stat: "×6 lanes",   label: "Multi-lane"     },
  "f-pro-bottomseal":   { stat: "1600 mm",    label: "Max width"      },
  "heatseal-750-1150":  { stat: "1150 mm",    label: "Max width"      },
  "heatseal-750-1150-hd":{ stat: "Heavy",     label: "Duty grade"     },
  "heatseal-narrow":    { stat: "450 mm",     label: "Max width"      },
  "rb-vegetable":       { stat: "×2 lanes",   label: "Vest & veg"     },
  "rgb-rollbag":        { stat: "1200 mm",    label: "Roll bag"       },
  "rollbag-continuous": { stat: "Continuous", label: "Roll bag"       },
  "sb-pe-pbat":         { stat: "PE/PBAT",    label: "Material"       },
  "cx-260":             { stat: "260 mm",     label: "Width"          },
  "gb-garbage":         { stat: "1200 mm",    label: "Roll bag"       },
  "cx-pelletizing":     { stat: "99%",        label: "Resin recovery" },
  "flexo-2c":           { stat: "2-colour",   label: "CI flexo"       },
  "flexo-4c":           { stat: "4-colour",   label: "CI flexo"       },
  "flexo-6c":           { stat: "260 m/min",  label: "Print speed"    },
  "flexo-8c":           { stat: "8-colour",   label: "CI flexo"       },
};

export default function MachineCatalogSection() {
  const [activeTab, setActiveTab] = useState<string>("all");

  const totalFamilies = families.length;
  const totalModels   = families.reduce((n, f) => n + f.models.length, 0);

  const filtered = activeTab === "all"
    ? families
    : families.filter(f => f.category === activeTab);

  const tabCounts: Record<string, number> = { all: families.length };
  categories.forEach(c => { tabCounts[c.slug] = families.filter(f => f.category === c.slug).length; });

  return (
    <>
      <style suppressHydrationWarning>{`
        .mcs {
          background: var(--bg-base);
          border-top: 1px solid rgba(255,255,255,0.06);
          padding: clamp(4rem,8vw,8rem) 0;
        }
        .mcs__wrap {
          max-width: 1600px; margin: 0 auto;
          padding-inline: clamp(1rem,3vw,2.5rem);
        }

        /* ── Header ── */
        .mcs__header {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: 2rem;
          flex-wrap: wrap;
          margin-bottom: clamp(2rem,4vw,3.5rem);
        }
        .mcs__badge {
          display: inline-flex; align-items: center; gap: .45rem;
          font-family: var(--ff-mono); font-size: .62rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: var(--brand-red); margin-bottom: .75rem;
        }
        .mcs__badge::before {
          content: ""; display: inline-block;
          width: 18px; height: 1px;
          background: var(--brand-red);
        }
        .mcs__title {
          font-family: var(--ff-display);
          font-size: clamp(3rem,6vw,6.5rem);
          line-height: .88; letter-spacing: -.02em;
          color: var(--ink); margin: 0 0 .6rem;
        }
        .mcs__title em { font-style: normal; color: var(--brand-teal); }
        .mcs__sub {
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--ink-60); margin: 0;
        }
        .mcs__cta {
          display: inline-flex; align-items: center; gap: .6rem;
          padding: .75rem 1.75rem;
          background: transparent; color: var(--ink-60);
          border: 1px solid rgba(255,255,255,0.12);
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .1em; text-transform: uppercase;
          text-decoration: none; white-space: nowrap;
          transition: border-color .18s, color .18s;
          flex-shrink: 0;
        }
        .mcs__cta:hover { border-color: var(--brand-teal); color: var(--brand-teal); }
        [data-theme="light"] .mcs__cta { border-color: rgba(0,0,0,0.15); }
        [data-theme="light"] .mcs__cta:hover { border-color: var(--brand-teal); color: var(--brand-teal); }

        /* ── Tabs ── */
        .mcs__tabs {
          display: flex; align-items: center; gap: .5rem;
          flex-wrap: wrap;
          margin-bottom: clamp(1.5rem,3vw,2.5rem);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          padding-bottom: 0;
        }
        [data-theme="light"] .mcs__tabs { border-bottom-color: rgba(0,0,0,0.08); }

        .mcs__tab {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .65rem 1.1rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-60);
          cursor: pointer;
          transition: color .15s, border-color .15s;
          white-space: nowrap;
        }
        .mcs__tab:hover { color: var(--ink); }
        .mcs__tab--active {
          color: var(--brand-teal);
          border-bottom-color: var(--brand-teal);
        }
        .mcs__tab-icon { font-size: .75rem; opacity: .7; }
        .mcs__tab-count {
          font-size: .55rem;
          background: rgba(255,255,255,0.08);
          padding: .15rem .4rem;
          border-radius: 2px;
          color: var(--ink-60);
        }
        [data-theme="light"] .mcs__tab-count { background: rgba(0,0,0,0.07); }
        .mcs__tab--active .mcs__tab-count {
          background: rgba(43,191,179,0.12);
          color: var(--brand-teal);
        }

        /* ── Grid ── */
        .mcs__grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
        }
        [data-theme="light"] .mcs__grid {
          background: rgba(0,0,0,0.07);
          border-color: rgba(0,0,0,0.07);
        }

        /* ── Machine card ── */
        .mcs-card {
          background: var(--bg-base);
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
          min-height: 180px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          transition: background .18s;
        }

        /* machine image — bottom-right, partially visible */
        .mcs-card__bg {
          position: absolute;
          bottom: -8%; right: -4%;
          width: 65%; height: 90%;
          pointer-events: none;
        }
        .mcs-card__bg img {
          width: 100%; height: 100%;
          object-fit: contain;
          object-position: right bottom;
          filter: blur(1.5px) saturate(0.7);
          opacity: 0.22;
          transition: opacity .3s, transform .4s cubic-bezier(0.16,1,0.3,1);
          transform: scale(1);
        }
        .mcs-card:hover .mcs-card__bg img {
          opacity: 0.38;
          transform: scale(1.04);
        }
        [data-theme="light"] .mcs-card__bg img {
          filter: blur(1.5px) saturate(0.5);
          opacity: 0.18;
        }
        [data-theme="light"] .mcs-card:hover .mcs-card__bg img { opacity: 0.3; }

        /* left-side fade so image doesn't clash with text */
        .mcs-card__scrim {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            var(--bg-base) 30%,
            transparent 75%
          );
          pointer-events: none;
        }
        [data-theme="light"] .mcs-card__scrim {
          background: linear-gradient(
            to right,
            #fff 30%,
            transparent 75%
          );
        }

        .mcs-card::after {
          content: "";
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px;
          background: var(--brand-teal);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .22s cubic-bezier(0.16,1,0.3,1);
        }
        .mcs-card:hover::after { transform: scaleX(1); }
        [data-theme="light"] .mcs-card { background: #fff; }

        .mcs-card__top {}
        .mcs-card__cat {
          font-family: var(--ff-mono); font-size: .55rem;
          letter-spacing: .14em; text-transform: uppercase;
          color: var(--brand-teal); opacity: .7;
          margin-bottom: .4rem;
        }
        .mcs-card__series {
          font-family: var(--ff-mono); font-size: .6rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-red);
          margin-bottom: .35rem;
        }
        .mcs-card__name {
          font-family: var(--ff-display); font-size: 1.05rem;
          line-height: 1.1; color: var(--ink);
          letter-spacing: -.01em;
        }

        .mcs-card__bottom {
          display: flex; align-items: flex-end;
          justify-content: space-between; gap: .5rem;
          margin-top: 1.25rem;
        }
        .mcs-card__stat {
          font-family: var(--ff-display); font-size: 1.6rem;
          line-height: 1; color: var(--ink); letter-spacing: -.02em;
        }
        .mcs-card__stat-label {
          font-family: var(--ff-mono); font-size: .55rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-60); display: block; margin-top: .15rem;
        }
        .mcs-card__arrow {
          width: 30px; height: 30px;
          border: 1px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-60); flex-shrink: 0;
          transition: background .18s, border-color .18s, color .18s;
        }
        [data-theme="light"] .mcs-card__arrow { border-color: rgba(0,0,0,0.12); }
        .mcs-card:hover .mcs-card__arrow {
          background: var(--brand-teal);
          border-color: var(--brand-teal);
          color: #fff;
        }

        /* ── Footer ── */
        .mcs__footer {
          margin-top: 2rem;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        [data-theme="light"] .mcs__footer { border-top-color: rgba(0,0,0,0.07); }
        .mcs__footer-count {
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .08em; text-transform: uppercase;
          color: var(--ink-60);
        }
        .mcs__footer-count strong {
          font-family: var(--ff-display); font-size: 1.1rem;
          color: var(--ink); letter-spacing: -.01em;
          margin-right: .3rem;
        }
        .mcs__footer-link {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-teal); text-decoration: none;
          transition: opacity .15s;
        }
        .mcs__footer-link:hover { opacity: .7; }

        /* ── Animation ── */
        @keyframes mcs-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .mcs-card {
          animation: mcs-fade-in .32s cubic-bezier(0.16,1,0.3,1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .mcs-card { animation: none; }
        }

        /* ── Responsive ── */
        @media(max-width:900px) {
          .mcs__grid { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }
        }
        @media(max-width:640px) {
          .mcs { padding: clamp(2.5rem,6vw,4rem) 0; }
          .mcs__header { flex-direction: column; align-items: flex-start; gap: 1.25rem; }
          .mcs__title { font-size: clamp(2.5rem,9vw,3.5rem); }
          .mcs__grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
          .mcs-card { padding: 1.1rem; min-height: 150px; }
          .mcs-card__name { font-size: .92rem; }
          .mcs-card__stat { font-size: 1.25rem; }
        }
        @media(max-width:400px) {
          .mcs__grid { grid-template-columns: 1fr 1fr; }
        }

        /* ── Light mode ── */
        [data-theme="light"] .mcs { background: #f5f8f8; }
        [data-theme="light"] .mcs__title { color: #0d2220; }
        [data-theme="light"] .mcs__sub   { color: rgba(13,34,32,0.5); }
        [data-theme="light"] .mcs__badge { color: var(--brand-red); }
        [data-theme="light"] .mcs__tab   { color: rgba(13,34,32,0.5); }
        [data-theme="light"] .mcs__tab:hover { color: #0d2220; }
        [data-theme="light"] .mcs-card__name { color: #0d2220; }
        [data-theme="light"] .mcs-card__stat { color: #0d2220; }
        [data-theme="light"] .mcs-card__stat-label { color: rgba(13,34,32,0.5); }
      `}</style>

      <section className="mcs" aria-label="Machine catalogue">
        <div className="mcs__wrap">

          {/* ── Header ── */}
          <div className="mcs__header">
            <div>
              <div className="mcs__badge">Machine Catalogue</div>
              <h2 className="mcs__title">
                Every machine.<br />
                <em>Find yours.</em>
              </h2>
              <p className="mcs__sub">
                {totalFamilies} product families · {totalModels}+ models · shipped to 80+ countries
              </p>
            </div>
            <Link href="/products" className="mcs__cta">
              Full catalogue
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* ── Category tabs ── */}
          <div className="mcs__tabs" role="tablist" aria-label="Filter by category">
            <button
              role="tab"
              aria-selected={activeTab === "all"}
              className={`mcs__tab${activeTab === "all" ? " mcs__tab--active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All machines
              <span className="mcs__tab-count">{tabCounts.all}</span>
            </button>
            {categories.map(c => (
              <button
                key={c.slug}
                role="tab"
                aria-selected={activeTab === c.slug}
                className={`mcs__tab${activeTab === c.slug ? " mcs__tab--active" : ""}`}
                onClick={() => setActiveTab(c.slug)}
              >
                <span className="mcs__tab-icon">{CAT_ICONS[c.slug]}</span>
                {CAT_LABELS[c.slug]}
                <span className="mcs__tab-count">{tabCounts[c.slug]}</span>
              </button>
            ))}
          </div>

          {/* ── Machine grid ── */}
          <div className="mcs__grid" role="tabpanel">
            {filtered.map((fam, i) => {
              const spec = KEY_SPECS[fam.slug];
              return (
                <Link
                  key={fam.slug}
                  href={`/products/${fam.category}/${fam.slug}`}
                  className="mcs-card"
                  style={{ animationDelay: `${Math.min(i, 15) * 28}ms` }}
                >
                  <div className="mcs-card__bg" aria-hidden="true">
                    <img src={machineImg(fam.slug)} alt="" loading="lazy" />
                  </div>
                  <div className="mcs-card__scrim" aria-hidden="true" />
                  <div className="mcs-card__top" style={{ position: "relative", zIndex: 1 }}>
                    <div className="mcs-card__cat">{CAT_LABELS[fam.category]}</div>
                    <div className="mcs-card__series">{fam.series}</div>
                    <div className="mcs-card__name">{fam.name.split("—")[0].trim()}</div>
                  </div>
                  <div className="mcs-card__bottom" style={{ position: "relative", zIndex: 1 }}>
                    {spec ? (
                      <div>
                        <div className="mcs-card__stat">{spec.stat}</div>
                        <span className="mcs-card__stat-label">{spec.label}</span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="mcs-card__arrow" aria-hidden="true">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* ── Footer ── */}
          <div className="mcs__footer">
            <p className="mcs__footer-count">
              <strong>{filtered.length}</strong>
              {filtered.length === 1 ? "product family" : "product families"} shown
            </p>
            <Link href="/products" className="mcs__footer-link">
              View all specs &amp; datasheets
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}
