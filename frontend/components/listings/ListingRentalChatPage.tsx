"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isLoggedIn } from "@/lib/session";
import { getListingRentalConversation } from "@/services/listing-rentals";
import type { ListingRentalConversationSummary } from "@/types/listing-rentals";
import { Calendar, MessageSquare } from "lucide-react";
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

export function ListingRentalChatPage({ requestId }: ListingRentalChatPageProps) {
  const router = useRouter();
  const [conversation, setConversation] = useState<ListingRentalConversationSummary | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

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

  const counterpartyLabel =
    conversation?.counterparty_name?.trim() ||
    (conversation?.role === "owner" ? "Kiracı" : "İlan sahibi");

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
                        {conversation.status === "pending" ? "Beklemede" : conversation.status}
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
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
