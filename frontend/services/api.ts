import type { ApiRootResponse } from "@/types/api";

/** Windows/Node bazen `localhost` → IPv6 seçer ve `fetch` düşebilir; 127.0.0.1 daha güvenilir. */
export function resolveBackendRootUrl(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim() ||
    process.env.BACKEND_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  return "http://127.0.0.1:8000";
}

function degradedResponse(hint: string): ApiRootResponse {
  return {
    mesaj: `API'ye bağlanılamıyor. ${hint} Örnek: backend klasöründe \`uvicorn main:app --reload --host 127.0.0.1 --port 8000\`.`,
  };
}

/**
 * FastAPI kök endpoint'inden veriyi çeker (sunucu bileşenlerinden çağrılır).
 * Ağ bağlantısı yoksa veya beklenmeyen yanıt varsa tam sayfa yerine uyarılı `mesaj` döner.
 */
export async function fetchRootApi(): Promise<ApiRootResponse> {
  const rootUrl = resolveBackendRootUrl();
  let res: Response;
  try {
    res = await fetch(rootUrl, { cache: "no-store" });
  } catch {
    return degradedResponse(`Adres: ${rootUrl}.`);
  }

  if (!res.ok) {
    return degradedResponse(`HTTP ${res.status}. Adres: ${rootUrl}`);
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    return degradedResponse("Yanıt JSON değil.");
  }

  if (
    typeof body === "object" &&
    body !== null &&
    "mesaj" in body &&
    typeof (body as { mesaj: unknown }).mesaj === "string"
  ) {
    return body as ApiRootResponse;
  }

  return degradedResponse("API yanıtı beklenen formatta değil.");
}
