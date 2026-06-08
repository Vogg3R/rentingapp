"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppToast, type AppToastType } from "@/components/ui/AppToast";
import { getCategoryLabel } from "@/lib/categories";
import { getAuthUser, isLoggedIn } from "@/lib/session";
import {
  acceptOffer,
  createOffer,
  getItemRequest,
  listOffers,
} from "@/services/requests";
import type { ItemRequest, Offer } from "@/types/requests";
import { Box, Calendar, MapPin, Package, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { RequestOfferCard, type OfferSubmitPayload } from "./RequestOfferCard";
import { RequestRequesterCard } from "./RequestRequesterCard";

interface RequestDetailPageProps {
  requestId: string;
}

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RequestDetailPage({ requestId }: RequestDetailPageProps) {
  const router = useRouter();
  const [request, setRequest] = useState<ItemRequest | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [toast, setToast] = useState<{ type: AppToastType; message: string } | null>(
    null
  );

  const user = getAuthUser();
  const isOwner = user?.id === request?.requester_id;

  const showToast = useCallback((message: string, type: AppToastType = "success") => {
    setToast({ message, type });
  }, []);

  const reload = useCallback(async () => {
    const [reqRes, offRes] = await Promise.all([
      getItemRequest(requestId),
      listOffers(requestId),
    ]);
    if (!reqRes.ok) {
      showToast(reqRes.message, "error");
      return;
    }
    setRequest(reqRes.data);
    if (offRes.ok) setOffers(offRes.data);
  }, [requestId, showToast]);

  useEffect(() => {
    setLoading(true);
    void Promise.all([getItemRequest(requestId), listOffers(requestId)]).then(
      ([reqRes, offRes]) => {
        if (!reqRes.ok) {
          showToast(reqRes.message, "error");
        } else {
          setRequest(reqRes.data);
        }
        if (offRes.ok) {
          setOffers(offRes.data);
          const authUser = getAuthUser();
          if (
            authUser &&
            offRes.data.some(
              (offer) =>
                offer.supplier_id === authUser.id &&
                (offer.status === "pending" || offer.status === "accepted")
            )
          ) {
            setOfferSubmitted(true);
          }
        }
        setLoading(false);
      }
    );
  }, [requestId, showToast]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleSubmitOffer = useCallback(
    async (payload: OfferSubmitPayload) => {
      if (!isLoggedIn()) {
        router.push("/auth");
        return;
      }
      if (!payload.totalPrice || payload.totalPrice <= 0) {
        showToast("Geçerli bir teklif fiyatı girin.", "error");
        return;
      }
      if (payload.description.length < 5) {
        showToast("Açıklama en az 5 karakter olmalı.", "error");
        return;
      }

      setSubmitting(true);
      const res = await createOffer(requestId, {
        price_amount: payload.totalPrice,
        description: payload.description,
      });
      setSubmitting(false);

      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }

      setOfferSubmitted(true);
      showToast("Teklifiniz başarıyla gönderildi.");
      await reload();
    },
    [requestId, router, reload, showToast]
  );

  async function handleAccept(offerId: string) {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }
    setSubmitting(true);
    const res = await acceptOffer(requestId, offerId);
    setSubmitting(false);
    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }
    router.push(`/islem/${res.data.id}`);
  }

  const statusLabel =
    request?.status === "open"
      ? "Açık"
      : request?.status === "closed"
        ? "Kapalı"
        : request?.status ?? "";

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-7xl px-4 py-8 pb-24">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-primary hover:underline"
          >
            ← Ana sayfa
          </Link>

          {loading && !request && (
            <div className="mt-8 grid animate-pulse gap-8 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <div className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="h-[480px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          )}

          {request && (
            <div className="mt-8 grid items-start gap-8 md:grid-cols-3">
              <div className="min-w-0 space-y-6 md:col-span-2">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 shadow-sm dark:border-slate-700">
                  <span className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold tracking-wide text-white">
                    ARANIYOR
                  </span>
                  <div className="flex flex-col items-center gap-3 text-center">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-3 text-slate-100 backdrop-blur-sm">
                      <Search className="size-5 text-blue-300" aria-hidden />
                      <Box className="size-5 text-blue-300" aria-hidden />
                    </div>
                    <p className="text-sm font-semibold tracking-wider text-slate-300">
                      TALEP EDİLEN ÜRÜN
                    </p>
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                    {request.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <Package className="size-3.5" aria-hidden />
                      {getCategoryLabel(request.category)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <MapPin className="size-3.5" aria-hidden />
                      {request.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <Calendar className="size-3.5" aria-hidden />
                      {request.duration_days} gün
                    </span>
                    <span className="inline-flex items-center rounded-full bg-orange-500/15 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)] sm:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Talep şartları
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                    <li className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Maks. bütçe</p>
                      <p className="mt-1 font-bold text-[var(--color-text)]">
                        {formatTry(request.max_daily_budget)}/gün
                      </p>
                    </li>
                    <li className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Talep süresi</p>
                      <p className="mt-1 font-bold text-[var(--color-text)]">
                        {request.duration_days} gün
                      </p>
                    </li>
                    <li className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Toplam bütçe</p>
                      <p className="mt-1 font-bold text-primary">
                        {formatTry(request.max_daily_budget * request.duration_days)}
                      </p>
                    </li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)] sm:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Açıklama
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200">
                    {request.description}
                  </p>
                </section>

                {request.requester ? (
                  <RequestRequesterCard requester={request.requester} />
                ) : null}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)] sm:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Teklifler ({offers.length})
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {offers.length === 0 ? (
                      <li className="text-sm text-slate-500 dark:text-slate-400">
                        Henüz teklif yok.
                      </li>
                    ) : null}
                    {offers.map((offer) => (
                      <li
                        key={offer.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-800/60"
                      >
                        <p className="text-lg font-bold text-primary">
                          {formatTry(offer.price_amount)}
                        </p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                          {offer.description}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">Durum: {offer.status}</p>
                        {isOwner && offer.status === "pending" && request.status === "open" ? (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => void handleAccept(offer.id)}
                            className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Kabul et
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </section>
              </div>

              <div className="md:col-span-1">
                {!isOwner && request.status === "open" ? (
                  <RequestOfferCard
                    maxDailyBudget={request.max_daily_budget}
                    durationDays={request.duration_days}
                    onSubmitOffer={(payload) => void handleSubmitOffer(payload)}
                    offerSubmitted={offerSubmitted}
                    submitting={submitting}
                  />
                ) : (
                  <aside className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-600 dark:bg-[var(--color-card)] sm:p-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Teklif özeti
                    </p>
                    <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                      {isOwner
                        ? "Bu sizin istek ilanınız. Gelen teklifleri soldan inceleyip kabul edebilirsiniz."
                        : "Bu talep artık teklif almıyor."}
                    </p>
                  </aside>
                )}
              </div>
            </div>
          )}
        </div>

        {toast ? <AppToast message={toast.message} type={toast.type} /> : null}
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
