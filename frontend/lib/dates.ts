/** Tarih yardımcıları (ISO yyyy-mm-dd) */

export const WEEKDAYS_TR = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pa"] as const;

export const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
] as const;

export function todayIso(): string {
  const d = new Date();
  return toIso(d);
}

export function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIso(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

export function formatIsoTr(iso: string): string {
  if (!iso) return "";
  const d = parseIso(iso);
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function compareIso(a: string, b: string): number {
  return a.localeCompare(b);
}

export function computeRentalDays(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const diff = Math.round(
    (parseIso(endDate).getTime() - parseIso(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return diff > 0 ? diff : 0;
}

export interface CalendarDay {
  iso: string;
  day: number;
  inCurrentMonth: boolean;
}

/** Pazartesi ile başlayan 6 haftalık takvim ızgarası */
export function buildCalendarGrid(year: number, month: number): CalendarDay[] {
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const gridStart = new Date(year, month, 1 - startOffset);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const cell = new Date(gridStart);
    cell.setDate(gridStart.getDate() + i);
    days.push({
      iso: toIso(cell),
      day: cell.getDate(),
      inCurrentMonth: cell.getMonth() === month,
    });
  }
  return days;
}
