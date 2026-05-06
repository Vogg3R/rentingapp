import { EldenEleLogoLink } from "@/components/branding/EldenEleLogoLink";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { ArrowUpRight } from "lucide-react";

interface RequestListingHeaderProps {
  onSaveDraft: () => void;
  onPublish: () => void;
}

export function RequestListingHeader({
  onSaveDraft,
  onPublish,
}: RequestListingHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-[var(--color-card)]/95 backdrop-blur-md dark:border-slate-700/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
        <EldenEleLogoLink variant="header" className="shrink-0" />
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={onSaveDraft}
            className="rounded-full border border-slate-200 bg-[var(--color-app-bg)] px-4 py-2.5 text-sm font-bold text-[var(--color-text)] transition-colors hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
          >
            Taslak Kaydet
          </button>
          <button
            type="button"
            onClick={onPublish}
            className="group inline-flex items-center gap-1 rounded-full bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1d4ed8]"
          >
            İstek İlanı Yayınla
            <ArrowUpRight
              className="size-4 opacity-95 transition-transform duration-200 ease-out group-hover:scale-110"
              aria-hidden
            />
          </button>
        </div>
      </div>
    </header>
  );
}
