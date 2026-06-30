"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import TransitionLink from "@/components/TransitionLink";
import { families, categories } from "@/lib/products";
import type { CategorySlug, ProductFamily } from "@/lib/products";

const ALL = "all" as const;
type Tab = typeof ALL | CategorySlug;

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMS  = "0123456789";

function randChar(target: string) {
  if (/[0-9]/.test(target)) return NUMS[Math.floor(Math.random() * NUMS.length)];
  if (/[A-Za-z]/.test(target)) return ALPHA[Math.floor(Math.random() * ALPHA.length)];
  return target;
}

/* Animate a DOM span's textContent:
   - letters: scramble from random chars, resolve left→right
   - numbers: count up from 0 to the target digit then pause */
function animateText(el: HTMLElement, final: string, duration: number) {
  const chars = final.split("");
  const resolvedAt = chars.map((_, i) => (i / chars.length) * duration * 0.85);
  let start = 0;

  const tick = (now: number) => {
    if (!start) start = now;
    const elapsed = now - start;
    let out = "";
    let allDone = true;

    for (let i = 0; i < chars.length; i++) {
      const target = chars[i];
      if (elapsed >= resolvedAt[i]) {
        out += target;
      } else {
        allDone = false;
        if (/[0-9]/.test(target)) {
          // count up: show a digit proportional to elapsed / resolvedAt
          const prog = elapsed / resolvedAt[i];
          out += String(Math.floor(Number(target) * prog));
        } else if (/[A-Za-z]/.test(target)) {
          out += randChar(target);
        } else {
          out += target; // spaces, dots, slashes — show immediately
        }
      }
    }

    el.textContent = out;
    if (!allDone) requestAnimationFrame(tick);
    else el.textContent = final; // snap to exact final value
  };

  requestAnimationFrame(tick);
}

/* Reveal a series name letter by letter left → right */
function animateSeries(el: HTMLElement, final: string, duration: number) {
  const perChar = duration / final.length;
  let revealed = 0;
  el.textContent = " ".repeat(final.length); // hold width

  const step = () => {
    revealed++;
    el.textContent = final.slice(0, revealed) + " ".repeat(final.length - revealed);
    if (revealed < final.length) setTimeout(step, perChar);
    else el.textContent = final;
  };
  setTimeout(step, perChar);
}

