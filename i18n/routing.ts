import { defineRouting } from "next-intl/routing";

// English only. The ar/hi locales were removed 2026-09-27: their pages had
// English titles/bodies under lang="ar"/"hi", so Google indexed them as
// duplicates. /ar/* and /hi/* 301 to English (next.config.mjs). Re-add a
// locale only with fully human-translated title, description, H1 and body,
// and restore hreflang in lib/seo.ts + app/sitemap.ts at the same time.
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/* right-to-left locales — none while the site is English-only */
export const rtlLocales: Locale[] = [];

export const routing = defineRouting({
  locales,
  defaultLocale,
  // english stays un-prefixed ("/products") so existing links/SEO don't break
  localePrefix: "as-needed",
  // no Accept-Language redirects or locale cookie — there is only one locale
  localeDetection: false,
});
