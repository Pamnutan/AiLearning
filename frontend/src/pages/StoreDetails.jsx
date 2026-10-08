import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, Link } from 'react-router-dom';
import { storeService, productService, wishlistService } from '../services/api';
import { ShoppingCart, Heart } from 'lucide-react';

const StoreDetails = () => {
  const { user } = useAuth();
  const cartKey = 'cart_' + (user?.id || user?.email || 'guest');
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const storeRes = await storeService.getStore(id);
        setStore(storeRes.data);
        const productsRes = await productService.getProducts({ storeId: id });
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching store details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreData();
  }, [id]);

  const handleAddToCart = (product) => {
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
    alert(`${product.Name} added to cart!`);
  };

  const handleAddToWishlist = async (product) => {
    try {
      await wishlistService.addToWishlist({ productId: product.ProductId });
      alert('Added to wishlist!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Store...</div>;
  if (!store) return <div className="flex justify-center items-center h-screen">Store not found</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 mb-12 items-center">
        <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg">
          {store.Logo ? (
            <img src={store.Logo} alt={store.StoreName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">{store.StoreName[0]}</div>
          )}
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{store.StoreName}</h1>
          <p className="text-gray-600 max-w-2xl">{store.Description}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Products from this Store</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length > 0 ? (
          products.map(product => (
            <div key={product.ProductId} className="group p-4 border rounded-lg hover:shadow-md transition-all bg-white">
              <Link to={`/product/${product.ProductId}`} className="block">
                <div className="aspect-square bg-gray-100 rounded-md mb-4 flex items-center justify-center text-gray-400 text-4xl font-bold">
                  {product.Name[0]}
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{product.Name}</h3>
                  <span className="text-green-600 font-bold">${product.Price}</span>
                </div>
              </Link>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{product.Category}</span>
                <span className="text-xs text-gray-400">{product.StoreName}</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                  <ShoppingCart size={16} />
                  Add to Cart
                </button>
                <button 
                  onClick={() => handleAddToWishlist(product)}
                  className="p-2 border rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Heart size={18} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 italic">This store has no products listed yet.</p>
        )}
      </div>
    </div>
  );
};

export default StoreDetails;
