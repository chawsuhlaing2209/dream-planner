"use client";

import { useId, useRef, useState } from "react";
import { addExpense } from "@/app/actions";
import { periodOf } from "@/lib/calc/expenses";
import { kyat } from "@/lib/format";
import { monthLong } from "@/lib/time";
import { parseNumber, type Option } from "../table/Cell";
import { useSave } from "../table/useSave";
import styles from "./Tracker.module.css";

/** Fast entry on site. Focus stays in Item after each add. */
export function QuickAdd({ today, lineOptions }: { today: string; lineOptions: Option[] }) {
  const ids = useId();
  const itemRef = useRef<HTMLInputElement>(null);
  const [date, setDate] = useState(today);
  const [item, setItem] = useState("");
  const [amount, setAmount] = useState("");
  const [lineId, setLineId] = useState("");
  const [addToPaid, setAddToPaid] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const { run, error } = useSave();

  const groups = new Map<string, Option[]>();
  for (const o of lineOptions) groups.set(o.group ?? "", [...(groups.get(o.group ?? "") ?? []), o]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const n = parseNumber(amount, true);
    if (!date) return setMsg({ ok: false, text: "Pick a date." });
    if (!item) return setMsg({ ok: false, text: "Write what it was for." });
    if (n === null || n <= 0) return setMsg({ ok: false, text: "Enter an amount above zero." });
    setBusy(true);
    setMsg(null);
    const ok = await run(addExpense({ date, item, amount: n, budgetLineId: lineId || null, addToPaid }));
    setBusy(false);
    if (ok) {
      const line = lineOptions.find((o) => o.value === lineId);
      setMsg({
        ok: true,
        text:
          `Added ${kyat(n)} to ${monthLong(periodOf(date))}.` + (line && addToPaid ? ` Also added to Paid on "${line.label}".` : ""),
      });
      setItem("");
      setAmount("");
    }
    itemRef.current?.focus();
  }

  return (
    <form className={styles.card} onSubmit={submit} aria-label="Quick add expense">
      <h3>Quick add</h3>
      <div className={styles.form}>
        <label htmlFor={`${ids}d`}>
          Date
          <input id={`${ids}d`} className={styles.formInput} type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </label>
        <label htmlFor={`${ids}i`}>
          Item
          <input id={`${ids}i`} ref={itemRef} className={styles.formInput} value={item} onChange={(e) => setItem(e.target.value)} autoComplete="off" />
        </label>
        <label htmlFor={`${ids}a`}>
          Amount
          <input
            id={`${ids}a`}
            className={`${styles.formInput} num`}
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoComplete="off"
          />
        </label>
        <label htmlFor={`${ids}l`}>
          Budget line
          <select id={`${ids}l`} className={styles.formInput} value={lineId} onChange={(e) => setLineId(e.target.value)}>
            <option value="">None</option>
            {[...groups.entries()].map(([g, os]) => (
              <optgroup key={g} label={g}>
                {os.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <label className={styles.tick} htmlFor={`${ids}p`}>
          <input id={`${ids}p`} type="checkbox" checked={addToPaid} onChange={(e) => setAddToPaid(e.target.checked)} />
          Also add to Paid on that budget line
        </label>
        <button type="submit" className={`${styles.formInput} ${styles.submit}`} disabled={busy}>
          {busy ? "Adding" : "Add expense"}
        </button>
      </div>
      <p className={styles.formMsg} role="status" aria-live="polite">
        {error ? <span className={styles.bad}>{error}</span> : msg ? <span className={msg.ok ? styles.ok : styles.bad}>{msg.text}</span> : null}
      </p>
    </form>
  );
}
