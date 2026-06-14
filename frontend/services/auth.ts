import type { AuthSuccessResponse, AuthSessionUser } from "@/types/auth";
import { resolveBackendRootUrl } from "@/services/api";

export type AuthResult =
  | { ok: true; data: AuthSuccessResponse }
  | { ok: false; message: string };

function extractErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return "İstek sunucuya uygun değil.";
  }
  return fallback;
}

function isAuthSessionUser(value: unknown): value is AuthSessionUser {
  if (typeof value !== "object" || value === null) return false;
  const u = value as Record<string, unknown>;
  if (typeof u.id !== "string" || u.id.length === 0) return false;
  const emailOk = u.email === null || typeof u.email === "string";
  const phoneOk = u.phone === null || typeof u.phone === "string";
  if (!emailOk || !phoneOk) return false;
  return (
    (typeof u.email === "string" && u.email.length > 0) ||
    (typeof u.phone === "string" && u.phone.length > 0)
  );
}

function isAuthSuccessResponse(body: unknown): body is AuthSuccessResponse {
  if (typeof body !== "object" || body === null) return false;
  const o = body as Record<string, unknown>;
  return (
    typeof o.access_token === "string" &&
    typeof o.refresh_token === "string" &&
    typeof o.token_type === "string" &&
    isAuthSessionUser(o.user)
  );
}

/**
 * E-posta veya telefon + şifre ile giriş.
 */
export async function loginWithIdentifierPassword(
  identifier: string,
  password: string
): Promise<AuthResult> {
  const base = resolveBackendRootUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: identifier.trim(), password }),
    });
  } catch {
    return {
      ok: false,
      message:
        "Sunucuya bağlanılamıyor. Backend klasöründe: `python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000`",
    };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, message: `Giriş yanıtı okunamadı (HTTP ${res.status}).` };
  }

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(
        body,
        `Giriş başarısız (HTTP ${res.status}).`
      ),
    };
  }

  if (isAuthSuccessResponse(body)) {
    return { ok: true, data: body };
  }
  return { ok: false, message: "Beklenmeyen giriş yanıtı." };
}

/**
 * Üyelik: e-posta veya GSM + şifre (en az 6 karakter).
 */
export async function registerWithContactPassword(
  contact: string,
  password: string
): Promise<AuthResult> {
  const base = resolveBackendRootUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: contact.trim(),
        password,
      }),
    });
  } catch {
    return {
      ok: false,
      message:
        "Sunucuya bağlanılamıyor. Vercel deploy'da NEXT_PUBLIC_BACKEND_URL (Render backend adresi) tanımlı mı? Yerelde backend çalışıyor mu?",
    };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return {
      ok: false,
      message: `Üyelik yanıtı okunamadı (HTTP ${res.status}).`,
    };
  }

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(
        body,
        `Üyelik başarısız (HTTP ${res.status}).`
      ),
    };
  }

  if (isAuthSuccessResponse(body)) {
    return { ok: true, data: body };
  }
  return { ok: false, message: "Beklenmeyen üyelik yanıtı." };
}

/**
 * Google id_token (credential) ile giriş veya otomatik üyelik.
 */
export async function loginWithGoogle(credential: string): Promise<AuthResult> {
  const base = resolveBackendRootUrl();
  let res: Response;
  try {
    res = await fetch(`${base}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
  } catch {
    return {
      ok: false,
      message: "Sunucuya bağlanılamıyor. Backend'in çalıştığından emin olun.",
    };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, message: `Google giriş yanıtı okunamadı (HTTP ${res.status}).` };
  }

  if (!res.ok) {
    return {
      ok: false,
      message: extractErrorMessage(body, `Google girişi başarısız (HTTP ${res.status}).`),
    };
  }

  if (isAuthSuccessResponse(body)) {
    return { ok: true, data: body };
  }
  return { ok: false, message: "Beklenmeyen Google giriş yanıtı." };
}
