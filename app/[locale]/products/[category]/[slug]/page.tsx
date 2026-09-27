import { notFound } from "next/navigation";
import { families, SITE_URL, BRAND, LEGAL_NAME, familyImage, familyImages, type CategorySlug, type ProductFamily, type Category } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata, localePath } from "@/lib/seo";
import { ORG_ID } from "@/lib/siteConfig";
import { DOWNSTREAM } from "@/lib/productSeo";
import { getMachineProductBySlug, getMachineCategoryBySlug, getRelatedArticlesForMachine } from "@/lib/machinesData";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "./ProductDetail";

export const revalidate = 3600;

export function generateStaticParams() {
  // machines.json products 301 to their catalogue family (next.config.mjs)
  return families.map((f) => ({ category: f.category, slug: f.slug }));
}

export async function generateMetadata({ params }: { params: { locale: string; category: string; slug: string } }) {
  const { locale, category, slug } = params;
  const { families: liveFamilies } = await getLiveCatalogue();
  const f = liveFamilies.find((x) => x.slug === slug);
  const mProduct = getMachineProductBySlug(slug);

  if (!f && !mProduct) return { title: `Industrial Machinery Manufacturer | ${BRAND}` };

  // explicit per-product fields (lib/productSeo.ts), used verbatim — no
  // suffixing or truncation; the fallbacks only cover a product added in
  // the CMS that has no entry there yet
  const title = f?.seo?.title || f?.seoData?.metaTitle || mProduct?.seoTitle || f?.name || mProduct?.name || slug;
  const description = f?.seo?.description || f?.seoData?.metaDescription || mProduct?.metaDescription || f?.tagline || "";

  const modelNumber = f?.seo?.model || mProduct?.model || f?.models?.[0] || f?.series || slug;

  const meta = pageMetadata({
    locale,
    path: `/products/${category}/${slug}`,
    title,
    description,
    image: f
      ? f.images?.[0] ?? f.image
      : liveFamilies.find((x) => x.slug === mProduct?.familySlug)?.images?.[0],
  });

  return {
    ...meta,
    keywords: f?.seoData?.focusKeywords || [
      mProduct?.name || f?.name || "",
      modelNumber,
      modelNumber.replace(/-/g, " "),
      category,
      "machinery manufacturer",
      "china machinery factory",
      BRAND,
      LEGAL_NAME,
    ],
  };
}

