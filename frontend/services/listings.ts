import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type { Listing, ListingCreatePayload } from "@/types/listings";

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

export async function createListing(
  payload: ListingCreatePayload
): Promise<ApiResult<Listing>> {
  try {
    const res = await authorizedFetch("/listings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return parseJson(res, "İlan oluşturulamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function getListing(id: string): Promise<ApiResult<Listing>> {
  try {
    const res = await authorizedFetch(`/listings/${id}`);
    return parseJson(res, "İlan bulunamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function deleteListing(id: string): Promise<ApiResult<{ message: string }>> {
  try {
    const res = await authorizedFetch(`/listings/${id}`, { method: "DELETE" });
    return parseJson(res, "İlan silinemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function searchListings(
  q?: string,
  category?: string
): Promise<ApiResult<Listing[]>> {
  try {
    const params = new URLSearchParams();
    if (q?.trim()) params.set("q", q.trim());
    if (category?.trim()) params.set("category", category.trim());
    const qs = params.toString();
    const res = await authorizedFetch(`/listings${qs ? `?${qs}` : ""}`);
    return parseJson(res, "İlanlar yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
