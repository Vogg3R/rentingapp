"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SearchModalContextValue {
  isSearchOpen: boolean;
  setIsSearchOpen: (next: boolean) => void;
}

const SearchModalContext = createContext<SearchModalContextValue | undefined>(
  undefined
);

export function SearchModalProvider({ children }: { children: ReactNode }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const value = useMemo(
    () => ({
      isSearchOpen,
      setIsSearchOpen,
    }),
    [isSearchOpen]
  );

  return (
    <SearchModalContext.Provider value={value}>
      {children}
    </SearchModalContext.Provider>
  );
}

export function useSearchModal() {
  const ctx = useContext(SearchModalContext);
  if (!ctx) {
    throw new Error("useSearchModal must be used within SearchModalProvider");
  }
  return ctx;
}
