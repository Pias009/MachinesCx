// Maps machine images to each product's *current* main photo (set in the
// admin panel, hosted on Cloudinary). Plain module — safe on server and
// client. Old content (bundled JSON, CMS sections seeded from it, news
// articles) still points at the legacy /machines/<file> PNGs; those paths
// are upgraded to the live photo so a photo change in the admin shows up
// everywhere. Custom uploads (any non-/machines/ URL) are left untouched.
import type { NavCategory } from "@/lib/liveCatalogue";

export type ProductImageMap = Record<string, string>;

// legacy file name → product slug, where the file isn't named after the slug
// (taken from the old hard-coded flexo image tables)
const LEGACY_ALIASES: Record<string, string> = {
  "flexo-1": "flexo-2c", "flexo-1-nobg": "flexo-2c",
  "flexo-2": "flexo-4c", "flexo-2-nobg": "flexo-4c",
  "flexo-6c-nobg": "flexo-6c",
  "flexo-3": "flexo-8c",
  "flexo-4": "flexo-8c", "flexo-4-nobg": "flexo-8c",
  "flexo-5": "flexo-8c", "flexo-5-nobg": "flexo-8c",
};

const LEGACY_RE = /^\/machines\/([\w-]+)\.(?:png|jpe?g|webp)$/i;

export function buildImageMap(catalogue: NavCategory[]): ProductImageMap {
  const map: ProductImageMap = {};
  for (const c of catalogue) for (const f of c.families) if (f.image) map[f.slug] = f.image;
  return map;
}

/** Legacy /machines/<file> path → the matching product's live photo;
 *  anything else (Cloudinary uploads, non-machine images) is returned as-is. */
export function upgradeImage(src: string | null | undefined, map: ProductImageMap): string {
  if (!src) return "";
  const m = src.trim().match(LEGACY_RE);
  if (!m) return src;
  return map[LEGACY_ALIASES[m[1]] ?? m[1]] ?? src;
}

/** A product's live photo by slug; else the given fallback (upgraded if it's
 *  a legacy path); else the legacy file for that slug. */
export function productImage(slug: string, map: ProductImageMap, fallback?: string | null): string {
  return map[slug] ?? upgradeImage(fallback || `/machines/${slug}.png`, map);
}
