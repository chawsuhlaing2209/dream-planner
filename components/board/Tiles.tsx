import type { Board } from "@/lib/calc/board";
import { kyatM } from "@/lib/format";
import { monthLong } from "@/lib/time";
import styles from "./Board.module.css";

export function Tiles({ board }: { board: Board }) {
  const { home, tripCounts: t, savings } = board;
  const now = savings.now;
  const end = savings.end;
  return (
    <div className={styles.tiles}>
      <div className={`${styles.tile} ${styles.tileHome}`}>
        <span className={styles.k}>Dream home</span>
        <span className={`${styles.v} num`}>{home.percent}% paid</span>
        <span className={`${styles.s} num`}>
          {kyatM(home.paid)} paid · {kyatM(home.left)} left
        </span>
      </div>
      <div className={`${styles.tile} ${styles.tileTrip}`}>
        <span className={styles.k}>Dream trips</span>
        <span className={`${styles.v} num`}>{t.done} done</span>
        <span className={styles.s}>
          {t.planned} planned{t.none ? ` · ${t.none} with no status` : ""}
        </span>
      </div>
      <div className={styles.tile}>
        <span className={styles.k}>Savings tracker</span>
        <span className={`${styles.v} num`}>{now ? kyatM(now.total) : "K 0"}</span>
        <span className={`${styles.s} num`}>
          {now
            ? `${monthLong(now.month)} row` +
              (end && end.month !== now.month ? ` · plan reaches ${kyatM(end.total)} by ${monthLong(end.month)}` : "")
            : "No months yet. Add one in Savings."}
        </span>
      </div>
    </div>
  );
}
