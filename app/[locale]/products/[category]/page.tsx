import { notFound } from "next/navigation";
import FlexoPrintingPage from "@/components/FlexoPrintingPage";
import { categories, type CategorySlug } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata } from "@/lib/seo";
import { getMachineCategories, getMachineCategoryBySlug, getMachineProductsByCategory } from "@/lib/machinesData";
import CategoryPageClient from "./CategoryPageClient";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  const legacyCatParams = categories.map((c) => ({ category: c.slug }));
  const machineCatParams = getMachineCategories().map((c) => ({ category: c.slug }));
  return [...legacyCatParams, ...machineCatParams];
}

export async function generateMetadata({ params }: { params: { locale: string; category: string } }) {
  const { locale, category } = params;
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
    return <FlexoPrintingPage />;
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
      families={fams}
      allCategories={liveCategories}
    />
  );
}
