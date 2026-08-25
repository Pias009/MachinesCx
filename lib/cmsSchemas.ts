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
  | "productSelect" // product model dropdown selector
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
  | "stagePhotos" // {packing?, freight?, install?: string[]} — 3 fixed delivery-stage proof photo galleries, each with unlimited photos
  | "customSections" // {kind, title, image?, text?, imageSide?, photos?}[] — admin-authored extra sections, fixed safe templates
  | "parts"       // {name, detail, images?, installation?}[] rows — real machine parts, each with its own optional install steps
  | "richtext"    // {kind: heading|paragraph|list, text?, items?}[] — block-based article body, no raw HTML
  | "links";      // {label, url}[] rows — simple call-to-action links

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
  /** singular form for the "+ Add …" button — falls back to stripping a
   *  trailing "s" from `label` when omitted (breaks on irregular plurals
   *  like "families", so set this explicitly for those). */
  singular?: string;
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
    description: "Full product catalogue — every family, model and spec table across the site. " +
      "Photo size cheat-sheet (each field's own hint below has the full detail): " +
      "Product photos & Site gallery & Machine parts & Custom sections (split/gallery) → 1200×900px (4:3), shown in full, not cropped. " +
      "Installation steps → 1200×900px (4:3), but this one IS cropped to fill — center the subject. " +
      "Delivery stage photos & Custom section banners → 2100×900px (21:9 wide banner), cropped top/bottom — keep detail centered. " +
      "Radar center image → 900×900px (square), cropped into a circle. " +
      "Product demo videos → no photo needed, thumbnail comes from YouTube automatically.",
    collections: [
      {
        key: "families",
        label: "Product families",
        singular: "product",
        titleKeys: ["series", "name"],
        canAdd: true,
        groups: ["📝 Basic Info", "📸 Photos", "🎬 Videos", "📊 Specifications", "🕸 Radar Chart", "🔩 Parts", "🚚 Setup & Delivery", "⭐ Reviews", "➕ Custom Sections"],
        template: {
          slug: "new-machine", category: "film-blowing", series: "NEW",
          name: "New machine", tagline: "", models: ["Model-1"],
          materials: "", images: [], specs: [{ label: "Spec", values: [""] }],
          installation: [{ title: "", detail: "", image: "" }],
          deliveryGuide: [{ label: "", duration: "", detail: "" }],
          gallery: [{ src: "", caption: "" }],
          videos: [],
          reviews: [],
          deliveryStagePhotos: { packing: [], freight: [], install: [] },
          customSections: [],
          parts: [],
          radarImage: "",
          radarSpecs: ["Screw Diameter", "Max Extrusion Output", "Total Power", "Film Width", "Roller Width", "Main Motor", "Max Bag Width", "Max Web Width", "Max Mechanical Speed"],
        },
        fields: [
          { key: "name", label: "Name", kind: "text", group: "📝 Basic Info" },
          { key: "series", label: "Series", kind: "text", group: "📝 Basic Info" },
          { key: "tagline", label: "Tagline", kind: "textarea", group: "📝 Basic Info" },
          { key: "category", label: "Category", kind: "select", options: CAT_OPTIONS, group: "📝 Basic Info" },
          { key: "materials", label: "Materials", kind: "text", group: "📝 Basic Info" },
          { key: "slug", label: "Slug (URL id)", kind: "text", hint: "lowercase-with-dashes, unique — only change if you know this affects the page URL", group: "📝 Basic Info" },

          { key: "images", label: "Product photos", kind: "images", hint: "upload as many as you like — the first one is used as the main photo everywhere this machine appears. Best size: 1600×1280px (5:4), machine centered on a plain/transparent background — this photo is shown in full (never cropped), so keep the subject away from the edges.", group: "📸 Photos" },
          { key: "gallery", label: "Site gallery photos", kind: "gallery", hint: "real installation / factory / delivery photos, shown further down the product page. Best size: 1200×900px (4:3) — shown in full, not cropped.", group: "📸 Photos" },

          { key: "videos", label: "Product demo videos", kind: "videos", hint: "paste a real YouTube link or video ID — leave empty to show a 'video coming soon' placeholder instead of a broken/fake video. Thumbnail is pulled from YouTube automatically at 16:9, no upload needed.", group: "🎬 Videos" },

          { key: "specs", label: "Spec table", kind: "specs", hint: "model columns are added/renamed/removed directly in this table", group: "📊 Specifications" },

          { key: "radarImage", label: "Radar center image", kind: "image", hint: "the photo that appears at the center of the spider-web chart on the product page — leave empty to use the first product photo. Best size: 900×900px (square, 1:1) — displayed in a circle, so keep the subject centered; the corners get cropped off.", group: "🕸 Radar Chart" },
          { key: "radarSpecs", label: "Radar spec labels (one per line)", kind: "stringlist", hint: "which specs appear on the spider-web chart — type the exact spec labels, one per line, matching the spec table above. Defaults to common specs if left empty.", group: "🕸 Radar Chart" },

          { key: "parts", label: "Machine parts / components", kind: "parts", hint: "add one or more real parts of this machine — name, detail text, real photos. Give a part its own install steps only if it needs a separate installation sequence. Part photos best size: 1200×900px (4:3), shown in full. Small thumbnail selectors (44×44px and 64×64px, both square) are cropped to fit — keep the subject centered in the source photo.", group: "🔩 Parts" },

          { key: "installation", label: "Installation / setup steps", kind: "steps", hint: "add a photo or diagram per step — auto-picks an icon from words like foundation / power / assembly / calibration / training in the title. Best size: 1200×900px (4:3) — this photo IS cropped to fill the frame, so keep the important detail centered, not near the edges.", group: "🚚 Setup & Delivery" },
          { key: "deliveryGuide", label: "Delivery guide (timeline)", kind: "phases", hint: "auto-picks an icon from words like order / production / test / shipping / install in the label", group: "🚚 Setup & Delivery" },
          { key: "deliveryStagePhotos", label: "Delivery stage proof photos", kind: "stagePhotos", hint: "real photos of this machine crated, in a container, and installed on-site — upload as many as you like per stage, each falls back to a technical icon until at least one is uploaded. Best size: 2100×900px (21:9, wide banner) — this photo IS cropped top/bottom to fill a cinematic banner, so frame the subject centrally and avoid important detail near the top/bottom edges. A tall/square photo will lose most of its top and bottom.", group: "🚚 Setup & Delivery" },

          { key: "reviews", label: "Buyer reviews", kind: "reviews", hint: "only real reviews you've collected — leave empty to show an honest 'be the first to review' state instead of fake ratings", group: "⭐ Reviews" },

          { key: "customSections", label: "Custom sections", kind: "customSections", hint: "add extra sections to this product page — pick a template, fill in title/image/text. Appears automatically on the live page, in the order listed here, right after the delivery timeline. Image sizes (all cropped to fill, so center the subject): Banner template → 2100×900px (21:9, wide). Split template → 1200×900px (4:3). Gallery template → 1200×900px (4:3) per photo.", group: "➕ Custom Sections" },
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
          { key: "image", label: "Category Cover Image / Icon", kind: "image", hint: "Upload a cover photo or icon for this category card" },
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
        label: "Circle Hero Machine Models (Arch Cards)",
        singular: "Hero Machine Card",
        titleKeys: ["customName", "slug"],
        canAdd: true,
        template: { slug: "abcde-2200", customImage: "", customSeries: "", customName: "", customHref: "" },
        fields: [
          { key: "slug", label: "Machine Model / Product", kind: "productSelect", hint: "Select a machine model from your catalogue, or type its slug." },
          { key: "customImage", label: "Custom Machine Image (optional photo upload)", kind: "image", hint: "Upload a custom circle machine image or transparent PNG — leave empty to use the machine's primary photo." },
          { key: "customSeries", label: "Series label override (optional)", kind: "text", hint: "e.g. ABCDE · 5-layer — leave empty to use default product series" },
          { key: "customName", label: "Model name override (optional)", kind: "text", hint: "e.g. ABCDE-2200 Five-Layer — leave empty to use default product name" },
          { key: "customHref", label: "Link URL override (optional)", kind: "text", hint: "e.g. /products/film-blowing/abcde-2200 — leave empty to link to product page" },
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
        template: { model: "AI-XX", series: "X-Colour Press", src: "", speed: "", reg: "", accent: "#e11d48", hot: false },
        fields: [
          { key: "model", label: "Model", kind: "text" },
          { key: "series", label: "Series", kind: "text" },
          { key: "src", label: "Machine image (transparent PNG)", kind: "image" },
          { key: "speed", label: "Max speed", kind: "text" },
          { key: "reg", label: "Registration", kind: "text" },
          { key: "accent", label: "Accent color (hex)", kind: "text" },
          { key: "hot", label: "Hot model badge", kind: "boolean" },
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
  {
    slug: "news",
    title: "News / Blog",
    description: "Company news, product launches, technical guides, and event posts — shown on the homepage strip and the /news pages.",
    collections: [
      {
        key: "articles",
        label: "Articles",
        titleKeys: ["title"],
        canAdd: true,
        singular: "article",
        groups: ["📝 Basic Info", "📰 Article Body", "🔗 Related Links"],
        template: {
          slug: "new-article", title: "New article", date: new Date().toISOString().slice(0, 10),
          category: "Company News", excerpt: "", image: "", tags: [],
          body: [{ kind: "paragraph", text: "" }],
          links: [],
        },
        fields: [
          { key: "title", label: "Title", kind: "text", group: "📝 Basic Info" },
          { key: "slug", label: "Slug (URL id)", kind: "text", hint: "lowercase-with-dashes, unique — this becomes /news/<slug>", group: "📝 Basic Info" },
          { key: "date", label: "Date", kind: "text", hint: "YYYY-MM-DD — controls sort order, newest first", group: "📝 Basic Info" },
          { key: "category", label: "Category", kind: "text", hint: "e.g. Product Launch, Technical, Sustainability, Events", group: "📝 Basic Info" },
          { key: "excerpt", label: "Excerpt", kind: "textarea", hint: "short summary shown on cards and the article header", group: "📝 Basic Info" },
          { key: "image", label: "Cover photo", kind: "image", group: "📝 Basic Info" },
          { key: "tags", label: "Tags (one per line)", kind: "stringlist", group: "📝 Basic Info" },

          { key: "body", label: "Article body", kind: "richtext", hint: "build the article from headings, paragraphs, and bullet lists — use **text** for bold. Renders styled exactly like the rest of the site, no HTML needed.", group: "📰 Article Body" },

          { key: "links", label: "Related links", kind: "links", hint: "shown in the sidebar of the article page — e.g. link to the relevant product or a contact page", group: "🔗 Related Links" },
        ],
      },
    ],
  },
];

export function schemaBySlug(slug: string): SectionSchema | undefined {
  return SECTION_SCHEMAS.find((s) => s.slug === slug);
}
