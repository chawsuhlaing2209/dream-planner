import { CsvLinks } from "@/components/CsvLinks";
import { addTrip, addTripLine, setTripRate, updateField } from "@/app/actions";
import { Page } from "@/components/Page";
import { Stamp } from "@/components/Stamp";
import { AddButton } from "@/components/table/AddButton";
import { Field } from "@/components/table/Field";
import { DeleteAction } from "@/components/tracker/DeleteAction";
import { TripLinesTable } from "@/components/tracker/tables";
import styles from "@/components/tracker/Tracker.module.css";
import { ratesFor, stampOf, tripTotals } from "@/lib/calc/trips";
import { getAll } from "@/lib/data/all";
import { TRIP_STATUSES } from "@/lib/db/schema";
import { foreign, kyat } from "@/lib/format";

const STATUS_OPTIONS = TRIP_STATUSES.map((s) => ({ value: s, label: s === "" ? "No status" : s }));

export default async function TripsPage() {
  const rows = await getAll();
  return (
    <Page
      eyebrow="Trips"
      title="Trips"
      lede="One card per trip. Lines can be in kyat, baht, US or Singapore dollars. Set the rate and the kyat total follows."
    >
      <CsvLinks tables={[{ key: "trips", label: "trips" }]} />
      <div className={styles.row}>
        <AddButton label="Add a trip" action={addTrip} />
      </div>
      {rows.trips.length === 0 ? <p className="muted">No trips yet. Add one above.</p> : null}
      {rows.trips.map((trip) => {
        const lines = rows.tripLines.filter((l) => l.tripId === trip.id);
        const rates = ratesFor(trip.id, rows.tripRates);
        const totals = tripTotals(lines, rates);
        const save = (field: string) => updateField.bind(null, "trips", trip.id, field);
        return (
          <section key={trip.id} className={styles.card} aria-label={trip.name || "Untitled trip"}>
            <div className={styles.cardHead}>
              <h2>{trip.name || "Untitled trip"}</h2>
              <Stamp {...stampOf(trip.status)} />
            </div>
            <div className={styles.row}>
              <Field label="Trip" type="text" width="wide" value={trip.name} save={save("name")} />
              <Field label="Where" type="text" value={trip.place} save={save("place")} />
              <Field label="Who" type="text" value={trip.who} save={save("who")} />
              <Field label="Status" type="select" value={trip.status} options={STATUS_OPTIONS} save={save("status")} />
            </div>
            <TripLinesTable caption={`${trip.name} cost lines`} rows={lines} rates={rates} />
            {totals.foreignUsed.length ? (
              <div className={styles.row}>
                {totals.foreignUsed.map((c) => (
                  <Field
                    key={c}
                    label={`K per 1 ${c}`}
                    type="number"
                    width="narrow"
                    value={rates[c] ?? 0}
                    save={setTripRate.bind(null, trip.id, c)}
                  />
                ))}
              </div>
            ) : null}
            {totals.foreignUsed.some((c) => !rates[c]) ? (
              <p className={styles.note}>Set a rate for each foreign currency, or those lines count as K 0.</p>
            ) : null}
            <div className={styles.row} style={{ justifyContent: "space-between" }}>
              <span className={styles.row}>
                <AddButton label="Add a line" action={addTripLine.bind(null, trip.id)} />
                <DeleteAction table="trips" id={trip.id} label={`Remove trip ${trip.name}`} />
              </span>
              <span className={styles.total}>
                Trip total {kyat(totals.kyat)}
                {totals.foreignUsed.length
                  ? ` (incl. ${totals.foreignUsed.map((c) => foreign(c, totals.byCurrency[c] ?? 0)).join(" + ")})`
                  : ""}
              </span>
            </div>
          </section>
        );
      })}
    </Page>
  );
}
