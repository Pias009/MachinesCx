import { NextRequest, NextResponse } from "next/server";
import { familyBySlug, familyImage, categoryBySlug } from "@/lib/products";

export const runtime = "nodejs";

// Lightweight machine summaries for chat-rendered cards/comparisons — avoids
// shipping the full catalogue (specs, gallery, reviews, …) to the client.
export async function GET(req: NextRequest) {
  const slugs = req.nextUrl.searchParams.get("slugs")?.split(",").filter(Boolean) ?? [];

  const machines = slugs.map(slug => {
    const f = familyBySlug(slug);
    if (!f) return null;
    return {
      slug: f.slug,
      name: f.name,
      series: f.series,
      tagline: f.tagline,
      category: f.category,
      categoryName: categoryBySlug(f.category)?.name ?? f.category,
      image: familyImage(f),
      models: f.models,
      specs: f.specs,
      href: `/products/${f.category}/${f.slug}`,
    };
  }).filter((m): m is NonNullable<typeof m> => m !== null);

  return NextResponse.json({ machines });
}
