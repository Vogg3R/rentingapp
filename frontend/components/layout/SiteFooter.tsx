import Link from "next/link";

/** Geliştirici / iletişim — LinkedIn ile doğrulanabilir bağlantı */
const LINKEDIN_HREF =
  "https://www.linkedin.com/in/ya%C4%9F%C4%B1z-efe-y%C4%B1lmazer-242a022a8";

interface SiteFooterProps {
  /** Mobil alt menü için ek alt boşluk (örn. pb-28) */
  className?: string;
}

/** LinkedIn “in” kare işareti (marka mavisi ile) */
function LinkedInLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="#0A66C2"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer
      className={`w-full shrink-0 border-t border-slate-200/90 bg-[var(--color-app-bg)] py-3.5 dark:border-slate-700/80 ${className}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 text-center sm:flex-row sm:gap-3">
        <p className="text-sm font-medium text-[var(--color-text)]">
          Yağız Efe Yılmazer
        </p>
        <Link
          href={LINKEDIN_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-md bg-[#0A66C2]/12 p-1 outline-none ring-primary/40 transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-app-bg)] dark:bg-[#0A66C2]/20"
          aria-label="Yağız Efe Yılmazer — LinkedIn profili"
        >
          <LinkedInLogo className="size-[1.375rem]" />
        </Link>
      </div>
    </footer>
  );
}
