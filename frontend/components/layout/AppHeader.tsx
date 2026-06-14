"use client";

import { EldenEleLogoLink } from "@/components/branding/EldenEleLogoLink";
import { useCategoryFilter } from "@/components/providers/CategoryFilterContext";
import { useSearchModal } from "@/components/providers/SearchModalContext";
import { CATEGORY_LABELS } from "@/lib/categories";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { clearAuthSession, isLoggedIn as checkLoggedIn } from "@/lib/session";
import { fetchMyProfile } from "@/services/profile";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AppHeaderProps {
  showCategoryBar?: boolean;
}

const LOCATION_OPTIONS = ["Lefkoşa", "Girne", "Mağusa"] as const;

/** Üst şeritte yatay kaydırılabilir alanın scrollbar’ını gizler */
const hideScrollbarClasses =
  "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function formatCityLabel(city: string): string {
  return `${city}, Kıbrıs`;
}

export function AppHeader({
  showCategoryBar = true,
}: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setIsSearchOpen } = useSearchModal();
  const { selectedCategoryLabel, toggleCategoryByLabel } = useCategoryFilter();
  const isMessagesActive = pathname?.startsWith("/mesajlar") ?? false;
  const [isVisible, setIsVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [locationLabel, setLocationLabel] = useState(formatCityLabel("Lefkoşa"));
  const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
  const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(false);

  const locationWrapRef = useRef<HTMLDivElement>(null);
  const categoryWrapRef = useRef<HTMLDivElement>(null);
  const profileWrapRef = useRef<HTMLDivElement>(null);
  const categoryScrollRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loggedIn = checkLoggedIn();
    setIsLoggedIn(loggedIn);
    if (!loggedIn) {
      setProfileAvatarUrl(null);
      return;
    }

    let cancelled = false;
    void fetchMyProfile().then((res) => {
      if (cancelled) return;
      setProfileAvatarUrl(res.ok ? res.data.avatar_base64 : null);
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const handleLogout = useCallback(() => {
    clearAuthSession();
    setIsLoggedIn(false);
    setProfileAvatarUrl(null);
    setIsProfileMenuOpen(false);
    router.push("/");
  }, [router]);

  useEffect(() => {
    let previousScrollY = window.scrollY;

    function onScroll() {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 8) {
        setIsVisible(true);
        previousScrollY = currentScrollY;
        return;
      }

      if (currentScrollY > previousScrollY) {
        setIsVisible(false);
      } else if (currentScrollY < previousScrollY) {
        setIsVisible(true);
      }
      previousScrollY = currentScrollY;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isLocationOpen && !isCategoryOpen && !isProfileMenuOpen) return;

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;
      if (locationWrapRef.current?.contains(target)) return;
      if (categoryWrapRef.current?.contains(target)) return;
      if (profileWrapRef.current?.contains(target)) return;
      setIsLocationOpen(false);
      setIsCategoryOpen(false);
      setIsProfileMenuOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isLocationOpen, isCategoryOpen, isProfileMenuOpen]);

  useEffect(() => {
    function updateCategoryScrollState() {
      const node = categoryScrollRef.current;
      if (!node) return;
      const hasOverflow = node.scrollWidth > node.clientWidth + 1;
      setCanScrollCategoriesLeft(node.scrollLeft > 4);
      setCanScrollCategoriesRight(
        hasOverflow && node.scrollLeft + node.clientWidth < node.scrollWidth - 4
      );
    }

    updateCategoryScrollState();
    const node = categoryScrollRef.current;
    if (!node) return;

    node.addEventListener("scroll", updateCategoryScrollState, { passive: true });
    window.addEventListener("resize", updateCategoryScrollState);

    return () => {
      node.removeEventListener("scroll", updateCategoryScrollState);
      window.removeEventListener("resize", updateCategoryScrollState);
    };
  }, []);

  /** Menü açıkkken ESC ile kapama — ek UX */
  useEffect(() => {
    if (!isLocationOpen && !isCategoryOpen && !isProfileMenuOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsLocationOpen(false);
        setIsCategoryOpen(false);
        setIsProfileMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLocationOpen, isCategoryOpen, isProfileMenuOpen]);

  function toggleLocation() {
    setIsCategoryOpen(false);
    setIsLocationOpen((v) => !v);
  }

  function toggleCategoryMenu() {
    setIsLocationOpen(false);
    setIsProfileMenuOpen(false);
    setIsCategoryOpen((v) => !v);
  }

  function toggleProfileMenu() {
    setIsLocationOpen(false);
    setIsCategoryOpen(false);
    setIsProfileMenuOpen((v) => !v);
  }

  function handlePickLocation(city: string) {
    setLocationLabel(formatCityLabel(city));
    setIsLocationOpen(false);
  }

  function handlePickCategoryFromMenu(label: string) {
    toggleCategoryByLabel(label);
    setIsCategoryOpen(false);
  }

  function handleHorizontalCategoryClick(label: string) {
    toggleCategoryByLabel(label);
  }

  function scrollCategoriesBy(direction: "left" | "right") {
    const node = categoryScrollRef.current;
    if (!node) return;
    const offset = Math.max(220, Math.floor(node.clientWidth * 0.55));
    node.scrollBy({
      left: direction === "right" ? offset : -offset,
      behavior: "smooth",
    });
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-slate-200/50 bg-white/70 font-sans text-[var(--color-text)] shadow-sm backdrop-blur-md transition-transform duration-300 ease-in-out dark:border-slate-800/50 dark:bg-slate-900/70 dark:shadow-black/30 ${isVisible ? "translate-y-0" : "-translate-y-full md:translate-y-0"}`}
    >
      {/* Mobil: sade üst alan (logo + tema + tek arama) */}
      <div className="mx-auto px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <EldenEleLogoLink variant="header" className="shrink-0" />
          <ThemeToggle />
        </div>
        <div className="relative mt-3 min-h-[44px] w-full">
          <SearchIconGlyph className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <label className="sr-only" htmlFor="global-search-mobile">
            İlan, marka veya kategori ara
          </label>
          <input
            id="global-search-mobile"
            type="search"
            name="search-mobile"
            placeholder="İlan, marka veya kategori ara..."
            autoComplete="off"
            readOnly
            onClick={() => setIsSearchOpen(true)}
            onFocus={() => setIsSearchOpen(true)}
            className="h-full w-full rounded-full border border-slate-200 bg-[var(--color-app-bg)] py-3 pr-10 pl-12 text-sm font-normal text-[var(--color-text)] outline-none ring-primary/20 transition-[box-shadow,border-color] placeholder:text-slate-400 focus:border-primary focus:ring-[3px] dark:border-slate-600 dark:placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Üst satır */}
      <div className="mx-auto hidden max-w-7xl px-4 pt-4 pb-3 md:block lg:pb-4">
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
                  readOnly
                  onClick={() => setIsSearchOpen(true)}
                  onFocus={() => setIsSearchOpen(true)}
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
            <Link
              href="/mesajlar"
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors active:scale-95 ${
                isMessagesActive
                  ? "border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15"
                  : "border-slate-200/90 bg-[var(--color-app-bg)] text-[var(--color-text)] hover:bg-slate-200/35 dark:border-slate-600 dark:hover:bg-slate-700/50"
              }`}
              aria-label="Mesajlar"
              aria-current={isMessagesActive ? "page" : undefined}
            >
              <MessageSquare className="size-[1.125rem]" strokeWidth={1.8} aria-hidden />
            </Link>
            <ThemeToggle />
            {!isLoggedIn ? (
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-full border border-slate-200/90 bg-[var(--color-app-bg)] px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition-colors hover:bg-slate-200/35 dark:border-slate-600 dark:hover:bg-slate-700/40 dark:hover:bg-slate-800/70"
              >
                Giriş Yap
              </Link>
            ) : (
              <div
                ref={profileWrapRef}
                className="relative inline-flex shrink-0 items-center self-center"
              >
                <button
                  type="button"
                  onClick={toggleProfileMenu}
                  className="inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200/90 bg-[var(--color-app-bg)] p-0 text-[var(--color-text)] shadow-sm transition-colors hover:bg-slate-200/35 active:scale-95 dark:border-slate-600 dark:hover:bg-slate-700/50"
                  aria-haspopup="menu"
                  aria-expanded={isProfileMenuOpen}
                  aria-label="Profil menüsü"
                >
                  {profileAvatarUrl ? (
                    <img
                      src={profileAvatarUrl}
                      alt=""
                      className="block size-full object-cover"
                    />
                  ) : (
                    <UserGlyph className="size-[1.125rem]" />
                  )}
                </button>
                {isProfileMenuOpen ? (
                  <div
                    className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-[var(--color-card)] py-1 shadow-lg dark:border-slate-600"
                    role="menu"
                    aria-label="Profil menüsü"
                  >
                    <Link
                      href="/profil"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-app-bg)] hover:text-primary dark:hover:bg-slate-800/80"
                      role="menuitem"
                    >
                      Profilim
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-2.5 text-left text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-app-bg)] hover:text-red-600 dark:hover:bg-slate-800/80 dark:hover:text-red-400"
                      role="menuitem"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Alt satır */}
      {showCategoryBar ? (
        <div className="hidden border-t border-slate-200/90 bg-white/80 md:block dark:border-slate-700/90 dark:bg-[var(--color-card)]">
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
                  {CATEGORY_LABELS.map((label) => (
                    <li key={label} role="option">
                      <button
                        type="button"
                        onClick={() => handlePickCategoryFromMenu(label)}
                        className={`flex w-full px-4 py-2.5 text-left text-sm hover:bg-[var(--color-app-bg)] hover:text-primary dark:hover:bg-slate-800/80 ${
                          selectedCategoryLabel === label
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

          <div className="relative min-w-0 flex-1">
            {canScrollCategoriesLeft ? (
              <button
                type="button"
                onClick={() => scrollCategoriesBy("left")}
                className="absolute left-1 top-1/2 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-[var(--color-card)]/95 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:text-primary dark:border-slate-600 dark:text-slate-300 md:inline-flex"
                aria-label="Kategorileri sola kaydır"
              >
                <ChevronLeftGlyph className="size-4" />
              </button>
            ) : null}

            {canScrollCategoriesRight ? (
              <button
                type="button"
                onClick={() => scrollCategoriesBy("right")}
                className="absolute right-1 top-1/2 z-10 hidden size-7 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-[var(--color-card)]/95 text-slate-500 shadow-sm backdrop-blur-sm transition-colors hover:text-primary dark:border-slate-600 dark:text-slate-300 md:inline-flex"
                aria-label="Kategorileri sağa kaydır"
              >
                <ChevronRightGlyph className="size-4" />
              </button>
            ) : null}

            <nav
              ref={categoryScrollRef}
              aria-label="Kategori listesi"
              className={`min-w-0 overflow-x-auto pb-px ${hideScrollbarClasses}`}
            >
              <ul className="flex min-h-10 gap-2 pr-1">
                {CATEGORY_LABELS.map((label) => (
                  <li key={label} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => handleHorizontalCategoryClick(label)}
                      className={`inline-flex whitespace-nowrap rounded-full border px-3 py-2 text-sm outline-none ring-primary/30 transition-colors focus-visible:ring-2 ${
                        selectedCategoryLabel === label
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

function ChevronLeftGlyph({ className }: { className?: string }) {
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
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightGlyph({ className }: { className?: string }) {
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
      <path d="m9 18 6-6-6-6" />
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

function UserGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 21a6 6 0 0 0-12 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}
