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
  let socketUrl = apiBaseUrl.replace(/^http:/i, "ws:").replace(/^https:/i, "wss:");

  // Auto-upgrade to secure websocket protocol if the page is loaded over HTTPS
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    socketUrl = socketUrl.replace(/^ws:/i, "wss:");
  }

  return socketUrl;
}

export function buildWebSocketUrl(path: string): string {
  if (/^wss?:\/\//i.test(path)) {
    return path;
  }

  return `${getWebSocketBaseUrl()}/${path.replace(/^\/+/, "")}`;
}
