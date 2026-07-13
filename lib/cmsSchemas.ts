// ---------------------------------------------------------------------------
// Client-safe schema descriptors that drive the admin editor forms.
// Each CMS section declares its collections and field kinds so the editor
// can render the right controls (text, image upload, spec tables, …).
// ---------------------------------------------------------------------------

export type FieldKind =
  | "text"        // single-line string
  | "textarea"    // multi-line string
  | "number"
  | "boolean"
  | "select"      // options[]
  | "image"       // path string + local upload button + preview
  | "images"      // string[] — unlimited photos, upload as many as you like
  | "stringlist"  // string[] (one per line)
  | "pairs"       // [string, string][] — label/value rows
  | "kvlist"      // {label, value}[] rows
  | "features"    // {head, body}[] rows
  | "specs"       // {label, values[]}[] — values aligned to the item's `models`
  | "steps"       // {title, detail}[] rows — installation steps
  | "phases"      // {label, duration, detail}[] rows — delivery guide timeline
  | "gallery"     // {src, caption}[] rows — image + local upload + caption
  | "videos"      // {url, title}[] rows — YouTube URL/ID + title
  | "reviews"     // {name, title, rating, text}[] rows — real buyer reviews
  | "stagePhotos" // {packing?, freight?, install?} — 3 fixed delivery-stage proof photos
  | "customSections" // {kind, title, image?, text?, imageSide?, photos?}[] — admin-authored extra sections, fixed safe templates
  | "parts";      // {name, detail, images?, installation?}[] rows — real machine parts, each with its own optional install steps

export interface Field {
  key: string;
  label: string;
  kind: FieldKind;
  options?: string[];   // for select
  hint?: string;
  /** which tab this field appears under when editing an item. Fields
   *  without a group all fall into one tab (no tab bar shown). */
  group?: string;
}

export interface Collection {
  key: string;             // property in the section JSON holding the array
  label: string;           // sidebar / heading label
  titleKeys: string[];     // item props used for the list title
  fields: Field[];
  /** ordered list of group names — controls tab order when fields use `group` */
  groups?: string[];
  canAdd?: boolean;
  template?: Record<string, unknown>; // new-item template
}

export interface SectionSchema {
  slug: string;            // CMS section = data/<slug>.json
  title: string;
  description: string;
  rootFields?: Field[];    // top-level fields (headlines, etc.)
  collections: Collection[];
}

const CAT_OPTIONS = ["film-blowing", "bag-making", "recycling", "printing"];

