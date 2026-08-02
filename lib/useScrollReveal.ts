"use client";
import { useEffect, type RefObject } from "react";

/** Entrance animation — every `[data-reveal]` element inside `rootRef`
 *  fades/slides in as it scrolls into view, staggered by its position
 *  among same-parent siblings. `data-reveal` value picks the motion:
 *  "scale" for photos/frames, "blur" for hero text, unset = fade-up.
 *  Extracted from ProductDetail.tsx's original inline version so any
 *  page can opt into the same choreography instead of re-implementing
 *  it — see FlexoPrintingPage.tsx for a second call site. */
export function useScrollReveal(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const els = Array.from(rootRef.current.querySelectorAll<HTMLElement>("[data-reveal]"));

    const HIDDEN: Record<string, { opacity: string; transform: string; filter?: string }> = {
      scale: { opacity: "0", transform: "scale(0.94)" },
      blur: { opacity: "0", transform: "translateY(16px)", filter: "blur(6px)" },
      default: { opacity: "0", transform: "translateY(22px)" },
    };

    els.forEach((el) => {
      const kind = el.dataset.reveal || "default";
      const hidden = HIDDEN[kind] ?? HIDDEN.default;
      el.style.opacity = hidden.opacity;
      el.style.transform = hidden.transform;
      if (hidden.filter) el.style.filter = hidden.filter;
      el.style.transition =
        "opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s cubic-bezier(0.16,1,0.3,1)";
    });

    const groups = new Map<Element, HTMLElement[]>();
    els.forEach((el) => {
      const parent = el.parentElement ?? el;
      if (!groups.has(parent)) groups.set(parent, []);
      groups.get(parent)!.push(el);
    });

    const seen = new WeakSet<HTMLElement>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const el = entry.target as HTMLElement;
          if (!entry.isIntersecting || seen.has(el)) return;
          seen.add(el);
          const siblings = groups.get(el.parentElement ?? el) ?? [el];
          const idx = siblings.indexOf(el);
          const delay = Math.max(0, idx) * 0.08;
          el.style.transitionDelay = `${delay}s`;
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.filter = "none";
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
