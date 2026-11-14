import { describe, expect, it } from "vitest";
import { monthSpend, periodOf } from "./expenses";

describe("expenses", () => {
  it("totals by stored period, oldest first", () => {
    const r = monthSpend([
      { period: "2026-06", amount: 5 },
      { period: "2026-05", amount: 2 },
      { period: "2026-05", amount: 3 },
    ]);
    expect(r).toEqual([
      { period: "2026-05", total: 5, rows: 2 },
      { period: "2026-06", total: 5, rows: 1 },
    ]);
  });
  it("uses the stored period, not the date", () => {
    expect(periodOf("2026-08-01")).toBe("2026-08");
  });
  it("handles no rows", () => {
    expect(monthSpend([])).toEqual([]);
  });
});
