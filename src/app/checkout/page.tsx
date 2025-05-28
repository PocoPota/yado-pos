"use client";

import { useEffect, useState } from "react";
import { Button, Card, Modal, Spin, message } from "antd";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import VerifiedOnlyComponent from "../components/VerifiedOnlyComponent";

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function CheckoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lastSaleItems, setLastSaleItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastTotal, setLastTotal] = useState(0);

  // 商品の読み込み
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Product, "id">),
        }));
        setProducts(productsData);
      } catch (error) {
        message.error("商品データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta),
    }));
  };

  const total = products.reduce(
    (sum, product) => sum + (quantities[product.id] || 0) * product.price,
    0
  );

  const handleCheckout = async () => {
    const items = products
      .filter((p) => quantities[p.id])
      .map((p) => ({
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: quantities[p.id],
        subtotal: p.price * quantities[p.id],
      }));

    try {
      await addDoc(collection(db, "sales"), {
        items,
        total,
        createdAt: Timestamp.now(),
      });

      setLastSaleItems(items); // モーダルで表示するため保存
      setIsModalVisible(true); // モーダルを表示
      setLastTotal(total); // モーダル用合計金額
      setQuantities({});
    } catch (error) {
      message.error("会計処理に失敗しました");
    }
  };

  if (loading) {
    return (
      <main>
        <Spin className="spin" size="large" />
      </main>
    );
  }

  return (
    <VerifiedOnlyComponent>
      <main className="p-4 space-y-4">
        {products.map((product) => (
          <Card key={product.id}>
            <div className="flex justify-between items-center">
              <div>
                <div>{product.name}</div>
                <div>¥{product.price}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => handleQuantityChange(product.id, -1)}>
                  -
                </Button>
                <span>{quantities[product.id] || 0}</span>
                <Button onClick={() => handleQuantityChange(product.id, 1)}>
                  +
                </Button>
              </div>
            </div>
          </Card>
        ))}
        <div className="text-right text-xl font-bold">合計: ¥{total}</div>
        <Button
          type="primary"
          className="w-full"
          onClick={handleCheckout}
          disabled={total === 0}
        >
          会計する
        </Button>
        <Modal
          title="会計完了"
          open={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          okText="OK"
        >
          <p>以下の内容で会計が完了しました：</p>
          <ul className="space-y-1 mt-2">
            {lastSaleItems.map((item, index) => (
              <li key={index}>
                {item.name} x {item.quantity} = ¥{item.subtotal}
              </li>
            ))}
          </ul>
          <div className="mt-4 text-right font-bold">合計: ¥{lastTotal}</div>
        </Modal>
      </main>
    </VerifiedOnlyComponent>
  );
}
