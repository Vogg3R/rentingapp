import {
  clearAuthSession,
  getAuthToken,
  getRefreshToken,
  persistAuthSession,
} from "@/lib/session";
import { resolveBackendRootUrl } from "@/services/api";
import type { AuthSuccessResponse } from "@/types/auth";

export function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return "İstek sunucuya uygun değil.";
  }
  return fallback;
}

let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const base = resolveBackendRootUrl();
  const res = await fetch(`${base}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) {
    clearAuthSession();
    return null;
  }
  const body: unknown = await res.json();
  if (
    typeof body === "object" &&
    body !== null &&
    "access_token" in body &&
    "refresh_token" in body &&
    "user" in body
  ) {
    persistAuthSession(body as AuthSuccessResponse);
    return (body as AuthSuccessResponse).access_token;
  }
  clearAuthSession();
  return null;
}

export async function authorizedFetch(
  path: string,
  init: RequestInit = {},
  retry = true
): Promise<Response> {
  const base = resolveBackendRootUrl();
  const token = getAuthToken();
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(`${base}${path}`, { ...init, headers });

  if (res.status === 401 && retry) {
    if (!refreshInFlight) {
      refreshInFlight = refreshAccessToken().finally(() => {
        refreshInFlight = null;
      });
    }
    const newToken = await refreshInFlight;
    if (newToken) {
      return authorizedFetch(path, init, false);
    }
  }

  return res;
}
