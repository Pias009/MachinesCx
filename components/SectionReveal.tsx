"use client";

import { useEffect, useRef } from "react";

interface Props {
  children: React.ReactNode;
  /** Skip the reveal animation — useful for the first pinned section etc. */
  skip?: boolean;
  /** Delay before the wiper starts sliding (ms). Lets hero breathe. */
  delay?: number;
}

export default function SectionReveal({ children, skip, delay = 0 }: Props) {
  const wiperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skip) return;
    const w = wiperRef.current;
    const c = contentRef.current;
    if (!w || !c) return;

    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      w.classList.add("sr-wiper--sweep");
      c.classList.add("sr-content--in");
      w.style.transform = "translateY(-100%)";
      // drop pointer-events after slide so content is interactive
      setTimeout(() => { w.style.pointerEvents = "none"; }, 900);
    };

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(reveal, delay);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.08 },
    );
    obs.observe(w);

    // Safety net — if the observer never fires (ref race, layout quirk,
    // browser oddity), don't leave the content permanently hidden.
    const fallback = setTimeout(reveal, 4000);

    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [skip, delay]);

  if (skip) return <>{children}</>;

  return (
    <div className="sr-wrap">
      <div ref={contentRef} className="sr-content">{children}</div>
      <div ref={wiperRef} className="sr-wiper" aria-hidden>
        <div className="sr-wiper__scan" />
        <div className="sr-wiper__sweep" />
        <div className="sr-wiper__corner sr-wiper__corner--tl" />
        <div className="sr-wiper__corner sr-wiper__corner--br" />
        <div className="sr-wiper__label">
          <span className="sr-wiper__text">SCROLL</span>
          <span className="sr-wiper__arrow">↓</span>
        </div>
      </div>
    </div>
  );
}
