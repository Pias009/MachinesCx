// ---------------------------------------------------------------------------
// Condenses the live product catalogue (data/products.json, via lib/products.ts)
// into a compact text block used as grounding context for the ASHA chat agent.
// Reads the same data the admin panel edits, so a newly added machine is
// answerable immediately — no separate ingestion/training step.
// ---------------------------------------------------------------------------
import { BRAND, categories, families, type ProductFamily } from "@/lib/products";

function describeFamily(f: ProductFamily): string {
  const lines: string[] = [];
  lines.push(`### ${f.name} (series ${f.series}, category: ${f.category})`);
  lines.push(`Slug: ${f.slug}`);
  if (f.tagline) lines.push(`Tagline: ${f.tagline}`);
  if (f.materials) lines.push(`Materials: ${f.materials}`);
  lines.push(`Models: ${f.models.join(", ")}`);
  if (f.specs?.length) {
    lines.push("Specs:");
    for (const row of f.specs) {
      const pairs = f.models.map((m, i) => `${m}=${row.values[i] ?? "-"}`).join(", ");
      lines.push(`- ${row.label}: ${pairs}`);
    }
  }
  if (f.installation?.length) {
    lines.push(`Setup steps: ${f.installation.map(s => s.title).join(" → ")}`);
  }
  if (f.deliveryGuide?.length) {
    lines.push(`Delivery timeline: ${f.deliveryGuide.map(d => `${d.label} (${d.duration})`).join(" → ")}`);
  }
  return lines.join("\n");
}

/** Builds the full catalogue knowledge block, grouped by category. Rebuilt
 *  on every chat request from live data, so admin edits apply instantly. */
export function buildCatalogueContext(): string {
  const parts: string[] = [];
  parts.push(`${BRAND} — full machine catalogue (${families.length} product families).`);

  for (const cat of categories) {
    const inCat = families.filter(f => f.category === cat.slug);
    if (inCat.length === 0) continue;
    parts.push(`\n## Category: ${cat.name} — ${cat.tagline}\n${cat.blurb}`);
    for (const f of inCat) parts.push(describeFamily(f));
  }

  return parts.join("\n\n");
}
