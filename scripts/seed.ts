import { readFileSync } from "node:fs";
import { count } from "drizzle-orm";
import { db, databaseUrl, ensureForeignKeys } from "../lib/db";
import * as t from "../lib/db/schema";
import { mapSeed } from "../lib/seed/map";
import { checkDatabase } from "./check";

const force = process.argv.includes("--force");
const rows = mapSeed(JSON.parse(readFileSync("data/seed.json", "utf8")));

await ensureForeignKeys();

let existing = 0;
for (const table of t.ALL_TABLES_DELETE_ORDER) {
  const [{ n }] = await db.select({ n: count() }).from(table);
  existing += n;
}
if (existing > 0 && !force) {
  console.error(`${databaseUrl} already has ${existing} rows. Seeding wipes them.`);
  console.error("Run `npm run db:seed -- --force` only if you mean to replace the family's data.");
  process.exit(1);
}

const CHUNK = 200;
async function insertAll<T extends Record<string, unknown>>(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  table: Parameters<typeof db.insert>[0],
  values: T[],
) {
  for (let i = 0; i < values.length; i += CHUNK) {
    await tx.insert(table).values(values.slice(i, i + CHUNK) as never);
  }
}

await db.transaction(async (tx) => {
  if (force) for (const table of t.ALL_TABLES_DELETE_ORDER) await tx.delete(table);
  await insertAll(tx, t.settings, rows.settings);
  await insertAll(tx, t.budgetCategories, rows.budgetCategories);
  await insertAll(tx, t.budgetLines, rows.budgetLines);
  await insertAll(tx, t.expenses, rows.expenses);
  await insertAll(tx, t.loanTransfers, rows.loanTransfers);
  await insertAll(tx, t.materials, rows.materials);
  await insertAll(tx, t.labourMonths, rows.labourMonths);
  await insertAll(tx, t.labourEntries, rows.labourEntries);
  await insertAll(tx, t.trips, rows.trips);
  await insertAll(tx, t.tripLines, rows.tripLines);
  await insertAll(tx, t.tripRates, rows.tripRates);
  await insertAll(tx, t.savingsMonths, rows.savingsMonths);
  await insertAll(tx, t.holdings, rows.holdings);
  await insertAll(tx, t.fxNotes, rows.fxNotes);
});

console.log(`Seeded ${databaseUrl}. Checking totals:\n`);
const ok = await checkDatabase(db);
process.exit(ok ? 0 : 1);
