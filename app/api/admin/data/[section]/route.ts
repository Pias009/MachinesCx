import { NextRequest, NextResponse } from "next/server";
import { isCmsSection, readSection, writeSection } from "@/lib/cmsStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Auth is enforced by middleware for all /api/admin/* routes.

export async function GET(_req: NextRequest, { params }: { params: { section: string } }) {
  if (!isCmsSection(params.section)) {
    return NextResponse.json({ error: "unknown section" }, { status: 404 });
  }
  try {
    return NextResponse.json(await readSection(params.section));
  } catch {
    return NextResponse.json({ error: "read failed" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { section: string } }) {
  if (!isCmsSection(params.section)) {
    return NextResponse.json({ error: "unknown section" }, { status: 404 });
  }
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  try {
    await writeSection(params.section, body);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
