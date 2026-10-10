import { ShoppingCart, LogOut, Store, Heart, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { wishlistService } from "../services/api";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

const MarketplaceLayout = ({ children }) => {
  const { user, logout, userRole } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const navigate = useNavigate();

  const userName = user?.name || "Guest";
  useEffect(() => {
    const refresh = () => {
      if (userRole !== 'admin' && userRole !== 'vendor' && user) {
        wishlistService.getWishlist().then(res => {
          setWishlistCount(res.data?.length || 0);
        }).catch(() => setWishlistCount(0));
      }
    };
    refresh();
    const interval = setInterval(refresh, 1000);
    const handleStorage = () => refresh();
    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
    };
  }, [user, userRole]);

  const cartKey = 'cart_' + (user?.id || user?.email || 'guest');
  const [cartCountState, setCartCountState] = useState(0);

  useEffect(() => {
    const updateCart = () => {
      const key = 'cart_' + (user?.id || user?.email || 'guest');
      setCartCountState(JSON.parse(localStorage.getItem(key) || '[]').length);
    };
    updateCart();
    const interval = setInterval(updateCart, 1000);
    window.addEventListener('storage', updateCart);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateCart);
    };
  }, [user]);

  const cartCount = cartCountState;

  const userInitials = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-indigo-600 font-bold text-xl">
              <Store size={20} />
              <span>MarketPlace</span>
            </Link>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 mr-4 border-r pr-6">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {userInitials}
                  </div>
                  <span className="hidden sm:inline">{userName}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>

              <NavLink
                to={userRole === 'admin' ? '/' : userRole === 'vendor' ? '/vendor/dashboard' : '/orders'}
                className={({ isActive }) => `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>

              {userRole !== 'admin' && userRole !== 'vendor' && (
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) => `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                >
                  <div className="relative">
                    <Heart size={16} />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">Wishlist</span>
                </NavLink>
              )}

              {userRole !== 'admin' && userRole !== 'vendor' && (
                <NavLink
                  to="/cart"
                  className={({ isActive }) => `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                >
                  <div className="relative">
                    <ShoppingCart size={16} />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">Cart</span>
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
};

export default MarketplaceLayout;