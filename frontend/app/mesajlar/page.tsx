"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isLoggedIn } from "@/lib/session";
import { listMyDeals } from "@/services/deals";
import { listMyListingRentalConversations } from "@/services/listing-rentals";
import type { ListingRentalConversationSummary } from "@/types/listing-rentals";
import type { DealSummary } from "@/types/requests";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// `role` giriş yapan kullanıcının kendi rolüdür; kartta gösterilen isim ise
// karşı tarafa aittir. Bu yüzden karşı tarafın rolünü (rolün tersini) yazdırırız:
// kullanıcı ilan sahibiyse karşı taraf kiracı, kiracıysa karşı taraf ilan sahibidir.
function counterpartyRoleLabel(role: ListingRentalConversationSummary["role"]): string {
  return role === "owner" ? "Kiracı" : "İlan sahibi";
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

export default function MesajlarPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [listingChats, setListingChats] = useState<ListingRentalConversationSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }

    Promise.all([listMyDeals(), listMyListingRentalConversations()]).then(
      ([dealsRes, chatsRes]) => {
        if (!dealsRes.ok) {
          setError(dealsRes.message);
          return;
        }
        if (!chatsRes.ok) {
          setError(chatsRes.message);
          return;
        }
        setDeals(dealsRes.data);
        setListingChats(chatsRes.data);
      }
    );
  }, [router]);

  const hasAnyConversation = listingChats.length > 0 || deals.length > 0;

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-lg px-4 py-8 pb-24">
          <h1 className="text-2xl font-bold">Mesajlarım</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            İlan kiralama talepleri ve kabul edilen teklifler
          </p>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          {!hasAnyConversation && !error ? (
            <p className="mt-6 text-sm text-slate-500">
              Henüz mesajlaşma başlatılmış bir işlem yok.
            </p>
          ) : null}

          {listingChats.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                İlan kiralama talepleri
              </h2>
              <ul className="mt-3 space-y-3">
                {listingChats.map((chat) => (
                  <li key={chat.id}>
                    <Link
                      href={`/mesajlar/kiralama/${chat.id}`}
                      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-start gap-3">
                        <MessageSquare className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-[var(--color-text)]">
                            {chat.listing_title}
                          </p>
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            {chat.counterparty_name?.trim() || "Kullanıcı"} · {counterpartyRoleLabel(chat.role)}
                          </p>
                          {chat.last_message ? (
                            <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                              {chat.last_message}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm italic text-slate-400">
                              Henüz mesaj yok
                            </p>
                          )}
                          <p className="mt-2 text-xs text-slate-500">
                            {chat.total_days} gün · ₺{chat.total_price} ·{" "}
                            {statusLabel(chat.status)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {deals.length > 0 ? (
            <section className={listingChats.length > 0 ? "mt-8" : "mt-6"}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kabul edilen teklifler
              </h2>
              <ul className="mt-3 space-y-3">
                {deals.map((deal) => (
                  <li key={deal.id}>
                    <Link
                      href={`/islem/${deal.id}`}
                      className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary dark:border-slate-700 dark:bg-slate-900"
                    >
                      <p className="font-bold">{deal.item_request_title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Teklif: ₺{Number(deal.offer_price).toFixed(2)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
