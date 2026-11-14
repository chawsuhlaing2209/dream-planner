import type { Currency, TripLineRow, TripRateRow, TripRow } from "./types";
import { sum } from "./util";

export type Rates = Partial<Record<Currency, number>>;

export function ratesFor(tripId: string, rows: readonly TripRateRow[]): Rates {
  const out: Rates = {};
  for (const r of rows) if (r.tripId === tripId) out[r.currency] = r.kyatPerUnit;
  return out;
}

export function lineTotal(l: Pick<TripLineRow, "price" | "qty">): number {
  return l.price * l.qty;
}

/** Trip line in kyat = price * qty * rate[currency]; rate is 1 for MMK, 0 when not set. */
export function lineKyat(l: Pick<TripLineRow, "price" | "qty" | "currency">, rates: Rates): number {
  const rate = l.currency === "MMK" ? 1 : (rates[l.currency] ?? 0);
  return lineTotal(l) * rate;
}

export type TripTotals = {
  kyat: number;
  /** Total in each currency's own units (before conversion). */
  byCurrency: Partial<Record<Currency, number>>;
  /** Foreign currencies that have lines in this trip, in a stable order. */
  foreignUsed: Currency[];
};

const FOREIGN: Currency[] = ["THB", "USD", "SGD"];

export function tripTotals(lines: readonly TripLineRow[], rates: Rates): TripTotals {
  const byCurrency: Partial<Record<Currency, number>> = {};
  for (const l of lines) byCurrency[l.currency] = (byCurrency[l.currency] ?? 0) + lineTotal(l);
  return {
    kyat: sum(lines, (l) => lineKyat(l, rates)),
    byCurrency,
    foreignUsed: FOREIGN.filter((c) => lines.some((l) => l.currency === c)),
  };
}

/** Top n lines by kyat value (for the boarding pass chips). */
export function topLines<T extends TripLineRow>(lines: readonly T[], rates: Rates, n = 3): T[] {
  return [...lines].sort((a, b) => lineKyat(b, rates) - lineKyat(a, rates)).slice(0, n);
}

export type StampKind = "done" | "plan" | "none";

export function stampOf(status: string): { kind: StampKind; label: string } {
  if (status === "Completed") return { kind: "done", label: "Completed" };
  if (status === "Pending") return { kind: "plan", label: "Planned" };
  return { kind: "none", label: "No status" };
}

export function statusCounts(trips: readonly TripRow[]) {
  const done = trips.filter((t) => t.status === "Completed").length;
  const planned = trips.filter((t) => t.status === "Pending").length;
  return { done, planned, none: trips.length - done - planned };
}
