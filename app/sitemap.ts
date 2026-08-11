import type { MetadataRoute } from "next";
import { SITE_URL, categories, families } from "@/lib/products";
import newsData from "@/data/news.json";

const STATIC_PATHS = [
  "",
  "/about",
  "/contact",
  "/production-line",
  "/products",
  "/products/printing",
  "/legal",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/products/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const familyEntries: MetadataRoute.Sitemap = families.map((f) => ({
    url: `${SITE_URL}/products/${f.category}/${f.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const newsEntries: MetadataRoute.Sitemap = (newsData.articles as { slug: string }[]).map((a) => ({
    url: `${SITE_URL}/news/${a.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.4,
  }));

  return [...staticEntries, ...categoryEntries, ...familyEntries, ...newsEntries];
}
