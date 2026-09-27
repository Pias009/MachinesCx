import { NextRequest, NextResponse } from "next/server";
import { isCmsSection, readSection } from "@/lib/cmsStore";
import { applyProductSeo } from "@/lib/productSeo";
import type { ProductFamily } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, read-only content endpoint — the homepage sections fetch from here
// so admin edits show up without a rebuild.
export async function GET(_req: NextRequest, { params }: { params: { section: string } }) {
  if (!isCmsSection(params.section)) {
    return NextResponse.json({ error: "unknown section" }, { status: 404 });
  }
  try {
    let data = await readSection(params.section);
    // same SEO overlay the server-rendered pages use, so client-fetched
    // homepage cards show the product H1 rather than the raw CMS name
    if (params.section === "products") {
      const d = data as { families?: ProductFamily[] };
      if (Array.isArray(d.families)) data = { ...d, families: d.families.map(applyProductSeo) };
    }
    const res = NextResponse.json(data);
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
    return res;
  } catch {
    return NextResponse.json({ error: "read failed" }, { status: 500 });
  }
}
