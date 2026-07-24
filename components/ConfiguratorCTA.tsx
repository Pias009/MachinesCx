"use client";
import { useEffect, useRef, useState } from "react";
import TransitionLink from "@/components/TransitionLink";

export default function ConfiguratorCTA() {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const raf = useRef<number>(0);

  const sectionRef  = useRef<HTMLElement>(null);
  const indexRef    = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const metricsRef  = useRef<HTMLDivElement>(null);
  const rightRef    = useRef<HTMLDivElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const hintRef     = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // ── "System Boot" scroll-in — GSAP + ScrollTrigger ───────────────────
  useEffect(() => {
    let ctx: { revert?: () => void } = {};
    let cancelled = false;

    const revealAll = () => {
      const allEls = [indexRef.current, eyebrowRef.current, titleRef.current, metricsRef.current, rightRef.current, badgeRef.current, ctaRef.current, hintRef.current];
      allEls.filter(Boolean).forEach(el => {
        const e = el as HTMLElement;
        e.style.opacity = "1"; e.style.transform = "none"; e.style.clipPath = "none";
      });
      if (hintRef.current) Array.from(hintRef.current.children).forEach(c => { (c as HTMLElement).style.opacity = "1"; (c as HTMLElement).style.transform = "none"; });
      if (metricsRef.current) metricsRef.current.querySelectorAll<HTMLElement>(".cc__metric b, .cc__metric span").forEach(el => { el.style.opacity = "1"; el.style.transform = "none"; });
    };

    (async () => {
      try {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { SplitText }     = await import("gsap/SplitText");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        const st = () => ({ trigger: sectionRef.current, start: "top 75%", end: "bottom 20%", toggleActions: "play reverse play reverse" });

        const allEls = [indexRef.current, eyebrowRef.current, titleRef.current, metricsRef.current, rightRef.current, badgeRef.current, ctaRef.current, hintRef.current];
        if (reduced) {
          gsap.set(allEls, { opacity: 1, clearProps: "all" });
          if (hintRef.current) gsap.set(hintRef.current.children, { opacity: 1, clearProps: "all" });
          if (metricsRef.current) gsap.set(metricsRef.current.querySelectorAll(".cc__metric b, .cc__metric span"), { opacity: 1, clearProps: "all" });
          return;
        }

        // Index label — slide in
        gsap.fromTo(indexRef.current, { x: -16, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power2.out", scrollTrigger: st() });

        // Eyebrow — clip wipe, same language as AiAgentBanner
        gsap.fromTo(eyebrowRef.current,
          { clipPath: "inset(0 100% 0 0)", opacity: 0 },
          { clipPath: "inset(0 0% 0 0)", opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.1, scrollTrigger: st() }
        );

        // Title — word unfold with subtle 3D rotate
        if (titleRef.current) {
          const split = new SplitText(titleRef.current, { type: "words" });
          gsap.fromTo(split.words,
            { y: "70%", opacity: 0, rotateX: -15, transformOrigin: "0% 100%" },
            { y: "0%", opacity: 1, rotateX: 0, duration: 0.7, ease: "expo.out", stagger: 0.06, delay: 0.2, scrollTrigger: st() }
          );
        }

        // Metrics — number pop + label fade, staggered left-to-right
        const metrics = metricsRef.current ? Array.from(metricsRef.current.querySelectorAll<HTMLElement>(".cc__metric")) : [];
        metrics.forEach((m, i) => {
          const num = m.querySelector("b");
          const label = m.querySelector("span");
          gsap.fromTo(num, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.6)", delay: 0.55 + i * 0.08, scrollTrigger: st() });
          gsap.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power1.out", delay: 0.65 + i * 0.08, scrollTrigger: st() });
        });

        // Right panel — power-on as one unit (brackets included, no pseudo-element targeting)
        gsap.fromTo(rightRef.current,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.6, ease: "power3.out", delay: 0.3, scrollTrigger: st() }
        );

        // Inside panel — badge, CTA, hint rows print sequentially like a boot log
        gsap.fromTo(badgeRef.current, { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.7)", delay: 0.55, scrollTrigger: st() });
        gsap.fromTo(ctaRef.current, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "power2.out", delay: 0.68, scrollTrigger: st() });
        const hintRows = hintRef.current ? Array.from(hintRef.current.children) : [];
        gsap.fromTo(hintRows,
          { y: 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", stagger: 0.08, delay: 0.8, scrollTrigger: st() }
        );
      }, sectionRef);
      } catch {
        if (!cancelled) revealAll();
      }
    })();

    const fallback = setTimeout(() => { if (!cancelled) revealAll(); }, 4000);

    return () => { cancelled = true; clearTimeout(fallback); ctx.revert?.(); };
  }, []);

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
          min-height: 820px;
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
          display: flex; flex-direction: row;
          align-items: center; justify-content: space-between;
          gap: clamp(2rem, 12vw, 12rem);
          padding: clamp(4rem,8vw,7rem) clamp(1.5rem,5vw,4rem);
          width: 100%; margin: 0 auto;
        }
        .cc__left { flex: 0 0 38%; max-width: 38%; text-align: left; }
        .cc__index {
          font-family: var(--ff-mono); font-size: .7rem; letter-spacing: .2em;
          text-transform: uppercase; color: rgba(248,250,252,.4);
          display: flex; align-items: center; gap: .7rem; margin-bottom: 2rem;
        }
        .cc__index b { color: var(--brand-teal); font-weight: 600; }
        .cc__index::after { content:""; flex:1; height:1px; background: linear-gradient(90deg, rgba(43,191,179,.4), transparent); }
        .cc__right {
          flex: 0 0 30%; max-width: 30%;
          display: flex; flex-direction: column; align-items: stretch;
          text-align: left;
          padding: clamp(1.75rem, 2.5vw, 2.5rem);
          background: transparent;
          border: 1px solid rgba(43,191,179,.18);
          border-radius: 2px;
          box-shadow: 0 30px 80px -30px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.04);
          position: relative;
        }
        .cc__right::before, .cc__right::after {
          content:""; position:absolute; width:14px; height:14px; pointer-events:none;
          border-color: var(--brand-teal);
        }
        .cc__right::before { top:-1px; left:-1px; border-top:2px solid; border-left:2px solid; }
        .cc__right::after { bottom:-1px; right:-1px; border-bottom:2px solid; border-right:2px solid; }
        .cc__badge {
          display:inline-flex; align-items:center; gap:.5rem; align-self:flex-start;
          font-family: var(--ff-mono); font-size:.6rem; letter-spacing:.16em; text-transform:uppercase;
          color: var(--brand-teal); margin-bottom:1.25rem;
          padding:.35rem .7rem; border:1px solid rgba(43,191,179,.25);
          border-radius:999px; background: rgba(43,191,179,.06);
        }
        .cc__badge .dot { width:6px; height:6px; border-radius:50%; background:var(--brand-teal); box-shadow:0 0 8px var(--brand-teal); animation: ccpulse 2s infinite; }
        @keyframes ccpulse { 0%,100%{opacity:1;} 50%{opacity:.3;} }
        .cc__eyebrow {
          display: inline-flex; align-items: center; gap: .6rem;
          font-family: var(--ff-mono); font-size: .65rem;
          letter-spacing: .26em; text-transform: uppercase;
          color: var(--brand-teal); margin-bottom: 1.4rem;
        }
        .cc__eyebrow::after { content:""; width:2rem; height:1px; background:var(--brand-teal); }
        .cc__title {
          font-family: var(--ff-display);
          font-size: clamp(3rem,6.5vw,6.5rem);
          line-height: .9; letter-spacing: -.02em;
          color: #f8fafc; margin: 0 0 1.75rem;
          overflow: hidden; /* clips SplitText word-rise cleanly */
          padding-bottom: 0.15em; /* room for descenders during the rise */
        }
        .cc__title em {
          font-style:normal;
          background: linear-gradient(120deg, var(--brand-teal), #7fe9df);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .cc__metrics {
          display:flex; gap:2rem; margin-top:.5rem;
        }
        .cc__metric { display:flex; flex-direction:column; gap:.25rem; }
        .cc__metric b { font-family: var(--ff-display); font-size:1.6rem; color:#f8fafc; line-height:1; }
        .cc__metric span { font-family: var(--ff-mono); font-size:.6rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(248,250,252,.45); }
        .cc__desc {
          font-size: clamp(.78rem,0.9vw,.85rem);
          color: rgba(248,250,252,0.7);
          line-height: 1.7; max-width: 46ch; margin: 0 0 2rem;
          text-align: left;
        }
        .cc__cta {
          display: flex; align-items: center; justify-content: space-between; gap: .9rem;
          align-self: stretch;
          padding: 1.05rem 1.5rem;
          border: 1px solid var(--brand-red);
          border-radius: 2px;
          background: var(--brand-red);
          font-family: var(--ff-mono); font-size: .8rem;
          letter-spacing: .1em; text-transform: uppercase;
          font-weight: 600;
          color: #fff; text-decoration: none;
        }
        .cc__cta:hover {
          background: var(--brand-teal-dk);
        }
        .cc__cta-arr {
          display:flex; align-items:center; justify-content:center;
          width:30px; height:30px; border-radius:2px;
          background: rgba(255,255,255,.18);
          flex-shrink:0; transition: transform .25s;
        }
        .cc__cta:hover .cc__cta-arr { transform: translateX(4px); }
        .cc__hint {
          display: flex; flex-direction: column; gap: 0;
          margin-top: 1.75rem;
          width: 100%;
          border-top: 1px solid rgba(255,255,255,.08);
        }
        .cc__hint-row {
          display: flex; align-items: center; gap: .8rem;
          padding: .85rem .25rem;
          border-bottom: 1px solid rgba(255,255,255,.06);
          transition: padding-left .2s, background .2s;
        }
        .cc__hint-row:last-child { border-bottom: none; }
        .cc__hint-row:hover { padding-left: .8rem; background: rgba(43,191,179,.04); }
        .cc__hint-step {
          display: flex; align-items: center; gap: .7rem;
          font-family: var(--ff-mono); font-size: 0.72rem;
          letter-spacing: .08em; text-transform: uppercase;
          color: rgba(248,250,252,0.7);
        }
        .cc__hint-num {
          width: 26px; height: 26px; border-radius: 50%;
          border: 1px solid rgba(43,191,179,.35);
          background: rgba(43,191,179,.08);
          display:flex; align-items:center; justify-content:center;
          font-size: 0.68rem; color: var(--brand-teal); flex-shrink:0; font-weight:600;
        }
        .cc__wave {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 4; line-height:0;
        }
        @media(max-width:640px){
          .cc { min-height: auto; }
          .cc__content { padding: clamp(1.75rem,4.5vw,2.5rem) 1.25rem; flex-direction: column; gap: 1.25rem; align-items: stretch; }
          .cc__left, .cc__right { flex: 1 1 100%; max-width: 100%; }
          .cc__title { font-size: clamp(2rem,8vw,3.5rem); }
          .cc__desc { font-size: 0.88rem; margin-bottom: 1rem; }
          .cc__cta { font-size: .72rem; }
          .cc__metrics { gap: 1.25rem; }
        }
        @media(max-width:480px){
          .cc__title { font-size: clamp(1.7rem,9vw,2.6rem); }
          .cc__cta { width: 100%; justify-content: center; }
        }
      `}</style>

      <section ref={sectionRef} className="cc" data-no-anim aria-label="Build your configuration">
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
          <div className="cc__left">
            <div ref={indexRef} className="cc__index"><b>01</b> / Configurator</div>
            <div ref={eyebrowRef} className="cc__eyebrow">Custom configuration</div>
            <h2 ref={titleRef} className="cc__title">
              Build your<br /><em>machine order.</em>
            </h2>
            <div ref={metricsRef} className="cc__metrics">
              <div className="cc__metric"><b>120+</b><span>Models</span></div>
              <div className="cc__metric"><b>24h</b><span>Reply time</span></div>
              <div className="cc__metric"><b>∞</b><span>Configs</span></div>
            </div>
          </div>

          <div ref={rightRef} className="cc__right">
            <div ref={badgeRef} className="cc__badge"><span className="dot" />Engineers online</div>

            <div ref={ctaRef}>
              <TransitionLink href="/products" className="cc__cta">
                Choose a machine
                <span className="cc__cta-arr" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M2.5 6.5h8M8 3l3 3.5-3 3" stroke="#f8fafc" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </TransitionLink>
            </div>

            <div ref={hintRef} className="cc__hint" aria-label="Steps">
              {["Browse machines","Select & configure","Send inquiry"].map((s, i) => (
                <div key={i} className="cc__hint-row">
                  <div className="cc__hint-step">
                    <span className="cc__hint-num">{i + 1}</span>
                    {s}
                  </div>
                </div>
              ))}
            </div>
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
