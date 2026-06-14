import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type { AdminDeal, AdminUser, AdminWithdrawal } from "@/types/admin";

type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

const ADMIN_KEY_STORAGE = "elden_ele_admin_key";

/** Admin anahtarını oturum boyunca saklar (X-Admin-Key header'ında kullanılır). */
export function setAdminKey(key: string): void {
  try {
    sessionStorage.setItem(ADMIN_KEY_STORAGE, key.trim());
  } catch {
    /* yok say */
  }
}

export function getAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE);
  } catch {
    return null;
  }
}

export function clearAdminKey(): void {
  try {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE);
  } catch {
    /* yok say */
  }
}

/** Admin endpoint'lerine X-Admin-Key başlığını ekleyerek istek atar. */
async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const key = getAdminKey();
  if (key) headers.set("X-Admin-Key", key);
  return authorizedFetch(path, { ...init, headers });
}

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

export async function getAllUsers(): Promise<ApiResult<AdminUser[]>> {
  try {
    const res = await adminFetch("/admin/users");
    return parseJson(res, "Kullanıcılar yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function deleteUser(
  userId: string
): Promise<ApiResult<{ message: string }>> {
  try {
    const res = await adminFetch(`/admin/users/${userId}`, { method: "DELETE" });
    return parseJson(res, "Kullanıcı silinemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function getPendingWithdrawals(): Promise<ApiResult<AdminWithdrawal[]>> {
  try {
    const res = await adminFetch("/admin/withdrawals/pending");
    return parseJson(res, "Para çekme talepleri yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function approveWithdrawal(
  transactionId: string
): Promise<ApiResult<AdminWithdrawal>> {
  try {
    const res = await adminFetch(`/admin/withdrawals/${transactionId}/approve`, {
      method: "POST",
    });
    return parseJson(res, "Para çekme talebi onaylanamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function rejectWithdrawal(
  transactionId: string
): Promise<ApiResult<AdminWithdrawal>> {
  try {
    const res = await adminFetch(`/admin/withdrawals/${transactionId}/reject`, {
      method: "POST",
    });
    return parseJson(res, "Para çekme talebi reddedilemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function getDisputedDeals(): Promise<ApiResult<AdminDeal[]>> {
  try {
    const res = await adminFetch("/admin/deals/disputed");
    return parseJson(res, "Kiralama işlemleri yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function refundDeal(dealId: string): Promise<ApiResult<{ id: string }>> {
  try {
    const res = await adminFetch(`/admin/deals/${dealId}/refund`, { method: "POST" });
    return parseJson(res, "İade işlemi başarısız.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
