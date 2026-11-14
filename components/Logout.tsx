"use client";

import { usePathname } from "next/navigation";
import { logout } from "@/app/login/actions";
import styles from "./TopBar.module.css";

export function Logout() {
  if (usePathname() === "/login") return null;
  return (
    <form action={logout}>
      <button type="submit" className={styles.logout}>
        Log out
      </button>
    </form>
  );
}
