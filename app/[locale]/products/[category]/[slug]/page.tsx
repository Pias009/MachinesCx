import { notFound } from "next/navigation";
import { families, familyBySlug, type CategorySlug } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return families.map((f) => ({ category: f.category, slug: f.slug }));
}

export function generateMetadata({ params }: { params: { category: string; slug: string } }) {
  const f = familyBySlug(params.slug);
  return { title: f ? `${f.series} — Ashal Innomach` : "Product" };
}

export default async function ProductPage({ params }: { params: { category: string; slug: string } }) {
  const { categories, families: liveFamilies } = await getLiveCatalogue();

  const f   = liveFamilies.find((x) => x.slug === params.slug);
  const cat = categories.find((c) => c.slug === params.category);
  if (!f || !cat) notFound();

  const related = liveFamilies
    .filter((r) => r.category === (f.category as CategorySlug) && r.slug !== f.slug)
    .slice(0, 4);

  return <ProductDetail family={f} category={cat} related={related} />;
}
