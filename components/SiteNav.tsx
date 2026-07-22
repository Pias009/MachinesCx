"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import TransitionLink from "@/components/TransitionLink";
import ThemeToggle from "@/components/ThemeToggle";
import { categories, familiesByCategory } from "@/lib/products";

// Static logo — no cycling, brand name is stable and trustworthy for B2B
const LOGO_WORDS = ["ASHAL INNOMACH"];

const FLEXO_IMGS: Record<string, string> = {
  "flexo-2c": "/machines/flexo-1.png",
  "flexo-4c": "/machines/flexo-2.png",
  "flexo-6c": "/machines/flexo-4.png",
  "flexo-8c": "/machines/flexo-3.png",
};
function machineImg(slug: string) {
  return FLEXO_IMGS[slug] ?? `/machines/${slug}.png`;
}

export default function SiteNav() {
  const pathname = usePathname();
  const [scrolled,   setScrolled]   = useState(false);
  const [open,       setOpen]       = useState<string | null>(null);
  const [menuImg,    setMenuImg]    = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ddListRef                   = useRef<HTMLDivElement | null>(null);
  const [canScrollUp,   setCanScrollUp]   = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const openMenu = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    const fams = familiesByCategory(slug as Parameters<typeof familiesByCategory>[0]);
    if (open !== slug) setMenuImg(fams[0]?.slug ?? "");
    setOpen(slug);
  };
  const closeMenu = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 150);
  };
  const keepMenu = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const updateScrollState = () => {
    const el = ddListRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  };

  const scrollDdList = (dir: 1 | -1) => {
    const el = ddListRef.current;
    if (!el) return;
    el.scrollBy({ top: dir * el.clientHeight * 0.8, behavior: "smooth" });
  };

  useEffect(() => {
    if (!open) return;
    // wait a tick for the dropdown to mount before measuring
    const raf = requestAnimationFrame(updateScrollState);
    return () => cancelAnimationFrame(raf);
  }, [open]);

  const activeFamilies = open
    ? familiesByCategory(open as Parameters<typeof familiesByCategory>[0])
    : [];

  if (pathname?.startsWith("/cx-ops-x7k9q2")) return null;

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── Base bar ── */
        .sn {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 72px; width: 100%; overflow: hidden;
          background: rgba(15,23,42,0.72);
          backdrop-filter: blur(20px) saturate(1.6);
          border-bottom: 1px solid rgba(255,255,255,0.07);
          transition: background 0.35s, border-color 0.35s, box-shadow 0.35s;
        }
        /* scrolled — slightly more opaque */
        .sn--on {
          background: rgba(10,14,26,0.92);
          border-color: rgba(255,255,255,0.1);
          box-shadow: 0 4px 32px rgba(0,0,0,0.35);
        }
        /* Red top accent line */
        .sn::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: var(--brand-red);
        }

        .sn__inner {
          height: 72px; width: 100%; max-width: 1280px; margin-inline: auto;
          padding: 0 clamp(1rem, 4vw, 2.5rem);
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }

        /* ── Logo ── */
        .sn__logo {
          font-family: var(--ff-display);
          font-size: 1.55rem; letter-spacing: 0.05em;
          color: #fff; text-decoration: none;
          display: flex; align-items: center; gap: .65rem;
          flex: 0 0 auto;
          height: 44px;
          position: relative;
          min-width: max-content;
          perspective: 400px;
        }
        .sn__logo-img {
          height: 40px; width: auto; display: block;
          border-radius: 6px; object-fit: contain;
          flex-shrink: 0;
        }
        .sn__logo-text {
          position: relative;
          height: 32px; overflow: hidden;
          display: flex; align-items: center;
        }
        .sn__logo-word {
          display: inline-flex; white-space: nowrap;
          transform-origin: 50% 0%;
          will-change: transform, opacity, filter;
        }
        .sn__logo-word em { color: var(--brand-red); font-style: normal; margin-right: 0.28em; }

        .sn__logo-word--hold { transform: translateY(0); opacity: 1; }

        @media(max-width:480px){
          .sn__logo-text { display: none; }
        }

        /* ── Nav links — centered with equal space on both sides ── */
        .sn__links {
          display: flex; align-items: center;
          flex: 0 1 auto; min-width: 0; margin: 0 auto; gap: 0;
        }
        /* ── Right actions ── */
        .sn__actions {
          display: flex; align-items: center; gap: 0.9rem;
          flex: 0 0 auto; justify-content: flex-end;
        }

        /* category dropdown trigger */
        .sn__cat { position: relative; height: 72px; display: flex; align-items: center; }
        .sn__cat-btn {
          height: 72px; display: flex; align-items: center; gap: 0.3rem;
          padding: 0 1.1rem;
          font-family: var(--ff-display); font-size: 0.9rem;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.82); background: none; border: none;
          cursor: pointer; white-space: nowrap; text-decoration: none;
          transition: color 0.18s;
          position: relative;
        }
        .sn__cat-btn:hover { color: #fff; }
        .sn__cat--open .sn__cat-btn { color: #fff; }
        .sn__cat-btn svg { width: 8px; height: 8px; flex-shrink: 0; transition: transform 0.2s ease; opacity: 0.7; }
        .sn__cat--open .sn__cat-btn svg { transform: rotate(180deg); opacity: 1; }

        /* active underline */
        .sn__cat-bar {
          position: absolute; bottom: 0; left: 1.1rem; right: 1.1rem;
          height: 2px; background: var(--brand-teal);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.22s ease;
        }
        .sn__cat--open .sn__cat-bar { transform: scaleX(1); }

        /* plain links */
        .sn__link {
          height: 72px; display: flex; align-items: center;
          padding: 0 1.1rem;
          font-family: var(--ff-display); font-size: 0.9rem;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: rgba(255,255,255,0.82); text-decoration: none;
          transition: color 0.18s; white-space: nowrap;
        }
        .sn__link:hover { color: #fff; }

        /* Divider dot */
        .sn__divider {
          width: 3px; height: 3px; border-radius: 50%;
          background: rgba(255,255,255,0.3);
          flex-shrink: 0; margin: 0 0.4rem;
        }

        /* ── CTA button ── */
        .sn__cta {
          margin-left: auto; flex-shrink: 0;
          font-family: var(--ff-display); font-size: 0.95rem;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #080e0d; text-decoration: none;
          background: var(--brand-teal);
          padding: 0.65rem 1.6rem;
          border: 1px solid var(--brand-teal);
          font-weight: 700;
          white-space: nowrap;
        }
        .sn__cta:hover {
          background: #3dd6ca;
        }

        /* ── Dropdown ── */
        .sn__dd {
          position: fixed; top: 72px;
          left: 50%; transform: translateX(-50%);
          width: clamp(300px, 54vw, 760px);
          background: rgba(10,14,26,0.97);
          border: 1px solid rgba(255,255,255,0.1);
          border-top: 2px solid var(--brand-red);
          backdrop-filter: blur(24px);
          box-shadow: 0 24px 64px rgba(0,0,0,0.5);
          display: flex; z-index: 300;
          animation: snDdIn 0.22s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes snDdIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .sn__backdrop {
          position: fixed; inset: 0; top: 72px; z-index: 199;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(2px);
          animation: snBdIn 0.25s ease both;
          pointer-events: none;
        }
        @keyframes snBdIn { from { opacity: 0; } to { opacity: 1; } }

        /* Dropdown list */
        .sn__dd-list-wrap { flex: 1; position: relative; min-width: 0; }
        .sn__dd-list {
          padding: 0.6rem 0;
          max-height: 65vh; overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(43,191,179,0.5) transparent;
        }
        .sn__dd-list::-webkit-scrollbar { width: 6px; }
        .sn__dd-list::-webkit-scrollbar-track { background: transparent; }
        .sn__dd-list::-webkit-scrollbar-thumb {
          background: rgba(43,191,179,0.5);
          border-radius: 3px;
        }
        .sn__dd-list::-webkit-scrollbar-thumb:hover { background: rgba(43,191,179,0.8); }

        /* Floating scroll buttons */
        .sn__dd-scrollbtn {
          position: absolute; left: 50%; transform: translateX(-50%);
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(15,23,42,0.92);
          border: 1px solid rgba(43,191,179,0.4);
          color: var(--brand-teal); cursor: pointer;
          z-index: 320;
          box-shadow: 0 6px 18px rgba(0,0,0,0.5);
          opacity: 0; pointer-events: none;
          transition: opacity 0.18s ease, background 0.18s ease, transform 0.18s ease;
        }
        .sn__dd-scrollbtn--visible { opacity: 1; pointer-events: auto; }
        .sn__dd-scrollbtn:hover {
          background: rgba(43,191,179,0.18);
          transform: translateX(-50%) scale(1.08);
        }
        .sn__dd-scrollbtn svg { width: 12px; height: 12px; }
        .sn__dd-scrollbtn--up   { top: 6px; }
        .sn__dd-scrollbtn--down { bottom: 6px; }

        .sn__dd-item {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.7rem 1.5rem; text-decoration: none;
          border-left: 2px solid transparent;
          transition: background 0.14s, border-color 0.14s;
        }
        .sn__dd-item:hover, .sn__dd-item--on {
          background: rgba(255,255,255,0.05);
          border-left-color: var(--brand-red);
        }
        .sn__dd-thumb {
          width: 52px; height: 38px; object-fit: contain; flex-shrink: 0;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
          transition: transform 0.18s ease;
        }
        .sn__dd-item:hover .sn__dd-thumb { transform: scale(1.1); }
        .sn__dd-series {
          display: block; font-family: var(--ff-display);
          font-size: 1rem; color: #fff; line-height: 1.2;
          letter-spacing: 0.02em;
        }
        .sn__dd-tag {
          display: block; font-family: var(--ff-body); font-size: 0.72rem;
          color: rgba(255,255,255,0.7); margin-top: 0.2rem; line-height: 1.4;
        }

        /* Dropdown preview panel */
        .sn__dd-preview {
          width: 200px; flex-shrink: 0;
          border-left: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          padding: 1.5rem 1.25rem; position: relative; overflow: hidden;
          background: rgba(255,255,255,0.02);
        }
        .sn__dd-preview-img {
          width: 100%; height: auto; object-fit: contain;
          filter: drop-shadow(0 8px 24px rgba(0,0,0,0.6));
          transition: opacity 0.18s ease;
        }
        .sn__dd-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 50% 90%, rgba(43,191,179,0.12) 0%, transparent 65%);
        }

        @media (max-width: 900px) {
          .sn__link--hide { display: none; }
          .sn__divider    { display: none; }
        }
        @media (max-width: 768px) {
          .sn__dd { width: 96vw; }
          .sn__dd-preview { display: none; }
        }

        /* ── Hamburger button ── */
        .sn__burger {
          display: none;
          flex-direction: column; justify-content: center; align-items: center;
          gap: 5px; width: 40px; height: 40px;
          background: none; border: none; cursor: pointer;
          margin-left: auto; padding: 0; flex-shrink: 0;
        }
        .sn__burger span {
          display: block; width: 22px; height: 1.5px;
          background: #fff; transition: transform .22s ease, opacity .22s ease;
        }
        .sn__burger--open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .sn__burger--open span:nth-child(2) { opacity: 0; }
        .sn__burger--open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── Mobile drawer — full-height left slide ── */
        .sn__mobile {
          display: flex;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          width: min(82vw, 320px);
          background: #080e0d;
          border-right: 1px solid rgba(43,191,179,0.18);
          z-index: 9100;
          flex-direction: column;
          padding: 0;
          gap: 0;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
          -ms-overflow-style: none;
          transform: translateX(-100%);
          visibility: hidden;
          pointer-events: none;
          transition: transform 0.32s cubic-bezier(0.16,1,0.3,1),
                      visibility 0s linear 0.32s;
          box-shadow: 8px 0 40px rgba(0,0,0,0.8);
        }
        .sn__mobile::-webkit-scrollbar { display: none; width: 0; height: 0; }
        .sn__mobile--open {
          transform: translateX(0);
          visibility: visible;
          pointer-events: auto;
          transition: transform 0.32s cubic-bezier(0.16,1,0.3,1),
                      visibility 0s linear 0s;
        }

        /* drawer header — logo + close */
        .sn__mob-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.1rem 1.25rem;
          border-bottom: 1px solid rgba(43,191,179,0.12);
          flex-shrink: 0;
          background: rgba(43,191,179,0.04);
        }
        .sn__mob-logo {
          font-family: var(--ff-display); font-size: 1.2rem;
          letter-spacing: .05em; color: #fff; text-decoration: none;
        }
        .sn__mob-logo em { color: var(--brand-teal); font-style: normal; margin-right: .2em; }
        .sn__mob-close {
          width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.7); cursor: pointer;
          transition: background .15s, color .15s;
          flex-shrink: 0;
        }
        .sn__mob-close:hover { background: rgba(43,191,179,.12); color: var(--brand-teal); }

        /* nav links */
        .sn__mob-links { flex: 1; display: flex; flex-direction: column; padding: .5rem 0; }

        /* backdrop */
        .sn__mob-bd {
          display: none;
          position: fixed; inset: 0; z-index: 9099;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }
        .sn__mob-bd--open { display: block; }

        .sn__mobile-link {
          font-family: var(--ff-display); font-size: 1.1rem;
          letter-spacing: .04em; text-transform: uppercase;
          color: rgba(255,255,255,0.72); text-decoration: none;
          padding: .9rem 1.5rem;
          border-bottom: 1px solid rgba(255,255,255,.04);
          display: flex; align-items: center; justify-content: space-between;
          position: relative; overflow: hidden;
          transition: color .18s, background .18s;
        }
        .sn__mobile-link::after {
          content: "→";
          font-size: 0.85rem;
          color: var(--brand-teal);
          opacity: 0;
          transform: translateX(-8px);
          transition: opacity .18s, transform .18s;
        }
        .sn__mobile-link:hover {
          color: #fff;
          background: rgba(43,191,179,0.06);
        }
        .sn__mobile-link:hover::after {
          opacity: 1;
          transform: translateX(0);
        }
        .sn__mobile-cta {
          display: flex; align-items: center; justify-content: center;
          width: 100%;
          font-family: var(--ff-display); font-size: 1rem;
          letter-spacing: .06em; text-transform: uppercase;
          background: var(--brand-teal); color: #080e0d;
          font-weight: 700; padding: .9rem 1.5rem;
          text-decoration: none; border: 1px solid var(--brand-teal);
          transition: background .18s;
        }
        .sn__mobile-cta:hover { background: #3dd6ca; }

        @media (max-width: 768px) {
          .sn__links  { display: none; }
          .sn__cta    { display: none; }
          .sn__burger { display: flex; }
        }
      `}</style>

      <nav className={`sn${scrolled ? " sn--on" : ""}`}>
        <div className="sn__inner">

          <TransitionLink href="/" className="sn__logo" aria-label="Ashal Innomach — home">
            <img src="/logo.jpeg" alt="Ashal Innomach" className="sn__logo-img" />
            <span className="sn__logo-text">
              <span className="sn__logo-word sn__logo-word--hold">
                <em>ASHAL</em>{" INNOMACH"}
              </span>
            </span>
          </TransitionLink>

          <div className="sn__links">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className={`sn__cat${open === cat.slug ? " sn__cat--open" : ""}`}
                onMouseEnter={() => openMenu(cat.slug)}
                onMouseLeave={closeMenu}
              >
                <TransitionLink href={`/products/${cat.slug}`} className="sn__cat-btn">
                  {cat.name.replace(" Machines", "").replace(" & Lab Lines", "")}
                  <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1l4 4 4-4" />
                  </svg>
                </TransitionLink>
                <div className="sn__cat-bar" />
              </div>
            ))}

            <span className="sn__divider" />

            <TransitionLink href="/products" className="sn__link sn__link--hide">All Products</TransitionLink>
            <TransitionLink href="/news"     className="sn__link sn__link--hide">News</TransitionLink>
            <TransitionLink href="/about"    className="sn__link sn__link--hide">About</TransitionLink>
          </div>

          <div className="sn__actions">
            <ThemeToggle />
            <TransitionLink href="/inquiries" className="sn__cta">Get a Quote</TransitionLink>

            {/* Hamburger — mobile only */}
            <button
              className={`sn__burger${mobileOpen ? " sn__burger--open" : ""}`}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(v => !v)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

      </nav>

      {/* Mobile backdrop + drawer live OUTSIDE .sn so overflow/backdrop-filter
          on the bar can't clip the full-height fixed drawer */}
      <div
        className={`sn__mob-bd${mobileOpen ? " sn__mob-bd--open" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile drawer — full height, slides from left */}
      <div className={`sn__mobile${mobileOpen ? " sn__mobile--open" : ""}`}>

        {/* Header: logo + close */}
        <div className="sn__mob-header">
          <TransitionLink href="/" className="sn__mob-logo" onClick={() => setMobileOpen(false)}>
            <em>ASHAL</em>{" INNOMACH"}
          </TransitionLink>
          <button className="sn__mob-close" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="sn__mob-links">
          {categories.map(cat => (
            <TransitionLink key={cat.slug} href={`/products/${cat.slug}`} className="sn__mobile-link" onClick={() => setMobileOpen(false)}>
              {cat.name}
            </TransitionLink>
          ))}
          <TransitionLink href="/products" className="sn__mobile-link" onClick={() => setMobileOpen(false)}>All Products</TransitionLink>
          <TransitionLink href="/news"     className="sn__mobile-link" onClick={() => setMobileOpen(false)}>News</TransitionLink>
          <TransitionLink href="/about"    className="sn__mobile-link" onClick={() => setMobileOpen(false)}>About</TransitionLink>
          <TransitionLink href="/inquiries"  className="sn__mobile-link" onClick={() => setMobileOpen(false)}>Contact</TransitionLink>
        </div>

        {/* CTA pinned to bottom */}
        <div style={{ padding:"1.25rem", borderTop:"1px solid rgba(43,191,179,0.12)", flexShrink:0 }}>
          <TransitionLink href="/inquiries" className="sn__mobile-cta" onClick={() => setMobileOpen(false)}>
            Get a Quote
          </TransitionLink>
        </div>
      </div>

      {/* backdrop + dropdown live OUTSIDE .sn so the nav's overflow:hidden /
          backdrop-filter can't clip the fixed layer below the 72px bar */}
      {open && <div className="sn__backdrop" onMouseEnter={closeMenu} />}

      {open && (
        <div className="sn__dd" onMouseEnter={keepMenu} onMouseLeave={closeMenu}>
          <div className="sn__dd-list-wrap">
            <div className="sn__dd-list" ref={ddListRef} onScroll={updateScrollState}>
              {activeFamilies.map((fam) => (
                <TransitionLink
                  key={fam.slug}
                  href={`/products/${open}/${fam.slug}`}
                  className={`sn__dd-item${menuImg === fam.slug ? " sn__dd-item--on" : ""}`}
                  onMouseEnter={() => setMenuImg(fam.slug)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={machineImg(fam.slug)} alt="" className="sn__dd-thumb" />
                  <div>
                    <span className="sn__dd-series">{fam.series}</span>
                    <span className="sn__dd-tag">{fam.tagline}</span>
                  </div>
                </TransitionLink>
              ))}
            </div>
            <button
              type="button"
              aria-label="Scroll up"
              className={`sn__dd-scrollbtn sn__dd-scrollbtn--up${canScrollUp ? " sn__dd-scrollbtn--visible" : ""}`}
              onClick={() => scrollDdList(-1)}
              tabIndex={canScrollUp ? 0 : -1}
            >
              <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 5l4-4 4 4" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Scroll down"
              className={`sn__dd-scrollbtn sn__dd-scrollbtn--down${canScrollDown ? " sn__dd-scrollbtn--visible" : ""}`}
              onClick={() => scrollDdList(1)}
              tabIndex={canScrollDown ? 0 : -1}
            >
              <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>
          </div>
          <div className="sn__dd-preview">
            <div className="sn__dd-glow" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={menuImg} src={machineImg(menuImg)} alt="" className="sn__dd-preview-img" />
          </div>
        </div>
      )}
    </>
  );
}
