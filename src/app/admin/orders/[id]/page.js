"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { useParams } from 'next/navigation';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      const data = await response.json();
      setOrder(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-[#6A4E3C]"></div>
    </div>
  );

  if (!order) return (
    <div className="text-center text-red-500 text-xl mt-10">
      Order not found
    </div>
  );

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-green-200 text-green-900',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  const orderStatuses = [
    'PENDING',
    'PROCESSING',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED'
  ];

  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = order.items?.reduce((sum, item) => sum + (item.quantity * item.price), 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Order Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#6A4E3C]">Order #{order.id}</h1>
            <p className="text-gray-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          {/* Status Update Dropdown */}
          <div className="flex items-center space-x-4">
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value)}
              disabled={updating}
              className={`
                px-4 py-2 rounded-md font-semibold
                ${statusColors[order.status] || 'bg-gray-100'}
                ${updating ? 'opacity-50 cursor-not-allowed' : ''} 
                focus:outline-none focus:ring-2 focus:ring-[#6A4E3C]
              `}
            >
              {orderStatuses.map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[#6A4E3C]">Customer Information</h2>
            <p><strong>Name:</strong> {order.user?.name || 'N/A'}</p>
            <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
            <p><strong>Phone Number:</strong> {order.phoneNumber || 'N/A'}</p>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-2 text-[#6A4E3C]">Shipping Details</h2>
            <p>{order.shippingAddress || 'No shipping address provided'}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-[#6A4E3C]">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center border-b pb-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image
                    src={item.product?.images || '/placeholder-image.png'}
                    alt={item.product?.name || 'Product Image'}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium">{item.product?.name || 'Unknown Product'}</h3>
                  <p className="text-gray-600">
                    Quantity: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    ${((item.quantity || 0) * (item.price || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between">
            <div>
              <p className="font-medium text-[#6A4E3C]">Total Items:</p>
              <p className="font-medium text-[#6A4E3C]">Subtotal:</p>
              <p className="font-medium text-[#6A4E3C]">Tax (10%):</p>
              <p className="text-xl font-bold text-[#6A4E3C]">Total:</p>
            </div>
            <div className="text-right">
              <p>{totalItems}</p>
              <p>${subtotal.toFixed(2)}</p>
              <p>${(subtotal * 0.1).toFixed(2)}</p>
              <p className="text-xl font-bold text-[#6A4E3C]">${(subtotal * 1.1).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
