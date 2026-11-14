import { CsvLinks } from "@/components/CsvLinks";
import { addWorker, startNextLabourMonth, updateField } from "@/app/actions";
import { MonthPills } from "@/components/MonthPills";
import { Page } from "@/components/Page";
import { SumRow } from "@/components/SumRow";
import { AddButton } from "@/components/table/AddButton";
import { Field } from "@/components/table/Field";
import { LabourTable } from "@/components/tracker/tables";
import styles from "@/components/tracker/Tracker.module.css";
import { entryTotals, mealsPaid } from "@/lib/calc/labour";
import { getAll } from "@/lib/data/all";
import { kyat } from "@/lib/format";
import { currentPeriod, monthLong } from "@/lib/time";

export default async function LabourPage({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const [{ m }, rows] = await Promise.all([searchParams, getAll()]);
  const months = rows.labourMonths;
  const now = currentPeriod();
  const month =
    months.find((x) => x.period === m) ?? months.find((x) => x.period === now) ?? months[months.length - 1];
  const all = entryTotals(rows.labourEntries);
  const entries = month ? rows.labourEntries.filter((e) => e.monthId === month.id) : [];
  return (
    <Page eyebrow="Home" title="Labour" lede="Workers per month. Wage is days times the daily rate; due is wage minus paid.">
      <CsvLinks tables={[{ key: "labour", label: "labour" }]} />
      <SumRow
        items={[
          { value: kyat(all.wages), label: "Wages, all months" },
          { value: kyat(all.paid), label: "Wages paid" },
          { value: kyat(mealsPaid(months)), label: "Meals paid" },
        ]}
      />
      <section className={styles.section}>
        <MonthPills
          basePath="/labour"
          label="Labour months"
          current={month?.period}
          pills={months.map((x) => ({ id: x.period, label: monthLong(x.period) }))}
        />
        {month ? (
          <>
            <LabourTable key={month.id} caption={`Workers in ${monthLong(month.period)}`} rows={entries} />
            <div className={styles.row}>
              <AddButton label="Add a worker" action={addWorker.bind(null, month.id)} />
              <Field
                label="Meals paid this month (K)"
                type="number"
                integer
                value={month.mealsPaid}
                save={updateField.bind(null, "labourMonths", month.id, "mealsPaid")}
              />
            </div>
          </>
        ) : (
          <p className="muted">No labour months yet. Start the first one below.</p>
        )}
        <div className={styles.row}>
          <AddButton label="Start next month" action={startNextLabourMonth} />
          <span className={styles.note}>Copies the last month&apos;s workers with days and paid set to 0.</span>
        </div>
      </section>
    </Page>
  );
}
