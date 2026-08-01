"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image, { type StaticImageData } from "next/image";

interface Props {
  src: string | StaticImageData;
  alt: string;
  badge?: string;
  photoKey: number | string;
  priority?: boolean;
  /** "hero" = full showcase (grid, ring, pedestal, badge). "card" = a
   * leaner tilt+glow treatment sized for a grid tile, no ring/pedestal. */
  variant?: "hero" | "card";
  sizes?: string;
  /** Skip next/image's default scroll-gated lazy loading — fetch immediately
   * regardless of viewport position. For grids where every tile should be
   * ready the instant the page loads, not popcorn in as you scroll. */
  eager?: boolean;
  /** Strip every backing surface (grid, ring, pedestal, corner brackets) —
   * just the photo itself with its tilt/glow/sheen interaction, floating
   * on whatever the page background already is. */
  bare?: boolean;
  /** Fill the parent edge-to-edge (no own aspect-ratio — the parent owns
   * it) instead of the default contained box. The photo itself still uses
   * object-fit: contain so the full machine stays visible rather than
   * being cropped to whatever aspect ratio the parent frame happens to be. */
  cover?: boolean;
}

/**
 * Interactive product stage — mouse-tracked 3D tilt, a light that follows
 * the cursor, and a pedestal glow underneath, so the machine photo reads
 * as an object sitting in space rather than a flat image in a card.
 * Pointer-driven only; falls back to a static resting tilt on touch
 * devices and under reduced-motion.
 */
export default function ProductStage3D({ src, alt, badge, photoKey, priority, variant = "hero", sizes, eager, bare, cover }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const target = useRef({ rx: 0, ry: 0, mx: 50, my: 50 });
  const current = useRef({ rx: 0, ry: 0, mx: 50, my: 50 });
  const [interactive, setInteractive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // reset the loading skeleton whenever the photo itself changes (gallery
  // thumb switch, hero rotation) — otherwise a cached-but-different image
  // would flash the old photo under the new key for one frame.
  useEffect(() => { setLoaded(false); }, [photoKey]);

  useEffect(() => {
    if (bare) { setInteractive(false); return; }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setInteractive(!reduced && !coarse);
  }, [bare]);

  const applyStyle = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;
    const c = current.current;
    const t = target.current;
    c.rx += (t.rx - c.rx) * 0.12;
    c.ry += (t.ry - c.ry) * 0.12;
    c.mx += (t.mx - c.mx) * 0.12;
    c.my += (t.my - c.my) * 0.12;
    el.style.setProperty("--tilt-x", `${c.rx.toFixed(2)}deg`);
    el.style.setProperty("--tilt-y", `${c.ry.toFixed(2)}deg`);
    el.style.setProperty("--glow-x", `${c.mx.toFixed(1)}%`);
    el.style.setProperty("--glow-y", `${c.my.toFixed(1)}%`);
    const settled =
      Math.abs(t.rx - c.rx) < 0.01 && Math.abs(t.ry - c.ry) < 0.01 &&
      Math.abs(t.mx - c.mx) < 0.05 && Math.abs(t.my - c.my) < 0.05;
    if (!settled) rafRef.current = requestAnimationFrame(applyStyle);
  }, []);

  const tiltRange = variant === "card" ? { x: 7, y: 9 } : { x: 14, y: 18 };

  const onMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    target.current = {
      rx: (0.5 - py) * tiltRange.x,
      ry: (px - 0.5) * tiltRange.y,
      mx: px * 100,
      my: py * 100,
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyStyle);
  }, [interactive, applyStyle, tiltRange.x, tiltRange.y]);

  const onLeave = useCallback(() => {
    target.current = { rx: 0, ry: 0, mx: 50, my: 50 };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyStyle);
  }, [applyStyle]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const isCard = variant === "card";

  return (
    <div
      ref={frameRef}
      className={`pstage${isCard ? " pstage--card" : ""}${interactive ? " pstage--interactive" : ""}${cover ? " pstage--cover" : ""}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {!bare && <div className="pstage__grid" aria-hidden="true" />}
      {!bare && <div className="pstage__glow" aria-hidden="true" />}
      {!isCard && !bare && <div className="pstage__ring" aria-hidden="true" />}
      {!bare && <div className="pstage__pedestal" aria-hidden="true" />}

      <div className="pstage__tilt">
        <div className={`pstage__img${loaded ? "" : " pstage__img--loading"}`}>
          <Image
            src={src}
            alt={alt}
            key={photoKey}
            fill
            priority={priority}
            loading={priority ? undefined : eager ? "eager" : "lazy"}
            sizes={sizes ?? "(max-width: 900px) 90vw, 56vw"}
            style={cover ? { objectFit: "contain" } : undefined}
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
        </div>
        {!bare && <div className="pstage__sheen" aria-hidden="true" />}
      </div>

      {badge && <span className="pstage__badge">{badge}</span>}
      {!isCard && !bare && (
        <>
          <div className="pstage__corner pstage__corner--tl" aria-hidden="true" />
          <div className="pstage__corner pstage__corner--br" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
