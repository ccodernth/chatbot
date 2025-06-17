import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Order {
  _id: string;
  status: string;
  // İstersen diğer detay alanlarını da ekleyebilirsin
}

export default function Order() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token || !id) return;
    fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrder(data))
      .catch(console.error);
  }, [id, token]);

  if (!order)
    return (
      <main className="max-w-xl mx-auto p-6 text-center text-gray-600">
        Yükleniyor...
      </main>
    );

  return (
    <main className="max-w-xl mx-auto p-6 bg-white shadow rounded-md">
      <h1 className="text-2xl font-bold mb-4">Sipariş Detayı</h1>
      <p className="mb-2">
        <span className="font-semibold">Sipariş ID:</span> {order._id}
      </p>
      <p>
        <span className="font-semibold">Durum:</span> {order.status}
      </p>
    </main>
  );
}
