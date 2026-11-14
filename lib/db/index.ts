import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const databaseUrl = process.env.DATABASE_URL ?? "file:./data/dream.db";

const client = createClient({ url: databaseUrl });
export const db = drizzle(client, { schema });

let ready: Promise<unknown> | null = null;
/** SQLite only enforces foreign keys when asked, per connection. Call before writes. */
export function ensureForeignKeys(): Promise<unknown> {
  ready ??= client.execute("PRAGMA foreign_keys = ON");
  return ready;
}
