import Link from "next/link";
import styles from "./MonthPills.module.css";

export type Pill = { id: string; label: string };

/** Rounded month pills. Selected is ink on paper. Uses ?m= so the choice survives a reload. */
export function MonthPills({ pills, current, basePath, label }: { pills: Pill[]; current?: string; basePath: string; label: string }) {
  if (pills.length === 0) return null;
  return (
    <nav className={styles.pills} aria-label={label}>
      {pills.map((p) => (
        <Link
          key={p.id}
          href={`${basePath}?m=${p.id}`}
          scroll={false}
          className={styles.pill}
          aria-current={p.id === current ? "true" : undefined}
        >
          {p.label}
        </Link>
      ))}
    </nav>
  );
}
