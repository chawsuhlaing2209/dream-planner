// Plain row shapes the calc functions take. They match the Drizzle select types
// structurally, so DB rows can be passed straight in.

export type Currency = "MMK" | "THB" | "USD" | "SGD";

export type CategoryRow = {
  id: string;
  key: string;
  name: string;
  shortLabel: string;
  boardLabel: string;
  sort: number;
};
export type BudgetLineRow = { id: string; categoryId: string; estimate: number; paid: number };
export type ExpenseRow = { period: string; amount: number };
export type LoanRow = { amount: number };
export type MaterialRow = {
  name: string;
  price: number;
  date: string | null;
  qtyNeeded: number;
  totalCost: number;
  paid: number;
};
export type LabourMonthRow = { id: string; period: string; mealsPaid: number };
export type LabourEntryRow = { monthId: string; days: number; dailyRate: number; paid: number };
export type TripRow = { id: string; status: string };
export type TripLineRow = { tripId: string; name: string; currency: Currency; price: number; qty: number };
export type TripRateRow = { tripId: string; currency: Currency; kyatPerUnit: number };
export type SavingsRow = {
  month: string;
  cdg: number;
  tf: number;
  koko: number;
  expense: number;
  extraExpense: number;
  extraIn: number;
  cdgReceived: boolean;
};
