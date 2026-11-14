"use client";

/** Column setups for each tracker table. Calculated columns use lib/calc so numbers match the board. */
import { lineLeft } from "@/lib/calc/budget";
import { due, wage } from "@/lib/calc/labour";
import { materialLeft, suggestedTotal } from "@/lib/calc/materials";
import { savingsSeries } from "@/lib/calc/savings";
import { lineKyat, lineTotal, type Rates } from "@/lib/calc/trips";
import type { Currency } from "@/lib/calc/types";
import { CURRENCIES, MATERIAL_STATUSES } from "@/lib/db/schema";
import { decimal, plain } from "@/lib/format";
import { monthLong } from "@/lib/time";
import type { Option } from "../table/Cell";
import { EditableTable } from "../table/EditableTable";

const opts = (xs: readonly string[]): Option[] => xs.map((x) => ({ value: x, label: x }));

export type BudgetLine = { id: string; name: string; details: string; estimate: number; paid: number };
export function BudgetLinesTable({ rows, caption }: { rows: BudgetLine[]; caption: string }) {
  return (
    <EditableTable
      table="budgetLines"
      rows={rows}
      caption={caption}
      empty="No lines in this category yet. Add one below."
      columns={[
        { key: "name", label: "Line", type: "text", width: "wide" },
        { key: "details", label: "Details", type: "text", width: "wide" },
        { key: "estimate", label: "Estimate", type: "number", integer: true, sum: true },
        { key: "paid", label: "Paid", type: "number", integer: true, sum: true },
        { label: "Left", type: "calc", calc: (r) => lineLeft(r), format: plain, flagNegative: true, sum: true },
      ]}
    />
  );
}

export type Expense = { id: string; date: string; item: string; amount: number; budgetLineId: string | null; checked: boolean };
export function ExpensesTable({ rows, lineOptions, caption }: { rows: Expense[]; lineOptions: Option[]; caption: string }) {
  return (
    <EditableTable
      table="expenses"
      rows={rows}
      caption={caption}
      empty="No expenses in this month yet. Use the form above."
      columns={[
        { key: "date", label: "Date", type: "date" },
        { key: "item", label: "Item", type: "text", width: "wide" },
        { key: "amount", label: "Amount", type: "number", integer: true, sum: true },
        { key: "budgetLineId", label: "Budget line", type: "select", options: lineOptions, nullable: true },
        { key: "checked", label: "Checked", type: "checkbox" },
      ]}
    />
  );
}

export type LoanTransfer = { id: string; date: string; fromWhom: string; amount: number; intoAccount: string };
export function LoanTable({ rows }: { rows: LoanTransfer[] }) {
  return (
    <EditableTable
      table="loanTransfers"
      rows={rows}
      caption="Family loan transfers"
      empty="No money borrowed yet."
      columns={[
        { key: "date", label: "Date", type: "date" },
        { key: "fromWhom", label: "From", type: "text" },
        { key: "amount", label: "Amount", type: "number", integer: true, sum: true },
        { key: "intoAccount", label: "Into", type: "text" },
      ]}
    />
  );
}

export type Material = {
  id: string;
  name: string;
  price: number;
  unit: string;
  date: string | null;
  qtyNeeded: number;
  qtyBought: number;
  totalCost: number;
  paid: number;
  status: (typeof MATERIAL_STATUSES)[number];
};
export function MaterialsTable({ rows }: { rows: Material[] }) {
  return (
    <EditableTable
      table="materials"
      rows={rows}
      caption="Materials"
      empty="No purchases yet. Add one above."
      derive={(row, key, value) =>
        key === "price"
          ? { totalCost: suggestedTotal(Number(value), row.qtyNeeded) }
          : key === "qtyNeeded"
            ? { totalCost: suggestedTotal(row.price, Number(value)) }
            : {}
      }
      columns={[
        { key: "name", label: "Material", type: "text", width: "wide" },
        { key: "price", label: "Price", type: "number" },
        { key: "unit", label: "Unit", type: "text", width: "narrow" },
        { key: "date", label: "Date", type: "date", nullable: true },
        { key: "qtyNeeded", label: "Qty needed", type: "number", width: "narrow" },
        { key: "qtyBought", label: "Qty bought", type: "number", width: "narrow" },
        { key: "totalCost", label: "Total cost", type: "number", integer: true, sum: true },
        { key: "paid", label: "Paid", type: "number", integer: true, sum: true },
        { label: "Left", type: "calc", calc: (r) => materialLeft(r), format: plain, flagNegative: true, sum: true },
        { key: "status", label: "Status", type: "select", options: opts(MATERIAL_STATUSES) },
      ]}
    />
  );
}

