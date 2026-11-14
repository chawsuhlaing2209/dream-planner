import { Card } from "@/components/Card";
import type { Board } from "@/lib/calc/board";
import { kyatM } from "@/lib/format";
import { monthLong } from "@/lib/time";
import styles from "./Board.module.css";

export function LoanCard({ loan }: { loan: Board["loan"] }) {
  const pct = (n: number) => (loan.total ? ((n / loan.total) * 100).toFixed(1) : "0") + "%";
  return (
    <Card title="The family loan">
      <div className={styles.stack} aria-hidden="true">
        <i className={styles.stackA} style={{ width: pct(loan.borrowed) }} />
        <i className={styles.stackB} style={{ width: pct(loan.stillToBorrow) }} />
      </div>
      <dl className={styles.kv}>
        <dt>
          <span className={`${styles.dot} ${styles.dotInk}`} />
          Borrowed so far
        </dt>
        <dd>{kyatM(loan.borrowed)}</dd>
        <dt>
          <span className={`${styles.dot} ${styles.dotPlan}`} />
          Still to borrow
        </dt>
        <dd>{kyatM(loan.stillToBorrow)}</dd>
        <dt>Total loan</dt>
        <dd>{kyatM(loan.total)}</dd>
        <dt>Time to repay</dt>
        <dd>{loan.months.toFixed(1)} months</dd>
      </dl>
      <p className={styles.small}>
        Still to borrow = left to pay on the house minus savings by {monthLong(loan.compareMonth)}. Repaying{" "}
        {kyatM(loan.repayPerMonth)} a month.
      </p>
    </Card>
  );
}
