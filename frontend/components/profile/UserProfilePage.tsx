"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { fallbackNameFromEmail } from "@/lib/profile-images";
import { isLoggedIn } from "@/lib/session";
import { deleteListing } from "@/services/listings";
import { fetchMyProfile } from "@/services/profile";
import type { ProfileSummary } from "@/types/profile";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Star,
  Trash2,
  UserRoundCheck,
} from "lucide-react";

type ProfileTab = "listings" | "requests" | "reviews";

const TAB_LABELS: Record<ProfileTab, string> = {
  listings: "İlanlarım",
  requests: "İsteklerim",
  reviews: "Değerlendirmeler",
};

const OUTLINE_BTN_CLASS =
  "inline-flex h-10 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-white/5 px-5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/15";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function resolveDisplayName(profile: ProfileSummary | null): string {
  if (!profile) return "Kullanıcı";
  if (profile.name?.trim()) return profile.name.trim();
  return (
    fallbackNameFromEmail(profile.email) ?? profile.phone ?? "Kullanıcı"
  );
}

export function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [pendingDeleteListing, setPendingDeleteListing] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    fetchMyProfile().then((res) => {
      if (!res.ok) setError(res.message);
      else setProfile(res.data);
    });
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleRequestDeleteListing = useCallback(
    (listingId: string, title: string) => {
      setPendingDeleteListing({ id: listingId, title });
    },
    []
  );

  const handleCancelDeleteListing = useCallback(() => {
    if (deletingListingId) return;
    setPendingDeleteListing(null);
  }, [deletingListingId]);

  const handleConfirmDeleteListing = useCallback(async () => {
    if (!pendingDeleteListing) return;

    const listingId = pendingDeleteListing.id;
    setDeletingListingId(listingId);
    const result = await deleteListing(listingId);
    setDeletingListingId(null);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setPendingDeleteListing(null);
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            listings: prev.listings.filter((item) => item.id !== listingId),
            listings_count: Math.max(0, prev.listings_count - 1),
          }
        : prev
    );
    setToast("İlan başarıyla silindi");
  }, [pendingDeleteListing]);

  const displayName = useMemo(() => resolveDisplayName(profile), [profile]);

  const tabCounts = useMemo(
    () => ({
      listings: profile?.listings_count ?? 0,
      requests: profile?.requests_count ?? 0,
      reviews: 0,
    }),
    [profile]
  );

  return (
    <InteractivePageShell className="bg-[var(--color-app-bg)]">
      <AppHeader showCategoryBar={false} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-7xl px-4 py-6 pb-16"
      >
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-300">
            {error}
          </p>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="relative h-48 w-full border-b border-slate-700">
            {profile?.cover_base64 ? (
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

            <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <div className="flex items-end gap-4">
                <div className="relative size-24 shrink-0 overflow-hidden rounded-full border-4 border-slate-800 bg-slate-700 shadow-xl ring-2 ring-slate-600/80 sm:size-28">
                  {profile?.avatar_base64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profile.avatar_base64}
                      alt={`${displayName} profil`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xl font-bold text-white sm:text-2xl">
                      {initialsFromName(displayName)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 pb-0.5">
                  <h1 className="truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {displayName}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-300">
                    <MapPin className="size-4 shrink-0 text-slate-400" />
                    <span className="truncate">
                      {profile?.location?.trim() || "Konum belirtilmedi"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-3">
                <Link href="/cuzdan" className={OUTLINE_BTN_CLASS}>
                  Cüzdan
                </Link>
                <Link href="/profil/duzenle" className={OUTLINE_BTN_CLASS}>
                  Profili Düzenle
                </Link>
              </div>
            </div>
          </div>

          <div className="px-4 pb-6 pt-5 sm:px-6">
            {profile?.bio?.trim() ? (
              <p className="max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {profile.bio}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-slate-500">
              {profile?.email ?? profile?.phone ?? "—"} ·{" "}
              {profile?.deals_count ?? 0} tamamlanan / aktif işlem
            </p>

            {(profile?.instagram || profile?.linkedin) && (
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

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 dark:text-emerald-400">
                <UserRoundCheck className="size-3.5" /> Telefon
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
                <BadgeCheck className="size-3.5" /> E-posta
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-3 py-1 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck className="size-3.5" /> MVP Üye
              </span>
            </div>

            <div className="mt-6 border-b border-slate-200 dark:border-slate-700">
              <nav className="flex flex-wrap gap-5">
                {(Object.keys(TAB_LABELS) as ProfileTab[]).map((tabKey) => (
                  <button
                    key={tabKey}
                    type="button"
                    onClick={() => setActiveTab(tabKey)}
                    className={`border-b-[3px] px-1 pb-2.5 text-sm font-semibold ${
                      activeTab === tabKey
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500"
                    }`}
                  >
                    {TAB_LABELS[tabKey]} ({tabCounts[tabKey]})
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-5">
              {activeTab === "listings" && profile && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {profile.listings.length === 0 && (
                    <p className="text-sm text-slate-500">Henüz ürün ilanınız yok.</p>
                  )}
                  {profile.listings.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col rounded-xl border border-slate-200 p-4 dark:border-slate-700"
                    >
                      <Link
                        href={`/ilan/${item.id}`}
                        className="min-w-0 flex-1 hover:text-primary"
                      >
                        <p className="font-bold text-[var(--color-text)]">{item.title}</p>
                        <p className="mt-1 text-sm text-primary">
                          ₺{item.daily_price} / gün
                        </p>
                      </Link>
                      <button
                        type="button"
                        disabled={deletingListingId === item.id}
                        onClick={() =>
                          handleRequestDeleteListing(item.id, item.title)
                        }
                        className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="size-4 shrink-0" aria-hidden />
                        {deletingListingId === item.id ? "Siliniyor..." : "İlanı Sil"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "requests" && profile && (
                <ul className="space-y-3">
                  {profile.requests.length === 0 && (
                    <li className="text-sm text-slate-500">Henüz istek ilanınız yok.</li>
                  )}
                  {profile.requests.map((req) => (
                    <li key={req.id}>
                      <Link
                        href={`/talep/${req.id}`}
                        className="block rounded-xl border border-slate-200 p-4 hover:border-primary dark:border-slate-700"
                      >
                        <p className="font-bold">{req.title}</p>
                        <p className="text-sm text-slate-500">
                          {req.status} · max ₺{req.max_daily_budget}/gün
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {activeTab === "reviews" && (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600">
                  <Star className="mx-auto mb-2 size-6 text-amber-400" />
                  Değerlendirme sistemi V2 kapsamında eklenecek.
                </div>
              )}
            </div>
          </div>
        </section>
      </motion.div>

      <ConfirmDialog
        open={pendingDeleteListing !== null}
        title="İlanı sil"
        message={
          pendingDeleteListing
            ? `"${pendingDeleteListing.title}" ilanını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`
            : ""
        }
        confirmLabel="Evet, sil"
        cancelLabel="Vazgeç"
        loading={deletingListingId !== null}
        onConfirm={() => void handleConfirmDeleteListing()}
        onCancel={handleCancelDeleteListing}
      />

      {toast ? (
        <div
          className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 shadow-lg dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-200 md:bottom-8"
          role="status"
          aria-live="polite"
        >
          <CheckCircle2 className="size-5 shrink-0 text-emerald-500" aria-hidden />
          {toast}
        </div>
      ) : null}
    </InteractivePageShell>
  );
}
