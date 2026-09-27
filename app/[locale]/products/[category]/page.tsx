import { notFound } from "next/navigation";
import FlexoPrintingPage from "@/components/FlexoPrintingPage";
import { categories, type CategorySlug } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata } from "@/lib/seo";
import { PAGE_SEO, staticPageMetadata } from "@/lib/pageSeo";
import { getMachineCategoryBySlug } from "@/lib/machinesData";
import CategoryPageClient from "./CategoryPageClient";

export const revalidate = 3600;

export function generateStaticParams() {
  // machines.json categories 301 to their catalogue category (next.config.mjs)
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: { locale: string; category: string } }) {
  const { locale, category } = params;
  if (PAGE_SEO[`/products/${category}`]) return staticPageMetadata(`/products/${category}`, locale);
  const { categories: liveCategories } = await getLiveCatalogue();
  const c = liveCategories.find((x) => x.slug === category);
  const mCat = getMachineCategoryBySlug(category);

  if (!c && !mCat) return { title: "Catalogue — Ashal Innomech" };

  const title = mCat?.metaTitle || `${c?.name || mCat?.name} — Ashal Innomech`;
  const description = mCat?.metaDescription || c?.blurb || "";

  return pageMetadata({
    locale,
    path: `/products/${category}`,
    title,
    description,
  });
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { categories: liveCategories, families: liveFamilies } = await getLiveCatalogue();

  const cat = liveCategories.find((c) => c.slug === params.category);
  const mCat = getMachineCategoryBySlug(params.category);

  if (!cat && !mCat) notFound();

  if (params.category === "printing" || params.category === "flexo-printing-machines") {
    return <FlexoPrintingPage families={liveFamilies.filter((f) => f.category === "printing")} h1={PAGE_SEO["/products/printing"].h1} />;
  }

  const fams = liveFamilies.filter((f) => f.category === (params.category as CategorySlug));

  // Construct fallback Category object if only found in machines.json
  const currentCategory = cat || {
    slug: mCat!.slug as CategorySlug,
    name: mCat!.name,
    tagline: mCat!.metaTitle,
    blurb: mCat!.metaDescription,
  };

  return (
    <CategoryPageClient
      category={currentCategory}
      h1={PAGE_SEO[`/products/${params.category}`]?.h1 ?? currentCategory.name}
      families={fams}
      allCategories={liveCategories}
    />
  );
}
