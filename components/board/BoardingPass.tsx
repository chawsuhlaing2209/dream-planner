import { Stamp } from "@/components/Stamp";
import type { Ticket } from "@/lib/calc/board";
import { foreign, kyatM } from "@/lib/format";
import styles from "./Board.module.css";

export function BoardingPass({ t }: { t: Ticket }) {
  return (
    <article className={styles.ticket}>
      <div className={styles.ticketMain}>
        <span className={styles.where}>{t.place}</span>
        <h3>{t.name || "Untitled trip"}</h3>
        {t.chips.length ? (
          <ul>
            {t.chips.map((c, i) => (
              <li key={i} title={c}>
                {c}
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.small}>No cost lines yet.</p>
        )}
      </div>
      <div className={styles.stub}>
        <Stamp {...t.stamp} />
        <div>
          <div className={`${styles.cost} num`}>{kyatM(t.kyat)}</div>
          {t.foreign.length ? (
            <div className={`${styles.pax} num`}>incl. {t.foreign.map((f) => foreign(f.currency, f.amount)).join(" + ")}</div>
          ) : null}
        </div>
        <span className={styles.pax}>{t.who}</span>
      </div>
    </article>
  );
}
