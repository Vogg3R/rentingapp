"use client";

import { getCategoryLabel, getCategorySlugFromLabel } from "@/lib/categories";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CategoryFilterContextValue {
  /** null = tüm kategoriler */
  selectedCategorySlug: string | null;
  selectedCategoryLabel: string | null;
  toggleCategoryByLabel: (label: string) => void;
  clearCategoryFilter: () => void;
}

const CategoryFilterContext = createContext<CategoryFilterContextValue | null>(
  null
);

export function CategoryFilterProvider({ children }: { children: ReactNode }) {
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(
    null
  );

  const toggleCategoryByLabel = useCallback((label: string) => {
    const slug = getCategorySlugFromLabel(label);
    if (!slug) return;
    setSelectedCategorySlug((current) => (current === slug ? null : slug));
  }, []);

  const clearCategoryFilter = useCallback(() => {
    setSelectedCategorySlug(null);
  }, []);

  const value = useMemo(
    () => ({
      selectedCategorySlug,
      selectedCategoryLabel: selectedCategorySlug
        ? getCategoryLabel(selectedCategorySlug)
        : null,
      toggleCategoryByLabel,
      clearCategoryFilter,
    }),
    [selectedCategorySlug, toggleCategoryByLabel, clearCategoryFilter]
  );

  return (
    <CategoryFilterContext.Provider value={value}>
      {children}
    </CategoryFilterContext.Provider>
  );
}

export function useCategoryFilter(): CategoryFilterContextValue {
  const ctx = useContext(CategoryFilterContext);
  if (!ctx) {
    throw new Error("useCategoryFilter must be used within CategoryFilterProvider");
  }
  return ctx;
}
