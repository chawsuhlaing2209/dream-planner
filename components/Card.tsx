import styles from "./Card.module.css";

export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`${styles.card} ${className ?? ""}`}>
      {title ? <h3>{title}</h3> : null}
      {children}
    </div>
  );
}
