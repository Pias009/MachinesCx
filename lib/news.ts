// ---------------------------------------------------------------------------
// News / blog article types + helpers. Content is admin-authored via the CMS
// (data/news.json bundled default, live-edited through MongoDB — same
// pattern as lib/products.ts). This file stays client-safe (no mongoose
// import) since components import it directly for types/formatting.
// ---------------------------------------------------------------------------

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

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Links the first mention of each model name in the article to its
 *  product page (paragraphs and list items only, never headings). Skips
 *  codes embedded in longer ones ("ABA" inside "CX-ABA") and one model
 *  family linked twice under two spellings. */
function linkFirstMentions(text: string, linked: Set<string>, mentions: [string, string][]): string {
  let out = text;
  for (const [code, href] of mentions) {
    if (linked.has(href)) continue;
    const re = new RegExp(`(?<![\\w-])${escapeRe(code)}(?![\\w-])`);
    // don't match inside an <a> we already inserted in this block
    const m = re.exec(out);
    if (!m) continue;
    const before = out.slice(0, m.index);
    if (before.lastIndexOf("<a ") > before.lastIndexOf("</a>")) continue;
    out = `${before}<a href="${href}">${m[0]}</a>${out.slice(m.index + m[0].length)}`;
    linked.add(href);
  }
  return out;
}

/** Renders a block list to the same HTML shape the article page's
 *  `.article-body` CSS already styles (p / h3 / ul·li / strong / a).
 *  Pass `mentions` to link the first mention of each model name. */
export function renderNewsBody(blocks: NewsBlock[], mentions: [string, string][] = []): string {
  const linked = new Set<string>();
  const body = (s: string) => (mentions.length ? linkFirstMentions(inline(s), linked, mentions) : inline(s));
  return (blocks ?? [])
    .map((b) => {
      if (b.kind === "heading") return `<h3>${inline(b.text)}</h3>`;
      if (b.kind === "list") return `<ul>${b.items.map((i) => `<li>${body(i)}</li>`).join("")}</ul>`;
      return `<p>${body(b.text)}</p>`;
    })
    .join("\n");
}

export const articleBySlug = (data: NewsData, slug: string) =>
  data.articles.find((a) => a.slug === slug);

export const latestArticles = (data: NewsData, n = 4) =>
  [...data.articles].sort((a, b) => b.date.localeCompare(a.date)).slice(0, n);
