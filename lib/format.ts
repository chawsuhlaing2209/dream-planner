import type { Currency } from "./calc/types";

const whole = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const upTo2 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

/** Full kyat figure for tables: "K 1,234,567". Negative: "-K 288,000". */
export function kyat(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "-K " : "K ") + whole.format(Math.abs(r));
}

/** Millions for the board: "K 63.4M". Negative uses a true minus sign. */
export function kyatM(n: number, digits = 1): string {
  return (n < 0 ? "−" : "") + "K " + (Math.abs(n) / 1e6).toFixed(digits) + "M";
}

/** Whole number with separators. */
export function plain(n: number): string {
  return whole.format(Math.round(n));
}

/** Up to 2 decimals with separators (quantities, rates, half days). */
export function decimal(n: number): string {
  return upTo2.format(Math.round(n * 100) / 100);
}

export const CURRENCY_SYMBOL: Record<Currency, string> = { MMK: "K ", THB: "฿", USD: "$", SGD: "S$" };

export function foreign(c: Currency, amount: number): string {
  return CURRENCY_SYMBOL[c] + decimal(amount);
}
