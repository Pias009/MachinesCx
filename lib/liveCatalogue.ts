// Server-only — never import this from a "use client" component. Kept out
// of lib/products.ts so client components that import from there (for
// types/helpers) never pull mongoose/mongodb into the browser bundle.
import { readSection } from "@/lib/cmsStore";
import { categories, families, type Catalogue } from "@/lib/products";

/** Live catalogue from the CMS store (MongoDB), falling back to the bundled
 *  JSON if the DB is unreachable. Use in server components that render
 *  admin-edited product content. */
export async function getLiveCatalogue(): Promise<Catalogue> {
  const data = (await readSection("products")) as Catalogue;
  return {
    categories: data.categories ?? categories,
    families: data.families ?? families,
  };
}
