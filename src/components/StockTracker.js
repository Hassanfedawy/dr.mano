'use client';

import { useState, useEffect } from 'react';

export default function StockTracker({ productId, initialStock }) {
  const [stock, setStock] = useState(initialStock);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStock, setNewStock] = useState(initialStock);

  const handleUpdateStock = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stock: newStock })
      });

      if (response.ok) {
        const data = await response.json();
        setStock(data.stock);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-700">Stock</label>
        {isEditing ? (
          <input
            type="number"
            value={newStock}
            onChange={(e) => setNewStock(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
          />
        ) : (
          <p className={`mt-1 ${stock <= 10 ? 'text-red-600' : 'text-gray-900'}`}>
            {stock} units available
          </p>
        )}
      </div>
      {isEditing ? (
        <div className="flex space-x-2">
          <button
            onClick={handleUpdateStock}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? 'Updating...' : 'Save'}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setNewStock(stock);
            }}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Update Stock
        </button>
      )}
    </div>
  );
}