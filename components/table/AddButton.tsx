"use client";

import { useState } from "react";
import type { ActionResult } from "@/lib/actions/fields";
import styles from "./Table.module.css";
import { useSave } from "./useSave";

/** A button that runs one server action (add a row, start a month). */
export function AddButton({ label, action, primary }: { label: string; action: () => Promise<ActionResult>; primary?: boolean }) {
  const { run, error } = useSave();
  const [busy, setBusy] = useState(false);
  return (
    <span className={styles.addWrap}>
      <button
        type="button"
        className={`${styles.btn} ${primary ? styles.primary : ""}`}
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await run(action());
          setBusy(false);
        }}
      >
        {label}
      </button>
      {error ? (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </span>
  );
}
