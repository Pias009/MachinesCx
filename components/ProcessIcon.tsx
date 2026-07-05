"use client";
import { useEffect, useRef, useState } from "react";

/* ── Bold duotone process-icon set for install / delivery steps ──
   Each glyph pairs a solid teal-tinted fill shape with a heavier white/ink
   accent stroke on top — chunky, custom silhouettes rather than a generic
   thin-line icon-kit look. They "draw in" the accent stroke the first time
   they scroll into view, then idle with a small breathing loop. Icons are
   chosen by matching the step's title or label text — this keeps the JSON
   data model plain strings while every card still gets the right glyph. */

export type IconName =
  | "foundation" | "power" | "assembly" | "calibration" | "training"
  | "confirm" | "factory" | "inspect" | "shipping" | "install" | "freight"
  | "generic";

/* each icon = { fill: solid duotone shape(s), accent: heavier foreground
   stroke drawn on top in the brand teal } */
const ICONS: Record<Exclude<IconName, "generic">, { fill: React.ReactNode; accent: React.ReactNode }> = {
  // installation steps
  foundation: {
    fill: (
      <path d="M12 2 22 9v2H2V9z" />
    ),
    accent: (
      <>
        <path d="M4 12v9h16v-9" />
        <path d="M9 21v-6h6v6" />
        <path d="M4 21h16" />
      </>
    ),
  },
  power: {
    fill: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
    accent: <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z" />,
  },
  assembly: {
    fill: (
      <>
        <circle cx="8" cy="8" r="5.5" />
        <circle cx="17" cy="17" r="5.5" />
      </>
    ),
    accent: (
      <>
        <path d="M11.8 11.8 16 16" strokeLinecap="round" />
        <path d="M8 5.2v5.6M5.2 8h5.6" strokeLinecap="round" />
        <path d="M17 14.2v5.6M14.2 17h5.6" strokeLinecap="round" />
      </>
    ),
  },
  calibration: {
    fill: <circle cx="12" cy="12" r="9.5" />,
    accent: (
      <>
        <path d="M12 6.5V12l4 2.4" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
  },
  training: {
    fill: (
      <>
        <circle cx="12" cy="7.5" r="4.5" />
        <path d="M3 22c0-5.2 4-9.4 9-9.4s9 4.2 9 9.4z" />
      </>
    ),
    accent: <path d="M8.5 7.5 11 10l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />,
  },
  // delivery phases — precise technical line-art, no soft filled shapes.
  // Fill layer stays empty (kept only so the duotone renderer signature is
  // uniform); the accent group carries the entire drawn glyph at 1.4 stroke.
  confirm: {
    fill: null,
    accent: (
      <>
        <path d="M4 3.5h13l3 3V21H4Z" />
        <path d="M17 3.5V7h3" />
        <path d="M7.5 12.5l2.6 2.6L16.5 9" />
      </>
    ),
  },
  factory: {
    fill: null,
    accent: (
      <>
        <path d="M3 21V11l5 3.2V11l5 3.2V11l5 3.2V21Z" />
        <path d="M3 21h17" />
        <path d="M6.5 21v-3.5M11.5 21v-3.5M16.5 21v-3.5" />
        <path d="M18 11V7h2.5v4" />
      </>
    ),
  },
  inspect: {
    fill: null,
    accent: (
      <>
        <rect x="3" y="3" width="18" height="18" />
        <circle cx="10.5" cy="10.5" r="4.5" />
        <path d="M13.8 13.8 18 18" />
        <path d="M10.5 8v5M8 10.5h5" />
      </>
    ),
  },
  shipping: {
    fill: null,
    accent: (
      <>
        <path d="M3 5.5h11v10H3Z" />
        <path d="M14 10h4l3 3v2.5h-7Z" />
        <path d="M6.5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M17.5 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
        <path d="M8.5 20h6.5" />
      </>
    ),
  },
  install: {
    fill: null,
    accent: (
      <>
        <rect x="3" y="3" width="18" height="18" />
        <path d="M8 16 16 8" />
        <path d="M11 8h5v5" />
      </>
    ),
  },
  // cargo ship — hull + container stack, for ocean/air freight stages
  freight: {
    fill: null,
    accent: (
      <>
        <path d="M2.5 15.5h19L19.5 21h-15Z" />
        <path d="M6 15.5v-6h4v6M12 15.5v-8h4v8" />
        <path d="M4 9.5h16" />
        <path d="M12 4.5v2" />
      </>
    ),
  },
};

/* keyword → icon mapping so the JSON data can stay plain text */
const KEYWORDS: [RegExp, Exclude<IconName, "generic">][] = [
  // more specific patterns first — "on-site installation" must win over a
  // bare "site" match, so `install` is checked before `foundation`.
  [/install|commission|on-site/i, "install"],
  [/foundation|^site\b|\bsite\s*(check|survey)/i, "foundation"],
  [/power|utilit|pneumatic|electric/i, "power"],
  [/assembl|mechanical/i, "assembly"],
  [/calibrat|trial/i, "calibration"],
  [/training|operator/i, "training"],
  [/order|confirm/i, "confirm"],
  [/production|factory(?!\s*acceptance)/i, "factory"],
  [/accept|inspect|test/i, "inspect"],
  [/ocean|air freight|freight|sea freight|vessel|container ship/i, "freight"],
  [/ship|export|pack|deliver/i, "shipping"],
];

export function resolveIcon(text: string): IconName {
  for (const [re, icon] of KEYWORDS) if (re.test(text)) return icon;
  return "generic";
}

export default function ProcessIcon({ name, size = 40 }: { name: IconName; size?: number }) {
  const ref = useRef<SVGSVGElement>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setDrawn(true); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setDrawn(true); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const icon = name === "generic" ? ICONS.assembly : ICONS[name];

  return (
    <span className={`pico${drawn ? " pico--drawn" : ""}`} style={{ width: size, height: size }}>
      <svg
        ref={ref}
        className="pico__svg"
        width={size} height={size} viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <g className="pico__fill" fill="currentColor" fillOpacity="0.16" stroke="none">
          {icon.fill}
        </g>
        <g
          className="pico__accent"
          fill="none" stroke="currentColor" strokeWidth="1.9"
          strokeLinecap="round" strokeLinejoin="round"
        >
          {icon.accent}
        </g>
      </svg>
    </span>
  );
}
