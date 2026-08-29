"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

interface Props {
  children: React.ReactNode;
  /** Skip the reveal animation — useful for the first pinned section etc. */
  skip?: boolean;
  /** Delay before the section starts sliding in (ms). */
  delay?: number;
}

export const SECTION_PUSH_DURATION = 0.4;
export const SECTION_ELEMENT_DELAY = 0.1;

export default function SectionReveal({ children, skip, delay = 0 }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (skip) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = sectionRef.current;
    if (!el) return;

    gsap.fromTo(el,
      { opacity: 0.3, filter: "blur(3px)", willChange: "filter, opacity" },
      {
        opacity: 1, filter: "blur(0px)",
        duration: SECTION_PUSH_DURATION,
        delay: delay / 1000,
        ease: "power2.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: el,
          start: "top 95%",
          once: true,
        },
      }
    );
  }, { scope: sectionRef, dependencies: [skip, delay] });

  if (skip) return <>{children}</>;

  return (
    <div ref={sectionRef} className="sr-push">
      {children}
    </div>
  );
}

