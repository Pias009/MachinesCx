import machinesJson from "@/app/data/machines.json";

export interface SiteMetadata {
  siteName: string;
  siteUrl: string;
  contactEmail: string;
  phone: string;
  location: string;
}

export interface MachineCategory {
  id: string;
  name: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
}

export interface MachineVideo {
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration: string;
}

export interface MachineProduct {
  slug: string;
  category: string;
  name: string;
  model: string;
  seoTitle: string;
  metaDescription: string;
  specs: Record<string, string>;
  features: string[];
  faqs?: { question: string; answer: string }[];
  video?: MachineVideo;
}

export interface MachinesData {
  siteMetadata: SiteMetadata;
  categories: MachineCategory[];
  products: MachineProduct[];
}

export const machinesData: MachinesData = machinesJson as unknown as MachinesData;

export function getSiteMetadata(): SiteMetadata {
  return machinesData.siteMetadata;
}

export function getMachineCategories(): MachineCategory[] {
  return machinesData.categories;
}

export function getMachineCategoryBySlug(slug: string): MachineCategory | undefined {
  return machinesData.categories.find((c) => c.slug === slug || c.id === slug);
}

export function getMachineProducts(): MachineProduct[] {
  return machinesData.products;
}

export function getMachineProductBySlug(slug: string): MachineProduct | undefined {
  return machinesData.products.find((p) => p.slug === slug);
}

export function getMachineProductsByCategory(categorySlug: string): MachineProduct[] {
  return machinesData.products.filter(
    (p) => p.category === categorySlug || p.category === getMachineCategoryBySlug(categorySlug)?.id
  );
}

import newsJson from "@/data/news.json";

export interface Article {
  slug: string;
  title: string;
  seoTitle?: string;
  metaDescription?: string;
  date: string;
  author?: string;
  category: string;
  readTime?: string;
  summary?: string;
  excerpt?: string;
  image?: string;
  tags?: string[];
  relatedMachineSlugs?: string[];
}

export function getRelatedArticlesForMachine(machineSlug: string): Article[] {
  const articles = (newsJson as { articles: Article[] }).articles;
  if (!Array.isArray(articles)) return [];
  return articles.filter(
    (art) =>
      Array.isArray(art.relatedMachineSlugs) &&
      art.relatedMachineSlugs.includes(machineSlug)
  );
}

