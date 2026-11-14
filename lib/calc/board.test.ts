import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mapSeed } from "../seed/map";
import { buildBoard } from "./board";

const rows = mapSeed(JSON.parse(readFileSync("data/seed.json", "utf8")));
const s = rows.settings[0];
const board = buildBoard(
  {
    categories: rows.budgetCategories,
    lines: rows.budgetLines,
    expenses: rows.expenses,
    transfers: rows.loanTransfers,
    materials: rows.materials,
    labourMonths: rows.labourMonths,
    labourEntries: rows.labourEntries,
    trips: rows.trips,
    tripLines: rows.tripLines,
    tripRates: rows.tripRates,
    savings: rows.savingsMonths,
    openingBalance: s.openingBalance,
    repayPerMonth: s.repayPerMonth,
    loanCompareMonth: s.loanCompareMonth,
  },
  "2026-11",
);

describe("board on seed data, current month Nov 2026 (prototype snapshot)", () => {
  it("home tile", () => {
    expect(board.home).toMatchObject({ paid: 229923577, left: 63434175, percent: 78 });
  });
  it("trip tile: 2 done, 2 planned, 1 with no status", () => {
    expect(board.tripCounts).toEqual({ done: 2, planned: 2, none: 1 });
  });
  it("savings tile: Nov 2026 row and Jul 2028 plan", () => {
    expect(board.savings.now?.month).toBe("2026-11");
    expect(board.savings.now?.total).toBe(26690056);
    expect(board.savings.end?.month).toBe("2028-07");
  });
  it("loan card", () => {
    expect(board.loan.borrowed).toBe(76050000);
    expect(board.loan.stillToBorrow).toBe(19774119);
    expect(board.loan.months).toBeCloseTo(24.0, 1);
  });
  it("walls card", () => {
    expect(board.walls).toMatchObject({ cementBags: 950, bricks: 35000, rebarTons: 11.5, personDays: 1651.5 });
    expect(board.walls.cement?.first).toEqual({ price: 23000, date: "2026-02-21" });
    expect(board.walls.cement?.latest.price).toBe(13300);
  });
  it("rooms: structure most paid, furniture least", () => {
    const sorted = [...board.rooms].sort((a, b) => b.share - a.share);
    expect(sorted[0].key).toBe("structure");
    expect(sorted[sorted.length - 1].key).toBe("living");
  });
  it("tickets carry top 3 chips and the foreign part", () => {
    const phuket = board.tickets.find((t) => t.id === "phuket");
    expect(phuket?.chips).toHaveLength(3);
    expect(phuket?.foreign).toEqual([{ currency: "THB", amount: 74952 }]);
    expect(Math.round(phuket?.kyat ?? 0)).toBe(11329140);
  });
});
