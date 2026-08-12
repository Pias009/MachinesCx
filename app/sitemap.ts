import type { MetadataRoute } from "next";
import { SITE_URL, categories, families } from "@/lib/products";
import { locales, defaultLocale } from "@/i18n/routing";
import { localePath } from "@/lib/seo";
import newsData from "@/data/news.json";

const STATIC_PATHS = [
  "",
  "/about",
  "/contact",
  "/production-line",
  "/products",
  "/products/printing",
  "/faq",
  "/legal",
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

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
    alternates: { languages: languageAlternates(path) },
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/products/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
    alternates: { languages: languageAlternates(`/products/${c.slug}`) },
  }));

  const familyEntries: MetadataRoute.Sitemap = families.map((f) => ({
    url: `${SITE_URL}/products/${f.category}/${f.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
    alternates: { languages: languageAlternates(`/products/${f.category}/${f.slug}`) },
  }));

  const newsEntries: MetadataRoute.Sitemap = (newsData.articles as { slug: string }[]).map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.4,
    alternates: { languages: languageAlternates(`/news/${a.slug}`) },
  }));

  return [...staticEntries, ...categoryEntries, ...familyEntries, ...newsEntries];
}
