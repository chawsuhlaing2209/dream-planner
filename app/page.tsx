import { Card } from "@/components/Card";
import { BoardingPass } from "@/components/board/BoardingPass";
import styles from "@/components/board/Board.module.css";
import { HouseScene } from "@/components/board/HouseScene";
import { LoanCard } from "@/components/board/LoanCard";
import { MonthBars } from "@/components/board/MonthBars";
import { RoomList } from "@/components/board/RoomList";
import { SavingsChart, SavingsLegend } from "@/components/board/SavingsChart";
import { Tiles } from "@/components/board/Tiles";
import { WallsCard } from "@/components/board/WallsCard";
import { Page } from "@/components/Page";
import { SectionHead } from "@/components/SectionHead";
import { getBoard } from "@/lib/data/board";
import { dayLong } from "@/lib/time";

export default async function BoardPage() {
  const { board, today } = await getBoard();
  return (
    <Page
      eyebrow={`Live board · ${dayLong(today)}`}
      title="Three dreams on one board"
      lede="A home being built, trips being collected, and savings climbing back. The board redraws from the tracker tabs every time you edit."
    >
      <Tiles board={board} />

      <section className={styles.section}>
        <SectionHead title="The house lights up as it gets paid">
          Each budget category is a room. The lamp-light fills the room to the share already paid. A fully lit room is done.
        </SectionHead>
        <div className={styles.split}>
          <div className={styles.scene}>
            <HouseScene rooms={board.rooms} homePercent={board.home.percent} homePaid={board.home.paid} homeLeft={board.home.left} />
            <p className={styles.cap}>
              <b>Lit</b> = paid · dark = still to pay
            </p>
          </div>
          <Card title="Room by room">
            <RoomList rooms={board.rooms} />
          </Card>
        </div>
        <div className={styles.trio}>
          <Card title="Build spending by month">
            <MonthBars spend={board.spend} currentPeriod={board.currentPeriod} />
            <p className={styles.small}>In K millions, from the Expenses tab. The striped bar is the month still running.</p>
          </Card>
          <LoanCard loan={board.loan} />
          <WallsCard walls={board.walls} />
        </div>
      </section>

      <section className={styles.section}>
        <SectionHead title="Trips, as boarding passes">Each trip is a ticket. The stamp is its status.</SectionHead>
        {board.tickets.length ? (
          <div className={styles.tickets}>
            {board.tickets.map((t) => (
              <BoardingPass key={t.id} t={t} />
            ))}
          </div>
        ) : (
          <p className="muted">No trips yet. Add one in the Trips tab.</p>
        )}
      </section>

      <section className={styles.section}>
        <SectionHead title="The savings path">
          Like a reservoir: the house drew the water down, and the plan refills it month by month.
        </SectionHead>
        <Card>
          <SavingsChart series={board.savings.series} buildMonths={board.savings.buildMonths} />
          <SavingsLegend />
        </Card>
      </section>
    </Page>
  );
}
