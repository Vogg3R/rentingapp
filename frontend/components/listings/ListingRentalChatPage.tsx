"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppToast, type AppToastType } from "@/components/ui/AppToast";
import { isLoggedIn } from "@/lib/session";
import {
  getListingRentalConversation,
  respondToListingRentalRequest,
} from "@/services/listing-rentals";
import type { ListingRentalConversationSummary } from "@/types/listing-rentals";
import { Calendar, Check, MessageSquare, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { RentalConversationChat } from "./RentalConversationChat";

interface ListingRentalChatPageProps {
  requestId: string;
}

function formatDateRange(start: string, end: string): string {
  const fmt = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}.${month}.${year}`;
  };
  return `${fmt(start)} – ${fmt(end)}`;
}

// Talep durumunu kullanıcı dostu Türkçe metne çevirir.
function statusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Beklemede";
    case "accepted":
      return "Kabul edildi";
    case "rejected":
      return "Reddedildi";
    case "cancelled":
      return "İptal edildi";
    default:
      return status;
  }
}

export function ListingRentalChatPage({ requestId }: ListingRentalChatPageProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<ListingRentalConversationSummary | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: AppToastType } | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    getListingRentalConversation(requestId).then((res) => {
      if (!res.ok) setError(res.message);
      else setConversation(res.data);
    });
  }, [requestId, router]);

  // İlan sahibi gelen talebi kabul eder veya reddeder.
  async function handleRespond(action: "accept" | "reject") {
    setBusy(true);
    const res = await respondToListingRentalRequest(requestId, action);
    setBusy(false);
    if (!res.ok) {
      setToast({ message: res.message, type: "error" });
      return;
    }
    setConversation(res.data);
    setToast({
      message: action === "accept" ? "Talep kabul edildi." : "Talep reddedildi.",
      type: "success",
    });
  }

  // Toast'u kısa süre sonra otomatik gizle.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const counterpartyLabel =
    conversation?.counterparty_name?.trim() ||
    (conversation?.role === "owner" ? "Kiracı" : "İlan sahibi");

  // Kabul/Reddet butonları yalnızca ilan sahibine ve beklemedeki talepte gösterilir.
  const canRespond =
    conversation?.role === "owner" && conversation?.status === "pending";

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-lg px-4 py-8 pb-24">
          <Link href="/mesajlar" className="text-sm font-medium text-primary hover:underline">
            ← Mesajlarım
          </Link>

          {error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          ) : null}

          {conversation ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)]">
                <div className="flex items-start gap-3">
                  <MessageSquare className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      İlan kiralama talebi
                    </p>
                    <h1 className="mt-1 text-lg font-bold text-[var(--color-text)]">
                      {conversation.listing_title}
                    </h1>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {counterpartyLabel} ile sohbet
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 dark:border-slate-600">
                        <Calendar className="size-3.5" aria-hidden />
                        {formatDateRange(conversation.start_date, conversation.end_date)}
                      </span>
                      <span>
                        {conversation.total_days} gün · ₺{conversation.total_price}
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                        {statusLabel(conversation.status)}
                      </span>
                    </div>
                    <Link
                      href={`/ilan/${conversation.listing_id}`}
                      className="mt-3 inline-block text-xs font-semibold text-primary hover:underline"
                    >
                      İlanı görüntüle
                    </Link>
                  </div>
                </div>

                {canRespond ? (
                  <div className="mt-4 flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRespond("accept")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <Check className="size-4" aria-hidden />
                      Kabul Et
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleRespond("reject")}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-300 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
                    >
                      <X className="size-4" aria-hidden />
                      Reddet
                    </button>
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)]">
                <RentalConversationChat
                  rentalRequestId={requestId}
                  maxHeightClass="max-h-80"
                />
              </div>
            </div>
          ) : !error ? (
            <div className="mt-8 h-40 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ) : null}
        </div>
      </InteractivePageShell>
      {toast ? <AppToast message={toast.message} type={toast.type} /> : null}
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
