import type { NextConfig } from "next";

const DEFAULT_DEV_ORIGINS = [
  "10.*.*.*",
  "172.16.*.*",
  "172.17.*.*",
  "172.18.*.*",
  "172.19.*.*",
  "172.20.*.*",
  "172.21.*.*",
  "172.22.*.*",
  "172.23.*.*",
  "172.24.*.*",
  "172.25.*.*",
  "172.26.*.*",
  "172.27.*.*",
  "172.28.*.*",
  "172.29.*.*",
  "172.30.*.*",
  "172.31.*.*",
  "192.168.*.*",
];

function splitCsvEnv(value: string | undefined): string[] | undefined {
  const entries = value
    ?.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  return entries?.length ? entries : undefined;
}

function allowedDevOrigins(): string[] | undefined {
  if (process.env.NODE_ENV === "production") return undefined;

  return [
    ...DEFAULT_DEV_ORIGINS,
    ...(splitCsvEnv(process.env.NEXT_ALLOWED_DEV_ORIGINS) ?? []),
  ];
}

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedDevOrigins(),
  distDir: "dist",
  output: "standalone",
};

export default nextConfig;
