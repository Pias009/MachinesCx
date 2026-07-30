"use client";

import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

interface Props {
  children: React.ReactNode;
  /** Skip the reveal animation — useful for the first pinned section etc. */
  skip?: boolean;
  /** Delay before the section starts sliding in (ms). Lets prior section breathe. */
  delay?: number;
}

// Section-level entrance duration, in seconds. Every section's own internal
// element animations key their delay off this so elements never start
// moving until the section itself has finished pushing/fading into place —
// two clear beats (section, then contents) instead of everything firing at
// once from separate, uncoordinated triggers.
export const SECTION_PUSH_DURATION = 0.7;

// Add this to every internal element's own `delay` so it waits for the
// section-level push above to fully settle before it starts moving.
export const SECTION_ELEMENT_DELAY = SECTION_PUSH_DURATION;

export default function SectionReveal({ children, skip, delay = 0 }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);
  // ScrollTrigger is a separate GSAP plugin bundle — load it once on mount
  // instead of bundling it into the initial homepage chunk (every section
  // using SectionReveal defers below the fold, so this cost is paid lazily).
  const [pluginReady, setPluginReady] = useState(false);

  useEffect(() => {
    if (skip) return;
    let cancelled = false;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      setPluginReady(true);
    });
    return () => { cancelled = true; };
  }, [skip]);

  useGSAP(() => {
    if (skip || !pluginReady) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = sectionRef.current;
    if (!el) return;

    // will-change promotes this to its own compositor layer only while the
    // blur/opacity/transform tween is actually running — cleared on
    // complete so seven idle sections don't each hold a GPU layer forever.
    gsap.fromTo(el,
      { opacity: 0, filter: "blur(6px)", willChange: "filter, opacity" },
      {
        opacity: 1, filter: "blur(0px)",
        duration: SECTION_PUSH_DURATION,
        delay: delay / 1000,
        ease: "power3.out",
        clearProps: "willChange",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          end: "bottom top",
          toggleActions: "play reverse play reverse",
        },
      }
    );
  }, { scope: sectionRef, dependencies: [skip, delay, pluginReady] });

  if (skip) return <>{children}</>;

  return (
    <div ref={sectionRef} className="sr-push">
      {children}
    </div>
  );
}
