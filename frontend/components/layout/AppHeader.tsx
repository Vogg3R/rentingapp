"use client";

import { EldenEleLogoLink } from "@/components/branding/EldenEleLogoLink";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface AppHeaderProps {
  apiMessage?: string;
}

const CATEGORY_ITEMS = [
  "Araç",
  "Elektronik",
  "Fotoğraf & Kamera",
  "Kamp & Dış Mekan",
  "Eğitim",
  "Hobi",
] as const;

const LOCATION_OPTIONS = ["Lefkoşa", "Girne", "Mağusa"] as const;

/** Üst şeritte yatay kaydırılabilir alanın scrollbar’ını gizler */
const hideScrollbarClasses =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function formatCityLabel(city: string): string {
  return `${city}, Kıbrıs`;
}

export function AppHeader({ apiMessage }: AppHeaderProps) {
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [locationLabel, setLocationLabel] = useState(formatCityLabel("Lefkoşa"));

  const locationWrapRef = useRef<HTMLDivElement>(null);
  const categoryWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLocationOpen && !isCategoryOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (locationWrapRef.current?.contains(target)) return;
      if (categoryWrapRef.current?.contains(target)) return;
      setIsLocationOpen(false);
      setIsCategoryOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isLocationOpen, isCategoryOpen]);

  /** Menü açıkkken ESC ile kapama — ek UX */
  useEffect(() => {
    if (!isLocationOpen && !isCategoryOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsLocationOpen(false);
        setIsCategoryOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLocationOpen, isCategoryOpen]);

  function toggleLocation() {
    setIsCategoryOpen(false);
    setIsLocationOpen((v) => !v);
  }

  function toggleCategoryMenu() {
    setIsLocationOpen(false);
    setIsCategoryOpen((v) => !v);
  }

  function handlePickLocation(city: string) {
    setLocationLabel(formatCityLabel(city));
    setIsLocationOpen(false);
  }

  function handlePickCategoryFromMenu(label: string) {
    setActiveTab(label);
    setIsCategoryOpen(false);
  }

  function handleHorizontalCategoryClick(label: string) {
    setActiveTab(label);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-[var(--color-card)] font-sans text-[var(--color-text)] shadow-sm dark:border-slate-700/90 dark:shadow-black/30">
      {/* Üst satır */}
      <div className="mx-auto max-w-7xl px-4 pt-4 pb-3 lg:pb-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
            <EldenEleLogoLink variant="header" className="shrink-0" />

            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
              <div className="relative min-h-[44px] min-w-0 flex-1">
                <SearchIconGlyph className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <label className="sr-only" htmlFor="global-search">
                  İlan, marka veya kategori ara
                </label>
                <input
                  id="global-search"
                  type="search"
                  name="search"
                  placeholder="İlan, marka veya kategori ara..."
                  autoComplete="off"
                  className="h-full w-full rounded-full border border-slate-200 bg-[var(--color-app-bg)] py-3 pr-10 pl-12 text-sm font-normal text-[var(--color-text)] outline-none ring-primary/20 transition-[box-shadow,border-color] placeholder:text-slate-400 focus:border-primary focus:ring-[3px] dark:border-slate-600 dark:placeholder:text-slate-500"
                />
              </div>

              <div ref={locationWrapRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={toggleLocation}
                  className="inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-full border border-slate-200 bg-[var(--color-app-bg)] px-4 py-2.5 text-sm font-normal text-[var(--color-text)] shadow-sm transition-colors hover:bg-slate-100/90 dark:border-slate-600 dark:hover:bg-slate-800/70 sm:w-auto"
                  aria-haspopup="listbox"
                  aria-expanded={isLocationOpen}
                  aria-label={`Konum seç — ${locationLabel}`}
                >
                  <PinIconGlyph className="size-5 shrink-0 text-primary" aria-hidden />
                  <span className="truncate">{locationLabel}</span>
                  <ChevronDownGlyph
                    className={`size-[18px] shrink-0 text-slate-500 transition-transform duration-150 dark:text-slate-400 ${isLocationOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>

                {isLocationOpen ? (
                  <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 min-w-[12rem] overflow-auto rounded-xl border border-slate-200 bg-[var(--color-card)] py-2 shadow-lg outline-none dark:border-slate-600 md:left-auto md:right-auto"
                    aria-label="Konum listesi"
                  >
                    {LOCATION_OPTIONS.map((city) => (
                      <li key={city} role="option">
                        <button
                          type="button"
                          onClick={() => handlePickLocation(city)}
                          className="flex w-full px-4 py-2 text-left text-sm font-normal text-[var(--color-text)] hover:bg-[var(--color-app-bg)] hover:text-primary dark:hover:bg-slate-800/80"
                        >
                          {formatCityLabel(city)}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>

          <nav
            aria-label="Hesap eylemleri"
            className="flex shrink-0 items-center justify-end gap-2 sm:justify-start xl:ml-auto"
          >
            <Link
              href="/auth"
              className="inline-flex items-center justify-center rounded-full border border-slate-200/90 bg-[var(--color-app-bg)] px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition-colors hover:bg-slate-200/35 dark:border-slate-600 dark:hover:bg-slate-700/40 dark:hover:bg-slate-800/70"
            >
              Giriş Yap
            </Link>
            <Link
              href="/ilan-ver"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-primary/90 active:bg-primary/80"
              aria-label="Kiraya ver"
            >
              <PlusGlyph
                className="size-5 shrink-0 transition-transform duration-300 ease-out group-hover:rotate-90"
                aria-hidden
              />
              Kiraya Ver
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </div>

      {/* Alt satır */}
      <div className="border-t border-slate-200/90 bg-[var(--color-card)] dark:border-slate-700/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2.5 md:flex-row md:items-start md:gap-3 md:py-3">
          <div ref={categoryWrapRef} className="relative w-full shrink-0 md:w-auto">
            <button
              type="button"
              onClick={toggleCategoryMenu}
              className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-sm font-bold text-[var(--color-text)] transition-colors hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/90 md:h-9 md:w-auto"
              aria-haspopup="listbox"
              aria-expanded={isCategoryOpen}
              aria-label="Tüm kategoriler"
            >
              <GridIconGlyph className="size-5 text-slate-600 dark:text-slate-300" aria-hidden />
              <span>Tüm Kategoriler</span>
              <ChevronDownGlyph
                className={`size-[18px] text-slate-500 transition-transform duration-150 dark:text-slate-400 ${isCategoryOpen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>

            {isCategoryOpen ? (
              <div
                className="absolute left-0 z-50 mt-2 max-h-[min(20rem,70vh)] w-full max-w-[min(100vw-2rem,20rem)] overflow-auto rounded-xl border border-slate-200 bg-[var(--color-card)] py-2 shadow-lg dark:border-slate-600 md:min-w-[14rem]"
                role="presentation"
              >
                <ul role="listbox" aria-label="Tüm kategoriler menüsü">
                  {CATEGORY_ITEMS.map((label) => (
                    <li key={label} role="option">
                      <button
                        type="button"
                        onClick={() => handlePickCategoryFromMenu(label)}
                        className={`flex w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-app-bg)] hover:text-primary dark:hover:bg-slate-800/80 ${
                          activeTab === label
                            ? "font-semibold text-primary"
                            : "font-normal text-gray-600 dark:text-slate-400"
                        }`}
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <nav
            aria-label="Kategori listesi"
            className={`min-w-0 flex-1 overflow-x-auto pb-px ${hideScrollbarClasses}`}
          >
            <ul className="flex min-h-10 gap-2 pr-1">
              {CATEGORY_ITEMS.map((label) => (
                <li key={label} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => handleHorizontalCategoryClick(label)}
                    className={`inline-flex whitespace-nowrap rounded-full border px-3 py-2 text-sm outline-none ring-primary/30 transition-colors focus-visible:ring-2 ${
                      activeTab === label
                        ? "border-primary/30 bg-primary/5 font-semibold text-primary"
                        : "border-transparent bg-transparent font-normal text-gray-600 hover:border-slate-200 hover:bg-[var(--color-app-bg)] hover:text-gray-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
                    }`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {apiMessage ? (
        <div className="border-t border-emerald-100 bg-emerald-50/90 px-4 py-2 text-center text-xs font-normal text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 md:text-sm">
          {apiMessage}
        </div>
      ) : null}
    </header>
  );
}

function SearchIconGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function PinIconGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function ChevronDownGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function PlusGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function GridIconGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
