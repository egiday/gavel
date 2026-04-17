import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pin the workspace root so turbopack doesn't walk up past a stray
  // package-lock.json in the home directory.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default nextConfig;
