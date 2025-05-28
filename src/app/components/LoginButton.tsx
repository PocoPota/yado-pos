"use client";

import { auth, provider, db } from "../lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Button } from "antd";

export default function LoginButton() {
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // 初回ログイン時にユーザー情報を登録
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email,
          state: "unverified",
        });
      }

      // TODO: 画面遷移など必要な処理をここに
    } catch (err) {
      console.error("ログイン失敗:", err);
    }
  };

  return (
    <Button type="primary" onClick={handleLogin}>
      Googleでログイン
    </Button>
  );
}
