// next/image loader (next.config.mjs → images.loaderFile). Does the
// resizing/format work without Vercel image transformations:
// - Cloudinary URLs get f_auto + q_auto:eco + a width per srcset entry,
//   so browsers receive WebP at the size they display instead of the raw
//   multi-MB PNG the CMS stores. eco rather than plain q_auto: on these
//   product renders plain q_auto sometimes picks near-lossless (593KB vs
//   172KB for one 1080w hero) with no visible difference.
// - Local /public rasters get their pre-built .webp sibling
//   (scripts/optimize-images.mjs, run on prebuild).
// Anything else is returned untouched.
import webpManifest from "./webp-manifest.json";

const LOCAL_WEBP = new Set<string>(webpManifest);
const CLOUDINARY_UPLOAD = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/;

export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const cld = src.match(CLOUDINARY_UPLOAD);
  if (cld && !/\.svg($|\?)/i.test(src)) {
    return `${cld[1]}f_auto,q_${quality ?? "auto:eco"},w_${width},c_limit/${cld[2]}`;
  }
  if (LOCAL_WEBP.has(src)) return src.replace(/\.(png|jpe?g)$/i, ".webp");
  return src;
}
