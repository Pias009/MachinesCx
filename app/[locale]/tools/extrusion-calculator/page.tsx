import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import ExtrusionCalculator from "@/components/ExtrusionCalculator";
import { staticPageMetadata } from "@/lib/pageSeo";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return staticPageMetadata("/tools/extrusion-calculator", params.locale);
}

export default function ExtrusionCalculatorPage() {
  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Blown Film Extrusion Calculator",
    url: "https://www.wzashal.com/tools/extrusion-calculator",
    description:
      "Calculate throughput output (kg/h), film weight, motor power load, and ABA 3-layer co-extrusion resin cost savings (up to 35% savings) for blown film extrusion lines.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "All",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: { "@id": "https://www.wzashal.com/#organization" },
  };

  return (
    <>
      <JsonLd data={jsonLdData} />
      <div className="min-h-screen bg-[var(--bg-base)] text-[var(--ink)] pt-28 pb-20">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-[var(--ink-35)]">
            <Link href="/" className="hover:text-[var(--brand-teal)] transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[var(--brand-teal)] transition-colors">
              Engineering Tools
            </Link>
            <span>/</span>
            <span className="text-[var(--ink)]">Extrusion Calculator</span>
          </nav>

          <ExtrusionCalculator />
        </div>
      </div>
    </>
  );
}
