// Server-only — never import this from a "use client" component. Kept out
// of lib/news.ts so client components that import from there (for
// types/helpers) never pull mongoose/mongodb into the browser bundle.
import { readSection } from "@/lib/cmsStore";
import type { NewsData } from "@/lib/news";

/** Live news data from the CMS store (MongoDB), falling back to the bundled
 *  JSON if the DB is unreachable. Use in server components that render
 *  admin-edited article content. */
export async function getLiveNews(): Promise<NewsData> {
  const data = (await readSection("news")) as NewsData;
  return { articles: data.articles ?? [] };
}
