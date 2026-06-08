"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface PromptDialogProps {
  open: boolean;
  title: string;
  message?: string;
  label: string;
  placeholder?: string;
  minLength?: number;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

/** Uygulama temasına uygun metin girişli onay kutusu (tarayıcı prompt yerine) */
export function PromptDialog({
  open,
  title,
  message,
  label,
  placeholder = "",
  minLength = 1,
  confirmLabel = "Gönder",
  cancelLabel = "Vazgeç",
  loading = false,
  onConfirm,
  onCancel,
}: PromptDialogProps) {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) {
      setValue("");
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  const trimmed = value.trim();
  const canSubmit = trimmed.length >= minLength && !loading;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!loading) onCancel();
          }}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-dialog-title"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-2xl dark:border-slate-700"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start gap-4 px-5 py-5 sm:px-6">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="prompt-dialog-title"
                  className="text-lg font-bold text-[var(--color-text)]"
                >
                  {title}
                </h2>
                {message ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {message}
                  </p>
                ) : null}
                <label
                  htmlFor="prompt-dialog-input"
                  className="mt-4 block text-sm font-semibold text-[var(--color-text)]"
                >
                  {label}
                </label>
                <textarea
                  id="prompt-dialog-input"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  placeholder={placeholder}
                  rows={3}
                  disabled={loading}
                  className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800/70"
                />
                {minLength > 1 ? (
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    En az {minLength} karakter gerekli.
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end sm:px-6 dark:border-slate-700">
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={!canSubmit}
                onClick={() => onConfirm(trimmed)}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-amber-600 px-5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Gönderiliyor..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
