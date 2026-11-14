import styles from "./CsvLinks.module.css";

/** Download links for this tab's tables. Plain links: the browser saves the file. */
export function CsvLinks({ tables }: { tables: { key: string; label: string }[] }) {
  return (
    <p className={styles.links}>
      {tables.map((t) => (
        <a key={t.key} href={`/export/${t.key}`} download>
          Download {t.label} CSV
        </a>
      ))}
    </p>
  );
}
