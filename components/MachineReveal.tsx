"use client";

import { useEffect, useRef, useCallback } from "react";

interface MachineRevealProps {
  imageAlign: "left" | "right";
  eyebrow: string;
  heading: React.ReactNode;
  body: string;
  cta: React.ReactNode;
  image: React.ReactNode;
  bg?: string;
}

export default function MachineReveal({
  imageAlign,
  eyebrow,
  heading,
  body,
  cta,
  image,
  bg,
}: MachineRevealProps) {
  const sectionRef  = useRef<HTMLElement>(null);
  const panelRef    = useRef<HTMLDivElement>(null);
  const imageBoxRef = useRef<HTMLDivElement>(null);
  const eyebrowRef  = useRef<HTMLSpanElement>(null);
  const headRef     = useRef<HTMLDivElement>(null);
  const bodyRef     = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  /* ── magnifier refs ── */
  const lensRef     = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number>(0);
  const mouseRef    = useRef({ x: 0, y: 0 });
  const lensPos     = useRef({ x: 0, y: 0 }); // smoothed position

  /* ─────────────────────────────────────────────────────────────────
     MAGNIFIER  — custom circular lens that zooms the section under
     the cursor.  We use CSS `transform: scale` + `clip-path` trick:
     the lens is a fixed circle that mirrors the section's background
     at 2× zoom using `background-image: element()` isn't cross-browser,
     so instead we use an inner div that is a scaled copy of the section
     positioned so the mouse point maps to the lens centre.
  ───────────────────────────────────────────────────────────────── */
  const mirrorRef   = useRef<HTMLDivElement>(null); // scaled clone inside lens

  const LENS_R   = 110;  // lens radius px
  const ZOOM     = 2.2;  // magnification factor
  const SMOOTH   = 0.12; // lerp factor (lower = smoother)

  const moveLens = useCallback(() => {
    const lens   = lensRef.current;
    const mirror = mirrorRef.current;
    const section = sectionRef.current;
    if (!lens || !mirror || !section) return;

    // lerp toward real mouse position
    lensPos.current.x += (mouseRef.current.x - lensPos.current.x) * SMOOTH;
    lensPos.current.y += (mouseRef.current.y - lensPos.current.y) * SMOOTH;

    const lx = lensPos.current.x;
    const ly = lensPos.current.y;

    // position the lens circle (centred on cursor)
    lens.style.transform = `translate(${lx - LENS_R}px, ${ly - LENS_R}px)`;

    // offset the mirror so the cursor point maps to lens centre
    // mirror is ZOOM× size of section, offset so cursor = centre of lens
    const rect = section.getBoundingClientRect();
    // cursor position relative to section
    const relX = lx - rect.left;
    const relY = ly - rect.top;
    // mirror offset: we want  relX * ZOOM - LENS_R  pixels of mirror to
    // align with the left edge of the lens
    const ox = -(relX * ZOOM - LENS_R);
    const oy = -(relY * ZOOM - LENS_R);
    mirror.style.transform = `scale(${ZOOM}) translate(${ox / ZOOM}px, ${oy / ZOOM}px)`;

    rafRef.current = requestAnimationFrame(moveLens);
  }, []);

  /* ── GSAP scroll animation ── */
  useEffect(() => {
    let ctx: { revert?: () => void } = {};

    (async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const panel   = panelRef.current;
      if (!section || !panel) return;

      ctx = gsap.context(() => {
        const imgBox    = imageBoxRef.current;
        const eyebrowEl = eyebrowRef.current;
        const headEl    = headRef.current;
        const bodyEl    = bodyRef.current;
        const ctaEl     = ctaRef.current;

        const tl = gsap.timeline({ defaults: { ease: "none" } });

        /* PHASE 1 — slides UP from below */
        tl.fromTo(
          panel,
          { y: "100vh", rotateX: 8, transformPerspective: 1400, opacity: 0 },
          { y: "20vh",  rotateX: 4, opacity: 1, ease: "power2.out" },
          0
        );

        /* PHASE 2 — rubber-band bounce */
        tl.to(panel, { y: "-4vh", rotateX: 2, ease: "power1.out" },    0.25);
        tl.to(panel, { y: "6vh",  rotateX: 3, ease: "power1.inOut" },  0.34);
        tl.to(panel, { y: "0vh",  rotateX: 0, ease: "power3.out" },    0.40);

        /* PHASE 3 — 3-D steel plate slam */
        tl.to(panel, {
          rotateX: 18, scaleY: 0.92,
          transformPerspective: 1400, transformOrigin: "50% 0%",
          ease: "power2.in",
        }, 0.42);
        tl.to(panel, {
          rotateX: 0, scaleY: 1,
          transformOrigin: "50% 100%", ease: "expo.out",
        }, 0.55);

        /* PHASE 4 — machine image drops from above */
        if (imgBox) {
          gsap.set(imgBox, { y: -80, opacity: 0, rotateX: -22, transformPerspective: 900 });
          tl.to(imgBox, {
            y: 0, opacity: 1, rotateX: 0, transformPerspective: 900,
            ease: "expo.out", duration: 0.24,
          }, 0.58);
        }

        /* PHASE 5 — text cascade */
        const D = 0.68;

        if (eyebrowEl) {
          gsap.set(eyebrowEl, { x: imageAlign === "right" ? -40 : 40, opacity: 0 });
          tl.to(eyebrowEl, { x: 0, opacity: 1, ease: "power3.out" }, D);
        }

        if (headEl) {
          const lines = Array.from(headEl.querySelectorAll<HTMLElement>(".rev-line"));
          lines.forEach((line, i) => {
            const block = document.createElement("div");
            block.className = "rev-block";
            line.style.position = "relative";
            line.style.overflow = "hidden";
            line.appendChild(block);
            const inner = line.querySelector<HTMLElement>(".rev-text");
            gsap.set(inner, { opacity: 0 });
            gsap.set(block, { scaleX: 0, transformOrigin: "left center" });
            const off = D + 0.04 + i * 0.07;
            tl.to(block,  { scaleX: 1, ease: "power2.in",  duration: 0.08 }, off);
            tl.set(inner, { opacity: 1 },                                      off + 0.055);
            tl.to(block,  { scaleX: 0, transformOrigin: "right center", ease: "power2.out", duration: 0.08 }, off + 0.07);
          });
        }

        if (bodyEl) {
          gsap.set(bodyEl, { y: 30, opacity: 0 });
          tl.to(bodyEl, { y: 0, opacity: 1, ease: "power3.out" }, D + 0.20);
        }
        if (ctaEl) {
          gsap.set(ctaEl, { y: 20, opacity: 0 });
          tl.to(ctaEl, { y: 0, opacity: 1, ease: "power3.out" }, D + 0.28);
        }

        ScrollTrigger.create({
          trigger: section,
          start: "top bottom",
          end:   "+=120%",
          scrub: 0.9,
          animation: tl,
          pin: false,
        });
      }, section);
    })();

    return () => { ctx.revert?.(); };
  }, [imageAlign]);

  /* ── magnifier mouse events ── */
  useEffect(() => {
    const section = sectionRef.current;
    const lens    = lensRef.current;
    if (!section || !lens) return;

    const onEnter = () => {
      lens.style.opacity = "1";
      lens.style.pointerEvents = "none";
      section.style.cursor = "none";
      rafRef.current = requestAnimationFrame(moveLens);
    };
    const onLeave = () => {
      lens.style.opacity = "0";
      section.style.cursor = "";
      cancelAnimationFrame(rafRef.current);
    };
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    section.addEventListener("mouseenter", onEnter);
    section.addEventListener("mouseleave", onLeave);
    section.addEventListener("mousemove",  onMove);

    return () => {
      section.removeEventListener("mouseenter", onEnter);
      section.removeEventListener("mouseleave", onLeave);
      section.removeEventListener("mousemove",  onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, [moveLens]);

  const textOrder = imageAlign === "right" ? 1 : 2;
  const imgOrder  = imageAlign === "right" ? 2 : 1;

  return (
    <section
      ref={sectionRef}
      className="spec-grid-section machine-reveal-section"
      style={{ background: bg, overflow: "hidden", position: "relative" }}
    >
      {/* ── 3-D PLATE ── */}
      <div ref={panelRef} className="mr-panel">
        <div className="wrap">

          {/* TEXT */}
          <div className="text-side" style={{ order: textOrder }}>
            <span ref={eyebrowRef} className="eyebrow">{eyebrow}</span>
            <div ref={headRef} style={{ marginTop: "1rem" }}>
              <h2 className="mr-heading">
                {Array.isArray(heading)
                  ? (heading as React.ReactNode[]).map((line, i) => (
                      <span key={i} className="rev-line">
                        <span className="rev-text">{line}</span>
                      </span>
                    ))
                  : (
                    <span className="rev-line">
                      <span className="rev-text">{heading}</span>
                    </span>
                  )}
              </h2>
            </div>
            <p ref={bodyRef}>{body}</p>
            <div ref={ctaRef} className="cta-row">{cta}</div>
          </div>

          {/* IMAGE */}
          <div ref={imageBoxRef} className="callout-machine" style={{ order: imgOrder }}>
            {image}
          </div>

        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAGNIFIER LENS
          Fixed circle that follows cursor. The inner .mr-lens__mirror
          is a positioned copy of the section content scaled at ZOOM×,
          offset so the cursor point lands at the lens centre.
          clip-path on the outer circle creates the round lens shape.
      ══════════════════════════════════════════════════════════════ */}
      <div ref={lensRef} className="mr-lens" aria-hidden>
        {/* ring + crosshair chrome */}
        <div className="mr-lens__ring" />
        <div className="mr-lens__cross mr-lens__cross--h" />
        <div className="mr-lens__cross mr-lens__cross--v" />
        <span className="mr-lens__label">ZOOM</span>

        {/* the scaled mirror of the section */}
        <div ref={mirrorRef} className="mr-lens__mirror">
          <div className="mr-panel" style={{ pointerEvents: "none" }}>
            <div className="wrap">
              <div className="text-side" style={{ order: textOrder }}>
                <span className="eyebrow">{eyebrow}</span>
                <div style={{ marginTop: "1rem" }}>
                  <h2 className="mr-heading">
                    {Array.isArray(heading)
                      ? (heading as React.ReactNode[]).map((line, i) => (
                          <span key={i} className="rev-line">
                            <span className="rev-text" style={{ opacity: 1 }}>{line}</span>
                          </span>
                        ))
                      : (
                        <span className="rev-line">
                          <span className="rev-text" style={{ opacity: 1 }}>{heading}</span>
                        </span>
                      )}
                  </h2>
                </div>
                <p>{body}</p>
                <div className="cta-row">{cta}</div>
              </div>
              <div className="callout-machine" style={{ order: imgOrder }}>
                {image}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
