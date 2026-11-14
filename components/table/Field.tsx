"use client";

import { useId, useState } from "react";
import type { ActionResult } from "@/lib/actions/fields";
import { Cell, type CellType, type Option } from "./Cell";
import styles from "./Table.module.css";
import { useSave } from "./useSave";

/** One labelled field that saves on change (settings, trip details, rates, meals). */
export function Field({
  label,
  value,
  type,
  save,
  options,
  integer,
  width,
}: {
  label: string;
  value: unknown;
  type: CellType;
  save: (value: unknown) => Promise<ActionResult>;
  options?: Option[];
  integer?: boolean;
  width?: "wide" | "narrow";
}) {
  const id = useId();
  const { run, error, setError } = useSave();
  const [local, setLocal] = useState<{ v: unknown; from: unknown } | null>(null);
  // Show the local value until the server value changes underneath it.
  const shown = local && local.from === value ? local.v : value;
  return (
    <span className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <Cell
        id={id}
        type={type}
        value={shown}
        options={options}
        integer={integer}
        width={width}
        boxed
        ariaLabel={label}
        onInvalid={setError}
        onCommit={async (v) => {
          setLocal({ v, from: value });
          const ok = await run(save(v));
          if (!ok) setLocal(null);
        }}
      />
      {error ? (
        <span role="alert" className={styles.error}>
          {error}
        </span>
      ) : null}
    </span>
  );
}
