"use client";

import { useCallback } from "react";

interface StepperInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  placeholder?: string;
  className?: string;
}

export function StepperInput({
  id,
  value,
  onChange,
  min = 0,
  placeholder,
  className,
}: StepperInputProps) {
  const normalizedClassName =
    className ??
    "rounded-xl border border-slate-200 bg-[var(--color-app-bg)] shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 dark:border-slate-600";

  const sanitizeValue = useCallback((raw: string) => {
    return raw.replace(/[^0-9]/g, "");
  }, []);

  const updateWithDelta = useCallback(
    (delta: number) => {
      const parsed = Number.parseInt(value || "0", 10);
      const safeValue = Number.isNaN(parsed) ? min : parsed;
      const nextValue = Math.max(min, safeValue + delta);
      onChange(String(nextValue));
    },
    [min, onChange, value]
  );

  return (
    <div className={`flex overflow-hidden ${normalizedClassName}`}>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => onChange(sanitizeValue(event.target.value))}
        placeholder={placeholder}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-3 text-sm text-[var(--color-text)] outline-none placeholder:text-slate-400"
      />
      <div className="flex flex-col border-l border-slate-200 dark:border-slate-600">
        <button
          type="button"
          aria-label="Değeri artır"
          onClick={() => updateWithDelta(1)}
          className="flex h-1/2 min-h-[22px] items-center justify-center px-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary dark:text-slate-300 dark:hover:bg-slate-800"
        >
          +
        </button>
        <button
          type="button"
          aria-label="Değeri azalt"
          onClick={() => updateWithDelta(-1)}
          className="flex h-1/2 min-h-[22px] items-center justify-center border-t border-slate-200 px-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          -
        </button>
      </div>
    </div>
  );
}
