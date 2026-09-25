// Server-only — never import this from a "use client" component. Kept out
// of lib/products.ts so client components that import from there (for
// types/helpers) never pull mongoose/mongodb into the browser bundle.
import { unstable_cache } from "next/cache";
import { readSection, cmsTag } from "@/lib/cmsStore";
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

export interface NavFamily {
  slug: string;
  series: string;
  tagline: string;
  /** main product photo as set in the admin panel; null when none uploaded */
  image: string | null;
}

export interface NavCategory {
  slug: string;
  name: string;
  families: NavFamily[];
}

/** Slim catalogue for the site nav's hover menu — rendered on every page, so
 *  it's cached (and tagged, so an admin save to "products" refreshes it on
 *  the next request) and trimmed to what the menu shows instead of shipping
 *  the full catalogue to the browser. */
export const getNavCatalogue = unstable_cache(
  async (): Promise<NavCategory[]> => {
    const { categories: cats, families: fams } = await getLiveCatalogue();
    return cats.map((c) => ({
      slug: c.slug,
      name: c.name,
      families: fams
        .filter((f) => f.category === c.slug)
        .map((f) => ({
          slug: f.slug,
          series: f.series,
          tagline: f.tagline,
          image: f.images?.find((s) => s?.trim()) || f.image?.trim() || null,
        })),
    }));
  },
  ["nav-catalogue"],
  { tags: [cmsTag("products")], revalidate: 300 },
);
