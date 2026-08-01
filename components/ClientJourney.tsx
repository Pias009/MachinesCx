"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";
import TransitionLink from "@/components/TransitionLink";
import {
  MessageSquare, FileText, ShoppingCart, Factory,
  Truck, Wrench, GraduationCap, Headphones,
  type LucideIcon,
} from "lucide-react";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

// ─── Step order — copy comes from the clientJourney.steps translation
// namespace, keyed by id. Each step gets its own real icon instead of the
// company logo repeated eight times. ─────────────────────────────
const STEP_IDS = [
  "inquiry",
  "quotation",
  "order",
  "manufacturing",
  "delivery",
  "commissioning",
  "training",
  "aftersales",
] as const;

const STEP_ICONS: Record<(typeof STEP_IDS)[number], LucideIcon> = {
  inquiry: MessageSquare,
  quotation: FileText,
  order: ShoppingCart,
  manufacturing: Factory,
  delivery: Truck,
  commissioning: Wrench,
  training: GraduationCap,
  aftersales: Headphones,
};

// ─── flat, solid, 4-color rotation (bold but disciplined — no gradients,
// no pastel/candy tints) so 8 steps read as clean pairs, not a rainbow ───
const STEP_COLORS = ["var(--brand-teal)", "var(--brand-amber)", "var(--brand-rose)", "var(--cj-blue)"];

type StepCopy = { label: string; tagline: string; desc: string; metric1v: string; metric1l: string; metric2v: string; metric2l: string };

