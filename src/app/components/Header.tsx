import { Button } from "antd";
import styles from "./Header.module.scss";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.logo}>YadoPOS</div>
        <div>
          <Button>Googleでログイン</Button>
        </div>
      </div>
    </header>
  );
}
