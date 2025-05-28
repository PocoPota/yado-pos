import { Button } from "antd";
import VerifiedOnlyComponent from "./components/VerifiedOnlyComponent";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <VerifiedOnlyComponent>
      <main>
        <section className={styles.links}>
          <Button href="/checkout">会計 →</Button>
          <Button href="/settings">設定 →</Button>
        </section>
      </main>
    </VerifiedOnlyComponent>
  );
}
