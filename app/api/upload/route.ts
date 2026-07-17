import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "only png / jpg / webp / gif allowed" }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "max 5 MB" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buf.toString("base64")}`;
  const { url } = await uploadImage(base64, "cx-inquiry-parts");
  return NextResponse.json({ url });
}
