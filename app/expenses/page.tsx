import { CsvLinks } from "@/components/CsvLinks";
import { addLoanTransfer, updateField } from "@/app/actions";
import { MonthPills } from "@/components/MonthPills";
import { Page } from "@/components/Page";
import { SectionHead } from "@/components/SectionHead";
import { SumRow } from "@/components/SumRow";
import { AddButton } from "@/components/table/AddButton";
import { Field } from "@/components/table/Field";
import { QuickAdd } from "@/components/tracker/QuickAdd";
import { ExpensesTable, LoanTable } from "@/components/tracker/tables";
import styles from "@/components/tracker/Tracker.module.css";
import { homeTotals } from "@/lib/calc/budget";
import { monthSpend } from "@/lib/calc/expenses";
import { loanMath } from "@/lib/calc/loan";
import { savingsSeries } from "@/lib/calc/savings";
import { getAll } from "@/lib/data/all";
import { budgetLineOptions } from "@/lib/data/options";
import { SETTINGS_ID } from "@/lib/db/schema";
import { kyat, kyatM } from "@/lib/format";
import { monthLong, todayISO } from "@/lib/time";

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const [{ m }, rows] = await Promise.all([searchParams, getAll()]);
  const months = monthSpend(rows.expenses);
  const period = months.some((x) => x.period === m) ? m! : months[months.length - 1]?.period;
  const lineOptions = budgetLineOptions(rows.budgetCategories, rows.budgetLines);
  const s = rows.settings[0];
  const series = savingsSeries(s?.openingBalance ?? 0, rows.savingsMonths);
  const loan = loanMath({
    transfers: rows.loanTransfers,
    homeLeft: homeTotals(rows.budgetLines).left,
    series,
    compareMonth: s?.loanCompareMonth ?? "",
    repayPerMonth: s?.repayPerMonth ?? 0,
  });

  return (
    <Page eyebrow="Home" title="Expenses" lede="Spending on the build, month by month. Add as you go; the board follows.">
      <CsvLinks tables={[{ key: "expenses", label: "expenses" }, { key: "loans", label: "family loan" }]} />
      <QuickAdd today={todayISO()} lineOptions={lineOptions} />

      <section className={styles.section}>
        <MonthPills
          basePath="/expenses"
          label="Expense months"
          current={period}
          pills={months.map((x) => ({ id: x.period, label: `${monthLong(x.period)} · ${kyatM(x.total)}` }))}
        />
        {period ? (
          <ExpensesTable
            key={period}
            caption={`Expenses in ${monthLong(period)}`}
            rows={rows.expenses.filter((e) => e.period === period)}
            lineOptions={lineOptions}
          />
        ) : (
          <p className="muted">No expenses yet. Use the form above to add the first one.</p>
        )}
        <p className={styles.note}>Editing or deleting an expense here does not change the Paid amount on its budget line.</p>
      </section>

      <section className={styles.section}>
        <SectionHead title="Family loan">Money borrowed for the build.</SectionHead>
        <SumRow
          items={[
            { value: kyat(loan.borrowed), label: "Borrowed so far" },
            { value: kyat(loan.stillToBorrow), label: "Still to borrow" },
            { value: `${loan.months.toFixed(1)} months`, label: "To repay the total" },
          ]}
        />
        <LoanTable rows={rows.loanTransfers} />
        <div className={styles.row}>
          <AddButton label="Add a transfer" action={addLoanTransfer} />
        </div>
        {s ? (
          <div className={styles.row}>
            <Field
              label="Repay per month (K)"
              type="number"
              integer
              value={s.repayPerMonth}
              save={updateField.bind(null, "settings", SETTINGS_ID, "repayPerMonth")}
            />
            <Field
              label="Compare against savings in"
              type="select"
              value={s.loanCompareMonth}
              options={rows.savingsMonths.map((x) => ({ value: x.month, label: monthLong(x.month) }))}
              save={updateField.bind(null, "settings", SETTINGS_ID, "loanCompareMonth")}
            />
          </div>
        ) : null}
      </section>
    </Page>
  );
}
