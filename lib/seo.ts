import type { Metadata } from "next";
import { SITE_URL, BRAND } from "@/lib/products";
import { defaultLocale } from "@/i18n/routing";

/** Builds the locale-prefixed absolute path for a route, matching the
 *  "as-needed" prefix strategy in i18n/routing.ts (en is unprefixed). */
export function localePath(locale: string, path: string): string {
  const clean = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** Self-referencing absolute canonical for a route, for spreading into a
 *  page's `metadata.alternates`. No hreflang: the site is English-only
 *  (see i18n/routing.ts) — re-add `languages` only alongside real
 *  translations. `path` is e.g. "/about" or "/products/film-blowing/abcde-2200". */
export function alternates(locale: string, path: string): Metadata["alternates"] {
  return {
    canonical: `${SITE_URL}${localePath(locale, path)}`,
  };
}

// 1200×630 site share image — the default og:image/twitter:image for any
// page without its own photo (the homepage included)
export const DEFAULT_OG_IMAGE = { url: `${SITE_URL}/og/home.jpg`, width: 1200, height: 630 };

/** Shared page metadata: title, description, canonical, and OG/Twitter
 *  overrides so shared links show page-specific info. Title/description
 *  are used verbatim — never suffixed or truncated here, so they must be
 *  written to length at the source (lib/pageSeo.ts, lib/productSeo.ts). */
export function pageMetadata(opts: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const { locale, path, title, description, image } = opts;
  const og = image
    ? { url: image.startsWith("/") ? `${SITE_URL}${image}` : image }
    : DEFAULT_OG_IMAGE;
  return {
    // absolute: bypasses any parent title.template so <title> is exact
    title: { absolute: title },
    description,
    alternates: alternates(locale, path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localePath(locale, path)}`,
      siteName: BRAND,
      images: [og],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [og.url],
    },
  };
}
