"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Karanlık / aydınlık mod; tıklanınca ikon için kısa dönüş animasyonu */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [playClickAnim, setPlayClickAnim] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  function handleToggle() {
    setPlayClickAnim(true);
    setTheme(isDark ? "light" : "dark");
  }

  useEffect(() => {
    if (!playClickAnim) return;
    const t = window.setTimeout(() => setPlayClickAnim(false), 560);
    return () => window.clearTimeout(t);
  }, [playClickAnim]);

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200/90 bg-[var(--color-app-bg)] text-[var(--color-text)] shadow-sm transition-colors hover:bg-slate-200/35 active:scale-95 dark:border-slate-600 dark:hover:bg-slate-700/50"
      aria-label={isDark ? "Açık moda geç" : "Koyu moda geç"}
      aria-pressed={isDark}
    >
      {mounted ? (
        <span
          className={`inline-flex items-center justify-center ${playClickAnim ? "theme-toggle-icon-animate" : ""}`}
          onAnimationEnd={() => setPlayClickAnim(false)}
        >
          {isDark ? (
            <Sun className="size-[1.125rem]" strokeWidth={2} aria-hidden />
          ) : (
            <Moon className="size-[1.125rem]" strokeWidth={2} aria-hidden />
          )}
        </span>
      ) : (
        <span className="size-[1.125rem]" aria-hidden />
      )}
    </button>
  );
}
