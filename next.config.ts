import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.workforceflow.ai",
      },
      {
        protocol: "https",
        hostname: "workforceflow.ai",
      },
    ],
  },
};

export default nextConfig;
