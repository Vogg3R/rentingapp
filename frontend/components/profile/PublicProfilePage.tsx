"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { fetchPublicProfile } from "@/services/profile";
import type { PublicProfile } from "@/types/profile";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function resolveDisplayName(profile: PublicProfile | null): string {
  if (!profile) return "Kullanıcı";
  return profile.name?.trim() || "Kullanıcı";
}

interface PublicProfilePageProps {
  userId: string;
}

/** Başka kullanıcıların herkese açık profil sayfası */
export function PublicProfilePage({ userId }: PublicProfilePageProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPublicProfile(userId).then((res) => {
      if (!res.ok) setError(res.message);
      else setProfile(res.data);
      setLoading(false);
    });
  }, [userId]);

  const displayName = useMemo(() => resolveDisplayName(profile), [profile]);

  return (
    <>
      <AppHeader showCategoryBar={false} />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-7xl px-4 py-8 pb-24">
          <Link
            href="/"
            className="inline-flex text-sm font-medium text-primary hover:underline"
          >
            ← Ana sayfa
          </Link>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </p>
          )}

          {loading && !profile && !error && (
            <div className="mt-8 animate-pulse space-y-6">
              <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              <div className="h-8 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          )}

          {profile && (
            <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)]">
              <div className="relative h-44 w-full border-b border-slate-200 dark:border-slate-700 sm:h-52">
                {profile.cover_base64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.cover_base64}
                    alt="Profil kapağı"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 flex items-end gap-4 px-4 pb-4 sm:px-6">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-4 border-slate-800 bg-slate-700 shadow-xl sm:size-24">
                    {profile.avatar_base64 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profile.avatar_base64}
                        alt={`${displayName} profil`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-800 text-lg font-bold text-white">
                        {initialsFromName(displayName)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 pb-1">
                    <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
                      {displayName}
                    </h1>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-300">
                      <MapPin className="size-4 shrink-0" aria-hidden />
                      <span className="truncate">
                        {profile.location?.trim() || "Konum belirtilmedi"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-6 sm:px-6">
                {profile.bio?.trim() ? (
                  <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {profile.bio}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500">Henüz hakkında bilgisi eklenmemiş.</p>
                )}

                {(profile.instagram || profile.linkedin) && (
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {profile.instagram ? (
                      <span className="text-slate-600 dark:text-slate-400">
                        Instagram:{" "}
                        <span className="font-medium text-[var(--color-text)]">
                          {profile.instagram}
                        </span>
                      </span>
                    ) : null}
                    {profile.linkedin ? (
                      <span className="text-slate-600 dark:text-slate-400">
                        LinkedIn:{" "}
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          Profil
                        </a>
                      </span>
                    ) : null}
                  </div>
                )}

                <div className="mt-6 border-b border-slate-200 dark:border-slate-700">
                  <p className="border-b-[3px] border-primary px-1 pb-2.5 text-sm font-semibold text-primary">
                    Aktif İlanlar ({profile.listings_count})
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                  {profile.listings.length === 0 && (
                    <p className="text-sm text-slate-500">Yayında aktif ilan bulunmuyor.</p>
                  )}
                  {profile.listings.map((item) => (
                    <Link
                      key={item.id}
                      href={`/ilan/${item.id}`}
                      className="rounded-xl border border-slate-200 p-4 transition hover:border-primary dark:border-slate-700"
                    >
                      <p className="font-bold text-[var(--color-text)]">{item.title}</p>
                      <p className="mt-1 text-sm text-primary">₺{item.daily_price} / gün</p>
                      <p className="mt-1 text-xs text-slate-500">{item.location}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
