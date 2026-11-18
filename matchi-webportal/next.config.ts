import type { NextConfig } from "next";

// Empty by default — the app serves at "/". Only set NEXT_PUBLIC_BASE_PATH
// if this ever needs to be mounted under a sub-path of another site (e.g.
// reverse-proxied from a different service).
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  basePath,
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
