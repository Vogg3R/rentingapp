import type { RequesterPreview } from "@/types/requests";
import { ChevronRight, UserRound } from "lucide-react";
import Link from "next/link";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

interface RequestRequesterCardProps {
  requester: RequesterPreview;
}

/** İstek ilanı detayında talep sahibi özeti */
export function RequestRequesterCard({ requester }: RequestRequesterCardProps) {
  const displayName = requester.name?.trim() || "Talep sahibi";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)] sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        Talep sahibi
      </h2>

      <div className="mt-4 flex items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800">
          {requester.avatar_base64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={requester.avatar_base64}
              alt={`${displayName} profil`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-200 text-sm font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              {initialsFromName(displayName)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-[var(--color-text)]">
            {displayName}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <UserRound className="size-3.5 shrink-0" aria-hidden />
            EldenEle üyesi
          </p>
        </div>

        <Link
          href={`/profil/${requester.id}`}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Profil
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
