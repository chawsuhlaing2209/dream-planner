import { describe, expect, it } from "vitest";
import { parseField } from "./fields";

describe("parseField", () => {
  it("accepts valid values", () => {
    expect(parseField("expenses", "amount", 1000000)).toEqual({ ok: true, value: 1000000 });
    expect(parseField("labourEntries", "days", 0.5)).toEqual({ ok: true, value: 0.5 });
    expect(parseField("expenses", "budgetLineId", null)).toEqual({ ok: true, value: null });
    expect(parseField("expenses", "item", " ညိုတေး ")).toEqual({ ok: true, value: " ညိုတေး " });
  });
  it("rejects NaN, negative and fractional kyat", () => {
    expect(parseField("expenses", "amount", Number.NaN).ok).toBe(false);
    expect(parseField("expenses", "amount", -5).ok).toBe(false);
    expect(parseField("expenses", "amount", 1.5).ok).toBe(false);
    expect(parseField("materials", "qtyNeeded", -1).ok).toBe(false);
  });
  it("rejects unknown tables, unknown fields and calculated values", () => {
    expect(parseField("users", "x", 1).ok).toBe(false);
    expect(parseField("budgetLines", "left", 1).ok).toBe(false);
    expect(parseField("budgetLines", "categoryId", "x").ok).toBe(false);
  });
  it("checks enums and dates", () => {
    expect(parseField("materials", "status", "Done").ok).toBe(true);
    expect(parseField("materials", "status", "Maybe").ok).toBe(false);
    expect(parseField("expenses", "date", "14/11/2026").ok).toBe(false);
  });
});
