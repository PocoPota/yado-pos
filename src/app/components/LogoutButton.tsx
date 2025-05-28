"use client";

import { Button } from "antd";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      console.log("ログアウトしました");
    } catch (error) {
      console.error("ログアウトに失敗しました:", error);
    }
  };

  return (
    <Button type="default" onClick={handleLogout}>
      ログアウト
    </Button>
  );
}
