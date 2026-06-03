"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  InteractivePageShell,
  ParallaxBand,
} from "@/components/layout/InteractivePageShell";
import { ListingSkeleton } from "@/components/listing/ListingSkeleton";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { RentalCard } from "@/components/rental/RentalCard";
import { resolveListingsForDisplay } from "@/lib/listings";
import { fetchRootApi } from "@/services/api";
import type { ApiRootResponse } from "@/types/api";
import { motion } from "framer-motion";
import { Box, Search } from "lucide-react";
import Link from "next/link";

const REQUEST_DEMOS = [
  { id: "req-1", title: "GoPro Hero 11", budget: 200, days: 3, location: "Lefkoşa" },
  { id: "req-2", title: "Akülü Matkap", budget: 180, days: 2, location: "Girne" },
  { id: "req-3", title: "PS5 + 2 Kol", budget: 500, days: 7, location: "Güzelyurt" },
  { id: "req-4", title: "Kamp Çadırı (4 Kişilik)", budget: 160, days: 5, location: "Mağusa" },
] as const;

const INITIAL_DATA: ApiRootResponse = {
  mesaj: "İlanlar yükleniyor...",
};

export default function Home() {
  const [data, setData] = useState<ApiRootResponse>(INITIAL_DATA);

  useEffect(() => {
    let isMounted = true;
    fetchRootApi().then((result) => {
      if (!isMounted) return;
      setData(result);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const listings = resolveListingsForDisplay(data);
  const itemRequests =
    data.itemRequests && data.itemRequests.length > 0
      ? data.itemRequests
      : REQUEST_DEMOS.map((d) => ({
          id: d.id,
          title: d.title,
          maxDailyBudget: d.budget,
          durationDays: d.days,
          location: d.location,
        }));

  return (
    <>
      <AppHeader apiMessage={data.mesaj} />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-20 pt-6 md:pb-0 md:pt-8">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-[var(--color-text)] md:text-3xl">
                Öne çıkan ilanlar
              </h1>
              <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">
                Müsait ekipmanları keşfedin veya yakında tekrar deneyin.
              </p>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Link
                href="/istek-ilani"
                className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90"
              >
                Kiralamak İstediğiniz Ürün İçin İlan Açın
              </Link>
              <button
                type="button"
                className="inline-flex rounded-lg border border-secondary px-4 py-2 text-sm font-bold text-secondary shadow-sm transition-colors hover:bg-secondary/10"
              >
                Tümünü gör
              </button>
            </div>
          </div>

          <ParallaxBand
            band="listings"
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut",
                }}
              >
                <RentalCard listing={listing} />
              </motion.div>
            ))}
            <ListingSkeleton />
            <ListingSkeleton />
            <ListingSkeleton />
          </ParallaxBand>

          <section className="mt-12">
            <div className="mb-6 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
              <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-[var(--color-text)] md:text-3xl">
                Topluluğun Aradıkları (İstek İlanları)
              </h2>
              <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">
                Elindeki eşyaları kiraya vererek bu talepleri hemen karşıla ve kazanmaya başla.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {itemRequests.map((requestItem, index) => (
                <motion.div
                  key={requestItem.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                >
                  <article
                    className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] dark:border-slate-600/70 dark:bg-[var(--color-card)] dark:ring-1 dark:ring-white/10"
                  >
                    <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-t-xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
                      <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                        ARANIYOR
                      </span>
                      <div className="flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2 text-slate-100 backdrop-blur-sm transition-transform duration-500 ease-out group-hover:scale-110">
                        <Search className="size-4 text-blue-300" />
                        <Box className="size-4 text-blue-300" />
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h3 className="text-base font-bold text-slate-800 dark:text-[var(--color-text)]">
                        {requestItem.title}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {requestItem.location} · {requestItem.durationDays} gün
                      </p>

                      <p className="text-sm font-semibold text-slate-700 dark:text-[var(--color-text)]">
                        Maks. Bütçe:{" "}
                        <span className="text-primary">
                          ₺{requestItem.maxDailyBudget} / Gün
                        </span>
                      </p>

                      <Link
                        href={`/talep/${requestItem.id}`}
                        className="mt-auto inline-flex justify-center rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                      >
                        Teklif Ver
                      </Link>
                    </div>
                  </article>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