export type Worker = { id: string; name: string; days: number; dailyRate: number; paid: number; mealAllowance: number };
export function LabourTable({ rows, caption }: { rows: Worker[]; caption: string }) {
  return (
    <EditableTable
      table="labourEntries"
      rows={rows}
      caption={caption}
      empty="No workers this month. Add one below."
      columns={[
        { key: "name", label: "Name", type: "text", width: "wide" },
        { key: "days", label: "Days", type: "number", width: "narrow", sum: true },
        { key: "dailyRate", label: "Daily rate", type: "number", integer: true },
        { label: "Wage", type: "calc", calc: (r) => wage(r), format: plain, sum: true },
        { key: "paid", label: "Paid", type: "number", integer: true, sum: true },
        { label: "Due", type: "calc", calc: (r) => due(r), format: plain, sum: true },
        { key: "mealAllowance", label: "Meal allowance", type: "number", integer: true, sum: true },
      ]}
    />
  );
}

export type TripLine = { id: string; name: string; currency: Currency; price: number; qty: number };
export function TripLinesTable({ rows, rates, caption }: { rows: TripLine[]; rates: Rates; caption: string }) {
  return (
    <EditableTable
      table="tripLines"
      rows={rows}
      caption={caption}
      empty="No cost lines yet. Add one below."
      columns={[
        { key: "name", label: "Line", type: "text", width: "wide" },
        { key: "currency", label: "Currency", type: "select", options: opts(CURRENCIES) },
        { key: "price", label: "Price", type: "number" },
        { key: "qty", label: "Qty", type: "number", width: "narrow" },
        { label: "Total", type: "calc", calc: (r) => lineTotal(r), format: decimal },
        { label: "In kyat", type: "calc", calc: (r) => lineKyat(r, rates), format: plain, sum: true },
      ]}
    />
  );
}

export type SavingsMonth = {
  id: string;
  month: string;
  cdg: number;
  tf: number;
  koko: number;
  expense: number;
  extraExpense: number;
  extraIn: number;
  cdgReceived: boolean;
  classReceived: boolean;
  kokoReceived: boolean;
  interestReceived: boolean;
};
export function SavingsTable({ rows, opening }: { rows: SavingsMonth[]; opening: number }) {
  const point = (r: SavingsMonth, all: SavingsMonth[]) => savingsSeries(opening, all).find((p) => p.month === r.month);
  return (
    <EditableTable
      table="savingsMonths"
      rows={rows}
      caption="Savings by month"
      empty="No months yet. Add the first one below."
      columns={[
        { label: "Month", type: "calc", calc: (r) => monthLong(r.month), right: false },
        { key: "cdg", label: "CDG salary", type: "number", integer: true },
        { key: "tf", label: "TF / Class", type: "number", integer: true },
        { key: "koko", label: "KoKo's saving", type: "number", integer: true },
        { key: "expense", label: "Expense", type: "number", integer: true },
        { key: "extraExpense", label: "Extra expense", type: "number", integer: true },
        { key: "extraIn", label: "Extra in", type: "number", integer: true },
        { label: "Net saving", type: "calc", calc: (r, _i, all) => point(r, all)?.net ?? 0, format: plain, flagNegative: true },
        { label: "Total", type: "calc", calc: (r, _i, all) => point(r, all)?.total ?? 0, format: plain, flagNegative: true },
        { key: "cdgReceived", label: "CDG in", type: "checkbox" },
        { key: "classReceived", label: "Class in", type: "checkbox" },
        { key: "kokoReceived", label: "KoKo in", type: "checkbox" },
        { key: "interestReceived", label: "Interest in", type: "checkbox" },
      ]}
    />
  );
}

export type Holding = { id: string; name: string; amount: number };
export function HoldingsTable({ rows }: { rows: Holding[] }) {
  return (
    <EditableTable
      table="holdings"
      rows={rows}
      caption="What I hold now"
      empty="Nothing listed yet."
      columns={[
        { key: "name", label: "Place", type: "text", width: "wide" },
        { key: "amount", label: "Amount", type: "number", integer: true, sum: true },
      ]}
    />
  );
}

export type FxNote = { id: string; month: string; sgdToMmk: number; thbToMmk: number; thbPerSgd: number };
export function FxTable({ rows }: { rows: FxNote[] }) {
  return (
    <EditableTable
      table="fxNotes"
      rows={rows}
      caption="Exchange rate notes"
      empty="No rate notes yet."
      columns={[
        { label: "Month", type: "calc", calc: (r) => monthLong(r.month), right: false },
        { key: "sgdToMmk", label: "SGD to MMK", type: "number" },
        { key: "thbToMmk", label: "THB to MMK", type: "number" },
        { key: "thbPerSgd", label: "THB per SGD", type: "number" },
      ]}
    />
  );
}
