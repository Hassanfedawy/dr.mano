'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Color Palette
const colors = {
  primary: '#6A4E3C',
  secondary: '#4E3B2D',
  neutral: '#D9DADA',
  accent: '#F0F2F4',
  error: '#F56C6C',
  success: '#6DBE45',
};

// Loader Component
const Loader = () => (
  <div className="flex justify-center items-center space-x-2">
    <div className="w-4 h-4 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    <span>Loading products...</span>
  </div>
);

// ProductList Component
const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    image: '', // Changed to handle a single image
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Fetch products from API
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form submission for adding a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    if (!formData.name || !formData.price || !formData.image || !formData.description || !formData.stock) {
      setError('All fields are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('Product added successfully!');
        fetchProducts(); // Reload the product list
        setFormData({ name: '', description: '', price: '', stock: '', image: '' }); // Reset form
        setError(null); // Clear any existing errors
      } else {
        setError('Failed to add product.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      setError('An error occurred while adding the product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'wjlbtoqe'); // Replace with your actual Cloudinary preset

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dfnhgsxua/image/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await response.json();
      setFormData((prev) => ({ ...prev, image: data.secure_url })); // Single image upload handling
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Image upload failed. Please try again.');
    }
  };

  const handleDelete = async (productId) => {
    const confirmation = window.confirm('Are you sure you want to delete this product?');
    if (!confirmation) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        setMessage('Product deleted successfully!');
        fetchProducts(); // Reload the product list
      } else {
        setError('Failed to delete product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setError('An error occurred while deleting the product.');
    }
  };

  return (
    <div className="container mx-auto p-6" style={{ backgroundColor: colors.neutral }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: colors.primary }}>Product List</h2>

      {/* Add Product Form */}
      <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: colors.primary }}>Add New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 bg-red-100 text-red-700 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 p-4 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{message}</span>
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Product Title</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full border rounded-lg p-2"
            required
            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded-lg p-2"
            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full border rounded-lg p-2"
            required
            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Stock</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full border rounded-lg p-2"
            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Image</label>
          <input
            type="file"
            onChange={handleImageUpload}
            className="w-full"
          />
          {formData.image && (
            <img
              src={formData.image}
              alt="Product"
              className="mt-2 rounded-lg"
              width={100}
              height={100}
            />
          )}
        </div>
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
            style={{ backgroundColor: colors.primary }}
          >
            {isSubmitting ? 'Saving...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductList;
