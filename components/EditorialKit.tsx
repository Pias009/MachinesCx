/* ── shared visual-language primitives for the "editorial brand board" look:
   grain-textured panels, diagonal dividers, plus-bullet marks, mono metadata
   rows. Kept in one file so every product-detail section draws from the
   same handful of building blocks instead of re-implementing the texture. ── */
import type { ReactNode } from "react";

/** feTurbulence noise, tinted per-usage via CSS `filter`/opacity on the parent. */
const GRAIN_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'>
      <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter>
      <rect width='100%' height='100%' filter='url(#n)'/>
    </svg>`
  );

export function Grain({ opacity = 0.35, className = "" }: { opacity?: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 mix-blend-overlay ${className}`}
      style={{ backgroundImage: `url("${GRAIN_SVG}")`, backgroundSize: "240px 240px", opacity }}
    />
  );
}

/** Small "+" tick used as a bullet / corner mark, matching the reference board. */
export function PlusMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`font-mono text-[0.85em] leading-none text-current ${className}`}>
      +
    </span>
  );
}

/** Column of plus marks — the reference board's left-edge bullet stack. */
export function PlusRail({ count = 4, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <PlusMark key={i} />
      ))}
    </div>
  );
}

/** Tiny mono "KEY : value" row — the reference board's metadata lines. */
export function MetaRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-4 font-mono text-[0.68rem] uppercase tracking-[0.12em]">
      <span className="text-[var(--brand-teal)]">{k}</span>
      <span className="text-[var(--ink-60)] normal-case tracking-normal">{v}</span>
    </div>
  );
}

/** Three-dot pager mark (● ○ ●) from the reference board's top-right corner. */
export function DotPager({ active = 2, of = 3 }: { active?: number; of?: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {Array.from({ length: of }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            i === active ? "bg-[var(--brand-rose,#e11d48)]" : "bg-current opacity-30"
          }`}
        />
      ))}
    </div>
  );
}

/** Section heading in the editorial register — mono eyebrow + teal tick +
 * display headline, replacing pdv2-section-head for every restyled block. */
export function SectionHead({
  eyebrow,
  title,
  note,
}: {
  eyebrow: string;
  title: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4" data-reveal>
      <div>
        <p className="mb-2 flex items-center gap-3 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[var(--brand-teal)]">
          <PlusMark />
          {eyebrow}
        </p>
        <h2 className="text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[0.95] tracking-[0.01em] text-[var(--ink)]" style={{ fontFamily: "var(--ff-display)" }}>
          {title}
        </h2>
      </div>
      {note && (
        <div className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-[var(--ink-35)]">
          {note}
        </div>
      )}
    </div>
  );
}

/** Smaller in-tab sub-heading — same plus-mark register as SectionHead, but
 * an h3 sized for use inside an already-headed tab pane. */
export function SubHead({ title, note }: { title: ReactNode; note?: ReactNode }) {
  return (
    <div className="mb-6 mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--bg-line)] pt-8 first:mt-0 first:border-t-0 first:pt-0" data-reveal>
      <h3 className="flex items-center gap-3 text-[clamp(1.15rem,2.2vw,1.5rem)] leading-none tracking-[0.01em] text-[var(--ink)]" style={{ fontFamily: "var(--ff-display)" }}>
        <PlusMark className="text-[var(--brand-teal)]" />
        {title}
      </h3>
      {note && (
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--ink-35)]">{note}</span>
      )}
    </div>
  );
}
