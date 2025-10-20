import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      { hostname: "icons.llamao.fi", protocol: "https" },
      { hostname: "imagedelivery.net", protocol: "https" },
    ],
  },
};

export default nextConfig;
