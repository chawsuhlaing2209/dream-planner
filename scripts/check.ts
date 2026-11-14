import { readFileSync } from "node:fs";
import { loadAll } from "../lib/db/load";
import type { db as Db } from "../lib/db";
import { actualTotals, compareTotals, formatTable } from "../lib/verify";

/** Compares the database with data/expected-totals.json, prints the table, returns true when all OK. */
export async function checkDatabase(db: typeof Db): Promise<boolean> {
  const expected = JSON.parse(readFileSync("data/expected-totals.json", "utf8"));
  const rows = await loadAll(db);
  const checks = compareTotals(expected, actualTotals(rows, expected));
  console.log(formatTable(checks));
  const bad = checks.filter((c) => !c.ok).length;
  console.log(bad === 0 ? `\nAll ${checks.length} checks OK.` : `\n${bad} of ${checks.length} checks differ.`);
  return bad === 0;
}
