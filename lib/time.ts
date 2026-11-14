/** Dates in the family's time zone (Asia/Yangon). Calc functions never call these; pages pass the result in. */
export const TIME_ZONE = "Asia/Yangon";

/** Today as YYYY-MM-DD in Asia/Yangon. */
export function todayISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function currentPeriod(now: Date = new Date()): string {
  return todayISO(now).slice(0, 7);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11" or "2026-11-14" -> "Nov". */
export function monthShort(p: string): string {
  return MONTHS[Number(p.slice(5, 7)) - 1] ?? p;
}

/** "2026-11" -> "Nov 2026". */
export function monthLong(p: string): string {
  return `${monthShort(p)} ${p.slice(0, 4)}`;
}

/** "2026-11-14" -> "14 Nov 2026". */
export function dayLong(iso: string): string {
  return `${Number(iso.slice(8, 10))} ${monthShort(iso)} ${iso.slice(0, 4)}`;
}

/** "2026-11" -> "2026-12". */
export function nextPeriod(p: string): string {
  let y = Number(p.slice(0, 4));
  let m = Number(p.slice(5, 7)) + 1;
  if (m > 12) {
    m = 1;
    y += 1;
  }
  return `${y}-${String(m).padStart(2, "0")}`;
}
