import React, { useEffect, useState } from 'react';
import { storeService } from '../services/api';

const VendorStore = () => {
  const [store, setStore] = useState({ storeName: '', description: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStore = async () => {
      try {
        // In a real app, we might have /api/stores/my-store
        // For now, we fetch all and find the one belonging to the user 
        // or just try to fetch based on user context if backend provided it.
        // Since we don't have a 'my-store' endpoint, let's assume we use the user's ID
        // but for simplicity in this demo, we'll list stores and let the user select 
        // or we'll assume a logic where we fetch the store linked to the current user.
        
        const res = await storeService.getAllStores();
        // This is a simplification: find store where VendorId matches current user
        // In production, the backend should provide /api/stores/me
        const myStore = res.data.find(s => s.VendorId === parseInt(localStorage.getItem('user_id'))); 
        
        if (myStore) {
          setStore(myStore);
        }
      } catch (error) {
        console.error('Error fetching store:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      if (store.StoreId) {
        await storeService.updateStore(store.StoreId, store);
        setMessage('Store updated successfully!');
      } else {
        await storeService.createStore(store);
        setMessage('Store created successfully!');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to save store');
    }
  };

  if (loading) return <div className="p-6">Loading Store Profile...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Store Profile</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input 
            type="text" 
            value={store.storeName || store.StoreName || ''} 
            onChange={(e) => setStore({...store, storeName: e.target.value})}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Enter your store name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea 
            value={store.description || store.Description || ''} 
            onChange={(e) => setStore({...store, description: e.target.value})}
            className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Tell customers about your shop..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
          <input 
            type="text" 
            value={store.logo || store.Logo || ''} 
            onChange={(e) => setStore({...store, logo: e.target.value})}
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://example.com/logo.png"
          />
        </div>

        {message && (
          <div className={`p-3 rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          {store.StoreId ? 'Update Store' : 'Create Store'}
        </button>
      </form>
    </div>
  );
};

export default VendorStore;
