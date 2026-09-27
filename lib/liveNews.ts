// Server-only — never import this from a "use client" component. Kept out
// of lib/news.ts so client components that import from there (for
// types/helpers) never pull mongoose/mongodb into the browser bundle.
import { readSection } from "@/lib/cmsStore";
import { getNavCatalogue } from "@/lib/liveCatalogue";
import { buildImageMap, upgradeImage } from "@/lib/productImages";
import type { NewsData } from "@/lib/news";

/** Live news data from the CMS store (MongoDB), falling back to the bundled
 *  JSON if the DB is unreachable. Use in server components that render
 *  admin-edited article content. */
export async function getLiveNews(): Promise<NewsData> {
  const [data, catalogue] = await Promise.all([readSection("news") as Promise<NewsData>, getNavCatalogue()]);
  // articles seeded with legacy /machines/ photos show the product's
  // current admin photo instead; custom article images are untouched
  const images = buildImageMap(catalogue);
  // one brand spelling everywhere, whatever older DB copy still says
  const brand = (a: NewsData["articles"][number]) =>
    JSON.parse(JSON.stringify(a).replace(/Ashal machinery/gi, "Ashal Innomech").replace(/Innomach/g, "Innomech")) as typeof a;
  return { articles: (data.articles ?? []).map((a) => ({ ...brand(a), image: upgradeImage(a.image, images) })) };
}
