"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LEFKOSA_CENTER } from "@/constants/google-maps";
import type { MapCoordinates } from "@/types/map";
import { Sparkles } from "lucide-react";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { FormSection } from "./FormSection";
import { ListingFormHeader } from "./ListingFormHeader";
import { PhotoDropzone } from "./PhotoDropzone";
import { ListingPreviewCard } from "./ListingPreviewCard";
import {
  CATEGORY_SELECT_PLACEHOLDER,
  CategorySelect,
} from "@/components/ui/CategorySelect";
import { AppToast, type AppToastType } from "@/components/ui/AppToast";
import { StepperInput } from "@/components/ui/StepperInput";
import { isLoggedIn } from "@/lib/session";
import { generateListingWithAI } from "@/services/ai";
import { createListing } from "@/services/listings";

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
  const [category, setCategory] = useState<string>(CATEGORY_SELECT_PLACEHOLDER);
  const [photos, setPhotos] = useState<File[]>([]);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [description, setDescription] = useState("");
  const [dailyPrice, setDailyPrice] = useState("150");
  const [minDays, setMinDays] = useState("2");
  const [maxDays, setMaxDays] = useState("30");
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [mapPosition, setMapPosition] = useState<MapCoordinates>(LEFKOSA_CENTER);
  const [offersDelivery, setOffersDelivery] = useState(false);
  const [rawAiText, setRawAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: AppToastType; message: string } | null>(
    null
  );

  const previewUrls = useMemo(
    () => photos.map((p) => URL.createObjectURL(p)),
    [photos]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [previewUrls]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = useCallback((message: string, type: AppToastType = "error") => {
    setToast({ message, type });
  }, []);

  const previewCount = previewUrls.length;
  const safePreviewImageIndex =
    previewCount === 0
      ? 0
      : Math.min(Math.max(0, previewImageIndex), previewCount - 1);

  const handleSaveDraft = useCallback(() => {
    // İleride services/listings.ts üzerinden API'ye gidecek
    showToast("Taslak kaydedildi (MVP: gerçek API henüz yok).", "success");
  }, [showToast]);

  const generateWithAI = useCallback(async () => {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }
    const text = rawAiText.trim();
    if (text.length < 3) {
      showToast("Lütfen en az 3 karakterlik bir metin girin.");
      return;
    }

    setAiLoading(true);
    setAiError(null);

    const res = await generateListingWithAI(text);

    setAiLoading(false);

    if (!res.ok) {
      setAiError(res.message);
      return;
    }

    setTitle(res.data.title.slice(0, 70));
    setDescription(res.data.description);
    setDailyPrice(String(res.data.daily_price));
  }, [rawAiText, router, showToast]);

  const handlePublish = useCallback(async () => {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }
    const price = Number(dailyPrice);
    const min = Number(minDays) || 1;
    const max = Number(maxDays) || min;
    if (!title.trim() || description.trim().length < 10 || !address.trim()) {
      showToast("Başlık, en az 10 karakter açıklama ve adres gerekli.");
      return;
    }
    if (!category.trim()) {
      showToast("Lütfen bir kategori seçin.");
      return;
    }
    if (!price || price < 0) {
      showToast("Geçerli günlük fiyat girin.");
      return;
    }
    if (max < min) {
      showToast("Maksimum gün, minimum günden küçük olamaz.");
      return;
    }
    const res = await createListing({
      title: title.trim(),
      description: description.trim(),
      category,
      daily_price: price,
      min_days: min,
      max_days: max,
      location: address.trim(),
    });
    if (!res.ok) {
      showToast(res.message);
      return;
    }
    router.push(`/ilan/${res.data.id}`);
  }, [
    router,
    title,
    description,
    category,
    dailyPrice,
    minDays,
    maxDays,
    address,
    showToast,
  ]);

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
          <div className="min-w-0 space-y-8">
            <section className="rounded-2xl border border-violet-200/40 bg-gradient-to-br from-violet-50/80 to-indigo-50/50 p-5 shadow-lg backdrop-blur-md dark:border-violet-500/20 dark:from-violet-950/30 dark:to-indigo-950/20 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles
                  className="size-5 text-violet-600 dark:text-violet-400"
                  aria-hidden
                />
                <h2 className="text-sm font-bold text-[var(--color-text)]">
                  AI ile İlan Oluştur
                </h2>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Eşyanızı kısaca anlatın; yapay zeka başlık, açıklama ve günlük
                fiyat alanlarını sizin için doldursun. Kategoriyi siz seçersiniz.
              </p>
              <label
                htmlFor="ai-raw-text"
                className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
              >
                Dağınık metin
              </label>
              <textarea
                id="ai-raw-text"
                rows={4}
                value={rawAiText}
                onChange={(e) => setRawAiText(e.target.value)}
                disabled={aiLoading}
                placeholder="Örn: 2 yıllık Bosch matkabım var, tüm uçlarıyla birlikte. Hafta sonu kiralanabilir, günde 200 TL civarı düşünüyorum."
                className={`${inputClass} mb-4 resize-y leading-relaxed disabled:cursor-not-allowed disabled:opacity-60`}
              />
              {aiError ? (
                <p
                  className="mb-4 text-sm font-medium text-red-600 dark:text-red-400"
                  role="alert"
                >
                  {aiError}
                </p>
              ) : null}
              <button
                type="button"
                onClick={() => void generateWithAI()}
                disabled={aiLoading || rawAiText.trim().length < 3}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Sparkles className="size-4" aria-hidden />
                {aiLoading ? "Yükleniyor..." : "✨ Yapay Zeka ile Doldur"}
              </button>
            </section>

            <form
              className="space-y-8"
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
              <CategorySelect
                id="listing-category"
                value={category}
                onChange={setCategory}
                label="Kategori seçin"
              />
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
              <MapWidget
                searchInputId="listing-address"
                searchLabel="Adres arama"
                address={address}
                onAddressChange={setAddress}
                position={mapPosition}
                onPositionChange={setMapPosition}
              />

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
          </div>

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

      {toast ? <AppToast message={toast.message} type={toast.type} /> : null}
    </InteractivePageShell>
  );
}
