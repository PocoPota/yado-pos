"use client";

import {
  Button,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import VerifiedOnlyComponent from "@/app/components/VerifiedOnlyComponent";

const { Title } = Typography;

type Product = {
  id: string;
  name: string;
  price: number;
};

export default function ProductSettingsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<string | null>(null);

  // Firestoreから商品取得
  const fetchProducts = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "products"));
    const docs = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Product, "id">),
    }));
    setProducts(docs);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 登録処理
  const onCreate = async (values: { name: string; price: number }) => {
    try {
      await addDoc(collection(db, "products"), {
        ...values,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      message.success("商品を追加しました");
      form.resetFields();
      fetchProducts();
    } catch (e) {
      message.error("追加に失敗しました");
    }
  };

  // 編集処理
  const onSave = async (id: string, name: string, price: number) => {
    try {
      await updateDoc(doc(db, "products", id), {
        name,
        price,
        updatedAt: serverTimestamp(),
      });
      message.success("商品を更新しました");
      setEditingId(null);
      fetchProducts();
    } catch (e) {
      message.error("更新に失敗しました");
    }
  };

  // 削除処理
  const onDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
      message.success("商品を削除しました");
      fetchProducts();
    } catch (e) {
      message.error("削除に失敗しました");
    }
  };

  const columns = [
    {
      title: "商品名",
      dataIndex: "name",
      render: (_: any, record: Product) =>
        editingId === record.id ? (
          <Input
            defaultValue={record.name}
            onChange={(e) => (record.name = e.target.value)}
          />
        ) : (
          record.name
        ),
    },
    {
      title: "価格",
      dataIndex: "price",
      render: (_: any, record: Product) =>
        editingId === record.id ? (
          <InputNumber
            min={0}
            defaultValue={record.price}
            onChange={(val) => (record.price = val ?? 0)}
          />
        ) : (
          `¥${record.price}`
        ),
    },
    {
      title: "操作",
      render: (_: any, record: Product) =>
        editingId === record.id ? (
          <Space>
            <Button
              type="link"
              onClick={() => onSave(record.id, record.name, record.price)}
            >
              保存
            </Button>
            <Button type="link" danger onClick={() => setEditingId(null)}>
              キャンセル
            </Button>
          </Space>
        ) : (
          <Space>
            <Button type="link" onClick={() => setEditingId(record.id)}>
              編集
            </Button>
            <Popconfirm
              title="削除してもよろしいですか？"
              onConfirm={() => onDelete(record.id)}
            >
              <Button type="link" danger>
                削除
              </Button>
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <VerifiedOnlyComponent>
      <main>
        <Title level={2}>商品管理</Title>
        <Form
          form={form}
          layout="inline"
          onFinish={onCreate}
          style={{ marginBottom: 24 }}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: "商品名を入力してください" }]}
          >
            <Input placeholder="商品名" />
          </Form.Item>
          <Form.Item
            name="price"
            rules={[{ required: true, message: "価格を入力してください" }]}
          >
            <InputNumber placeholder="価格" min={0} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              追加
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </main>
    </VerifiedOnlyComponent>
  );
}
