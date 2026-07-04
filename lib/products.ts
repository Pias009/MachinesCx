// ---------------------------------------------------------------------------
// Wenzhou Ashal Innomach Technology — product catalogue data
// Transcribed from the source spec deck. English only — all bilingual labels removed for international audience.
// ---------------------------------------------------------------------------

export const BRAND = "Wenzhou Ashal Innomach Technology";

export type CategorySlug = "film-blowing" | "bag-making" | "recycling" | "printing";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  blurb: string;
}

export interface SpecRow {
  label: string;
  values: string[]; // aligned to `models`
}

export interface SetupStep {
  title: string;
  detail: string;
}

export interface DeliveryPhase {
  label: string;      // e.g. "Production"
  duration: string;    // e.g. "25–30 days"
  detail: string;
}

export interface GalleryImage {
  src: string;         // /uploads/... or /machines/...
  caption: string;
}

export interface ProductFamily {
  slug: string;
  category: CategorySlug;
  series: string;
  name: string;
  tagline: string;
  models: string[]; // column headers
  materials?: string;
  /** @deprecated use `images` — kept so data saved before the multi-image
   *  upgrade still resolves to something. Migrated into `images[0]` on load. */
  image?: string;
  images?: string[];              // product photo gallery — unlimited, set from the admin panel
  specs: SpecRow[];
  installation?: SetupStep[];      // on-site setup / installation steps
  deliveryGuide?: DeliveryPhase[]; // production → shipping → commissioning timeline
  gallery?: GalleryImage[];        // real site / installation / delivery photos
}


// ---------------------------------------------------------------------------
// Catalogue data now lives in data/products.json — editable from the admin
// panel. This module keeps the same exports so nothing downstream changes.
// NOTE: JSON is bundled at build time; static product pages need a rebuild
// after edits (dev server picks changes up automatically).
// ---------------------------------------------------------------------------
import productsData from "@/data/products.json";

export const categories = productsData.categories as Category[];
export const families = productsData.families as ProductFamily[];

export const familiesByCategory = (slug: CategorySlug) =>
  families.filter((f) => f.category === slug);

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

export const familyBySlug = (slug: string) =>
  families.find((f) => f.slug === slug);

export const totalModels = families.reduce((n, f) => n + f.models.length, 0);

// Full product photo gallery — unlimited images, in admin-set order.
// Falls back to the legacy single `image` field, then to the legacy
// filesystem convention (/machines/<slug>.png), so older data keeps working.
export const familyImages = (f: Pick<ProductFamily, "slug" | "image" | "images">): string[] => {
  if (f.images && f.images.length > 0) return f.images;
  if (f.image && f.image.trim()) return [f.image];
  return [`/machines/${f.slug}.png`];
};

// First/primary product photo — for card thumbnails, related-machine tiles
// and anywhere only one image is shown.
export const familyImage = (f: Pick<ProductFamily, "slug" | "image" | "images">) =>
  familyImages(f)[0];
