import { notFound } from "next/navigation";
import FlexoPrintingPage from "@/components/FlexoPrintingPage";
import { categories, type CategorySlug } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata } from "@/lib/seo";
import CategoryPageClient from "./CategoryPageClient";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: { locale: string; category: string } }) {
  const { locale, category } = params;
  const { categories: liveCategories } = await getLiveCatalogue();
  const c = liveCategories.find((x) => x.slug === category);
  if (!c) return { title: "Catalogue — Ashal Innomech" };

  return pageMetadata({
    locale,
    path: `/products/${category}`,
    title: `${c.name} — Ashal Innomech`,
    description: c.blurb,
  });
}

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { categories: liveCategories, families: liveFamilies } = await getLiveCatalogue();

  const cat = liveCategories.find((c) => c.slug === params.category);
  if (!cat) notFound();

  if (cat.slug === "printing") return <FlexoPrintingPage />;

  const fams = liveFamilies.filter((f) => f.category === (cat.slug as CategorySlug));

  return (
    <CategoryPageClient
      category={cat}
      families={fams}
      allCategories={liveCategories}
    />
  );
}
