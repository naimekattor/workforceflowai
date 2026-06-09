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

type ImageRemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

function imageRemotePatternFromUrl(
  value: string | undefined
): ImageRemotePattern | undefined {
  if (!value) return undefined;

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }

    return {
      protocol: url.protocol.slice(0, -1) as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: "/**",
    };
  } catch {
    return undefined;
  }
}

function remoteImagePatterns(): ImageRemotePattern[] {
  const patterns = [
    imageRemotePatternFromUrl(process.env.NEXT_PUBLIC_BASE_URL),
    imageRemotePatternFromUrl(process.env.NEXT_PUBLIC_FRONTEND_URL),
  ].filter((pattern): pattern is ImageRemotePattern => Boolean(pattern));

  return Array.from(
    new Map(
      patterns.map((pattern) => [
        `${pattern.protocol}//${pattern.hostname}:${pattern.port}${pattern.pathname}`,
        pattern,
      ])
    ).values()
  );
}

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedDevOrigins(),
  output: "standalone",
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: remoteImagePatterns(),
  },
};

export default nextConfig;
