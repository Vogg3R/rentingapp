"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { BadgeCheck, MapPin, ShieldCheck, Star, UserRoundCheck } from "lucide-react";

type ProfileTab = "listings" | "requests" | "reviews";

interface ListingCard {
  id: number;
  title: string;
  pricePerDay: number;
  image: string;
}

const LISTING_ITEMS: ListingCard[] = [
  {
    id: 1,
    title: "Kamp Çadırı (3 Kişilik)",
    pricePerDay: 150,
    image:
      "https://images.unsplash.com/photo-1504280390368-3971d6f70014?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    title: "GoPro Hero 11 Black",
    pricePerDay: 400,
    image:
      "https://images.unsplash.com/photo-1622467827417-bbe2237067a9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    title: "PS5 + 2 Kol",
    pricePerDay: 500,
    image:
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=900&q=80",
  },
];

const TAB_LABELS: Record<ProfileTab, string> = {
  listings: "İlanlarım",
  requests: "İsteklerim",
  reviews: "Değerlendirmeler",
};

export function UserProfilePage() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");

  const tabCounts = useMemo(
    () => ({
      listings: 4,
      requests: 1,
      reviews: 24,
    }),
    []
  );

  return (
    <InteractivePageShell className="bg-[var(--color-app-bg)]">
      <AppHeader showCategoryBar={false} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-7xl px-4 py-6 pb-16"
      >
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="relative h-44 w-full bg-gradient-to-r from-blue-600/80 to-indigo-600/80" />

          <div className="px-4 pb-6 sm:px-6">
            <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative size-28 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-200 shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                    alt="Ahmet Yılmaz profil fotoğrafı"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute bottom-2 right-2 size-3.5 rounded-full border-2 border-white bg-emerald-500" />
                </div>
                <div>
                  <div className="mb-1 inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    4.9 (24 Reviews)
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
                    Ahmet Yılmaz
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin className="size-4 text-[#2563EB]" />
                    Lefkoşa, Kıbrıs · Üye: Eki 2023
                  </p>
                </div>
              </div>

              <Link
                href="/profil/duzenle"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 px-4 text-sm font-bold text-[#2563EB] transition-colors hover:bg-[#2563EB]/10"
              >
                Profili Düzenle
              </Link>
            </div>

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
              <p className="mb-3 text-sm font-bold text-[var(--color-text)]">
                GÜVEN ROZETLERİ
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  <UserRoundCheck className="size-3.5" />
                  Telefon Onaylı
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                  <BadgeCheck className="size-3.5" />
                  E-Posta Onaylı
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400">
                  <ShieldCheck className="size-3.5" />
                  Kimlik Doğrulanmış
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-100 p-4 text-sm leading-relaxed text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
              <p className="mb-1.5 text-sm font-bold text-[var(--color-text)]">
                HAKKIMDA
              </p>
              Selam! Doğa fotoğrafçılığı okuyorum. Çekim yapmadığım zamanlarda
              ekipmanlarımı ve kamp malzemelerimi kiraya veriyorum. Eşyalarıma
              kendi ekipmanım gibi bakarım, kiralayanlardan da aynısını beklerim.
            </div>

            <div className="mt-6 border-b border-slate-200 dark:border-slate-700">
              <nav className="flex flex-wrap gap-5">
                {(Object.keys(TAB_LABELS) as ProfileTab[]).map((tabKey) => {
                  const isActive = activeTab === tabKey;
                  return (
                    <button
                      key={tabKey}
                      type="button"
                      onClick={() => setActiveTab(tabKey)}
                      className={`border-b-[3px] px-1 pb-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? "border-[#2563EB] text-[#2563EB]"
                          : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                    >
                      {TAB_LABELS[tabKey]} ({tabCounts[tabKey]})
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="mt-5">
              {activeTab === "listings" ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {LISTING_ITEMS.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700"
                    >
                      <div className="relative h-40 w-full">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="space-y-2 p-3">
                        <p className="line-clamp-2 text-sm font-bold text-[var(--color-text)]">
                          {item.title}
                        </p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          ₺{item.pricePerDay} / Gün
                        </p>
                        <button
                          type="button"
                          className="w-full rounded-lg border border-[#2563EB]/40 bg-[#2563EB]/5 py-2 text-sm font-semibold text-[#2563EB] transition-colors hover:bg-[#2563EB]/10"
                        >
                          İlanı Düzenle
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {activeTab === "requests" ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                  Aktif istek ilanları burada listelenecek.
                </div>
              ) : null}

              {activeTab === "reviews" ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
                  Kullanıcı değerlendirmeleri burada listelenecek.
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </motion.div>
    </InteractivePageShell>
  );
}