export const SECTION_SCHEMAS: SectionSchema[] = [
  {
    slug: "products",
    title: "Products",
    description: "Full product catalogue — every family, model and spec table across the site.",
    collections: [
      {
        key: "families",
        label: "Product families",
        titleKeys: ["series", "name"],
        canAdd: true,
        groups: ["📝 Basic Info", "📸 Photos", "🎬 Videos", "📊 Specifications", "🔩 Parts", "🚚 Setup & Delivery", "⭐ Reviews", "➕ Custom Sections"],
        template: {
          slug: "new-machine", category: "film-blowing", series: "NEW",
          name: "New machine", tagline: "", models: ["Model-1"],
          materials: "", images: [], specs: [{ label: "Spec", values: [""] }],
          installation: [{ title: "", detail: "", image: "" }],
          deliveryGuide: [{ label: "", duration: "", detail: "" }],
          gallery: [{ src: "", caption: "" }],
          videos: [],
          reviews: [],
          deliveryStagePhotos: { packing: "", freight: "", install: "" },
          customSections: [],
          parts: [],
        },
        fields: [
          { key: "name", label: "Name", kind: "text", group: "📝 Basic Info" },
          { key: "series", label: "Series", kind: "text", group: "📝 Basic Info" },
          { key: "tagline", label: "Tagline", kind: "textarea", group: "📝 Basic Info" },
          { key: "category", label: "Category", kind: "select", options: CAT_OPTIONS, group: "📝 Basic Info" },
          { key: "materials", label: "Materials", kind: "text", group: "📝 Basic Info" },
          { key: "slug", label: "Slug (URL id)", kind: "text", hint: "lowercase-with-dashes, unique — only change if you know this affects the page URL", group: "📝 Basic Info" },

          { key: "images", label: "Product photos", kind: "images", hint: "upload as many as you like — the first one is used as the main photo everywhere this machine appears", group: "📸 Photos" },
          { key: "gallery", label: "Site gallery photos", kind: "gallery", hint: "real installation / factory / delivery photos, shown further down the product page", group: "📸 Photos" },

          { key: "videos", label: "Product demo videos", kind: "videos", hint: "paste a real YouTube link or video ID — leave empty to show a 'video coming soon' placeholder instead of a broken/fake video", group: "🎬 Videos" },

          { key: "specs", label: "Spec table", kind: "specs", hint: "model columns are added/renamed/removed directly in this table", group: "📊 Specifications" },

          { key: "parts", label: "Machine parts / components", kind: "parts", hint: "add one or more real parts of this machine — name, detail text, real photos. Give a part its own install steps only if it needs a separate installation sequence.", group: "🔩 Parts" },

          { key: "installation", label: "Installation / setup steps", kind: "steps", hint: "add a photo or diagram per step — auto-picks an icon from words like foundation / power / assembly / calibration / training in the title", group: "🚚 Setup & Delivery" },
          { key: "deliveryGuide", label: "Delivery guide (timeline)", kind: "phases", hint: "auto-picks an icon from words like order / production / test / shipping / install in the label", group: "🚚 Setup & Delivery" },
          { key: "deliveryStagePhotos", label: "Delivery stage proof photos", kind: "stagePhotos", hint: "real photos of this machine crated, in a container, and installed on-site — each falls back to a technical icon until you upload one", group: "🚚 Setup & Delivery" },

          { key: "reviews", label: "Buyer reviews", kind: "reviews", hint: "only real reviews you've collected — leave empty to show an honest 'be the first to review' state instead of fake ratings", group: "⭐ Reviews" },

          { key: "customSections", label: "Custom sections", kind: "customSections", hint: "add extra sections to this product page — pick a template, fill in title/image/text. Appears automatically on the live page, in the order listed here, right after the delivery timeline.", group: "➕ Custom Sections" },
        ],
      },
      {
        key: "categories",
        label: "Categories",
        titleKeys: ["name"],
        fields: [
          { key: "slug", label: "Slug", kind: "text" },
          { key: "name", label: "Name", kind: "text" },
          { key: "tagline", label: "Tagline", kind: "text" },
          { key: "blurb", label: "Blurb", kind: "textarea" },
        ],
      },
    ],
  },
  {
    slug: "home-hero",
    title: "Home · Hero Section",
    description: "The top hero — eyebrow, headline, description, buttons, and the featured machines shown along the curved arch.",
    rootFields: [
      { key: "eyebrow", label: "Eyebrow (small teal label)", kind: "text" },
      { key: "headline1", label: "Headline line 1", kind: "text" },
      { key: "headline2", label: "Headline line 2 (teal)", kind: "text" },
      { key: "description", label: "Description", kind: "textarea" },
      { key: "primaryLabel", label: "Primary button label", kind: "text" },
      { key: "primaryHref", label: "Primary button link", kind: "text", hint: "e.g. /products" },
      { key: "secondaryLabel", label: "Secondary button label", kind: "text" },
      { key: "secondaryHref", label: "Secondary button link", kind: "text", hint: "e.g. /contact" },
    ],
    collections: [
      {
        key: "featured",
        label: "Featured machines (arch cards)",
        titleKeys: ["slug"],
        canAdd: true,
        template: { slug: "" },
        fields: [
          { key: "slug", label: "Product slug", kind: "text", hint: "must match a machine slug from the Products section — its photo, series and name are pulled in automatically. Up to 5 are shown along the arch." },
        ],
      },
    ],
  },
  {
    slug: "machine-catalog",
    title: "Home · Machine Catalogue",
    description: "“Every machine. Find your perfect fit.” grid — headline and the stat shown on every machine card.",
    rootFields: [
      { key: "headline1", label: "Headline line 1", kind: "text" },
      { key: "headline2", label: "Headline line 2 (teal)", kind: "text" },
    ],
    collections: [
      {
        key: "items",
        label: "Card stats",
        titleKeys: ["slug"],
        fields: [
          { key: "slug", label: "Product slug", kind: "text" },
          { key: "stat", label: "Stat (big value)", kind: "text" },
          { key: "label", label: "Stat label", kind: "text" },
        ],
      },
    ],
  },
  {
    slug: "production-line",
    title: "Home · Production Line",
    description: "“Built for the floor” pipeline — the 5 setup steps, their machines, roles and quality details.",
    collections: [
      {
        key: "items",
        label: "Line steps (in setup order)",
        titleKeys: ["stage", "name"],
        canAdd: true,
        template: { stage: "Step N", name: "Machine", slug: "", cat: "film-blowing", img: "", role: "", quality: [] },
        fields: [
          { key: "stage", label: "Stage name", kind: "text" },
          { key: "name", label: "Machine name", kind: "text" },
          { key: "slug", label: "Product slug (link)", kind: "text" },
          { key: "cat", label: "Category route", kind: "select", options: CAT_OPTIONS },
          { key: "img", label: "Machine image (transparent PNG)", kind: "image" },
          { key: "role", label: "Role in the line", kind: "textarea" },
          { key: "quality", label: "Quality details", kind: "pairs" },
        ],
      },
    ],
  },
  {
    slug: "flexo-strip",
    title: "Home · Flexo Strip",
    description: "“AI Series Flexo Press” selector — the four press models with speed, registration and an uploaded product image each.",
    collections: [
      {
        key: "items",
        label: "Press models",
        titleKeys: ["label", "tag"],
        canAdd: true,
        template: { slug: "new-press", label: "AI-XX", colours: 2, speed: "120", reg: "±0.2mm", img: "", tag: "", hot: false, flagship: false },
        fields: [
          { key: "slug", label: "Product slug (link target)", kind: "text", hint: "links the card to /products/printing#<slug>" },
          { key: "label", label: "Model label", kind: "text" },
          { key: "colours", label: "Colours", kind: "number" },
          { key: "speed", label: "Speed (m/min)", kind: "text" },
          { key: "reg", label: "Registration", kind: "text" },
          { key: "img", label: "Machine image", kind: "image", hint: "upload the press photo shown on the card" },
          { key: "tag", label: "Tag line", kind: "text" },
          { key: "hot", label: "Hot model badge", kind: "boolean" },
          { key: "flagship", label: "Flagship badge", kind: "boolean" },
        ],
      },
    ],
  },
  {
    slug: "printing-showcase",
    title: "Home · Printing Showcase",
    description: "Flexo printing lines carousel — machine images and key specs.",
    collections: [
      {
        key: "items",
        label: "Carousel machines",
        titleKeys: ["model", "series"],
        canAdd: true,
        template: { model: "AI-XX", series: "X-Colour Press", src: "", speed: "", reg: "", accent: "#e11d48" },
        fields: [
          { key: "model", label: "Model", kind: "text" },
          { key: "series", label: "Series", kind: "text" },
          { key: "src", label: "Machine image (transparent PNG)", kind: "image" },
          { key: "speed", label: "Max speed", kind: "text" },
          { key: "reg", label: "Registration", kind: "text" },
          { key: "accent", label: "Accent color (hex)", kind: "text" },
        ],
      },
    ],
  },
  {
    slug: "scrollhome-bags",
    title: "Home · Scroll Story Products",
    description: "Scroll-driven home story — the spec sheets and feature bullets for each featured machine.",
    collections: [
      {
        key: "items",
        label: "Featured machines",
        titleKeys: ["slug"],
        fields: [
          { key: "slug", label: "Product slug", kind: "text" },
          { key: "specs", label: "Spec rows", kind: "kvlist" },
          { key: "features", label: "Feature bullets", kind: "features" },
        ],
      },
    ],
  },
];

export function schemaBySlug(slug: string): SectionSchema | undefined {
  return SECTION_SCHEMAS.find((s) => s.slug === slug);
}
