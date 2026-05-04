"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, GripVertical, X } from "lucide-react";

/** Sistemden dosya ile karışmaması için text payload öneki */
const REORDER_DRAG_PREFIX = "elden-ele-photo-index:";

const MAX_FILES = 10;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp";

interface PhotoDropzoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

/** Sürükle-bırak + dosya seçici; önizleme URL'leri üst bileşende tutulur */
function fileRowKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function PhotoDropzone({ files, onFilesChange }: PhotoDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const reorderDragActiveRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [reorderOverIndex, setReorderOverIndex] = useState<number | null>(null);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming).filter(
        (f) => f.type.startsWith("image/") && f.size <= MAX_BYTES
      );
      const merged = [...files, ...list].slice(0, MAX_FILES);
      onFilesChange(merged);
    },
    [files, onFilesChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const plain = e.dataTransfer.getData("text/plain");
      if (plain.startsWith(REORDER_DRAG_PREFIX)) return;
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    /** Sistem dosyası: kesik çizgi vurgusu; sıra değiştirme sürüklemesi vurgu açmasın */
    const types = [...e.dataTransfer.types];
    if (types.includes("Files")) {
      e.preventDefault();
      setIsDragging(true);
    }
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  const removeAt = useCallback(
    (index: number) => {
      onFilesChange(files.filter((_, i) => i !== index));
    },
    [files, onFilesChange]
  );

  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= files.length ||
        toIndex >= files.length
      ) {
        return;
      }
      const next = [...files];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      onFilesChange(next);
    },
    [files, onFilesChange]
  );

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 transition-colors",
          isDragging
            ? "border-primary/70 bg-primary/10"
            : "border-primary/40 bg-primary/[0.06] hover:border-primary/60 hover:bg-primary/[0.08]",
        ].join(" ")}
      >
        <CloudUpload
          className="size-12 text-primary/80"
          strokeWidth={1.25}
          aria-hidden
        />
        <span className="text-center text-sm font-semibold text-[var(--color-text)]">
          Fotoğrafları buraya sürükleyin veya dosya seçin.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        En az 3 fotoğraf önerilir. En fazla {MAX_FILES}. PNG, JPG, WEBP (en fazla
        5MB)
      </p>

      {files.length > 0 && (
        <>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Sırayı değiştirmek için satırı tutup sürükleyin; ilan önizlemesindeki
            fotoğraf sırası buna göre güncellenir.
          </p>
          <ul
            className="mt-2 space-y-2"
            aria-label="Yüklenen fotoğraflar"
            onDragLeave={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && e.currentTarget.contains(next)) return;
              setReorderOverIndex(null);
            }}
          >
            {files.map((file, index) => (
              <li
                key={fileRowKey(file)}
                draggable
                onDragStart={(e) => {
                  reorderDragActiveRef.current = true;
                  e.dataTransfer.setData(
                    "text/plain",
                    `${REORDER_DRAG_PREFIX}${index}`
                  );
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  reorderDragActiveRef.current = false;
                  setReorderOverIndex(null);
                }}
                onDragOver={(e) => {
                  if (!reorderDragActiveRef.current) return;
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setReorderOverIndex(index);
                }}
                onDragLeave={() => {
                  setReorderOverIndex((prev) => (prev === index ? null : prev));
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setReorderOverIndex(null);
                  const raw = e.dataTransfer.getData("text/plain");
                  if (!raw.startsWith(REORDER_DRAG_PREFIX)) return;
                  const from = parseInt(
                    raw.slice(REORDER_DRAG_PREFIX.length),
                    10
                  );
                  if (Number.isNaN(from)) return;
                  moveItem(from, index);
                }}
                className={[
                  "flex cursor-grab items-center gap-2 rounded-lg border bg-[var(--color-app-bg)] px-2 py-2 transition-colors active:cursor-grabbing dark:border-slate-600",
                  reorderOverIndex === index
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-slate-200 dark:border-slate-600",
                ].join(" ")}
              >
                <span
                  className="inline-flex shrink-0 text-slate-400 dark:text-slate-500"
                  aria-hidden
                >
                  <GripVertical className="size-5" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-[var(--color-text)]">
                  <span className="mr-1.5 inline-flex size-5 items-center justify-center rounded bg-slate-200/80 text-[0.65rem] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {index + 1}
                  </span>
                  {file.name}
                </span>
                <button
                  type="button"
                  draggable={false}
                  onClick={() => removeAt(index)}
                  className="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  aria-label={`${file.name} dosyasını kaldır`}
                >
                  <X className="size-4" strokeWidth={2} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
