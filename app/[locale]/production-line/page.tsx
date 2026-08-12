import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/products";
import JsonLd from "@/components/JsonLd";
import ProductionLineClient from "./ProductionLineClient";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return pageMetadata({
    locale: params.locale,
    path: "/production-line",
    title: "Production Line Builder — Ashal Innomach",
    description: "Build the line that makes your final product. Start from a ready-made template or configure your own from film-blowing, bag-making, recycling, and printing machines.",
  });
}

export default function ProductionLinePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to configure a custom plastic-processing production line",
          description: "Select a machine category, choose your models and quantities, add any extra parts, then review your configuration before submitting an inquiry.",
          step: [
            { "@type": "HowToStep", position: 1, name: "Choose a machine category", text: "Pick film-blowing, bag-making, recycling, or printing — or start from a ready-made line template." },
            { "@type": "HowToStep", position: 2, name: "Select machines and quantities", text: "Choose specific machine models and how many of each your line needs." },
            { "@type": "HowToStep", position: 3, name: "Add parts", text: "Add any additional parts or components required for the line." },
            { "@type": "HowToStep", position: 4, name: "Review and submit", text: "Review the full configuration sheet, then send it as an inquiry to the engineering team." },
          ],
          url: `${SITE_URL}/production-line`,
        }}
      />
      <ProductionLineClient />
    </>
  );
}
