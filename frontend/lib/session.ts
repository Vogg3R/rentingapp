import type { AuthSessionUser, AuthSuccessResponse } from "@/types/auth";

const TOKEN_KEY = "elden_ele_token";
const REFRESH_KEY = "elden_ele_refresh";
const USER_KEY = "elden_ele_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const u = parsed as Record<string, unknown>;
    if (typeof u.id !== "string") return null;
    const emailOk = u.email === null || typeof u.email === "string";
    const phoneOk = u.phone === null || typeof u.phone === "string";
    if (!emailOk || !phoneOk) return null;
    return {
      id: u.id,
      email: u.email as string | null,
      phone: u.phone as string | null,
    };
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function persistAuthSession(data: AuthSuccessResponse): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      sessionStorage.setItem(REFRESH_KEY, data.refresh_token);
    }
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
  } catch {
    /* yok say */
  }
}

export function clearAuthSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    /* yok say */
  }
}

export function isLoggedIn(): boolean {
  return Boolean(getAuthToken());
}
