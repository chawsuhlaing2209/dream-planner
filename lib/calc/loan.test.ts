import { describe, expect, it } from "vitest";
import { loanMath } from "./loan";

const series = [
  { month: "2026-12", net: 0, total: 30, received: true },
  { month: "2027-01", net: 0, total: 40, received: false },
];

describe("loan", () => {
  it("still to borrow = max(0, left - savings at compare month)", () => {
    const r = loanMath({ transfers: [{ amount: 60 }, { amount: 16 }], homeLeft: 100, series, compareMonth: "2027-01", repayPerMonth: 4 });
    expect(r).toEqual({ borrowed: 76, savedAtCompare: 40, stillToBorrow: 60, total: 136, months: 34 });
  });
  it("never goes below zero and handles no repay amount", () => {
    const r = loanMath({ transfers: [], homeLeft: 10, series, compareMonth: "2027-01", repayPerMonth: 0 });
    expect(r.stillToBorrow).toBe(0);
    expect(r.months).toBe(0);
  });
});
