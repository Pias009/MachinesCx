"use client";
import { useEffect } from "react";

const SERVICES = [
  {
    num: "01",
    title: "Film Blowing",
    desc: "Single, double and five-layer blown-film lines for PE, PP, PBAT+PLA and barrier films — from 300 mm to 3000 mm layflat width.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="10" stroke="currentColor" strokeWidth="1.6"/>
        <ellipse cx="16" cy="16" rx="4" ry="10" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M6 16h20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M8 10.5C10 12 13 13 16 13s6-1 8-2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M8 21.5C10 20 13 19 16 19s6 1 8 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    tags: ["PE · PP · PBAT+PLA", "Up to 5-layer co-ex", "300–3000 mm layflat"],
  },
  {
    num: "02",
    title: "Bag Making",
    desc: "Heat-seal, bottom-seal and vest-bag converters with servo-driven multi-lane output up to 300 pcs/min for flat, T-shirt and roll bags.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="6" y="10" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M11 10V8a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M10 18h12M10 22h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    tags: ["Up to 300 pcs/min", "Multi-lane servo", "Heat · Bottom · Vest seal"],
  },
  {
    num: "03",
    title: "Recycling",
    desc: "Pelletising and washing lines that convert post-consumer PE, PP and PET film into clean, reusable granules — closing the plastic loop.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 6l4 7H12l4-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8.5 20.5l-2-7 6 3-4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M23.5 20.5l2-7-6 3 4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
    tags: ["PE · PP · PET film", "Washing + pelletising", "Closed-loop capable"],
  },
  {
    num: "04",
    title: "Flexo Printing",
    desc: "2 to 6 colour central-impression flexographic presses with ceramic anilox at 200–600 LPI, ±0.1 mm registration, speeds to 260 m/min.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="12" width="24" height="12" rx="2" stroke="currentColor" strokeWidth="1.6"/>
        <circle cx="16" cy="18" r="4" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M8 12V9a2 2 0 012-2h12a2 2 0 012 2v3" stroke="currentColor" strokeWidth="1.4"/>
        <circle cx="16" cy="18" r="1.5" fill="currentColor" opacity=".5"/>
      </svg>
    ),
    tags: ["2–6 colour CI press", "±0.1 mm registration", "Up to 260 m/min"],
  },
  {
    num: "05",
    title: "Engineering Support",
    desc: "From site survey and line layout through FAT, installation, training, and remote diagnostics — our engineers stay with you for the life of the machine.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M7.76 7.76l2.83 2.83M21.41 21.41l2.83 2.83M7.76 24.24l2.83-2.83M21.41 10.59l2.83-2.83" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="2" fill="currentColor" opacity=".6"/>
      </svg>
    ),
    tags: ["Site survey + FAT", "On-site commissioning", "Remote HMI diagnostics"],
  },
  {
    num: "06",
    title: "After-Sales & Parts",
    desc: "Genuine spare parts dispatched within 48 hours worldwide. Annual preventive-maintenance contracts and on-call engineering available on request.",
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M12 4H8a2 2 0 00-2 2v20a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="12" y="2" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
        <path d="M10 14h12M10 18h8M10 22h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    tags: ["48-hour parts dispatch", "Annual maintenance", "Worldwide coverage"],
  },
];

