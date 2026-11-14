import { describe, expect, it } from "vitest";
import { due, entryTotals, mealsPaid, personDays, wage } from "./labour";

const months = [
  { id: "m1", period: "2026-10", mealsPaid: 100 },
  { id: "m2", period: "2026-11", mealsPaid: 0 },
  { id: "m3", period: "2026-12", mealsPaid: 0 },
];
const entries = [
  { monthId: "m1", days: 20.5, dailyRate: 1000, paid: 20000 },
  { monthId: "m2", days: 10, dailyRate: 2000, paid: 0 },
  { monthId: "m3", days: 5, dailyRate: 2000, paid: 0 },
];

describe("labour", () => {
  it("computes wage and due with half days", () => {
    expect(wage(entries[0])).toBe(20500);
    expect(due(entries[0])).toBe(500);
  });
  it("totals entries", () => {
    expect(entryTotals(entries)).toEqual({ days: 35.5, wages: 50500, paid: 20000, due: 30500 });
  });
  it("counts person-days up to and including the current month", () => {
    expect(personDays(months, entries, "2026-11")).toBe(30.5);
    expect(personDays(months, entries, "2026-09")).toBe(0);
  });
  it("sums meals", () => {
    expect(mealsPaid(months)).toBe(100);
  });
});
