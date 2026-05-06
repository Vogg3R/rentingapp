"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { FormSection } from "./FormSection";
import { ListingFormHeader } from "./ListingFormHeader";
import { PhotoDropzone } from "./PhotoDropzone";
import { ListingPreviewCard } from "./ListingPreviewCard";
import { LISTING_CATEGORIES } from "@/constants/listing-categories";
import { StepperInput } from "@/components/ui/StepperInput";

const MapWidget = dynamic(() => import("@/components/MapWidget"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-[400px] items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-400"
      aria-hidden
    >
      Harita yükleniyor…
    </div>
  ),
});

export function ListingFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(LISTING_CATEGORIES[0].value);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPrice] = useState("150");
  const [minDays, setMinDays] = useState("2");
  const [maxDays, setMaxDays] = useState("30");
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [offersDelivery, setOffersDelivery] = useState(false);

  const previewUrls = useMemo(
    () => photos.map((p) => URL.createObjectURL(p)),
    [photos]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  const previewCount = previewUrls.length;
  const safePreviewImageIndex =
    previewCount === 0
      ? 0
      : Math.min(Math.max(0, previewImageIndex), previewCount - 1);

  const handleSaveDraft = useCallback(() => {
    // İleride services/listings.ts üzerinden API'ye gidecek
    window.alert("Taslak kaydedildi (MVP: gerçek API henüz yok).");
  }, []);

  const handlePublish = useCallback(() => {
    // İleride başarılı API yanıtı sonrasına taşınacak
    router.push("/");
  }, [router]);

  const previewImageSrc =
    previewCount > 0 ? previewUrls[safePreviewImageIndex] ?? null : null;

  const goPreviewPrev = useCallback(() => {
    setPreviewImageIndex((i) => {
      const n = previewUrls.length;
      if (n === 0) return 0;
      if (n === 1) return 0;
      return (i - 1 + n) % n;
    });
  }, [previewUrls.length]);

  const goPreviewNext = useCallback(() => {
    setPreviewImageIndex((i) => {
      const n = previewUrls.length;
      if (n === 0) return 0;
      if (n === 1) return 0;
      return (i + 1) % n;
    });
  }, [previewUrls.length]);

  const goPreviewSelect = useCallback(
    (index: number) => {
      if (previewUrls.length === 0) {
        setPreviewImageIndex(0);
        return;
      }
      setPreviewImageIndex(
        Math.max(0, Math.min(index, previewUrls.length - 1))
      );
    },
    [previewUrls.length]
  );
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-700/50 dark:bg-slate-900/50";

  return (
    <InteractivePageShell className="bg-[var(--color-app-bg)]">
      <ListingFormHeader
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl px-4 py-8 pb-20"
      >
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Eşya listele
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          Bilgileri adım adım doldurun; sağdaki önizleme ilanınızın nasıl
          görüneceğini gösterir.
        </p>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start">
          <form
            className="min-w-0 space-y-8"
            onSubmit={(e) => e.preventDefault()}
            noValidate
          >
            <FormSection step={1} title="Temel bilgiler">
              <div>
                <label
                  htmlFor="listing-title"
                  className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                >
                  İlan başlığı (en fazla 70 karakter)
                </label>
                <input
                  id="listing-title"
                  type="text"
                  maxLength={70}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Şarjlı matkap ve seti — 1 günlük"
                  className={inputClass}
                />
              </div>
              <div>
                <label
                  htmlFor="listing-category"
                  className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                >
                  Kategori
                </label>
                <select
                  id="listing-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`${inputClass} font-medium`}
                >
                  {LISTING_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </FormSection>

            <FormSection step={2} title="Fotoğraf yükle">
              <PhotoDropzone files={photos} onFilesChange={setPhotos} />
            </FormSection>

            <FormSection step={3} title="Detaylı açıklama">
              <div>
                <label
                  htmlFor="listing-description"
                  className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                >
                  Eşyanın durumu, özellikleri ve kiralama kuralları (en az 50
                  karakter önerilir)
                </label>
                <textarea
                  id="listing-description"
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Matkabın tüm uçları mevcuttur. Hafif çizikler var ama kusursuz çalışıyor. Lütfen temiz teslim edin."
                  className={`${inputClass} resize-y leading-relaxed`}
                />
              </div>
            </FormSection>

            <FormSection step={4} title="Kiralama şartları">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="daily-price"
                    className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                  >
                    Günlük kiralama ücreti
                  </label>
                  <div className="flex rounded-xl border border-slate-200 bg-[var(--color-app-bg)] shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-600">
                    <span className="flex items-center pl-3 text-sm font-semibold text-slate-500">
                      ₺
                    </span>
                    <StepperInput
                      id="daily-price"
                      value={dailyPrice}
                      onChange={setDailyPrice}
                      min={0}
                      placeholder="150"
                      className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent shadow-none focus-within:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="deposit"
                    className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                  >
                    Kefalet / depozito (isteğe bağlı)
                  </label>
                  <input
                    id="deposit"
                    type="text"
                    value={deposit}
                    onChange={(e) => setDeposit(e.target.value)}
                    placeholder="Eşya değeri kadar tutulabilir (örn: ₺5000)"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor="min-days"
                    className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                  >
                    Minimum kiralama süresi (gün)
                  </label>
                  <StepperInput
                    id="min-days"
                    value={minDays}
                    onChange={setMinDays}
                    min={1}
                    placeholder="2"
                    className="rounded-xl border border-slate-200 bg-[var(--color-app-bg)] shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-600"
                  />
                </div>
                <div>
                  <label
                    htmlFor="max-days"
                    className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                  >
                    Maksimum kiralama süresi (gün)
                  </label>
                  <StepperInput
                    id="max-days"
                    value={maxDays}
                    onChange={setMaxDays}
                    min={1}
                    placeholder="30"
                    className="rounded-xl border border-slate-200 bg-[var(--color-app-bg)] shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-600"
                  />
                </div>
              </div>
            </FormSection>

            <FormSection step={5} title="Lokasyon ve teslimat">
              <div>
                <label
                  htmlFor="listing-address"
                  className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                >
                  Adres arama
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden
                  />
                  <input
                    id="listing-address"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Lefkoşa, Gönyeli, Atatürk Cad. …"
                    className={`${inputClass} py-3 pl-10 pr-4`}
                  />
                </div>
              </div>

              <MapWidget />

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-[var(--color-app-bg)] p-4 shadow-sm dark:border-slate-600">
                <input
                  type="checkbox"
                  checked={offersDelivery}
                  onChange={(e) => setOffersDelivery(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium leading-snug text-[var(--color-text)]">
                  Eşyayı adrese kendim teslim edebilirim (+₺ ücretli)
                </span>
              </label>
            </FormSection>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 dark:border-slate-700 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-xl border border-slate-200 bg-[var(--color-card)] px-6 py-3 text-sm font-bold text-[var(--color-text)] shadow-sm hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                Taslak olarak kaydet
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90"
              >
                İlanı yayınla
            </button>
          </div>
          </form>

          <aside className="min-w-0 lg:sticky lg:top-28">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              İlan önizleme
            </p>
            <ListingPreviewCard
              title={title}
              dailyPrice={dailyPrice}
              imageSrc={previewImageSrc}
              imageAlt={title.trim() || "İlan önizlemesi"}
              galleryPhotoCount={previewCount}
              galleryActiveIndex={safePreviewImageIndex}
              onGalleryPrev={goPreviewPrev}
              onGalleryNext={goPreviewNext}
              onGallerySelectIndex={goPreviewSelect}
            />
          </aside>
        </div>
      </motion.div>
    </InteractivePageShell>
  );
}
