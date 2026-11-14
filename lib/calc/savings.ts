import type { SavingsRow } from "./types";

/** Net saving = cdg + tf + koko - expense - extraExpense. */
export function netSaving(r: Pick<SavingsRow, "cdg" | "tf" | "koko" | "expense" | "extraExpense">): number {
  return r.cdg + r.tf + r.koko - r.expense - r.extraExpense;
}

export type SavingsPoint = { month: string; net: number; total: number; received: boolean };

/** Running total = previous total + net + extraIn, starting from the opening balance. */
export function savingsSeries(opening: number, rows: readonly SavingsRow[]): SavingsPoint[] {
  let run = opening;
  return [...rows]
    .sort((a, b) => (a.month < b.month ? -1 : a.month > b.month ? 1 : 0))
    .map((r) => {
      const net = netSaving(r);
      run += net + r.extraIn;
      return { month: r.month, net, total: run, received: r.cdgReceived };
    });
}

/** The last point at or before a month, or undefined. */
export function pointAtOrBefore(series: readonly SavingsPoint[], month: string): SavingsPoint | undefined {
  let found: SavingsPoint | undefined;
  for (const p of series) if (p.month <= month) found = p;
  return found;
}
