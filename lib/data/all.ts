import "server-only";
import { connection } from "next/server";
import { db } from "../db";
import { loadAll } from "../db/load";

/** Every table, read per request (never cached), in sheet order. */
export async function getAll() {
  await connection();
  return loadAll(db);
}
