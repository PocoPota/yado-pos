import { Button } from "antd";
import VerifiedOnlyComponent from "./components/VerifiedOnlyComponent";
import styles from "./page.module.scss";
import Dashboard from "./components/Dashboard";
import Record from "./components/Record";

export default function Home() {
  return (
    <VerifiedOnlyComponent>
      <main className={styles.home}>
        <section className={styles.links}>
          <Button href="/checkout">会計 →</Button>
          <Button href="/returns">修正・返品 →</Button>
          <Button href="/settings">設定 →</Button>
        </section>
        <section>
          <Dashboard />
        </section>
        <section>
          <Record />
        </section>
      </main>
    </VerifiedOnlyComponent>
  );
}
