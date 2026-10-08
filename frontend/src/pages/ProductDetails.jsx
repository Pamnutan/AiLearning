import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams } from 'react-router-dom';
import { productService } from '../services/api';

const ProductDetails = () => {
  const { user } = useAuth();
  const cartKey = 'cart_' + (user?.id || user?.email || 'guest');
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getProduct(id);
        setProduct(res.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    const existingItem = cart.find(item => item.productId === product.ProductId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ 
        productId: product.ProductId, 
        name: product.Name, 
        price: product.Price, 
        quantity,
        storeId: product.StoreId 
      });
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    alert('Added to cart!');
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Product...</div>;
  if (!product) return <div className="flex justify-center items-center h-screen">Product not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-8xl font-bold border">
          {product.Name[0]}
        </div>
        
        <div className="flex flex-col justify-center">
          <span className="text-blue-600 font-semibold mb-2">{product.Category}</span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.Name}</h1>
          <p className="text-3xl text-green-600 font-bold mb-6">${product.Price}</p>
          
          <div className="mb-8 p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-500">Sold by:</p>
            <p className="font-semibold text-gray-800">{product.StoreName}</p>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border rounded-lg">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="px-4 py-2 hover:bg-gray-100 border-r"
              >-</button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="px-4 py-2 hover:bg-gray-100 border-l"
              >+</button>
            </div>
            <button 
              onClick={addToCart}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            Stock available: <span className={product.Stock > 0 ? 'text-green-600' : 'text-red-600'}>{product.Stock}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
