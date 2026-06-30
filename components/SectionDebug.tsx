"use client";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { label: "Home",                  sub: "Welcome"                },
  { label: "Hot Machines",          sub: "Bag Making · Film Lines" },
  { label: "Our Journey",           sub: "6-Step Process"          },
  { label: "Why Choose Us",         sub: "Engineered · Proven"     },
  { label: "Built to Last",         sub: "25+ Years · 80+ Countries"},
  { label: "Flexo Printing",        sub: "AI Series Press"         },
  { label: "Machine Gallery",       sub: "Full Product Range"      },
  { label: "Printing Showcase",     sub: "AI Series Carousel"      },
  { label: "Machine Catalogue",     sub: "Find Your Machine"       },
  { label: "Custom Configuration",  sub: "Build Your Order"        },
  { label: "Latest News",           sub: "From the Factory Floor"  },
];

export default function SectionDebug() {
  const [active, setActive]   = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef              = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const children = Array.from(main.children) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = children.indexOf(e.target as HTMLElement);
            if (idx !== -1 && SECTIONS[idx]) {
              setActive(idx);
              setVisible(true);
              if (timerRef.current) clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => setVisible(false), 2200);
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    children.forEach((el) => obs.observe(el));
    return () => { obs.disconnect(); if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const sec = SECTIONS[active];

  return (
    <>
      <style suppressHydrationWarning>{`
        .scd-wrap {
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          z-index: 9000;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          opacity: 0;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .scd-wrap--show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .scd-label {
          font-family: var(--ff-display);
          font-size: clamp(0.8rem, 2.5vw, 1.1rem);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #fff;
          background: rgba(8,14,13,0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(43,191,179,0.3);
          border-top: 2px solid var(--brand-teal);
          padding: 0.35rem 1rem 0.4rem;
          white-space: nowrap;
          line-height: 1;
        }
        .scd-sub {
          font-family: var(--ff-mono);
          font-size: 0.48rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--brand-teal);
          white-space: nowrap;
        }
        @media (max-width: 480px) {
          .scd-wrap { top: 76px; }
          .scd-label { font-size: 0.75rem; padding: 0.28rem 0.75rem; }
          .scd-sub { display: none; }
        }
      `}</style>

      <div className={`scd-wrap${visible ? " scd-wrap--show" : ""}`} aria-hidden="true">
        <div className="scd-label">{sec.label}</div>
        <div className="scd-sub">{sec.sub}</div>
      </div>
    </>
  );
}
