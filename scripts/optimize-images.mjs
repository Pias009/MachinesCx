// Generates a .webp sibling for every PNG/JPEG under public/ and writes
// lib/webp-manifest.json listing the originals that have one. The image
// loader (lib/imageLoader.ts) serves the .webp for any path in the
// manifest — typically 80-90% smaller than the lossless PNG renders.
// Runs as `prebuild`; skips files whose .webp is already up to date.
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const RASTER = /\.(png|jpe?g)$/i;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (RASTER.test(name)) out.push(p);
  }
  return out;
}

const manifest = [];
let converted = 0;
for (const file of walk(PUBLIC)) {
  const webp = file.replace(RASTER, ".webp");
  let fresh = false;
  try { fresh = statSync(webp).mtimeMs >= statSync(file).mtimeMs; } catch {}
  if (!fresh) {
    await sharp(file).webp({ quality: 82, alphaQuality: 90, effort: 6 }).toFile(webp);
    converted++;
  }
  manifest.push("/" + relative(PUBLIC, file).split(sep).join("/"));
}

manifest.sort();
writeFileSync(join(ROOT, "lib/webp-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`optimize-images: ${manifest.length} images, ${converted} converted to webp`);
