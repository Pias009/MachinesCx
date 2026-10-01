// ---------------------------------------------------------------------------
// Explicit title / H1 / meta description for the homepage, category and
// static pages. Titles are final as of 2026-09-27 — do not change them for
// 8 weeks. Descriptions are written ≤155 chars so nothing is truncated.
// Per-product values live in lib/productSeo.ts.
// ---------------------------------------------------------------------------
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export interface PageSeo {
  title: string;
  h1: string;
  description: string;
}

export const PAGE_SEO: Record<string, PageSeo> = {
  "/": {
    title: "Blown Film, Bag Making & Flexo Machines | Ashal Innomech",
    h1: "Blown Film, Bag Making & Flexo Printing Machine Manufacturer",
    description: "Wenzhou factory making blown film lines, bag making machines, CI flexo presses and recycling lines since 2016. Specs, videos and quotes within 24 h.",
  },
  "/products": {
    title: "All Machines – Blown Film, Bag Making, Flexo | Ashal Innomech",
    h1: "All Machines",
    description: "Full catalogue of 30 machines: multi-layer blown film lines, bag making machines, CI flexo printing presses and plastic recycling pelletizing lines.",
  },
  "/products/film-blowing": {
    title: "Film Blowing Machines – ABA, ABC & 5-Layer | Ashal Innomech",
    h1: "Film Blowing Machines",
    description: "Single-layer, ABA 3-layer, ABC and 5-layer ABCDE blown film lines from 400 mm to 2300 mm width, plus a AI CX-25 lab line. Compare models and specs.",
  },
  "/products/bag-making": {
    title: "Bag Making Machines – T-Shirt, Roll & Bottom Seal | Ashal",
    h1: "Bag Making Machines",
    description: "Heat-seal, bottom-seal, bag-on-roll, T-shirt and garbage bag machines for PE and biodegradable PBAT film, up to 300 pcs/min. Compare 13 models.",
  },
  "/products/recycling": {
    title: "Plastic Recycling & Pelletizing Machines | Ashal Innomech",
    h1: "Plastic Recycling & Lab Lines",
    description: "AI CX recycling and pelletizing lines for PE/PP film and bag scrap at 100–120 kg/h, plus lab-scale film lines for R&D.",
  },
  "/products/printing": {
    title: "CI Flexo Printing Machines 2–8 Color | Ashal Innomech",
    h1: "Flexographic Printing Machines",
    description: "AI-series CI flexographic printing presses, 2 to 8 colours, 500–2000 mm web width, up to 350 m/min for PE, PP, BOPP, PET and paper.",
  },
  "/about": {
    title: "About Ashal Innomech – Wenzhou Machinery Factory Since 2016",
    h1: "About Wenzhou Ashal Innomech Technology",
    description: "Founded 2016 in Wenzhou, Zhejiang. 9,000 m² factory building blown film, bag making, printing and recycling machines, with support in Europe and Vietnam.",
  },
  "/production-line": {
    title: "Complete Plastic Bag Production Lines | Ashal Innomech",
    h1: "Complete Production Lines",
    description: "Film blowing, printing and bag making machines combined into one matched production line, planned, installed and commissioned by one supplier.",
  },
  "/news": {
    title: "News & Engineering Guides | Ashal Innomech",
    h1: "News & Engineering Guides",
    description: "Blown film, bag making, flexo printing and recycling guides from our engineers, plus product launches and trade show news.",
  },
  "/inquiries": {
    title: "Contact & Request a Quote | Ashal Innomech",
    h1: "Request a Quote",
    description: "Send your film width, output and bag type. Our engineers reply within 24 hours with a matched machine proposal and price.",
  },
  "/faq": {
    title: "Machine Buying FAQ – Shipping, Installation, Warranty | Ashal",
    h1: "Frequently Asked Questions",
    description: "Answers on lead time, shipping, installation, training, warranty and spare parts for Ashal Innomech film, bag and printing machines.",
  },
  "/tools/extrusion-calculator": {
    title: "Blown Film Extrusion Output Calculator | Ashal Innomech",
    h1: "Blown Film Extrusion Calculator",
    description: "Free calculator for blown film output, layflat width and film weight from die size, blow-up ratio, thickness and line speed.",
  },
};

/** Metadata for a path listed in PAGE_SEO. */
export function staticPageMetadata(path: string, locale: string): Metadata {
  const seo = PAGE_SEO[path];
  return pageMetadata({ locale, path: path === "/" ? "" : path, title: seo.title, description: seo.description });
}
