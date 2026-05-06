"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSearchModal } from "@/components/providers/SearchModalContext";
import { Home, MessageSquare, Plus, Search, User } from "lucide-react";

const baseItemClass =
  "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors";

export function BottomNav() {
  const pathname = usePathname();
  const { setIsSearchOpen } = useSearchModal();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <nav
      aria-label="Mobil alt menü"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="mx-auto flex max-w-md items-end px-2 pb-[env(safe-area-inset-bottom)]">
        <Link
          href="/"
          className={`${baseItemClass} ${
            isActive("/") ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <Home className="size-5" />
          <span>Ana Sayfa</span>
        </Link>

        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className={`${baseItemClass} ${
            isActive("/kesfet") ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <Search className="size-5" />
          <span>Keşfet</span>
        </button>

        <Link
          href="/ilan-ver"
          className="flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-medium text-blue-600"
        >
          <span className="-mt-5 inline-flex size-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/30">
            <Plus className="size-6" />
          </span>
          <span>Kiraya Ver</span>
        </Link>

        <Link
          href="/"
          className={`${baseItemClass} ${
            isActive("/mesajlar") ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <MessageSquare className="size-5" />
          <span>Mesajlar</span>
        </Link>

        <Link
          href="/profil"
          className={`${baseItemClass} ${
            isActive("/profil") ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <User className="size-5" />
          <span>Profil</span>
        </Link>
      </div>
    </nav>
  );
}
