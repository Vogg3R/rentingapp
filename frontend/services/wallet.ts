import { authorizedFetch, extractErrorMessage } from "@/services/http";
import type { DepositResponse, Wallet, WalletSummary } from "@/types/wallet";

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

export async function fetchWalletSummary(): Promise<ApiResult<WalletSummary>> {
  try {
    const res = await authorizedFetch("/wallet/me");
    return parseJson(res, "Cüzdan yüklenemedi.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function depositToWallet(
  amount: number,
  provider: "simulated" | "iyzico" = "simulated"
): Promise<ApiResult<DepositResponse>> {
  try {
    const res = await authorizedFetch("/wallet/deposit", {
      method: "POST",
      body: JSON.stringify({
        amount,
        payment_reference: "mvp-demo-card",
        provider,
      }),
    });
    return parseJson(res, "Yükleme başarısız.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function completeIyzicoDeposit(
  paymentToken: string,
  amount: number
): Promise<ApiResult<Wallet>> {
  try {
    const res = await authorizedFetch("/wallet/deposit/iyzico/complete", {
      method: "POST",
      body: JSON.stringify({ payment_token: paymentToken, amount }),
    });
    return parseJson(res, "Iyzico ödemesi tamamlanamadı.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}

export async function withdrawFromWallet(
  amount: number,
  iban: string
): Promise<ApiResult<Wallet>> {
  try {
    const res = await authorizedFetch("/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount, iban }),
    });
    return parseJson(res, "Çekim talebi başarısız.");
  } catch {
    return { ok: false, message: "Sunucuya bağlanılamıyor." };
  }
}
