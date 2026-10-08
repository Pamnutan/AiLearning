import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Layout
  from "./components/Layout";
import MarketplaceLayout from "./components/MarketplaceLayout";

import Dashboard
  from "./pages/Dashboard";

import Users
  from "./pages/Users";

import Products
  from "./pages/Products";

import Login
  from "./pages/Login";

import Register
  from "./pages/Register";

import Orders from "./pages/Orders";

import Settings from "./pages/Settings";

import ProtectedRoute
  from "./components/ProtectedRoute";

import Home from "./pages/Home";
import StoreDetails from "./pages/StoreDetails";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";

import VendorStore from "./pages/VendorStore";
import VendorProducts from "./pages/VendorProducts";
import VendorOrders from "./pages/VendorOrders";
import VendorDashboard from "./pages/VendorDashboard";

import AdminUsers from "./pages/AdminUsers";
import AdminStores from "./pages/AdminStores";
import AdminProducts from "./pages/AdminProducts";
import AdminReports from "./pages/AdminReports";
import AdminRoute from "./components/AdminRoute";
import ShopperOnly from "./components/ShopperOnly";
import { useAuth } from "./context/AuthContext";

function App() {
  const { isAdmin, isAuthenticated } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        {/* Admin Panel Dashboard at root when admin */}
        <Route path="/" element={
          isAdmin ? (
            <Layout><Dashboard /></Layout>
          ) : (
            <MarketplaceLayout><Home /></MarketplaceLayout>
          )
        } />
        <Route path="/store/:id" element={<MarketplaceLayout><StoreDetails /></MarketplaceLayout>} />
        <Route path="/product/:id" element={<MarketplaceLayout><ProductDetails /></MarketplaceLayout>} />
        <Route path="/cart" element={<MarketplaceLayout><ShopperOnly><Cart /></ShopperOnly></MarketplaceLayout>} />
        <Route path="/wishlist" element={<MarketplaceLayout><ShopperOnly><Wishlist /></ShopperOnly></MarketplaceLayout>} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Vendor Seller Center */}
        <Route path="/vendor/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <VendorDashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route
          path="/vendor/store"
          element={
            <ProtectedRoute>
              <Layout>
                <VendorStore />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/products"
          element={
            <ProtectedRoute>
              <Layout>
                <VendorProducts />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/orders"
          element={
            <ProtectedRoute>
              <Layout>
                <VendorOrders />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Management Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/Orders"
          element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/users" element={<AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>} />
        <Route path="/admin/stores" element={<AdminRoute><Layout><AdminStores /></Layout></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><Layout><AdminProducts /></Layout></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><Layout><AdminReports /></Layout></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
