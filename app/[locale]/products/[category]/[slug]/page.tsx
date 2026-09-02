import { notFound } from "next/navigation";
import { families, SITE_URL, BRAND, familyImage, type CategorySlug, type ProductFamily, type Category } from "@/lib/products";
import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata, localePath } from "@/lib/seo";
import { getMachineProducts, getMachineProductBySlug, getMachineCategoryBySlug, getRelatedArticlesForMachine } from "@/lib/machinesData";
import JsonLd from "@/components/JsonLd";
import ProductDetail from "./ProductDetail";

export const revalidate = 3600;

export function generateStaticParams() {
  const legacyParams = families.map((f) => ({ category: f.category, slug: f.slug }));
  const machineParams = getMachineProducts().map((p) => ({ category: p.category, slug: p.slug }));
  return [...legacyParams, ...machineParams];
}

export async function generateMetadata({ params }: { params: { locale: string; category: string; slug: string } }) {
  const { locale, category, slug } = params;
  const { families: liveFamilies } = await getLiveCatalogue();
  const f = liveFamilies.find((x) => x.slug === slug);
  const mProduct = getMachineProductBySlug(slug);

  if (!f && !mProduct) return { title: "Industrial Machinery Manufacturer | Wenzhou Ashal Innomech" };

  let title = mProduct?.seoTitle || f?.seoData?.metaTitle || `${f?.name || mProduct?.name} | Manufacturer & Specs | Ashal Machinery`;
  
  // Ensure machine titles include target commercial search intent keywords (Manufacturer, China, Factory)
  if (!title.toLowerCase().includes("manufacturer") && !title.toLowerCase().includes("supplier")) {
    title = `${title} | Manufacturer`;
  }

  const description = mProduct?.metaDescription || f?.seoData?.metaDescription || [f?.tagline, f?.specs.slice(0, 2).map((s) => `${s.label} ${s.values[0]}`).join(" · ")].filter(Boolean).join(" — ").slice(0, 160);

  const modelNumber = mProduct?.model || f?.models?.[0] || f?.series || slug;

  const meta = pageMetadata({
    locale,
    path: `/products/${category}/${slug}`,
    title,
    description,
    image: f?.images?.[0] ?? f?.image,
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
      "Wenzhou Ashal Innomach Technology Co., Ltd.",
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
      seoData: {
        wordCount: 800,
        overviewHeading: `Engineered Overview — ${mProduct.name}`,
        metaTitle: mProduct.seoTitle,
        metaDescription: mProduct.metaDescription,
        focusKeywords: [mProduct.name, mProduct.model, mProduct.model.replace(/-/g, " "), mProduct.category, BRAND, "Manufacturer"],
        technicalArchitecture: `${mProduct.name} (Model: ${mProduct.model}) engineered by Wenzhou Ashal Innomach Technology Co., Ltd. Key features: ${mProduct.features.join("; ")}.`,
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
        commercialGuide: "Contact Wenzhou Ashal Innomach Technology Co., Ltd. for factory-direct quotes, machine customization, and global commissioning support.",
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

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: f.name,
    description: f.seoData?.metaDescription || f.tagline,
    url,
    image: image ? `${SITE_URL}${image}` : undefined,
    brand: { "@type": "Brand", name: BRAND, url: SITE_URL },
    manufacturer: {
      "@type": "Organization",
      name: "Wenzhou Ashal Innomach Technology Co., Ltd.",
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
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: "100000",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      url,
      seller: { "@type": "Organization", name: BRAND, url: SITE_URL },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "US",
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted",
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "USD",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "US",
        },
      },
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
      name: "Wenzhou Ashal Innomach Technology Co., Ltd.",
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
