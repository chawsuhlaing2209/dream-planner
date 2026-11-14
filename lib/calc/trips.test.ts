import { describe, expect, it } from "vitest";
import { lineKyat, ratesFor, stampOf, statusCounts, topLines, tripTotals } from "./trips";

const lines = [
  { tripId: "t", name: "Hotel", currency: "THB" as const, price: 1000, qty: 2 },
  { tripId: "t", name: "Visa", currency: "MMK" as const, price: 50000, qty: 1 },
  { tripId: "t", name: "Snacks", currency: "USD" as const, price: 10, qty: 1 },
];
const rates = ratesFor("t", [
  { tripId: "t", currency: "THB", kyatPerUnit: 130 },
  { tripId: "other", currency: "THB", kyatPerUnit: 999 },
]);

describe("trips", () => {
  it("converts with the trip's own rate; MMK is 1; a missing rate counts as 0", () => {
    expect(lineKyat(lines[0], rates)).toBe(260000);
    expect(lineKyat(lines[1], rates)).toBe(50000);
    expect(lineKyat(lines[2], rates)).toBe(0);
  });
  it("totals in kyat and per currency", () => {
    expect(tripTotals(lines, rates)).toEqual({
      kyat: 310000,
      byCurrency: { THB: 2000, MMK: 50000, USD: 10 },
      foreignUsed: ["THB", "USD"],
    });
  });
  it("picks the top lines by kyat", () => {
    expect(topLines(lines, rates, 2).map((l) => l.name)).toEqual(["Hotel", "Visa"]);
  });
  it("maps status to stamps and counts", () => {
    expect(stampOf("Pending")).toEqual({ kind: "plan", label: "Planned" });
    expect(stampOf("")).toEqual({ kind: "none", label: "No status" });
    expect(statusCounts([{ id: "a", status: "Completed" }, { id: "b", status: "Pending" }, { id: "c", status: "" }])).toEqual({
      done: 1,
      planned: 1,
      none: 1,
    });
  });
});
