import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type { ProfileSummary } from "@/types/profile";

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

export async function fetchMyProfile(): Promise<ApiResult<ProfileSummary>> {
  try {
    const res = await authorizedFetch("/profile/me");
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return { ok: false, message: `Yanıt okunamadı (HTTP ${res.status}).` };
    }
    if (!res.ok) {
      return {
        ok: false,
        message: extractErrorMessage(body, "Profil yüklenemedi."),
      };
    }
    return { ok: true, data: body as ProfileSummary };
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
