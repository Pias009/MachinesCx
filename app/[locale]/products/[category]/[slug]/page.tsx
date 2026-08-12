import { notFound } from "next/navigation";
import { families, SITE_URL, BRAND, familyImage, type CategorySlug } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata, localePath } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "./ProductDetail";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return families.map((f) => ({ category: f.category, slug: f.slug }));
}

export async function generateMetadata({ params }: { params: { locale: string; category: string; slug: string } }) {
  const { locale, category, slug } = params;
  const { families: liveFamilies } = await getLiveCatalogue();
  const f = liveFamilies.find((x) => x.slug === slug);
  if (!f) return { title: "Product — Ashal Innomach" };

  const specLine = f.specs
    .slice(0, 3)
    .map((s) => `${s.label} ${s.values[0]}`)
    .join(" · ");
  const description = [f.tagline, specLine].filter(Boolean).join(" — ").slice(0, 160);

  return pageMetadata({
    locale,
    path: `/products/${category}/${slug}`,
    title: `${f.name} — Ashal Innomach`,
    description,
    image: f.images?.[0] ?? f.image,
  });
}

export default async function ProductPage({ params }: { params: { locale: string; category: string; slug: string } }) {
  const { categories, families: liveFamilies } = await getLiveCatalogue();

  const f   = liveFamilies.find((x) => x.slug === params.slug);
  const cat = categories.find((c) => c.slug === params.category);
  if (!f || !cat) notFound();

  const related = liveFamilies
    .filter((r) => r.category === (f.category as CategorySlug) && r.slug !== f.slug)
    .slice(0, 4);

  const url = `${SITE_URL}${localePath(params.locale, `/products/${params.category}/${params.slug}`)}`;
  const image = familyImage(f);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: f.name,
          description: f.tagline,
          url,
          image: image ? `${SITE_URL}${image}` : undefined,
          brand: { "@type": "Brand", name: BRAND },
          category: cat.name,
          model: f.models.join(", "),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: cat.name, item: `${SITE_URL}${localePath(params.locale, `/products/${params.category}`)}` },
            { "@type": "ListItem", position: 3, name: f.name, item: url },
          ],
        }}
      />
      <ProductDetail family={f} category={cat} related={related} />
    </>
  );
}
