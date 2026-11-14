import { db, databaseUrl } from "../lib/db";
import { checkDatabase } from "./check";

console.log(`Checking ${databaseUrl} against data/expected-totals.json\n`);
const ok = await checkDatabase(db);
process.exit(ok ? 0 : 1);
