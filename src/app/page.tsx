import VerifiedOnlyComponent from "./components/VerifiedOnlyComponent";
import styles from "./page.module.css";

export default function Home() {
  return (
    <VerifiedOnlyComponent>
      <main>
        <section>
          <ul>
            <li>
              <a href="/checkout">会計</a>
            </li>
            <li>
              <a href="/settings">設定</a>
            </li>
          </ul>
        </section>
      </main>
    </VerifiedOnlyComponent>
  );
}
