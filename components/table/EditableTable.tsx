"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { deleteRow, updateField } from "@/app/actions";
import { decimal } from "@/lib/format";
import { Cell, type CellType, type Option } from "./Cell";
import { DeleteButton } from "./DeleteButton";
import styles from "./Table.module.css";
import { useSave } from "./useSave";

type Row = { id: string };

export type Column<R extends Row> =
  | {
      key: keyof R & string;
      label: string;
      type: CellType;
      options?: Option[];
      integer?: boolean;
      nullable?: boolean;
      width?: "wide" | "narrow";
      sum?: boolean;
    }
  | {
      key?: undefined;
      label: string;
      type: "calc";
      calc: (row: R, index: number, rows: R[]) => number | string;
      format?: (n: number) => string;
      /** Show negative numbers in the warning colour. */
      flagNegative?: boolean;
      sum?: boolean;
      right?: boolean;
    };

export type EditableTableProps<R extends Row> = {
  /** Table name from lib/actions/fields (EDITABLE). */
  table: string;
  rows: R[];
  columns: Column<R>[];
  caption: string;
  empty: string;
  deletable?: boolean;
  /** Extra local changes after a field edit (e.g. materials total follows price x qty). */
  derive?: (row: R, key: string, value: unknown) => Partial<R>;
};

/**
 * One table for every tracker. Edits show at once (optimistic), save through a server action,
 * and the chip in the top bar shows Saving / Saved / Could not save.
 */
export function EditableTable<R extends Row>({ table, rows, columns, caption, empty, deletable = true, derive }: EditableTableProps<R>) {
  const { run, error, setError } = useSave();
  const [overrides, setOverrides] = useState<Record<string, Partial<R>>>({});
  const [removed, setRemoved] = useState<Set<string>>(new Set());
  const pending = useRef(0);

  // New server data arrived (after revalidation): drop local copies once nothing is in flight.
  useEffect(() => {
    if (pending.current === 0) {
      setOverrides({});
      setRemoved(new Set());
    }
  }, [rows]);

  const view = useMemo(
    () => rows.filter((r) => !removed.has(r.id)).map((r) => (overrides[r.id] ? { ...r, ...overrides[r.id] } : r)),
    [rows, overrides, removed],
  );

  async function save(row: R, key: string, value: unknown) {
    const extra = derive ? derive(row, key, value) : {};
    setOverrides((o) => ({ ...o, [row.id]: { ...o[row.id], [key]: value, ...extra } as Partial<R> }));
    pending.current += 1;
    const ok = await run(updateField(table, row.id, key, value));
    pending.current -= 1;
    if (!ok) {
      setOverrides((o) => {
        const next = { ...o };
        delete next[row.id];
        return next;
      });
    }
  }

  async function remove(row: R) {
    setRemoved((s) => new Set(s).add(row.id));
    pending.current += 1;
    const ok = await run(deleteRow(table, row.id));
    pending.current -= 1;
    if (!ok)
      setRemoved((s) => {
        const next = new Set(s);
        next.delete(row.id);
        return next;
      });
  }

  const hasFooter = columns.some((c) => c.sum);
  const fmt = (c: Column<R>, n: number) => (c.type === "calc" && c.format ? c.format(n) : decimal(n));
  const total = (c: Column<R>) =>
    view.reduce((acc, r, i) => {
      const v = c.type === "calc" ? c.calc(r, i, view) : c.key ? r[c.key] : 0;
      return acc + (Number(v) || 0);
    }, 0);

  return (
    <div className={styles.wrap}>
      <div className={styles.tablebox}>
        <table className={styles.grid}>
          <caption className="visually-hidden">{caption}</caption>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.label} scope="col" className={c.type === "number" || (c.type === "calc" && c.right !== false) ? styles.r : undefined}>
                  {c.label}
                </th>
              ))}
              {deletable ? (
                <th scope="col" className={styles.x}>
                  <span className="visually-hidden">Delete</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (deletable ? 1 : 0)} className={styles.empty}>
                  {empty}
                </td>
              </tr>
            ) : (
              view.map((row, i) => (
                <tr key={row.id}>
                  {columns.map((c) => {
                    if (c.type === "calc") {
                      const v = c.calc(row, i, view);
                      const neg = c.flagNegative && typeof v === "number" && v < 0;
                      return (
                        <td key={c.label} className={c.right !== false ? styles.r : undefined}>
                          <span className={`${styles.calc} ${neg ? styles.neg : ""}`}>{typeof v === "number" ? fmt(c, v) : v}</span>
                        </td>
                      );
                    }
                    return (
                      <td key={c.key} className={c.type === "checkbox" ? styles.center : undefined}>
                        <Cell
                          type={c.type}
                          value={row[c.key]}
                          options={c.options}
                          integer={c.integer}
                          nullable={c.nullable}
                          width={c.width}
                          ariaLabel={`${c.label}, row ${i + 1}`}
                          onInvalid={setError}
                          onCommit={(v) => save(row, c.key as string, v)}
                        />
                      </td>
                    );
                  })}
                  {deletable ? (
                    <td className={styles.x}>
                      <DeleteButton onConfirm={() => remove(row)} label={`Delete row ${i + 1}`} />
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
          {hasFooter && view.length > 0 ? (
            <tfoot>
              <tr>
                {columns.map((c, idx) => (
                  <td key={c.label} className={c.sum ? styles.r : undefined}>
                    {c.sum ? fmt(c, total(c)) : idx === 0 ? "Total" : ""}
                  </td>
                ))}
                {deletable ? <td /> : null}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {error ? (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
