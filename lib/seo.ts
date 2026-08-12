import type { Metadata } from "next";
import { SITE_URL, BRAND } from "@/lib/products";
import { locales, defaultLocale, type Locale } from "@/i18n/routing";

/** Builds the locale-prefixed absolute path for a route, matching the
 *  "as-needed" prefix strategy in i18n/routing.ts (en is unprefixed). */
export function localePath(locale: string, path: string): string {
  const clean = path === "" ? "" : path.startsWith("/") ? path : `/${path}`;
  return locale === defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** Canonical URL + hreflang alternates for a route, for spreading into
 *  a page's `metadata.alternates`. `path` is locale-agnostic, e.g. "/about"
 *  or "/products/film-blowing/abcde-2200". */
export function alternates(locale: string, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) {
    languages[l] = `${SITE_URL}${localePath(l, path)}`;
  }
  languages["x-default"] = `${SITE_URL}${localePath(defaultLocale, path)}`;

  return {
    canonical: `${SITE_URL}${localePath(locale, path)}`,
    languages,
  };
}

/** Shared page metadata: title, description, canonical/hreflang, and
 *  OG/Twitter overrides so shared links show page-specific info instead
 *  of the site-wide default set in the root layout. */
export function pageMetadata(opts: {
  locale: string;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const { locale, path, title, description, image } = opts;
  return {
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${localePath(locale, path)}`,
      siteName: BRAND,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
