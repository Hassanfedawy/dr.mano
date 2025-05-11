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
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mainDescription: '',
    subDescription: '',
    price: '',
    originalPrice: '',
    discountPercentage: '',
    stock: '',
    image: '', // Changed to handle a single image
    category: '', // Category slug
    link: '', // Optional external link
  });

  // State for editing mode
  const [editMode, setEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
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
        // Fetch products with their categories
        const productsWithCategories = await Promise.all(
          data.products.map(async (product) => {
            if (product.categoryId) {
              try {
                // We'll use the categories from the state if available
                return product;
              } catch (error) {
                console.error('Error fetching category for product:', error);
                return product;
              }
            }
            return product;
          })
        );
        setProducts(productsWithCategories);
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

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Reset form to default values
  const resetForm = () => {
    setFormData({
      name: '',
      mainDescription: '',
      subDescription: '',
      price: '',
      originalPrice: '',
      discountPercentage: '',
      stock: '',
      image: '',
      category: '',
      link: ''
    });
    setEditMode(false);
    setEditingProductId(null);
  };

  // Handle form submission for adding or updating a product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    // All fields are now optional

    try {
      // Determine if we're adding or updating
      const isUpdating = editMode && editingProductId;
      const url = isUpdating ? `/api/products/${editingProductId}` : '/api/products';
      const method = isUpdating ? 'PUT' : 'POST';

      // Prepare the data for submission
      const submissionData = { ...formData };

      // Ensure numeric fields are properly formatted
      if (submissionData.price) submissionData.price = parseFloat(submissionData.price);
      if (submissionData.originalPrice) submissionData.originalPrice = parseFloat(submissionData.originalPrice);
      if (submissionData.discountPercentage) submissionData.discountPercentage = parseInt(submissionData.discountPercentage);
      if (submissionData.stock) submissionData.stock = parseInt(submissionData.stock);

      console.log('Submitting product data:', submissionData);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage(isUpdating ? 'Product updated successfully!' : 'Product added successfully!');
        fetchProducts(); // Reload the product list
        resetForm(); // Reset form and exit edit mode
      } else {
        console.error('API error response:', responseData);
        setError(responseData.error || (isUpdating ? 'Failed to update product.' : 'Failed to add product.'));
      }
    } catch (error) {
      console.error(isUpdating ? 'Error updating product:' : 'Error adding product:', error);
      setError(`An error occurred while ${editMode ? 'updating' : 'adding'} the product: ${error.message}`);
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

  const handleEdit = (product) => {
    // Set form data with product values
    setFormData({
      name: product.name || '',
      mainDescription: product.mainDescription || '',
      subDescription: product.subDescription || '',
      price: product.price?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      discountPercentage: product.discountPercentage?.toString() || '',
      stock: product.stock?.toString() || '',
      image: product.images || '', // Database field is 'images', form field is 'image'
      category: product.category?.slug || '',
      link: product.link || '',
    });

    // Set edit mode
    setEditMode(true);
    setEditingProductId(product.id);

    // Scroll to form
    document.getElementById('product-form').scrollIntoView({ behavior: 'smooth' });
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

        // If we were editing this product, reset the form
        if (editingProductId === productId) {
          resetForm();
        }
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

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <p className="text-center py-4">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {products.map((product) => (
            <div key={product.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center mb-2">
                <div className="w-16 h-16 relative mr-4">
                  <img
                    src={product.images || '/Images/placeholder.jpg'}
                    alt={product.name}
                    className="object-cover w-full h-full rounded"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{product.name}</h3>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600">{product.price.toFixed(2)} جنيه</p>
                    {product.originalPrice && (
                      <p className="text-xs text-gray-500 line-through">{product.originalPrice.toFixed(2)} جنيه</p>
                    )}
                    {product.discountPercentage && (
                      <span className="text-xs text-orange-500 font-medium">{product.discountPercentage}% OFF</span>
                    )}
                  </div>
                  {product.category ? (
                    <span className="inline-block bg-beige-light text-brown-dark text-xs px-2 py-1 rounded mt-1">
                      {product.category.name}
                    </span>
                  ) : (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mt-1">
                      Uncategorized
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Product Form */}
      <h2 className="text-xl font-bold mt-8 mb-4" style={{ color: colors.primary }}>
        {editMode ? 'Edit Product' : 'Add New Product'}
      </h2>
      <form id="product-form" onSubmit={handleSubmit} className="space-y-4">
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

            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Main Description</label>
          <textarea
            value={formData.mainDescription}
            onChange={(e) => setFormData({ ...formData, mainDescription: e.target.value })}
            className="w-full border rounded-lg p-2"

            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Sub Description</label>
          <textarea
            value={formData.subDescription}
            onChange={(e) => setFormData({ ...formData, subDescription: e.target.value })}
            className="w-full border rounded-lg p-2"

            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Current Price</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full border rounded-lg p-2"

            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Original Price (if on sale)</label>
          <input
            type="number"
            value={formData.originalPrice}
            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
            className="w-full border rounded-lg p-2"
            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Discount Percentage</label>
          <input
            type="number"
            value={formData.discountPercentage}
            onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
            className="w-full border rounded-lg p-2"
            style={{ borderColor: colors.secondary }}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>External Link (Optional)</label>
          <input
            type="url"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            className="w-full border rounded-lg p-2"
            placeholder="https://example.com"
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
          <label className="block text-sm font-semibold" style={{ color: colors.primary }}>Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full border rounded-lg p-2"
            style={{ borderColor: colors.secondary }}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
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
        <div className="flex space-x-4">
          {editMode && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition duration-300"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
            style={{ backgroundColor: colors.primary }}
          >
            {isSubmitting ? 'Saving...' : editMode ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductList;
