"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppToast, type AppToastType } from "@/components/ui/AppToast";
import { getCategoryLabel } from "@/lib/categories";
import { isLoggedIn } from "@/lib/session";
import { createListingRentalRequest } from "@/services/listing-rentals";
import { getListing } from "@/services/listings";
import type { Listing } from "@/types/listings";
import { ImageOff, MapPin, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ListingOwnerCard } from "@/components/profile/ListingOwnerCard";
import { ListingOwnerChat } from "./ListingOwnerChat";
import {
  ListingRentalCard,
  type RentalRequestPayload,
} from "./ListingRentalCard";

interface ListingDetailPageProps {
  listingId: string;
}

export function ListingDetailPage({ listingId }: ListingDetailPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [rentalRequestId, setRentalRequestId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: AppToastType; message: string } | null>(
    null
  );

  useEffect(() => {
    setLoading(true);
    getListing(listingId).then((res) => {
      if (!res.ok) setError(res.message);
      else setListing(res.data);
      setLoading(false);
    });
  }, [listingId]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, type: AppToastType = "success") => {
    setToast({ message, type });
  }, []);

  const handleRentRequest = useCallback(
    async (payload: RentalRequestPayload) => {
      if (!isLoggedIn()) {
        router.push("/auth");
        return;
      }
      if (!listing?.id) {
        showToast("İlan bilgisi henüz yüklenmedi.", "error");
        return;
      }

      setSubmittingRequest(true);
      const res = await createListingRentalRequest(listing.id, {
        start_date: payload.startDate,
        end_date: payload.endDate,
        total_days: payload.totalDays,
        total_price: payload.totalPrice,
      });
      setSubmittingRequest(false);

      if (!res.ok) {
        showToast(res.message, "error");
        return;
      }

      setRentalRequestId(res.data.id);
      showToast("Kiralama talebiniz başarıyla oluşturuldu. İlan sahibine mesaj yazabilirsiniz.");
    },
    [listing, router, showToast]
  );

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

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          )}

          {loading && !listing && !error && (
            <div className="mt-8 grid animate-pulse gap-8 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <div className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className="h-[420px] rounded-2xl bg-slate-200 dark:bg-slate-800" />
            </div>
          )}

          {listing && (
            <div className="mt-8 grid items-start gap-8 md:grid-cols-3">
              <div className="min-w-0 space-y-6 md:col-span-2">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  {listing.image_base64 ? (
                    // Kullanıcının yüklediği Base64 görsel
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.image_base64}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                      <ImageOff
                        className="size-16 text-slate-300 dark:text-slate-600"
                        aria-hidden
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
                    {listing.title}
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <Package className="size-3.5" aria-hidden />
                      {getCategoryLabel(listing.category)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                      <MapPin className="size-3.5" aria-hidden />
                      {listing.location}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-status-available/15 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                      {listing.status === "active" ? "Müsait" : listing.status}
                    </span>
                  </div>
                </div>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)] sm:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kiralama şartları
                  </h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                    <li className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Günlük ücret</p>
                      <p className="mt-1 font-bold text-[var(--color-text)]">
                        ₺{listing.daily_price}
                      </p>
                    </li>
                    <li className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Minimum süre</p>
                      <p className="mt-1 font-bold text-[var(--color-text)]">
                        {listing.min_days} gün
                      </p>
                    </li>
                    <li className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Maksimum süre</p>
                      <p className="mt-1 font-bold text-[var(--color-text)]">
                        {listing.max_days} gün
                      </p>
                    </li>
                  </ul>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)] sm:p-6">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Açıklama
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200">
                    {listing.description}
                  </p>
                </section>

                {listing.owner ? (
                  <ListingOwnerCard owner={listing.owner} />
                ) : null}
              </div>

              <div className="md:col-span-1">
                <ListingRentalCard
                  listing={listing}
                  onRentRequest={(payload) => void handleRentRequest(payload)}
                  requestSubmitted={rentalRequestId !== null}
                  submitting={submittingRequest}
                />
                {rentalRequestId ? (
                  <ListingOwnerChat
                    rentalRequestId={rentalRequestId}
                    ownerName={listing.owner?.name?.trim() || "İlan sahibi"}
                  />
                ) : null}
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
