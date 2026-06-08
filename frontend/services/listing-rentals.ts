import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type {
  ListingRentalConversationSummary,
  ListingRentalMessage,
  ListingRentalRequest,
  ListingRentalRequestPayload,
} from "@/types/listing-rentals";

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

function normalizeListingId(listingId: string): string | null {
  const trimmed = listingId.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createListingRentalRequest(
  listingId: string,
  payload: ListingRentalRequestPayload
): Promise<ApiResult<ListingRentalRequest>> {
  const normalizedId = normalizeListingId(listingId);
  if (!normalizedId) {
    return { ok: false, message: "Geçersiz ilan kimliği." };
  }

  try {
    const res = await authorizedFetch(`/listings/${normalizedId}/rental-requests`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (res.status === 404) {
      return {
        ok: false,
        message:
          "Kiralama talebi API'si bulunamadı. Backend'in güncel kodla çalıştığından emin olun.",
      };
    }
    return parseJson(res, "Kiralama talebi gönderilemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function listMyListingRentalConversations(): Promise<
  ApiResult<ListingRentalConversationSummary[]>
> {
  try {
    const res = await authorizedFetch("/listings/rental-requests");
    return parseJson(res, "Kiralama sohbetleri yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function getListingRentalConversation(
  requestId: string
): Promise<ApiResult<ListingRentalConversationSummary>> {
  try {
    const res = await authorizedFetch(`/listings/rental-requests/${requestId}`);
    return parseJson(res, "Sohbet bulunamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function listListingRentalMessages(
  requestId: string
): Promise<ApiResult<ListingRentalMessage[]>> {
  try {
    const res = await authorizedFetch(`/listings/rental-requests/${requestId}/messages`);
    return parseJson(res, "Mesajlar yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function sendListingRentalMessage(
  requestId: string,
  body: string
): Promise<ApiResult<ListingRentalMessage>> {
  try {
    const res = await authorizedFetch(`/listings/rental-requests/${requestId}/messages`, {
      method: "POST",
      body: JSON.stringify({ body }),
    });
    return parseJson(res, "Mesaj gönderilemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
