'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast.success('Order status updated successfully');
      fetchOrders(); // Refresh orders list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredOrders = orders.filter(order =>
    filter === 'ALL' || order.status === filter
  );

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-green-200 text-green-900',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  if (loading) {
    return <div className="text-center py-10">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#6A4E3C] mb-4 md:mb-0">Order Management</h1>
        <div className="flex flex-wrap justify-center gap-2">
          {['ALL', 'PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded transition duration-300 ease-in-out text-sm ${
                filter === status
                  ? 'bg-[#6A4E3C] text-white'
                  : 'bg-[#F0F2F4] text-[#4E3B2D]'
              } hover:bg-[#D9DADA]`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No orders found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map(order => (
            <div 
              key={order.id} 
              className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Order #{order.id.slice(-6)}</span>
                <span 
                  className={`px-2 py-1 rounded-full text-xs ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  {order.status}
                </span>
              </div>
              <div className="mb-2">
                <p className="text-sm text-gray-700">
                  <strong>Customer:</strong> {order.user?.name || 'Unknown'}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Total:</strong> ${order.total.toFixed(2)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={() => router.push(`/admin/orders/${order.id}`)}
                  className="text-sm text-[#6A4E3C] hover:underline"
                >
                  View Details
                </button>
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  {Object.keys(statusColors).map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}