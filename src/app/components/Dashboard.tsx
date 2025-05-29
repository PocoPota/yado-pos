"use client";

import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, Statistic, Row, Col } from "antd";

type Item = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

type Sale = {
  id: string;
  createdAt: string;
  items: Item[];
  total: number;
};

export default function Dashboard() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchSales = async () => {
      const snapshot = await getDocs(collection(db, "sales"));
      const data: Sale[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Sale, "id">),
      }));
      setSales(data);

      let units = 0;
      let revenue = 0;
      data.forEach((sale) => {
        revenue += sale.total;
        sale.items.forEach((item) => {
          units += item.quantity;
        });
      });
      setTotalUnits(units);
      setTotalRevenue(revenue);
    };

    fetchSales();
  }, []);

  return (
    <div className="p-4 space-y-6">
      <Row gutter={16}>
        <Col span={12}>
          <Card>
            <Statistic title="累計販売個数" value={totalUnits} />
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Statistic title="累計売上金額" value={totalRevenue} suffix="円" />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
