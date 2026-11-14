/**
 * Maps data/seed.json (collection -> document id -> body) into table rows.
 * Pure: no database access, so tests can run it directly.
 * Rules: keep seed ids, keep array order in `sort`, round kyat to whole numbers,
 * resolve expense `cat` names to budget line ids and fail loudly if one does not resolve.
 */
import * as t from "../db/schema";
import { CURRENCIES, MATERIAL_STATUSES, ROOM_KEYS, SETTINGS_ID, TRIP_STATUSES } from "../db/schema";
import type { Currency } from "../calc/types";

type Obj = Record<string, unknown>;

const kyat = (v: unknown): number => Math.round(Number(v) || 0);
const realNum = (v: unknown): number => Number(v) || 0;
const str = (v: unknown): string => (v == null ? "" : String(v));

function asObj(v: unknown, where: string): Obj {
  if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error(`Seed: expected an object at ${where}`);
  return v as Obj;
}
function asArr(v: unknown, where: string): Obj[] {
  if (!Array.isArray(v)) throw new Error(`Seed: expected a list at ${where}`);
  return v as Obj[];
}
function oneOf<T extends string>(v: unknown, allowed: readonly T[], where: string): T {
  const s = str(v);
  if (!(allowed as readonly string[]).includes(s)) throw new Error(`Seed: "${s}" is not allowed at ${where}`);
  return s as T;
}

