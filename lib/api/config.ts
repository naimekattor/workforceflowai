function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, "").replace(/\/api$/i, "");
}

export function getApiBaseUrl(): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || "");
}

export function getServerApiBaseUrl(): string {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || "");
}

export function buildApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getApiBaseUrl()}/${path.replace(/^\/+/, "")}`;
}

export function buildServerApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${getServerApiBaseUrl()}/${path.replace(/^\/+/, "")}`;
}

export function getWebSocketBaseUrl(): string {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) return wsUrl.replace(/\/+$/, "");

  const apiBaseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_BASE_URL || "");
  return apiBaseUrl.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
}

export function buildWebSocketUrl(path: string): string {
  if (/^wss?:\/\//i.test(path)) {
    return path;
  }

  return `${getWebSocketBaseUrl()}/${path.replace(/^\/+/, "")}`;
}
