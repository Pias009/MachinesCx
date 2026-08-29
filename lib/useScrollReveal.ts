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
    /* Reveal animation disabled to prevent blank space / initial invisible states on mobile. */
    if (!rootRef.current) return;
    const els = Array.from(rootRef.current.querySelectorAll<HTMLElement>("[data-reveal]"));
    els.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
    });
  }, [rootRef]);
}
