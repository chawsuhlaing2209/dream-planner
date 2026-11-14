import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * Dream Planner schema. Rules (see .claude/skills/dream-data):
 * - kyat amounts are INTEGER kyat; foreign prices and rates are REAL
 * - nothing that can be calculated is stored (left, wage, due, net, totals, percentages)
 * - `sort` keeps the sheet's row order
 */

const stamps = {
  createdAt: text("created_at").notNull().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(CURRENT_TIMESTAMP)`)
    .$onUpdate(() => sql`(CURRENT_TIMESTAMP)`),
};

export const ROOM_KEYS = [
  "plans",
  "labour",
  "structure",
  "roof",
  "doors",
  "finish",
  "living",
  "kitchen",
  "shrine",
  "garden",
  "smart",
  "bath",
  "reserve",
] as const;
export type RoomKey = (typeof ROOM_KEYS)[number];

export const budgetCategories = sqliteTable("budget_categories", {
  id: text("id").primaryKey(),
  key: text("key", { enum: ROOM_KEYS }).notNull().unique(),
  name: text("name").notNull(),
  shortLabel: text("short_label").notNull(),
  boardLabel: text("board_label").notNull(),
  sort: integer("sort").notNull(),
  ...stamps,
});

export const budgetLines = sqliteTable(
  "budget_lines",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id")
      .notNull()
      .references(() => budgetCategories.id, { onDelete: "cascade" }),
    name: text("name").notNull().unique(),
    details: text("details").notNull().default(""),
    link: text("link"),
    estimate: integer("estimate").notNull().default(0),
    paid: integer("paid").notNull().default(0),
    sort: integer("sort").notNull(),
    ...stamps,
  },
  (t) => [index("budget_lines_category_idx").on(t.categoryId)],
);

export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    period: text("period").notNull(),
    date: text("date").notNull(),
    item: text("item").notNull().default(""),
    amount: integer("amount").notNull().default(0),
    budgetLineId: text("budget_line_id").references(() => budgetLines.id, { onDelete: "set null" }),
    checked: integer("checked", { mode: "boolean" }).notNull().default(false),
    sort: integer("sort").notNull(),
    ...stamps,
  },
  (t) => [index("expenses_period_idx").on(t.period)],
);

export const loanTransfers = sqliteTable("loan_transfers", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  fromWhom: text("from_whom").notNull().default(""),
  amount: integer("amount").notNull().default(0),
  intoAccount: text("into_account").notNull().default(""),
  sort: integer("sort").notNull(),
  ...stamps,
});

export const MATERIAL_STATUSES = ["Done", "In Progress", "Unpaid"] as const;

export const materials = sqliteTable("materials", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  price: real("price").notNull().default(0),
  unit: text("unit").notNull().default(""),
  date: text("date"),
  qtyNeeded: real("qty_needed").notNull().default(0),
  qtyBought: real("qty_bought").notNull().default(0),
  totalCost: integer("total_cost").notNull().default(0),
  paid: integer("paid").notNull().default(0),
  status: text("status", { enum: MATERIAL_STATUSES }).notNull().default("Unpaid"),
  sort: integer("sort").notNull(),
  ...stamps,
});

export const labourMonths = sqliteTable("labour_months", {
  id: text("id").primaryKey(),
  period: text("period").notNull().unique(),
  mealsPaid: integer("meals_paid").notNull().default(0),
  ...stamps,
});

export const labourEntries = sqliteTable(
  "labour_entries",
  {
    id: text("id").primaryKey(),
    monthId: text("month_id")
      .notNull()
      .references(() => labourMonths.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    days: real("days").notNull().default(0),
    dailyRate: integer("daily_rate").notNull().default(0),
    paid: integer("paid").notNull().default(0),
    mealAllowance: integer("meal_allowance").notNull().default(0),
    sort: integer("sort").notNull(),
    ...stamps,
  },
  (t) => [index("labour_entries_month_idx").on(t.monthId)],
);

export const TRIP_STATUSES = ["", "Pending", "Completed"] as const;
export const CURRENCIES = ["MMK", "THB", "USD", "SGD"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const trips = sqliteTable("trips", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  place: text("place").notNull().default(""),
  who: text("who").notNull().default(""),
  status: text("status", { enum: TRIP_STATUSES }).notNull().default(""),
  sort: integer("sort").notNull(),
  ...stamps,
});

export const tripLines = sqliteTable(
  "trip_lines",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    currency: text("currency", { enum: CURRENCIES }).notNull().default("MMK"),
    price: real("price").notNull().default(0),
    qty: real("qty").notNull().default(0),
    sort: integer("sort").notNull(),
    ...stamps,
  },
  (t) => [index("trip_lines_trip_idx").on(t.tripId)],
);

export const tripRates = sqliteTable(
  "trip_rates",
  {
    id: text("id").primaryKey(),
    tripId: text("trip_id")
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    currency: text("currency", { enum: CURRENCIES }).notNull(),
    kyatPerUnit: real("kyat_per_unit").notNull().default(0),
    ...stamps,
  },
  (t) => [uniqueIndex("trip_rates_trip_currency_uq").on(t.tripId, t.currency)],
);

export const savingsMonths = sqliteTable("savings_months", {
  id: text("id").primaryKey(),
  month: text("month").notNull().unique(),
  cdg: integer("cdg").notNull().default(0),
  tf: integer("tf").notNull().default(0),
  koko: integer("koko").notNull().default(0),
  expense: integer("expense").notNull().default(0),
  extraExpense: integer("extra_expense").notNull().default(0),
  extraIn: integer("extra_in").notNull().default(0),
  cdgReceived: integer("cdg_received", { mode: "boolean" }).notNull().default(false),
  classReceived: integer("class_received", { mode: "boolean" }).notNull().default(false),
  kokoReceived: integer("koko_received", { mode: "boolean" }).notNull().default(false),
  interestReceived: integer("interest_received", { mode: "boolean" }).notNull().default(false),
  ...stamps,
});

export const holdings = sqliteTable("holdings", {
  id: text("id").primaryKey(),
  name: text("name").notNull().default(""),
  amount: integer("amount").notNull().default(0),
  sort: integer("sort").notNull(),
  ...stamps,
});

export const fxNotes = sqliteTable("fx_notes", {
  id: text("id").primaryKey(),
  month: text("month").notNull().unique(),
  sgdToMmk: real("sgd_to_mmk").notNull().default(0),
  thbToMmk: real("thb_to_mmk").notNull().default(0),
  thbPerSgd: real("thb_per_sgd").notNull().default(0),
  ...stamps,
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  openingBalance: integer("opening_balance").notNull().default(0),
  repayPerMonth: integer("repay_per_month").notNull().default(0),
  loanCompareMonth: text("loan_compare_month").notNull(),
  ...stamps,
});
export const SETTINGS_ID = "settings";

export const ALL_TABLES_DELETE_ORDER = [
  expenses,
  budgetLines,
  budgetCategories,
  loanTransfers,
  materials,
  labourEntries,
  labourMonths,
  tripLines,
  tripRates,
  trips,
  savingsMonths,
  holdings,
  fxNotes,
  settings,
] as const;
