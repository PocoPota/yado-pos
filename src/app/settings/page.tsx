"use client"

import VerifiedOnlyComponent from "../components/VerifiedOnlyComponent";
import { Button, Typography } from "antd";
import styles from "./page.module.scss";

const { Title } = Typography;

export default function Settings() {
  return (
    <VerifiedOnlyComponent>
      <main>
        <Title level={2}>会計</Title>
        <div className={styles.links}>
          <Button href="/settings/products">商品設定</Button>
          <Button href="/settings/user">ユーザー設定</Button>
        </div>
      </main>
    </VerifiedOnlyComponent>
  );
}
