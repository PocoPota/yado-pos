"use client";

import { useEffect, useState } from "react";
import { Button, Card, Modal, Spin, message, Typography } from "antd";
import { collection, getDocs, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import VerifiedOnlyComponent from "../components/VerifiedOnlyComponent";
import styles from "./page.module.scss";

const { Title } = Typography;

type Product = {
  id: string;
  name: string;
  price: number;
  order: number;
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
        productsData.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
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
        <Spin className="spin">読み込み中...</Spin>
      </main>
    );
  }

  return (
    <VerifiedOnlyComponent>
      <main className="p-4 space-y-4">
        <Title level={2} className={styles.title}>
          会計
        </Title>
        <div className={styles.cards}>
          {products.map((product) => (
            <Card key={product.id} className={styles.card}>
              <div>
                <div>
                  <div className={styles.name}>{product.name}</div>
                  <div className={styles.price}>¥{product.price}</div>
                </div>
                <div className={styles.buttons}>
                  <Button
                    color="primary"
                    variant="solid"
                    onClick={() => handleQuantityChange(product.id, -1)}
                  >
                    -
                  </Button>
                  <span className={styles.count}>
                    {quantities[product.id] || 0}
                  </span>
                  <Button
                    color="danger"
                    variant="solid"
                    onClick={() => handleQuantityChange(product.id, 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className={styles.control}>
          <div className={styles.total}>合計: ¥{total}</div>
          <Button
            type="primary"
            className="w-full"
            onClick={handleCheckout}
            disabled={total === 0}
          >
            会計する
          </Button>
        </div>
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
