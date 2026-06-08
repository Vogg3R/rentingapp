"use client";

import { StepperInput } from "@/components/ui/StepperInput";
import { useMemo, useState } from "react";

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface OfferSubmitPayload {
  dailyPrice: number;
  totalPrice: number;
  description: string;
}

interface RequestOfferCardProps {
  maxDailyBudget: number;
  durationDays: number;
  onSubmitOffer: (payload: OfferSubmitPayload) => void;
  offerSubmitted?: boolean;
  submitting?: boolean;
}

/** İstek ilanına teklif verme kartı — kiralama özeti kartıyla aynı düzen */
export function RequestOfferCard({
  maxDailyBudget,
  durationDays,
  onSubmitOffer,
  offerSubmitted = false,
  submitting = false,
}: RequestOfferCardProps) {
  const [dailyPrice, setDailyPrice] = useState("");
  const [description, setDescription] = useState("");

  const daily = Number(dailyPrice) || 0;
  const totalPrice = daily * durationDays;
  const overBudget = daily > maxDailyBudget;
  const canSubmit =
    daily > 0 && description.trim().length >= 5 && !offerSubmitted && !submitting;

  const validationMessage = useMemo(() => {
    if (!dailyPrice) return null;
    if (daily <= 0) return "Geçerli bir günlük teklif fiyatı girin.";
    if (description.trim().length > 0 && description.trim().length < 5) {
      return "Açıklama en az 5 karakter olmalı.";
    }
    if (overBudget) {
      return `Talep edilen maksimum bütçe ₺${maxDailyBudget}/gün. Yine de teklif gönderebilirsiniz.`;
    }
    return null;
  }, [daily, dailyPrice, description, maxDailyBudget, overBudget]);

  return (
    <aside className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-600 dark:bg-[var(--color-card)] sm:p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Teklif özeti
      </p>
      <p className="mt-3 text-2xl font-bold text-[var(--color-text)]">
        Maks. Bütçe:{" "}
        <span className="text-primary">{formatTry(maxDailyBudget)}</span>
        <span className="text-base font-semibold text-slate-500 dark:text-slate-400"> /gün</span>
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Talep süresi: {durationDays} gün
      </p>

      <div className="mt-6">
        <label
          htmlFor="offer-daily-price"
          className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
        >
          Günlük teklif fiyatınız
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-sm font-semibold text-slate-500">
            ₺
          </span>
          <StepperInput
            id="offer-daily-price"
            value={dailyPrice}
            onChange={setDailyPrice}
            min={1}
            placeholder="350"
            className="pl-8"
          />
        </div>
      </div>

      <div className="mt-4">
        <label
          htmlFor="offer-description"
          className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
        >
          Teklif açıklaması
        </label>
        <textarea
          id="offer-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          placeholder="Eşyanızın durumu, teslim şekli ve kiralama koşullarınızı yazın..."
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800/70"
        />
      </div>

      <div className="mt-6 space-y-2 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Talep süresi</span>
          <span className="font-bold text-[var(--color-text)]">{durationDays} gün</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 pt-2 text-sm dark:border-slate-600">
          <span className="font-semibold text-[var(--color-text)]">Toplam teklif</span>
          <span className="text-lg font-bold text-primary">
            {daily > 0 ? formatTry(totalPrice) : "—"}
          </span>
        </div>
      </div>

      {validationMessage ? (
        <p
          className={`mt-3 text-sm font-medium ${
            overBudget
              ? "text-amber-600 dark:text-amber-400"
              : "text-amber-600 dark:text-amber-400"
          }`}
          role="alert"
        >
          {validationMessage}
        </p>
      ) : null}

      {offerSubmitted ? (
        <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          Teklifiniz gönderildi
        </p>
      ) : (
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() =>
            onSubmitOffer({
              dailyPrice: daily,
              totalPrice,
              description: description.trim(),
            })
          }
          className="mt-5 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
        >
          {submitting ? "Gönderiliyor..." : "Teklif Gönder"}
        </button>
      )}
    </aside>
  );
}
