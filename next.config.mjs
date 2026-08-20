import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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
    // Pre-bundle these large libs so they aren't re-parsed on every page load
    optimizePackageImports: ["gsap", "lucide-react", "next-intl"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Serve images at extra-small sizes for mobile — reduces bytes on slow connections
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  generateBuildId: async () => `build-${Date.now()}`,
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
