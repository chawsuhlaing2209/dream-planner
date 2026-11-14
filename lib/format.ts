const group = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

/** Full kyat figure for tables: "K 1,234,567". */
export function kyat(n: number): string {
  const r = Math.round(n);
  return (r < 0 ? "-K " : "K ") + group.format(Math.abs(r));
}

/** Millions for the board: "K 63.4M". */
export function kyatM(n: number, digits = 1): string {
  return "K " + (n / 1e6).toFixed(digits) + "M";
}

export function plain(n: number): string {
  return group.format(Math.round(n));
}
