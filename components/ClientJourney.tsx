"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACCENTS = [
  { hex: "#2bbfb3", name: "teal" },
  { hex: "#f59e0b", name: "amber" },
  { hex: "#e11d48", name: "rose" },
];

function accentFor(i: number) {
  return ACCENTS[i % ACCENTS.length];
}

// ─── Step data — short punchy copy, one real photo each ────
const STEPS = [
  {
    id: "inquiry",
    num: "01",
    label: "Inquiry",
    tagline: "Tell us what you need — reply within 24h.",
    img: "/machines/abcde-2200.png",
    metric: { v: "24h", l: "Response time" },
  },
  {
    id: "quotation",
    num: "02",
    label: "Quotation",
    tagline: "Full spec sheet, fixed price, no surprises.",
    img: "/machines/bag-samples.png",
    metric: { v: "72h", l: "Full quote" },
  },
  {
    id: "order",
    num: "03",
    label: "Order",
    tagline: "PI signed, deposit received, build queued.",
    img: "/machines/cx-260.png",
    metric: { v: "30%", l: "Deposit" },
  },
  {
    id: "manufacturing",
    num: "04",
    label: "Manufacturing",
    tagline: "Built to order in our ISO 9001 factory.",
    img: "/about-photos/warehouse-building-1.jpeg",
    metric: { v: "ISO", l: "9001 certified" },
  },
  {
    id: "delivery",
    num: "05",
    label: "Delivery",
    tagline: "Seaworthy packing, tracked door-to-door.",
    img: "/about-photos/warehouse-building-2.jpeg",
    metric: { v: "80+", l: "Countries" },
  },
  {
    id: "commissioning",
    num: "06",
    label: "Commissioning",
    tagline: "On-site install and calibration, days not weeks.",
    img: "/machines/sb-printing-line.png",
    metric: { v: "5–8", l: "Days install" },
  },
  {
    id: "training",
    num: "07",
    label: "Training",
    tagline: "Hands-on operator training, manuals included.",
    img: "/machines/cx-25-lab.png",
    metric: { v: "2–3", l: "Days training" },
  },
  {
    id: "aftersales",
    num: "08",
    label: "After-Sales",
    tagline: "Remote diagnostics, parts within 48h, for life.",
    img: "/machines/flexo-6c-nobg.png",
    metric: { v: "Lifetime", l: "Support" },
  },
];

