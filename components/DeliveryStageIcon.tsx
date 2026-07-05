"use client";

/* ── Large illustrated icons for the 5-step delivery timeline ──
   Purpose-built for this one section: bigger, more detailed silhouettes
   than the generic ProcessIcon set, each carrying its own accent tone
   (still drawn from the site's teal-industrial palette, not a rainbow)
   so the five steps read as visually distinct stages rather than one
   repeated monochrome badge. Real illustrated shapes, not a stock icon
   font and not a plain circle placeholder. */

export type DeliveryStageKey = "confirm" | "production" | "test" | "shipping" | "install";

const TONE: Record<DeliveryStageKey, string> = {
  confirm:    "#6ea8ff", // slate-blue — paperwork / confirmation
  production: "#f5a623", // amber — manufacturing heat
  test:       "#2bbfb3", // brand teal — QC / acceptance
  shipping:   "#ff8a4c", // warm orange — logistics / export
  install:    "#2bbfb3", // brand teal — bookends the sequence
};

const ICONS: Record<DeliveryStageKey, React.ReactNode> = {
  confirm: (
    <>
      <path d="M14 4H10a4 4 0 0 0-4 4v40a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V20L30 4Z" fill="currentColor" fillOpacity="0.14" />
      <path d="M14 4H10a4 4 0 0 0-4 4v40a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V20L30 4Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M30 4v13a3 3 0 0 0 3 3h9" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M18 30h16M18 37h16M18 44h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="41" cy="41" r="9" fill="#0d2220" stroke="currentColor" strokeWidth="2.4" />
      <path d="M37.5 41.2 40 43.7 45 38.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </>
  ),
  production: (
    <>
      <rect x="8" y="26" width="40" height="24" rx="2" fill="currentColor" fillOpacity="0.14" />
      <rect x="8" y="26" width="40" height="24" rx="2" stroke="currentColor" strokeWidth="2.4" />
      <path d="M8 26v-6l7-5v7l7-7v7l7-7v11" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" fill="none" />
      <path d="M15 50v-9M25 50v-9M35 50v-9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="18" y="32" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="29" y="32" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="42" cy="12" r="2" fill="currentColor" />
    </>
  ),
  test: (
    <>
      <circle cx="24" cy="24" r="17" fill="currentColor" fillOpacity="0.14" />
      <circle cx="24" cy="24" r="17" stroke="currentColor" strokeWidth="2.4" />
      <path d="M16 24.5 21 29.5 33 16.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M38 38 48 48" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M24 8v3M24 37v3M8 24h3M37 24h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  shipping: (
    <>
      <path d="M6 14h24v20H6Z" fill="currentColor" fillOpacity="0.14" />
      <path d="M6 14h24v20H6Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M30 22h9l7 8v4H30Z" fill="currentColor" fillOpacity="0.14" />
      <path d="M30 22h9l7 8v4H30Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="16" cy="41" r="5" fill="#0d2220" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="41" cy="41" r="5" fill="#0d2220" stroke="currentColor" strokeWidth="2.4" />
      <path d="M21 41h15" stroke="currentColor" strokeWidth="2.4" />
      <path d="M11 20h14M11 26h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.6" />
    </>
  ),
  install: (
    <>
      <path d="M9 34 34 9l11 11-25 25Z" fill="currentColor" fillOpacity="0.14" />
      <path d="M9 34 34 9l11 11-25 25Z" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M9 34 5 46l12-4" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" fill="currentColor" fillOpacity="0.14" />
      <path d="M31 12 41 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <circle cx="44" cy="8" r="2" fill="currentColor" />
      <circle cx="48" cy="14" r="1.5" fill="currentColor" opacity="0.7" />
    </>
  ),
};

/* keyword → stage mapping so admin-entered timeline labels (plain text)
   still land on the right illustrated icon */
const KEYWORDS: [RegExp, DeliveryStageKey][] = [
  [/accept|inspect|test|trial/i, "test"],
  [/ship|export|pack|freight|deliver/i, "shipping"],
  [/install|commission|on-site/i, "install"],
  [/production|manufactur|assembl/i, "production"],
  [/order|confirm/i, "confirm"],
];

export function resolveDeliveryStage(text: string): DeliveryStageKey {
  for (const [re, key] of KEYWORDS) if (re.test(text)) return key;
  return "production";
}

export default function DeliveryStageIcon({ name, size = 56 }: { name: DeliveryStageKey; size?: number }) {
  return (
    <svg
      className="dsi-svg"
      width={size} height={size} viewBox="0 0 56 56"
      fill="none"
      style={{ color: TONE[name] }}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
