import styles from "./SumRow.module.css";

/** Summary figures: big number with a small label underneath. */
export function SumRow({ items }: { items: { value: string; label: string; warn?: boolean }[] }) {
  return (
    <div className={styles.sum}>
      {items.map((i) => (
        <div key={i.label}>
          <b className={`num ${i.warn ? styles.warn : ""}`}>{i.value}</b>
          <span>{i.label}</span>
        </div>
      ))}
    </div>
  );
}
