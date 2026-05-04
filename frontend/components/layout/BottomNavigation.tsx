import Link from "next/link";

const linkClass =
  "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-normal text-text transition-colors hover:text-primary [&>svg]:shrink-0";

export function BottomNavigation() {
  return (
    <nav
      aria-label="Ana mobil menü"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/90 bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_-4px_rgba(15,23,42,0.12)] md:hidden dark:border-slate-700 dark:shadow-black/40"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        <Link href="/" className={linkClass}>
          <VanIcon />
          <span>Araçlar</span>
        </Link>
        <Link href="/" className={linkClass}>
          <WrenchIcon />
          <span>Ekipman</span>
        </Link>
        <Link href="/" className={linkClass}>
          <UserCircleIcon />
          <span>Profil</span>
        </Link>
      </div>
    </nav>
  );
}

function VanIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 17h2l1-6H6l1 6h1" />
      <path d="M18 11h2l2 6H16l-1-6h3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function UserCircleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="10" r="3" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" />
    </svg>
  );
}
