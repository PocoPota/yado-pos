"use client";

import styles from "./Header.module.scss";
import LoginButton from "./LoginButton";

import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, loading } = useAuth();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logo}>
          <a href="/">YadoPOS</a>
        </div>
        <div className={styles.account}>
          {!loading && !user && <LoginButton />}
          {!loading && user && <div>{user.displayName}</div>}
        </div>
      </div>
    </header>
  );
}
