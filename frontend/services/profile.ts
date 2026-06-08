import { resolveBackendRootUrl } from "@/services/api";
import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type {
  ProfileSummary,
  ProfileUpdatePayload,
  PublicProfile,
} from "@/types/profile";

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

async function parseJson<T>(res: Response, fallback: string): Promise<ApiResult<T>> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return { ok: false, message: `Yanıt okunamadı (HTTP ${res.status}).` };
  }
  if (!res.ok) {
    return { ok: false, message: extractErrorMessage(body, fallback) };
  }
  return { ok: true, data: body as T };
}

export async function fetchPublicProfile(
  userId: string
): Promise<ApiResult<PublicProfile>> {
  try {
    const base = resolveBackendRootUrl();
    const res = await fetch(`${base}/profile/${userId}`, { cache: "no-store" });
    return parseJson(res, "Profil bulunamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function fetchMyProfile(): Promise<ApiResult<ProfileSummary>> {
  try {
    const res = await authorizedFetch("/profile/me");
    return parseJson(res, "Profil yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function updateProfile(
  data: ProfileUpdatePayload
): Promise<ApiResult<ProfileSummary>> {
  try {
    const res = await authorizedFetch("/profile/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return parseJson(res, "Profil güncellenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
