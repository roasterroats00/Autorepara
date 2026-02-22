import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // @ts-ignore - may not be in types yet for all versions
    turbopack: {
      root: ".",
    },
  },
};

export default nextConfig;
