import { notFound } from "next/navigation";
import Link from "next/link";
import {
  families,
  familyBySlug,
  categoryBySlug,
  familiesByCategory,
  type CategorySlug,
} from "@/lib/products";
import ProductDetail from "./ProductDetail";

export function generateStaticParams() {
  return families.map((f) => ({ category: f.category, slug: f.slug }));
}

export function generateMetadata({ params }: { params: { category: string; slug: string } }) {
  const f = familyBySlug(params.slug);
  return { title: f ? `${f.series} — Ashal Innomach` : "Product" };
}

export default function ProductPage({ params }: { params: { category: string; slug: string } }) {
  const f   = familyBySlug(params.slug);
  const cat = categoryBySlug(params.category);
  if (!f || !cat) notFound();

  const related = familiesByCategory(f.category as CategorySlug)
    .filter((r) => r.slug !== f.slug)
    .slice(0, 4);

  return <ProductDetail family={f} category={cat} related={related} />;
}
