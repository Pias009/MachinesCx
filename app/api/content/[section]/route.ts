import { NextRequest, NextResponse } from "next/server";
import { isCmsSection, readSection } from "@/lib/cmsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Public, read-only content endpoint — the homepage sections fetch from here
// so admin edits show up without a rebuild.
export async function GET(_req: NextRequest, { params }: { params: { section: string } }) {
  if (!isCmsSection(params.section)) {
    return NextResponse.json({ error: "unknown section" }, { status: 404 });
  }
  try {
    const res = NextResponse.json(await readSection(params.section));
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=600");
    return res;
  } catch {
    return NextResponse.json({ error: "read failed" }, { status: 500 });
  }
}
