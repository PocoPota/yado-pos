import VerifiedOnlyComponent from "../components/VerifiedOnlyComponent";
import { Button } from "antd";
import styles from "./page.module.scss";

export default function Settings() {
  return (
    <VerifiedOnlyComponent>
      <main>
        <div className={styles.links}>
          <Button href="/settings/products">商品設定</Button>
          <Button href="/settings/user">ユーザー設定</Button>
        </div>
      </main>
    </VerifiedOnlyComponent>
  );
}
