"use client";

import { useEffect, useState } from "react";
import styles from "./Table.module.css";

/** A quiet ×. First click turns it into a rose "Delete?" for 3 seconds; a second click deletes. */
export function DeleteButton({ onConfirm, label = "Delete row" }: { onConfirm: () => void; label?: string }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(id);
  }, [armed]);
  return (
    <button
      type="button"
      className={`${styles.del} ${armed ? styles.armed : ""}`}
      aria-label={armed ? `Confirm: ${label}` : label}
      title={label}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
    >
      {armed ? "Delete?" : "×"}
    </button>
  );
}
