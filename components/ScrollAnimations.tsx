"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollAnimations() {
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const triggers: ScrollTrigger[] = [];

    function run() {
      /* ── 1. Hero fade ── */
      const hero = document.querySelector(".hs");
      if (hero) {
        triggers.push(
          ScrollTrigger.create({
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
            onUpdate: (self) => {
              gsap.set(hero, {
                opacity: 1 - self.progress,
                scale: 1 - self.progress * 0.08,
              });
            },
          })
        );
      }

      /* ── 2. Section reveals ── */
      const configs: { sel: string; targets: string[] }[] = [
        { sel: ".trust-section", targets: [".ts-headline", ".ts-desc", ".ts-kicker"] },
        { sel: ".mcs",  targets: [".mcs__title", ".mcs__sub", ".mcs__cta", ".mcs__badge"] },
        { sel: ".cc",   targets: [".cc__title", ".cc__desc", ".cc__cta", ".cc__eyebrow"] },
        { sel: "[data-ps]", targets: [".ps-brand-label", ".ps-model-name", ".ps-view-all"] },
      ];

      configs.forEach(({ sel, targets }) => {
        document.querySelectorAll<HTMLElement>(sel).forEach((section) => {
          const els: HTMLElement[] = [];
          targets.forEach((t) => {
            section.querySelectorAll<HTMLElement>(t).forEach((el) => els.push(el));
          });
          if (!els.length) return;
          gsap.set(els, { y: 48, opacity: 0 });
          triggers.push(
            ScrollTrigger.create({
              trigger: section,
              start: "top 82%",
              onEnter: () => {
                gsap.to(els, {
                  y: 0, opacity: 1,
                  duration: 0.9, stagger: 0.08,
                  ease: "power3.out", overwrite: true,
                });
              },
            })
          );
        });
      });

      /* ── 3. Trust stats ── */
      document.querySelectorAll<HTMLElement>(".ts-stats").forEach((wrap) => {
        const stats = wrap.querySelectorAll<HTMLElement>(".ts-stat");
        if (!stats.length) return;
        gsap.set(stats, { y: 32, opacity: 0 });
        triggers.push(
          ScrollTrigger.create({
            trigger: wrap, start: "top 82%",
            onEnter: () => {
              gsap.to(stats, {
                y: 0, opacity: 1,
                duration: 0.8, stagger: 0.12,
                ease: "power3.out", overwrite: true,
              });
            },
          })
        );
      });

      /* ── 4. Machine grid ── */
      document.querySelectorAll<HTMLElement>(".mcs__grid").forEach((grid) => {
        const cards = Array.from(grid.children) as HTMLElement[];
        if (!cards.length) return;
        gsap.set(cards, { y: 40, opacity: 0 });
        triggers.push(
          ScrollTrigger.create({
            trigger: grid, start: "top 80%", once: true,
            onEnter: () => {
              gsap.to(cards, {
                y: 0, opacity: 1,
                duration: 0.7, stagger: 0.07,
                ease: "power3.out", overwrite: true,
              });
            },
          })
        );
      });

      /* ── 5. News cards ── */
      document.querySelectorAll<HTMLElement>(".ns2-card").forEach((card) => {
        gsap.set(card, { y: 30, opacity: 0 });
        triggers.push(
          ScrollTrigger.create({
            trigger: card, start: "top 85%", once: true,
            onEnter: () => {
              gsap.to(card, {
                y: 0, opacity: 1,
                duration: 0.6, ease: "power3.out",
              });
            },
          })
        );
      });

      /* ── 6. Flexo cards ── */
      document.querySelectorAll<HTMLElement>(".fls-card").forEach((card) => {
        gsap.set(card, { y: 30, opacity: 0 });
        triggers.push(
          ScrollTrigger.create({
            trigger: card, start: "top 85%", once: true,
            onEnter: () => {
              gsap.to(card, {
                y: 0, opacity: 1,
                duration: 0.6, ease: "power3.out",
              });
            },
          })
        );
      });

      ScrollTrigger.refresh();
    }

    run();
    timers.push(setTimeout(() => {
      triggers.forEach((st) => st.kill());
      triggers.length = 0;
      run();
    }, 1500));

    return () => {
      timers.forEach(clearTimeout);
      triggers.forEach((st) => st.kill());
    };
  }, []);

  return null;
}
