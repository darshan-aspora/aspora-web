/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  webpack: (config, { dev }) => {
    if (dev) {
      // Disable webpack's persistent filesystem cache in development.
      // Next.js 14.2.x has a known issue where the .next/cache/webpack
      // pack files become stale between dev server restarts, causing
      // errors like "Cannot find module './948.js'" or
      // "e[o] is not a function" from webpack-runtime.js.
      // Setting cache to false prevents these stale cache errors entirely.
      // The trade-off is slightly slower dev server cold starts (~1-3s),
      // but eliminates the need to ever run `rm -rf .next` manually.
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
