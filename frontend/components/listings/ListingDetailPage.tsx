"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getListing } from "@/services/listings";
import type { Listing } from "@/types/listings";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ListingDetailPageProps {
  listingId: string;
}

export function ListingDetailPage({ listingId }: ListingDetailPageProps) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getListing(listingId).then((res) => {
      if (!res.ok) setError(res.message);
      else setListing(res.data);
    });
  }, [listingId]);

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-3xl px-4 py-8 pb-24">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Ana sayfa
          </Link>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {listing && (
            <>
              <h1 className="mt-4 text-2xl font-bold">{listing.title}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {listing.category} · {listing.location}
              </p>
              <p className="mt-4 text-lg font-bold text-primary">
                ₺{listing.daily_price} / gün
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Min {listing.min_days} — max {listing.max_days} gün
              </p>
              <p className="mt-6 text-slate-700 dark:text-slate-200">
                {listing.description}
              </p>
            </>
          )}
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
