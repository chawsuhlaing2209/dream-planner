import { asc } from "drizzle-orm";
import type { db as Db } from "./index";
import * as t from "./schema";

type Database = typeof Db;

/** Reads every table in sheet order. Shapes match lib/seed/map so the same checks run on both. */
export async function loadAll(db: Database) {
  const [
    budgetCategories,
    budgetLines,
    expenses,
    loanTransfers,
    materials,
    labourMonths,
    labourEntries,
    trips,
    tripLines,
    tripRates,
    savingsMonths,
    holdings,
    fxNotes,
    settings,
  ] = await Promise.all([
    db.select().from(t.budgetCategories).orderBy(asc(t.budgetCategories.sort)),
    db.select().from(t.budgetLines).orderBy(asc(t.budgetLines.sort)),
    db.select().from(t.expenses).orderBy(asc(t.expenses.period), asc(t.expenses.sort)),
    db.select().from(t.loanTransfers).orderBy(asc(t.loanTransfers.sort)),
    db.select().from(t.materials).orderBy(asc(t.materials.sort)),
    db.select().from(t.labourMonths).orderBy(asc(t.labourMonths.period)),
    db.select().from(t.labourEntries).orderBy(asc(t.labourEntries.sort)),
    db.select().from(t.trips).orderBy(asc(t.trips.sort)),
    db.select().from(t.tripLines).orderBy(asc(t.tripLines.sort)),
    db.select().from(t.tripRates),
    db.select().from(t.savingsMonths).orderBy(asc(t.savingsMonths.month)),
    db.select().from(t.holdings).orderBy(asc(t.holdings.sort)),
    db.select().from(t.fxNotes).orderBy(asc(t.fxNotes.month)),
    db.select().from(t.settings),
  ]);
  return {
    budgetCategories,
    budgetLines,
    expenses,
    loanTransfers,
    materials,
    labourMonths,
    labourEntries,
    trips,
    tripLines,
    tripRates,
    savingsMonths,
    holdings,
    fxNotes,
    settings,
  };
}

export type AllRows = Awaited<ReturnType<typeof loadAll>>;
