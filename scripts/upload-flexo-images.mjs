// Run once: node scripts/upload-flexo-images.mjs
// Uploads the local flexo machine images to Cloudinary and prints the resulting URLs.

import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

cloudinary.config({
  cloud_name: "dpyhwgsqk",
  api_key:    "215163174351769",
  api_secret: "IknOf4EtbmcnqjcJcanCFWkxsO8",
  secure:     true,
});

const IMAGES = [
  { file: "flexo-1.png", publicId: "cx-machinery/printing/flexo-1", alt: "AI-2C Flexo press — angled studio render" },
  { file: "flexo-2.png", publicId: "cx-machinery/printing/flexo-2", alt: "AI-4C Flexo press — clean studio render" },
  { file: "flexo-3.png", publicId: "cx-machinery/printing/flexo-3", alt: "Flexo press in production — factory floor" },
  { file: "flexo-4.png", publicId: "cx-machinery/printing/flexo-4", alt: "AI-6C Flexo press — teal accent panels" },
  { file: "flexo-5.png", publicId: "cx-machinery/printing/flexo-5", alt: "AI-8C Flexo press — full side profile" },
];

const publicDir = path.resolve(__dirname, "../public/machines");

for (const img of IMAGES) {
  const localPath = path.join(publicDir, img.file);
  console.log(`Uploading ${img.file}…`);
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      public_id:     img.publicId,
      overwrite:     true,
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });
    console.log(`  ✓ ${result.secure_url}`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
}

console.log("\nDone. Update NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME in .env.local to use CldImage.");
