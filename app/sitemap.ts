import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/products";
import { locales, defaultLocale } from "@/i18n/routing";
import { localePath } from "@/lib/seo";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { getLiveNews } from "@/lib/liveNews";

// Built from the live CMS (not the bundled JSON) so every URL listed is one
// that actually renders — a slug renamed in the admin panel previously left
// the sitemap pointing Google at a not-found page. machines.json pages are
// omitted: they 301 to their catalogue family (next.config.mjs).
export const revalidate = 3600;

const STATIC_PATHS = [
  "",
  "/about",
  "/contact",
  "/production-line",
  "/products",
  "/products/printing",
  "/faq",
  "/legal",
  "/tools/extrusion-calculator",
];

/** hreflang alternates for a locale-agnostic path, keyed by locale
 *  (plus x-default) — matches the "as-needed" prefix strategy so en
 *  stays unprefixed while ar/hi get /ar and /hi. */
function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}${localePath(l, path)}`;
  }
  languages["x-default"] = `${SITE_URL}${localePath(defaultLocale, path)}`;
  return languages;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [{ categories, families }, { articles }] = await Promise.all([getLiveCatalogue(), getLiveNews()]);

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.7,
    alternates: { languages: languageAlternates(path) },
  }));

  // Categories
  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/products/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: { languages: languageAlternates(`/products/${c.slug}`) },
  }));

  // Product families
  const familyEntries: MetadataRoute.Sitemap = families.map((f) => ({
    url: `${SITE_URL}/products/${f.category}/${f.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: { languages: languageAlternates(`/products/${f.category}/${f.slug}`) },
  }));

  // News articles
  const newsEntries: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: { languages: languageAlternates(`/news/${a.slug}`) },
  }));

  // Deduplicate entries by URL
  const allEntries = [
    ...staticEntries,
    ...categoryEntries,
    ...familyEntries,
    ...newsEntries,
  ];

  const uniqueEntriesMap = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const entry of allEntries) {
    if (!uniqueEntriesMap.has(entry.url)) {
      uniqueEntriesMap.set(entry.url, entry);
    }
  }

  return Array.from(uniqueEntriesMap.values());
}
