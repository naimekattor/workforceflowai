import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
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
