"use client";

import { useEffect, useRef } from "react";
import { families, familyImage } from "@/lib/products";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ─── data ─────────────────────────────────────────────────────────────────── */
const ALL_MACHINES: [string, string][] = [
  ["abcde-2200",           "ABCDE-2200"],
  ["abc-multilayer-large", "ABC Multi-layer"],
  ["s-wide",               "S Single-layer"],
  ["sb-printing-line",     "SB Blow + Print"],
  ["f-pro-bottomseal",     "F-PRO Bottom-seal"],
  ["rgb-rollbag",          "RGB Roll Bag"],
  ["rb-vegetable",         "RB Vest Bag"],
  ["cx-pelletizing",       "CX Recycling"],
];

const bySlug = Object.fromEntries(families.map((f) => [f.slug, f]));

/* ─── Act 1 floor tile — one machine in the opening grid ─────────────────── */
function FloorTile({ slug, index }: { slug: string; index: number }) {
  const fam = bySlug[slug];
  return (
    <div className="fc-tile" style={{ "--tile-i": index } as React.CSSProperties}>
      <div className="fc-tile__inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fam ? familyImage(fam) : `/machines/${slug}.png`} alt={fam?.series ?? slug} className="fc-tile__img" />
        <div className="fc-tile__shine" aria-hidden />
        <div className="fc-tile__label">
          <span className="fc-tile__series">{fam?.series ?? slug}</span>
        </div>
        <div className="fc-tile__bar" aria-hidden />
      </div>
      {/* per-tile wiper — shows glitch text while covering, slides up to reveal */}
      <div className="fc-tile__wiper" aria-hidden>
        <span className="fc-tile__wiper-count">
          {String(index + 1).padStart(2, "0")} / 08
        </span>
        <span className="fc-tile__wiper-name" data-text={fam?.series ?? slug}>
          {fam?.series ?? slug}
        </span>
      </div>
    </div>
  );
}

/* ─── main component ─────────────────────────────────────────────────────────── */
export default function GalleryPopup() {
  const sectionRef  = useRef<HTMLElement>(null);
  const act1Ref     = useRef<HTMLDivElement>(null);
  const titleRef    = useRef<HTMLHeadingElement>(null);
  const tileWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: act1Ref.current,
          start: "top top",
          end: "+=300%",
          pin: true,
          scrub: 1.2,
        },
      });

      gsap.set(titleRef.current, { transformOrigin: "center center" });

      // phase 1 — title rises and shrinks to top
      tl.to(titleRef.current, {
        y: () => -(window.innerHeight * 0.5 - 40),
        scale: 0.15,
        ease: "power3.inOut",
        duration: 0.4,
      });

      // phase 2 — grid wrapper becomes visible
      tl.to(tileWrapRef.current, {
        opacity: 1,
        duration: 0.06,
        ease: "none",
      }, "-=0.01");

      // phase 3 — tiles sweep in FROM LEFT TO RIGHT one by one
      // Each tile starts at x: -120vw (off-screen left) and lands at x: 0
      const tiles = gsap.utils.toArray<HTMLElement>(".fc-tile");
      gsap.set(tiles, { x: "-120vw", opacity: 0 });

      tl.to(tiles, {
        x: "0vw",
        opacity: 1,
        ease: "power3.out",
        duration: 0.55,
        stagger: { amount: 0.5, from: "start" },
      }, "-=0.01");

      // simultaneously wipe up the glitch overlay so image shows clean
      tl.to(".fc-tile__wiper", {
        yPercent: -100,
        ease: "power2.inOut",
        duration: 0.35,
        stagger: { amount: 0.4, from: "start" },
      }, "-=0.45");

      // hold
      tl.to({}, { duration: 0.2 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="fc-section" ref={sectionRef}>
      <div className="fc-act fc-act1" ref={act1Ref}>
        <div className="fc-grid" aria-hidden />
        <div className="fc-glow" aria-hidden />

        {/* h1 — pinned high, GSAP moves it further up as scroll progresses */}
        <h1 className="fc-act1__title" ref={titleRef}>
          Built for<br />the floor.
        </h1>

        {/* tile grid — invisible until title clears, then wipers lift */}
        <div className="fc-tile-wrap" ref={tileWrapRef}>
          <div className="fc-tile-grid">
            {ALL_MACHINES.map(([slug], i) => (
              <FloorTile key={slug} slug={slug} index={i} />
            ))}
          </div>
        </div>

        <div className="fc-act1__hint" aria-hidden>
          <span /><span /><span />
        </div>
      </div>

    </section>
  );
}
