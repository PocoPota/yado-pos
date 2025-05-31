"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  Timestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Card, Button, message, Typography } from "antd";

const { Title } = Typography;

type Item = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Sale = {
  id: string;
  items: Item[];
  total: number;
  createdAt: any;
};

export default function ReturnsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  useEffect(() => {
    const fetchSales = async () => {
      const saleQuery = query(
        collection(db, "sales"),
        where("type", "==", "sale"),
        orderBy("createdAt", "desc")
      );
      const saleSnap = await getDocs(saleQuery);
      const saleData = saleSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[];

      const returnQuery = query(
        collection(db, "sales"),
        where("type", "==", "return")
      );
      const returnSnap = await getDocs(returnQuery);
      const returnedIds = new Set(
        returnSnap.docs.map((doc) => doc.data().returnedFrom)
      );

      const unreturnedSales = saleData.filter(
        (sale) => !returnedIds.has(sale.id)
      );

      setSales(unreturnedSales);
    };

    fetchSales();
  }, []);

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const handleReturn = async () => {
    if (!selectedSale) return;

    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      message.error("ユーザー情報が取得できません。ログインし直してください。");
      return;
    }

    const returnItems = selectedSale.items.map((item) => ({
      ...item,
      quantity: -item.quantity,
    }));

    await addDoc(collection(db, "sales"), {
      type: "return",
      items: returnItems,
      total: -selectedSale.total,
      createdAt: Timestamp.now(),
      returnedFrom: selectedSale.id,
      uid: currentUser.uid,
    });

    const targetProductIds = ["oKYDsv2zRCFldMb5n2xw", "kzv4Npr47H4veRoHpEfS", "wjIleZW1iDymcwS3oVwq"];

    const filteredReturnItems = returnItems
      .filter(item => targetProductIds.includes(item.productId))
      .map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));
    
    const totalQuantity = filteredReturnItems.reduce((sum, item) => sum + item.quantity, 0);
    
    await addDoc(collection(db, "pub_sales"), {
      items: filteredReturnItems,
      createdAt: Timestamp.now(),
    });
    

    message.success("返品を記録しました");
    setSelectedSale(null);
    setSales((prev) => prev.filter((s) => s.id !== selectedSale.id));
  };

  return (
    <main>
      <Title level={2}>修正・返品</Title>

      {!selectedSale ? (
        <div>
          {sales.map((sale) => (
            <Card key={sale.id} style={{ marginBottom: 16 }}>
              <p>日時: {sale.createdAt.toDate().toLocaleString()}</p>
              <p>
                購入品目：
                {sale.items
                  .map((item) => `${item.name}×${item.quantity}`)
                  .join(", ")}
              </p>
              <p>合計: ¥{sale.total}</p>
              <Button onClick={() => handleSelectSale(sale)}>
                返品する
              </Button>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Card style={{ marginBottom: 16 }}>
            <p>以下の会計を返品します：</p>
            <p>日時: {selectedSale.createdAt.toDate().toLocaleString()}</p>
            <p>
              購入品目：
              {selectedSale.items
                .map((item) => `${item.name}×${item.quantity}`)
                .join(", ")}
            </p>
            <p>合計: ¥{selectedSale.total}</p>
          </Card>
          <Button type="primary" onClick={handleReturn}>
            この会計をまるごと返品する
          </Button>
          <Button
            onClick={() => setSelectedSale(null)}
            style={{ marginLeft: 8 }}
          >
            戻る
          </Button>
        </div>
      )}
    </main>
  );
}
