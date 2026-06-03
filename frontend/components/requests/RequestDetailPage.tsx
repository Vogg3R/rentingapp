"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getAuthUser, isLoggedIn } from "@/lib/session";
import {
  acceptOffer,
  createOffer,
  getItemRequest,
  listOffers,
} from "@/services/requests";
import type { ItemRequest, Offer } from "@/types/requests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface RequestDetailPageProps {
  requestId: string;
}

export function RequestDetailPage({ requestId }: RequestDetailPageProps) {
  const router = useRouter();
  const [request, setRequest] = useState<ItemRequest | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerDesc, setOfferDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const user = getAuthUser();
  const isOwner = user?.id === request?.requester_id;

  const reload = useCallback(async () => {
    const [reqRes, offRes] = await Promise.all([
      getItemRequest(requestId),
      listOffers(requestId),
    ]);
    if (!reqRes.ok) {
      setError(reqRes.message);
      return;
    }
    setRequest(reqRes.data);
    if (offRes.ok) setOffers(offRes.data);
  }, [requestId]);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getItemRequest(requestId), listOffers(requestId)]).then(
      ([reqRes, offRes]) => {
        if (cancelled) return;
        if (!reqRes.ok) {
          setError(reqRes.message);
          return;
        }
        setRequest(reqRes.data);
        if (offRes.ok) setOffers(offRes.data);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [requestId]);

  async function handleSubmitOffer() {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }
    const price = Number(offerPrice);
    if (!price || price <= 0 || offerDesc.trim().length < 5) {
      setError("Geçerli fiyat ve en az 5 karakter açıklama girin.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const res = await createOffer(requestId, {
      price_amount: price,
      description: offerDesc.trim(),
    });
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setOfferPrice("");
    setOfferDesc("");
    await reload();
  }

  async function handleAccept(offerId: string) {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }
    setSubmitting(true);
    const res = await acceptOffer(requestId, offerId);
    setSubmitting(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    router.push(`/islem/${res.data.id}`);
  }

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            ← Ana sayfa
          </Link>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          )}

          {request && (
            <>
              <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                {request.title}
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {request.category} · {request.location} · max ₺{request.max_daily_budget}/gün ·{" "}
                {request.duration_days} gün
              </p>
              <p className="mt-4 text-slate-700 dark:text-slate-200">{request.description}</p>
              <p className="mt-2 text-xs text-slate-500">Durum: {request.status}</p>

              {!isOwner && request.status === "open" && (
                <section className="mt-8 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
                  <h2 className="text-lg font-bold">Teklif ver</h2>
                  <div className="mt-3 grid gap-3">
                    <input
                      type="number"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="Toplam teklif (₺)"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                    />
                    <textarea
                      value={offerDesc}
                      onChange={(e) => setOfferDesc(e.target.value)}
                      placeholder="Kısa açıklama"
                      rows={3}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
                    />
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void handleSubmitOffer()}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Teklifi gönder
                    </button>
                  </div>
                </section>
              )}

              <section className="mt-8">
                <h2 className="text-lg font-bold">Teklifler ({offers.length})</h2>
                <ul className="mt-3 space-y-3">
                  {offers.map((o) => (
                    <li
                      key={o.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                    >
                      <p className="font-semibold">₺{o.price_amount}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {o.description}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{o.status}</p>
                      {isOwner && o.status === "pending" && request.status === "open" && (
                        <button
                          type="button"
                          disabled={submitting}
                          onClick={() => void handleAccept(o.id)}
                          className="mt-3 rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
                        >
                          Kabul et (escrow)
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
