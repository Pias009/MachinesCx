import Link from "next/link";
import type { ProductFamily, SpecRow } from "@/lib/products";

/* Category comparison table — one row per product page, built only from
   values already in each product's spec table (plus the model code in its
   name). Plain HTML <table> so crawlers and screen readers get real rows. */

const find = (f: ProductFamily, re: RegExp): SpecRow | undefined => f.specs.find((s) => re.test(s.label));
const nums = (vals: string[]) => vals.flatMap((v) => (v.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));

/** "400–800mm | 600–1000mm" → "400–1000 mm"; one distinct value is shown
 *  as written (keeps qualifiers like "< 235mm") */
function span(vals: string[], unit: string): string {
  const distinct = Array.from(new Set(vals.map((v) => v.trim())));
  if (distinct.length === 1) return distinct[0].replace(/(\d)\s*(mm|KG\/H)$/i, (_, d, u) => `${d} ${u.toLowerCase()}`);
  const n = nums(vals);
  if (!n.length) return "—";
  const lo = Math.min(...n), hi = Math.max(...n);
  return lo === hi ? `${hi} ${unit}` : `${lo}–${hi} ${unit}`;
}

function width(f: ProductFamily): string {
  const row = find(f, /^(film width|max web width|max bag width|produce width)/i);
  if (!row) return "—";
  // "500mm × 2"-style lane widths read wrong as a span — show them as-is
  if (row.values.some((v) => /×/.test(v))) return Array.from(new Set(row.values)).join(" / ");
  return span(row.values, "mm");
}

function output(f: ProductFamily): string {
  const ld = find(f, /output · ldpe/i), hd = find(f, /output · hdpe/i);
  if (ld || hd) {
    // "35 KG×2" = per die head on a twin-head line — keep the multiplier
    const top = (r: SpecRow) => {
      const heads = r.values.join(" ").match(/×\s?(\d+)/)?.[1];
      const n = Math.max(...r.values.map((v) => Number(v.match(/\d+(?:\.\d+)?/)?.[0] ?? 0)));
      return heads ? `${n}×${heads}` : `${n}`;
    };
    const parts = [hd && `HDPE ≤${top(hd)}`, ld && `LDPE ≤${top(ld)}`].filter(Boolean);
    return `${parts.join(" / ")} kg/h`;
  }
  const kg = find(f, /extrusion output/i);
  if (kg) return span(kg.values, "kg/h");
  const speed = find(f, /(bag making speed|mechanical speed|speed · flat)/i);
  if (speed) {
    if (speed.values.some((v) => /×/.test(v))) return Array.from(new Set(speed.values)).join(" / ");
    return span(speed.values, /m\/min/i.test(speed.values[0]) ? "m/min" : "pcs/min");
  }
  return "—";
}

function layersOrLanes(f: ProductFamily): string {
  const colours = find(f, /printing colours/i);
  if (colours) return `${colours.values[0]} colours`;
  const layer = f.series.match(/(\d+-layer|single-layer|multi-layer)/i);
  if (layer) return layer[1];
  const lanes = Array.from(new Set((f.seo?.h1 ?? f.name).match(/×\s?(\d+)/g)?.map((m) => m.replace(/\D/g, "")) ?? []));
  if (lanes.length) return `${lanes.join(" / ")} lanes`;
  return "—";
}

/** A category with a single product page compares that product's sizes
 *  instead — one row per model column of its spec table. */
function rowsFor(families: ProductFamily[]): { key: string; label: string; f: ProductFamily }[] {
  if (families.length !== 1) return families.map((f) => ({ key: f.slug, label: f.seo?.h1 ?? f.name, f }));
  const f = families[0];
  return f.models.map((m, i) => ({
    key: `${f.slug}-${i}`,
    label: m,
    f: { ...f, specs: f.specs.map((r) => ({ ...r, values: [r.values[i] ?? r.values[0]] })) },
  }));
}

export default function ModelComparisonTable({ families, caption }: { families: ProductFamily[]; caption: string }) {
  const rows = rowsFor(families);
  if (rows.length < 2) return null;
  return (
    <section className="mct" aria-labelledby="mct-heading">
      <style>{`
        .mct { max-width: 1280px; margin: 0 auto; padding: clamp(2.5rem,5vw,4rem) clamp(1.25rem,4vw,3rem); }
        .mct h2 { font-family: var(--ff-display); font-size: clamp(1.6rem,3vw,2.4rem); color: var(--ink); margin: 0 0 1.25rem; line-height: 1; }
        .mct__scroll { overflow-x: auto; border: 1px solid var(--bg-line); background: var(--bg-surface); }
        .mct table { width: 100%; border-collapse: collapse; min-width: 640px; font-family: var(--ff-body); font-size: .9rem; }
        .mct th, .mct td { text-align: left; padding: .75rem 1rem; border-bottom: 1px solid var(--bg-line); vertical-align: top; }
        .mct th { font-family: var(--ff-mono); font-size: .68rem; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-35); font-weight: 500; }
        .mct td { color: var(--ink-60); font-variant-numeric: tabular-nums; }
        .mct tr:last-child td { border-bottom: none; }
        .mct td a { color: var(--ink); font-weight: 600; text-decoration: none; }
        .mct td a:hover { color: var(--brand-teal); text-decoration: underline; }
      `}</style>
      <h2 id="mct-heading">{caption}</h2>
      <div className="mct__scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">Model</th>
              <th scope="col">Width</th>
              <th scope="col">Output / Speed</th>
              <th scope="col">Layers / Lanes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ key, label, f }) => (
              <tr key={key}>
                <td><Link href={`/products/${f.category}/${f.slug}`}>{label}</Link></td>
                <td>{width(f)}</td>
                <td>{output(f)}</td>
                <td>{layersOrLanes(f)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
