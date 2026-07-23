import { getLiveCatalogue } from "@/lib/liveCatalogue";
import CatalogueClient from "./CatalogueClient";

export const metadata = { title: "Full Catalogue — Ashal Innomach" };
export const dynamic = "force-dynamic";

export default async function ProductsIndex() {
  const { categories, families } = await getLiveCatalogue();

  return <CatalogueClient categories={categories} families={families} />;
}
