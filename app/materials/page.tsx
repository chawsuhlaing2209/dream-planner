import { CsvLinks } from "@/components/CsvLinks";
import { addMaterial } from "@/app/actions";
import { Page } from "@/components/Page";
import { SumRow } from "@/components/SumRow";
import { AddButton } from "@/components/table/AddButton";
import { MaterialsTable } from "@/components/tracker/tables";
import styles from "@/components/tracker/Tracker.module.css";
import { materialTotals } from "@/lib/calc/materials";
import { getAll } from "@/lib/data/all";
import { kyat } from "@/lib/format";

export default async function MaterialsPage() {
  const rows = await getAll();
  const t = materialTotals(rows.materials);
  return (
    <Page
      eyebrow="Home"
      title="Materials"
      lede="Every purchase with its quantity and price. Left is the total minus what is paid."
    >
      <CsvLinks tables={[{ key: "materials", label: "materials" }]} />
      <SumRow
        items={[
          { value: kyat(t.totalCost), label: "Total cost" },
          { value: kyat(t.paid), label: "Paid" },
          { value: kyat(t.left), label: "Left to pay", warn: t.left < 0 },
        ]}
      />
      <section className={styles.section}>
        <div className={styles.row}>
          <AddButton label="Add a purchase" action={addMaterial} />
        </div>
        <MaterialsTable rows={rows.materials} />
        <p className={styles.note}>
          Changing Price or Qty needed sets Total cost to price × quantity. Type over Total cost for a discount.
        </p>
      </section>
    </Page>
  );
}