/* ─── Liquid drop border card ────────────────────────────────────────────────
   Two SVG rects stacked:
   1. DROP rect  — a short dash (the "liquid drop") travels the full perimeter
      once, slowly with a weighted ease (heavy at start, settles at end).
      Uses a cyan→sky→white gradient that fades at both tail and head.
   2. TRAIL rect — fades in progressively behind the drop as the permanent
      border, settling to a faint cyan/teal line after the drop finishes.

   On scroll-enter the drop starts from the top-left corner, accelerates
   briefly then glides around the card. Text animations fire at the same time.
────────────────────────────────────────────────────────────────────────── */
function ElectricCard({ f, delay, onQuickView }: { f: (typeof families)[number]; delay: number; onQuickView: () => void }) {
  const catLabel   = categories.find((c) => c.slug === f.category)?.name ?? f.category;
  const wrapRef    = useRef<HTMLDivElement>(null);
  const dropRef    = useRef<SVGRectElement>(null);
  const trailRef   = useRef<SVGRectElement>(null);
  const seriesRef  = useRef<HTMLSpanElement>(null);
  const nameRef    = useRef<HTMLSpanElement>(null);
  const catRef     = useRef<HTMLSpanElement>(null);
  const rafRef     = useRef<number>(0);
  const activeRef  = useRef(false);

  const W = 280, H = 278;
  const PERIM    = 2 * (W + H);
  const DROP_LEN = 90;
  const GAP      = PERIM - DROP_LEN;
  const DURATION = 2200;

  const displayName = f.name.length > 52 ? f.name.slice(0, 52) + "…" : f.name;

  useEffect(() => {
    const el    = wrapRef.current;
    const drop  = dropRef.current;
    const trail = trailRef.current;
    if (!el || !drop || !trail) return;

    drop.style.strokeDasharray  = `${DROP_LEN} ${GAP}`;
    drop.style.strokeDashoffset = "0";
    drop.style.opacity = "0";
    trail.style.strokeDasharray  = `${PERIM}`;
    trail.style.strokeDashoffset = `${PERIM}`;
    trail.style.opacity = "0";

    // ── magnetic lift + image parallax on mousemove ──────────────────
    const img = el.querySelector<HTMLElement>(".pb-card__img");

    const onEnter = () => {
      el.style.transition  = "transform 0.38s cubic-bezier(0.16,1,0.3,1), box-shadow 0.38s cubic-bezier(0.16,1,0.3,1)";
      el.style.transform   = "translateY(-8px) scale(1.03)";
      el.style.boxShadow   = "0 24px 56px -8px rgba(15,23,42,0.22), 0 8px 20px -4px rgba(15,23,42,0.12)";
      el.style.zIndex      = "5";
    };
    const onMove = (e: MouseEvent) => {
      if (!img) return;
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width  - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      // image drifts opposite to cursor — subtle parallax max ±8px
      img.style.transform = `translate(${-cx * 8}px, ${-cy * 8}px) scale(1.08)`;
    };
    const onLeave = () => {
      el.style.transition = "transform 0.55s cubic-bezier(0.16,1,0.3,1), box-shadow 0.55s cubic-bezier(0.16,1,0.3,1)";
      el.style.transform  = "translateY(0) scale(1)";
      el.style.boxShadow  = "";
      el.style.zIndex     = "";
      if (img) {
        img.style.transition = "transform 0.55s cubic-bezier(0.16,1,0.3,1)";
        img.style.transform  = "";
        setTimeout(() => { if (img) img.style.transition = ""; }, 560);
      }
      setTimeout(() => { el.style.transition = ""; }, 560);
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove",  onMove);
    el.addEventListener("mouseleave", onLeave);

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !activeRef.current) {
          activeRef.current = true;
          setTimeout(() => {
            playDrop(drop, trail);
            if (catRef.current)    animateText(catRef.current,    catLabel,    600);
            if (seriesRef.current) animateSeries(seriesRef.current, f.series,  800);
            if (nameRef.current)   animateText(nameRef.current,   displayName, 1100);
          }, delay);
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove",  onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delay]);

  function playDrop(drop: SVGRectElement, trail: SVGRectElement) {
    drop.style.opacity  = "1";
    trail.style.opacity = "1";

    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);

      // Weighted ease: cubic-bezier-like — fast drop start, smooth glide
      // Uses a custom curve: fast for first 30%, then linear-ish, then eases in
      let eased: number;
      if (t < 0.3) {
        // accelerate — cubic ease-in
        eased = (t / 0.3) * (t / 0.3) * (t / 0.3) * 0.45;
      } else {
        // glide — ease-out over the remaining 70%
        const r = (t - 0.3) / 0.7;
        eased = 0.45 + (1 - Math.pow(1 - r, 2.2)) * 0.55;
      }

      const offset = -(eased * PERIM);

      // Drop travels around border
      drop.style.strokeDashoffset = `${offset}`;

      // Trail reveals progressively: as drop moves, trail extends behind it
      // trailOffset shrinks from PERIM → 0 but lags the drop head by DROP_LEN
      const trailOffset = Math.max(0, PERIM + offset + DROP_LEN);
      trail.style.strokeDashoffset = `${trailOffset}`;
      trail.style.opacity = String(Math.min(t * 3, 0.35)); // faint permanent line

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        // drop finished — fade it out, keep faint trail border
        drop.style.transition  = "opacity 0.5s ease";
        drop.style.opacity     = "0";
        trail.style.transition = "opacity 0.8s ease, stroke-dashoffset 0s";
        trail.style.strokeDashoffset = "0";
        trail.style.opacity    = "0.22";
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div ref={wrapRef} className="pb-card-outer">

      {/* FRONT — normal flow, gives card its height */}
      <TransitionLink href={`/products/${f.category}/${f.slug}`} className="pb-card pb-card--front">
        <div className="pb-card__img-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/machines/${f.slug}.png`} alt={f.series} className="pb-card__img" />
        </div>
        <div className="pb-card__body">
          <span ref={catRef}    className="pb-card__cat">{catLabel}</span>
          <span ref={seriesRef} className="pb-card__series">{f.series}</span>
          <span ref={nameRef}   className="pb-card__name">{displayName}</span>
          <span className="pb-card__cta">View specs →</span>
        </div>
      </TransitionLink>

      {/* BACK — absolute overlay, dissolves in on hover */}
      <div className="pb-card pb-card--back">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/machines/${f.slug}.png`} alt="" className="pb-back__bg-img" />
        <div className="pb-back__overlay" />
        <div className="pb-back__actions">
          <button className="pb-back__btn pb-back__btn--quick" onClick={onQuickView}>
            <span className="pb-btn3d__shine" />
            <span className="pb-btn3d__label">Quick View</span>
          </button>
          <TransitionLink href={`/products/${f.category}/${f.slug}`} className="pb-back__btn pb-back__btn--full">
            <span className="pb-btn3d__shine" />
            <span className="pb-btn3d__label">Full Specs →</span>
          </TransitionLink>
        </div>
      </div>

      {/* liquid drop border SVG */}
      <svg className="pb-card__border-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id={`drop-${f.slug}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#38bdf8" stopOpacity="0"   />
            <stop offset="18%"  stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="50%"  stopColor="#e0f2fe" stopOpacity="1"   />
            <stop offset="78%"  stopColor="#0ea5e9" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"   />
          </linearGradient>
          <linearGradient id={`trail-${f.slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#0ea5e9" stopOpacity="0.6" />
            <stop offset="50%"  stopColor="#06b6d4" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        <rect ref={trailRef} x="1" y="1" width={W-2} height={H-2} fill="none"
          stroke={`url(#trail-${f.slug})`} strokeWidth="1.5" style={{ opacity: 0 }} />
        <rect ref={dropRef}  x="1" y="1" width={W-2} height={H-2} fill="none"
          stroke={`url(#drop-${f.slug})`}  strokeWidth="3" strokeLinecap="round"
          style={{ opacity: 0, filter: "drop-shadow(0 0 4px #38bdf8) drop-shadow(0 0 10px #0ea5e9)" }} />
      </svg>
    </div>
  );
}

/* ─── Quick View Modal ────────────────────────────────────────────────────── */
function QuickViewModal({ f, onClose }: { f: ProductFamily; onClose: () => void }) {
  const catLabel = categories.find((c) => c.slug === f.category)?.name ?? f.category;
  const topSpecs = f.specs.slice(0, 5);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="qv-backdrop" onClick={onClose}>
      <div className="qv-modal" onClick={(e) => e.stopPropagation()}>
        {/* close */}
        <button className="qv-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" width="18" height="18">
            <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
          </svg>
        </button>

        {/* image */}
        <div className="qv-img-wrap">
          <div className="qv-img-accent" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/machines/${f.slug}.png`} alt={f.series} className="qv-img" />
        </div>

        {/* info */}
        <div className="qv-body">
          <span className="qv-cat">{catLabel}</span>
          <h3 className="qv-series">{f.series}</h3>
          <p className="qv-name">{f.name}</p>
          {f.tagline && <p className="qv-tagline">{f.tagline}</p>}

          {/* key specs */}
          <div className="qv-specs">
            {topSpecs.map((row) => (
              <div key={row.label} className="qv-spec-row">
                <span className="qv-spec-label">{row.label}</span>
                <span className="qv-spec-val">{row.values[0]}</span>
              </div>
            ))}
          </div>

          {/* actions */}
          <div className="qv-actions">
            <TransitionLink href={`/products/${f.category}/${f.slug}`} className="qv-btn qv-btn--full">
              View full specs →
            </TransitionLink>
            <TransitionLink href="/contact" className="qv-btn qv-btn--inquiry">
              Send inquiry
            </TransitionLink>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main section ────────────────────────────────────────────────────────── */
export default function ProductBrowser() {
  const [tab, setTab]       = useState<Tab>(ALL);
  const [query, setQuery]   = useState("");
  const [quickView, setQuickView] = useState<ProductFamily | null>(null);
  const openQuickView  = useCallback((f: ProductFamily) => setQuickView(f), []);
  const closeQuickView = useCallback(() => setQuickView(null), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return families.filter((f) => {
      const matchCat = tab === ALL || f.category === tab;
      const matchQ   = !q ||
        f.name.toLowerCase().includes(q) ||
        f.series.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [tab, query]);

  return (
    <section className="pb-section">
      <div className="pb-inner">

        {/* ── heading ── */}
        <div className="pb-heading">
          <span className="eyebrow" style={{ marginBottom: "1rem" }}>Full catalogue</span>
          <h2 className="pb-heading__h2">
            Every machine.<br />
            <span style={{ color: "var(--brand-red)" }}>Find yours.</span>
          </h2>
        </div>

        {/* ── controls ── */}
        <div className="pb-controls">
          {/* search */}
          <div className="pb-search-wrap">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" className="pb-search-icon">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="13" y1="13" x2="17" y2="17" />
            </svg>
            <input
              type="search"
              placeholder="Search machines…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pb-search"
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-red)")}
              onBlur={(e)  => (e.currentTarget.style.borderColor = "var(--line)")}
            />
          </div>

          {/* tabs */}
          <div className="pb-tabs">
            {([{ slug: ALL, name: "All" }, ...categories] as { slug: Tab; name: string }[]).map((c) => (
              <button
                key={c.slug}
                onClick={() => setTab(c.slug)}
                className={`pb-tab${tab === c.slug ? " pb-tab--active" : ""}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          <span className="pb-count">
            {filtered.length} machine{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── grid ── */}
        {filtered.length === 0 ? (
          <div className="pb-empty">No machines match &ldquo;{query}&rdquo;</div>
        ) : (
          <div className="pb-grid">
            {filtered.map((f, i) => (
              <ElectricCard key={f.slug} f={f} delay={i * 60} onQuickView={() => openQuickView(f)} />
            ))}
          </div>
        )}
      </div>

      {quickView && <QuickViewModal f={quickView} onClose={closeQuickView} />}

      <style suppressHydrationWarning>{`
        .pb-section {
          background: var(--canvas-bg);
          border-top: 1px solid var(--line);
          padding: clamp(4rem,8vw,7rem) 0 clamp(4rem,8vw,6rem);
        }
        .pb-inner {
          max-width: 1280px; margin: 0 auto;
          padding: 0 clamp(1.25rem,4vw,3rem);
        }
        .pb-heading { margin-bottom: clamp(2rem,4vw,3rem); }
        .pb-heading__h2 {
          font-family: var(--ff-display);
          font-size: clamp(2.8rem,7vw,5.5rem);
          line-height: 0.93; color: var(--slate); letter-spacing: 0.01em;
        }

        /* controls */
        .pb-controls {
          display: flex; flex-wrap: wrap; gap: 0.75rem;
          align-items: center; margin-bottom: 2rem;
        }
        .pb-search-wrap {
          position: relative; flex-shrink: 0;
          width: clamp(200px,28vw,320px);
        }
        .pb-search-icon {
          position: absolute; left: 0.85rem; top: 50%;
          transform: translateY(-50%);
          width: 15px; height: 15px;
          color: var(--slate-30); pointer-events: none;
        }
        .pb-search {
          width: 100%; padding: 0.65rem 0.9rem 0.65rem 2.4rem;
          font-family: var(--ff-mono); font-size: 0.72rem;
          letter-spacing: 0.06em; color: var(--slate);
          background: var(--surface); border: 1px solid var(--line);
          outline: none; border-radius: 0; transition: border-color 0.15s;
        }
        .pb-tabs { display: flex; gap: 0.4rem; flex-wrap: wrap; }
        .pb-tab {
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 0.55rem 1rem; border: 1px solid var(--line);
          background: var(--surface); color: var(--slate-60);
          cursor: pointer; transition: all 0.15s; border-radius: 0;
        }
        .pb-tab:hover { border-color: var(--slate-30); color: var(--slate); }
        .pb-tab--active {
          background: var(--brand-red); border-color: var(--brand-red); color: #fff;
        }
        .pb-count {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.1em; color: var(--slate-30);
          margin-left: auto; white-space: nowrap;
        }
        .pb-empty {
          text-align: center; padding: 5rem 0;
          font-family: var(--ff-mono); font-size: 0.78rem;
          letter-spacing: 0.12em; color: var(--slate-30); text-transform: uppercase;
        }

        /* grid — fixed 4 cols, drop to 2 on tablet, 1 on mobile */
        .pb-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: var(--line); border: 1px solid var(--line);
        }
        @media (max-width: 1024px) { .pb-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 680px)  { .pb-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 420px)  { .pb-grid { grid-template-columns: 1fr; } }

        /* outer wrapper — fixed height, lift handled by JS + transition above */
        .pb-card-outer {
          position: relative;
          will-change: transform;
          height: 320px;
        }
        @media (max-width: 1024px) { .pb-card-outer { height: 300px; } }
        @media (max-width: 680px)  { .pb-card-outer { height: 280px; } }

        /* FRONT — fills outer, no transition needed (lift is on outer) */
        .pb-card--front {
          display: flex; flex-direction: column;
          background: var(--surface); text-decoration: none;
          width: 100%; height: 100%; position: relative;
          overflow: hidden;
        }

        /* BACK — clips in from bottom via clip-path wipe */
        .pb-card--back {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          background: transparent;
          align-items: center; justify-content: center;
          padding: 1.5rem 1.25rem; gap: 0;
          overflow: hidden;
          clip-path: inset(100% 0 0 0);
          transition: clip-path 0.44s cubic-bezier(0.16,1,0.3,1);
          pointer-events: none;
        }
        .pb-card-outer:hover .pb-card--back {
          clip-path: inset(0% 0 0 0);
          pointer-events: auto;
        }

        /* full-bleed machine image — over-sized and blurred */
        .pb-back__bg-img {
          position: absolute; inset: -25%;
          width: 150%; height: 150%;
          object-fit: contain;
          filter: blur(20px) saturate(1.5) brightness(1.1);
          pointer-events: none; z-index: 0;
        }

        /* frosted canvas wash over the blur */
        .pb-back__overlay {
          position: absolute; inset: 0;
          background: rgba(248,250,252,0.60);
          z-index: 1;
        }

        /* image box — fixed 180px */
        .pb-card__img-wrap {
          width: 100%; height: 180px;
          flex-shrink: 0;
          background: var(--canvas-bg);
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        @media (max-width: 1024px) { .pb-card__img-wrap { height: 165px; } }
        @media (max-width: 680px)  { .pb-card__img-wrap { height: 155px; } }

        .pb-card__img {
          width: 75%; height: 75%; object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(15,23,42,0.13));
          transition: transform 0.5s cubic-bezier(0.16,1,0.3,1);
          will-change: transform;
        }

        /* SVG electric border — tracks the outer wrapper size */
        .pb-card__border-svg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          pointer-events: none; overflow: visible;
          z-index: 20;
        }

        /* text body — fills remaining space, clips overflow */
        .pb-card__body {
          padding: 0.85rem 1.1rem 1rem;
          display: flex; flex-direction: column;
          flex: 1; overflow: hidden;
          transition: opacity 0.2s ease;
        }
        .pb-card__cat {
          font-family: var(--ff-mono); font-size: 0.55rem;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--brand-red); display: block; margin-bottom: 0.35rem;
          flex-shrink: 0;
        }
        .pb-card__series {
          font-family: var(--ff-display); font-size: 1rem;
          color: var(--slate); line-height: 1.2;
          display: block; margin-bottom: 0.3rem; letter-spacing: 0.01em;
          flex-shrink: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .pb-card__name {
          font-family: var(--ff-body); font-size: 0.76rem;
          color: var(--slate-60); line-height: 1.45;
          flex-shrink: 0;
          display: -webkit-box; -webkit-line-clamp: 2;
          -webkit-box-orient: vertical; overflow: hidden;
        }
        .pb-card__cta {
          font-family: var(--ff-mono); font-size: 0.62rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--brand-red); display: inline-flex;
          align-items: center; gap: 0.4rem; margin-top: 0.85rem;
          flex-shrink: 0;
        }

        /* lift on the outer wrapper — JS writes transform/shadow directly */
        .pb-card-outer {
          transition: transform 0.55s cubic-bezier(0.16,1,0.3,1),
                      box-shadow 0.55s cubic-bezier(0.16,1,0.3,1);
        }

        /* back face buttons container */
        .pb-back__actions {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          gap: 0.75rem; width: 80%; max-width: 200px;
        }

        /* buttons spring in staggered when back wipes in */
        .pb-back__btn {
          opacity: 0;
          transform: translateY(16px) scale(0.92);
          transition: opacity 0.32s cubic-bezier(0.16,1,0.3,1),
                      transform 0.32s cubic-bezier(0.16,1,0.3,1);
        }
        .pb-back__btn:nth-child(1) { transition-delay: 0.12s; }
        .pb-back__btn:nth-child(2) { transition-delay: 0.20s; }
        .pb-card-outer:hover .pb-back__btn {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* reduced motion — skip all motion, keep structure */
        @media (prefers-reduced-motion: reduce) {
          .pb-card-outer, .pb-card--back, .pb-back__btn, .pb-card__img {
            transition: none !important;
            animation: none !important;
          }
          .pb-card-outer:hover { transform: none !important; box-shadow: none !important; }
          .pb-card--back { clip-path: none !important; }
          .pb-card-outer:hover .pb-back__btn { opacity: 1 !important; transform: none !important; }
        }

        /* 3D glass button base */
        .pb-back__btn {
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          width: 100%; padding: 0.85rem 1rem;
          border: none; border-radius: 12px;
          cursor: pointer; text-decoration: none;
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          transform: translateZ(0);
          transition: transform 0.18s cubic-bezier(0.34,1.56,0.64,1),
                      box-shadow 0.18s ease;
        }
        .pb-back__btn:hover {
          transform: translateY(-3px) translateZ(0) scale(1.03);
        }
        .pb-back__btn:active {
          transform: translateY(1px) translateZ(0) scale(0.98);
        }

        /* shine streak — top highlight giving 3D depth */
        .pb-btn3d__shine {
          position: absolute; top: 0; left: 0; right: 0;
          height: 50%; border-radius: 12px 12px 0 0;
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0.45) 0%,
            rgba(255,255,255,0.0) 100%
          );
          pointer-events: none;
        }

        .pb-btn3d__label {
          position: relative; z-index: 1;
        }

        /* Quick View — red glass */
        .pb-back__btn--quick {
          background: linear-gradient(
            160deg,
            rgba(225,29,72,0.85) 0%,
            rgba(190,18,60,0.95) 100%
          );
          color: #fff;
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow:
            0 2px 0 rgba(0,0,0,0.25),
            0 8px 24px rgba(225,29,72,0.35),
            inset 0 1px 0 rgba(255,255,255,0.3);
          backdrop-filter: blur(8px);
        }
        .pb-back__btn--quick:hover {
          box-shadow:
            0 4px 0 rgba(0,0,0,0.2),
            0 16px 36px rgba(225,29,72,0.45),
            inset 0 1px 0 rgba(255,255,255,0.35);
        }

        /* Full Specs — clear glass */
        .pb-back__btn--full {
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.28) 0%,
            rgba(255,255,255,0.10) 100%
          );
          color: var(--slate);
          border: 1px solid rgba(255,255,255,0.55);
          box-shadow:
            0 2px 0 rgba(0,0,0,0.08),
            0 8px 20px rgba(15,23,42,0.10),
            inset 0 1px 0 rgba(255,255,255,0.6);
          backdrop-filter: blur(12px);
        }
        .pb-back__btn--full:hover {
          background: linear-gradient(
            160deg,
            rgba(255,255,255,0.42) 0%,
            rgba(255,255,255,0.18) 100%
          );
          box-shadow:
            0 4px 0 rgba(0,0,0,0.06),
            0 14px 30px rgba(15,23,42,0.12),
            inset 0 1px 0 rgba(255,255,255,0.75);
        }

        /* ── Quick View modal ────────────────────────── */
        .qv-backdrop {
          position: fixed; inset: 0; z-index: 9000;
          background: rgba(10,14,20,0.72);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem;
          animation: qvFadeIn 0.22s ease both;
        }
        @keyframes qvFadeIn { from { opacity: 0; } to { opacity: 1; } }

        .qv-modal {
          position: relative;
          background: var(--surface);
          border: 1px solid var(--line);
          border-top: 3px solid var(--brand-red);
          width: 100%; max-width: 760px;
          display: grid; grid-template-columns: 1fr 1fr;
          overflow: hidden;
          animation: qvSlideUp 0.28s cubic-bezier(0.16,1,0.3,1) both;
          max-height: 90vh; overflow-y: auto;
        }
        @keyframes qvSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 600px) { .qv-modal { grid-template-columns: 1fr; } }

        .qv-close {
          position: absolute; top: 0.85rem; right: 0.85rem; z-index: 10;
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--canvas-bg); border: 1px solid var(--line);
          color: var(--slate-60); display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.15s;
        }
        .qv-close:hover { background: var(--brand-red); color: #fff; border-color: var(--brand-red); }

        .qv-img-wrap {
          background: var(--canvas-bg);
          display: flex; align-items: center; justify-content: center;
          padding: 2.5rem 1.5rem; position: relative; overflow: hidden;
          min-height: 260px;
        }
        .qv-img-accent {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(to right, var(--brand-red), transparent);
        }
        .qv-img {
          width: 85%; height: auto; object-fit: contain;
          filter: drop-shadow(0 16px 40px rgba(15,23,42,0.16));
        }

        .qv-body {
          padding: 2rem 1.75rem 2rem;
          display: flex; flex-direction: column;
          border-left: 1px solid var(--line);
        }
        .qv-cat {
          font-family: var(--ff-mono); font-size: 0.58rem;
          letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--brand-red); display: block; margin-bottom: 0.5rem;
        }
        .qv-series {
          font-family: var(--ff-display); font-size: clamp(1.4rem,3vw,2rem);
          color: var(--slate); line-height: 0.95; letter-spacing: 0.01em;
          margin-bottom: 0.4rem;
        }
        .qv-name {
          font-family: var(--ff-body); font-size: 0.82rem; font-weight: 400;
          color: var(--slate-60); line-height: 1.55; margin-bottom: 0.5rem;
        }
        .qv-tagline {
          font-family: var(--ff-body); font-size: 0.82rem; font-weight: 400;
          color: var(--slate-60); line-height: 1.55;
          border-left: 2px solid var(--brand-red);
          padding-left: 0.75rem; margin-bottom: 1.25rem;
        }

        .qv-specs {
          border-top: 1px solid var(--line); margin-bottom: 1.5rem; flex: 1;
        }
        .qv-spec-row {
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 0.5rem; padding: 0.5rem 0; border-bottom: 1px solid var(--line);
        }
        .qv-spec-label {
          font-family: var(--ff-mono); font-size: 0.58rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: var(--slate-60); flex-shrink: 0;
        }
        .qv-spec-val {
          font-family: var(--ff-display); font-size: 0.9rem;
          color: var(--slate); text-align: right;
        }

        .qv-actions { display: flex; flex-direction: column; gap: 0.5rem; }
        .qv-btn {
          display: block; text-align: center; text-decoration: none;
          font-family: var(--ff-mono); font-size: 0.68rem;
          letter-spacing: 0.1em; text-transform: uppercase;
          padding: 0.7rem 1rem; transition: all 0.18s; cursor: pointer;
        }
        .qv-btn--full {
          background: var(--brand-red); color: #fff;
        }
        .qv-btn--full:hover { background: #be123c; }
        .qv-btn--inquiry {
          background: transparent; color: var(--slate);
          border: 1px solid var(--line);
        }
        .qv-btn--inquiry:hover { border-color: var(--slate); background: var(--canvas-bg); }
      `}</style>
    </section>
  );
}
