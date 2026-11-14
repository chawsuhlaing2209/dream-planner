/**
 * Computes the same figures as data/expected-totals.json from table rows, and compares them.
 * Used by `npm run verify:data`, by the seed script, and by the seed test.
 */
import { categoryTotals, homeTotals } from "./calc/budget";
import { monthSpend } from "./calc/expenses";
import { entryTotals, mealsPaid } from "./calc/labour";
import { loanMath } from "./calc/loan";
import { BRICK, CEMENT, REBAR, materialTotals, quantityOf } from "./calc/materials";
import { pointAtOrBefore, savingsSeries } from "./calc/savings";
import { ratesFor, tripTotals } from "./calc/trips";
import { sum } from "./calc/util";
import type { SeedRows } from "./seed/map";

type Json = number | string | boolean | null | Json[] | { [k: string]: Json };

/** Builds actual figures for every key present in `expected`. */
export function actualTotals(rows: SeedRows, expected: Record<string, Json>) {
  const s = rows.settings[0];
  const rooms = categoryTotals(rows.budgetCategories, rows.budgetLines);
  const home = homeTotals(rows.budgetLines);
  const spend = monthSpend(rows.expenses);
  const series = savingsSeries(s?.openingBalance ?? 0, rows.savingsMonths);
  const labour = entryTotals(rows.labourEntries);
  const mats = materialTotals(rows.materials);
  const exp = expected as Record<string, Record<string, Json>>;

  return {
    budget: {
      lines: rows.budgetLines.length,
      categories: rows.budgetCategories.length,
      estimate: home.estimate,
      paid: home.paid,
      left: home.left,
      paidPercent: home.percent,
      byRoom: Object.fromEntries(rooms.map((r) => [r.key, { estimate: r.estimate, paid: r.paid }])),
    },
    expenses: Object.fromEntries(
      Object.keys(exp.expenses ?? {}).map((p) => {
        const m = spend.find((x) => x.period === p);
        return [p, { rows: m?.rows ?? 0, total: m?.total ?? 0 }];
      }),
    ),
    loans: { rows: rows.loanTransfers.length, total: sum(rows.loanTransfers, (t) => t.amount) },
    materials: {
      rows: rows.materials.length,
      totalCost: mats.totalCost,
      paid: mats.paid,
      cementBags: quantityOf(rows.materials, CEMENT),
      bricks: quantityOf(rows.materials, BRICK),
      rebarTons: quantityOf(rows.materials, REBAR),
    },
    labour: {
      months: rows.labourMonths.length,
      entries: rows.labourEntries.length,
      wagesAllMonths: labour.wages,
      wagesPaid: labour.paid,
      mealsPaid: mealsPaid(rows.labourMonths),
    },
    trips: Object.fromEntries(
      rows.trips.map((t) => [
        t.id,
        tripTotals(
          rows.tripLines.filter((l) => l.tripId === t.id),
          ratesFor(t.id, rows.tripRates),
        ).kyat,
      ]),
    ),
    savings: {
      opening: s?.openingBalance ?? 0,
      months: rows.savingsMonths.length,
      runningTotal: Object.fromEntries(
        Object.keys((exp.savings?.runningTotal as Record<string, Json>) ?? {}).map((m) => [
          m,
          pointAtOrBefore(series, m)?.total ?? 0,
        ]),
      ),
    },
    holdings: { rows: rows.holdings.length, total: sum(rows.holdings, (h) => h.amount) },
    fxRates: { rows: rows.fxNotes.length },
    loanMath: {
      stillToBorrow: loanMath({
        transfers: rows.loanTransfers,
        homeLeft: home.left,
        series,
        compareMonth: s?.loanCompareMonth ?? "",
        repayPerMonth: s?.repayPerMonth ?? 0,
      }).stillToBorrow,
      repayPerMonth: s?.repayPerMonth ?? 0,
    },
  };
}

export type CheckRow = { key: string; expected: number; actual: number | undefined; ok: boolean };

/** Keys that are counts must match exactly; money gets 2 kyat; percent and tons exact. */
function isExact(key: string): boolean {
  return /(^|\.)(rows|lines|categories|months|entries|paidPercent|cementBags|bricks|rebarTons)$/.test(key);
}

function flatten(obj: Json, prefix = "", out: Record<string, Json> = {}): Record<string, Json> {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [k, v] of Object.entries(obj)) flatten(v, prefix ? `${prefix}.${k}` : k, out);
  } else out[prefix] = obj;
  return out;
}

export function compareTotals(expected: Record<string, Json>, actual: unknown, tolerance = 2): CheckRow[] {
  const e = flatten(expected as Json);
  const a = flatten(actual as Json);
  return Object.entries(e).map(([key, ev]) => {
    const exp = Number(ev);
    const raw = a[key];
    const act = typeof raw === "number" ? raw : undefined;
    const ok =
      act !== undefined && (isExact(key) ? act === exp : Math.abs(Math.round(act) - exp) <= tolerance);
    return { key, expected: exp, actual: act, ok };
  });
}

export function formatTable(rows: CheckRow[]): string {
  const fmt = (n: number | undefined) =>
    n === undefined ? "missing" : Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const w = Math.max(...rows.map((r) => r.key.length), 3);
  const head = `${"key".padEnd(w)}  ${"expected".padStart(14)}  ${"actual".padStart(14)}  result`;
  const body = rows.map(
    (r) => `${r.key.padEnd(w)}  ${fmt(r.expected).padStart(14)}  ${fmt(r.actual).padStart(14)}  ${r.ok ? "OK" : "DIFF"}`,
  );
  return [head, "-".repeat(head.length), ...body].join("\n");
}
