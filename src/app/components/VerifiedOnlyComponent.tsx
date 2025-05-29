"use client";

import { useEffect, useState } from "react";
import {
  onAuthStateChanged,
  getAuth,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase"; // Firestore インスタンス
import { Spin } from "antd";
import styles from "./VerifiedOnlyComponent.module.scss";

export default function VerifiedOnlyComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user: FirebaseUser | null) => {
        if (!user) {
          setIsVerified(false);
          setIsLogin(false);
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          setIsVerified(false);
          return;
        }

        const userData = userDoc.data();
        setIsVerified(userData.state === "verified");
      }
    );

    return () => unsubscribe();
  }, []);

  if (isVerified === null) {
    return (
      <main>
        <Spin className="spin">読み込み中...</Spin>
      </main>
    );
  }

  if (!isLogin) {
    return (
      <main>
        <p>ログインしてください。</p>
      </main>
    );
  }

  if (!isVerified) {
    return (
      <main>
        <p>管理者から認証を受けてください</p>
      </main>
    );
  }

  return <>{children}</>;
}
