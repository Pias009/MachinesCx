"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { latestArticles, type NewsArticle } from "@/lib/news";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function NewsStrip() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const sectionRef  = useRef<HTMLElement>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/content/news")
      .then(r => r.json())
      .then(j => { if (alive && Array.isArray(j.articles)) setNews(latestArticles(j, 6)); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || news.length === 0) return;
    const el: HTMLDivElement = track;

    /* ── State ── */
    let x            = 0;          // current translate X
    let vel          = 0;          // drag velocity (px/frame)
    let paused       = false;      // hover pause
    let dragging     = false;
    let dragStartX   = 0;
    let dragStartPos = 0;
    let lastDragX    = 0;
    let lastDragTime = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let raf: number;

    const SPEED   = 0.5;           // auto-scroll px/frame
    const EASE    = 0.08;          // drag release momentum ease

    function halfW() {
      return (track?.scrollWidth ?? 0) / 2;
    }

    function apply() {
      // seamless loop — when we pass the halfway point, jump back
      const hw = halfW();
      if (x <= -hw) x += hw;
      if (x >  0)   x -= hw;
      el.style.transform = `translateX(${x}px)`;
    }

    function loop() {
      if (!dragging) {
        // auto-scroll when not paused/dragging
        if (!paused) x -= SPEED;
        // momentum decay after drag release
        if (Math.abs(vel) > 0.1) {
          x  += vel;
          vel *= 0.94;
        } else {
          vel = 0;
        }
      }
      apply();
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    /* ── Hover: pause auto-scroll, keep drag working ── */
    const onEnter = () => { paused = true; };
    const onLeave = () => {
      if (!dragging) paused = false;
    };

    /* ── Mouse drag ── */
    const onMouseDown = (e: MouseEvent) => {
      dragging     = true;
      paused       = true;
      vel          = 0;
      dragStartX   = e.clientX;
      dragStartPos = x;
      lastDragX    = e.clientX;
      lastDragTime = performance.now();
      el.style.cursor = "grabbing";
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const now  = performance.now();
      const dt   = now - lastDragTime || 1;
      const dx   = e.clientX - lastDragX;
      vel        = dx / dt * 16;          // scale to ~px/frame at 60fps
      lastDragX  = e.clientX;
      lastDragTime = now;
      x = dragStartPos + (e.clientX - dragStartX);
      apply();
    };

    const onMouseUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      // resume auto-scroll after 1.2s of inertia
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, 1200);
    };

    /* ── Touch drag ── */
    const onTouchStart = (e: TouchEvent) => {
      dragging     = true;
      paused       = true;
      vel          = 0;
      dragStartX   = e.touches[0].clientX;
      dragStartPos = x;
      lastDragX    = e.touches[0].clientX;
      lastDragTime = performance.now();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!dragging) return;
      const now  = performance.now();
      const dt   = now - lastDragTime || 1;
      const dx   = e.touches[0].clientX - lastDragX;
      vel        = dx / dt * 16;
      lastDragX  = e.touches[0].clientX;
      lastDragTime = now;
      x = dragStartPos + (e.touches[0].clientX - dragStartX);
      apply();
      e.preventDefault();
    };

    const onTouchEnd = () => {
      dragging = false;
      if (resumeTimer) clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => { paused = false; }, 1200);
    };

    el.style.cursor = "grab";
    el.addEventListener("mouseenter",  onEnter);
    el.addEventListener("mouseleave",  onLeave);
    el.addEventListener("mousedown",   onMouseDown);
    el.addEventListener("touchstart",  onTouchStart, { passive: true });
    el.addEventListener("touchmove",   onTouchMove,  { passive: false });
    el.addEventListener("touchend",    onTouchEnd);
    window.addEventListener("mousemove",  onMouseMove);
    window.addEventListener("mouseup",    onMouseUp);

    /* ── Scroll-triggered entrance ── */
    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      gsap.fromTo(eyebrowRef.current,
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: 0.9, ease: "expo.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(headRef.current,
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(track,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "expo.out", delay: 0.22,
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none none" } }
      );
    })();

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      el.removeEventListener("mouseenter",  onEnter);
      el.removeEventListener("mouseleave",  onLeave);
      el.removeEventListener("mousedown",   onMouseDown);
      el.removeEventListener("touchstart",  onTouchStart);
      el.removeEventListener("touchmove",   onTouchMove);
      el.removeEventListener("touchend",    onTouchEnd);
      window.removeEventListener("mousemove",  onMouseMove);
      window.removeEventListener("mouseup",    onMouseUp);
    };
  }, [news]);

  /* Duplicate cards for seamless loop */
  const doubled = [...news, ...news];

  return (
    <section ref={sectionRef} style={{
      background: "var(--bg-base)",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "clamp(4rem,8vw,7rem) 0 clamp(4rem,8vw,6rem)",
      overflow: "hidden",
      position: "relative",
    }}>

      {/* Red top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "2px",
        background: "var(--brand-red)",
      }} />

      {/* Ambient glow */}
      <div aria-hidden style={{
        position: "absolute", top: 0, left: "30%", width: "40%", height: "60%",
        background: "radial-gradient(ellipse at 50% 0%, rgba(225,29,72,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <style suppressHydrationWarning>{`
        /* ── card ── */
        .ns2-card {
          flex-shrink: 0;
          width: clamp(280px, 28vw, 380px);
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-top: 2px solid transparent;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: border-color .25s, background .25s, transform .3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }
        .ns2-card:hover {
          border-top-color: var(--brand-red);
          background: rgba(255,255,255,0.05);
          transform: translateY(-6px);
          z-index: 2;
        }

        /* shimmer on hover */
        .ns2-card::after {
          content: "";
          position: absolute; inset: 0;
          background: linear-gradient(108deg, transparent 36%, rgba(255,255,255,0.04) 50%, transparent 64%);
          transform: translateX(-130%);
          pointer-events: none;
        }
        .ns2-card:hover::after {
          animation: ns2-shim 0.65s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes ns2-shim { to { transform: translateX(160%); } }

        /* image */
        .ns2-img-wrap {
          width: 100%; aspect-ratio: 16/9;
          background: rgba(255,255,255,0.04);
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          position: relative;
        }
        .ns2-img {
          width: 58%; height: 72%;
          margin: auto; left: 0; right: 0; top: 0; bottom: 0;
          object-fit: contain;
          filter: drop-shadow(0 6px 16px rgba(0,0,0,0.5));
          transition: transform 0.45s cubic-bezier(0.16,1,0.3,1), filter .35s ease;
        }
        .ns2-card:hover .ns2-img {
          transform: scale(1.08) translateY(-3%);
          filter: drop-shadow(0 12px 28px rgba(225,29,72,0.18));
        }

        /* red bar bottom of image */
        .ns2-img-bar {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--brand-red);
          transform: scaleX(0); transform-origin: left;
          transition: transform .35s cubic-bezier(0.16,1,0.3,1);
        }
        .ns2-card:hover .ns2-img-bar { transform: scaleX(1); }

        /* body */
        .ns2-body {
          padding: 1.1rem 1.2rem 1.4rem;
          display: flex; flex-direction: column; flex: 1;
          gap: 0.4rem;
        }
        .ns2-meta {
          display: flex; align-items: center; gap: 0.6rem;
        }
        .ns2-cat {
          font-family: var(--ff-mono); font-size: 0.64rem;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--brand-red);
        }
        .ns2-sep {
          width: 1px; height: 10px;
          background: rgba(255,255,255,0.12);
        }
        .ns2-date {
          font-family: var(--ff-mono); font-size: 0.64rem;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.55);
        }
        .ns2-title {
          font-family: var(--ff-body);
          font-size: clamp(0.95rem, 1.4vw, 1.08rem);
          font-weight: 600;
          color: rgba(255,255,255,0.92); line-height: 1.45;
          letter-spacing: -0.01em; margin: 0.1rem 0;
        }
        .ns2-excerpt {
          font-family: var(--ff-body); font-size: 0.78rem; font-weight: 400;
          color: rgba(255,255,255,0.65); line-height: 1.65;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
          flex: 1;
        }
        .ns2-cta {
          display: inline-flex; align-items: center; gap: 0.4rem;
          font-family: var(--ff-mono); font-size: 0.66rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--brand-red); margin-top: 0.4rem;
          opacity: 0; transform: translateX(-8px);
          transition: opacity .22s, transform .22s;
        }
        .ns2-card:hover .ns2-cta { opacity: 1; transform: translateX(0); }

        /* fade edges */
        .ns2-fade-l, .ns2-fade-r {
          position: absolute; top: 0; bottom: 0; width: 80px;
          pointer-events: none; z-index: 5;
        }
        .ns2-fade-l { left: 0;  background: linear-gradient(to right, var(--bg-base), transparent); }
        .ns2-fade-r { right: 0; background: linear-gradient(to left,  var(--bg-base), transparent); }
      `}</style>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 clamp(1.25rem,4vw,3rem)" }}>

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "1.5rem", flexWrap: "wrap",
          marginBottom: "clamp(2rem,4vw,3rem)",
        }}>
          <div data-no-anim>
            <span ref={eyebrowRef} className="eyebrow" style={{
              marginBottom: "0.9rem", color: "var(--brand-red)",
              display: "inline-flex", alignItems: "center", gap: "0.75rem",
              opacity: 0,
            }}>
              Latest news
            </span>
            <div ref={headRef} style={{ opacity: 0 }}>
              <h2 style={{
                fontFamily: "var(--ff-display)",
                fontSize: "clamp(2.8rem,6vw,5rem)",
                lineHeight: 0.92, color: "var(--ink)",
                letterSpacing: "0.01em", margin: 0,
              }}>
                From the factory<br />
                <span style={{ color: "var(--brand-red)" }}>floor.</span>
              </h2>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", alignSelf: "flex-end" }}>
            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{
                width: 6, height: 6,
                background: "var(--brand-red)",
                borderRadius: 0,
                animation: "ns2-pulse 1.6s ease-in-out infinite",
              }} />
              <span style={{
                fontFamily: "var(--ff-mono)", fontSize: "0.64rem",
                letterSpacing: "0.16em", textTransform: "uppercase",
                color: "var(--ink-60)",
              }}>Auto-scrolling</span>
            </div>
            <Link href="/news" style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              fontFamily: "var(--ff-mono)", fontSize: "0.72rem", letterSpacing: "0.08em",
              textTransform: "uppercase", padding: "0.75rem 1.4rem",
              border: "1px solid var(--ink-15)", color: "var(--ink-60)",
              textDecoration: "none", transition: "border-color 0.2s, color 0.2s",
              flexShrink: 0,
            }}>
              All news →
            </Link>
          </div>
        </div>

      </div>

      {/* Scrolling track — full bleed */}
      <div style={{ position: "relative" }}>
        {/* edge fades */}
        <div className="ns2-fade-l" />
        <div className="ns2-fade-r" />

        <div
          ref={trackRef}
          data-no-anim
          style={{
            display: "flex",
            gap: "clamp(0.75rem,1.5vw,1.25rem)",
            padding: "0.5rem clamp(1.25rem,4vw,3rem) 1.5rem",
            width: "max-content",
            opacity: 0,
            userSelect: "none",
            willChange: "transform",
          }}
        >
          {doubled.map((a, i) => (
            <Link
              key={`${a.slug}-${i}`}
              href={`/news/${a.slug}`}
              className="ns2-card"
              aria-hidden={i >= news.length}
            >
              <div className="ns2-img-wrap">
                <Image src={a.image} alt={a.title} fill sizes="(max-width: 700px) 90vw, 340px" className="ns2-img" />
                <div className="ns2-img-bar" />
              </div>

              <div className="ns2-body">
                <div className="ns2-meta">
                  <span className="ns2-cat">{a.category}</span>
                  <div className="ns2-sep" />
                  <span className="ns2-date">{fmt(a.date)}</span>
                </div>
                <h3 className="ns2-title">{a.title}</h3>
                <p className="ns2-excerpt">{a.excerpt}</p>
                <span className="ns2-cta">Read article →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style suppressHydrationWarning>{`
        @keyframes ns2-pulse {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.3; transform:scale(0.7); }
        }
        @media (max-width: 640px) {
          .ns2-card { width: clamp(220px, 72vw, 300px); }
          .ns2-title { font-size: .95rem; }
          .ns2-excerpt { -webkit-line-clamp: 2; font-size: .78rem; }
          .ns2-body { padding: .9rem .9rem 1.1rem; gap: .3rem; }
        }
        @media (max-width: 480px) {
          .ns2-card { width: clamp(200px, 80vw, 260px); }
          .ns2-fade-l, .ns2-fade-r { width: 40px; }
        }
      `}</style>
    </section>
  );
}
