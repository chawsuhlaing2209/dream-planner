"use client";

import { useState } from "react";
import { decimal } from "@/lib/format";
import styles from "./Table.module.css";

export type CellType = "text" | "number" | "date" | "select" | "checkbox";
export type Option = { value: string; label: string; group?: string };

export type CellProps = {
  type: CellType;
  value: unknown;
  /** Called with the parsed value when the edit is committed (blur/Enter, or change for select/checkbox). */
  onCommit: (value: unknown) => void;
  /** Called when typed text is not a number. */
  onInvalid?: (message: string) => void;
  ariaLabel: string;
  options?: Option[];
  /** Number cells: whole numbers only (kyat). */
  integer?: boolean;
  /** Empty means null (optional date or select). */
  nullable?: boolean;
  width?: "wide" | "narrow";
  /** Visible field style (quick-add form, settings) instead of a plain table cell. */
  boxed?: boolean;
  id?: string;
};

export function parseNumber(raw: string, integer: boolean): number | null {
  const cleaned = raw.replace(/[,\s]/g, "").replace(/^K/i, "");
  if (cleaned === "") return 0;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return integer ? Math.round(n) : n;
}

function groupOptions(options: Option[]) {
  const groups = new Map<string, Option[]>();
  for (const o of options) {
    const g = o.group ?? "";
    groups.set(g, [...(groups.get(g) ?? []), o]);
  }
  return [...groups.entries()];
}

export function Cell(p: CellProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const cls = [styles.in, p.type === "number" ? styles.num : "", p.width ? styles[p.width] : "", p.boxed ? styles.boxed : ""]
    .filter(Boolean)
    .join(" ");

  if (p.type === "checkbox") {
    return (
      <input
        id={p.id}
        type="checkbox"
        className={styles.check}
        checked={Boolean(p.value)}
        aria-label={p.ariaLabel}
        onChange={(e) => p.onCommit(e.currentTarget.checked)}
      />
    );
  }

  if (p.type === "select") {
    const current = p.value == null ? "" : String(p.value);
    return (
      <select
        id={p.id}
        className={cls}
        value={current}
        aria-label={p.ariaLabel}
        onChange={(e) => {
          const v = e.currentTarget.value;
          p.onCommit(v === "" && p.nullable ? null : v);
        }}
      >
        {p.nullable ? <option value="">None</option> : null}
        {groupOptions(p.options ?? []).map(([group, opts]) =>
          group ? (
            <optgroup key={group} label={group}>
              {opts.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ) : (
            opts.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))
          ),
        )}
      </select>
    );
  }

  const atRest =
    p.type === "number" ? decimal(Number(p.value) || 0) : p.value == null ? "" : String(p.value);
  const raw = p.type === "number" ? String(p.value ?? 0) : atRest;

  function commit() {
    if (draft === null) return;
    const d = draft;
    setDraft(null);
    if (d === raw) return;
    if (p.type === "number") {
      const n = parseNumber(d, Boolean(p.integer));
      if (n === null) {
        p.onInvalid?.(`"${d}" is not a number. The old value is kept.`);
        return;
      }
      if (n !== Number(p.value)) p.onCommit(n);
      return;
    }
    if (p.type === "date") {
      if (d === "" && !p.nullable) {
        p.onInvalid?.("A date is needed. The old value is kept.");
        return;
      }
      p.onCommit(d === "" ? null : d);
      return;
    }
    p.onCommit(d);
  }

  return (
    <input
      id={p.id}
      type={p.type === "date" ? "date" : "text"}
      inputMode={p.type === "number" ? (p.integer ? "numeric" : "decimal") : undefined}
      className={cls}
      value={draft ?? atRest}
      aria-label={p.ariaLabel}
      onFocus={(e) => {
        setDraft(raw);
        if (p.type === "number") {
          const el = e.currentTarget;
          requestAnimationFrame(() => el.select());
        }
      }}
      onChange={(e) => setDraft(e.currentTarget.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit();
        } else if (e.key === "Escape") {
          setDraft(raw);
        }
      }}
    />
  );
}
