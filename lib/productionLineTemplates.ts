// ---------------------------------------------------------------------------
// Prebuilt "final product" production-line templates for the
// /production-line configurator page. Hand-authored marketing content —
// not admin/CMS-editable, unlike lib/products.ts. Each step's `slug` is
// resolved against the real catalogue (lib/products.ts) so specs/images
// stay live; only stage/role/tagline/whyBest copy is static here.
// ---------------------------------------------------------------------------
import templatesData from "@/data/production-line-templates.json";

export interface LineTemplateStep {
  slug: string;
  stage: string;
  role: string;
}

export interface LineTemplate {
  id: string;
  name: string;
  tagline: string;
  heroImage: string;
  bestFor: string;
  whyBest: string[];
  steps: LineTemplateStep[];
}

export const lineTemplates = templatesData.templates as LineTemplate[];

export const lineTemplateById = (id: string): LineTemplate | undefined =>
  lineTemplates.find((t) => t.id === id);
