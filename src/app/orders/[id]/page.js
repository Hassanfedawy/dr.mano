"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaShoppingBag, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${id}`);
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

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  // Status tracking and color mapping
  const statusIcons = {
    PENDING: <FaShoppingBag className="text-yellow-500" />,
    PROCESSING: <FaTruck className="text-blue-500" />,
    SHIPPED: <FaTruck className="text-green-500" />,
    DELIVERED: <FaCheckCircle className="text-green-600" />,
    CANCELLED: <FaTimesCircle className="text-red-500" />
  };

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    SHIPPED: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-green-200 text-green-900',
    CANCELLED: 'bg-red-100 text-red-800'
  };

  // Calculate totals safely
  const calculateTotals = () => {
    if (!order || !order.items) return { 
      totalItems: 0, 
      subtotal: 0, 
      tax: 0, 
      total: 0 
    };

    const subtotal = order.items.reduce(
      (sum, item) => sum + (item.quantity * item.price), 
      0
    );

    return {
      totalItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      tax: subtotal * 0.1,
      total: subtotal * 1.1
    };
  };

  const { totalItems, subtotal, tax, total } = calculateTotals();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center text-red-500 text-xl mt-10">
        Order not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#F0F2F4]">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Order Header */}
        <div className="bg-[#F0F2F4] px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[#6A4E3C]">
                Order #{order.id}
              </h1>
              <p className="text-gray-500">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {statusIcons[order.status]}
              <span 
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  statusColors[order.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Shipping Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-[#6A4E3C]">Shipping Information</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Address:</strong> {order.shippingAddress}</p>
              <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-[#6A4E3C]">Order Summary</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Total Items:</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="px-6 pb-6">
          <h2 className="text-lg font-semibold mb-4 text-[#6A4E3C]">Order Items</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center border-b pb-4 last:border-b-0"
              >
                <div className="relative h-20 w-20 mr-4 flex-shrink-0">
                  <Image
                    src={item.product?.images || '/placeholder-image.png'}
                    alt={item.product?.name || 'Product Image'}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-[#6A4E3C]">
                    {item.product?.name || 'Unknown Product'}
                  </h3>
                  <p className="text-gray-600">
                    Quantity: {item.quantity} × ${item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right font-semibold text-[#6A4E3C]">
                  ${(item.quantity * item.price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
