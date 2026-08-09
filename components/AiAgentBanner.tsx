"use client";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { openAshaChat } from "@/components/ChatWidget";

export default function AiAgentBanner() {
  const t = useTranslations("homeAgent");
  const sectionRef = useRef<HTMLElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);
  const titleRef   = useRef<HTMLHeadingElement>(null);
  const descRef    = useRef<HTMLParagraphElement>(null);
  const ctaRef     = useRef<HTMLButtonElement>(null);
  const hintRef    = useRef<HTMLDivElement>(null);

  // ── "Signal Handshake" scroll-in — GSAP + ScrollTrigger ──────────────
  useEffect(() => {
    let ctx: { revert?: () => void } = {};

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText }     = await import("gsap/SplitText");
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        const st = () => ({ trigger: sectionRef.current, start: "top 82%", toggleActions: "play none none none" });

        if (reduced) {
          gsap.set([eyebrowRef.current, titleRef.current, descRef.current, ctaRef.current, hintRef.current], { opacity: 1, clearProps: "all" });
          return;
        }

        // Eyebrow — clip-path wipe, dot included as one unit
        gsap.fromTo(eyebrowRef.current,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.5, ease: "power2.out", scrollTrigger: st() }
        );

        // Title — word-by-word rise, staggered response after the eyebrow.
        // `ignore: "em"` keeps the gradient-clip <em>ASHA</em> word intact —
        // SplitText re-wraps split words in new spans that don't inherit
        // -webkit-background-clip:text, which made the gradient word render
        // fully invisible once split.
        if (titleRef.current) {
          const split = new SplitText(titleRef.current, { type: "words", ignore: "em" });
          gsap.fromTo(split.words,
            { y: "60%", opacity: 0 },
            { y: "0%", opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.05, delay: 0.15, scrollTrigger: st() }
          );
        }

        // Description
        gsap.fromTo(descRef.current,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.35, scrollTrigger: st() }
        );

        // CTA + hint
        gsap.fromTo(ctaRef.current,
          { scale: 0.92, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.4)", delay: 0.45, scrollTrigger: st() }
        );
        gsap.fromTo(hintRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.4, ease: "power1.out", delay: 0.6, scrollTrigger: st() }
        );
      }, sectionRef);
    })();

    return () => { ctx.revert?.(); };
  }, []);

  return (
    <>
      <style suppressHydrationWarning>{`
        .aib {
          position: relative;
          min-height: 320px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          background: #0a1211;
        }

        .aib__blob {
          position: absolute; border-radius: 50%; pointer-events: none;
        }
        .aib__blob--1 {
          width: min(55vw, 600px); height: min(55vw, 600px);
          top: -25%; left: -15%;
          background: radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%);
          animation: aib-float 14s ease-in-out infinite;
        }
        .aib__blob--2 {
          width: min(30vw, 350px); height: min(30vw, 350px);
          bottom: -10%; right: 5%;
          background: radial-gradient(circle, rgba(225,29,72,0.07) 0%, transparent 70%);
          animation: aib-float 18s ease-in-out infinite reverse;
        }
        .aib__blob--3 {
          width: min(20vw, 220px); height: min(20vw, 220px);
          top: 5%; right: 35%;
          background: radial-gradient(circle, rgba(43,191,179,0.08) 0%, transparent 70%);
          animation: aib-float 12s ease-in-out infinite 4s;
        }
        @keyframes aib-float {
          0%,100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          33%     { transform: translate(20px, -20px) scale(1.04) rotate(2deg); }
          66%     { transform: translate(-10px, 15px) scale(0.97) rotate(-1deg); }
        }

        .aib__content {
          position: relative; z-index: 2;
          display: flex; align-items: center; justify-content: space-between;
          gap: 3rem; flex-wrap: wrap;
          width: 100%; max-width: 1320px;
          padding: clamp(2.5rem,5vw,3.5rem) clamp(1.25rem,4vw,3rem);
        }
        .aib__text { max-width: 560px; }
        .aib__eyebrow {
          display: flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .24em; text-transform: uppercase;
          color: var(--brand-amber); margin-bottom: 1rem;
        }
        .aib__eyebrow::before {
          content:""; width:8px; height:8px; border-radius:50%;
          background:var(--brand-amber); box-shadow: 0 0 12px rgba(245,158,11,0.5);
        }
        .aib__title {
          font-family: var(--ff-display);
          font-weight: 500;
          font-size: clamp(1.8rem,3.6vw,2.7rem);
          line-height: 1.1; letter-spacing: -.02em;
          color: #f8fafc; margin: 0 0 0.9rem;
          overflow: hidden; /* clips SplitText word-rise cleanly */
        }
        .aib__title em {
          font-style: normal;
          background: linear-gradient(135deg, var(--brand-amber), var(--brand-rose));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .aib__desc {
          font-family: var(--ff-body); font-weight: 400; font-size: clamp(.94rem,1.1vw,1.04rem);
          color: rgba(248,250,252,0.62);
          line-height: 1.7; margin: 0; letter-spacing: -.005em;
        }
        .aib__actions {
          display: flex; flex-direction: column; align-items: flex-start; gap: .9rem;
          flex-shrink: 0;
        }
        .aib__cta {
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; gap: .8rem;
          padding: 1rem 1.9rem;
          background: var(--brand-amber);
          color: #080e0d;
          border: none; cursor: pointer;
          border-radius: 999px;
          font-family: var(--ff-body); font-size: .98rem;
          font-weight: 600;
          box-shadow: 0 1px 0 rgba(255,255,255,0.25) inset, 0 10px 24px -14px rgba(245,158,11,0);
          transition: background .2s var(--ease-out, ease), transform .16s var(--ease-out, ease), box-shadow .2s var(--ease-out, ease);
        }
        .aib__cta::before {
          content: ""; position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.45) 48%, transparent 66%);
          transform: translateX(-120%);
        }
        .aib__cta:hover {
          background: #e08b0a;
          transform: translateY(-2px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.3) inset, 0 16px 34px -12px rgba(245,158,11,0.55);
        }
        .aib__cta:hover::before { animation: aib-cta-shine 0.9s var(--ease-out, ease); }
        .aib__cta:active { transform: translateY(0) scale(0.96); transition-duration: .08s; }
        @keyframes aib-cta-shine { to { transform: translateX(120%); } }
        @media (prefers-reduced-motion: reduce) {
          .aib__cta { transform: none !important; }
          .aib__cta::before { display: none; }
        }
        .aib__cta-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(8,14,13,0.15);
          flex-shrink: 0;
        }
        .aib__hint {
          display: flex; align-items: center; gap: .5rem;
          font-family: var(--ff-body); font-size: .85rem;
          color: rgba(248,250,252,0.4);
        }
        .aib__hint span { opacity: 0.5; }

        @media (max-width: 800px) {
          .aib__content { flex-direction: column; align-items: flex-start; text-align: left; }
          .aib__actions { align-items: flex-start; }
        }

        @media (max-width: 640px) {
          .aib { min-height: 0; }
          .aib__content { padding: 1.75rem 1.25rem; gap: 1.25rem; }
          .aib__title { font-size: clamp(1.4rem, 6.5vw, 1.8rem); margin-bottom: 0.6rem; }
          .aib__desc { font-size: 0.86rem; line-height: 1.55; }
          .aib__eyebrow { margin-bottom: 0.65rem; }
          .aib__actions { gap: 0.6rem; }
          .aib__cta { padding: 0.8rem 1.4rem; font-size: 0.88rem; }
          .aib__hint { font-size: 0.76rem; }
        }
      `}</style>

      <section ref={sectionRef} className="aib" data-no-anim aria-label="Meet ASHA, our AI machine assistant">
        <div className="aib__blob aib__blob--1" aria-hidden="true" />
        <div className="aib__blob aib__blob--2" aria-hidden="true" />
        <div className="aib__blob aib__blob--3" aria-hidden="true" />

        <div className="aib__content">
          <div className="aib__text">
            <div ref={eyebrowRef} className="aib__eyebrow">{t("eyebrow")}</div>
            <h2 ref={titleRef} className="aib__title">
              {t("titlePrefix")} <em>{t("titleName")}</em> {t("titleSuffix")}
            </h2>
            <p ref={descRef} className="aib__desc">
              {t("desc")}
            </p>
          </div>

          <div className="aib__actions">
            <button ref={ctaRef} className="aib__cta" onClick={() => openAshaChat()}>
              {t("cta")}
              <span className="aib__cta-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v11H8l-4 4V4z" stroke="#080e0d" strokeWidth="2" strokeLinejoin="round" /></svg>
              </span>
            </button>
            <div ref={hintRef} className="aib__hint">&#10094; {t("hint")} <span>&#10095;</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
