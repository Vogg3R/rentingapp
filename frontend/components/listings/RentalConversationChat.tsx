"use client";

import { getAuthUser } from "@/lib/session";
import {
  listListingRentalMessages,
  sendListingRentalMessage,
} from "@/services/listing-rentals";
import type { ListingRentalMessage } from "@/types/listing-rentals";
import { useCallback, useEffect, useState } from "react";

interface RentalConversationChatProps {
  rentalRequestId: string;
  emptyHint?: string;
  maxHeightClass?: string;
}

/** İlan kiralama talebi sohbeti — kiracı ve ilan sahibi arasında */
export function RentalConversationChat({
  rentalRequestId,
  emptyHint = "Henüz mesaj yok. İlk mesajı siz yazın.",
  maxHeightClass = "max-h-56",
}: RentalConversationChatProps) {
  const [messages, setMessages] = useState<ListingRentalMessage[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const user = getAuthUser();

  const reload = useCallback(async () => {
    const res = await listListingRentalMessages(rentalRequestId);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setMessages(res.data);
    setError(null);
  }, [rentalRequestId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBusy(true);
    const res = await sendListingRentalMessage(rentalRequestId, trimmed);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setText("");
    await reload();
  }

  return (
    <div>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <ul
        className={`mt-4 space-y-3 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-800/60 ${maxHeightClass}`}
      >
        {messages.length === 0 ? (
          <li className="text-sm text-slate-500 dark:text-slate-400">{emptyHint}</li>
        ) : null}
        {messages.map((message) => {
          const isMine = message.sender_id === user?.id;
          const senderLabel =
            message.sender_name?.trim() || (isMine ? "Sen" : "Kullanıcı");
          return (
            <li
              key={message.id}
              className={`flex flex-col gap-0.5 ${isMine ? "items-end" : "items-start"}`}
            >
              <span className="px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {senderLabel}
              </span>
              <p
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  isMine
                    ? "bg-primary/10 font-medium text-primary"
                    : "bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                {message.body}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void handleSend();
            }
          }}
          placeholder="Mesajınızı yazın..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800/70"
        />
        <button
          type="button"
          disabled={busy || text.trim().length < 1}
          onClick={() => void handleSend()}
          className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Gönder
        </button>
      </div>
    </div>
  );
}
