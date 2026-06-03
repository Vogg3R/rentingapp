import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type { DealMessage, DealSummary, RentalDeal } from "@/types/requests";

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

export async function listMyDeals(): Promise<ApiResult<DealSummary[]>> {
  try {
    const res = await authorizedFetch("/deals");
    return parseJson(res, "İşlemler yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function listDealMessages(dealId: string): Promise<ApiResult<DealMessage[]>> {
  try {
    const res = await authorizedFetch(`/deals/${dealId}/messages`);
    return parseJson(res, "Mesajlar yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function sendDealMessage(
  dealId: string,
  body: string
): Promise<ApiResult<DealMessage>> {
  try {
    const res = await authorizedFetch(`/deals/${dealId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    return parseJson(res, "Mesaj gönderilemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function openDispute(
  dealId: string,
  reason: string
): Promise<ApiResult<RentalDeal>> {
  try {
    const res = await authorizedFetch(`/deals/${dealId}/dispute`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
    return parseJson(res, "Anlaşmazlık açılamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function confirmDelivery(dealId: string): Promise<ApiResult<RentalDeal>> {
  try {
    const res = await authorizedFetch(`/deals/${dealId}/confirm-delivery`, {
      method: "POST",
    });
    return parseJson(res, "Teslim onayı başarısız.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
