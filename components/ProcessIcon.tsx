"use client";
import { useEffect, useRef, useState } from "react";

/* ── Hand-drawn line-icon set for install / delivery process steps ──
   Each icon is a single-stroke SVG that "draws itself" the first time it
   scrolls into view (stroke-dashoffset animation), then idles with a
   small looping accent (spin / pulse / bounce) so the section doesn't feel
   like static clip art. Icons are chosen by matching the step's title or
   label text — this keeps the JSON data model plain strings while every
   card still gets the right pictogram. */

export type IconName =
  | "foundation" | "power" | "assembly" | "calibration" | "training"
  | "confirm" | "factory" | "inspect" | "shipping" | "install"
  | "generic";

const ICONS: Record<Exclude<IconName, "generic">, React.ReactNode> = {
  // installation steps
  foundation: (
    <>
      <path d="M4 19h16" />
      <path d="M6 19V10l6-4 6 4v9" />
      <path d="M9 19v-5h6v5" />
    </>
  ),
  power: (
    <path d="M12 3 5 13h5l-1 8 8-11h-5l1-7z" strokeLinejoin="round" />
  ),
  assembly: (
    <>
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17v3h3l5.3-5.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5z" />
    </>
  ),
  calibration: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  training: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7" />
    </>
  ),
  // delivery phases
  confirm: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="1.5" />
      <path d="M9 2v4M15 2v4M8 12l2.5 2.5L16 9" />
    </>
  ),
  factory: (
    <>
      <path d="M4 21V11l5 3v-3l5 3v-3l5 3v7Z" />
      <path d="M4 21h16" />
    </>
  ),
  inspect: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3 21 21" />
      <path d="M8 10.5h5" />
    </>
  ),
  shipping: (
    <>
      <path d="M3 16V6h11v10" />
      <path d="M14 10h4l3 3.5V16h-7" />
      <circle cx="7" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </>
  ),
  install: (
    <>
      <path d="M3 21 21 3" />
      <path d="M14 3h7v7" />
      <path d="M9 21H3v-6" />
    </>
  ),
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
  [/ship|export|pack|deliver/i, "shipping"],
];

export function resolveIcon(text: string): IconName {
  for (const [re, icon] of KEYWORDS) if (re.test(text)) return icon;
  return "generic";
}

export default function ProcessIcon({ name, size = 30 }: { name: IconName; size?: number }) {
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

  const paths = name === "generic" ? ICONS.assembly : ICONS[name];

  return (
    <span className={`pico${drawn ? " pico--drawn" : ""}`} style={{ width: size, height: size }}>
      <svg
        ref={ref}
        className="pico__svg"
        width={size} height={size} viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"
        aria-hidden="true"
      >
        {paths}
      </svg>
    </span>
  );
}
