import { addBudgetLine } from "@/app/actions";
import { Page } from "@/components/Page";
import { ProgressBar } from "@/components/ProgressBar";
import { SumRow } from "@/components/SumRow";
import { AddButton } from "@/components/table/AddButton";
import { BudgetLinesTable } from "@/components/tracker/tables";
import styles from "@/components/tracker/Tracker.module.css";
import { categoryTotals, homeTotals } from "@/lib/calc/budget";
import { getAll } from "@/lib/data/all";
import { kyat, kyatM } from "@/lib/format";

export default async function HomeBudgetPage() {
  const rows = await getAll();
  const home = homeTotals(rows.budgetLines);
  const cats = categoryTotals(rows.budgetCategories, rows.budgetLines);
  return (
    <Page eyebrow="Home" title="Home budget" lede="Every budget line, room by room. Left to pay is the estimate minus what is paid.">
      <SumRow
        items={[
          { value: kyat(home.estimate), label: "Estimated total" },
          { value: kyat(home.paid), label: "Paid" },
          { value: kyat(home.left), label: "Left to pay", warn: home.left < 0 },
        ]}
      />
      {cats.length === 0 ? (
        <p className="muted">No budget categories yet. Load the seed data first.</p>
      ) : (
        <div className={styles.cats}>
          {cats.map((c) => (
            <details key={c.id} className={styles.cat}>
              <summary>
                <span className={styles.catName}>{c.name}</span>
                <span className={styles.catPct}>{Math.round(c.share * 100)}%</span>
                <ProgressBar share={c.share} className={styles.catBar} />
                <span className={styles.catMeta}>
                  {kyatM(c.paid)} paid · <span className={c.left < 0 ? styles.warn : undefined}>{kyatM(c.left)} left</span> · {c.lineCount}{" "}
                  {c.lineCount === 1 ? "line" : "lines"}
                </span>
              </summary>
              <div className={styles.inner}>
                <BudgetLinesTable caption={`${c.name} budget lines`} rows={rows.budgetLines.filter((l) => l.categoryId === c.id)} />
                <div className={styles.row}>
                  <AddButton label="Add a line" action={addBudgetLine.bind(null, c.id)} />
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </Page>
  );
}
