import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { pageMetadata } from "@/lib/seo";
import CatalogueClient from "./CatalogueClient";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return pageMetadata({
    locale: params.locale,
    path: "/products",
    title: "Full Catalogue — Ashal Innomech",
    description: "Browse the full range: multi-layer blown-film lines, bag-making converters, recycling and pelletizing lines, and flexographic printing machines.",
  });
}

export default async function ProductsIndex() {
  const { categories, families } = await getLiveCatalogue();

  return <CatalogueClient categories={categories} families={families} />;
}
