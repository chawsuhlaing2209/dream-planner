"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Tabs.module.css";

export const TABS = [
  { href: "/", label: "Board" },
  { href: "/home", label: "Home budget" },
  { href: "/expenses", label: "Expenses" },
  { href: "/materials", label: "Materials" },
  { href: "/labour", label: "Labour" },
  { href: "/trips", label: "Trips" },
  { href: "/savings", label: "Savings" },
] as const;

export function Tabs() {
  const path = usePathname();
  if (path === "/login") return null;
  return (
    <nav className={styles.nav} aria-label="Sections">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} aria-current={path === t.href ? "page" : undefined}>
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
