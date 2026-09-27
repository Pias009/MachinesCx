import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { getLiveNews } from "@/lib/liveNews";

// Built from the live CMS (not the bundled JSON) so every URL listed is one
// that actually renders — a slug renamed in the admin panel previously left
// the sitemap pointing Google at a not-found page. machines.json pages are
// omitted: they 301 to their catalogue family (next.config.mjs).
//
// <lastmod> is always a real content date, never the generation time:
// Google ignores lastmod when every URL shares the same timestamp.
// English only — no hreflang alternates (see i18n/routing.ts).
export const revalidate = 3600;

/* Static pages → date of their last real content edit. Update the date
   whenever a page's visible content or its title/description changes. */
const STATIC_PAGES: Record<string, string> = {
  "": "2026-09-27",
  "/about": "2026-09-27",
  "/contact": "2026-09-23",
  "/inquiries": "2026-09-27",
  "/production-line": "2026-09-27",
  "/products": "2026-09-27",
  "/news": "2026-09-27",
  "/faq": "2026-09-27",
  "/legal": "2026-09-23",
  "/tools/extrusion-calculator": "2026-09-27",
};

// category pages gained the model comparison table on this date; bump
// alongside category copy edits (a newer product date also bumps it)
const CATEGORIES_UPDATED = "2026-09-27";

const latest = (...dates: (string | undefined)[]) =>
  dates.filter((d): d is string => !!d && !Number.isNaN(Date.parse(d))).sort().pop();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ categories, families }, { articles }] = await Promise.all([getLiveCatalogue(), getLiveNews()]);

  const familyDate = (f: (typeof families)[number]) => latest(f.updatedAt, f.seo?.updatedAt);

  const staticEntries: MetadataRoute.Sitemap = Object.entries(STATIC_PAGES).map(([path, date]) => ({
    url: `${SITE_URL}${path}`,
    lastModified: date,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/products/${c.slug}`,
    lastModified: latest(CATEGORIES_UPDATED, ...families.filter((f) => f.category === c.slug).map(familyDate)),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const familyEntries: MetadataRoute.Sitemap = families.map((f) => ({
    url: `${SITE_URL}/products/${f.category}/${f.slug}`,
    lastModified: familyDate(f),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const newsEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: a.date,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const unique = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const e of [...staticEntries, ...categoryEntries, ...familyEntries, ...newsEntries]) {
    if (!unique.has(e.url)) unique.set(e.url, e);
  }
  return Array.from(unique.values());
}
