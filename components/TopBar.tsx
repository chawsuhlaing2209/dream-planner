import { SaveChip } from "./SaveChip";
import { Tabs } from "./Tabs";
import styles from "./TopBar.module.css";

export function TopBar() {
  return (
    <header className={styles.top}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <b>Dream Planner ♡</b>
          <SaveChip />
        </div>
        <Tabs />
      </div>
    </header>
  );
}
