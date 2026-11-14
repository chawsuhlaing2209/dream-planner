import styles from "./Page.module.css";

export function Page({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
}) {
  return (
    <main className={styles.wrap}>
      <header className={styles.head}>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
      </header>
      {children}
    </main>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
