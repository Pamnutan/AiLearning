import { Bell, Search, Menu, ShoppingCart, LogOut, Store, Heart, LayoutDashboard } from "lucide-react";
import { useAuth } from "../context/AuthContext"; 
import { NavLink, useNavigate, Link } from "react-router-dom";

const MarketplaceLayout = ({ children }) => {
  const { user, logout, userRole } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name || "Guest";
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
              <Store size={24} />
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
                  <LogOut size={18} />
                </button>
              </div>

              <NavLink
                to={userRole === 'admin' ? '/' : userRole === 'vendor' ? '/vendor/dashboard' : '/orders'}
                className={({ isActive }) => `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                <LayoutDashboard size={20} />
                <span className="hidden sm:inline">Dashboard</span>
              </NavLink>

              {userRole !== 'admin' && userRole !== 'vendor' && (
                <NavLink
                  to="/wishlist"
                  className={({ isActive }) => `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                >
                  <Heart size={20} />
                  <span className="hidden sm:inline">Wishlist</span>
                </NavLink>
              )}

              {userRole !== 'admin' && userRole !== 'vendor' && (
                <NavLink
                  to="/cart"
                  className={({ isActive }) => `flex items-center gap-1 text-sm font-medium transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
                >
                  <ShoppingCart size={20} />
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