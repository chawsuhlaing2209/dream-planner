import styles from "./ProgressBar.module.css";

/** 8px bar: --line track, --lamp fill. `share` is 0..1. */
export function ProgressBar({ share, className }: { share: number; className?: string }) {
  const pct = Math.max(0, Math.min(1, share)) * 100;
  return (
    <span className={`${styles.bar} ${className ?? ""}`} aria-hidden="true">
      <i style={{ width: `${pct.toFixed(1)}%` }} />
    </span>
  );
}
