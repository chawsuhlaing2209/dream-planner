import { ProgressBar } from "@/components/ProgressBar";
import type { CategoryTotals } from "@/lib/calc/budget";
import { kyatM } from "@/lib/format";
import styles from "./Board.module.css";

export function RoomList({ rooms }: { rooms: CategoryTotals[] }) {
  if (rooms.length === 0) return <p className="muted">No budget categories yet.</p>;
  const sorted = [...rooms].sort((a, b) => b.share - a.share);
  return (
    <div className={styles.rooms}>
      {sorted.map((r) => (
        <div key={r.key} className={styles.room}>
          <span className={styles.roomName}>{r.boardLabel || r.name}</span>
          <span className={`${styles.roomPct} num`}>{Math.round(r.share * 100)}%</span>
          <ProgressBar share={r.share} className={styles.full} />
          <span className={`${styles.roomLine} num`}>
            {kyatM(r.paid)} paid · {kyatM(r.left)} left
          </span>
        </div>
      ))}
    </div>
  );
}
