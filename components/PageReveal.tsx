"use client";

import { useEffect } from "react";

// Each section below the hero gets a scrubbed ScrollTrigger timeline so
// the whole section — background, machine, text — enters as one 3D slab.
// Text-only nodes stay on 2D transforms (no rotateY/X) to avoid font blur.

export default function PageReveal() {
  useEffect(() => {
    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      // ── shared ScrollTrigger factory ─────────────────────────────────────
      // "top 92%" → "top 18%" gives a comfortable scrub window so the
      // section is fully settled before its top reaches the nav bar.
      const slabST = (el: Element, extra?: object) => ({
        trigger: el,
        start: "top 92%",
        end:   "top 18%",
        scrub: 1,
        ...extra,
      });

      // ════════════════════════════════════════════════════════════════════
      // SECTION 1 — FILM BLOWING
      // Whole section pivots in from the right (right edge of page swings
      // toward the viewer), machine swings in behind it, text fades in.
      // ════════════════════════════════════════════════════════════════════
      // :not([data-section]) excludes the pipeline section which also uses
      // the same class so we get only the two content spec-grid sections.
      const specSections = Array.from(
        document.querySelectorAll<HTMLElement>(".spec-grid-section:not([data-section])")
      );
      const filmSection = specSections[0] ?? null;
      if (filmSection) {
        const machine = filmSection.querySelector<HTMLElement>("[data-reveal='image']");
        const heading = filmSection.querySelector<HTMLElement>("[data-reveal='heading']");
        const eyebrow = filmSection.querySelector<HTMLElement>("[data-reveal='eyebrow']");
        const body    = filmSection.querySelector<HTMLElement>(".text-side p");
        const cta     = filmSection.querySelector<HTMLElement>(".cta-row");

        const tl = gsap.timeline({ scrollTrigger: slabST(filmSection) });

        // Full section slab — right-side pivot, like a press plate swinging closed
        // rotateY kept to 9° so body overflow-x:hidden doesn't clip the near edge
        tl.from(filmSection, {
          transformPerspective: 1600,
          rotateY: -9,
          scale: 0.9,
          opacity: 0,
          ease: "none",
          duration: 1,
        }, 0);

        // Machine — deeper 3D swing (contained inside the section, no overflow risk)
        if (machine) {
          tl.from(machine, {
            transformPerspective: 1000,
            rotateY: -22,
            scale: 0.72,
            x: 80,
            opacity: 0,
            ease: "none",
            duration: 0.55,
          }, 0.05);
        }

        // Text elements — 2D only (no rotateY on text = no font blur)
        if (eyebrow) tl.from(eyebrow, { opacity: 0, x: -24, duration: 0.3, ease: "none" }, 0.42);
        if (heading) tl.from(heading, { opacity: 0, x: -32, duration: 0.35, ease: "none" }, 0.5);
        if (body)    tl.from(body,    { opacity: 0, duration: 0.3, ease: "none" }, 0.62);
        if (cta)     tl.from(cta,     { opacity: 0, duration: 0.25, ease: "none" }, 0.72);
      }

      // ════════════════════════════════════════════════════════════════════
      // SECTION 2 — BAG MAKING
      // Mirror of section 1 — pivots in from the left.
      // ════════════════════════════════════════════════════════════════════
      const bagSection = specSections[1] ?? null;
      if (bagSection) {
        const machine = bagSection.querySelector<HTMLElement>("[data-reveal='image']");
        const heading = bagSection.querySelector<HTMLElement>("[data-reveal='heading']");
        const eyebrow = bagSection.querySelector<HTMLElement>("[data-reveal='eyebrow']");
        const body    = bagSection.querySelector<HTMLElement>(".text-side p");
        const cta     = bagSection.querySelector<HTMLElement>(".cta-row");

        const tl = gsap.timeline({ scrollTrigger: slabST(bagSection) });

        tl.from(bagSection, {
          transformPerspective: 1600,
          rotateY: 9,
          scale: 0.9,
          opacity: 0,
          ease: "none",
          duration: 1,
        }, 0);

        if (machine) {
          tl.from(machine, {
            transformPerspective: 1000,
            rotateY: 22,
            scale: 0.72,
            x: -80,
            opacity: 0,
            ease: "none",
            duration: 0.55,
          }, 0.05);
        }

        if (eyebrow) tl.from(eyebrow, { opacity: 0, x: 24,  duration: 0.3,  ease: "none" }, 0.42);
        if (heading) tl.from(heading, { opacity: 0, x: 32,  duration: 0.35, ease: "none" }, 0.5);
        if (body)    tl.from(body,    { opacity: 0,          duration: 0.3,  ease: "none" }, 0.62);
        if (cta)     tl.from(cta,     { opacity: 0,          duration: 0.25, ease: "none" }, 0.72);
      }

      // ════════════════════════════════════════════════════════════════════
      // GALLERY SECTION
      // Whole section tilts in around its horizontal axis (like a lid
      // opening), then cells stamp down one by one from depth.
      // ════════════════════════════════════════════════════════════════════
      const gallerySection = document.querySelector<HTMLElement>(".gallery");
      if (gallerySection) {
        const cells   = Array.from(gallerySection.querySelectorAll<HTMLElement>(".gallery-cell"));
        const eyebrow = gallerySection.querySelector<HTMLElement>("[data-reveal='eyebrow']");
        const heading = gallerySection.querySelector<HTMLElement>("[data-reveal='heading']");

        const tl = gsap.timeline({ scrollTrigger: slabST(gallerySection, { end: "top 5%" }) });

        // Full gallery slab — lid-open effect
        tl.from(gallerySection, {
          transformPerspective: 1200,
          rotateX: -12,
          scale: 0.88,
          opacity: 0,
          ease: "none",
          duration: 0.55,
          transformOrigin: "50% 100%",
        }, 0);

        if (eyebrow) tl.from(eyebrow, { opacity: 0, x: -28, duration: 0.2, ease: "none" }, 0.2);
        if (heading) tl.from(heading, { opacity: 0, x: -28, duration: 0.25, ease: "none" }, 0.28);

        // Cells stamp down from depth — stagger across the scrub window
        tl.from(cells, {
          transformPerspective: 700,
          rotateX: 52,
          scale: 0.52,
          opacity: 0,
          ease: "none",
          stagger: 0.06,
          duration: 0.05,
        }, 0.36);
      }

      // ════════════════════════════════════════════════════════════════════
      // FAMILIES SECTION
      // Section pivots in from the right like a catalogue being opened,
      // then cards deal from a 3D deck.
      // ════════════════════════════════════════════════════════════════════
      const famSection = document.querySelector<HTMLElement>(".families-section");
      if (famSection) {
        const heading = famSection.querySelector<HTMLElement>("[data-reveal='heading']");
        const cards   = Array.from(famSection.querySelectorAll<HTMLElement>(".fam-card"));

        const tl = gsap.timeline({ scrollTrigger: slabST(famSection, { end: "top 5%" }) });

        tl.from(famSection, {
          transformPerspective: 1600,
          rotateY: -8,
          scale: 0.9,
          opacity: 0,
          ease: "none",
          duration: 0.5,
        }, 0);

        if (heading) tl.from(heading, { opacity: 0, x: -36, duration: 0.25, ease: "none" }, 0.28);

        // Cards dealt one by one from a 3D deck
        tl.from(cards, {
          transformPerspective: 900,
          rotateY: 22,
          scale: 0.82,
          x: 50,
          opacity: 0,
          ease: "none",
          stagger: 0.025,
          duration: 0.04,
        }, 0.38);
      }

      // ════════════════════════════════════════════════════════════════════
      // PIPELINE SECTION
      // Section drops from above with a tilt, category cards descend
      // like press dies engaging in sequence.
      // ════════════════════════════════════════════════════════════════════
      const pipeSection = document.querySelector<HTMLElement>("[data-section='pipeline']");
      if (pipeSection) {
        const eyebrow = pipeSection.querySelector<HTMLElement>("[data-reveal='eyebrow']");
        const heading = pipeSection.querySelector<HTMLElement>("[data-reveal='heading']");
        const cards   = Array.from(pipeSection.querySelectorAll<HTMLElement>(".fam-card"));

        const tl = gsap.timeline({ scrollTrigger: slabST(pipeSection) });

        tl.from(pipeSection, {
          transformPerspective: 1100,
          rotateX: 10,
          scale: 0.9,
          opacity: 0,
          ease: "none",
          duration: 0.55,
          transformOrigin: "50% 0%",
        }, 0);

        if (eyebrow) tl.from(eyebrow, { opacity: 0, duration: 0.2, ease: "none" }, 0.3);
        if (heading) tl.from(heading, { opacity: 0, duration: 0.25, ease: "none" }, 0.38);

        // Cards descend from above — press-die sequence
        tl.from(cards, {
          transformPerspective: 800,
          rotateX: -30,
          y: -60,
          scale: 0.84,
          opacity: 0,
          ease: "none",
          stagger: 0.06,
          duration: 0.08,
        }, 0.44);
      }

      // ════════════════════════════════════════════════════════════════════
      // CTA BAND
      // Full-bleed molten plate emerging from depth.
      // ════════════════════════════════════════════════════════════════════
      const ctaBand = document.querySelector<HTMLElement>("[data-reveal='cta']");
      if (ctaBand) {
        gsap.from(ctaBand, {
          transformPerspective: 1000,
          rotateX: -6,
          scale: 0.91,
          opacity: 0,
          ease: "none",
          scrollTrigger: slabST(ctaBand, { start: "top 95%", end: "top 25%", scrub: 0.8 }),
        });
      }

      // ════════════════════════════════════════════════════════════════════
      // STACK SCALE-BACK
      // As each next section slides in, the previous one recedes in depth —
      // the "deck of cards" illusion.
      // ════════════════════════════════════════════════════════════════════
      const deck = Array.from(
        document.querySelectorAll<HTMLElement>(
          ".spec-grid-section, .gallery, .families-section"
        )
      );

      deck.forEach((card, i) => {
        const next = deck[i + 1];
        if (!next) return;

        gsap.to(card, {
          scale: 0.94,
          opacity: 0.75,
          ease: "none",
          scrollTrigger: {
            trigger: next,
            start: "top 95%",
            end:   "top 0%",
            scrub: 0.6,
          },
        });
      });
    })();
  }, []);

  return null;
}
