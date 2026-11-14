import { describe, expect, it } from "vitest";
import { categoryTotals, homeTotals, lineLeft } from "./budget";

const cats = [
  { id: "b", key: "kitchen", name: "Kitchen", shortLabel: "Kitchen", boardLabel: "Kitchen setup", sort: 2 },
  { id: "a", key: "finish", name: "Finishing", shortLabel: "Finishing", boardLabel: "Paint", sort: 1 },
];
const lines = [
  { id: "1", categoryId: "a", estimate: 1000, paid: 1288 },
  { id: "2", categoryId: "a", estimate: 1000, paid: 0 },
  { id: "3", categoryId: "b", estimate: 0, paid: 0 },
];

describe("budget", () => {
  it("keeps negative left when overpaid", () => {
    expect(lineLeft({ estimate: 1000, paid: 1288 })).toBe(-288);
  });
  it("sums rooms in sheet order and clamps share to 0..1", () => {
    const r = categoryTotals(cats, lines);
    expect(r.map((c) => c.key)).toEqual(["finish", "kitchen"]);
    expect(r[0]).toMatchObject({ estimate: 2000, paid: 1288, left: 712, lineCount: 2 });
    expect(r[0].share).toBeCloseTo(0.644);
    expect(r[1].share).toBe(0);
    expect(categoryTotals(cats, [{ id: "x", categoryId: "a", estimate: 10, paid: 20 }])[0].share).toBe(1);
  });
  it("computes home % paid", () => {
    expect(homeTotals(lines)).toMatchObject({ estimate: 2000, paid: 1288, left: 712, percent: 64 });
    expect(homeTotals([]).percent).toBe(0);
  });
});
