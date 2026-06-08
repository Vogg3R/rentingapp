"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
} from "react";
import dynamic from "next/dynamic";
import { isLoggedIn } from "@/lib/session";
import { createItemRequest } from "@/services/requests";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LEFKOSA_CENTER } from "@/constants/google-maps";
import type { MapCoordinates } from "@/types/map";
import { CheckCircle2, ImagePlus, Sparkles, XCircle } from "lucide-react";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { FormSection } from "@/components/listing/FormSection";
import {
  CATEGORY_SELECT_PLACEHOLDER,
  CategorySelect,
} from "@/components/ui/CategorySelect";
import { StepperInput } from "@/components/ui/StepperInput";
import { generateListingWithAI } from "@/services/ai";
import { RequestListingHeader } from "./RequestListingHeader";
import { RequestListingPreviewCard } from "./RequestListingPreviewCard";

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

const PRODUCT_CONDITIONS = [
  "Yeni",
  "Temiz",
  "Az Kullanılmış",
  "Farketmez",
] as const;

type AiToast = { type: "success" | "error"; message: string };

export function RequestListingFormPage() {
  const router = useRouter();
  const representativeInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORY_SELECT_PLACEHOLDER);
  const [representativeImageName, setRepresentativeImageName] = useState("");
  const [representativeImagePreviewUrl, setRepresentativeImagePreviewUrl] =
    useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [maxDailyBudget, setMaxDailyBudget] = useState("");
  const [requestDurationCount, setRequestDurationCount] = useState("1");
  const [requestDuration, setRequestDuration] = useState("Günlük");
  const [address, setAddress] = useState("");
  const [mapPosition, setMapPosition] = useState<MapCoordinates>(LEFKOSA_CENTER);
  const [rawAiText, setRawAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiToast, setAiToast] = useState<AiToast | null>(null);

  useEffect(() => {
    if (!aiToast) return;
    const timer = window.setTimeout(() => setAiToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [aiToast]);

  const setRepresentativeImageFromFile = useCallback((file: File | null) => {
    setRepresentativeImagePreviewUrl((previousUrl) => {
      if (previousUrl) {
        URL.revokeObjectURL(previousUrl);
      }

      if (!file) {
        setRepresentativeImageName("");
        return null;
      }

      setRepresentativeImageName(
        file.name || "panodan-yapistirilan-gorsel.png"
      );
      return URL.createObjectURL(file);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (representativeImagePreviewUrl) {
        URL.revokeObjectURL(representativeImagePreviewUrl);
      }
    };
  }, [representativeImagePreviewUrl]);

  const handleSaveDraft = useCallback(() => {
    window.alert("İstek ilanı taslak olarak kaydedildi (MVP).");
  }, []);

  const generateWithAI = useCallback(async () => {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }
    const text = rawAiText.trim();
    if (text.length < 3) {
      setAiToast({
        type: "error",
        message: "Lütfen en az 3 karakterlik bir metin girin.",
      });
      return;
    }

    setAiLoading(true);
    setAiToast(null);

    const res = await generateListingWithAI(text);

    setAiLoading(false);

    if (!res.ok) {
      setAiToast({ type: "error", message: res.message });
      return;
    }

    setTitle(res.data.title.slice(0, 70));
    setDescription(res.data.description);
    setMaxDailyBudget(String(res.data.daily_price));
    setAiToast({
      type: "success",
      message: "İstek formu yapay zeka ile dolduruldu.",
    });
  }, [rawAiText, router]);

  const handlePublish = useCallback(async () => {
    if (!isLoggedIn()) {
      router.push("/auth");
      return;
    }
    const budget = Number(maxDailyBudget);
    const days = Number(requestDurationCount) || 1;
    if (!title.trim() || description.trim().length < 10 || !address.trim()) {
      window.alert("Başlık, en az 10 karakter açıklama ve adres gerekli.");
      return;
    }
    if (!category.trim()) {
      window.alert("Lütfen bir kategori seçin.");
      return;
    }
    if (!budget || budget < 0) {
      window.alert("Geçerli bir günlük bütçe girin.");
      return;
    }
    const res = await createItemRequest({
      title: title.trim(),
      category,
      description: description.trim(),
      max_daily_budget: budget,
      duration_days: days,
      location: address.trim(),
    });
    if (!res.ok) {
      window.alert(res.message);
      return;
    }
    router.push(`/talep/${res.data.id}`);
  }, [
    router,
    title,
    category,
    description,
    maxDailyBudget,
    requestDurationCount,
    address,
  ]);

  const handleConditionToggle = useCallback((value: string) => {
    setSelectedConditions((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }, []);

  const requesterName = useMemo(() => {
    return "Gökhan G.";
  }, []);

  const handleRepresentativeImagePaste = useCallback(
    (event: ClipboardEvent<HTMLDivElement>) => {
      const imageItem = Array.from(event.clipboardData.items).find((item) =>
        item.type.startsWith("image/")
      );
      if (!imageItem) return;

      // Panodaki görseli dosya gibi ele alıp alanla aynı akışta kullanıyoruz.
      const pastedFile = imageItem.getAsFile();
      if (!pastedFile) return;
      setRepresentativeImageFromFile(pastedFile);
      event.preventDefault();
    },
    [setRepresentativeImageFromFile]
  );
  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-[var(--color-text)] shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 dark:border-slate-700/50 dark:bg-slate-900/50";

  return (
    <InteractivePageShell className="bg-[var(--color-app-bg)]">
      <RequestListingHeader
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-7xl px-4 py-8 pb-20"
      >
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl">
          Ürün Kiralamak İsteyenler
        </h1>
        <p className="mb-8 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Aradığınız ürünü bulamadınız mı? Adım adım istek ilanı oluşturun,
          sağlayıcılar size teklif versin.
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
                  AI ile İstek Oluştur
                </h2>
              </div>
              <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                Ne aradığınızı kısaca yazın; yapay zeka başlık, açıklama ve günlük
                bütçe alanlarını sizin için doldursun. Kategoriyi siz seçersiniz.
              </p>
              <label
                htmlFor="request-ai-raw-text"
                className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
              >
                Dağınık metin
              </label>
              <textarea
                id="request-ai-raw-text"
                rows={4}
                value={rawAiText}
                onChange={(e) => setRawAiText(e.target.value)}
                disabled={aiLoading}
                placeholder="Örn: 3 günlüğüne GoPro Hero 11 kiralamak istiyorum, günlük max 400 TL verebilirim. Dalış için kullanacağım."
                className={`${inputClass} mb-4 resize-y leading-relaxed disabled:cursor-not-allowed disabled:opacity-60`}
              />
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
              onSubmit={(event) => event.preventDefault()}
              noValidate
            >
            <FormSection step={1} title="Ne Arıyorsunuz?">
              <div>
                <label
                  htmlFor="request-title"
                  className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                >
                  İlan Başlığı (Aranan Ürün)
                </label>
                <input
                  id="request-title"
                  type="text"
                  maxLength={70}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Aradığım Ürün/Model (Örn: GoPro Hero 11)"
                  className={inputClass}
                />
              </div>
              <div>
                <CategorySelect
                  id="request-category"
                  value={category}
                  onChange={setCategory}
                  label="Kategori seçin"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Ana sayfadaki kategori filtresiyle eşleşir; doğru kategori seçmek
                  teklif alma şansınızı artırır.
                </p>
              </div>
            </FormSection>

            <FormSection step={2} title="Görsel Temsil">
              <div
                tabIndex={0}
                onPaste={handleRepresentativeImagePaste}
                className="rounded-xl border-2 border-dashed border-[#2563EB]/35 bg-[#2563EB]/[0.05] px-4 py-10 text-center outline-none ring-[#2563EB]/20 transition-colors hover:border-[#2563EB]/55 hover:bg-[#2563EB]/[0.08] focus-visible:ring-2"
                aria-label="Temsili görsel alanı, yapıştırma destekli"
                onClick={() => {
                  representativeInputRef.current?.focus();
                }}
              >
                <div className="flex min-h-[180px] w-full flex-col items-center justify-center gap-3">
                  <ImagePlus
                    className="size-12 text-[#2563EB]/80"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <button
                    type="button"
                    onClick={() => representativeInputRef.current?.click()}
                    className="rounded-lg bg-[#2563EB] px-4 py-1.5 text-sm font-semibold text-white"
                  >
                    Dosya Seç
                  </button>
                  <span className="text-sm font-medium text-[var(--color-text)]">
                    Uydurma/temsili bir görsel eklemek şansınızı artırır.
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Bu alan aktifken Google&apos;dan kopyaladığınız resmi Ctrl+V
                    ile yapıştırabilirsiniz.
                  </span>
                  <input
                    ref={representativeInputRef}
                    id="representative-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setRepresentativeImageFromFile(file);
                    }}
                  />
                </div>
              </div>
              {representativeImageName ? (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Seçilen dosya: {representativeImageName}
                  </p>
                  <button
                    type="button"
                    onClick={() => setRepresentativeImageFromFile(null)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                  >
                    Görseli Sil
                  </button>
                </div>
              ) : null}
            </FormSection>

            <FormSection step={3} title="Kullanım Detayları & Tercihler">
              <div>
                <label
                  htmlFor="request-description"
                  className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                >
                  Detaylı Açıklama
                </label>
                <textarea
                  id="request-description"
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Detaylı Açıklama (Nerede, ne amaçla kullanacaksınız?)"
                  className={`${inputClass} resize-y leading-relaxed`}
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-bold text-[var(--color-text)]">
                  Ürün Durumu Tercihleri
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PRODUCT_CONDITIONS.map((condition) => (
                    <label
                      key={condition}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[var(--color-app-bg)] px-3 py-2.5 text-sm font-medium text-[var(--color-text)] shadow-sm dark:border-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(condition)}
                        onChange={() => handleConditionToggle(condition)}
                        className="size-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB]"
                      />
                      {condition}
                    </label>
                  ))}
                </div>
              </div>
            </FormSection>

            <FormSection step={4} title="Talep Şartları & Bütçe">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="max-daily-budget"
                    className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
                  >
                    Maksimum Günlük Bütçe
                  </label>
                  <div className="flex rounded-xl border border-slate-200 bg-[var(--color-app-bg)] shadow-sm focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 dark:border-slate-600">
                    <span className="flex items-center pl-3 text-sm font-semibold text-slate-500">
                      ₺
                    </span>
                    <StepperInput
                      id="max-daily-budget"
                      value={maxDailyBudget}
                      onChange={setMaxDailyBudget}
                      min={0}
                      placeholder="150"
                      className="min-w-0 flex-1 rounded-r-xl border-0 bg-transparent shadow-none focus-within:ring-0"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-bold text-[var(--color-text)]">
                    Talep Süresi
                  </label>
                  <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-2">
                    <StepperInput
                        id="request-duration-count"
                        value={requestDurationCount}
                        onChange={setRequestDurationCount}
                        min={1}
                        placeholder="Sayı"
                        className="rounded-xl border border-slate-200 bg-[var(--color-app-bg)] shadow-sm focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/20 dark:border-slate-600"
                      />
                    <select
                      id="request-duration"
                      value={requestDuration}
                      onChange={(event) => setRequestDuration(event.target.value)}
                      className={`${inputClass} font-medium`}
                    >
                      <option value="Günlük">Günlük</option>
                      <option value="Haftalık">Haftalık</option>
                      <option value="Aylık">Aylık</option>
                    </select>
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection step={5} title="Konum & Teslimat">
              <MapWidget
                searchInputId="request-address"
                searchLabel="Adres arama"
                address={address}
                onAddressChange={setAddress}
                position={mapPosition}
                onPositionChange={setMapPosition}
              />
            </FormSection>
            </form>
          </div>

          <aside className="min-w-0 lg:sticky lg:top-28">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              İstek ilanı önizleme
            </p>
            <RequestListingPreviewCard
              title={title}
              budget={maxDailyBudget}
              duration={`${requestDurationCount || "1"} ${requestDuration}`}
              city={address}
              requesterName={requesterName}
              imageSrc={representativeImagePreviewUrl}
            />
          </aside>
        </div>

        {aiToast ? (
          <div
            className={`fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg md:bottom-8 ${
              aiToast.type === "success"
                ? "border-emerald-200 bg-white text-emerald-800 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200"
                : "border-red-200 bg-white text-red-800 dark:border-red-800 dark:bg-slate-900 dark:text-red-200"
            }`}
            role="status"
            aria-live="polite"
          >
            {aiToast.type === "success" ? (
              <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden />
            ) : (
              <XCircle className="size-5 shrink-0 text-red-500" aria-hidden />
            )}
            {aiToast.message}
          </div>
        ) : null}
      </motion.div>
    </InteractivePageShell>
  );
}
