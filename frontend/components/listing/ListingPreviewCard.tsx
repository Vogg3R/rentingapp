import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface ListingPreviewCardProps {
  title: string;
  /** Günlük kiralama tutarı (₺) */
  dailyPrice: string;
  imageSrc: string | null;
  imageAlt: string;
  /** Birden fazla fotoğraf: galeri kontrolleri */
  galleryPhotoCount?: number;
  galleryActiveIndex?: number;
  onGalleryPrev?: () => void;
  onGalleryNext?: () => void;
  onGallerySelectIndex?: (index: number) => void;
}

/** Sağ sütun: form verisine bağlı canlı ilan kartı taslağı */
export function ListingPreviewCard({
  title,
  dailyPrice,
  imageSrc,
  imageAlt,
  galleryPhotoCount = 0,
  galleryActiveIndex = 0,
  onGalleryPrev,
  onGalleryNext,
  onGallerySelectIndex,
}: ListingPreviewCardProps) {
  const displayTitle =
    title.trim() || "İlan başlığınız burada görünecek";
  const priceLabel =
    dailyPrice.trim() !== "" && !Number.isNaN(Number(dailyPrice))
      ? `₺${Number(dailyPrice).toLocaleString("tr-TR")}`
      : "₺—";

  const showGallery = galleryPhotoCount > 1;

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-[var(--color-card)] shadow-md ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_8px_30px_rgba(37,99,235,0.15)] dark:border-slate-600/70 dark:ring-white/5">
      <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            unoptimized
            sizes="(max-width: 1024px) 100vw, 340px"
            priority={galleryActiveIndex === 0}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400 dark:text-slate-500">
            Fotoğraf ekleyin
          </div>
        )}

        {showGallery && imageSrc && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />

            <button
              type="button"
              onClick={onGalleryPrev}
              className="pointer-events-auto absolute left-2 top-1/2 z-[1] inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/45"
              aria-label="Önceki fotoğraf"
            >
              <ChevronLeft className="size-5 shrink-0" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onGalleryNext}
              className="pointer-events-auto absolute right-2 top-1/2 z-[1] inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white shadow-sm backdrop-blur-sm transition-colors hover:bg-black/45"
              aria-label="Sonraki fotoğraf"
            >
              <ChevronRight className="size-5 shrink-0" aria-hidden />
            </button>

            <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 px-4">
              {Array.from({ length: galleryPhotoCount }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onGallerySelectIndex?.(i)}
                  aria-label={`${i + 1}. fotoğrafa git`}
                  aria-current={i === galleryActiveIndex}
                  className={[
                    "h-2 rounded-full transition-all",
                    i === galleryActiveIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/45 hover:bg-white/70",
                  ].join(" ")}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <div className="space-y-3 p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-[var(--color-text)]">
          {displayTitle}
        </h3>
        <p className="text-2xl font-bold text-primary">{priceLabel}</p>
        <div className="flex items-center gap-0.5 text-amber-400" aria-hidden>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="size-4 fill-current"
              strokeWidth={0}
            />
          ))}
        </div>
        <button
          type="button"
          disabled
          className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white opacity-90 shadow-sm"
        >
          Hemen Kirala
        </button>
      </div>
    </div>
  );
}
