import type { StampKind } from "@/lib/calc/trips";
import styles from "./Stamp.module.css";

export function Stamp({ kind, label }: { kind: StampKind; label: string }) {
  return <span className={`${styles.stamp} ${styles[kind]}`}>{label}</span>;
}