export default function ClientJourney() {
  const sectionRef = useRef<HTMLElement>(null);
  const headRef    = useRef<HTMLDivElement>(null);
  const rowRefs    = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let ctx: { revert?: () => void } = {};
    let cancelled = false;

    const revealAll = () => {
      if (headRef.current) { headRef.current.style.opacity = "1"; headRef.current.style.transform = "none"; }
      rowRefs.current.filter(Boolean).forEach(row => {
        const img = row!.querySelector<HTMLElement>(".cj2-row__img");
        const text = row!.querySelector<HTMLElement>(".cj2-row__text");
        [img, text].filter(Boolean).forEach(el => { el!.style.opacity = "1"; el!.style.transform = "none"; });
      });
    };

    (async () => {
      try {
        const { gsap: g }       = await import("gsap");
        const { ScrollTrigger: ST } = await import("gsap/ScrollTrigger");
        if (cancelled) return;
        g.registerPlugin(ST);

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        ctx = g.context(() => {
          if (reduced) {
            g.set(headRef.current, { opacity: 1, clearProps: "all" });
            g.set(rowRefs.current.filter(Boolean), { opacity: 1, clearProps: "all" });
            return;
          }

          g.fromTo(headRef.current, { y: 40, opacity: 0 }, {
            y: 0, opacity: 1, duration: 1, ease: "expo.out",
            scrollTrigger: { trigger: sectionRef.current, start: "top 80%", end: "bottom 15%", toggleActions: "play reverse play reverse" },
          });

          // Each row — alternating slide-in direction, image scales in
          // slightly faster than the text settles, so the two halves don't
          // arrive as one flat block.
          rowRefs.current.forEach((row, i) => {
            if (!row) return;
            const fromLeft = i % 2 === 0;
            const img = row.querySelector<HTMLElement>(".cj2-row__img");
            const text = row.querySelector<HTMLElement>(".cj2-row__text");
            const trigger = { trigger: row, start: "top 85%", end: "bottom 30%", toggleActions: "play reverse play reverse" };

            if (img) {
              g.fromTo(img,
                { opacity: 0, x: fromLeft ? -50 : 50, scale: 1.06 },
                { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power3.out", scrollTrigger: trigger }
              );
            }
            if (text) {
              g.fromTo(text,
                { opacity: 0, x: fromLeft ? 40 : -40 },
                { opacity: 1, x: 0, duration: 0.7, ease: "power3.out", delay: 0.12, scrollTrigger: trigger }
              );
            }
          });
        }, sectionRef);
      } catch {
        if (!cancelled) revealAll();
      }
    })();

    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 4000);

    return () => { cancelled = true; clearTimeout(fallback); ctx.revert?.(); };
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj2 {
          position: relative;
          background: #070f0e;
          padding: clamp(5rem,9vw,9rem) 0 clamp(4rem,8vw,8rem);
          overflow: hidden;
        }
        .cj2::after {
          content: "";
          position: absolute; top: 0; left: 0; right: 0;
          height: 2px; background: linear-gradient(90deg, var(--brand-teal), var(--brand-amber), var(--brand-rose));
          z-index: 1;
        }
        .cj2__blob {
          position: absolute; border-radius: 50%; pointer-events: none;
        }
        .cj2__blob--1 {
          width: min(50vw, 600px); height: min(50vw, 600px);
          top: -20%; right: -10%;
          background: radial-gradient(circle, rgba(43,191,179,0.07) 0%, transparent 70%);
          animation: cj2-float 16s ease-in-out infinite;
        }
        .cj2__blob--2 {
          width: min(35vw, 400px); height: min(35vw, 400px);
          bottom: -5%; left: -5%;
          background: radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%);
          animation: cj2-float 20s ease-in-out infinite reverse;
        }
        @keyframes cj2-float {
          0%,100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(20px, -20px) scale(1.04); }
        }

        .cj2__wrap {
          position: relative; z-index: 2;
          max-width: 1280px; margin: 0 auto;
          padding-inline: clamp(1.25rem,4vw,3.5rem);
        }

        .cj2__head {
          margin-bottom: clamp(3rem,6vw,5rem);
        }
        .cj2__label {
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .75rem;
          display: flex; align-items: center; gap: .7rem;
        }
        .cj2__label::before {
          content: ""; display: inline-block;
          width: 1.75rem; height: 1px; background: var(--brand-teal);
        }
        .cj2__title {
          font-family: var(--ff-display);
          font-size: clamp(3.2rem,6vw,6rem);
          line-height: .88; letter-spacing: -.02em;
          color: #fff; margin: 0;
        }
        .cj2__title em {
          font-style: normal;
          background: linear-gradient(135deg, var(--brand-teal), var(--brand-amber));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Zigzag rows ── */
        .cj2__rows {
          display: flex; flex-direction: column;
          gap: clamp(2.5rem, 5vw, 4rem);
        }
        .cj2-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(2rem, 4vw, 4rem);
          align-items: center;
        }
        .cj2-row--rev .cj2-row__img { order: 2; }
        .cj2-row--rev .cj2-row__text { order: 1; }

        .cj2-row__img {
          position: relative;
          aspect-ratio: 16/10;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
          background: #0a1413;
        }
        .cj2-row__img img { object-fit: cover; }
        .cj2-row__img::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(7,15,14,0.55) 100%);
          pointer-events: none;
        }
        .cj2-row__num {
          position: absolute; top: 1rem; left: 1rem; z-index: 2;
          font-family: var(--ff-mono); font-size: .9rem; font-weight: 700;
          letter-spacing: .1em;
          color: #04211e;
          background: var(--accent);
          padding: .35rem .75rem;
        }
        .cj2-row__metric {
          position: absolute; bottom: 1rem; right: 1rem; z-index: 2;
          display: flex; flex-direction: column; align-items: flex-end;
          text-align: right;
        }
        .cj2-row__metric-val {
          font-family: var(--ff-display); font-size: 1.6rem;
          color: #fff; line-height: 1; letter-spacing: -.02em;
        }
        .cj2-row__metric-label {
          font-family: var(--ff-mono); font-size: .6rem;
          letter-spacing: .12em; text-transform: uppercase;
          color: rgba(255,255,255,0.65); margin-top: .2rem;
        }

        .cj2-row__text { min-width: 0; }
        .cj2-row__badge {
          display: inline-flex; align-items: center; gap: .55rem;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--accent); margin-bottom: .85rem;
        }
        .cj2-row__badge span { width: 1.2rem; height: 1px; background: var(--accent); display: inline-block; }
        .cj2-row__title {
          font-family: var(--ff-display);
          font-size: clamp(1.8rem,3vw,2.6rem);
          line-height: 1; letter-spacing: -.02em; color: #fff;
          margin: 0 0 .65rem;
        }
        .cj2-row__tagline {
          font-family: var(--ff-body); font-size: clamp(.95rem,1.15vw,1.05rem);
          color: rgba(255,255,255,.68); line-height: 1.6;
          max-width: 42ch; margin: 0;
        }

        .cj2__footer {
          margin-top: clamp(3rem,6vw,5rem);
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem; flex-wrap: wrap;
          padding-top: clamp(2rem,4vw,3rem);
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .cj2__footer-text {
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(255,255,255,0.7);
        }
        .cj2__footer-text strong {
          background: linear-gradient(135deg, var(--brand-teal), var(--brand-amber));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-size: .78rem;
        }
        .cj2__cta {
          display: inline-flex; align-items: center; gap: .65rem;
          padding: .8rem 1.75rem;
          border: 1px solid rgba(43,191,179,0.3);
          color: var(--brand-teal);
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .14em; text-transform: uppercase;
          text-decoration: none;
          transition: background .18s, border-color .18s;
        }
        .cj2__cta:hover {
          background: rgba(43,191,179,0.08);
          border-color: var(--brand-teal);
        }

        @media (max-width: 720px) {
          .cj2-row { grid-template-columns: 1fr; gap: 1.25rem; }
          .cj2-row--rev .cj2-row__img { order: 1; }
          .cj2-row--rev .cj2-row__text { order: 2; }
          .cj2-row__img { aspect-ratio: 16/11; }
          .cj2-row__title { font-size: 1.5rem; }
          .cj2-row__tagline { font-size: .9rem; }
          .cj2__rows { gap: 2rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .cj2-row__img, .cj2-row__text { transition: none; }
        }

        [data-theme="light"] .cj2 { background: #f2f9f8; }
        [data-theme="light"] .cj2__title { color: #0d2220; }
        [data-theme="light"] .cj2-row__title { color: #0d2220; }
        [data-theme="light"] .cj2-row__tagline { color: rgba(13,34,32,0.68); }
        [data-theme="light"] .cj2-row__metric-val { color: #0d2220; }
        [data-theme="light"] .cj2-row__metric-label { color: rgba(13,34,32,0.55); }
        [data-theme="light"] .cj2__footer-text { color: rgba(13,34,32,0.6); }
        [data-theme="light"] .cj2__footer { border-top-color: rgba(13,34,32,0.08); }
        [data-theme="light"] .cj2-row__img { background: #fff; border-color: rgba(43,191,179,0.2); }
      `}</style>

      <section className="cj2" ref={sectionRef} aria-label="Our process — inquiry to production">
        <div className="cj2__blob cj2__blob--1" aria-hidden />
        <div className="cj2__blob cj2__blob--2" aria-hidden />

        <div className="cj2__wrap">
          <div className="cj2__head" ref={headRef} data-no-anim>
            <div className="cj2__label">End-to-end process</div>
            <h2 className="cj2__title">
              From inquiry<br />to <em>full production.</em>
            </h2>
          </div>

          <div className="cj2__rows">
            {STEPS.map((s, i) => {
              const a = accentFor(i);
              return (
                <div
                  key={s.id}
                  ref={el => { rowRefs.current[i] = el; }}
                  className={`cj2-row${i % 2 === 1 ? " cj2-row--rev" : ""}`}
                  style={{ "--accent": a.hex } as React.CSSProperties}
                >
                  <div className="cj2-row__img">
                    <Image src={s.img} alt={s.label} fill sizes="(max-width: 720px) 90vw, 45vw" />
                    <span className="cj2-row__num">{s.num}</span>
                    <div className="cj2-row__metric">
                      <span className="cj2-row__metric-val">{s.metric.v}</span>
                      <span className="cj2-row__metric-label">{s.metric.l}</span>
                    </div>
                  </div>
                  <div className="cj2-row__text">
                    <div className="cj2-row__badge">
                      <span />
                      Step {s.num} of {STEPS.length}
                    </div>
                    <h3 className="cj2-row__title">{s.label}</h3>
                    <p className="cj2-row__tagline">{s.tagline}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cj2__footer">
            <p className="cj2__footer-text">
              Ready when you are —&nbsp;
              <strong>engineers available 24/7</strong>
            </p>
            <Link href="/inquiries" className="cj2__cta">
              Start your inquiry
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
