const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

export function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  return apiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
}

export function getServerApiBaseUrl(): string {
  const apiUrl =
    process.env.BACKEND_API_URL ||
    process.env.API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_BASE_URL ||
    "";

  return apiUrl.replace(/\/+$/, "").replace(/\/api$/i, "");
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

  const apiBaseUrl = getApiBaseUrl();
  return apiBaseUrl.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");
}

export function buildWebSocketUrl(path: string): string {
  if (/^wss?:\/\//i.test(path)) {
    return path;
  }

  return `${getWebSocketBaseUrl()}/${path.replace(/^\/+/, "")}`;
}
