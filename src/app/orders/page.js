"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import Link from "next/link";

export default function OrdersPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

 

  return <OrdersPageInner />;
}

function OrdersPageInner() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No Orders Found"
        description="You have not placed any orders yet."
        actionLink="/products"
        actionText="Browse Products"
      />
    );
  }

  return (
    <div className="container mx-auto p-4 bg-[#F0F2F4]">
      <h1 className="text-2xl font-bold mb-6 text-[#6A4E3C]">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white shadow-md rounded-md p-4">
            <h2 className="text-xl font-semibold text-[#6A4E3C]">
              Order ID: {order.id}
            </h2>
            <p>Status: <span className="font-medium">{order.status}</span></p>
            <p>Total: <span className="font-medium">${order.total}</span></p>
            <p>Shipping Address: <span className="font-medium">{order.shippingAddress}</span></p>
            <p>Payment Method: <span className="font-medium">{order.paymentMethod}</span></p>
            <div className="mt-4">
              <Link href={`/orders/${order.id}`} className="text-[#6A4E3C] hover:text-[#4E3B2D] hover:underline">
                View Order Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
