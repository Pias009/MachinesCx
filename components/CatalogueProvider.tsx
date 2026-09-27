"use client";
import { createContext, useContext, useMemo } from "react";
import type { NavCategory } from "@/lib/liveCatalogue";
import { buildImageMap, productImage, upgradeImage, type ProductImageMap } from "@/lib/productImages";

// Live product photos (slug → main admin-set image), loaded once in the
// locale layout from the CMS and refreshed whenever the admin saves
// products. Lets client sections show the current Cloudinary photo instead
// of the old bundled /machines/<file> images.
const ProductImagesContext = createContext<ProductImageMap>({});

export function CatalogueProvider({ catalogue, children }: { catalogue: NavCategory[]; children: React.ReactNode }) {
  const images = useMemo(() => buildImageMap(catalogue), [catalogue]);
  return <ProductImagesContext.Provider value={images}>{children}</ProductImagesContext.Provider>;
}

/** slug (+ optional fallback image) → the product's current photo */
export function useProductImage() {
  const images = useContext(ProductImagesContext);
  return (slug: string, fallback?: string | null) => productImage(slug, images, fallback);
}

/** any image src → upgraded to the live product photo if it's a legacy
 *  /machines/<file> path; other URLs pass through unchanged */
export function useLiveImage() {
  const images = useContext(ProductImagesContext);
  return (src: string | null | undefined) => upgradeImage(src, images);
}

/** the raw slug → photo map (stable identity) — for memoized derivations */
export function useProductImageMap() {
  return useContext(ProductImagesContext);
}
