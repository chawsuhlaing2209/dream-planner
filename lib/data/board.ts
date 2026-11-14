import "server-only";
import { connection } from "next/server";
import { buildBoard } from "../calc/board";
import { db } from "../db";
import { loadAll } from "../db/load";
import { currentPeriod, todayISO } from "../time";

/** Reads live data and builds the board. Per request, never cached. */
export async function getBoard() {
  await connection();
  const rows = await loadAll(db);
  const s = rows.settings[0];
  const today = todayISO();
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
      openingBalance: s?.openingBalance ?? 0,
      repayPerMonth: s?.repayPerMonth ?? 0,
      loanCompareMonth: s?.loanCompareMonth ?? currentPeriod(),
    },
    currentPeriod(),
  );
  return { board, today };
}
