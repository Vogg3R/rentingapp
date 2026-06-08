"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { InteractivePageShell } from "@/components/layout/InteractivePageShell";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AppToast, type AppToastType } from "@/components/ui/AppToast";
import { PromptDialog } from "@/components/ui/PromptDialog";
import { getAuthUser, isLoggedIn } from "@/lib/session";
import {
  confirmDelivery,
  listDealMessages,
  openDispute,
  sendDealMessage,
} from "@/services/deals";
import type { DealMessage } from "@/types/requests";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface DealWorkspacePageProps {
  dealId: string;
}

export function DealWorkspacePage({ dealId }: DealWorkspacePageProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<DealMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [toast, setToast] = useState<{ type: AppToastType; message: string } | null>(
    null
  );
  const user = getAuthUser();

  const showToast = useCallback((message: string, type: AppToastType = "success") => {
    setToast({ message, type });
  }, []);

  const reload = useCallback(async () => {
    const res = await listDealMessages(dealId);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setMessages(res.data);
    setError(null);
  }, [dealId]);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/auth");
      return;
    }
    let cancelled = false;
    void listDealMessages(dealId).then((res) => {
      if (cancelled) return;
      if (!res.ok) setError(res.message);
      else setMessages(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [dealId, router]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  async function handleSend() {
    if (text.trim().length < 1) return;
    setBusy(true);
    const res = await sendDealMessage(dealId, text.trim());
    setBusy(false);
    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }
    setText("");
    await reload();
  }

  async function handleConfirmDelivery() {
    setBusy(true);
    const res = await confirmDelivery(dealId);
    setBusy(false);
    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }
    showToast("Teslim onaylandı.");
    await reload();
  }

  async function handleSubmitDispute(reason: string) {
    setBusy(true);
    const res = await openDispute(dealId, reason);
    setBusy(false);
    if (!res.ok) {
      showToast(res.message, "error");
      return;
    }
    setDisputeOpen(false);
    showToast("Anlaşmazlık kaydı açıldı. Admin iade işlemi yapabilir.");
    await reload();
  }

  return (
    <>
      <AppHeader />
      <InteractivePageShell className="bg-slate-50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-lg px-4 py-8 pb-24">
          <Link href="/mesajlar" className="text-sm text-primary hover:underline">
            ← İşlemlerim
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Kiralama işlemi</h1>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </p>
          )}

          <ul className="mt-6 max-h-80 space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
            {messages.length === 0 && (
              <li className="text-sm text-slate-500">Henüz mesaj yok. İlk mesajı siz yazın.</li>
            )}
            {messages.map((m) => (
              <li
                key={m.id}
                className={`text-sm ${
                  m.sender_id === user?.id
                    ? "text-right text-primary"
                    : "text-slate-700 dark:text-slate-200"
                }`}
              >
                {m.body}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Mesaj yazın..."
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-800"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleSend()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              Gönder
            </button>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleConfirmDelivery()}
              className="w-full rounded-lg bg-emerald-600 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              Teslim aldım — onayla (talep eden)
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setDisputeOpen(true)}
              className="w-full rounded-lg border border-amber-500 py-2 text-sm font-bold text-amber-700 disabled:opacity-60 dark:text-amber-400"
            >
              Anlaşmazlık bildir
            </button>
          </div>
        </div>
      </InteractivePageShell>
      <SiteFooter className="pb-28 md:pb-6" />

      <PromptDialog
        open={disputeOpen}
        title="Anlaşmazlık bildir"
        message="Sorunu kısaca açıklayın. Kayıt incelendikten sonra gerekirse iade işlemi yapılabilir."
        label="Anlaşmazlık nedeni"
        placeholder="Örn: Ürün anlaşıldığı gibi değildi..."
        minLength={5}
        confirmLabel="Bildir"
        cancelLabel="Vazgeç"
        loading={busy}
        onConfirm={(reason) => void handleSubmitDispute(reason)}
        onCancel={() => {
          if (!busy) setDisputeOpen(false);
        }}
      />

      {toast ? <AppToast message={toast.message} type={toast.type} /> : null}
    </>
  );
}
