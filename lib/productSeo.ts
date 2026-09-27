// ---------------------------------------------------------------------------
// Per-product SEO fields — explicit, hand-written values (never generated
// from a sentence template). Keyed by product slug; slugs are indexed URLs
// and must not change.
//
// Applied on top of whatever the CMS returns (see applyProductSeo), so the
// live MongoDB copy and the bundled data/products.json fallback render the
// same title / H1 / description / JSON-LD name.
//
// Titles are final as of 2026-09-27 — do not change them for 8 weeks.
// ---------------------------------------------------------------------------
import type { ProductFamily, ProductSeo } from "@/lib/products";

type Entry = Omit<ProductSeo, "short">;

// the date these SEO fields last changed — feeds sitemap <lastmod>
const SEO_UPDATED = "2026-09-27";

const d = (e: Omit<Entry, "updatedAt">): Entry => ({ ...e, updatedAt: SEO_UPDATED });

export const PRODUCT_SEO: Record<string, Entry> = {
  // ── Film blowing ──
  "abcde-2200": d({
    model: "ABCDE-2200",
    title: "ABCDE-2200 5-Layer Blown Film Line 2100mm | Ashal Innomech",
    h1: "ABCDE-2200 Five-Layer Co-extrusion Blown Film Line",
    description: "ABCDE-2200 5-layer co-extrusion blown film line: 2100 mm film width, 400 kg/h output, 5 × 60 mm screws. Full specs, FAQ and factory quote.",
    intro: "The ABCDE-2200 Five-Layer Co-extrusion Blown Film Line produces film up to 2100 mm wide at a maximum output of 400 kg/h from five 60 mm screws. It makes 0.03–0.15 mm five-layer film for packaging and industrial use.",
  }),
  "abc-multilayer-small": d({
    model: "ABC",
    title: "ABC Co-Extrusion Blown Film Line 800–1200mm | Ashal Innomech",
    h1: "ABC Multi-layer Blown Film Line — 800 / 1000 / 1200",
    description: "ABC multi-layer co-extrusion blown film line in 800, 1000 and 1200 mm widths, up to 150 kg/h. Compare sizes, specs and get a factory quote.",
    intro: "The ABC Multi-layer Blown Film Line in 800, 1000 and 1200 sizes produces 400–1200 mm wide film at 150–200 kg/h. It co-extrudes LDPE, LLDPE and PBAT+PLA into 0.02–0.15 mm multi-layer film for packaging and bag making.",
  }),
  "abc-multilayer-large": d({
    model: "ABC",
    title: "ABC Co-Extrusion Blown Film Line 1500–2300mm | Ashal Innomech",
    h1: "ABC Multi-layer Blown Film Line — 1500 / 1800 / 2300",
    description: "Wide-web ABC multi-layer blown film line in 1500, 1800 and 2300 mm widths, up to 240 kg/h. Full specs and factory quote.",
    intro: "The ABC Multi-layer Blown Film Line in 1500, 1800 and 2300 sizes produces 1000–2300 mm wide film at 240–400 kg/h. It co-extrudes 0.02–0.15 mm multi-layer film for wide-web and heavy-duty applications.",
  }),
  "abc-cx-series": d({
    model: "CX-ABC",
    title: "CX-ABC Multi-Layer Blown Film Line 1300–2200mm | Ashal",
    h1: "CX-ABC Multi-layer Blown Film Line — 1300 / 1600 / 2200",
    description: "CX-ABC multi-layer blown film line in 1300, 1600 and 2200 mm widths, up to 180 kg/h. Compare sizes, specs and request a quote.",
    intro: "The CX-ABC Multi-layer Blown Film Line in 1300, 1600 and 2200 sizes produces 800–2000 mm wide film at 180–280 kg/h. It co-extrudes LDPE, LLDPE and PBAT+PLA blends into 0.02–0.15 mm film for packaging and bag making.",
  }),
  "aba-1000-1500": d({
    model: "ABA",
    title: "ABA 3-Layer Film Blowing Machine 1000–1500mm | Ashal Innomech",
    h1: "ABA Three-layer Film Blowing Machine — 1000 / 1200 / 1500",
    description: "ABA 3-layer film blowing machine in 1000, 1200 and 1500 mm widths for HDPE/LDPE film with CaCO3 filler in the core layer. Specs and quote.",
    intro: "The ABA Three-layer Film Blowing Machine in 1000, 1200 and 1500 sizes produces 500–1500 mm wide film at up to 150 kg/h HDPE or 180 kg/h LDPE. It makes 0.006–0.10 mm three-layer HDPE and LDPE film for bag production.",
  }),
  "aba-800-1200": d({
    model: "ABA",
    title: "ABA 4-Screw Film Blowing Machine 800–1200mm | Ashal Innomech",
    h1: "ABA Three-layer Film Blowing Machine — 800 / 1000 / 1200 (Four-Screw)",
    description: "Four-screw ABA 3-layer film blowing machine in 800, 1000 and 1200 mm widths. Specs, output by size and direct factory quote.",
    intro: "The ABA Three-layer Film Blowing Machine (Four-Screw) in 800, 1000 and 1200 sizes produces 400–1200 mm wide film at up to 240 kg/h HDPE or 320 kg/h LDPE. Twin die heads make 0.006–0.10 mm three-layer film for bag production.",
  }),
  "aba-cx-series": d({
    model: "CX-ABA",
    title: "CX-ABA 3-Layer Film Blowing Machine 700–1100mm | Ashal",
    h1: "CX-ABA Three-layer Film Blowing Machine — 700 / 900 / 1100",
    description: "Compact CX-ABA 3-layer film blowing machine in 700, 900 and 1100 mm widths for shopping and garbage bag film. Specs and quote.",
    intro: "The CX-ABA Three-layer Film Blowing Machine in 700, 900 and 1100 sizes produces 100–1000 mm wide film at up to 100 kg/h HDPE or 120 kg/h LDPE. It makes 0.006–0.10 mm HDPE, LDPE and LLDPE film for shopping and garbage bags.",
  }),
  "s-mini-double": d({
    model: "S-Mini",
    title: "S-Mini Double-Head Film Blowing Machine 400×2/600×2 | Ashal",
    h1: "S-Mini Double-head Film Blowing Machine — 400×2 / 600×2",
    description: "S-Mini double-die-head film blowing machine, 400×2 and 600×2 mm, producing two films at once for small bags. Specs and quote.",
    intro: "The S-Mini Double-head Film Blowing Machine in 400×2 and 600×2 sizes runs two die heads at once, producing two films 100–600 mm wide at up to 55 kg/h LDPE per head. It makes 0.006–0.10 mm HDPE, LDPE and LLDPE film for small bags.",
  }),
  "s-wide": d({
    model: "S",
    title: "S Series Film Blowing Machine 1200–1800mm HDPE/LDPE | Ashal",
    h1: "S Single-layer Film Blowing Machine — 1200 / 1500 / 1800",
    description: "S series single-layer HDPE/LDPE film blowing machine in 1200, 1500 and 1800 mm widths. Full specs and direct factory quote.",
    intro: "The S Single-layer Film Blowing Machine in 1200, 1500 and 1800 sizes produces 800–1800 mm wide film at up to 150 kg/h HDPE or 200 kg/h LDPE. It makes 0.006–0.10 mm HDPE, LDPE and LLDPE film for wide-format bags.",
  }),
  "s-standard": d({
    model: "S",
    title: "S Series Film Blowing Machine 600–1000mm HDPE/LDPE | Ashal",
    h1: "S Single-layer Film Blowing Machine — 600 / 800 / 1000",
    description: "S series single-layer HDPE/LDPE film blowing machine in 600, 800 and 1000 mm widths for bag film. Full specs and factory quote.",
    intro: "The S Single-layer Film Blowing Machine in 600, 800 and 1000 sizes produces 100–1000 mm wide film at up to 100 kg/h HDPE or 120 kg/h LDPE. It makes 0.006–0.10 mm HDPE, LDPE and LLDPE film for everyday bag production.",
  }),
  "sb-printing-line": d({
    model: "SB",
    title: "SB Film Blowing Machine with Inline Printing | Ashal Innomech",
    h1: "SB Film Blowing & Inline Printing Line — 600 / 800 / 1000",
    description: "SB film blowing machine with inline flexo printing in 600, 800 and 1000 mm widths: blow and print bag film in one pass. Specs and quote.",
    intro: "The SB Film Blowing & Inline Printing Line in 600, 800 and 1000 sizes blows 100–1000 mm wide film at up to 120 kg/h LDPE and prints it in the same pass with ±0.2 mm registration. It produces printed 0.006–0.10 mm PE bag film.",
  }),
  "cx-25-lab": d({
    model: "CX-25",
    title: "CX-25 Lab Blown Film Machine 5–10 kg/h | Ashal Innomech",
    h1: "CX-25 Laboratory Blown Film Line",
    description: "CX-25 benchtop lab blown film line, 5–10 kg/h, for testing PE, PBAT and PLA resins and masterbatch in R&D and QC labs. Specs and quote.",
    intro: "The CX-25 Laboratory Blown Film Line is a benchtop 25 mm single-screw line producing 100–220 mm wide film at 5–10 kg/h. It makes 0.006–0.10 mm HDPE, LDPE and PBAT test film for resin, masterbatch and QC trials.",
  }),

  // ── Bag making ──
  "t-pro-heatseal": d({
    model: "T-PRO",
    title: "T-PRO Heat Seal Bag Making Machine 500×3/600×2 | Ashal",
    h1: "T-PRO Heat Seal Bag Making Machine — 500×3 / 600×2",
    description: "T-PRO multi-lane heat seal bag making machine, 500×3 or 600×2 lanes, 120–300 pcs/min, for PE and biodegradable bags. Specs and quote.",
    intro: "The T-PRO Heat Seal Bag Making Machine in 500×3 and 600×2 lane configurations makes bags 300–700 mm long at 120–300 pcs/min. It seals and cuts 0.02–0.3 mm film of up to 4 layers into PE and biodegradable bags.",
  }),
  "tg-pro": d({
    model: "TG-500×2 PRO",
    title: "TG-500×2 PRO Twin-Lane Bag Making Machine | Ashal Innomech",
    h1: "TG-500×2 PRO Twin-Lane Bag Making Machine",
    description: "TG-500×2 PRO twin-lane bag making machine, up to 250 pcs/min, for T-shirt and flat bags. Full specs and direct factory quote.",
    intro: "The TG-500×2 PRO Twin-Lane Bag Making Machine converts bags 200–500 mm wide and 450–850 mm long at up to 250 pcs/min. It runs thin 0.01–0.04 mm film for T-shirt and flat bags.",
  }),
  "tb-320": d({
    model: "CX-TB-320×6",
    title: "CX-TB-320×6 Six-Lane Small Bag Making Machine | Ashal",
    h1: "CX-TB-320×6 Six-Lane Bag Making Machine",
    description: "CX-TB-320×6 six-lane bag making machine for small bags, 100 pcs/min per lane (600 total). Full specs and factory quote.",
    intro: "The CX-TB-320×6 Six-Lane Bag Making Machine makes bags up to 320 mm wide and 250–600 mm long on six lanes at 100 pcs/min each (600 pcs/min total). It converts 0.01–0.04 mm film into small bags.",
  }),
  "f-pro-bottomseal": d({
    model: "F-PRO",
    title: "F-PRO Bottom Seal Bag Making Machine 1000–1600mm | Ashal",
    h1: "F-PRO Bottom Seal Bag Making Machine — 1000 / 1300 / 1600",
    description: "F-PRO bottom seal bag making machine in 1000, 1300 and 1600 mm widths for garbage, liner and flat bags. Specs and factory quote.",
    intro: "The F-PRO Bottom Seal Bag Making Machine in 1000, 1300 and 1600 sizes makes bottom-seal bags up to 1600 mm wide and 200–3000 mm long at up to 80 pcs/min. It handles 0.03–0.6 mm film for garbage bags, liners and flat bags.",
  }),
  "heatseal-750-1150": d({
    model: "Heat-Seal 750/950/1150",
    title: "Heat Seal Bag Making Machine 750/950/1150mm | Ashal Innomech",
    h1: "Heat Seal Bag Making Machine — 750 / 950 / 1150",
    description: "Standard heat seal bag making machine in 750, 950 and 1150 mm widths, 20–120 pcs/min, for flat and T-shirt bags. Specs and quote.",
    intro: "The Heat Seal Bag Making Machine in 750, 950 and 1150 widths makes bags up to 1150 mm wide and 100–1800 mm long at 20–120 pcs/min. It seals PE film of 0.01–0.10 mm per layer into flat and T-shirt bags.",
  }),
  "heatseal-750-1150-hd": d({
    model: "Heavy Heat-Seal 750/950/1150",
    title: "Heavy-Duty Heat Seal Bag Machine 750–1150mm | Ashal Innomech",
    h1: "Heavy-Duty Heat Seal Bag Making Machine — 750 / 950 / 1150",
    description: "Heavy-duty heat seal bag making machine in 750, 950 and 1150 mm widths, 20–120 pcs/min, for thick PE bags. Specs and quote.",
    intro: "The Heavy-Duty Heat Seal Bag Making Machine in 750, 950 and 1150 widths makes bags up to 1150 mm wide and 100–3000 mm long at 20–120 pcs/min. It seals thicker PE film of 0.01–0.20 mm per layer into heavy-duty bags.",
  }),
  "heatseal-narrow": d({
    model: "Narrow Heat-Seal 350/450",
    title: "Narrow Heat Seal Bag Making Machine 350/450mm | Ashal",
    h1: "Narrow Heat Seal Bag Making Machine — 350 / 450",
    description: "Narrow heat seal bag making machine in 350 and 450 mm widths, 30–150 pcs/min, for small flat and T-shirt bags. Specs and quote.",
    intro: "The Narrow Heat Seal Bag Making Machine in 350 and 450 widths makes bags 50–450 mm wide and 100–1800 mm long at up to 150 pcs/min. It seals film of 0.01–0.10 mm per layer into small flat and T-shirt bags.",
  }),
  "rb-vegetable": d({
    model: "CX-RB",
    title: "CX-RB T-Shirt Vest & Vegetable Bag Machine | Ashal Innomech",
    h1: "CX-RB T-Shirt Vest & Vegetable Bag Making Machine — 400×2 / 500×2",
    description: "CX-RB two-lane machine for T-shirt vest bags and vegetable bags on roll, 400×2 or 500×2 mm. Full specs and factory quote.",
    intro: "The CX-RB T-Shirt Vest & Vegetable Bag Making Machine in 400×2 and 500×2 sizes makes bags 80–400 mm wide on two lanes, at up to 230 flat or 190 T-shirt bags per minute per lane. It converts 0.01–0.10 mm film into vest and vegetable bags.",
  }),
  "rgb-rollbag": d({
    model: "CX-RGB",
    title: "CX-RGB Bag on Roll Making Machine 1000/1200mm | Ashal",
    h1: "CX-RGB Bag on Roll Making Machine — 1000 / 1200",
    description: "CX-RGB bag-on-roll making machine in 1000 and 1200 mm widths, 60–140 pcs/min, with perforation and auto roll change. Specs and quote.",
    intro: "The CX-RGB Bag on Roll Making Machine in 1000 and 1200 sizes makes bags up to 1100 mm wide and 1500 mm long at 40–140 pcs/min. It converts thin 0.008–0.05 mm PE film into perforated bags on roll.",
  }),
  "rollbag-continuous": d({
    model: "Continuous Roll Bag",
    title: "Continuous Bag on Roll Making Machine 60–220 pcs/min | Ashal",
    h1: "Continuous Bag on Roll Making Machine",
    description: "Continuous bag-on-roll making machine, 60–220 pcs/min, for coreless and cored rolls of produce, garbage and freezer bags. Specs and quote.",
    intro: "The Continuous Bag on Roll Making Machine makes finished bags 80–300 mm wide and 500–1500 mm long at 60–220 pcs/min. It converts ultra-thin 0.006–0.025 mm film into coreless or cored rolls of produce, garbage and freezer bags.",
  }),
  "sb-pe-pbat": d({
    model: "CX-SB",
    title: "CX-SB Biodegradable PBAT & PE Bag Making Machine | Ashal",
    h1: "CX-SB PBAT & PE Bag Making Machine — 800 / 500×2",
    description: "CX-SB bag making machine for biodegradable PBAT/PLA and PE film, 800 or 500×2 mm, up to 200 pcs/min. Specs and factory quote.",
    intro: "The CX-SB PBAT & PE Bag Making Machine in 800 and 500×2 sizes makes bags up to 700 mm wide at 200 pcs/min, or 200 pcs/min per lane on the twin-lane model. It converts 0.008–0.05 mm PE and biodegradable PBAT film into bags.",
  }),
  "cx-260": d({
    model: "CX-260",
    title: "CX-260 Compact PE & PBAT Bag Making Machine | Ashal Innomech",
    h1: "CX-260 Compact Bag Making Machine",
    description: "CX-260 compact bag making machine for PE and PBAT bags under 235 mm wide, 150–180 pcs/min. Full specs and direct factory quote.",
    intro: "The CX-260 Compact Bag Making Machine makes bags under 235 mm wide and 250–450 mm long at 150–180 pcs/min. It converts 0.008–0.03 mm PE and PBAT film into small bags.",
  }),
  "gb-garbage": d({
    model: "CX-GB",
    title: "CX-GB Garbage Bag on Roll Making Machine | Ashal Innomech",
    h1: "CX-GB Garbage Bag on Roll Making Machine — 1000 / 1200",
    description: "CX-GB garbage bag on roll machine in 1000 and 1200 mm widths, 40–140 pcs/min, for star-seal and flat garbage bags. Specs and quote.",
    intro: "The CX-GB Garbage Bag on Roll Making Machine in 1000 and 1200 sizes makes garbage bags 500–1000 mm wide at up to 140 pcs/min. It converts 0.007–0.04 mm HDPE or 0.02–0.05 mm LDPE film into garbage bags on roll.",
  }),

  // ── Recycling ──
  "cx-pelletizing": d({
    model: "CX",
    title: "CX Plastic Film Recycling & Pelletizing Line | Ashal Innomech",
    h1: "CX Recycling & Pelletizing Line — 100 / 120",
    description: "CX recycling and pelletizing line for PE/PP film, woven bags and printed scrap, 100–120 kg/h. Full specs and factory quote.",
    intro: "The CX Recycling & Pelletizing Line turns film scrap into pellets at 100–120 kg/h (CX-100, 100 mm screw) or 120–150 kg/h (CX-120, 120 mm screw). It processes HDPE, LDPE and LLDPE film up to 0.50 mm thick, including edge trim.",
  }),

  // ── Printing ──
  "flexo-2c": d({
    model: "AI-2C",
    title: "AI-2C 2-Color CI Flexo Printing Machine | Ashal Innomech",
    h1: "AI-2C 2-Color CI Flexographic Printing Machine — 500 to 2000 mm",
    description: "AI-2C 2-colour CI flexo printing machine, 500–2000 mm web width, up to 120 m/min, for PE, PP and paper. Specs and factory quote.",
    intro: "The AI-2C 2-Color CI Flexographic Printing Machine prints two colours on 500–2000 mm webs at up to 120 m/min with ±0.2 mm registration. It prints PE, PP, PET, BOPP, paper and non-woven for bags and flexible packaging.",
  }),
  "flexo-4c": d({
    model: "AI-4C",
    title: "AI-4C 4-Color CI Flexo Printing Machine | Ashal Innomech",
    h1: "AI-4C 4-Color CI Flexographic Printing Machine — 500 to 2000 mm",
    description: "AI-4C 4-colour CI flexo printing machine, 500–2000 mm web width, up to 200 m/min, for PE, PP, BOPP and paper. Specs and quote.",
    intro: "The AI-4C 4-Color CI Flexographic Printing Machine prints four colours on 500–2000 mm webs at up to 200 m/min with a full-servo gearless drive and ±0.15 mm registration. It prints PE, PP, PET, BOPP, paper and non-woven packaging.",
  }),
  "flexo-6c": d({
    model: "AI-6C",
    title: "AI-6C 6-Color CI Flexo Printing Machine | Ashal Innomech",
    h1: "AI-6C 6-Color CI Flexographic Printing Machine — 500 to 2000 mm",
    description: "AI-6C 6-colour full-servo CI flexo press, 500–2000 mm web, up to 260 m/min, ±0.1 mm registration. Specs and factory quote.",
    intro: "The AI-6C 6-Color CI Flexographic Printing Machine prints six colours on 500–2000 mm webs at up to 260 m/min with a full-servo gearless drive and ±0.1 mm registration. It prints PE, PP, PET, BOPP, paper and non-woven packaging.",
  }),
  "flexo-8c": d({
    model: "AI-8C",
    title: "AI-8C 8-Color CI Flexo Printing Machine | Ashal Innomech",
    h1: "AI-8C 8-Color CI Flexographic Printing Machine — 500 to 2000 mm",
    description: "AI-8C 8-colour CI flexo printing machine, 500–2000 mm web width, up to 350 m/min, for high-end packaging film. Specs and quote.",
    intro: "The AI-8C 8-Color CI Flexographic Printing Machine prints eight colours on 500–2000 mm webs at up to 350 m/min with a full-servo gearless drive and ±0.1 mm registration. It prints high-end PE, PP, PET, BOPP and paper packaging.",
  }),
};

