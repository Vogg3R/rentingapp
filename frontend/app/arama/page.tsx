"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ListingSkeleton } from "@/components/listing/ListingSkeleton";
import { RentalCard } from "@/components/rental/RentalCard";
import { mapListingToRental } from "@/lib/listings";
import { searchListings } from "@/services/listings";
import type { RentalListing } from "@/types/api";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const [listings, setListings] = useState<RentalListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) {
      setListings([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    void searchListings(query).then((res) => {
      if (cancelled) return;
      if (!res.ok) {
        setError(res.message);
        setListings([]);
      } else {
        setListings(res.data.map(mapListingToRental));
      }
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-20 pt-6 md:pb-0 md:pt-8">
          <div className="mb-6 border-b border-slate-200/80 pb-4 dark:border-slate-700/80">
            <Link href="/" className="text-sm text-primary hover:underline">
              ← Ana sayfa
            </Link>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-800 dark:text-[var(--color-text)] md:text-3xl">
              {query ? (
                <>
                  <span className="text-primary">{query}</span> için arama sonuçları
                </>
              ) : (
                "Arama"
              )}
            </h1>
            {query && !isLoading && !error ? (
              <p className="mt-1 text-sm font-normal text-slate-600 dark:text-slate-300">
                {listings.length} sonuç bulundu.
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              <>
                <ListingSkeleton />
                <ListingSkeleton />
                <ListingSkeleton />
                <ListingSkeleton />
              </>
            ) : null}

            {!isLoading && !error && listings.length === 0 ? (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center dark:border-slate-600 dark:bg-[var(--color-card)]">
                <p className="text-base font-semibold text-[var(--color-text)]">
                  {query
                    ? `"${query}" için sonuç bulunamadı`
                    : "Arama terimi girilmedi"}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Farklı bir kelime deneyin veya ana sayfadaki ilanlara göz atın.
                </p>
                <Link
                  href="/"
                  className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary/90"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            ) : null}

            {!isLoading && !error
              ? listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                  >
                    <RentalCard listing={listing} />
                  </motion.div>
                ))
              : null}
          </div>
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsContent />
    </Suspense>
  );
}
