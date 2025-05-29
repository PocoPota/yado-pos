"use client"

import LogoutButton from "@/app/components/LogoutButton";
import VerifiedOnlyComponent from "@/app/components/VerifiedOnlyComponent";
import { Typography } from "antd";

const { Title } = Typography;

export default function UserSettingPage() {
  return (
    <VerifiedOnlyComponent>
      <main>
        <Title level={2}>ユーザー設定</Title>
        <LogoutButton />
      </main>
    </VerifiedOnlyComponent>
  );
}
