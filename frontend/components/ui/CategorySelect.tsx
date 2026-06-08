import { LISTING_CATEGORIES } from "@/constants/listing-categories";
import { ChevronDown, LayoutGrid } from "lucide-react";

/** Form seçicisinde kullanılan boş değer; kategori listesine dahil değildir */
export const CATEGORY_SELECT_PLACEHOLDER = "";

interface CategorySelectProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
}

/** İlan / istek formlarında ortak kategori seçici */
export function CategorySelect({
  id,
  value,
  onChange,
  className = "",
  label = "Kategori",
}: CategorySelectProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
      >
        {label}
      </label>
      <div className="relative">
        <LayoutGrid
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm font-medium outline-none transition-[box-shadow,border-color] focus:border-primary focus:ring-[3px] focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800/70 ${
            value === CATEGORY_SELECT_PLACEHOLDER
              ? "text-slate-400 dark:text-slate-500"
              : "text-[var(--color-text)]"
          } ${className}`}
        >
          <option value={CATEGORY_SELECT_PLACEHOLDER}>-Seçiniz-</option>
          {LISTING_CATEGORIES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
      </div>
    </div>
  );
}
