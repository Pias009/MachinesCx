import { getLiveCatalogue } from "@/lib/liveCatalogue";
import { staticPageMetadata } from "@/lib/pageSeo";
import CatalogueClient from "./CatalogueClient";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return staticPageMetadata("/products", params.locale);
}

export default async function ProductsIndex() {
  const { categories, families } = await getLiveCatalogue();

  return <CatalogueClient categories={categories} families={families} />;
}
