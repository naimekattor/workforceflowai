const DEFAULT_API_BASE_URL = "http://10.10.13.75:8500";

export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
  return apiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
}

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getApiBaseUrl()}/${path.replace(/^\/+/, "")}`;
}
