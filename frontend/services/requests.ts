import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type {
  ItemRequest,
  ItemRequestCreatePayload,
  Offer,
  RentalDeal,
} from "@/types/requests";

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

export async function listItemRequests(): Promise<ApiResult<ItemRequest[]>> {
  try {
    const res = await authorizedFetch("/requests");
    return parseJson(res, "Talepler yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function getItemRequest(id: string): Promise<ApiResult<ItemRequest>> {
  try {
    const res = await authorizedFetch(`/requests/${id}`);
    return parseJson(res, "Talep bulunamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function createItemRequest(
  payload: ItemRequestCreatePayload
): Promise<ApiResult<ItemRequest>> {
  try {
    const res = await authorizedFetch("/requests", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return parseJson(res, "İstek ilanı oluşturulamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function listOffers(requestId: string): Promise<ApiResult<Offer[]>> {
  try {
    const res = await authorizedFetch(`/requests/${requestId}/offers`);
    return parseJson(res, "Teklifler yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function createOffer(
  requestId: string,
  payload: { price_amount: number; description: string }
): Promise<ApiResult<Offer>> {
  try {
    const res = await authorizedFetch(`/requests/${requestId}/offers`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return parseJson(res, "Teklif gönderilemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function acceptOffer(
  requestId: string,
  offerId: string
): Promise<ApiResult<RentalDeal>> {
  try {
    const res = await authorizedFetch(
      `/requests/${requestId}/offers/${offerId}/accept`,
      { method: "POST" }
    );
    return parseJson(res, "Teklif kabul edilemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
