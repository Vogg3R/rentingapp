"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isLoggedIn } from "@/lib/session";
import { fetchWalletSummary, withdrawFromWallet } from "@/services/wallet";
import type { WalletSummary } from "@/types/wallet";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  completeIyzicoDeposit,
  depositToWallet,
} from "@/services/wallet";

export function WalletPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("500");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [iban, setIban] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    const res = await fetchWalletSummary();
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setSummary(res.data);
  }, [router]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    let cancelled = false;
    void fetchWalletSummary().then((res) => {
      if (cancelled) return;
      if (!res.ok) setError(res.message);
      else setSummary(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const token = searchParams.get("iyzico_token");
    const amount = Number(searchParams.get("amount"));
    if (!token || !amount) return;
    void (async () => {
      setBusy(true);
      const res = await completeIyzicoDeposit(token, amount);
      setBusy(false);
      if (!res.ok) setError(res.message);
      else {
        setError(null);
        await load();
        router.replace("/cuzdan");
      }
    })();
  }, [searchParams, load, router]);

  async function handleDeposit(simulated = true) {
    const amount = Number(depositAmount);
    if (!amount || amount <= 0) return;
    setBusy(true);
    setError(null);
    const res = await depositToWallet(amount, simulated ? "simulated" : "iyzico");
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    if (res.data.mode === "iyzico_pending" && res.data.checkout_url) {
      window.location.href = res.data.checkout_url;
      return;
    }
    await load();
  }

  async function handleWithdraw() {
    const amount = Number(withdrawAmount);
    if (!amount || amount <= 0 || iban.trim().length < 15) {
      setError("Geçerli tutar ve IBAN girin.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await withdrawFromWallet(amount, iban.trim());
    setBusy(false);
    if (!res.ok) setError(res.message);
    else await load();
  }

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-lg px-4 py-8 pb-24">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cüzdan</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Simülasyon anında yükler. Iyzico anahtarları backend&apos;de tanımlıysa ikinci
            buton sandbox akışını başlatır.
          </p>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          {summary && (
            <>
              <p className="mt-6 text-3xl font-bold text-primary">
                ₺{summary.wallet.balance}{" "}
                <span className="text-base font-normal text-slate-500">
                  {summary.wallet.currency}
                </span>
              </p>

              <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h2 className="font-bold">Bakiye yükle (demo)</h2>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDeposit(true)}
                  className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-bold text-white disabled:opacity-60"
                >
                  Simülasyon ile yükle
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleDeposit(false)}
                  className="mt-2 w-full rounded-lg border border-primary py-2 text-sm font-bold text-primary disabled:opacity-60"
                >
                  Iyzico ile başlat
                </button>
              </section>

              <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                <h2 className="font-bold">IBAN ile çekim talebi</h2>
                <input
                  type="number"
                  placeholder="Tutar"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="TR..."
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="mt-2 w-full rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleWithdraw()}
                  className="mt-3 w-full rounded-lg border border-primary py-2 text-sm font-bold text-primary disabled:opacity-60"
                >
                  Çekim talebi oluştur
                </button>
              </section>

              <section className="mt-8">
                <h2 className="font-bold">Son hareketler</h2>
                <ul className="mt-2 space-y-2 text-sm">
                  {summary.transactions.length === 0 && (
                    <li className="text-slate-500">Henüz işlem yok.</li>
                  )}
                  {summary.transactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800"
                    >
                      <span>
                        {tx.type} · {tx.status}
                      </span>
                      <span>₺{tx.amount}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          <Link href="/" className="mt-8 inline-block text-sm text-primary hover:underline">
            ← Ana sayfa
          </Link>
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
