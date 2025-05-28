"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";

type Item = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Sale = {
  id: string;
  createdAt: any;
  items: Item[];
  total: number;
};

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);

  useEffect(() => {
    const fetchSales = async () => {
      const snapshot = await getDocs(collection(db, "sales"));
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          createdAt: d.createdAt?.toDate(), // FirestoreのTimestamp → Date
          items: d.items || [],
          total: d.total || 0,
        };
      });
      setSales(data);
    };

    fetchSales();
  }, []);

  const columns: ColumnsType<Sale> = [
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
        items.map(item => `${item.name}×${item.quantity}`).join(", "),
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
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
