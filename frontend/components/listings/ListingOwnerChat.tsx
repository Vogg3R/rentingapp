"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { RentalConversationChat } from "./RentalConversationChat";

interface ListingOwnerChatProps {
  rentalRequestId: string;
  ownerName: string;
}

/** İlan detayında kiralama talebi sonrası açılan mesaj paneli */
export function ListingOwnerChat({ rentalRequestId, ownerName }: ListingOwnerChatProps) {
  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg dark:border-slate-600 dark:bg-[var(--color-card)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" aria-hidden />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              İlan sahibine mesaj
            </p>
            <p className="text-sm font-semibold text-[var(--color-text)]">{ownerName}</p>
          </div>
        </div>
        <Link
          href={`/mesajlar/kiralama/${rentalRequestId}`}
          className="shrink-0 text-xs font-semibold text-primary hover:underline"
        >
          Mesajlarım
        </Link>
      </div>

      <RentalConversationChat
        rentalRequestId={rentalRequestId}
        emptyHint="Henüz mesaj yok. İlan sahibine ilk mesajınızı yazın."
      />
    </section>
  );
}
