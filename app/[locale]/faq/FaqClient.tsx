"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { FAQ_ITEMS } from "@/lib/faqData";

export default function FaqClient() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <>
      <style suppressHydrationWarning>{`
        .fq-page {
          min-height: 100vh; padding-top: 100px;
          background: var(--bg-base); position: relative;
        }
        .fq-page::before {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background:
            linear-gradient(rgba(43,191,179,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,.03) 1px, transparent 1px);
          background-size: 80px 80px;
          pointer-events: none;
        }
        .fq-wrap {
          position: relative; z-index: 1;
          max-width: 860px; margin: 0 auto;
          padding: 0 clamp(1.5rem, 4vw, 3rem) clamp(4rem, 7vw, 7rem);
        }
        .fq-header { text-align: center; margin-bottom: clamp(2.5rem, 5vw, 3.5rem); }
        .fq-eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1rem;
        }
        .fq-eyebrow::before { content: ""; width: 2rem; height: 1px; background: var(--brand-teal); }
        .fq-h1 {
          font-family: var(--ff-display);
          font-size: clamp(2.4rem, 5vw, 4rem);
          line-height: .95; color: var(--ink);
          letter-spacing: -.01em; margin: 0 0 .9rem;
        }
        .fq-h1 em { font-style: normal; color: var(--brand-teal); }
        .fq-sub {
          font-size: clamp(.875rem, 1.1vw, 1rem);
          color: var(--ink-60); line-height: 1.7; max-width: 56ch;
          margin: 0 auto;
        }

        .fq-list { display: flex; flex-direction: column; gap: .75rem; }
        .fq-item {
          border: 1px solid var(--bg-line);
          background: var(--bg-surface);
          border-radius: .9rem;
          overflow: hidden;
        }
        .fq-q {
          width: 100%; text-align: left; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1rem; padding: 1.15rem 1.35rem;
          background: none; border: none;
          font-family: var(--ff-display);
          font-size: clamp(1rem, 1.5vw, 1.15rem);
          color: var(--ink); line-height: 1.3;
        }
        .fq-q:hover { color: var(--brand-teal); }
        .fq-q-icon {
          flex-shrink: 0; width: 1.4rem; height: 1.4rem;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--ff-mono); font-size: 1.1rem; color: var(--brand-teal);
          transition: transform .2s;
        }
        .fq-item[data-open="true"] .fq-q-icon { transform: rotate(45deg); }
        .fq-a {
          padding: 0 1.35rem 1.35rem;
          font-size: .9rem; color: var(--ink-60); line-height: 1.75;
          max-width: 68ch;
        }
        .fq-a a { color: var(--brand-teal); }

        .fq-cta {
          margin-top: clamp(2.5rem, 5vw, 3.5rem);
          text-align: center;
          padding: clamp(1.75rem, 3vw, 2.25rem);
          border: 1px solid var(--bg-line);
          border-radius: 1rem;
          background: var(--bg-surface);
        }
        .fq-cta p { font-size: .9rem; color: var(--ink-60); margin: 0 0 1rem; }
        .fq-cta-link {
          display: inline-flex; align-items: center; gap: .5rem;
          font-family: var(--ff-mono); font-size: .72rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--brand-teal); text-decoration: none;
        }
        .fq-cta-link:hover { color: var(--ink); }
      `}</style>

      <div className="fq-page">
        <div className="fq-wrap">
          <div className="fq-header">
            <div className="fq-eyebrow">Frequently Asked</div>
            <h1 className="fq-h1">
              Questions, <em>answered.</em>
            </h1>
            <p className="fq-sub">
              What buyers usually ask before ordering blown-film, bag-making, recycling, or printing machinery from us.
            </p>
          </div>

          <div className="fq-list">
            {FAQ_ITEMS.map((item, i) => {
              const open = openIdx === i;
              return (
                <div className="fq-item" key={item.q} data-open={open}>
                  <button
                    type="button"
                    className="fq-q"
                    aria-expanded={open}
                    onClick={() => setOpenIdx(open ? null : i)}
                  >
                    <span>{item.q}</span>
                    <span className="fq-q-icon" aria-hidden="true">+</span>
                  </button>
                  {open && <p className="fq-a">{item.a}</p>}
                </div>
              );
            })}
          </div>

          <div className="fq-cta">
            <p>Didn't find what you're looking for?</p>
            <Link href="/contact" className="fq-cta-link">Contact our engineering team →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
