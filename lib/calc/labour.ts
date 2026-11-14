import type { LabourEntryRow, LabourMonthRow } from "./types";
import { sum } from "./util";

export function wage(e: Pick<LabourEntryRow, "days" | "dailyRate">): number {
  return e.days * e.dailyRate;
}

export function due(e: Pick<LabourEntryRow, "days" | "dailyRate" | "paid">): number {
  return wage(e) - e.paid;
}

export type LabourTotals = { days: number; wages: number; paid: number; due: number };

export function entryTotals(entries: readonly LabourEntryRow[]): LabourTotals {
  const wages = sum(entries, wage);
  const paid = sum(entries, (e) => e.paid);
  return { days: sum(entries, (e) => e.days), wages, paid, due: wages - paid };
}

/** Person-days = sum(days) for labour months up to and including the current month. */
export function personDays(
  months: readonly LabourMonthRow[],
  entries: readonly LabourEntryRow[],
  currentPeriod: string,
): number {
  const ids = new Set(months.filter((m) => m.period <= currentPeriod).map((m) => m.id));
  return sum(
    entries.filter((e) => ids.has(e.monthId)),
    (e) => e.days,
  );
}

export function mealsPaid(months: readonly LabourMonthRow[]): number {
  return sum(months, (m) => m.mealsPaid);
}
