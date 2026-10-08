import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { storeService, productService, wishlistService } from '../services/api';
import { ShoppingCart, Heart } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const cartKey = 'cart_' + (user?.id || user?.email || 'guest');
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, productsRes] = await Promise.all([
          storeService.getAllStores(),
          productService.getProducts()
        ]);
        setStores(storesRes.data);
        setProducts(productsRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading Marketplace...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to the Marketplace</h1>
        <p className="text-gray-600">Discover amazing products from multiple independent vendors</p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Featured Stores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {stores.map(store => (
            <Link to={`/store/${store.StoreId}`} key={store.StoreId} className="group p-4 border rounded-lg hover:shadow-md transition-all bg-white">
              <div className="aspect-square bg-gray-100 rounded-md mb-4 overflow-hidden">
                {store.Logo ? (
                  <img src={store.Logo} alt={store.StoreName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">{store.StoreName[0]}</div>
                )}
              </div>
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">{store.StoreName}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{store.Description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Trending Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
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
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
