import Image from "next/image";
import { Box } from "lucide-react";

interface RequestListingPreviewCardProps {
  title: string;
  budget: string;
  duration: string;
  city: string;
  requesterName: string;
  imageSrc: string | null;
}

export function RequestListingPreviewCard({
  title,
  budget,
  duration,
  city,
  requesterName,
  imageSrc,
}: RequestListingPreviewCardProps) {
  const displayTitle = title.trim() || "Aranan ürün başlığı";
  const displayBudget =
    budget.trim() && !Number.isNaN(Number(budget))
      ? `₺${Number(budget).toLocaleString("tr-TR")} /gün`
      : "₺— /gün";
  const displayDuration = duration.trim() ? duration : "—";
  const displayCity = city.trim() || "Girne";
  const displayRequester = requesterName.trim() || "Talep Sahibi";

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-[var(--color-card)] shadow-md ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] dark:border-slate-600/70 dark:ring-white/5">
      <div className="border-b border-slate-200/80 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
        İLAN ÖNİZLEME (Visual Taslak)
      </div>
      <div className="p-4">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4 text-center dark:border-slate-700 dark:bg-slate-800/80">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={displayTitle}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 340px"
            />
          ) : null}
          <div
            className={`absolute inset-0 ${
              imageSrc ? "bg-slate-900/40" : "bg-transparent"
            }`}
            aria-hidden
          />
          <div className="relative z-[1]">
          <p className="text-3xl font-extrabold tracking-wide text-slate-800 dark:text-slate-100">
            ARANIYOR
          </p>
          {imageSrc ? null : (
            <Box
              className="mx-auto mt-3 size-16 text-[#2563EB]"
              strokeWidth={1.5}
              aria-hidden
            />
          )}
          <p className="mt-2 text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400">
            TALEP EDİLEN ÜRÜN
          </p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5 text-sm text-[var(--color-text)]">
          <p className="font-bold">{displayTitle}</p>
          <p>
            <span className="font-semibold">Talep Bütçesi:</span> {displayBudget}
          </p>
          <p>
            <span className="font-semibold">Talep Süresi:</span> {displayDuration}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-[var(--color-app-bg)] p-3 dark:border-slate-700">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#2563EB] text-sm font-bold text-white">
            {displayRequester.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              {displayRequester}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {displayCity}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
