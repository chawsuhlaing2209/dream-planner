import { lineLeft } from "../calc/budget";
import { due, wage } from "../calc/labour";
import { materialLeft } from "../calc/materials";
import { savingsSeries } from "../calc/savings";
import { lineKyat, lineTotal, ratesFor } from "../calc/trips";
import type { AllRows } from "../db/load";
import { toCsv } from "./csv";

/** One CSV per tracker table. Calculated columns are included for reading, never stored. */
export const EXPORTS: Record<string, { label: string; build: (r: AllRows) => string }> = {
  budget: {
    label: "Home budget",
    build: (r) => {
      const cat = new Map(r.budgetCategories.map((c) => [c.id, c.name]));
      const order = new Map(r.budgetCategories.map((c) => [c.id, c.sort]));
      const lines = [...r.budgetLines].sort((a, b) => (order.get(a.categoryId) ?? 0) - (order.get(b.categoryId) ?? 0) || a.sort - b.sort);
      return toCsv(
        ["Category", "Line", "Details", "Estimate", "Paid", "Left"],
        lines.map((l) => [cat.get(l.categoryId), l.name, l.details, l.estimate, l.paid, lineLeft(l)]),
      );
    },
  },
  expenses: {
    label: "Expenses",
    build: (r) => {
      const line = new Map(r.budgetLines.map((l) => [l.id, l.name]));
      return toCsv(
        ["Month", "Date", "Item", "Amount", "Budget line", "Checked"],
        r.expenses.map((e) => [e.period, e.date, e.item, e.amount, e.budgetLineId ? line.get(e.budgetLineId) : "", e.checked]),
      );
    },
  },
  loans: {
    label: "Family loan",
    build: (r) => toCsv(["Date", "From", "Amount", "Into"], r.loanTransfers.map((l) => [l.date, l.fromWhom, l.amount, l.intoAccount])),
  },
  materials: {
    label: "Materials",
    build: (r) =>
      toCsv(
        ["Material", "Price", "Unit", "Date", "Qty needed", "Qty bought", "Total cost", "Paid", "Left", "Status"],
        r.materials.map((m) => [m.name, m.price, m.unit, m.date, m.qtyNeeded, m.qtyBought, m.totalCost, m.paid, materialLeft(m), m.status]),
      ),
  },
  labour: {
    label: "Labour",
    build: (r) => {
      const month = new Map(r.labourMonths.map((m) => [m.id, m]));
      const rows = [...r.labourEntries].sort(
        (a, b) => (month.get(a.monthId)?.period ?? "").localeCompare(month.get(b.monthId)?.period ?? "") || a.sort - b.sort,
      );
      return toCsv(
        ["Month", "Name", "Days", "Daily rate", "Wage", "Paid", "Due", "Meal allowance", "Meals paid that month"],
        rows.map((e) => [month.get(e.monthId)?.period, e.name, e.days, e.dailyRate, wage(e), e.paid, due(e), e.mealAllowance, month.get(e.monthId)?.mealsPaid]),
      );
    },
  },
  trips: {
    label: "Trips",
    build: (r) => {
      const out: (string | number | null)[][] = [];
      for (const t of r.trips) {
        const rates = ratesFor(t.id, r.tripRates);
        const lines = r.tripLines.filter((l) => l.tripId === t.id);
        if (lines.length === 0) out.push([t.name, t.place, t.who, t.status, "", "", null, null, null, null, null]);
        for (const l of lines) {
          const rate = l.currency === "MMK" ? 1 : (rates[l.currency] ?? 0);
          out.push([t.name, t.place, t.who, t.status, l.name, l.currency, l.price, l.qty, lineTotal(l), rate, lineKyat(l, rates)]);
        }
      }
      return toCsv(["Trip", "Where", "Who", "Status", "Line", "Currency", "Price", "Qty", "Total", "K per 1", "In kyat"], out);
    },
  },
  savings: {
    label: "Savings",
    build: (r) => {
      const series = savingsSeries(r.settings[0]?.openingBalance ?? 0, r.savingsMonths);
      const at = new Map(series.map((p) => [p.month, p]));
      return toCsv(
        ["Month", "CDG salary", "TF / Class", "KoKo's saving", "Expense", "Extra expense", "Extra in", "Net saving", "Total", "CDG in", "Class in", "KoKo in", "Interest in"],
        r.savingsMonths.map((s) => [
          s.month, s.cdg, s.tf, s.koko, s.expense, s.extraExpense, s.extraIn, at.get(s.month)?.net, at.get(s.month)?.total,
          s.cdgReceived, s.classReceived, s.kokoReceived, s.interestReceived,
        ]),
      );
    },
  },
  holdings: {
    label: "What I hold now",
    build: (r) => toCsv(["Place", "Amount"], r.holdings.map((h) => [h.name, h.amount])),
  },
  rates: {
    label: "Exchange rates",
    build: (r) => toCsv(["Month", "SGD to MMK", "THB to MMK", "THB per SGD"], r.fxNotes.map((f) => [f.month, f.sgdToMmk, f.thbToMmk, f.thbPerSgd])),
  },
};
