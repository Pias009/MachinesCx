import { notFound } from "next/navigation";
import FlexoPrintingPage from "@/components/FlexoPrintingPage";
import { categories, categoryBySlug, familiesByCategory, type CategorySlug } from "@/lib/products";
import CategoryPageClient from "./CategoryPageClient";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export function generateMetadata({ params }: { params: { category: string } }) {
  const c = categoryBySlug(params.category);
  return { title: c ? `${c.name} — Ashal Innomach` : "Catalogue" };
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const cat = categoryBySlug(params.category);
  if (!cat) notFound();

  if (cat.slug === "printing") return <FlexoPrintingPage />;

  const fams = familiesByCategory(cat.slug as CategorySlug);

  return (
    <CategoryPageClient
      category={cat}
      families={fams}
      allCategories={categories}
    />
  );
}
