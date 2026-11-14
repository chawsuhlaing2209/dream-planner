import type { LoanRow } from "./types";
import { pointAtOrBefore, type SavingsPoint } from "./savings";
import { sum } from "./util";

export type LoanMath = {
  borrowed: number;
  savedAtCompare: number;
  stillToBorrow: number;
  total: number;
  months: number;
};

/**
 * Still to borrow = max(0, home left to pay - running total at the compare month).
 * Total loan = borrowed + still to borrow; months = total / repay per month.
 */
export function loanMath(input: {
  transfers: readonly LoanRow[];
  homeLeft: number;
  series: readonly SavingsPoint[];
  compareMonth: string;
  repayPerMonth: number;
}): LoanMath {
  const borrowed = sum(input.transfers, (t) => t.amount);
  const savedAtCompare = pointAtOrBefore(input.series, input.compareMonth)?.total ?? 0;
  const stillToBorrow = Math.max(0, input.homeLeft - savedAtCompare);
  const total = borrowed + stillToBorrow;
  return {
    borrowed,
    savedAtCompare,
    stillToBorrow,
    total,
    months: input.repayPerMonth > 0 ? total / input.repayPerMonth : 0,
  };
}
