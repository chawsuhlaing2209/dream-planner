import type { MonthSpend } from "@/lib/calc/expenses";
import { kyatM } from "@/lib/format";
import { monthLong, monthShort } from "@/lib/time";
import { niceMax } from "@/lib/chart";
import styles from "./Board.module.css";


export function MonthBars({ spend, currentPeriod }: { spend: MonthSpend[]; currentPeriod: string }) {
  if (spend.length === 0) return <p className="muted">No expenses yet. Add one in the Expenses tab.</p>;
  const max = niceMax(Math.max(1, ...spend.map((s) => s.total)));
  const label = "Build spending by month: " + spend.map((s) => `${monthLong(s.period)} ${kyatM(s.total)}`).join(", ");
  return (
    <div className={styles.months} role="img" aria-label={label}>
      {spend.map((s) => (
        <div key={s.period} className={`${styles.month} ${s.period === currentPeriod ? styles.now : ""}`}>
          <b className="num">{(s.total / 1e6).toFixed(1)}</b>
          <i style={{ height: `${((s.total / max) * 100).toFixed(1)}%` }} />
          <span>{monthShort(s.period)}</span>
        </div>
      ))}
    </div>
  );
}
