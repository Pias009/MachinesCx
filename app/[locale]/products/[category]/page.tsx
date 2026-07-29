import { notFound } from "next/navigation";
import FlexoPrintingPage from "@/components/FlexoPrintingPage";
import { categories, categoryBySlug, type CategorySlug } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import CategoryPageClient from "./CategoryPageClient";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const c = categoryBySlug(params.category);
  return { title: c ? `${c.name} — Ashal Innomach` : "Catalogue" };
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
