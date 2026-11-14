import type { SavingsPoint } from "@/lib/calc/savings";
import { kyatM } from "@/lib/format";
import { monthLong } from "@/lib/time";
import { niceMax } from "@/lib/chart";
import styles from "./Board.module.css";

const L = 56;
const R = 704;
const T = 24;
const B = 270;


/** Savings path: solid for received months, dashed from the last received month, band over build months. */
export function SavingsChart({ series, buildMonths }: { series: SavingsPoint[]; buildMonths: string[] }) {
  if (series.length < 2) {
    return <p className="muted">Add at least two savings months to draw the path.</p>;
  }
  const n = series.length;
  const ym = niceMax(Math.max(...series.map((s) => s.total)) * 1.02);
  const X = (i: number) => L + ((R - L) * i) / (n - 1);
  const Y = (v: number) => B - ((B - T) * Math.max(0, v)) / ym;

  let last = -1;
  series.forEach((s, i) => {
    if (s.received) last = i;
  });
  if (last < 0) last = 0;
  let peak = 0;
  for (let i = 0; i <= last; i++) if (series[i].total > series[peak].total) peak = i;

  const path = (p: number, q: number) => {
    let d = "";
    for (let i = p; i <= q; i++) d += `${i === p ? "M" : "L"}${X(i).toFixed(1)} ${Y(series[i].total).toFixed(1)} `;
    return d;
  };

  const a = series.findIndex((s) => s.month === buildMonths[0]);
  const b = series.findIndex((s) => s.month === buildMonths[buildMonths.length - 1]);

  const mark = (i: number, anchor: "start" | "middle" | "end", dx: number, dy: number, color: string) => (
    <g key={`m${i}`}>
      <circle cx={X(i)} cy={Y(series[i].total)} r={5} fill={color} stroke="var(--card)" strokeWidth={2} />
      <text x={X(i) + dx} y={Y(series[i].total) + dy} textAnchor={anchor} fontSize={12.5} fontWeight={700} fill="var(--ink)">
        {monthLong(series[i].month)} · {kyatM(series[i].total)}
      </text>
    </g>
  );

  const end = series[n - 1];
  const label = `Savings total by month. Last received ${monthLong(series[last].month)} at ${kyatM(series[last].total)}; peak ${monthLong(
    series[peak].month,
  )} at ${kyatM(series[peak].total)}; plan reaches ${kyatM(end.total)} by ${monthLong(end.month)}.`;

  return (
    <div className={styles.chartbox}>
      <svg viewBox="0 0 760 320" role="img" aria-label={label} fontFamily="var(--body)">
        {[0, 1, 2, 3, 4].map((i) => {
          const v = (ym * i) / 4;
          return (
            <g key={i}>
              <line x1={L} y1={Y(v)} x2={R} y2={Y(v)} stroke="var(--line)" strokeWidth={1} />
              <text x={L - 8} y={Y(v) + 4} textAnchor="end" fontSize={12} fill="var(--muted)">
                {v ? `${v / 1e6}M` : "0"}
              </text>
            </g>
          );
        })}
        {series.map((s, i) =>
          i === 0 || s.month.slice(5) === "01" ? (
            <g key={s.month}>
              <line x1={X(i)} y1={B} x2={X(i)} y2={B + 5} stroke="var(--muted)" strokeWidth={1} />
              <text x={X(i)} y={B + 20} textAnchor={i ? "middle" : "start"} fontSize={12} fill="var(--muted)">
                {monthLong(s.month)}
              </text>
            </g>
          ) : null,
        )}
        {a >= 0 && b > a ? (
          <g>
            <rect x={X(a)} y={T} width={X(b) - X(a)} height={B - T} fill="var(--lamp)" opacity={0.13} />
            <text x={(X(a) + X(b)) / 2} y={T + 14} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--lamp-ink)">
              House build
            </text>
          </g>
        ) : null}
        {last > 0 ? (
          <>
            <path d={`${path(0, last)}L${X(last)} ${B} L${X(0)} ${B} Z`} fill="var(--done)" opacity={0.12} />
            <path d={path(0, last)} fill="none" stroke="var(--done)" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          </>
        ) : null}
        {last < n - 1 ? (
          <path d={path(last, n - 1)} fill="none" stroke="var(--plan)" strokeWidth={3} strokeDasharray="7 6" strokeLinecap="round" />
        ) : null}
        {peak !== last && peak > 1 ? mark(peak, "middle", 0, -12, "var(--done)") : null}
        {mark(last, last > n * 0.8 ? "end" : "middle", 6, 22, "var(--done)")}
        {last < n - 1 ? mark(n - 1, "end", -10, -10, "var(--plan)") : null}
      </svg>
    </div>
  );
}

export function SavingsLegend() {
  return (
    <div className={styles.legend}>
      <span>
        <i />
        Received months
      </span>
      <span>
        <i className={styles.dash} />
        Pending and planned months
      </span>
    </div>
  );
}
