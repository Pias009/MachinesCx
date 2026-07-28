"use client";
import { useEffect, useRef, useState } from "react";
import {
  Building2, Zap, Wrench, Gauge, GraduationCap,
  ClipboardCheck, Factory, SearchCheck, Truck, Hammer, Ship,
  type LucideIcon,
} from "lucide-react";

/* ── Real imported icon set (lucide) for install / delivery steps ──
   Actual professionally-drawn glyphs, not hand-coded custom paths or a
   logo mark standing in for a photo. Each icon "draws in" via a stroke
   animation the first time it scrolls into view, then idles with a
   small breathing loop. Icons are chosen by matching the step's title
   or label text — this keeps the JSON data model plain strings while
   every card still gets the right glyph. */

export type IconName =
  | "foundation" | "power" | "assembly" | "calibration" | "training"
  | "confirm" | "factory" | "inspect" | "shipping" | "install" | "freight"
  | "generic";

const ICONS: Record<Exclude<IconName, "generic">, LucideIcon> = {
  // installation steps
  foundation: Building2,
  power: Zap,
  assembly: Wrench,
  calibration: Gauge,
  training: GraduationCap,
  // delivery phases
  confirm: ClipboardCheck,
  factory: Factory,
  inspect: SearchCheck,
  shipping: Truck,
  install: Hammer,
  freight: Ship,
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
  const ref = useRef<HTMLSpanElement>(null);
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

  const Icon = name === "generic" ? ICONS.assembly : ICONS[name];

  return (
    <span ref={ref} className={`pico${drawn ? " pico--drawn" : ""}`} style={{ width: size, height: size }}>
      <Icon className="pico__svg" width={size} height={size} strokeWidth={1.75} aria-hidden="true" />
    </span>
  );
}
