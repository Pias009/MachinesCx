import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB }   from "@/lib/mongodb";
import { uploadImage, deleteImage } from "@/lib/cloudinary";
import { verifySessionToken } from "@/lib/adminAuth";
import MachineImage    from "@/models/MachineImage";

async function requireAdmin(request: NextRequest): Promise<boolean> {
  const sessionCookie = request.cookies.get("admin_session")?.value ?? cookies().get("admin_session")?.value;
  return !!sessionCookie && await verifySessionToken(sessionCookie);
}

// GET /api/images?slug=flexo-2c
// GET /api/images?category=printing
export async function GET(req: NextRequest) {
  await connectDB();
  const slug     = req.nextUrl.searchParams.get("slug");
  const category = req.nextUrl.searchParams.get("category");

  const filter: Record<string, string> = {};
  if (slug)     filter.machineSlug = slug;
  if (category) filter.category    = category;

  const images = await MachineImage.find(filter).sort({ order: 1, createdAt: -1 });
  return NextResponse.json({ images });
}

// POST /api/images
// Body: { machineSlug, category, url, alt?, order? }
// url can be a Cloudinary URL, public URL, or base64 data URI
export async function POST(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  let body: { machineSlug?: string; category?: string; url?: string; alt?: string; order?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { machineSlug, category, url, alt = "", order = 0 } = body;

  if (!machineSlug || !category || !url) {
    return NextResponse.json({ error: "machineSlug, category, and url are required" }, { status: 400 });
  }

  const folder   = `cx-machinery/${category}/${machineSlug}`;
  const uploaded = await uploadImage(url, folder);

  const doc = await MachineImage.create({
    machineSlug,
    category,
    publicId: uploaded.publicId,
    url:      uploaded.url,
    alt,
    order,
  });

  return NextResponse.json({ image: doc }, { status: 201 });
}

// DELETE /api/images?publicId=cx-machinery/printing/flexo-2c/img1
export async function DELETE(req: NextRequest) {
  if (!await requireAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await connectDB();
  const publicId = req.nextUrl.searchParams.get("publicId");
  if (!publicId) {
    return NextResponse.json({ error: "publicId is required" }, { status: 400 });
  }

  await deleteImage(publicId);
  await MachineImage.deleteOne({ publicId });

  return NextResponse.json({ ok: true });
}
