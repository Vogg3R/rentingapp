"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LISTING_CATEGORIES } from "@/constants/listing-categories";
import { Check, ChevronDown, LayoutGrid } from "lucide-react";

/** Form seçicisinde kullanılan boş değer; kategori listesine dahil değildir */
export const CATEGORY_SELECT_PLACEHOLDER = "";

interface CategorySelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

/** Açılır menünün ekrandaki sabit (fixed) konumu */
interface MenuRect {
  top: number;
  left: number;
  width: number;
}

/** İlan / istek formlarında ortak kategori seçici (özel açılır menü) */
export function CategorySelect({
  id,
  value,
  onChange,
  className = "",
  label = "Kategori",
}: CategorySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuRect, setMenuRect] = useState<MenuRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  // Seçili kategorinin etiketini (Türkçe) bul; yoksa placeholder göster.
  const selectedLabel = useMemo(() => {
    const match = LISTING_CATEGORIES.find((item) => item.value === value);
    return match?.label ?? null;
  }, [value]);

  // Tetikleyici butona göre menüyü konumlandır (mt-2 = 8px boşluk).
  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuRect({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  }, []);

  // Menü açıldığında konumu hesapla (portal body'ye render edildiği için fixed).
  useLayoutEffect(() => {
    if (isOpen) updateMenuPosition();
  }, [isOpen, updateMenuPosition]);

  // Dışarı tıklama, Escape, scroll ve resize davranışları.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    // Sayfa kaydırılır/boyutlanırsa menüyü tetikleyiciyle hizalı tut.
    window.addEventListener("scroll", updateMenuPosition, true);
    window.addEventListener("resize", updateMenuPosition);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", updateMenuPosition, true);
      window.removeEventListener("resize", updateMenuPosition);
    };
  }, [isOpen, updateMenuPosition]);

  const handleSelect = useCallback(
    (nextValue: string) => {
      onChange(nextValue);
      setIsOpen(false);
    },
    [onChange]
  );

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
      >
        {label}
      </label>
      <div className="relative">
        {/* Tetikleyici buton — proje input tasarımıyla birebir aynı */}
        <button
          id={id}
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`flex w-full items-center rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-left text-sm font-medium outline-none transition-[box-shadow,border-color] focus:border-primary focus:ring-[3px] focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800/70 ${
            selectedLabel
              ? "text-[var(--color-text)]"
              : "text-slate-400 dark:text-slate-500"
          } ${className}`}
        >
          <LayoutGrid
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <span className="truncate">{selectedLabel ?? "-Seçiniz-"}</span>
          <ChevronDown
            className={`pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden
          />
        </button>
      </div>

      {/* Menü, tüm stacking-context'lerden kaçmak için body'ye portal'lanır */}
      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {isOpen && menuRect ? (
                <motion.ul
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.97, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: -4 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  role="listbox"
                  aria-label={label}
                  style={{
                    position: "fixed",
                    top: menuRect.top,
                    left: menuRect.left,
                    width: menuRect.width,
                  }}
                  className="z-[100] max-h-64 origin-top overflow-auto rounded-md border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
                >
                  {LISTING_CATEGORIES.map((item) => {
                    const isSelected = item.value === value;
                    return (
                      <li
                        key={item.value}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(item.value)}
                          className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 dark:hover:bg-blue-600 dark:hover:text-white ${
                            isSelected
                              ? "bg-blue-50 font-semibold text-primary dark:bg-blue-600/90 dark:text-white"
                              : "text-slate-700 dark:text-slate-200"
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {isSelected ? (
                            <Check className="size-4 shrink-0" aria-hidden />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </motion.ul>
              ) : null}
            </AnimatePresence>,
            document.body
          )
        : null}
    </div>
  );
}
