import type { ReactNode } from "react";

interface FormSectionProps {
  /** Bölüm sırası (mavi rozet) */
  step: number;
  /** Büyük harf başlık */
  title: string;
  children: ReactNode;
}

/** Airbnb tarzı numaralı form bölümü */
export function FormSection({ step, title, children }: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-[var(--color-card)] p-5 shadow-sm ring-1 ring-black/[0.03] dark:border-slate-600/70 dark:ring-white/5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
          aria-hidden
        >
          {step}
        </span>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
