import { addFxNote, addHolding, addSavingsMonth, updateField } from "@/app/actions";
import { SavingsChart, SavingsLegend } from "@/components/board/SavingsChart";
import { Card } from "@/components/Card";
import { Page } from "@/components/Page";
import { SectionHead } from "@/components/SectionHead";
import { AddButton } from "@/components/table/AddButton";
import { Field } from "@/components/table/Field";
import { FxTable, HoldingsTable, SavingsTable } from "@/components/tracker/tables";
import styles from "@/components/tracker/Tracker.module.css";
import { monthSpend } from "@/lib/calc/expenses";
import { savingsSeries } from "@/lib/calc/savings";
import { getAll } from "@/lib/data/all";
import { SETTINGS_ID } from "@/lib/db/schema";

export default async function SavingsPage() {
  const rows = await getAll();
  const opening = rows.settings[0]?.openingBalance ?? 0;
  const series = savingsSeries(opening, rows.savingsMonths);
  return (
    <Page
      eyebrow="Savings"
      title="Savings"
      lede="Each month: income in, living costs and extra spending out. The running total carries forward."
    >
      <Card>
        <SavingsChart series={series} buildMonths={monthSpend(rows.expenses).map((s) => s.period)} />
        <SavingsLegend />
      </Card>
      <section className={styles.section}>
        {rows.settings[0] ? (
          <div className={styles.row}>
            <Field
              label="Starting balance before the first month (K)"
              type="number"
              integer
              value={opening}
              save={updateField.bind(null, "settings", SETTINGS_ID, "openingBalance")}
            />
          </div>
        ) : null}
        <SavingsTable rows={rows.savingsMonths} opening={opening} />
        <div className={styles.row}>
          <AddButton label="Add the next month" action={addSavingsMonth} />
          <span className={styles.note}>Copies CDG salary, KoKo&apos;s saving and Expense from the last month. Ticks start as pending.</span>
        </div>
      </section>
      <section className={styles.section}>
        <SectionHead title="What I hold now">Where the money sits today.</SectionHead>
        <HoldingsTable rows={rows.holdings} />
        <div className={styles.row}>
          <AddButton label="Add a place" action={addHolding} />
        </div>
      </section>
      <section className={styles.section}>
        <SectionHead title="Exchange rates">Monthly rate notes. Trips use their own rates.</SectionHead>
        <FxTable rows={rows.fxNotes} />
        <div className={styles.row}>
          <AddButton label="Add the next month" action={addFxNote} />
        </div>
      </section>
    </Page>
  );
}
