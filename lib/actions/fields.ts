/**
 * Which fields each tracker table lets the family edit, and how each value is validated.
 * Shared by the server actions (which enforce it) and the client tables (which send it).
 * Calculated values never appear here: they are not stored.
 */
import { z } from "zod";
import { CURRENCIES, MATERIAL_STATUSES, TRIP_STATUSES } from "../db/schema";

const kyat = z.number().finite().int("Use whole kyat").min(0, "Must be zero or more");
const qty = z.number().finite().min(0, "Must be zero or more");
const text = z.string().max(500, "Too long");
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a full date");
const month = z.string().regex(/^\d{4}-\d{2}$/, "Use a month");

export const EDITABLE = {
  budgetLines: z.object({ name: text.min(1, "A line needs a name"), details: text, estimate: kyat, paid: kyat }),
  expenses: z.object({ date, item: text, amount: kyat, budgetLineId: z.string().min(1).nullable(), checked: z.boolean() }),
  loanTransfers: z.object({ date, fromWhom: text, amount: kyat, intoAccount: text }),
  materials: z.object({
    name: text,
    price: qty,
    unit: text,
    date: date.nullable(),
    qtyNeeded: qty,
    qtyBought: qty,
    totalCost: kyat,
    paid: kyat,
    status: z.enum(MATERIAL_STATUSES),
  }),
  labourMonths: z.object({ mealsPaid: kyat }),
  labourEntries: z.object({ name: text, days: qty, dailyRate: kyat, paid: kyat, mealAllowance: kyat }),
  trips: z.object({ name: text, place: text, who: text, status: z.enum(TRIP_STATUSES) }),
  tripLines: z.object({ name: text, currency: z.enum(CURRENCIES), price: qty, qty }),
  savingsMonths: z.object({
    cdg: kyat,
    tf: kyat,
    koko: kyat,
    expense: kyat,
    extraExpense: kyat,
    extraIn: kyat,
    cdgReceived: z.boolean(),
    classReceived: z.boolean(),
    kokoReceived: z.boolean(),
    interestReceived: z.boolean(),
  }),
  holdings: z.object({ name: text, amount: kyat }),
  fxNotes: z.object({ sgdToMmk: qty, thbToMmk: qty, thbPerSgd: qty }),
  settings: z.object({ openingBalance: kyat, repayPerMonth: kyat, loanCompareMonth: month }),
} as const;

export type EditableTable = keyof typeof EDITABLE;
export type EditableField<T extends EditableTable> = keyof z.infer<(typeof EDITABLE)[T]> & string;

/** Tables whose rows can be deleted from the tracker (settings and labour months cannot). */
export const DELETABLE = [
  "budgetLines",
  "expenses",
  "loanTransfers",
  "materials",
  "labourEntries",
  "trips",
  "tripLines",
  "savingsMonths",
  "holdings",
  "fxNotes",
] as const;
export type DeletableTable = (typeof DELETABLE)[number];

export type ActionResult = { ok: true } | { ok: false; error: string };

/** Validates one field. Returns the parsed value or an error message. */
export function parseField(table: string, field: string, value: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
  if (!(table in EDITABLE)) return { ok: false, error: "This table cannot be edited." };
  const shape = EDITABLE[table as EditableTable].shape as Record<string, z.ZodType>;
  const schema = shape[field];
  if (!schema) return { ok: false, error: "This field cannot be edited." };
  const r = schema.safeParse(value);
  return r.success ? { ok: true, value: r.data } : { ok: false, error: r.error.issues[0]?.message ?? "Not a valid value." };
}
