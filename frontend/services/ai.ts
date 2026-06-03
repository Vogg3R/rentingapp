import { LISTING_CATEGORIES } from "@/constants/listing-categories";
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

/** AI'dan gelen kategori metnini form select değerine eşler */
function normalizeAiCategory(raw: string): string {
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase();

  const exactValue = LISTING_CATEGORIES.find((c) => c.value === lower || c.value === trimmed);
  if (exactValue) return exactValue.value;

  const exactLabel = LISTING_CATEGORIES.find(
    (c) => c.label.toLowerCase() === lower
  );
  if (exactLabel) return exactLabel.value;

  const partial = LISTING_CATEGORIES.find(
    (c) =>
      c.label.toLowerCase().includes(lower) ||
      lower.includes(c.label.toLowerCase())
  );
  if (partial) return partial.value;

  return "diger";
}

export async function generateListingWithAI(
  rawText: string
): Promise<ApiResult<AIGenerateListingResponse>> {
  try {
    const res = await authorizedFetch("/ai/generate-listing", {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText.trim() }),
    });
    const parsed = await parseJson<AIGenerateListingResponse>(
      res,
      "Yapay zeka ilanı oluşturamadı."
    );
    if (!parsed.ok) return parsed;

    return {
      ok: true,
      data: {
        ...parsed.data,
        category: normalizeAiCategory(parsed.data.category),
      },
    };
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
