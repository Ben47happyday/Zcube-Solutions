import type { NextConfig } from "next";

// Empty by default — the app serves at "/". Only set NEXT_PUBLIC_BASE_PATH
// if this ever needs to be mounted under a sub-path of another site (e.g.
// reverse-proxied from a different service).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
  images: {
    // next/image's optimizer makes an internal self-fetch for local
    // images that doesn't account for basePath, 404ing against its own
    // server once this app is mounted under /solutions/matchihomeware.
    // Serving the originals directly sidesteps that entirely — fine for
    // a catalog this size.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
