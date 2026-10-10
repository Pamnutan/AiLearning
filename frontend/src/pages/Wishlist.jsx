import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { wishlistService } from '../services/api';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  const { user } = useAuth();
  const cartKey = 'cart_' + (user?.id || user?.email || 'guest');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await wishlistService.getWishlist();
        setItems(res.data);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (id) => {
    try {
      await wishlistService.removeFromWishlist(id);
      setItems(items.filter(item => item.WishlistItemId !== id));
    } catch (error) {
      alert('Failed to remove item');
    }
  };

  const moveToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existingItem = cart.find(item => item.productId === product.ProductId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ 
        productId: product.ProductId, 
        name: product.Name, 
        price: product.Price, 
        quantity: 1,
        storeId: product.StoreId 
      });
    }
    localStorage.setItem(cartKey, JSON.stringify(cart));
    alert('Moved to cart!');
    navigate('/cart');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Wishlist...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500">Your wishlist is empty</p>
          <button onClick={() => navigate('/')} className="mt-4 text-indigo-600 font-semibold">Start Shopping</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.WishlistItemId} className="p-4 border rounded-lg bg-white shadow-sm">
              <div className="aspect-square bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400 text-4xl font-bold">
                {item.Name[0]}
              </div>
              <h3 className="font-bold text-lg mb-1">{item.Name}</h3>
              <p className="text-green-600 font-bold mb-4">${item.Price}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => moveToCart(item)}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
                <button 
                  onClick={() => handleRemove(item.WishlistItemId)}
                  className="p-2 border rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;