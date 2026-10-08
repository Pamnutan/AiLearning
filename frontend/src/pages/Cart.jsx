import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/api';

const Cart = () => {
  const { user } = useAuth();
  const cartKey = 'cart_' + (user?.id || user?.email || 'guest');
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(JSON.parse(localStorage.getItem(cartKey) || '[]'));
  }, [cartKey]);

  const updateQuantity = (productId, delta) => {
    const newCart = cartItems.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCartItems(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
  };

  const removeItem = (productId) => {
    const newCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(newCart);
    localStorage.setItem(cartKey, JSON.stringify(newCart));
  };

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    try {
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      };
      const res = await orderService.createOrder(orderData);
      alert(`Order placed successfully! Order ID: ${res.data.orderId}`);
      localStorage.removeItem(cartKey);
      setCartItems([]);
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Checkout failed');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <button onClick={() => navigate('/')} className="text-blue-600 underline">Go shopping</button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="space-y-4 mb-8">
        {cartItems.map(item => (
          <div key={item.productId} className="flex items-center justify-between p-4 border rounded-lg bg-white">
            <div>
              <h3 className="font-bold text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500">${item.price} each</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => updateQuantity(item.productId, -1)} className="px-3 py-1 hover:bg-gray-100 border-r">-</button>
                <span className="px-3 py-1">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, 1)} className="px-3 py-1 hover:bg-gray-100 border-l">+</button>
              </div>
              <span className="font-bold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700">✕</button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center p-6 bg-gray-50 rounded-xl border">
        <div>
          <p className="text-gray-600">Total Amount</p>
          <p className="text-3xl font-bold">${total.toFixed(2)}</p>
        </div>
        <button 
          onClick={handleCheckout}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
        >
          Place Order
        </button>
      </div>
    </div>
  );
};

export default Cart;
