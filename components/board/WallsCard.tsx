import { Card } from "@/components/Card";
import type { Board } from "@/lib/calc/board";
import { decimal, kyat } from "@/lib/format";
import { monthLong } from "@/lib/time";
import styles from "./Board.module.css";

export function WallsCard({ walls }: { walls: Board["walls"] }) {
  const c = walls.cement;
  return (
    <Card title="What went into the walls">
      <div className={styles.facts}>
        <div className={styles.fact}>
          <b className="num">{decimal(walls.cementBags)}</b>
          <span>bags of cement</span>
        </div>
        <div className={styles.fact}>
          <b className="num">{decimal(walls.bricks)}</b>
          <span>bricks</span>
        </div>
        <div className={styles.fact}>
          <b className="num">{decimal(walls.rebarTons)} t</b>
          <span>of rebar</span>
        </div>
        <div className={styles.fact}>
          <b className="num">{decimal(walls.personDays)}</b>
          <span>labour person-days logged</span>
        </div>
      </div>
      {c ? (
        <p className={styles.small}>
          Cement went from {kyat(c.first.price)} a bag in {monthLong(c.first.date)} to {kyat(c.latest.price)} in{" "}
          {monthLong(c.latest.date)}.
        </p>
      ) : null}
    </Card>
  );
}
