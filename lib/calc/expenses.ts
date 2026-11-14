import type { ExpenseRow } from "./types";
import { sum } from "./util";

export type MonthSpend = { period: string; total: number; rows: number };

/** Month build spend = sum(expense.amount where period = month), oldest first. */
export function monthSpend(expenses: readonly ExpenseRow[]): MonthSpend[] {
  const periods = [...new Set(expenses.map((e) => e.period))].sort();
  return periods.map((period) => {
    const rows = expenses.filter((e) => e.period === period);
    return { period, total: sum(rows, (e) => e.amount), rows: rows.length };
  });
}

/** The month key (YYYY-MM) of an ISO date. */
export function periodOf(date: string): string {
  return date.slice(0, 7);
}
