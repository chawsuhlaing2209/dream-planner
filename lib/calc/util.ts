export function sum<T>(rows: readonly T[], pick: (row: T) => number): number {
  let total = 0;
  for (const r of rows) total += Number(pick(r)) || 0;
  return total;
}

export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}
