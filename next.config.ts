import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: [
    'localhost',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3000',
    '10.10.29.84',
    '10.10.29.84:3000',
    'quoted-gem-january-mills.trycloudflare.com'
  ],
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
