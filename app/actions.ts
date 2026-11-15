"use server";

import { and, desc, eq, max, sql } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { periodOf } from "@/lib/calc/expenses";
import { suggestedTotal } from "@/lib/calc/materials";
import { DELETABLE, parseField, type ActionResult } from "@/lib/actions/fields";
import { hasSession } from "@/lib/auth/server";
import { db, ensureForeignKeys } from "@/lib/db";
import * as t from "@/lib/db/schema";
import { CURRENCIES } from "@/lib/db/schema";
import { currentPeriod, nextPeriod, todayISO } from "@/lib/time";

const TABLES = {
  budgetLines: t.budgetLines,
  expenses: t.expenses,
  loanTransfers: t.loanTransfers,
  materials: t.materials,
  labourMonths: t.labourMonths,
  labourEntries: t.labourEntries,
  trips: t.trips,
  tripLines: t.tripLines,
  savingsMonths: t.savingsMonths,
  holdings: t.holdings,
  fxNotes: t.fxNotes,
  settings: t.settings,
} as const;
type TableName = keyof typeof TABLES;

const DENIED: ActionResult = { ok: false, error: "You are logged out. Reload the page and enter the passcode." };

const newId = (prefix: string) => `${prefix}${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

function done(): ActionResult {
  // Every tracker edit can change the board, so refresh all pages.
  revalidatePath("/", "layout");
  return { ok: true };
}

function failed(err: unknown): ActionResult {
  const msg = err instanceof Error ? err.message : String(err);
  if (/UNIQUE constraint failed: budget_lines.name/.test(msg)) return { ok: false, error: "Another line already has this name." };
  if (/FOREIGN KEY/.test(msg)) return { ok: false, error: "That budget line no longer exists." };
  console.error("Dream Planner write failed:", msg);
  return { ok: false, error: "Could not save. Edit the row again to retry." };
}

async function nextSort(column: SQLiteColumn, where?: ReturnType<typeof eq>): Promise<number> {
  const table = column.table;
  const [r] = await db.select({ m: max(column) }).from(table).where(where);
  return r?.m == null ? 0 : Number(r.m) + 1;
}

/** Saves one edited cell. Validated against lib/actions/fields. */
export async function updateField(table: string, id: string, field: string, value: unknown): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  const parsed = parseField(table, field, value);
  if (!parsed.ok) return parsed;
  if (typeof id !== "string" || !id) return { ok: false, error: "Missing row." };
  try {
    await ensureForeignKeys();
    const tbl = TABLES[table as TableName];
    const set: Record<string, unknown> = { [field]: parsed.value };
    // Materials: changing price or quantity needed recalculates the total cost (the user can type over it after).
    if (table === "materials" && (field === "price" || field === "qtyNeeded")) {
      const [row] = await db.select().from(t.materials).where(eq(t.materials.id, id));
      if (row) {
        const price = field === "price" ? (parsed.value as number) : row.price;
        const q = field === "qtyNeeded" ? (parsed.value as number) : row.qtyNeeded;
        set.totalCost = suggestedTotal(price, q);
      }
    }
    const res = await db
      .update(tbl)
      .set(set as never)
      .where(eq(tbl.id, id));
    if (res.rowsAffected === 0) return { ok: false, error: "This row was removed. Reload the page." };
    return done();
  } catch (err) {
    return failed(err);
  }
}

/** Deletes one row. Child rows cascade (trip lines, trip rates). */
export async function deleteRow(table: string, id: string): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  if (!(DELETABLE as readonly string[]).includes(table)) return { ok: false, error: "This row cannot be deleted." };
  try {
    await ensureForeignKeys();
    // Clean up child rows here instead of relying on the database's foreign-key settings,
    // which a hosted database may not enforce the same way as the local file.
    if (table === "trips") {
      await db.transaction(async (tx) => {
        await tx.delete(t.tripLines).where(eq(t.tripLines.tripId, id));
        await tx.delete(t.tripRates).where(eq(t.tripRates.tripId, id));
        await tx.delete(t.trips).where(eq(t.trips.id, id));
      });
      return done();
    }
    if (table === "budgetLines") {
      await db.transaction(async (tx) => {
        await tx.update(t.expenses).set({ budgetLineId: null }).where(eq(t.expenses.budgetLineId, id));
        await tx.delete(t.budgetLines).where(eq(t.budgetLines.id, id));
      });
      return done();
    }
    const tbl = TABLES[table as TableName];
    await db.delete(tbl).where(eq(tbl.id, id));
    return done();
  } catch (err) {
    return failed(err);
  }
}

/* ---------- Home budget ---------- */

export async function addBudgetLine(categoryId: string): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    const [cat] = await db.select().from(t.budgetCategories).where(eq(t.budgetCategories.id, categoryId));
    if (!cat) return { ok: false, error: "That category no longer exists." };
    const sort = await nextSort(t.budgetLines.sort, eq(t.budgetLines.categoryId, categoryId));
    // Line names are unique; start with a placeholder the family renames.
    let name = "New line";
    for (let i = 2; (await db.select({ id: t.budgetLines.id }).from(t.budgetLines).where(eq(t.budgetLines.name, name))).length; i++) {
      name = `New line ${i}`;
    }
    await db.insert(t.budgetLines).values({ id: newId("b"), categoryId, name, details: "", estimate: 0, paid: 0, sort });
    return done();
  } catch (err) {
    return failed(err);
  }
}

/* ---------- Expenses ---------- */

const QuickAdd = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
  item: z.string().min(1, "Write what it was for").max(500),
  amount: z.number().finite().int("Use whole kyat").positive("Enter an amount"),
  budgetLineId: z.string().min(1).nullable(),
  addToPaid: z.boolean(),
});
export type QuickAddInput = z.infer<typeof QuickAdd>;

/** Adds an expense; if asked, adds the same amount to the budget line's paid, in one transaction. */
export async function addExpense(input: QuickAddInput): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  const p = QuickAdd.safeParse(input);
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Check the form." };
  const v = p.data;
  try {
    await ensureForeignKeys();
    const period = periodOf(v.date);
    const sort = await nextSort(t.expenses.sort, eq(t.expenses.period, period));
    await db.transaction(async (tx) => {
      await tx.insert(t.expenses).values({
        id: newId("e"),
        period,
        date: v.date,
        item: v.item,
        amount: v.amount,
        budgetLineId: v.budgetLineId,
        checked: false,
        sort,
      });
      if (v.addToPaid && v.budgetLineId) {
        const r = await tx
          .update(t.budgetLines)
          .set({ paid: sql`${t.budgetLines.paid} + ${v.amount}` })
          .where(eq(t.budgetLines.id, v.budgetLineId));
        if (r.rowsAffected === 0) throw new Error("FOREIGN KEY budget line missing");
      }
    });
    return done();
  } catch (err) {
    return failed(err);
  }
}

export async function addLoanTransfer(): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    const sort = await nextSort(t.loanTransfers.sort);
    await db.insert(t.loanTransfers).values({ id: newId("l"), date: todayISO(), fromWhom: "", amount: 0, intoAccount: "", sort });
    return done();
  } catch (err) {
    return failed(err);
  }
}

/* ---------- Materials ---------- */

export async function addMaterial(): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    const sort = await nextSort(t.materials.sort);
    await db.insert(t.materials).values({ id: newId("m"), name: "", date: todayISO(), status: "Unpaid", sort });
    return done();
  } catch (err) {
    return failed(err);
  }
}

/* ---------- Labour ---------- */

export async function addWorker(monthId: string): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    await ensureForeignKeys();
    const sort = await nextSort(t.labourEntries.sort, eq(t.labourEntries.monthId, monthId));
    await db.insert(t.labourEntries).values({ id: newId("w"), monthId, name: "", sort });
    return done();
  } catch (err) {
    return failed(err);
  }
}

/** Copies the last month's workers into the next month with days 0 and paid 0. */
export async function startNextLabourMonth(): Promise<ActionResult & { period?: string }> {
  if (!(await hasSession())) return DENIED;
  try {
    await ensureForeignKeys();
    const [last] = await db.select().from(t.labourMonths).orderBy(desc(t.labourMonths.period)).limit(1);
    const period = last ? nextPeriod(last.period) : currentPeriod();
    const workers = last
      ? await db.select().from(t.labourEntries).where(eq(t.labourEntries.monthId, last.id)).orderBy(t.labourEntries.sort)
      : [];
    const monthId = `lm-${period}`;
    await db.transaction(async (tx) => {
      await tx.insert(t.labourMonths).values({ id: monthId, period, mealsPaid: 0 });
      for (const [i, w] of workers.entries()) {
        await tx.insert(t.labourEntries).values({
          id: newId("w"),
          monthId,
          name: w.name,
          days: 0,
          dailyRate: w.dailyRate,
          paid: 0,
          mealAllowance: w.mealAllowance,
          sort: i,
        });
      }
    });
    return { ...done(), period };
  } catch (err) {
    return failed(err);
  }
}

/* ---------- Trips ---------- */

export async function addTrip(): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    const sort = await nextSort(t.trips.sort);
    await db.insert(t.trips).values({ id: newId("trip"), name: "New trip", place: "", who: "", status: "Pending", sort });
    return done();
  } catch (err) {
    return failed(err);
  }
}

export async function addTripLine(tripId: string): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    await ensureForeignKeys();
    const sort = await nextSort(t.tripLines.sort, eq(t.tripLines.tripId, tripId));
    await db.insert(t.tripLines).values({ id: newId("t"), tripId, name: "", currency: "MMK", price: 0, qty: 1, sort });
    return done();
  } catch (err) {
    return failed(err);
  }
}

const Rate = z.object({
  tripId: z.string().min(1),
  currency: z.enum(CURRENCIES).exclude(["MMK"]),
  value: z.number().finite().min(0, "Must be zero or more"),
});

/** Sets "K per 1 XXX" for one trip. */
export async function setTripRate(tripId: string, currency: string, value: unknown): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  const p = Rate.safeParse({ tripId, currency, value });
  if (!p.success) return { ok: false, error: p.error.issues[0]?.message ?? "Not a valid rate." };
  try {
    await ensureForeignKeys();
    const { tripId: id, currency: cur, value: v } = p.data;
    const existing = await db
      .select({ id: t.tripRates.id })
      .from(t.tripRates)
      .where(and(eq(t.tripRates.tripId, id), eq(t.tripRates.currency, cur)));
    if (existing.length) {
      await db.update(t.tripRates).set({ kyatPerUnit: v }).where(eq(t.tripRates.id, existing[0].id));
    } else {
      await db.insert(t.tripRates).values({ id: `${id}-${cur}`, tripId: id, currency: cur, kyatPerUnit: v });
    }
    return done();
  } catch (err) {
    return failed(err);
  }
}

/* ---------- Savings ---------- */

/** Adds the month after the last row, copying CDG salary, KoKo's saving and Expense; flags pending. */
export async function addSavingsMonth(): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    const [last] = await db.select().from(t.savingsMonths).orderBy(desc(t.savingsMonths.month)).limit(1);
    await db.insert(t.savingsMonths).values({
      id: newId("s"),
      month: last ? nextPeriod(last.month) : currentPeriod(),
      cdg: last?.cdg ?? 0,
      koko: last?.koko ?? 0,
      expense: last?.expense ?? 0,
    });
    return done();
  } catch (err) {
    return failed(err);
  }
}

export async function addHolding(): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    const sort = await nextSort(t.holdings.sort);
    await db.insert(t.holdings).values({ id: newId("a"), name: "", amount: 0, sort });
    return done();
  } catch (err) {
    return failed(err);
  }
}

/** Adds the month after the last rate note, copying its rates as a starting point. */
export async function addFxNote(): Promise<ActionResult> {
  if (!(await hasSession())) return DENIED;
  try {
    const [last] = await db.select().from(t.fxNotes).orderBy(desc(t.fxNotes.month)).limit(1);
    await db.insert(t.fxNotes).values({
      id: newId("r"),
      month: last ? nextPeriod(last.month) : currentPeriod(),
      sgdToMmk: last?.sgdToMmk ?? 0,
      thbToMmk: last?.thbToMmk ?? 0,
      thbPerSgd: last?.thbPerSgd ?? 0,
    });
    return done();
  } catch (err) {
    return failed(err);
  }
}
