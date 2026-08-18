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
  if (!f) return { title: "Product — Wenzhou Ashal Innomach" };

  const metaTitle = f.seoData?.metaTitle || `${f.name} | Specs & Output | Ashal Machinery`;
  const metaDesc = f.seoData?.metaDescription || [f.tagline, f.specs.slice(0, 2).map((s) => `${s.label} ${s.values[0]}`).join(" · ")].filter(Boolean).join(" — ").slice(0, 160);

  const meta = pageMetadata({
    locale,
    path: `/products/${category}/${slug}`,
    title: metaTitle,
    description: metaDesc,
    image: f.images?.[0] ?? f.image,
  });

  return {
    ...meta,
    keywords: f.seoData?.focusKeywords || [f.name, category, "machinery", BRAND],
  };
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

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: f.name,
    description: f.seoData?.metaDescription || f.tagline,
    url,
    image: image ? `${SITE_URL}${image}` : undefined,
    brand: { "@type": "Brand", name: BRAND, url: SITE_URL },
    manufacturer: { "@type": "Organization", name: BRAND, url: SITE_URL },
    category: cat.name,
    model: f.models.join(", "),
    mpn: f.slug,
    sku: f.slug,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      url,
      seller: { "@type": "Organization", name: BRAND, url: SITE_URL },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "28",
      bestRating: "5",
      worstRating: "1",
    },
    additionalProperty: f.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.values.join(", "),
    })),
  };

  const faqSchema = f.seoData?.faqs && f.seoData.faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: f.seoData.faqs.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  } : null;

  const howToSchema = f.installation && f.installation.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Install and Setup ${f.name}`,
    description: `Installation, electrical hookup, and commissioning procedure for ${f.name}.`,
    step: f.installation.map((step, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: step.title,
      text: step.detail,
    })),
  } : null;

  return (
    <>
      <JsonLd data={productSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {howToSchema && <JsonLd data={howToSchema} />}
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
