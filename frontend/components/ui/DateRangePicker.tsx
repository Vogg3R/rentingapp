"use client";

import {
  MONTHS_TR,
  WEEKDAYS_TR,
  buildCalendarGrid,
  compareIso,
  formatIsoTr,
  parseIso,
  todayIso,
} from "@/lib/dates";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
  minDate?: string;
  label?: string;
  disabled?: boolean;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate = todayIso(),
  label = "Kiralama tarihleri",
  disabled = false,
}: DateRangePickerProps) {
  const fieldId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hoverIso, setHoverIso] = useState<string | null>(null);

  const initialView = startDate ? parseIso(startDate) : new Date();
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  const grid = useMemo(
    () => buildCalendarGrid(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  const displayValue = useMemo(() => {
    if (startDate && endDate) {
      return `${formatIsoTr(startDate)} – ${formatIsoTr(endDate)}`;
    }
    if (startDate) return formatIsoTr(startDate);
    return "";
  }, [startDate, endDate]);

  const goPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleDayClick = useCallback(
    (iso: string) => {
      if (compareIso(iso, minDate) < 0) return;

      if (!startDate || (startDate && endDate)) {
        onChange(iso, "");
        return;
      }

      if (compareIso(iso, startDate) < 0) {
        onChange(iso, "");
        return;
      }

      if (iso === startDate) {
        onChange(iso, iso);
        setOpen(false);
        return;
      }

      onChange(startDate, iso);
      setOpen(false);
    },
    [startDate, endDate, minDate, onChange]
  );

  const handleClear = useCallback(() => {
    onChange("", "");
    setHoverIso(null);
  }, [onChange]);

  const handleToday = useCallback(() => {
    const today = todayIso();
    onChange(today, "");
    const d = parseIso(today);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }, [onChange]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const rangeEndPreview = endDate || (startDate && hoverIso ? hoverIso : null);

  function dayState(iso: string) {
    const isDisabled = compareIso(iso, minDate) < 0;
    const isToday = iso === todayIso();
    const isStart = iso === startDate;
    const isEnd = iso === endDate;
    const rangeStart = startDate;
    const rangeEnd = rangeEndPreview;

    let inRange = false;
    if (rangeStart && rangeEnd && compareIso(rangeStart, rangeEnd) <= 0) {
      inRange =
        compareIso(iso, rangeStart) >= 0 && compareIso(iso, rangeEnd) <= 0;
    } else if (rangeStart && !rangeEnd && iso === rangeStart) {
      inRange = true;
    }

    const isRangeStart = Boolean(rangeStart && iso === rangeStart);
    const isRangeEnd = Boolean(rangeEnd && iso === rangeEnd);
    const isSingleDay =
      isRangeStart && isRangeEnd && startDate && endDate && startDate === endDate;

    return {
      isDisabled,
      isToday,
      inRange,
      isRangeStart,
      isRangeEnd,
      isSingleDay,
    };
  }

  return (
    <div ref={rootRef} className="relative">
      <label
        htmlFor={fieldId}
        className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text)]"
      >
        <CalendarDays className="size-4 text-slate-400" aria-hidden />
        {label}
      </label>

      <button
        id={fieldId}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-sm shadow-sm transition hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-900/60"
      >
        <span
          className={
            displayValue
              ? "font-medium text-[var(--color-text)]"
              : "text-slate-400 dark:text-slate-500"
          }
        >
          {displayValue || "gg.aa.yyyy – gg.aa.yyyy"}
        </span>
        <CalendarDays className="size-4 shrink-0 text-slate-400" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Tarih seçici"
          className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-700">
            <p className="text-sm font-bold text-[var(--color-text)]">
              {MONTHS_TR[viewMonth]} {viewYear}
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrevMonth}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[var(--color-text)] dark:hover:bg-slate-800"
                aria-label="Önceki ay"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={goNextMonth}
                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-[var(--color-text)] dark:hover:bg-slate-800"
                aria-label="Sonraki ay"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="px-3 pb-2 pt-3">
            <div className="mb-2 grid grid-cols-7">
              {WEEKDAYS_TR.map((wd) => (
                <div
                  key={wd}
                  className="py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                >
                  {wd}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-y-1">
              {grid.map((cell, index) => {
                const state = dayState(cell.iso);
                const { isDisabled, isToday, inRange, isRangeStart, isRangeEnd, isSingleDay } =
                  state;

                const col = index % 7;
                const prevIso = index > 0 ? grid[index - 1]?.iso : null;
                const nextIso = index < grid.length - 1 ? grid[index + 1]?.iso : null;
                const prevInRange = prevIso ? dayState(prevIso).inRange : false;
                const nextInRange = nextIso ? dayState(nextIso).inRange : false;

                let cellBg = "";
                if (isSingleDay) {
                  cellBg =
                    "bg-primary text-white shadow-md shadow-primary/30 rounded-full";
                } else if (isRangeStart) {
                  cellBg =
                    "bg-primary text-white shadow-md shadow-primary/25 rounded-l-full";
                } else if (isRangeEnd) {
                  cellBg =
                    "bg-primary text-white shadow-md shadow-primary/25 rounded-r-full";
                } else if (inRange) {
                  const roundLeft = col === 0 || !prevInRange;
                  const roundRight = col === 6 || !nextInRange;
                  cellBg = [
                    "bg-primary/20 text-primary dark:bg-primary/30 dark:text-blue-100",
                    roundLeft ? "rounded-l-full" : "",
                    roundRight ? "rounded-r-full" : "",
                  ]
                    .filter(Boolean)
                    .join(" ");
                }

                return (
                  <div key={cell.iso} className="flex justify-center px-0.5">
                    <button
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleDayClick(cell.iso)}
                      onMouseEnter={() => {
                        if (!isDisabled && startDate && !endDate) {
                          setHoverIso(cell.iso);
                        }
                      }}
                      onMouseLeave={() => setHoverIso(null)}
                      className={[
                        "relative flex h-9 w-full max-w-[2.25rem] items-center justify-center text-sm font-medium transition",
                        cell.inCurrentMonth
                          ? "text-[var(--color-text)]"
                          : "text-slate-300 dark:text-slate-600",
                        isDisabled
                          ? "cursor-not-allowed opacity-30"
                          : "cursor-pointer hover:opacity-90",
                        inRange && !isRangeStart && !isRangeEnd ? "text-primary dark:text-blue-100" : "",
                        cellBg,
                        isToday && !inRange
                          ? "ring-1 ring-primary/40 ring-offset-1 ring-offset-white dark:ring-offset-slate-900"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {cell.day}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2.5 dark:border-slate-700">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Temizle
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-sm font-semibold text-primary transition hover:text-primary/80"
            >
              Bugün
            </button>
          </div>
        </div>
      ) : null}

      {startDate && !endDate ? (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Bitiş tarihini seçin
        </p>
      ) : null}
    </div>
  );
}
