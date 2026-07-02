"use client";
import { useEffect, useRef, useState } from "react";
import TransitionLink from "@/components/TransitionLink";

export default function ConfiguratorCTA() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let t = 0;
    let visible = false;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    function draw() {
      raf.current = requestAnimationFrame(draw);
      if (!visible || !canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      const step = 60;
      for (let x = 0; x < W; x += step) {
        ctx.strokeStyle = `rgba(43,191,179,${0.03 + 0.02 * Math.sin(t * 0.4 + x * 0.02)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += step) {
        ctx.strokeStyle = `rgba(43,191,179,${0.03 + 0.02 * Math.sin(t * 0.3 + y * 0.02)})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      t += 0.016;
    }

    const ob = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    ob.observe(canvas);
    raf.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", resize);
      ob.disconnect();
    };
  }, [mounted]);

  return (
    <>
      <style suppressHydrationWarning>{`
        .cc {
          position: relative;
          background: #0d1614;
          min-height: 480px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        /* Spline 3D bg */
        .cc__spline {
          position: absolute; inset: 0; z-index: 0;
        }
        .cc__spline iframe {
          width: 100%; height: 100%; border: none; display: block; opacity: .85;
        }
        .cc__canvas {
          position: absolute; inset: 0; z-index: 1;
          width: 100%; height: 100%; pointer-events: none;
        }
        .cc__vignette {
          position: absolute; inset: 0; z-index: 2; pointer-events: none;
          background: radial-gradient(ellipse 70% 90% at 50% 50%,
            rgba(13,22,20,.65) 0%, rgba(13,22,20,.1) 100%);
        }
        .cc__content {
          position: relative; z-index: 3;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem);
          max-width: 680px;
        }
        .cc__eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .26em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1.4rem;
        }
        .cc__eyebrow::before,
        .cc__eyebrow::after { content:""; width:2rem; height:1px; background:var(--brand-teal); }
        .cc__title {
          font-family: var(--ff-display);
          font-size: clamp(3rem,7vw,6rem);
          line-height: .9; letter-spacing: -.015em;
          color: #f8fafc; margin: 0 0 1.25rem;
        }
        .cc__title em { font-style:normal; color:var(--brand-teal); }
        .cc__desc {
          font-size: clamp(.9rem,1.1vw,1rem);
          color: rgba(248,250,252,0.7);
          line-height: 1.75; max-width: 42ch; margin: 0 0 2.75rem;
        }
        .cc__cta {
          display: inline-flex; align-items: center; gap: .9rem;
          padding: .9rem 2rem;
          border: 1px solid var(--brand-red);
          border-radius: 0;
          background: var(--brand-red);
          font-family: var(--ff-mono); font-size: .78rem;
          letter-spacing: .1em; text-transform: uppercase;
          font-weight: 600;
          color: #fff; text-decoration: none;
          position: relative; overflow: hidden;
          transition: background .18s, box-shadow .18s;
        }
        .cc__cta:hover {
          background: var(--brand-teal-dk);
          box-shadow: 0 4px 32px rgba(43,191,179,0.45);
        }
        .cc__cta-arr {
          display:flex; align-items:center; justify-content:center;
          width:28px; height:28px; border-radius:0;
          background: rgba(255,255,255,.18);
          flex-shrink:0;
        }
        .cc__hint {
          display: flex; align-items: center; gap: .6rem;
          margin-top: 2rem; flex-wrap: wrap; justify-content: center;
        }
        .cc__hint-step {
          display: flex; align-items: center; gap: .45rem;
          font-family: var(--ff-mono); font-size: 0.7rem;
          letter-spacing: .1em; text-transform: uppercase;
          color: rgba(248,250,252,0.6);
        }
        .cc__hint-num {
          width: 18px; height: 18px; border-radius: 0;
          border: 1px solid rgba(255,255,255,.12);
          display:flex; align-items:center; justify-content:center;
          font-size: 0.64rem; color: rgba(248,250,252,0.65); flex-shrink:0;
        }
        .cc__hint-sep { width:20px; height:1px; background:rgba(255,255,255,.1); }
        .cc__wave {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 4; line-height:0;
        }
        @media(max-width:640px){
          .cc { min-height: 360px; }
          .cc__content { padding: clamp(2.5rem,6vw,4rem) 1.25rem; }
          .cc__title { font-size: clamp(2rem,8vw,3.5rem); }
          .cc__desc { font-size: 0.88rem; margin-bottom: 1.75rem; }
          .cc__cta { padding: .75rem 1.5rem; font-size: .72rem; }
          .cc__hint { flex-direction: column; gap: .4rem; align-items: flex-start; }
          .cc__hint-sep { display: none; }
        }
        @media(max-width:480px){
          .cc__title { font-size: clamp(1.7rem,9vw,2.6rem); }
          .cc__cta { width: 100%; justify-content: center; }
        }
      `}</style>

      <section className="cc" aria-label="Build your configuration">
        <div className="cc__spline" aria-hidden="true">
          <iframe
            src="https://my.spline.design/retrofuturisticcircuitloop-JngSBMetOQh9Jn4XS5OxTiIc/"
            title="decorative"
            loading="lazy"
            tabIndex={-1}
          />
        </div>
        {mounted && <canvas ref={canvasRef} className="cc__canvas" aria-hidden="true" />}
        <div className="cc__vignette" aria-hidden="true" />

        <div className="cc__content">
          <div className="cc__eyebrow">Custom configuration</div>
          <h2 className="cc__title">
            Build your<br /><em>machine order.</em>
          </h2>
          <p className="cc__desc">
            Browse every model, pick the spec that fits your production, then send us an inquiry — our engineers reply within 24 hours.
          </p>

          <TransitionLink href="/products" className="cc__cta">
            Choose a machine
            <span className="cc__cta-arr" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2.5 6.5h8M8 3l3 3.5-3 3" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </TransitionLink>

          <div className="cc__hint" aria-label="Steps">
            {["Browse machines","Select & configure","Send inquiry"].map((s, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:".6rem" }}>
                <div className="cc__hint-step">
                  <span className="cc__hint-num">{i + 1}</span>
                  {s}
                </div>
                {i < 2 && <div className="cc__hint-sep" />}
              </div>
            ))}
          </div>
        </div>

        <div className="cc__wave" aria-hidden="true">
          <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display:"block", width:"100%" }}>
            <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill="#0d1614"/>
          </svg>
        </div>
      </section>
    </>
  );
}