export default function ClientJourney() {
  const t = useTranslations("clientJourney");
  const stepsCopy = t.raw("steps") as Record<string, StepCopy>;
  const STEPS = STEP_IDS.map((id, i) => {
    const c = stepsCopy[id];
    return {
      id,
      num: String(i + 1).padStart(2, "0"),
      label: c.label,
      tagline: c.tagline,
      desc: c.desc,
      metrics: [{ v: c.metric1v, l: c.metric1l }, { v: c.metric2v, l: c.metric2l }],
      color: STEP_COLORS[i % STEP_COLORS.length],
      Icon: STEP_ICONS[id],
    };
  });

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const gridRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const overlayCardRef = useRef<HTMLDivElement>(null);

  // clicking an icon in the left pipeline jumps straight to its card —
  // a plain scroll, no motion effects on the card itself
  const scrollToStep = (id: string) => {
    cardRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  // clicking a card flips it away (rotateY + fade) from its grid slot,
  // then the same step reappears as a larger centered overlay flipping
  // in — the other 7 cards are untouched. Closing reverses both.
  const [openId, setOpenId] = useState<string | null>(null);
  const openStep = STEPS.find((s) => s.id === openId) ?? null;
  const closingRef = useRef(false);

  const openCard = (id: string) => {
    if (closingRef.current) return;
    const source = cardRefs.current[id];
    if (source) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        gsap.fromTo(
          source,
          { rotateY: 0, opacity: 1 },
          {
            rotateY: -90,
            opacity: 0,
            duration: 0.35,
            ease: "power2.in",
            transformPerspective: 800,
            onComplete: () => {
              gsap.set(source, { clearProps: "rotateY,opacity,transformPerspective" });
              source.classList.add("cj__step--source-hidden");
              setOpenId(id);
            },
          }
        );
        return;
      }
      source.classList.add("cj__step--source-hidden");
    }
    setOpenId(id);
  };

  const closeOverlay = useCallback(() => {
    const overlay = overlayRef.current;
    const card = overlayCardRef.current;
    const source = openId ? cardRefs.current[openId] : null;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!overlay || !card || reduced) {
      if (source) source.classList.remove("cj__step--source-hidden");
      setOpenId(null);
      return;
    }

    closingRef.current = true;
    gsap.to(card, {
      rotateY: 90,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      transformPerspective: 800,
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      ease: "power1.in",
      onComplete: () => {
        if (source) source.classList.remove("cj__step--source-hidden");
        setOpenId(null);
        closingRef.current = false;
      },
    });
  }, [openId]);

  // flip the overlay card in (rotateY 90 → 0) once it mounts
  useGSAP(() => {
    if (!openId) return;
    const overlay = overlayRef.current;
    const card = overlayCardRef.current;
    if (!overlay || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      gsap.set(overlay, { opacity: 1 });
      gsap.set(card, { rotateY: 0, opacity: 1 });
      return;
    }

    gsap.set(overlay, { opacity: 0 });
    gsap.set(card, { rotateY: 90, opacity: 0, transformPerspective: 800 });
    gsap.to(overlay, { opacity: 1, duration: 0.25, ease: "power1.out" });
    gsap.to(card, { rotateY: 0, opacity: 1, duration: 0.45, ease: "power3.out", delay: 0.1 });
  }, { dependencies: [openId] });

  // Escape closes the overlay, same as clicking the backdrop or the × button
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeOverlay(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId, closeOverlay]);

  // one-time reveal when the grid enters view: each badge starts centered
  // over its card with the text hidden, then slides to its resting
  // left-aligned position while the text fades in — staggered per card
  useGSAP(() => {
    const el = gridRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = el.querySelectorAll<HTMLElement>(".cj__step");
    if (reduced) return;

    const badges = el.querySelectorAll<HTMLElement>(".cj__badge");
    const texts = el.querySelectorAll<HTMLElement>(".cj__step-text");

    gsap.set(texts, { opacity: 0 });
    cards.forEach((card, i) => {
      const badge = badges[i];
      if (!badge) return;
      const cardRect = card.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      const dx = (cardRect.width / 2) - (badgeRect.left - cardRect.left) - (badgeRect.width / 2);
      gsap.set(badge, { x: dx });
    });

    ScrollTrigger.create({
      trigger: el,
      start: "top 82%",
      once: true,
      onEnter: () => {
        cards.forEach((card, i) => {
          const badge = badges[i];
          const text = texts[i];
          if (!badge) return;
          gsap.to(badge, {
            x: 0,
            duration: 0.55,
            ease: "power3.out",
            delay: i * 0.08,
            onComplete: () => {
              if (text) gsap.to(text, { opacity: 1, duration: 0.35, ease: "power1.out" });
            },
          });
        });
      },
    });
  }, { scope: gridRef });

  return (
    <>
      <style suppressHydrationWarning>{`
        .cj {
          position: relative;
          background: var(--bg-base);
          padding: clamp(5rem,8vw,7.5rem) 0;
          --cj-blue: #2563eb;
          overflow: hidden;
        }
        /* ── section-level backdrop: two soft brand-color glows, no grid —
           a hairline grid overlay reads as generic "blueprint" filler unless
           the surface is an actual canvas/map/measurement context, which
           this isn't, so depth comes from color glow only ── */
        .cj__bg-glow {
          position: absolute; z-index: 0; pointer-events: none;
          top: -12%; right: -8%; width: 48%; aspect-ratio: 1;
          background: radial-gradient(circle, var(--brand-teal-glow) 0%, transparent 70%);
          filter: blur(20px);
        }
        .cj__bg-glow--2 {
          position: absolute; z-index: 0; pointer-events: none;
          bottom: -15%; left: -10%; width: 40%; aspect-ratio: 1;
          background: radial-gradient(circle, var(--brand-amber-dim) 0%, transparent 70%);
          filter: blur(24px);
        }
        .cj__wrap {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding-inline: clamp(1.5rem,5vw,4.5rem);
        }
        .cj__head {
          display: flex; align-items: flex-end; justify-content: space-between;
          flex-wrap: wrap; gap: 1.5rem;
          margin-bottom: clamp(3rem,5vw,4.5rem);
          border-bottom: 1px solid var(--bg-line);
          padding-bottom: clamp(1.5rem,3vw,2.25rem);
        }
        .cj__eyebrow {
          font-family: var(--ff-mono); font-weight: 600; font-size: .7rem;
          letter-spacing: .2em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: .75rem;
          display: flex; align-items: center; gap: .6rem;
        }
        .cj__eyebrow-tick { display: inline-block; width: 22px; height: 1px; background: var(--brand-teal); }
        .cj__title {
          font-family: var(--ff-display); font-weight: 700;
          font-size: clamp(1.9rem,3.4vw,3rem);
          line-height: 0.98; letter-spacing: -.01em;
          color: var(--ink); margin: 0;
        }
        .cj__title em {
          font-style: normal;
          color: var(--brand-teal);
        }
        .cj__head-meta {
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--ink-35);
          white-space: nowrap;
        }

        /* ── body: left pipeline + full card grid, side by side ── */
        .cj__body {
          display: flex;
          align-items: flex-start;
          gap: clamp(1.5rem, 3vw, 2.5rem);
        }

        /* ── left pipeline — every step's badge stacked in a column with a
           single connecting line running through them (the original
           design's track), used as a quick-access jump list next to the
           full card grid rather than a duplicate of the grid's own icons ── */
        .cj__pipeline {
          position: relative;
          flex: 0 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
          padding-block: 0.25rem;
        }
        .cj__pipe-line {
          position: absolute;
          top: 26px; bottom: 26px; left: 25px;
          width: 2px;
          background: var(--bg-line);
          z-index: 0;
        }
        .cj__pipe-btn {
          position: relative;
          z-index: 1;
          width: 52px; height: 52px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 2px solid var(--bg-line);
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s cubic-bezier(0.16,1,0.3,1);
        }
        .cj__pipe-btn svg { width: 20px; height: 20px; color: var(--step-color); transition: color 0.18s ease; }
        .cj__pipe-btn:hover,
        .cj__pipe-btn:focus-visible {
          border-color: var(--step-color);
          background: var(--step-color);
          transform: scale(1.08);
        }
        .cj__pipe-btn:hover svg,
        .cj__pipe-btn:focus-visible svg { color: #fff; }
        .cj__pipe-btn:focus-visible { outline: 2px solid var(--step-color); outline-offset: 3px; }

        @media (max-width: 720px) {
          .cj__body { flex-direction: column; }
          .cj__pipeline {
            flex-direction: row; width: 100%; overflow-x: auto;
            gap: 1rem; padding-block: 0.5rem;
          }
          .cj__pipe-line { top: 25px; left: 26px; right: 26px; bottom: auto; width: auto; height: 2px; }
        }

        /* ── full card grid (all 8 steps, no pagination): each step is its
           own bordered, elevated card, wrapping to as many rows as needed
           (3 cols → 3+3+2). Static reveal, no auto-rotation. ── */
        .cj__rail {
          position: relative;
          flex: 1 1 auto;
          min-width: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.25rem;
        }

        /* icon badge fixed to the left, text column to its right — matches
           the original rail's left-badge orientation instead of a top-down
           stacked card */
        .cj__step {
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: clamp(0.85rem, 1.6vw, 1.25rem);
          padding: clamp(1.1rem, 1.8vw, 1.4rem);
          background: var(--bg-surface);
          border: 1px solid var(--bg-line);
          border-radius: 14px;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.2s ease, box-shadow 0.2s ease, grid-column 0.2s ease;
        }
        .cj__step:hover {
          transform: translateY(-4px);
          border-color: var(--step-color);
          box-shadow: 0 16px 32px -16px var(--step-color);
        }
        /* clicked card flips away (rotateY) and fades — the enlarged
           version reappears as a centered overlay, driven by GSAP, so this
           just hides the source card while that overlay is open */
        .cj__step--source-hidden { visibility: hidden; }
        .cj__step-text {
          flex: 1 1 auto;
          min-width: 0;
          display: flex;
          flex-direction: column;
        }
        .cj__desc {
          font-family: var(--ff-body); font-size: .85rem; line-height: 1.6;
          color: var(--ink-60);
          margin-top: .75rem;
          padding-top: .75rem;
          border-top: 1px solid var(--bg-line);
        }

        /* ── expanded-card overlay — dimmed backdrop + a centered, larger
           copy of the clicked card. GSAP flips it in with rotateY + scale
           (perspective on the backdrop makes the 3D rotation read), and
           flips the source card away with the same rotation before this
           appears, so it feels like one card turning into the other. ── */
        .cj__overlay {
          position: fixed; inset: 0; z-index: 200;
          display: flex; align-items: center; justify-content: center;
          padding: 5vh 1.5rem;
          background: rgba(4,8,7,0.7);
          -webkit-backdrop-filter: blur(6px);
          backdrop-filter: blur(6px);
          perspective: 1400px;
        }
        .cj__overlay-card {
          position: relative;
          width: min(680px, 100%);
          max-height: 86vh;
          overflow-y: auto;
          display: flex;
          flex-direction: row;
          align-items: flex-start;
          gap: 1.5rem;
          padding: clamp(1.75rem, 3vw, 2.5rem);
          background: var(--bg-surface);
          border: 1px solid var(--step-color);
          border-radius: 20px;
          box-shadow: 0 30px 70px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.2);
          transform-style: preserve-3d;
        }
        .cj__overlay-close {
          position: absolute; top: 1rem; right: 1rem;
          width: 34px; height: 34px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-raise);
          border: 1px solid var(--bg-line);
          color: var(--ink-60);
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .cj__overlay-close:hover { color: var(--ink); border-color: var(--step-color); }
        .cj__overlay-card .cj__badge {
          width: 68px; height: 68px; border-radius: 18px;
        }
        .cj__overlay-card .cj__badge svg { width: 28px; height: 28px; }
        .cj__overlay-card .cj__label { font-size: 1.35rem; margin-top: .3rem; }
        .cj__overlay-card .cj__tagline { font-size: .92rem; margin-top: .4rem; }
        .cj__overlay-card .cj__desc { font-size: .92rem; }

        @media (prefers-reduced-motion: reduce) {
          .cj__overlay, .cj__overlay-card { transition: none; }
        }

        /* larger, illustrated icon tile — layered ring + glow behind the
           icon instead of a flat solid square, more like a badge of rank
           than a plain color chip */
        .cj__badge {
          position: relative;
          flex: 0 0 auto;
          width: 54px; height: 54px;
          border-radius: 14px;
          background: linear-gradient(155deg, var(--step-color) 0%, color-mix(in srgb, var(--step-color) 70%, #000) 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.25) inset,
            0 8px 18px -9px var(--step-color);
        }
        .cj__badge::before {
          content: "";
          position: absolute; inset: -6px;
          border-radius: 17px;
          border: 1px solid var(--step-color);
          opacity: 0.25;
        }
        .cj__badge svg { width: 22px; height: 22px; color: #fff; }

        .cj__num {
          font-family: var(--ff-mono); font-weight: 700; font-size: .64rem;
          letter-spacing: .1em; color: var(--step-color);
          display: block;
        }
        .cj__label {
          font-family: var(--ff-display); font-weight: 700; font-size: 1.02rem;
          letter-spacing: -.005em; color: var(--ink);
          margin: .15rem 0 0; text-transform: uppercase;
        }
        .cj__tagline {
          font-family: var(--ff-body); font-size: .8rem; line-height: 1.4;
          color: var(--ink-60);
          margin: .25rem 0 0;
          flex: 1 1 auto;
        }
        .cj__metrics {
          display: flex; flex-wrap: wrap; gap: .3rem 1.1rem;
          border-top: 1px solid var(--bg-line);
          padding-top: .6rem;
          margin-top: auto;
        }
        .cj__metric {
          display: flex; align-items: baseline; gap: .35rem;
          font-family: var(--ff-mono); font-size: .68rem;
        }
        .cj__metric-v { color: var(--ink); font-weight: 700; }
        .cj__metric-l { color: var(--ink-35); letter-spacing: .04em; text-transform: uppercase; }

        @media (max-width: 980px) {
          .cj__rail { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .cj__rail { grid-template-columns: 1fr; }
        }

        .cj__footer {
          margin-top: clamp(2.5rem,4vw,3.5rem);
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.25rem; flex-wrap: wrap;
          border-top: 1px solid var(--bg-line);
          padding-top: clamp(1.5rem, 3vw, 2rem);
        }
        .cj__footer-text {
          font-family: var(--ff-body); font-size: .9rem;
          color: var(--ink-60);
        }
        .cj__footer-text strong { color: var(--ink); font-weight: 600; }
        .cj__cta {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .75rem 1.6rem;
          border-radius: 999px;
          background: var(--brand-teal);
          color: #0d2220;
          font-family: var(--ff-mono); font-weight: 700; font-size: .72rem;
          letter-spacing: .06em; text-transform: uppercase;
          text-decoration: none;
          transition: background 0.15s ease, transform 0.15s cubic-bezier(0.16,1,0.3,1);
        }
        .cj__cta:hover { background: var(--brand-teal-dk); }
        .cj__cta:active { transform: scale(0.97); }

        .cj__step:focus-visible {
          outline: 2px solid var(--step-color);
          outline-offset: 4px;
          border-radius: 12px;
        }

        @media (prefers-reduced-motion: reduce) {
          .cj__badge, .cj__step { transition: none; }
        }
      `}</style>

      <section className="cj" data-no-anim aria-label={t("sectionAria")}>
        <div className="cj__bg-glow" aria-hidden="true" />
        <div className="cj__bg-glow--2" aria-hidden="true" />
        <div className="cj__wrap">
          <div className="cj__head">
            <div>
              <div className="cj__eyebrow"><span className="cj__eyebrow-tick" />{t("eyebrow")}</div>
              <h2 className="cj__title">
                {t("titleLine1")} {t("titleLine2")} <em>{t("titleEm")}</em>
              </h2>
            </div>
            <span className="cj__head-meta">{t("stepOfLabel", { num: "01", total: "08" })}</span>
          </div>

          <div className="cj__body">
            <div className="cj__pipeline" role="group" aria-label={t("stepsAria")}>
              <div className="cj__pipe-line" aria-hidden="true" />
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="cj__pipe-btn"
                  style={{ ["--step-color" as string]: s.color }}
                  aria-label={s.label}
                  onClick={() => scrollToStep(s.id)}
                >
                  <s.Icon strokeWidth={1.75} aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="cj__rail" role="list" aria-label={t("stepsAria")} ref={gridRef}>
              {STEPS.map((s) => (
                <div
                  className="cj__step"
                  key={s.id}
                  role="listitem"
                  tabIndex={0}
                  ref={(node) => { cardRefs.current[s.id] = node; }}
                  style={{ ["--step-color" as string]: s.color }}
                  onClick={() => openCard(s.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openCard(s.id);
                    }
                  }}
                >
                  <div className="cj__badge">
                    <s.Icon strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <div className="cj__step-text">
                    <span className="cj__num">{s.num}</span>
                    <h3 className="cj__label">{s.label}</h3>
                    <p className="cj__tagline">{s.tagline}</p>
                    <div className="cj__metrics">
                      {s.metrics.map((m, mi) => (
                        <div className="cj__metric" key={mi}>
                          <span className="cj__metric-v">{m.v}</span>
                          <span className="cj__metric-l">{m.l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cj__footer">
            <p className="cj__footer-text">
              {t("footerText")}&nbsp;<strong>{t("footerStrong")}</strong>
            </p>
            <TransitionLink href="/inquiries" className="cj__cta">
              {t("cta")}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </TransitionLink>
          </div>
        </div>
      </section>

      {openStep && (
        <div
          className="cj__overlay"
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          aria-label={openStep.label}
          onClick={(e) => { if (e.target === e.currentTarget) closeOverlay(); }}
        >
          <div
            className="cj__overlay-card"
            ref={overlayCardRef}
            style={{ ["--step-color" as string]: openStep.color }}
          >
            <button type="button" className="cj__overlay-close" aria-label={t("closeLabel")} onClick={closeOverlay}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="cj__badge">
              <openStep.Icon strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="cj__step-text">
              <span className="cj__num">{openStep.num}</span>
              <h3 className="cj__label">{openStep.label}</h3>
              <p className="cj__tagline">{openStep.tagline}</p>
              <div className="cj__metrics">
                {openStep.metrics.map((m, mi) => (
                  <div className="cj__metric" key={mi}>
                    <span className="cj__metric-v">{m.v}</span>
                    <span className="cj__metric-l">{m.l}</span>
                  </div>
                ))}
              </div>
              <p className="cj__desc">{openStep.desc}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
