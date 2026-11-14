import { describe, expect, it } from "vitest";
import { netSaving, pointAtOrBefore, savingsSeries } from "./savings";

const row = (month: string, extra: Partial<Parameters<typeof netSaving>[0]> & { extraIn?: number; cdgReceived?: boolean } = {}) => ({
  month,
  cdg: 100,
  tf: 10,
  koko: 50,
  expense: 40,
  extraExpense: 20,
  extraIn: 0,
  cdgReceived: true,
  ...extra,
});

describe("savings", () => {
  it("net = cdg + tf + koko - expense - extra expense", () => {
    expect(netSaving(row("2026-01"))).toBe(100);
  });
  it("runs from the opening balance, adds extra in, sorts by month", () => {
    const s = savingsSeries(1000, [row("2026-02", { extraIn: 5, cdgReceived: false }), row("2026-01")]);
    expect(s).toEqual([
      { month: "2026-01", net: 100, total: 1100, received: true },
      { month: "2026-02", net: 100, total: 1205, received: false },
    ]);
  });
  it("finds the last point at or before a month", () => {
    const s = savingsSeries(0, [row("2026-01"), row("2026-03")]);
    expect(pointAtOrBefore(s, "2026-02")?.month).toBe("2026-01");
    expect(pointAtOrBefore(s, "2025-12")).toBeUndefined();
  });
});
