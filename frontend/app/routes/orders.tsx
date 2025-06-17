import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Order {
  _id: string;
  status: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;
    fetch("/api/orders/myorders", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch(console.error);
  }, [token]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Siparişlerim</h1>
      <ul className="space-y-4">
        {orders.map((o) => (
          <li
            key={o._id}
            className="border p-4 rounded-md shadow hover:shadow-lg transition-shadow"
          >
            <Link
              to={`/orders/${o._id}`}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Sipariş ID: {o._id}
            </Link>{" "}
            - <span className="text-gray-700">Durum: {o.status}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