/** H1 without the " — sizes" suffix: the model code + machine type, used
 *  for image alt text and anywhere a shorter label is needed. */
const shortName = (h1: string) => h1.split(" — ")[0].trim();

// ── spec-table helpers for normalising long-form copy ──
const specValues = (f: ProductFamily, re: RegExp) =>
  f.specs.find((s) => re.test(s.label))?.values ?? [];
const uniq = (a: string[]) => Array.from(new Set(a.map((s) => s.trim()).filter(Boolean)));
const rangeSpan = (vals: string[]): string | null => {
  // "500–1000mm", "600–1200mm", "1000–1500mm" → "500–1500 mm"
  const nums = vals.flatMap((v) => (v.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
  if (!nums.length) return null;
  const lo = Math.min(...nums), hi = Math.max(...nums);
  return lo === hi ? `${hi} mm` : `${lo}–${hi} mm`;
};
const maxNum = (vals: string[]) => {
  const nums = vals.flatMap((v) => (v.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
  return nums.length ? Math.max(...nums) : null;
};

/** Rewrites templated long-form copy so every number agrees with the spec
 *  table (the source of truth). Fixes, per the 2026-09 SEO audit:
 *  - blown-film FAQ/applications "0.008 mm … 0.25 mm" thickness → spec range
 *  - "High Capacity" placeholder → the real max output from the spec table
 *  - "maximum film web width of <smallest model>" → the family's full range
 *  - flexo "±0.15 mm" registration → that model's spec value
 *  - flexo "up to 500mm web width" → the largest model's web width
 *  - "Energy Efficient" used as a power figure → dropped
 *  - boilerplate first-paragraph phrases (state-of-the-art, etc.)
 *  - old brand / name variants ("AIT Recycling", "Innomach", …) */
function normaliseText(text: string, f: ProductFamily, oldName: string, newName: string): string {
  let t = text;

  // TODO_OWNER: confirm ABCDE-2200 film thickness range (spec table says 0.03–0.15 mm).
  const thick = uniq(specValues(f, /^film thickness$/i));
  if (thick.length === 1) {
    const range = thick[0].replace(/mm$/i, " mm");
    t = t.replace(/micro-thin 0\.008 mm garment wrap up to heavy-duty 0\.25 mm industrial liner sheeting/g, `${range} film`);
    t = t.replace(/from 0\.008 mm up to 0\.25 mm/g, range);
  }

  if (/High Capacity/.test(t)) {
    const hd = maxNum(specValues(f, /output · hdpe/i));
    const ld = maxNum(specValues(f, /output · ldpe/i));
    const out = hd && ld ? `${hd} kg/h (HDPE) / ${ld} kg/h (LDPE)` : hd ? `${hd} kg/h` : null;
    if (out) {
      t = t.replace(/output capacity \(High Capacity\)/g, `output capacity (${out})`);
      t = t.replace(/High Capacity/g, out);
    }
  }

  const widths = specValues(f, /^film width$/i);
  if (widths.length > 1) {
    const span = rangeSpan(widths);
    const first = widths[0];
    if (span) {
      t = t.split(`maximum film web width of ${first}`).join(`film web width range of ${span}`);
      t = t.split(`web width of ${first}`).join(`web width range of ${span}`);
      t = t.split(`entire ${first} web width`).join(`entire ${span} web width range`);
    }
  }

  if (f.category === "printing") {
    const reg = uniq(specValues(f, /registration accuracy/i));
    if (reg.length === 1) t = t.replace(/±0\.15 mm/g, reg[0].replace(/mm$/, " mm"));
    const web = specValues(f, /max web width/i);
    const top = web[web.length - 1];
    if (top) {
      t = t.replace(/up to 500mm web width/g, `up to ${top} web width`);
      t = t.replace(/web widths up to 500mm/g, `web widths up to ${top}`);
    }
  }
  t = t.replace(/ with total (?:connected capacity|connected load) of Energy Efficient/g, "");

  t = t.replace(/represents state-of-the-art blown film extrusion technology/g, "is a blown film extrusion line");
  t = t.replace(/ to guarantee superior plasticization, thermal stability, and melt homogeneity across all resin grade spectrums/g, " for consistent plasticization, thermal stability and melt homogeneity");
  t = t.replace(/state-of-the-art/gi, "modern");

  t = t.replace(/AIT\s+Recycling/g, "CX Recycling");
  t = t.replace(/Innomach/g, "Innomech").replace(/Ashal machinery/gi, "Ashal Innomech");

  if (oldName && oldName !== newName) t = t.split(oldName).join(newName);
  return t;
}

function normaliseSeoData(f: ProductFamily, oldName: string, newName: string, seo: Entry): ProductFamily["seoData"] {
  const sd = f.seoData;
  if (!sd) return sd;
  const n = (s: string) => (typeof s === "string" ? normaliseText(s, f, oldName, newName) : s);
  return {
    ...sd,
    metaTitle: seo.title,
    metaDescription: seo.description,
    overviewHeading: n(sd.overviewHeading),
    technicalArchitecture: n(sd.technicalArchitecture),
    applicationsAndMaterials: n(sd.applicationsAndMaterials),
    engineeringFeatures: n(sd.engineeringFeatures),
    utilityRequirements: n(sd.utilityRequirements),
    maintenanceProtocol: n(sd.maintenanceProtocol),
    commercialGuide: n(sd.commercialGuide),
    keyInnovations: (sd.keyInnovations ?? []).map((k) => ({ title: n(k.title), description: n(k.description) })),
    faqs: (sd.faqs ?? []).map((q) => ({ question: n(q.question), answer: n(q.answer) })),
  };
}

/** Overlays the explicit SEO fields onto a family: `seo` is attached,
 *  `name` becomes the H1 (so cards, breadcrumbs, alt text and JSON-LD all
 *  use one string), and templated long-form copy is normalised against
 *  the spec table. Idempotent. Families without an entry pass through. */
export function applyProductSeo(f: ProductFamily): ProductFamily {
  const seo = PRODUCT_SEO[f.slug];
  if (!seo) return f;
  if (f.seo?.title === seo.title && f.name === seo.h1) return f;
  const oldName = f.name;
  return {
    ...f,
    name: seo.h1,
    seo: { ...seo, short: shortName(seo.h1) },
    seoData: normaliseSeoData(f, oldName, seo.h1, seo),
  };
}

// Ordered for the homepage "All machine models" list and category menus.
export const CATEGORY_ORDER = ["film-blowing", "bag-making", "recycling", "printing"] as const;

// Downstream (next step in the film → print → bag chain) for each category —
// "Related Machines" always includes one model from here.
export const DOWNSTREAM: Record<string, string[]> = {
  "film-blowing": ["bag-making", "printing"],
  "printing": ["bag-making"],
  "bag-making": ["printing", "film-blowing"],
  "recycling": ["film-blowing"],
};

// Model names as they appear in news/guide copy → product page. Longer,
// more specific codes first so "CX-ABA" is matched before "ABA".
export const MODEL_MENTIONS: [string, string][] = [
  ["ABCDE-2200", "/products/film-blowing/abcde-2200"],
  ["CX-ABC", "/products/film-blowing/abc-cx-series"],
  ["CX-ABA", "/products/film-blowing/aba-cx-series"],
  ["CX-25", "/products/film-blowing/cx-25-lab"],
  ["TG-500×2 PRO", "/products/bag-making/tg-pro"],
  ["CX-TB-320×6", "/products/bag-making/tb-320"],
  ["CX-TB-320", "/products/bag-making/tb-320"],
  ["CX-RGB", "/products/bag-making/rgb-rollbag"],
  ["CX-RB", "/products/bag-making/rb-vegetable"],
  ["CX-SB", "/products/bag-making/sb-pe-pbat"],
  ["CX-260", "/products/bag-making/cx-260"],
  ["CX-GB", "/products/bag-making/gb-garbage"],
  ["T-PRO", "/products/bag-making/t-pro-heatseal"],
  ["F-PRO", "/products/bag-making/f-pro-bottomseal"],
  ["CX Recycling & Pelletizing Line", "/products/recycling/cx-pelletizing"],
  ["AI-2C", "/products/printing/flexo-2c"],
  ["AI-4C", "/products/printing/flexo-4c"],
  ["AI-6C", "/products/printing/flexo-6c"],
  ["AI-8C", "/products/printing/flexo-8c"],
  ["ABA", "/products/film-blowing/aba-1000-1500"],
  ["ABC", "/products/film-blowing/abc-multilayer-small"],
];
