import { connectDB } from "@/lib/mongodb";
import CmsSection from "@/models/CmsSection";

import productsJson from "@/data/products.json";
import homeHeroJson from "@/data/home-hero.json";
import machineCatalogJson from "@/data/machine-catalog.json";
import productionLineJson from "@/data/production-line.json";
import flexoStripJson from "@/data/flexo-strip.json";
import printingShowcaseJson from "@/data/printing-showcase.json";
import scrollhomeBagsJson from "@/data/scrollhome-bags.json";
import newsJson from "@/data/news.json";

export const CMS_SECTIONS = [
  "products",
  "home-hero",
  "machine-catalog",
  "production-line",
  "flexo-strip",
  "printing-showcase",
  "scrollhome-bags",
  "news",
] as const;

export type CmsSection = (typeof CMS_SECTIONS)[number];

export function isCmsSection(s: string): s is CmsSection {
  return (CMS_SECTIONS as readonly string[]).includes(s);
}

// Bundled defaults — used as a fallback when a section has not been seeded
// into the database yet, so new sections are editable/visible immediately.
const BUNDLED_DEFAULTS: Record<CmsSection, unknown> = {
  "products": productsJson,
  "home-hero": homeHeroJson,
  "machine-catalog": machineCatalogJson,
  "production-line": productionLineJson,
  "flexo-strip": flexoStripJson,
  "printing-showcase": printingShowcaseJson,
  "scrollhome-bags": scrollhomeBagsJson,
  "news": newsJson,
};

export async function readSection(section: CmsSection): Promise<unknown> {
  try {
    await connectDB();
    const doc = await CmsSection.findOne({ section }).lean();
    if (doc) return doc.data;
  } catch (e) {
    console.error(`CMS: DB unavailable for "${section}", using bundled fallback:`, e);
  }
  const fallback = BUNDLED_DEFAULTS[section];
  if (fallback !== undefined) return fallback;
  throw new Error(`section "${section}" not found`);
}

export async function writeSection(section: CmsSection, data: unknown): Promise<void> {
  if (typeof data !== "object" || data === null) throw new Error("payload must be an object");
  try {
    await connectDB();
    await CmsSection.updateOne(
      { section },
      { $set: { data, updatedAt: new Date() } },
      { upsert: true },
    );
  } catch (e) {
    console.error(`CMS: failed to write section "${section}":`, e);
    throw new Error("Database write failed. Check server logs.");
  }
}
