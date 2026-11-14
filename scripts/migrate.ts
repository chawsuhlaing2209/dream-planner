import { migrate } from "drizzle-orm/libsql/migrator";
import { db, databaseUrl } from "../lib/db";

await migrate(db, { migrationsFolder: "./drizzle" });
console.log(`Migrations applied to ${databaseUrl}`);
