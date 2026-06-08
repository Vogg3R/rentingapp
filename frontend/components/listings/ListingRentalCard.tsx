"use client";

import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { computeRentalDays } from "@/lib/dates";
import { useMemo, useState } from "react";
import type { Listing } from "@/types/listings";

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface RentalRequestPayload {
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
}

interface ListingRentalCardProps {
  listing: Listing;
  onRentRequest: (payload: RentalRequestPayload) => void;
  requestSubmitted?: boolean;
  submitting?: boolean;
}

export function ListingRentalCard({
  listing,
  onRentRequest,
  requestSubmitted = false,
  submitting = false,
}: ListingRentalCardProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const totalDays = useMemo(
    () => computeRentalDays(startDate, endDate),
    [startDate, endDate]
  );
  const totalPrice = totalDays * listing.daily_price;

  const belowMin = totalDays > 0 && totalDays < listing.min_days;
  const aboveMax = totalDays > listing.max_days;
  const datesValid = totalDays > 0 && !belowMin && !aboveMax;

  const validationMessage = useMemo(() => {
    if (!startDate || !endDate) return null;
    if (totalDays === 0) return "Bitiş tarihi, başlangıçtan sonra olmalı.";
    if (belowMin) return `Bu ilan için en az ${listing.min_days} gün seçmelisiniz.`;
    if (aboveMax) return `Bu ilan için en fazla ${listing.max_days} gün kiralanabilir.`;
    return null;
  }, [startDate, endDate, totalDays, belowMin, aboveMax, listing.min_days, listing.max_days]);

  return (
    <aside className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-600 dark:bg-[var(--color-card)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Kiralama özeti
      </p>
      <p className="mt-3 text-2xl font-bold text-[var(--color-text)]">
        Günlük Fiyat:{" "}
        <span className="text-primary">{formatTry(listing.daily_price)}</span>
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Min {listing.min_days} — max {listing.max_days} gün
      </p>

      <div className="mt-6">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          label="Kiralama tarihleri"
        />
      </div>

      <div className="mt-6 space-y-2 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Toplam Gün</span>
          <span className="font-bold text-[var(--color-text)]">
            {totalDays > 0 ? totalDays : "—"}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm dark:border-slate-600">
          <span className="font-semibold text-[var(--color-text)]">Toplam Fiyat</span>
          <span className="text-lg font-bold text-primary">
            {totalDays > 0 ? formatTry(totalPrice) : "—"}
          </span>
        </div>
      </div>

      {validationMessage ? (
        <p className="mt-3 text-sm font-medium text-amber-600 dark:text-amber-400" role="alert">
          {validationMessage}
        </p>
      ) : null}

      {requestSubmitted ? (
        <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          Kiralama talebiniz gönderildi
        </p>
      ) : (
        <button
          type="button"
          disabled={!datesValid || submitting}
          onClick={() =>
            onRentRequest({
              startDate,
              endDate,
              totalDays,
              totalPrice,
            })
          }
          className="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {submitting ? "Gönderiliyor..." : "Kiralama Talebi Gönder"}
        </button>
      )}
    </aside>
  );
}
