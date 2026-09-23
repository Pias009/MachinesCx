import { readFileSync } from "node:fs";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// app/data/machines.json SEO pages duplicate catalogue products under a
// second URL (e.g. /products/film-blowing-machines/aba-three-layer-… vs
// /products/film-blowing/aba-1000-1500), splitting Google's ranking signals.
// 301 each one to its catalogue family (familySlug) so only one URL ranks.
const MACHINE_TO_CATALOGUE_CATEGORY = {
  "film-blowing-machines": "film-blowing",
  "bag-making-machines": "bag-making",
  "flexo-printing-machines": "printing",
  "recycling-machines": "recycling",
};
const machines = JSON.parse(readFileSync(new URL("./app/data/machines.json", import.meta.url), "utf8"));
const localized = (source, destination) => [
  { source, destination, permanent: true },
  { source: `/:locale(ar|hi)${source}`, destination: `/:locale${destination}`, permanent: true },
];
const duplicateRedirects = [
  ...machines.products
    .filter((p) => p.familySlug && MACHINE_TO_CATALOGUE_CATEGORY[p.category])
    // any category segment — the old page rendered under whichever one was linked
    .flatMap((p) => localized(`/products/:category/${p.slug}`, `/products/${MACHINE_TO_CATALOGUE_CATEGORY[p.category]}/${p.familySlug}`)),
  ...Object.entries(MACHINE_TO_CATALOGUE_CATEGORY)
    .flatMap(([from, to]) => localized(`/products/${from}`, `/products/${to}`)),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  // Strip console.* calls from production bundles — saves bytes & prevents leaking debug info
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizeCss: true,
  },
  images: {
    unoptimized: true, // Bypasses Vercel's 5,000 transformation/month limit and eliminates serverless CPU usage — images serve directly from global Edge CDN
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  async redirects() {
    return duplicateRedirects;
  },
  async headers() {
    return [
      {
        source: "/machines/:path*",
        headers: [
          { key: "Cache-Control", value: "public,max-age=31536000,immutable" },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          { key: "Cache-Control", value: "public,max-age=31536000,immutable" },
        ],
      },
      {
        // Hashed chunks under /_next/static/chunks and /_next/static/media
        // are safe to cache forever — a content change gives them a new
        // filename. CSS/manifests under /_next/static/<buildId>/ and
        // /_next/static/css are NOT filename-hashed per edit in this repo
        // (see generateBuildId above), so they must revalidate instead of
        // being cached immutably — otherwise browsers keep serving stale
        // CSS after a deploy, which is exactly what layout.tsx's cache-
        // clearing script is trying to prevent.
        source: "/_next/static/chunks/:path*",
        headers: [
          { key: "Cache-Control", value: "public,max-age=31536000,immutable" },
        ],
      },
      {
        source: "/_next/static/media/:path*",
        headers: [
          { key: "Cache-Control", value: "public,max-age=31536000,immutable" },
        ],
      },
      {
        source: "/_next/static/css/:path*",
        headers: [
          { key: "Cache-Control", value: "public,max-age=0,must-revalidate" },
        ],
      },
    ];
  },
};
export default withNextIntl(nextConfig);
