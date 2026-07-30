// ---------------------------------------------------------------------------
// News / blog article types + helpers. Content is admin-authored via the CMS
// (data/news.json bundled default, live-edited through MongoDB — same
// pattern as lib/products.ts). This file stays client-safe (no mongoose
// import) since components import it directly for types/formatting.
// ---------------------------------------------------------------------------

import localNewsEn from "@/data/news.json";
import localNewsAr from "@/data/news.ar.json";
import localNewsHi from "@/data/news.hi.json";

/** One block of the article body — admins compose these in the CMS editor
 *  instead of writing raw HTML. Rendered in order on the article page. */
export type NewsBlock =
  | { kind: "heading"; text: string }
  | { kind: "paragraph"; text: string } // supports **bold** markdown-lite
  | { kind: "list"; items: string[] };  // each item supports **bold**

export interface NewsArticle {
  slug: string;
  title: string;
  date: string;          // ISO "YYYY-MM-DD"
  category: string;
  excerpt: string;
  body: NewsBlock[];
  image: string;          // /uploads/... or /machines/... or /news/...
  tags: string[];
  links?: { label: string; url: string }[];
}

export interface NewsData {
  articles: NewsArticle[];
}

/** Turns **bold** markdown-lite into <strong> — the only inline formatting
 *  the article body supports, kept intentionally simple for admin authoring. */
const inline = (s: string) =>
  s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

/** Renders a block list to the same HTML shape the article page's
 *  `.article-body` CSS already styles (p / h3 / ul·li / strong). */
export function renderNewsBody(blocks: NewsBlock[]): string {
  return (blocks ?? [])
    .map((b) => {
      if (b.kind === "heading") return `<h3>${inline(b.text)}</h3>`;
      if (b.kind === "list") return `<ul>${b.items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`;
      return `<p>${inline(b.text)}</p>`;
    })
    .join("\n");
}

export const articleBySlug = (data: NewsData, slug: string) =>
  data.articles.find((a) => a.slug === slug);

export const latestArticles = (data: NewsData, n = 4) =>
  [...data.articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);

/* Locale-aware bundled defaults, mirroring the HERO_BY_LOCALE pattern in
   components/HeroSplash.tsx. The CMS/DB only stores one (English-shaped)
   copy of "news" (see lib/cmsStore.ts + lib/liveNews.ts), so a live admin
   edit always shows in English regardless of locale — these locale
   fallbacks only cover the case where no DB override exists yet, i.e. the
   bundled JSON default that readSection("news") itself falls back to. */
const NEWS_BY_LOCALE: Record<string, NewsData> = {
  en: localNewsEn as NewsData,
  ar: localNewsAr as NewsData,
  hi: localNewsHi as NewsData,
};

/** Bundled (non-CMS) article set for a given locale, falling back to English
 *  if the locale has no local translation or isn't recognized. Use this for
 *  locale-aware rendering of the static fallback data; live CMS-edited
 *  content (via getLiveNews in lib/liveNews.ts) is English-only regardless
 *  of locale until the CMS itself becomes locale-aware. */
export function getArticlesForLocale(locale: string): NewsArticle[] {
  const data = NEWS_BY_LOCALE[locale] ?? NEWS_BY_LOCALE.en;
  return data.articles ?? NEWS_BY_LOCALE.en.articles;
}
