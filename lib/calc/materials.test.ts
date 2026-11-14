import { describe, expect, it } from "vitest";
import { BRICK, CEMENT, cementPriceChange, materialLeft, materialTotals, quantityOf, suggestedTotal } from "./materials";

const m = (name: string, price: number, date: string | null, qtyNeeded: number, totalCost = 0, paid = 0) => ({
  name,
  price,
  date,
  qtyNeeded,
  totalCost,
  paid,
});
const rows = [
  m("Crown 52.5 (bag)", 23000, "2026-02-21", 500, 11500000, 11500000),
  m("Cement (bag)", 13300, "2026-11-02", 100, 1330000, 0),
  m("Crown 52.5 (bag)", 16500, "2026-06-11", 300),
  m("Red brick", 100, null, 1000),
];

describe("materials", () => {
  it("left is total minus paid", () => {
    expect(materialLeft(rows[1])).toBe(1330000);
    expect(materialTotals(rows)).toEqual({ totalCost: 12830000, paid: 11500000, left: 1330000 });
  });
  it("suggests a rounded total from price and quantity", () => {
    expect(suggestedTotal(16500.4, 3)).toBe(49501);
  });
  it("counts quantities by name", () => {
    expect(quantityOf(rows, CEMENT)).toBe(900);
    expect(quantityOf(rows, BRICK)).toBe(1000);
  });
  it("finds first and latest cement price by date", () => {
    expect(cementPriceChange(rows)).toEqual({
      first: { price: 23000, date: "2026-02-21" },
      latest: { price: 13300, date: "2026-11-02" },
    });
    expect(cementPriceChange([rows[0]])).toBeNull();
  });
});
