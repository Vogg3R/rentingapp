"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Box, Camera, Search, Tent, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type KeyboardEvent } from "react";
import { useSearchModal } from "@/components/providers/SearchModalContext";

const RECENT_SEARCHES = ["Matkap", "GoPro 11", "Çadır"] as const;

const POPULAR_CATEGORIES = [
  { label: "Fotoğraf & Kamera", icon: Camera },
  { label: "Kamp & Dış Mekan", icon: Tent },
  { label: "Elektronik & Bilgisayar", icon: Box },
] as const;

export function SearchModal() {
  const { isSearchOpen, setIsSearchOpen } = useSearchModal();
  const router = useRouter();
  const [query, setQuery] = useState("");

  // Arama terimini sonuç sayfasına yönlendirir ve modalı kapatır.
  function runSearch(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    setIsSearchOpen(false);
    setQuery("");
    router.push(`/arama?q=${encodeURIComponent(trimmed)}`);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch(query);
    }
  }

  return (
    <AnimatePresence>
      {isSearchOpen ? (
        <motion.div
          className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSearchOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mx-4 mt-20 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-5 py-4">
              <Search className="size-5 text-slate-400" />
              <input
                autoFocus
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="İlan, ürün veya kategori ara..."
                className="min-w-0 flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                aria-label="Arama modalını kapat"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="border-b border-slate-200 dark:border-slate-800" />

            <div className="space-y-6 px-5 py-5">
              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Son Arananlar
                </h3>
                <div className="flex flex-wrap gap-2">
                  {RECENT_SEARCHES.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => runSearch(item)}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  Popüler Kategoriler
                </h3>
                <div className="space-y-1">
                  {POPULAR_CATEGORIES.map((category) => (
                    <button
                      key={category.label}
                      type="button"
                      onClick={() => runSearch(category.label)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <category.icon className="size-4 text-blue-600" />
                      {category.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
