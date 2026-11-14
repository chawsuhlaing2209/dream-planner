import type { CategoryTotals } from "@/lib/calc/budget";
import { kyatM } from "@/lib/format";

/* Fixed house-scene colours from DESIGN.md section 2 (not themed). */
const UNLIT = "#1D2C55";
const WALL = "#93A6DA";
const GROUND = "#0B1329";
const GROUND_LINE = "#3A4C82";
const STAR = "#C9D5F5";
const MOON = "#F4E7C1";
const NIGHT = "#111C3A";
const LABEL = "#FFFFFF";
const LABEL_OUTLINE = "#0E1730";

const ROOMS = [
  { key: "reserve", x: 150, y: 50, w: 90, h: 40, one: true },
  { key: "smart", x: 110, y: 90, w: 220, h: 90 },
  { key: "roof", x: 330, y: 140, w: 240, h: 40, one: true },
  { key: "shrine", x: 110, y: 180, w: 140, h: 120 },
  { key: "finish", x: 250, y: 180, w: 170, h: 120 },
  { key: "doors", x: 420, y: 180, w: 150, h: 120 },
  { key: "kitchen", x: 110, y: 300, w: 150, h: 120 },
  { key: "living", x: 260, y: 300, w: 170, h: 120 },
  { key: "bath", x: 430, y: 300, w: 140, h: 120 },
  { key: "structure", x: 110, y: 420, w: 460, h: 36, one: true },
  { key: "labour", x: 22, y: 200, w: 72, h: 220 },
  { key: "plans", x: 22, y: 120, w: 72, h: 62 },
  { key: "garden", x: 586, y: 356, w: 76, h: 64 },
] as const;

const STARS = [
  [40, 40],
  [95, 70],
  [300, 30],
  [380, 60],
  [455, 28],
  [520, 80],
  [610, 45],
  [650, 120],
  [250, 80],
  [18, 150],
  [600, 200],
  [640, 300],
] as const;

export function HouseScene({ rooms, homePercent, homePaid, homeLeft }: { rooms: CategoryTotals[]; homePercent: number; homePaid: number; homeLeft: number }) {
  const byKey = new Map(rooms.map((r) => [r.key, r]));
  const label = `Cross-section of the house. Each room fills with light up to the share paid. Overall ${homePercent}% paid: ${kyatM(homePaid)} paid, ${kyatM(homeLeft)} left. ${rooms
    .map((r) => `${r.shortLabel} ${Math.round(r.share * 100)}%`)
    .join(", ")}.`;
  const text = (x: number, y: number, size: number, s: string) => (
    <text
      x={x}
      y={y}
      fontSize={size}
      textAnchor="middle"
      fill={LABEL}
      stroke={LABEL_OUTLINE}
      strokeWidth={3.5}
      paintOrder="stroke"
      strokeLinejoin="round"
      fontFamily="var(--body)"
      fontWeight={700}
    >
      {s}
    </text>
  );
  return (
    <svg viewBox="0 0 680 500" role="img" aria-label={label}>
      <defs>
        <linearGradient id="lamp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD27A" />
          <stop offset="1" stopColor="#F2A02B" />
        </linearGradient>
      </defs>
      {STARS.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={i % 3 ? 1.3 : 2} fill={STAR} opacity={0.8} />
      ))}
      <circle cx={585} cy={70} r={22} fill={MOON} />
      <circle cx={594} cy={64} r={20} fill={NIGHT} />
      <rect x={0} y={456} width={680} height={44} fill={GROUND} />
      <line x1={0} y1={456} x2={680} y2={456} stroke={GROUND_LINE} strokeWidth={2} />
      {ROOMS.map((r) => {
        const c = byKey.get(r.key);
        if (!c) return null;
        const fh = r.h * c.share;
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const pct = `${Math.round(c.share * 100)}%`;
        const narrow = r.w < 100;
        return (
          <g key={r.key}>
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill={UNLIT} />
            <rect x={r.x} y={r.y + r.h - fh} width={r.w} height={fh} fill="url(#lamp)" />
            <rect x={r.x} y={r.y} width={r.w} height={r.h} fill="none" stroke={WALL} strokeWidth={2.5} />
            {"one" in r && r.one ? (
              text(cx, cy + 5, 14, `${c.shortLabel} ${pct}`)
            ) : (
              <>
                {text(cx, cy - 4, narrow ? 12 : 13.5, c.shortLabel)}
                {text(cx, cy + 20, narrow ? 19 : 23, pct)}
              </>
            )}
          </g>
        );
      })}
      <polyline points="100,90 340,90" fill="none" stroke={WALL} strokeWidth={5} strokeLinecap="round" />
      {Array.from({ length: 10 }, (_, i) => 345 + i * 25).map((x) => (
        <line key={x} x1={x} y1={118} x2={x} y2={140} stroke={WALL} strokeWidth={1.5} />
      ))}
      <line x1={332} y1={118} x2={572} y2={118} stroke={WALL} strokeWidth={2} />
    </svg>
  );
}
