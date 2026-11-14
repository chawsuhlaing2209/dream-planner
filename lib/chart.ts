/** A "nice" axis ceiling: 1, 2, 2.5, 5 or 10 times a power of ten, at or above v. */
export function niceMax(v: number): number {
  const p = Math.pow(10, Math.floor(Math.log10(v || 1)));
  for (const s of [1, 2, 2.5, 5, 10]) if (s * p >= v) return s * p;
  return 10 * p;
}
