"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { isLoggedIn } from "@/lib/session";
import { fetchMyProfile } from "@/services/profile";
import type { ProfileSummary } from "@/types/profile";
import { useRouter } from "next/navigation";
import { BadgeCheck, MapPin, ShieldCheck, Star, UserRoundCheck } from "lucide-react";

type ProfileTab = "listings" | "requests" | "reviews";

const TAB_LABELS: Record<ProfileTab, string> = {
  listings: "İlanlarım",
  requests: "İsteklerim",
  reviews: "Değerlendirmeler",
};

export function UserProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ProfileTab>("listings");
  const [profile, setProfile] = useState<ProfileSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const displayName = useMemo(() => {
    if (!profile) return "Kullanıcı";
    return profile.email?.split("@")[0] ?? profile.phone ?? "Kullanıcı";
  }, [profile]);

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
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-[var(--color-card)] shadow-sm dark:border-slate-700">
          <div className="relative h-44 w-full bg-gradient-to-r from-blue-600/80 to-indigo-600/80" />

          <div className="px-4 pb-6 sm:px-6">
            <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative size-28 overflow-hidden rounded-full border-4 border-slate-900 bg-slate-200 shadow-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                    alt={`${displayName} profil`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-[var(--color-text)]">
                    {displayName}
                  </h1>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                    <MapPin className="size-4 text-[#2563EB]" />
                    {profile?.email ?? profile?.phone ?? "—"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {profile?.deals_count ?? 0} tamamlanan / aktif işlem
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/cuzdan"
                  className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"
                >
                  Cüzdan
                </Link>
                <Link
                  href="/profil/duzenle"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-[#2563EB]/30 bg-[#2563EB]/5 px-4 text-sm font-bold text-[#2563EB]"
                >
                  Profili Düzenle
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600">
                <UserRoundCheck className="size-3.5" /> Telefon
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-600">
                <BadgeCheck className="size-3.5" /> E-posta
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-3 py-1 text-xs text-indigo-600">
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
                        ? "border-[#2563EB] text-[#2563EB]"
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
                    <Link
                      key={item.id}
                      href={`/ilan/${item.id}`}
                      className="rounded-xl border border-slate-200 p-4 hover:border-primary dark:border-slate-700"
                    >
                      <p className="font-bold">{item.title}</p>
                      <p className="mt-1 text-sm text-primary">₺{item.daily_price} / gün</p>
                    </Link>
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
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  <Star className="mx-auto mb-2 size-6 text-amber-400" />
                  Değerlendirme sistemi V2 kapsamında eklenecek.
                </div>
              )}
            </div>
          </div>
        </section>
      </motion.div>
    </InteractivePageShell>
  );
}
