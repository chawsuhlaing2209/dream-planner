"use client";

import { useSaveState } from "./SaveState";
import styles from "./SaveChip.module.css";

const LABEL = { saved: "Saved", saving: "Saving", error: "Could not save" } as const;

export function SaveChip() {
  const { status } = useSaveState();
  return (
    <span className={`${styles.chip} ${styles[status]}`} role="status" aria-live="polite">
      {LABEL[status]}
    </span>
  );
}
