import type { MaterialRow } from "./types";
import { sum } from "./util";

/** Material left = total - paid. */
export function materialLeft(m: Pick<MaterialRow, "totalCost" | "paid">): number {
  return m.totalCost - m.paid;
}

/** Suggested total when price or quantity changes; the user may type over it. */
export function suggestedTotal(price: number, qtyNeeded: number): number {
  return Math.round(price * qtyNeeded);
}

export function materialTotals(rows: readonly Pick<MaterialRow, "totalCost" | "paid">[]) {
  const totalCost = sum(rows, (r) => r.totalCost);
  const paid = sum(rows, (r) => r.paid);
  return { totalCost, paid, left: totalCost - paid };
}

export const CEMENT = /crown|cement/i;
export const BRICK = /brick/i;
export const REBAR = /rebar/i;

/** Quantity needed across materials whose name matches (as the prototype does). */
export function quantityOf(rows: readonly MaterialRow[], pattern: RegExp): number {
  return sum(
    rows.filter((r) => pattern.test(r.name)),
    (r) => r.qtyNeeded,
  );
}

export type PricePoint = { price: number; date: string };

/** First and latest dated cement price, or null when fewer than two dated rows. */
export function cementPriceChange(rows: readonly MaterialRow[]): { first: PricePoint; latest: PricePoint } | null {
  const dated = rows
    .filter((r): r is MaterialRow & { date: string } => CEMENT.test(r.name) && !!r.date)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (dated.length < 2) return null;
  const f = dated[0];
  const l = dated[dated.length - 1];
  return { first: { price: f.price, date: f.date }, latest: { price: l.price, date: l.date } };
}
