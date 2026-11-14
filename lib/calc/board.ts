import { categoryTotals, homeTotals, type CategoryTotals } from "./budget";
import { monthSpend, type MonthSpend } from "./expenses";
import { personDays } from "./labour";
import { loanMath, type LoanMath } from "./loan";
import { BRICK, CEMENT, REBAR, cementPriceChange, quantityOf } from "./materials";
import { pointAtOrBefore, savingsSeries, type SavingsPoint } from "./savings";
import { ratesFor, stampOf, statusCounts, topLines, tripTotals, type StampKind } from "./trips";
import type {
  BudgetLineRow,
  CategoryRow,
  Currency,
  ExpenseRow,
  LabourEntryRow,
  LabourMonthRow,
  LoanRow,
  MaterialRow,
  SavingsRow,
  TripLineRow,
  TripRateRow,
} from "./types";

export type BoardInput = {
  categories: CategoryRow[];
  lines: BudgetLineRow[];
  expenses: ExpenseRow[];
  transfers: LoanRow[];
  materials: MaterialRow[];
  labourMonths: LabourMonthRow[];
  labourEntries: LabourEntryRow[];
  trips: { id: string; name: string; place: string; who: string; status: string; sort: number }[];
  tripLines: TripLineRow[];
  tripRates: TripRateRow[];
  savings: SavingsRow[];
  openingBalance: number;
  repayPerMonth: number;
  loanCompareMonth: string;
};

export type Ticket = {
  id: string;
  name: string;
  place: string;
  who: string;
  stamp: { kind: StampKind; label: string };
  chips: string[];
  kyat: number;
  foreign: { currency: Currency; amount: number }[];
};

export type Board = {
  currentPeriod: string;
  home: ReturnType<typeof homeTotals>;
  rooms: CategoryTotals[];
  tripCounts: ReturnType<typeof statusCounts>;
  savings: { series: SavingsPoint[]; now?: SavingsPoint; end?: SavingsPoint; buildMonths: string[] };
  spend: MonthSpend[];
  loan: LoanMath & { compareMonth: string; repayPerMonth: number };
  walls: {
    cementBags: number;
    bricks: number;
    rebarTons: number;
    personDays: number;
    cement: ReturnType<typeof cementPriceChange>;
  };
  tickets: Ticket[];
};

/** Everything the board shows, from plain rows. `currentPeriod` is YYYY-MM, passed in. */
export function buildBoard(input: BoardInput, currentPeriod: string): Board {
  const rooms = categoryTotals(input.categories, input.lines);
  const home = homeTotals(input.lines);
  const series = savingsSeries(input.openingBalance, input.savings);
  const spend = monthSpend(input.expenses);

  const tickets: Ticket[] = [...input.trips]
    .sort((a, b) => a.sort - b.sort)
    .map((t) => {
      const lines = input.tripLines.filter((l) => l.tripId === t.id);
      const rates = ratesFor(t.id, input.tripRates);
      const totals = tripTotals(lines, rates);
      return {
        id: t.id,
        name: t.name,
        place: t.place,
        who: t.who,
        stamp: stampOf(t.status),
        chips: topLines(lines, rates).map((l) => l.name),
        kyat: totals.kyat,
        foreign: totals.foreignUsed
          .map((c) => ({ currency: c, amount: totals.byCurrency[c] ?? 0 }))
          .filter((f) => f.amount > 0),
      };
    });

  return {
    currentPeriod,
    home,
    rooms,
    tripCounts: statusCounts(input.trips),
    savings: {
      series,
      now: pointAtOrBefore(series, currentPeriod) ?? series[series.length - 1],
      end: series[series.length - 1],
      buildMonths: spend.map((s) => s.period),
    },
    spend,
    loan: {
      ...loanMath({
        transfers: input.transfers,
        homeLeft: home.left,
        series,
        compareMonth: input.loanCompareMonth,
        repayPerMonth: input.repayPerMonth,
      }),
      compareMonth: input.loanCompareMonth,
      repayPerMonth: input.repayPerMonth,
    },
    walls: {
      cementBags: quantityOf(input.materials, CEMENT),
      bricks: quantityOf(input.materials, BRICK),
      rebarTons: quantityOf(input.materials, REBAR),
      personDays: personDays(input.labourMonths, input.labourEntries, currentPeriod),
      cement: cementPriceChange(input.materials),
    },
    tickets,
  };
}
