"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { isLoggedIn } from "@/lib/session";
import { listMyDeals } from "@/services/deals";
import type { DealSummary } from "@/types/requests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MesajlarPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    listMyDeals().then((res) => {
      if (!res.ok) setError(res.message);
      else setDeals(res.data);
    });
  }, [router]);

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-lg px-4 py-8 pb-24">
          <h1 className="text-2xl font-bold">İşlemlerim</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Kabul edilen teklifler — mesajlaşma ve teslim onayı
          </p>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <ul className="mt-6 space-y-3">
            {deals.length === 0 && (
              <li className="text-sm text-slate-500">Henüz aktif kiralama işlemi yok.</li>
            )}
            {deals.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/islem/${d.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="font-bold">{d.item_request_title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    ₺{d.offer_price} · {d.role} · escrow: {d.escrow_status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />
    </>
  );
}
