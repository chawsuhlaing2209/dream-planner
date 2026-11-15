import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

/**
 * Local: DATABASE_URL=file:./data/dream.db (no token).
 * Hosted (Turso): DATABASE_URL=libsql://<db>-<org>.turso.io and DATABASE_AUTH_TOKEN=<token>.
 */
export const databaseUrl = process.env.DATABASE_URL ?? "file:./data/dream.db";
export const isLocalFile = databaseUrl.startsWith("file:");

const client = createClient({ url: databaseUrl, authToken: process.env.DATABASE_AUTH_TOKEN || undefined });
export const db = drizzle(client, { schema });

let ready: Promise<unknown> | null = null;
/**
 * A local SQLite file only enforces foreign keys when asked, per connection.
 * Writes never rely on this: deletes clean up child rows themselves (see app/actions.ts).
 */
export function ensureForeignKeys(): Promise<unknown> {
  ready ??= isLocalFile ? client.execute("PRAGMA foreign_keys = ON") : Promise.resolve();
  return ready;
}
