"use client";

import { CheckCircle2, XCircle } from "lucide-react";

export type AppToastType = "success" | "error";

interface AppToastProps {
  message: string;
  type?: AppToastType;
}

/** Uygulama temasına uygun sabit alt bildirim (toast) */
export function AppToast({ message, type = "success" }: AppToastProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold shadow-lg md:bottom-8 ${
        isSuccess
          ? "border-emerald-200 bg-white text-emerald-800 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200"
          : "border-red-200 bg-white text-red-800 dark:border-red-800 dark:bg-slate-900 dark:text-red-200"
      }`}
      role="status"
      aria-live="polite"
    >
      {isSuccess ? (
        <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden />
      ) : (
        <XCircle className="size-5 shrink-0 text-red-500" aria-hidden />
      )}
      {message}
    </div>
  );
}