export function mapSeed(seed: unknown): SeedRows {
  const root = asObj(seed, "root");

  // Budget
  const budget = asObj(root.budget, "budget");
  const budgetCategories: SeedRows["budgetCategories"] = [];
  const budgetLines: SeedRows["budgetLines"] = [];
  for (const [key, raw] of Object.entries(budget)) {
    const c = asObj(raw, `budget.${key}`);
    const roomKey = oneOf(key, ROOM_KEYS, `budget.${key}`);
    budgetCategories.push({
      id: roomKey,
      key: roomKey,
      name: str(c.name),
      shortLabel: str(c.short),
      boardLabel: str(c.full),
      sort: Number(c.order),
    });
    asArr(c.items, `budget.${key}.items`).forEach((it, i) => {
      budgetLines.push({
        id: str(it.id),
        categoryId: roomKey,
        name: str(it.name),
        details: str(it.details),
        link: it.link ? str(it.link) : null,
        estimate: kyat(it.est),
        paid: kyat(it.paid),
        sort: i,
      });
    });
  }
  const lineIdByName = new Map<string, string>();
  for (const l of budgetLines) {
    if (lineIdByName.has(l.name)) throw new Error(`Seed: budget line name "${l.name}" is duplicated`);
    lineIdByName.set(l.name, l.id);
  }

  // Expenses
  const expenses: SeedRows["expenses"] = [];
  for (const [period, raw] of Object.entries(asObj(root.expenses, "expenses"))) {
    asArr(asObj(raw, `expenses.${period}`).items, `expenses.${period}.items`).forEach((it, i) => {
      const cat = str(it.cat);
      let budgetLineId: string | null = null;
      if (cat !== "") {
        const id = lineIdByName.get(cat);
        if (!id) throw new Error(`Seed: expense ${str(it.id)} names budget line "${cat}", which does not exist`);
        budgetLineId = id;
      }
      expenses.push({
        id: str(it.id),
        period,
        date: str(it.date),
        item: str(it.item),
        amount: kyat(it.amount),
        budgetLineId,
        checked: Boolean(it.checked),
        sort: i,
      });
    });
  }

  // Family loan
  const loanTransfers = asArr(asObj(asObj(root.loans, "loans").all, "loans.all").items, "loans.all.items").map(
    (it, i) => ({
      id: str(it.id),
      date: str(it.date),
      fromWhom: str(it.from),
      amount: kyat(it.amount),
      intoAccount: str(it.via),
      sort: i,
    }),
  );

  // Materials
  const materials = asArr(
    asObj(asObj(root.materials, "materials").all, "materials.all").items,
    "materials.all.items",
  ).map((it, i) => ({
    id: str(it.id),
    name: str(it.name),
    price: realNum(it.rate),
    unit: str(it.unit),
    date: it.date ? str(it.date) : null,
    qtyNeeded: realNum(it.qty),
    qtyBought: realNum(it.bought),
    totalCost: kyat(it.total),
    paid: kyat(it.paid),
    status: oneOf(it.status, MATERIAL_STATUSES, `materials ${str(it.id)}.status`),
    sort: i,
  }));

  // Labour
  const labourMonths: SeedRows["labourMonths"] = [];
  const labourEntries: SeedRows["labourEntries"] = [];
  for (const [period, raw] of Object.entries(asObj(root.labour, "labour"))) {
    const m = asObj(raw, `labour.${period}`);
    const monthId = `lm-${period}`;
    labourMonths.push({ id: monthId, period, mealsPaid: kyat(m.meals) });
    asArr(m.workers, `labour.${period}.workers`).forEach((w, i) => {
      labourEntries.push({
        id: str(w.id),
        monthId,
        name: str(w.name),
        days: realNum(w.days),
        dailyRate: kyat(w.rate),
        paid: kyat(w.paid),
        mealAllowance: kyat(w.meal),
        sort: i,
      });
    });
  }

  // Trips
  const trips: SeedRows["trips"] = [];
  const tripLines: SeedRows["tripLines"] = [];
  const tripRates: SeedRows["tripRates"] = [];
  for (const [id, raw] of Object.entries(asObj(root.trips, "trips"))) {
    const t = asObj(raw, `trips.${id}`);
    trips.push({
      id,
      name: str(t.name),
      place: str(t.place),
      who: str(t.pax),
      status: oneOf(t.status, TRIP_STATUSES, `trips.${id}.status`),
      sort: Number(t.order),
    });
    for (const [cur, rate] of Object.entries(asObj(t.rates ?? {}, `trips.${id}.rates`))) {
      tripRates.push({
        id: `${id}-${cur}`,
        tripId: id,
        currency: oneOf(cur, CURRENCIES, `trips.${id}.rates`) as Currency,
        kyatPerUnit: realNum(rate),
      });
    }
    asArr(t.lines, `trips.${id}.lines`).forEach((l, i) => {
      tripLines.push({
        id: str(l.id),
        tripId: id,
        name: str(l.name),
        currency: oneOf(l.cur, CURRENCIES, `trip line ${str(l.id)}`) as Currency,
        price: realNum(l.price),
        qty: realNum(l.qty),
        sort: i,
      });
    });
  }

  // Savings
  const sav = asObj(asObj(root.savings, "savings").all, "savings.all");
  const received = (v: unknown) => str(v) === "received";
  const savingsMonths = asArr(sav.rows, "savings.all.rows").map((r) => ({
    id: str(r.id),
    month: str(r.month),
    cdg: kyat(r.cdg),
    tf: kyat(r.tf),
    koko: kyat(r.koko),
    expense: kyat(r.expense),
    extraExpense: kyat(r.extraExp),
    extraIn: kyat(r.extra),
    cdgReceived: received(r.sCdg),
    classReceived: received(r.sTf),
    kokoReceived: received(r.sKoko),
    interestReceived: received(r.sInt),
  }));

  const holdings = asArr(asObj(asObj(root.assets, "assets").all, "assets.all").items, "assets.all.items").map(
    (it, i) => ({ id: str(it.id), name: str(it.name), amount: kyat(it.amount), sort: i }),
  );

  const fxNotes = asArr(asObj(asObj(root.rates, "rates").all, "rates.all").rows, "rates.all.rows").map((r) => ({
    id: str(r.id),
    month: str(r.month),
    sgdToMmk: realNum(r.sgd),
    thbToMmk: realNum(r.thb),
    thbPerSgd: realNum(r.thbPerSgd),
  }));

  const dp = asObj(asObj(root.dp, "dp").settings, "dp.settings");
  const settings = [
    {
      id: SETTINGS_ID,
      openingBalance: kyat(sav.opening),
      repayPerMonth: kyat(dp.repayPerMonth),
      loanCompareMonth: str(dp.loanTargetMonth),
    },
  ];

  return {
    budgetCategories,
    budgetLines,
    expenses,
    loanTransfers,
    materials,
    labourMonths,
    labourEntries,
    trips,
    tripLines,
    tripRates,
    savingsMonths,
    holdings,
    fxNotes,
    settings,
  };
}

type Row<T extends { $inferSelect: object }> = Omit<T["$inferSelect"], "createdAt" | "updatedAt">[];

/** Rows for every table without timestamps. Rows read back from the database fit this shape too. */
export type SeedRows = {
  budgetCategories: Row<typeof t.budgetCategories>;
  budgetLines: Row<typeof t.budgetLines>;
  expenses: Row<typeof t.expenses>;
  loanTransfers: Row<typeof t.loanTransfers>;
  materials: Row<typeof t.materials>;
  labourMonths: Row<typeof t.labourMonths>;
  labourEntries: Row<typeof t.labourEntries>;
  trips: Row<typeof t.trips>;
  tripLines: Row<typeof t.tripLines>;
  tripRates: Row<typeof t.tripRates>;
  savingsMonths: Row<typeof t.savingsMonths>;
  holdings: Row<typeof t.holdings>;
  fxNotes: Row<typeof t.fxNotes>;
  settings: Row<typeof t.settings>;
};
