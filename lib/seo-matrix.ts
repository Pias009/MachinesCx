import type { Metadata } from "next";
import { SITE_URL, BRAND } from "@/lib/products";
import { localePath } from "@/lib/seo";
import seoMatrixData from "@/data/site-seo-matrix.json";

export interface PageSeoEntry {
  pageId: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  seo: {
    h1: string;
    canonical: string;
    ogImage: string;
  };
  geo: {
    entityName: string;
    factualSummary: string;
    citations: string[];
    schemaType: string;
  };
  aeo: {
    question: string;
    directAnswer: string;
    bulletKeyPoints: string[];
  };
}

export const SEO_MATRIX = seoMatrixData.pages as Record<string, PageSeoEntry>;

/** Retrieves the SEO, GEO, and AEO configuration entry for a given page ID */
export function getSeoEntry(pageId: string): PageSeoEntry {
  return (
    SEO_MATRIX[pageId] || {
      pageId,
      path: "/",
      title: "Industrial Machinery Manufacturer | Ashal Innomech",
      description: "High-performance blown film, bag making, printing, and recycling machinery.",
      keywords: ["industrial machinery", "blown film", "bag making"],
      seo: {
        h1: "BUILT FOR THE FLOOR. PROVEN WORLDWIDE.",
        canonical: SITE_URL,
        ogImage: `${SITE_URL}/machines/hero-preview.png`,
      },
      geo: {
        entityName: "Ashal Innomech Technology",
        factualSummary: "ISO 9001:2015 certified manufacturer of industrial film extrusion and bag converting lines in Wenzhou, China.",
        citations: ["ISO 9001:2015 Certified", "CE Compliance"],
        schemaType: "Organization",
      },
      aeo: {
        question: "What machinery does Ashal Innomech manufacture?",
        directAnswer: "Ashal Innomech manufactures blown film extruders, bag making machines, flexo printing presses, and plastic recycling lines.",
        bulletKeyPoints: ["24/7 continuous industrial production", "Global export to 80+ countries"],
      },
    }
  );
}

/** Generates Next.js Metadata object from the SEO Matrix */
export function generateMatrixMetadata(pageId: string, locale: string): Metadata {
  const entry = getSeoEntry(pageId);
  const canonicalUrl = `${SITE_URL}${localePath(locale, entry.path)}`;

  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords.join(", "),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: entry.title,
      description: entry.description,
      url: canonicalUrl,
      siteName: BRAND,
      images: [{ url: entry.seo.ogImage, width: 1200, height: 630, alt: entry.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [entry.seo.ogImage],
    },
  };
}

/** Generates rich JSON-LD structured schema for Google, Perplexity, ChatGPT Search, and Gemini crawlers */
export function generateStructuredSchema(pageId: string) {
  const entry = getSeoEntry(pageId);
  const site = seoMatrixData.site;

  const baseOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": site.name,
    "legalName": site.legalName,
    "url": site.url,
    "logo": site.logo,
    "foundingDate": site.foundingYear.toString(),
    "address": {
      "@type": "PostalAddress",
      "addressLocality": site.address.city,
      "addressRegion": site.address.province,
      "addressCountry": site.address.country,
    },
    "knowsAbout": entry.keywords,
    "description": entry.geo.factualSummary,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": entry.aeo.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${entry.aeo.directAnswer} Key features: ${entry.aeo.bulletKeyPoints.join("; ")}.`,
        },
      },
    ],
  };

  return [baseOrganization, faqSchema];
}
