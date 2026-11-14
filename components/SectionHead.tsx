import styles from "./SectionHead.module.css";

export function SectionHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className={styles.head}>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
