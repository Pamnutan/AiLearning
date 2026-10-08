import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { storeService, productService } from '../services/api';

const VendorProducts = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', category: '', stock: '', storeId: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const storesRes = await storeService.getAllStores();
      const userId = user?.id || user?.userId || parseInt(localStorage.getItem('user_id') || '0');
      const myStore = storesRes.data.find(s => s.VendorId === userId);
      const storeId = myStore?.StoreId || 0;
      const res = await productService.getProducts({ storeId: storeId });
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Ensure storeId is set to vendor's store
      const storesRes = await storeService.getAllStores();
      const userId = user?.id || user?.userId || parseInt(localStorage.getItem('user_id') || '0');
      const myStore = storesRes.data.find(s => s.VendorId === userId);
      const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock || 0), storeId: myStore?.StoreId || formData.storeId || 0 };
      if (formData.ProductId) {
        await productService.updateProduct(formData.ProductId, payload);
        setMessage('Product updated!');
      } else {
        await productService.createProduct(payload);
        setMessage('Product created!');
      }
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      fetchProducts();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  if (loading) return <div className="p-6">Loading Products...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Inventory</h1>
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold mb-4">{formData.ProductId ? 'Edit Product' : 'Add New Product'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              placeholder="Product Name" 
              className="p-2 border rounded-lg"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
            <input 
              type="number" 
              placeholder="Price" 
              className="p-2 border rounded-lg"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              required
            />
            <input 
              placeholder="Category" 
              className="p-2 border rounded-lg"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              required
            />
            <input 
              type="number" 
              placeholder="Stock" 
              className="p-2 border rounded-lg"
              value={formData.stock}
              onChange={(e) => setFormData({...formData, stock: e.target.value})}
              required
            />
            <input
              type="hidden"
              value={formData.storeId}
              onChange={(e) => setFormData({...formData, storeId: e.target.value})}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">Save</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
          {message && <p className="mt-2 text-sm">{message}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product.ProductId} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{product.Name}</h3>
              <p className="text-sm text-gray-500">${product.Price} | Stock: {product.Stock}</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setFormData({
                    ProductId: product.ProductId,
                    name: product.Name || '',
                    price: product.Price || '',
                    category: product.Category || '',
                    stock: product.Stock || '',
                    storeId: product.StoreId || ''
                  });
                  setShowForm(true);
                  setMessage('');
                }}
                className="text-blue-600 hover:underline text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(product.ProductId)}
                className="text-red-600 hover:underline text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VendorProducts;
