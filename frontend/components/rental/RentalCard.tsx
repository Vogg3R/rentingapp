import Image from "next/image";
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
  const { title, imageUrl, status, pricePerDay } = listing;
  const available = status === "available";

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-[var(--color-card)] shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md dark:border-slate-600/70 dark:ring-white/10">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-900">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="text-[1.05rem] font-bold leading-snug text-[var(--color-text)]">
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
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-600">
          <p className="text-sm font-normal text-[var(--color-text)]">
            <span className="text-slate-500 dark:text-slate-400">Günlük</span>{" "}
            <span className="font-bold text-[var(--color-text)]">
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
    </article>
  );
}
