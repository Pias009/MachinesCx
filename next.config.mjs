/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  webpack: (config, { dev }) => {
    if (dev) {
      // No filesystem cache in dev — no stale chunks
      config.cache = false;
    }
    return config;
  },
  // Unique build ID every restart so browser never reuses old chunks
  generateBuildId: async () => `build-${Date.now()}`,
  // Tell browser never to cache _next/static in dev
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
          { key: 'Pragma',        value: 'no-cache' },
          { key: 'Expires',      value: '0' },
        ],
      },
    ];
  },
};
export default nextConfig;
