import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type { AIGenerateListingResponse } from "@/types/ai";

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

export async function generateListingWithAI(
  rawText: string
): Promise<ApiResult<AIGenerateListingResponse>> {
  try {
    const res = await authorizedFetch("/ai/generate-listing", {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText.trim() }),
    });
    return parseJson<AIGenerateListingResponse>(
      res,
      "Yapay zeka ilanı oluşturamadı."
    );
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
