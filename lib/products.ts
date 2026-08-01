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
  image?: string; // optional photo/diagram, set from the admin panel
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

export interface ProductVideo {
  url: string;   // YouTube/Vimeo URL or ID, set from the admin panel
  title: string;
}

export interface ProductReview {
  name: string;
  title: string;   // company / role
  rating: number;   // 1–5
  text: string;
}

export interface DeliveryStagePhotos {
  packing?: string | string[];   // export packing photos — crated / palletized machine
  freight?: string | string[];   // ocean/air freight photos — container loading, etc.
  install?: string | string[];   // on-site install photos — commissioning at the buyer's site
}

/* ── admin-authored custom sections — a fixed set of pre-styled,
   overflow-safe templates. Admins fill in content only (title, image,
   text); they never touch layout/CSS, so a new section can never break
   the page. Rendered in one fixed zone on the product page, in array
   order (drag-to-reorder in the admin panel). ── */
export interface CustomSectionBanner {
  kind: "banner";      // full-width image + title, like the delivery proof stages
  title: string;
  image?: string;
  text?: string;
}
export interface CustomSectionText {
  kind: "text";        // title + paragraph, no image
  title: string;
  text: string;
}
export interface CustomSectionSplit {
  kind: "split";       // image one side, title+text the other
  title: string;
  image?: string;
  text: string;
  imageSide?: "left" | "right"; // defaults to "left"
}
export interface CustomSectionGallery {
  kind: "gallery";     // multi-image grid with captions
  title: string;
  photos: GalleryImage[];
}
export type CustomSection =
  | CustomSectionBanner
  | CustomSectionText
  | CustomSectionSplit
  | CustomSectionGallery;

/* ── machine parts — real, admin-added components of this product.
   Each part has its own name, detail text, real photo(s), and an
   optional step-by-step install guide (only shown when a part actually
   needs one). Distinct from the older hardcoded "Part N" photo-crop
   breakdown, which stays as-is and uses fabricated crops of the main
   product shot rather than real per-part photography. ── */
export interface MachinePart {
  name: string;
  detail: string;
  images?: string[];        // real part photos, admin-uploaded, unlimited
  installation?: SetupStep[]; // optional per-part install guide
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
  videos?: ProductVideo[];         // real product demo videos, set from the admin panel
  reviews?: ProductReview[];       // real buyer reviews, set from the admin panel
  deliveryStagePhotos?: DeliveryStagePhotos; // real packing/freight/install proof photos
  customSections?: CustomSection[];   // admin-authored extra sections, rendered in order
  parts?: MachinePart[];              // real machine parts/components, admin-added
  radarImage?: string;                // dedicated center image for the radar chart spider web
  radarSpecs?: string[];              // spec labels to display on the radar chart
}

/** Extracts a YouTube video ID from a full URL or a bare 11-char ID. */
export const parseYouTubeId = (input: string): string | null => {
  const trimmed = input.trim();
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
};


// ---------------------------------------------------------------------------
// Catalogue data is bundled from data/products.json at build time. These
// exports back most of the site (nav, homepage sections, AI chat, contact
// forms) and generateStaticParams, where a build-time snapshot is fine.
//
// The product catalogue pages themselves (app/products/**) instead call
// getLiveCatalogue() from lib/liveCatalogue.ts, which reads the CMS store
// (MongoDB) directly so admin edits — including delivery-stage photos —
// appear without a rebuild. That helper lives in its own module (not here)
// so this file — imported by client components for its types/helpers —
// never pulls the server-only mongoose/mongodb chain into the browser bundle.
// ---------------------------------------------------------------------------
import productsData from "@/data/products.json";

export const categories = productsData.categories as Category[];
export const families = productsData.families as ProductFamily[];

export interface Catalogue {
  categories: Category[];
  families: ProductFamily[];
}

export const familiesByCategory = (slug: CategorySlug) =>
  families.filter((f) => f.category === slug);

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

export const familyBySlug = (slug: string) =>
  families.find((f) => f.slug === slug);

// Full product photo gallery — unlimited images, in admin-set order.
// Falls back to the legacy single `image` field, then to the legacy
// filesystem convention (/machines/<slug>.png), so older data keeps working.
export const familyImages = (f: Pick<ProductFamily, "slug" | "image" | "images">): string[] => {
  if (f.images && f.images.length > 0) return f.images;
  if (f.image && f.image.trim()) return [f.image];
  return [`/machines/${f.slug}.png`];
};

// Normalizes a delivery-stage photo field to an array — old data saved a
// single string per stage, newer data saves string[]. Filters out empties.
export const stagePhotos = (v: string | string[] | undefined): string[] => {
  const arr = Array.isArray(v) ? v : v ? [v] : [];
  return arr.filter((s) => s && s.trim());
};

// First/primary product photo — for card thumbnails, related-machine tiles
// and anywhere only one image is shown.
export const familyImage = (f: Pick<ProductFamily, "slug" | "image" | "images">) =>
  familyImages(f)[0];