export default function ServicesSection() {
  return (
    <>
      <style suppressHydrationWarning>{`
        .sv {
          position: relative;
          background: #020208;
          padding: clamp(5rem,9vw,9rem) 0;
        }

        .sv__bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .sv__bg > div {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
        }

        .sv__overlay {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: rgba(2,2,8,.52);
        }

        .sv__wrap {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding-inline: clamp(1.5rem,5vw,4rem);
        }

        .sv__header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: clamp(3.5rem,6vw,6rem);
        }
        .sv__eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .24em; text-transform: uppercase;
          color: #e11d48; margin-bottom: 1.1rem;
        }
        .sv__eyebrow::before,
        .sv__eyebrow::after { content:""; width:2rem; height:1px; background:#e11d48; }
        .sv__title {
          font-family: var(--ff-display);
          font-size: clamp(2.8rem,5.5vw,5rem);
          line-height: .92; color: #f8fafc;
          letter-spacing: -.01em; margin: 0 0 1.2rem;
        }
        .sv__title em { font-style:normal; color:#e11d48; }
        .sv__sub {
          font-size: clamp(.875rem,1.1vw,.975rem);
          color: rgba(248,250,252,.42);
          line-height: 1.8; max-width: 50ch;
        }

        .sv__grid {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 1.25rem;
        }
        @media(max-width:900px){ .sv__grid{ grid-template-columns: repeat(2,1fr); } }
        @media(max-width:540px){ .sv__grid{ grid-template-columns: 1fr; } }

        .sv-card {
          position: relative;
          border-radius: 1.25rem;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.04);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          padding: 2rem 2rem 2.25rem;
          cursor: default;
        }
        .sv-card::before {
          content:"";
          position:absolute; inset:0;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(255,255,255,.06) 0%, transparent 50%);
          pointer-events:none;
        }
        .sv-card:hover {
          border-color: rgba(225,29,72,.4);
          background: rgba(225,29,72,.08);
          box-shadow:
            0 0 0 1px rgba(225,29,72,.18),
            0 20px 40px rgba(0,0,0,.5),
            inset 0 1px 0 rgba(255,255,255,.08);
        }

        .sv-card__head {
          display: flex; align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .sv-card__icon {
          width: 54px; height: 54px;
          border-radius: .875rem;
          background: rgba(225,29,72,.1);
          border: 1px solid rgba(225,29,72,.2);
          display: flex; align-items:center; justify-content:center;
          color: #e11d48;
        }
        .sv-card:hover .sv-card__icon {
          background: rgba(225,29,72,.2);
          border-color: rgba(225,29,72,.45);
        }
        .sv-card__num {
          font-family: var(--ff-mono); font-size: .6rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: rgba(248,250,252,.2);
          padding-top: .2rem;
        }
        .sv-card__title {
          font-family: var(--ff-display);
          font-size: clamp(1.4rem,2.2vw,1.9rem);
          line-height: 1; color: #f8fafc;
          letter-spacing: -.01em; margin: 0 0 .75rem;
        }
        .sv-card__desc {
          font-size: .875rem;
          color: rgba(248,250,252,.45);
          line-height: 1.75; margin: 0 0 1.4rem;
        }
        .sv-card__tags {
          display: flex; flex-wrap: wrap; gap: .4rem;
        }
        .sv-card__tag {
          font-family: var(--ff-mono); font-size: .58rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(248,250,252,.4);
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: .375rem;
          padding: .25rem .55rem;
        }
        .sv-card:hover .sv-card__tag {
          color: rgba(225,29,72,.85);
          border-color: rgba(225,29,72,.2);
          background: rgba(225,29,72,.07);
        }
      `}</style>

      <section className="sv" aria-labelledby="sv-title">

        <div className="sv__bg" aria-hidden="true">
          <div data-us-project="GE8mpmmCRgK6XBF57jgF" />
        </div>
        <div className="sv__overlay" aria-hidden="true" />

        <div className="sv__wrap">

          <div className="sv__header">
            <div className="sv__eyebrow">What we build</div>
            <h2 className="sv__title" id="sv-title">
              Four machine lines.<br /><em>One complete solution.</em>
            </h2>
            <p className="sv__sub">
              From raw resin to finished printed bag — every stage of plastic film processing, engineered and supported in-house.
            </p>
          </div>

          <div className="sv__grid">
            {SERVICES.map((s) => (
              <div key={s.num} className="sv-card">
                <div className="sv-card__head">
                  <div className="sv-card__icon">{s.icon}</div>
                  <span className="sv-card__num">{s.num}</span>
                </div>
                <h3 className="sv-card__title">{s.title}</h3>
                <p className="sv-card__desc">{s.desc}</p>
                <div className="sv-card__tags">
                  {s.tags.map((t) => (
                    <span key={t} className="sv-card__tag">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <SvUnicornLoader />
    </>
  );
}

function SvUnicornLoader() {
  useEffect(() => {
    const win = window as any;
    if (win.UnicornStudio?.isInitialized) return;
    if (!win.UnicornStudio) win.UnicornStudio = { isInitialized: false };
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
    s.onload = () => {
      if (!win.UnicornStudio.isInitialized) {
        win.UnicornStudio.init();
        win.UnicornStudio.isInitialized = true;
      }
    };
    (document.head || document.body).appendChild(s);
  }, []);
  return null;
}
