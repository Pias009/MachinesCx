import { notFound } from "next/navigation";
import { families, SITE_URL, BRAND, LEGAL_NAME, familyImage, familyImages, type CategorySlug, type ProductFamily, type Category } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata, localePath } from "@/lib/seo";
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

  // Lead with the buyer's search term (set per product in the CMS), keep
  // it within Google's ~60-char display width, and tie it to one brand name.
  let title = f?.seoData?.metaTitle || mProduct?.seoTitle || f?.name || mProduct?.name || slug;
  if (!title.includes("Ashal") && title.length + BRAND.length + 3 <= 65) {
    title = `${title} | ${BRAND}`;
  }

  const description = mProduct?.metaDescription || f?.seoData?.metaDescription || [f?.tagline, f?.specs.slice(0, 2).map((s) => `${s.label} ${s.values[0]}`).join(" · ")].filter(Boolean).join(" — ").slice(0, 160);

  const modelNumber = mProduct?.model || f?.models?.[0] || f?.series || slug;

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

  const related = liveFamilies
    .filter((r) => r.category === (f!.category as CategorySlug) && r.slug !== f!.slug)
    .slice(0, 4);

  const url = `${SITE_URL}${localePath(params.locale, `/products/${params.category}/${params.slug}`)}`;
  const image = familyImage(f);

  const exactModel = mProduct?.model || f.models[0] || f.series || f.slug;
  const reviews = (f.reviews ?? []).filter((r) => r.rating >= 1 && r.rating <= 5 && r.text?.trim());

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: f.name,
    description: f.seoData?.metaDescription || f.tagline,
    url,
    // most product photos are absolute Cloudinary URLs — only prefix local paths
    image: image ? (image.startsWith("/") ? `${SITE_URL}${image}` : image) : undefined,
    brand: { "@type": "Brand", name: BRAND, url: SITE_URL },
    manufacturer: {
      "@type": "Organization",
      name: LEGAL_NAME,
      url: SITE_URL,
      email: "ashal@ashalinnomech.com",
      telephone: "+86 159 8877 5831",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Wenzhou, Zhejiang",
        addressCountry: "China",
      },
    },
    category: cat.name,
    model: exactModel,
    mpn: exactModel,
    sku: exactModel,
    // No Offer: machines are quoted per order, and a placeholder price
    // (previously a fixed US$100,000 on every product) violates Google's
    // structured-data policy. Rating/reviews only when real admin-entered
    // reviews exist — they're rendered visibly on the page, as Google requires.
    ...(reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: (reviews.reduce((n, r) => n + r.rating, 0) / reviews.length).toFixed(1),
        reviewCount: String(reviews.length),
        bestRating: "5",
        worstRating: "1",
      },
      review: reviews.map((r) => ({
        "@type": "Review",
        author: { "@type": "Person", name: r.name },
        reviewRating: { "@type": "Rating", ratingValue: String(r.rating), bestRating: "5", worstRating: "1" },
        reviewBody: r.text,
      })),
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
    publisher: {
      "@type": "Organization",
      name: LEGAL_NAME,
      url: SITE_URL,
    },
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
            { "@type": "ListItem", position: 3, name: f.name, item: url },
          ],
        }}
      />
      <ProductDetail family={f} category={cat} related={related} relatedArticles={relatedArticles} machineVideo={machineVideo} />
    </>
  );
}
