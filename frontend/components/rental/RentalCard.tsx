import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { RentalListing, RentalStatus } from "@/types/api";

const statusLabel: Record<RentalStatus, string> = {
  available: "Müsait",
  rented: "Kiralandı",
};

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(amount);
}

interface RentalCardProps {
  listing: RentalListing;
}

export function RentalCard({ listing }: RentalCardProps) {
  const { title, imageUrl, status, pricePerDay, sellerName, sellerRating, sellerAvatarUrl } =
    listing;
  const available = status === "available";
  const sellerDisplayName = sellerName?.trim() || "Kullanıcı";
  const sellerDisplayRating =
    typeof sellerRating === "number" && Number.isFinite(sellerRating)
      ? sellerRating.toFixed(1)
      : "4.8";

  return (
    <Link
      href={`/ilan/${listing.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-blue-500/30 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] dark:border-slate-600/70 dark:bg-[var(--color-card)] dark:ring-1 dark:ring-white/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-900">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-[1.05rem] font-bold leading-snug text-slate-800 dark:text-[var(--color-text)]">
            {title}
          </h2>
          <span
            className={
              available
                ? "shrink-0 rounded-full bg-status-available px-2.5 py-0.5 text-xs font-semibold text-white"
                : "shrink-0 rounded-full bg-status-rented px-2.5 py-0.5 text-xs font-semibold text-white"
            }
          >
            {statusLabel[status]}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative size-7 overflow-hidden rounded-full border border-slate-300/80 bg-slate-200 dark:border-slate-600 dark:bg-slate-700">
              {sellerAvatarUrl ? (
                <Image
                  src={sellerAvatarUrl}
                  alt={`${sellerDisplayName} profil fotoğrafı`}
                  fill
                  className="object-cover"
                  sizes="28px"
                />
              ) : null}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-300">
              {sellerDisplayName}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-300">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
            {sellerDisplayRating}
          </span>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-600">
          <p className="text-sm font-normal text-slate-600 dark:text-[var(--color-text)]">
            <span className="text-slate-500 dark:text-slate-400">Günlük</span>{" "}
            <span className="font-bold text-slate-800 dark:text-[var(--color-text)]">
              {formatTry(pricePerDay)}
            </span>
          </p>
          <button
            type="button"
            disabled={!available}
            className={
              available
                ? "rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/80"
                : "cursor-not-allowed rounded-lg bg-slate-300 px-4 py-2 text-sm font-bold text-white dark:bg-slate-600 dark:text-slate-300"
            }
          >
            Hemen Kirala
          </button>
        </div>
      </div>
    </Link>
  );
}