export default async function ProductPage({ params }: { params: { locale: string; category: string; slug: string } }) {
  const { categories: liveCategories, families: liveFamilies } = await getLiveCatalogue();

  let f = liveFamilies.find((x) => x.slug === params.slug);
  let cat = liveCategories.find((c) => c.slug === params.category);

  const mProduct = getMachineProductBySlug(params.slug);
  const mCat = getMachineCategoryBySlug(params.category);

  if (!f && mProduct) {
    // Map machine product from app/data/machines.json into ProductFamily format
    const specRows = Object.entries(mProduct.specs).map(([label, val]) => ({
      label,
      values: [val],
    }));

    f = {
      slug: mProduct.slug,
      category: mProduct.category as CategorySlug,
      series: mProduct.model,
      name: mProduct.name,
      tagline: mProduct.metaDescription,
      models: [mProduct.model],
      specs: specRows,
      // machines.json has no photos of its own — borrow the linked catalogue
      // family's, else familyImage() guesses /machines/<slug>.png and 404s
      images: (() => {
        const linked = liveFamilies.find((x) => x.slug === mProduct.familySlug);
        return linked ? familyImages(linked) : undefined;
      })(),
      seoData: {
        wordCount: 800,
        overviewHeading: `Engineered Overview — ${mProduct.name}`,
        metaTitle: mProduct.seoTitle,
        metaDescription: mProduct.metaDescription,
        focusKeywords: [mProduct.name, mProduct.model, mProduct.model.replace(/-/g, " "), mProduct.category, BRAND, "Manufacturer"],
        technicalArchitecture: `${mProduct.name} (Model: ${mProduct.model}) engineered by ${LEGAL_NAME} Key features: ${mProduct.features.join("; ")}.`,
        applicationsAndMaterials: Object.entries(mProduct.specs).map(([k, v]) => `${k}: ${v}`).join(", "),
        targetIndustries: ["Plastic Packaging Manufacturing", "Industrial Extrusion & Converting"],
        engineeringFeatures: mProduct.features.join(". "),
        keyInnovations: mProduct.features.map((feat) => ({ title: "Key Feature", description: feat })),
        utilityRequirements: mProduct.specs["Power Supply"] || "380V / 3PH / 50Hz",
        maintenanceProtocol: "Standard factory maintenance protocol applies.",
        faqs: (mProduct.faqs && mProduct.faqs.length > 0) ? mProduct.faqs : [
          {
            question: `What are the key specs of ${mProduct.name} (Model ${mProduct.model})?`,
            answer: Object.entries(mProduct.specs).map(([k, v]) => `${k}: ${v}`).join(", "),
          },
        ],
        commercialGuide: `Contact ${LEGAL_NAME} for factory-direct quotes, machine customization, and global commissioning support.`,
      },
    };
  }

  if (!cat && mCat) {
    cat = {
      slug: mCat.slug as CategorySlug,
      name: mCat.name,
      tagline: mCat.metaTitle,
      blurb: mCat.metaDescription,
    };
  }

  if (!f || !cat) notFound();

  // ≥3 related models: up to 2 from the same category, then the matching
  // downstream machine(s) — film blowing → printing → bag making
  const sameCat = liveFamilies.filter((r) => r.category === f!.category && r.slug !== f!.slug);
  const downstream = (DOWNSTREAM[f.category] ?? [])
    .map((c) => liveFamilies.find((r) => r.category === c))
    .filter((r): r is ProductFamily => !!r);
  // a category with one model (recycling) tops up from its downstream ones
  const moreDownstream = liveFamilies.filter((r) => (DOWNSTREAM[f!.category] ?? []).includes(r.category));
  const related = Array.from(
    new Map([...sameCat.slice(0, 2), ...downstream, ...sameCat.slice(2), ...moreDownstream].map((r) => [r.slug, r])).values(),
  ).slice(0, 4);

  const url = `${SITE_URL}${localePath(params.locale, `/products/${params.category}/${params.slug}`)}`;
  const image = familyImage(f);

  const exactModel = f.seo?.model || mProduct?.model || f.models[0] || f.series || f.slug;
  const pr = f.priceRange;
  const hasPrice = !!pr && pr.lowPrice > 0 && pr.highPrice >= pr.lowPrice && !!pr.currency?.trim();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: f.seo?.h1 || f.name,
    description: f.seo?.description || f.seoData?.metaDescription || f.tagline,
    url,
    // most product photos are absolute Cloudinary URLs — only prefix local paths
    image: image ? (image.startsWith("/") ? `${SITE_URL}${image}` : image) : undefined,
    // one Organization node site-wide (layout.tsx) — referenced, not repeated
    brand: { "@id": ORG_ID },
    manufacturer: { "@id": ORG_ID },
    category: cat.name,
    model: exactModel,
    mpn: exactModel,
    sku: exactModel,
    // Offers only from a real, owner-entered FOB range (product.priceRange) —
    // never a placeholder price. Never aggregateRating/review markup.
    ...(hasPrice && {
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: pr!.currency,
        lowPrice: pr!.lowPrice,
        highPrice: pr!.highPrice,
        offerCount: f.models.length,
        availability: "https://schema.org/InStock",
        seller: { "@id": ORG_ID },
      },
    }),
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

  const machineVideo = mProduct?.video;
  const videoSchema = machineVideo ? {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: machineVideo.title,
    description: machineVideo.description,
    thumbnailUrl: machineVideo.thumbnailUrl,
    uploadDate: machineVideo.uploadDate,
    duration: machineVideo.duration,
    contentUrl: `https://www.youtube.com/watch?v=${machineVideo.youtubeId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${machineVideo.youtubeId}`,
    publisher: { "@id": ORG_ID },
  } : null;

  const relatedArticles = getRelatedArticlesForMachine(params.slug);

  return (
    <>
      <JsonLd data={productSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      {videoSchema && <JsonLd data={videoSchema} />}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: cat.name, item: `${SITE_URL}${localePath(params.locale, `/products/${params.category}`)}` },
            { "@type": "ListItem", position: 3, name: f.seo?.h1 || f.name, item: url },
          ],
        }}
      />
      <ProductDetail family={f} category={cat} related={related} relatedArticles={relatedArticles} machineVideo={machineVideo} />
    </>
  );
}
