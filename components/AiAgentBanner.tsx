"use client";
import { useEffect, useRef, useState } from "react";
import { openAshaChat } from "@/components/ChatWidget";

/** Procedural tech backdrop — a slowly drifting circuit/node grid, drawn on
 *  canvas so the section needs no external image asset (matches the site's
 *  existing ConfiguratorCTA pattern). */
function useCircuitCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, mounted: boolean) {
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let visible = false;
    let t = 0;

    function resize() {
      if (!canvas) return;
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const nodes: { x: number; y: number; vx: number; vy: number }[] = Array.from({ length: 26 }, () => ({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00025, vy: (Math.random() - 0.5) * 0.00025,
    }));

    function draw() {
      raf.current = requestAnimationFrame(draw);
      if (!visible || !canvas || !ctx) return;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = (a.x - b.x) * W, dy = (a.y - b.y) * H;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 190) {
            ctx.strokeStyle = `rgba(43,191,179,${0.12 * (1 - dist / 190)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * W, a.y * H);
            ctx.lineTo(b.x * W, b.y * H);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = "rgba(43,191,179,0.55)";
        ctx.beginPath();
        ctx.arc(n.x * W, n.y * H, 1.6, 0, Math.PI * 2);
        ctx.fill();
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
  }, [mounted, canvasRef]);
}

export default function AiAgentBanner() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => { setMounted(true); }, []);
  useCircuitCanvas(canvasRef, mounted);

  return (
    <>
      <style suppressHydrationWarning>{`
        .aib {
          position: relative;
          min-height: 320px;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
          background:
            radial-gradient(ellipse 60% 100% at 20% 30%, rgba(43,191,179,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 60% 100% at 80% 70%, rgba(43,191,179,0.08) 0%, transparent 60%),
            #0a1211;
        }
        .aib__canvas {
          position: absolute; inset: 0; z-index: 0;
          width: 100%; height: 100%; pointer-events: none;
        }
        .aib__grid {
          position: absolute; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(43,191,179,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(43,191,179,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 90%);
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
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .68rem;
          letter-spacing: .24em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1rem;
        }
        .aib__eyebrow::before { content:""; width:8px; height:8px; border-radius:50%; background:var(--brand-teal); box-shadow: 0 0 12px var(--brand-teal); }
        .aib__title {
          font-family: var(--ff-body);
          font-weight: 600;
          font-size: clamp(1.7rem,3.4vw,2.5rem);
          line-height: 1.2; letter-spacing: -.02em;
          color: #f8fafc; margin: 0 0 0.9rem;
        }
        .aib__title em { font-style: normal; font-weight: 700; color: var(--brand-teal); }
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
          background: var(--brand-teal); color: #06110f;
          border: none; cursor: pointer;
          border-radius: 999px;
          font-family: var(--ff-body); font-size: .98rem;
          letter-spacing: -.005em;
          font-weight: 600;
          box-shadow: 0 8px 28px rgba(43,191,179,0.35);
          transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .aib__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(43,191,179,0.5);
          background: #3dd6ca;
        }
        .aib__cta-icon {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 50%;
          background: rgba(6,17,15,0.15);
          flex-shrink: 0;
        }
        .aib__hint {
          font-family: var(--ff-mono); font-size: .7rem;
          letter-spacing: .05em; color: rgba(248,250,252,0.4);
        }

        @media (max-width: 800px) {
          .aib__content { flex-direction: column; align-items: flex-start; text-align: left; }
          .aib__actions { align-items: flex-start; }
        }
      `}</style>

      <section className="aib" aria-label="Meet ASHA, our AI machine assistant">
        {mounted && <canvas ref={canvasRef} className="aib__canvas" aria-hidden="true" />}
        <div className="aib__grid" aria-hidden="true" />

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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M4 4h16v11H8l-4 4V4z" stroke="#06110f" strokeWidth="2" strokeLinejoin="round" /></svg>
              </span>
            </button>
            <div className="aib__hint">No forms. Just ask.</div>
          </div>
        </div>
      </section>
    </>
  );
}
