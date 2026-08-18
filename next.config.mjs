import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    optimizeCss: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "picsum.photos" }, // dummy-test-x9000 placeholder images only
    ],
  },
  generateBuildId: async () => `build-${Date.now()}`,
  // Webpack's persistent filesystem cache has been intermittently
  // corrupting `next build` in this environment (manifests/chunks read
  // back as truncated/missing right after being written — "Cannot find
  // module './NNNN.js'", "Unexpected end of JSON input" reading a
  // manifest, etc.), unrelated to any application code. Disabling it for
  // production builds trades a slightly slower cold build for reliability;
  // dev mode is unaffected and keeps its own separate cache.
  webpack: (config, { dev }) => {
    if (!dev) config.cache = { type: "memory" };
    return config;
  },
  async headers() {
    return [
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
