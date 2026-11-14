import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapSeed } from "./seed/map";
import { actualTotals, compareTotals, formatTable } from "./verify";

const seed = JSON.parse(readFileSync("data/seed.json", "utf8"));
const expected = JSON.parse(readFileSync("data/expected-totals.json", "utf8"));

describe("seed.json reproduces expected-totals.json", () => {
  const rows = mapSeed(seed);
  const checks = compareTotals(expected, actualTotals(rows, expected));

  it("checks every expected key", () => {
    expect(checks.length).toBeGreaterThan(60);
  });

  it("matches every figure", () => {
    const bad = checks.filter((c) => !c.ok);
    if (bad.length) console.log(formatTable(bad));
    expect(bad).toEqual([]);
  });

  it("keeps Burmese names exactly as given", () => {
    expect(rows.expenses.find((e) => e.id === "e0061")?.item).toBe("ညိုတေး");
  });

  it("resolves every expense budget line name", () => {
    const withCat = rows.expenses.filter((e) => e.budgetLineId !== null).length;
    expect(withCat).toBeGreaterThan(0);
  });
});

describe("mapSeed guards", () => {
  it("fails loudly when an expense names a budget line that does not exist", () => {
    const bad = structuredClone(seed);
    bad.expenses["2026-05"].items[0].cat = "No such line";
    expect(() => mapSeed(bad)).toThrow(/does not exist/);
  });
});
