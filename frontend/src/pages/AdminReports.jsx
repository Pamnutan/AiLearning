import { useState, useEffect } from "react";
import { BarChart3, AlertTriangle, Package, Users, ShoppingCart, Box, TrendingUp } from "lucide-react";
import api from "../services/api";

function AdminReports() {
  const [stats, setStats] = useState({ totalProducts: 0, totalUsers: 0, totalOrders: 0, totalRevenue: 0 });
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/dashboard/stats").then(r => setStats(r.data)).catch(() => {});
    api.get("/products").then(r => setProducts(r.data)).catch(() => {});
    api.get("/users").then(r => setUsers(r.data)).catch(() => {});
    api.get("/stores").then(r => setStores(r.data)).catch(() => {});
  }, []);

  const lowStockProducts = products.filter(p => p.Stock < 10);
  const vendors = users.filter(u => u.Role?.toLowerCase() === 'vendor');
  const totalSales = stats.totalRevenue || 0;
  const purchaseEstimate = products.reduce((sum, p) => sum + (Number(p.Stock) * Number(p.Price) || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Reports</h1>

      {/* Reports Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Products", value: stats.totalProducts || products.length, icon: <Package size={20} />, color: "indigo" },
          { label: "Users", value: stats.totalUsers || users.length, icon: <Users size={20} />, color: "amber" },
          { label: "Vendors", value: vendors.length, icon: <Box size={20} />, color: "blue" },
          { label: "Stores", value: stores.length, icon: <Box size={20} />, color: "emerald" },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-${s.color}-600`}>
              {s.icon}
            </div>
            <div><p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{s.label}</p><p className="text-2xl font-bold text-slate-900">{s.value}</p></div>
          </div>
        ))}
      </div>

      {/* Low Stock Warning Report */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle size={24} className="text-amber-600"/>
          <h2 className="text-xl font-bold text-amber-900">Low Stock Warning Report</h2>
        </div>
        <p className="text-sm text-amber-800 mb-3">Products with stock below 10 units. Notify specific vendors.</p>
        <table className="w-full text-sm">
          <thead className="bg-amber-100 text-amber-900"><tr><th className="px-3 py-2">Product</th><th>Category</th><th>Stock</th><th>Price</th><th>Warning</th></tr></thead>
          <tbody className="divide-y divide-amber-100">
            {lowStockProducts.map(p => (
              <tr key={p.ProductId} className="hover:bg-amber-50">
                <td className="px-3 py-2 font-medium">{p.Name}</td>
                <td className="px-3 py-2">{p.Category}</td>
                <td className="px-3 py-2 text-red-600 font-bold">{p.Stock}</td>
                <td className="px-3 py-2">₹{Number(p.Price).toLocaleString('en-IN')}</td>
                <td className="px-3 py-2"><span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">CRITICAL</span></td>
              </tr>
            ))}
            {lowStockProducts.length === 0 && <tr><td colSpan={5} className="px-3 py-3 text-center text-slate-500">No low stock warnings.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Sales & Purchase Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><TrendingUp size={20} className="text-emerald-600"/><h3 className="font-bold text-lg">Sales Report</h3></div>
          <p className="text-3xl font-bold text-emerald-700">₹{Number(totalSales).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-2">Total completed order revenue</p>
        </div>
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4"><ShoppingCart size={20} className="text-blue-600"/><h3 className="font-bold text-lg">Purchase / Inventory Value</h3></div>
          <p className="text-3xl font-bold text-blue-700">₹{Number(purchaseEstimate).toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-2">Total value of current stock</p>
        </div>
      </div>

      {/* Product Summary */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4"><Package size={20} className="text-indigo-600"/><h3 className="font-bold text-lg">Product Inventory Summary</h3></div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-slate-500">Total Products</p><p className="text-xl font-bold">{products.length}</p></div>
          <div><p className="text-slate-500">Total Stock Units</p><p className="text-xl font-bold">{products.reduce((s, p) => s + (Number(p.Stock) || 0), 0)}</p></div>
          <div><p className="text-slate-500">Low Stock Items</p><p className="text-xl font-bold text-amber-600">{lowStockProducts.length}</p></div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;