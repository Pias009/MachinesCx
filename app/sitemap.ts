import type { MetadataRoute } from "next";
import { SITE_URL, categories, families } from "@/lib/products";
import { locales, defaultLocale } from "@/i18n/routing";
import { localePath } from "@/lib/seo";
import newsData from "@/data/news.json";
import { getMachineCategories, getMachineProducts } from "@/lib/machinesData";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Static pages
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1.0 : 0.7,
    alternates: { languages: languageAlternates(path) },
  }));

  // Categories from legacy productsData
  const legacyCategoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/products/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: { languages: languageAlternates(`/products/${c.slug}`) },
  }));

  // Categories from app/data/machines.json
  const machineCategories = getMachineCategories();
  const machineCategoryEntries: MetadataRoute.Sitemap = machineCategories.map((c) => ({
    url: `${SITE_URL}/products/${c.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
    alternates: { languages: languageAlternates(`/products/${c.slug}`) },
  }));

  // Families from legacy productsData
  const familyEntries: MetadataRoute.Sitemap = families.map((f) => ({
    url: `${SITE_URL}/products/${f.category}/${f.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
    alternates: { languages: languageAlternates(`/products/${f.category}/${f.slug}`) },
  }));

  // Dynamic machine products from app/data/machines.json
  const machineProducts = getMachineProducts();
  const machineProductEntries: MetadataRoute.Sitemap = machineProducts.map((p) => ({
    url: `${SITE_URL}/products/${p.category}/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.95,
    alternates: { languages: languageAlternates(`/products/${p.category}/${p.slug}`) },
  }));

  // News articles
  const newsEntries: MetadataRoute.Sitemap = (newsData.articles as { slug: string }[]).map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
    alternates: { languages: languageAlternates(`/news/${a.slug}`) },
  }));

  // Deduplicate entries by URL
  const allEntries = [
    ...staticEntries,
    ...legacyCategoryEntries,
    ...machineCategoryEntries,
    ...familyEntries,
    ...machineProductEntries,
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
