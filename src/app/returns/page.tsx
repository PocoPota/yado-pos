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
import { Card, Button, InputNumber, message, Typography } from "antd";

const { Title, Text } = Typography;

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
  const [returnQuantities, setReturnQuantities] = useState<{
    [id: string]: number;
  }>({});

  useEffect(() => {
    const fetchSales = async () => {
      // 1. 通常の売上データを取得
      const saleQuery = query(
        collection(db, "sales"),
        where("type", "==", "sale")
      );
      const saleSnap = await getDocs(saleQuery);
      const saleData = saleSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[];

      // 2. 返品記録を取得（returnedFrom を参照）
      const returnQuery = query(
        collection(db, "sales"),
        where("type", "==", "return")
      );
      const returnSnap = await getDocs(returnQuery);
      const returnedIds = new Set(
        returnSnap.docs.map((doc) => doc.data().returnedFrom)
      );

      // 3. すでに返品された sale.id を除外
      const unreturnedSales = saleData.filter(
        (sale) => !returnedIds.has(sale.id)
      );

      setSales(unreturnedSales);
    };

    fetchSales();
  }, []);

  const handleSelectSale = (sale: Sale) => {
    setSelectedSale(sale);
    const initialQuantities: { [id: string]: number } = {};
    sale.items.forEach((item) => {
      initialQuantities[item.productId] = 0;
    });
    setReturnQuantities(initialQuantities);
  };

  const handleQuantityChange = (productId: string, value: number | null) => {
    setReturnQuantities((prev) => ({
      ...prev,
      [productId]: value ?? 0,
    }));
  };

  const handleReturn = async () => {
    if (!selectedSale) return;

    const returnItems = selectedSale.items
      .map((item) => {
        const quantity = returnQuantities[item.productId];
        return quantity > 0 ? { ...item, quantity: -quantity } : null;
      })
      .filter(Boolean) as Item[];

    if (returnItems.length === 0) {
      message.warning("返品する商品を選んでください");
      return;
    }

    const total = returnItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    await addDoc(collection(db, "sales"), {
      type: "return",
      items: returnItems,
      total,
      createdAt: Timestamp.now(),
      returnedFrom: selectedSale.id,
    });

    message.success("返品を記録しました");
    setSelectedSale(null);
    setReturnQuantities({});
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
              <Button onClick={() => handleSelectSale(sale)}>修正・返品処理</Button>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <h2>商品ごとに返品数を指定</h2>
          {selectedSale.items.map((item) => (
            <Card key={item.productId} style={{ marginBottom: 12 }}>
              <p>
                {item.name} ¥{item.price} × {item.quantity}
              </p>
              <InputNumber
                min={0}
                max={item.quantity}
                value={returnQuantities[item.productId]}
                onChange={(value) =>
                  handleQuantityChange(item.productId, value)
                }
              />
            </Card>
          ))}
          <Button type="primary" onClick={handleReturn}>
            返品を記録する
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
