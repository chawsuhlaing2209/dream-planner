import type { BudgetLineRow, CategoryRow } from "./types";
import { clamp01, sum } from "./util";

/** Line left = estimate - paid. Negative means overpaid, keep it. */
export function lineLeft(line: Pick<BudgetLineRow, "estimate" | "paid">): number {
  return line.estimate - line.paid;
}

export type CategoryTotals = CategoryRow & {
  estimate: number;
  paid: number;
  left: number;
  /** Room % paid as 0..1 (clamped). */
  share: number;
  lineCount: number;
};

export function categoryTotals(categories: readonly CategoryRow[], lines: readonly BudgetLineRow[]): CategoryTotals[] {
  return [...categories]
    .sort((a, b) => a.sort - b.sort)
    .map((c) => {
      const own = lines.filter((l) => l.categoryId === c.id);
      const estimate = sum(own, (l) => l.estimate);
      const paid = sum(own, (l) => l.paid);
      return {
        ...c,
        estimate,
        paid,
        left: estimate - paid,
        share: estimate > 0 ? clamp01(paid / estimate) : 0,
        lineCount: own.length,
      };
    });
}

export type HomeTotals = { estimate: number; paid: number; left: number; share: number; percent: number };

/** Home % paid = sum(all paid) / sum(all estimate). */
export function homeTotals(lines: readonly Pick<BudgetLineRow, "estimate" | "paid">[]): HomeTotals {
  const estimate = sum(lines, (l) => l.estimate);
  const paid = sum(lines, (l) => l.paid);
  const share = estimate > 0 ? paid / estimate : 0;
  return { estimate, paid, left: estimate - paid, share, percent: Math.round(share * 100) };
}
