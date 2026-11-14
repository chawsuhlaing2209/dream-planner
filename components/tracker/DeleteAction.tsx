"use client";

import { deleteRow } from "@/app/actions";
import { DeleteButton } from "../table/DeleteButton";
import styles from "../table/Table.module.css";
import { useSave } from "../table/useSave";

/** Inline two-click delete for a whole record (for example a trip). */
export function DeleteAction({ table, id, label }: { table: string; id: string; label: string }) {
  const { run, error } = useSave();
  return (
    <span className={styles.addWrap}>
      <DeleteButton label={label} onConfirm={() => run(deleteRow(table, id))} />
      {error ? (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </span>
  );
}
