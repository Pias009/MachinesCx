"use client";
import { openAshaChat } from "@/components/ChatWidget";

export default function AiAgentBanner() {
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
          display: inline-flex; align-items: center; gap: .8rem;
          padding: 1rem 1.9rem;
          background: var(--brand-amber);
          color: #080e0d;
          border: none; cursor: pointer;
          border-radius: 999px;
          font-family: var(--ff-body); font-size: .98rem;
          font-weight: 600;
        }
        .aib__cta:hover {
          background: #e08b0a;
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
      `}</style>

      <section className="aib" aria-label="Meet ASHA, our AI machine assistant">
        <div className="aib__blob aib__blob--1" aria-hidden="true" />
        <div className="aib__blob aib__blob--2" aria-hidden="true" />
        <div className="aib__blob aib__blob--3" aria-hidden="true" />

        <div className="aib__content">
          <div className="aib__text">
            <div className="aib__eyebrow">AI Machine Assistant</div>
            <h2 className="aib__title">
              Ask <em>ASHA</em> — get the right machine, instantly.
            </h2>
            <p className="aib__desc">
              Our AI agent knows every machine in this catalogue. Ask a spec question, compare models side by side, or get routed straight to the page you need — available around the clock.
            </p>
          </div>

          <div className="aib__actions">
            <button className="aib__cta" onClick={() => openAshaChat()}>
              Talk to ASHA
              <span className="aib__cta-icon" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v11H8l-4 4V4z" stroke="#080e0d" strokeWidth="2" strokeLinejoin="round" /></svg>
              </span>
            </button>
            <div className="aib__hint">&#10094; No forms. Just ask. <span>&#10095;</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
