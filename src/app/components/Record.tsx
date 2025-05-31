"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import {
  collection,
  query,
  getDocs,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { Table, Card, Checkbox, message } from "antd";
import type { ColumnsType } from "antd/es/table";

type Item = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Sale = {
  id: string;
  createdAt: Date;
  items: Item[];
  total: number;
  provided: boolean;
  type: string;
};

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "sales"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          createdAt: d.createdAt?.toDate(),
          items: d.items || [],
          total: d.total || 0,
          provided: d.provided || false,
          type: d.type || "sale",
        };
      });
      setSales(data);
    });

    return () => unsubscribe();
  }, []);

  const handleCheckboxChange = async (sale: Sale, checked: boolean) => {
    try {
      setLoading(true);
      const saleRef = doc(db, "sales", sale.id);
      await updateDoc(saleRef, { provided: checked });
      message.success("提供状態を更新しました");
    } catch (error) {
      console.error("更新エラー:", error);
      message.error("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Sale> = [
    {
      title: "提供済み",
      key: "provided",
      render: (_, record) =>
        record.type === "sale" ? (
          <Checkbox
            checked={record.provided}
            onChange={(e) =>
              handleCheckboxChange(record, e.target.checked)
            }
          />
        ) : (
          <span style={{ color: "#888" }}>—</span>
        ),
    },
    {
      title: "購入日時",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date) => date?.toLocaleString(),
    },
    {
      title: "商品一覧",
      dataIndex: "items",
      key: "items",
      render: (items: Item[]) =>
        items.map((item) => `${item.name}×${item.quantity}`).join(", "),
    },
    {
      title: "合計金額",
      dataIndex: "total",
      key: "total",
      render: (amount: number) => `${amount.toLocaleString()}円`,
    },
  ];

  return (
    <Card title="購入履歴">
      <Table
        dataSource={sales}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
