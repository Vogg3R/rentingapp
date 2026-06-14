"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { AppToast, type AppToastType } from "@/components/ui/AppToast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  approveWithdrawal,
  clearAdminKey,
  deleteUser,
  getAdminKey,
  getAllUsers,
  getDisputedDeals,
  getPendingWithdrawals,
  refundDeal,
  rejectWithdrawal,
  setAdminKey,
} from "@/services/admin";
import type { AdminDeal, AdminUser, AdminWithdrawal } from "@/types/admin";
import {
  Banknote,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

type AdminTab = "withdrawals" | "deals" | "users";

type PendingAction =
  | { kind: "approve"; id: string; label: string }
  | { kind: "reject"; id: string; label: string }
  | { kind: "refund"; id: string; label: string }
  | { kind: "deleteUser"; id: string; label: string };

function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CONFIRM_COPY: Record<
  PendingAction["kind"],
  { title: string; confirmLabel: string; message: (label: string) => string }
> = {
  approve: {
    title: "Para çekme talebini onayla",
    confirmLabel: "Evet, onayla",
    message: (label) =>
      `${label} için para çekme talebini onaylamak istediğinize emin misiniz?`,
  },
  reject: {
    title: "Para çekme talebini reddet",
    confirmLabel: "Evet, reddet",
    message: (label) =>
      `${label} için para çekme talebini reddetmek istediğinize emin misiniz? Tutar kullanıcının cüzdanına iade edilir.`,
  },
  refund: {
    title: "İade işlemi",
    confirmLabel: "Evet, iade et",
    message: (label) =>
      `"${label}" işlemini iade etmek istediğinize emin misiniz? Bloke edilen tutar talep edene geri aktarılır.`,
  },
  deleteUser: {
    title: "Kullanıcıyı sil",
    confirmLabel: "Evet, sil",
    message: (label) =>
      `${label} adlı kullanıcıyı kalıcı olarak silmek istediğinize emin misiniz? Kullanıcıya ait tüm ilanlar, talepler, teklifler, kiralama işlemleri ve mesajlar da silinecek. Bu işlem geri alınamaz.`,
  },
};

export default function AdminPage() {
  const [hasKey, setHasKey] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("withdrawals");
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [deals, setDeals] = useState<AdminDeal[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [toast, setToast] = useState<{ type: AppToastType; message: string } | null>(
    null
  );

  const showToast = useCallback((message: string, type: AppToastType = "success") => {
    setToast({ message, type });
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [wRes, dRes, uRes] = await Promise.all([
      getPendingWithdrawals(),
      getDisputedDeals(),
      getAllUsers(),
    ]);
    setLoading(false);

    if (!wRes.ok) {
      // Hatalı/eksik admin anahtarında kapıyı tekrar kilitle.
      setError(wRes.message);
      clearAdminKey();
      setHasKey(false);
      return;
    }
    setWithdrawals(wRes.data);
    if (dRes.ok) setDeals(dRes.data);
    if (uRes.ok) setUsers(uRes.data);
  }, []);

  useEffect(() => {
    if (getAdminKey()) {
      setHasKey(true);
    }
  }, []);

  useEffect(() => {
    if (hasKey) void loadData();
  }, [hasKey, loadData]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleUnlock = useCallback(() => {
    if (keyInput.trim().length < 1) return;
    setAdminKey(keyInput.trim());
    setKeyInput("");
    setHasKey(true);
  }, [keyInput]);

  const handleLock = useCallback(() => {
    clearAdminKey();
    setHasKey(false);
    setWithdrawals([]);
    setDeals([]);
    setUsers([]);
  }, []);

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;
    const { kind, id } = pendingAction;
    setBusyId(id);
    const result =
      kind === "approve"
        ? await approveWithdrawal(id)
        : kind === "reject"
          ? await rejectWithdrawal(id)
          : kind === "refund"
            ? await refundDeal(id)
            : await deleteUser(id);
    setBusyId(null);
    setPendingAction(null);

    if (!result.ok) {
      showToast(result.message, "error");
      return;
    }

    // Başarılı: ilgili satırı listeden anında kaldır.
    if (kind === "refund") {
      setDeals((prev) => prev.filter((d) => d.id !== id));
      showToast("İade işlemi tamamlandı.");
    } else if (kind === "deleteUser") {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast("Kullanıcı başarıyla silindi.");
    } else {
      setWithdrawals((prev) => prev.filter((w) => w.id !== id));
      showToast(
        kind === "approve"
          ? "Para çekme talebi onaylandı."
          : "Para çekme talebi reddedildi."
      );
    }
  }, [pendingAction, showToast]);

  if (!hasKey) {
    return (
      <InteractivePageShell className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#0B1120]">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-700 dark:bg-[var(--color-card)]">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <KeyRound className="size-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-lg font-bold text-[var(--color-text)]">
                Yönetim Paneli
              </h1>
              <p className="text-xs text-slate-500">Admin anahtarı gerekli</p>
            </div>
          </div>
          {error ? (
            <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          ) : null}
          <label
            htmlFor="admin-key"
            className="mb-1.5 block text-sm font-bold text-[var(--color-text)]"
          >
            Admin anahtarı (X-Admin-Key)
          </label>
          <input
            id="admin-key"
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUnlock();
            }}
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800/70"
          />
          <button
            type="button"
            onClick={handleUnlock}
            disabled={keyInput.trim().length < 1}
            className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Panele Gir
          </button>
        </div>
      </InteractivePageShell>
    );
  }

  return (
    <InteractivePageShell className="min-h-screen bg-slate-50 dark:bg-[#0B1120]">
      <div className="mx-auto max-w-6xl px-4 py-8 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Yönetim Paneli
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RefreshCw
                className={`size-4 ${loading ? "animate-spin" : ""}`}
                aria-hidden
              />
              Yenile
            </button>
            <button
              type="button"
              onClick={handleLock}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Anahtarı değiştir
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}

        <div className="mt-6 border-b border-slate-200 dark:border-slate-700">
          <nav className="flex flex-wrap gap-5">
            <button
              type="button"
              onClick={() => setActiveTab("withdrawals")}
              className={`flex items-center gap-2 border-b-[3px] px-1 pb-2.5 text-sm font-semibold ${
                activeTab === "withdrawals"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500"
              }`}
            >
              <Banknote className="size-4" aria-hidden />
              Para Çekme Talepleri ({withdrawals.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("deals")}
              className={`flex items-center gap-2 border-b-[3px] px-1 pb-2.5 text-sm font-semibold ${
                activeTab === "deals"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500"
              }`}
            >
              <RefreshCw className="size-4" aria-hidden />
              İade İşlemleri ({deals.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 border-b-[3px] px-1 pb-2.5 text-sm font-semibold ${
                activeTab === "users"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500"
              }`}
            >
              <Users className="size-4" aria-hidden />
              Kullanıcılar ({users.length})
            </button>
          </nav>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[var(--color-card)]"
        >
          {activeTab === "withdrawals" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-4 py-3 font-bold">Kullanıcı</th>
                    <th className="px-4 py-3 font-bold">Tutar</th>
                    <th className="px-4 py-3 font-bold">IBAN / Hesap</th>
                    <th className="px-4 py-3 font-bold">Tarih</th>
                    <th className="px-4 py-3 text-right font-bold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        {loading
                          ? "Yükleniyor..."
                          : "Bekleyen para çekme talebi yok."}
                      </td>
                    </tr>
                  ) : null}
                  {withdrawals.map((w) => (
                    <tr
                      key={w.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                        {w.user_name?.trim() || "İsimsiz kullanıcı"}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                        {formatTry(w.amount)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">
                        {w.iban?.trim() || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(w.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            disabled={busyId === w.id}
                            onClick={() =>
                              setPendingAction({
                                kind: "approve",
                                id: w.id,
                                label: w.user_name?.trim() || "kullanıcı",
                              })
                            }
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                          >
                            Onayla
                          </button>
                          <button
                            type="button"
                            disabled={busyId === w.id}
                            onClick={() =>
                              setPendingAction({
                                kind: "reject",
                                id: w.id,
                                label: w.user_name?.trim() || "kullanıcı",
                              })
                            }
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                          >
                            Reddet
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : activeTab === "deals" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-4 py-3 font-bold">İlan</th>
                    <th className="px-4 py-3 font-bold">Talep Eden</th>
                    <th className="px-4 py-3 font-bold">Sağlayıcı</th>
                    <th className="px-4 py-3 font-bold">Tutar</th>
                    <th className="px-4 py-3 font-bold">Durum</th>
                    <th className="px-4 py-3 text-right font-bold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        {loading
                          ? "Yükleniyor..."
                          : "İade bekleyen (anlaşmazlıktaki) işlem yok."}
                      </td>
                    </tr>
                  ) : null}
                  {deals.map((d) => (
                    <tr
                      key={d.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                        {d.item_request_title}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {d.requester_name?.trim() || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {d.supplier_name?.trim() || "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary">
                        {formatTry(d.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                          {d.escrow_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            disabled={busyId === d.id}
                            onClick={() =>
                              setPendingAction({
                                kind: "refund",
                                id: d.id,
                                label: d.item_request_title,
                              })
                            }
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
                          >
                            İade Yap
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:border-slate-700 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-4 py-3 font-bold">Ad Soyad</th>
                    <th className="px-4 py-3 font-bold">E-posta</th>
                    <th className="px-4 py-3 font-bold">Kayıt Tarihi</th>
                    <th className="px-4 py-3 text-right font-bold">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        {loading ? "Yükleniyor..." : "Henüz kullanıcı yok."}
                      </td>
                    </tr>
                  ) : null}
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-slate-100 last:border-0 dark:border-slate-700/60"
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
                        {u.name?.trim() || "İsimsiz kullanıcı"}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                        {u.email?.trim() || u.phone?.trim() || "—"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {formatDate(u.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/profil/${u.id}`}
                            className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
                          >
                            Profili İncele
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === u.id}
                            onClick={() =>
                              setPendingAction({
                                kind: "deleteUser",
                                id: u.id,
                                label: u.name?.trim() || u.email?.trim() || "Bu",
                              })
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                          >
                            <Trash2 className="size-3.5" aria-hidden />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={pendingAction !== null}
        title={pendingAction ? CONFIRM_COPY[pendingAction.kind].title : ""}
        message={
          pendingAction
            ? CONFIRM_COPY[pendingAction.kind].message(pendingAction.label)
            : ""
        }
        confirmLabel={
          pendingAction ? CONFIRM_COPY[pendingAction.kind].confirmLabel : "Onayla"
        }
        cancelLabel="Vazgeç"
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => setPendingAction(null)}
      />

      {toast ? <AppToast message={toast.message} type={toast.type} /> : null}
    </InteractivePageShell>
  );
}
