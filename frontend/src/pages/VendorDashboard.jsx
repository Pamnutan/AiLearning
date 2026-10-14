import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Store, Plus, Package, ShoppingCart, Boxes, AlertTriangle, Edit3, CheckCircle2, Clock3, Truck, XCircle } from "lucide-react";
import { storeService, productService, orderService } from "../services/api";
import api from "../services/api";

function VendorDashboard() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [reportData, setReportData] = useState([]);
  const [storeForm, setStoreForm] = useState({ storeName: "", description: "", logo: "" });
  const [showStoreForm, setShowStoreForm] = useState(false);

  const [productForm, setProductForm] = useState({ name: "", price: "", category: "", stock: "" });
  const [showProductForm, setShowProductForm] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function fetchReport(period) {
    try {
      const res = await api.get(`/reports/vendor-sales?period=${period}`);
      setReportData(res.data.data || []);
    } catch (e) { console.error(e); }
  }

  async function loadData() {
    try {
      const storesRes = await storeService.getAllStores();
      const userId = user?.id || user?.userId || parseInt(localStorage.getItem('user_id') || '0');
      const myStore = storesRes.data.find(s => s.VendorId === userId);
      setStore(myStore || null);
      if (myStore) setStoreForm({ storeName: myStore.StoreName || "", description: myStore.Description || "", logo: myStore.Logo || "" });

      const productsRes = await productService.getProducts({ storeId: myStore?.StoreId || 0 });
      setProducts(productsRes.data);

      const ordersRes = await orderService.getVendorOrders();
      setOrders(ordersRes.data);
    } catch (e) { console.error(e); }
  }

  async function handleStoreSubmit(e) {
    e.preventDefault();
    try {
      if (store) {
        await storeService.updateStore(store.StoreId, storeForm);
        setMessage("Store updated!");
      } else {
        await storeService.createStore({ ...storeForm, vendorId: parseInt(localStorage.getItem('user_id') || '0') });
        setMessage("Store created!");
      }
      await loadData();
      setShowStoreForm(false);
    } catch (err) { setMessage(err.response?.data?.message || "Failed"); }
  }

  async function handleProductSubmit(e) {
    e.preventDefault();
    try {
      const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock || 0), storeId: store?.StoreId || 0 };
      await productService.createProduct(payload);
      setMessage("Product added!");
      await loadData();
      setShowProductForm(false);
      setProductForm({ name: "", price: "", category: "", stock: "" });
    } catch (err) { setMessage(err.response?.data?.message || "Failed"); }
  }

  const lowStock = products.filter(p => p.Stock < 10);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Vendor Dashboard</h1>

      {/* Store Card */}
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Store size={22}/> My Store</h2>
          <button onClick={() => setShowStoreForm(true)} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700"><Edit3 size={14}/> {store ? "Edit" : "Create"}</button>
        </div>
        {store ? (
          <div><p className="text-lg font-semibold">{store.StoreName}</p><p className="text-sm text-slate-500">{store.Description}</p></div>
        ) : (
          <p className="text-sm text-slate-400">No store created yet. Click Create to start.</p>
        )}
      </div>

      {showStoreForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowStoreForm(false)}>
          <form onSubmit={handleStoreSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">{store ? "Edit Store" : "Create Store"}</h2>
            <input placeholder="Store Name" value={storeForm.storeName} onChange={e => setStoreForm({...storeForm, storeName: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <textarea placeholder="Description" value={storeForm.description} onChange={e => setStoreForm({...storeForm, description: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" rows={3}/>
            <input placeholder="Logo URL" value={storeForm.logo} onChange={e => setStoreForm({...storeForm, logo: e.target.value})} className="w-full border rounded-xl px-4 py-2.5"/>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowStoreForm(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Products */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Package size={22}/> Products</h2>
          <button onClick={() => setShowProductForm(true)} disabled={!store} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50"><Plus size={14}/> Add Product</button>
        </div>
        {lowStock.length > 0 && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800">
            <AlertTriangle size={20} className="text-amber-600 shrink-0"/>
            <p className="text-sm font-medium">Low stock warning: {lowStock.map(p => p.Name).join(", ")}</p>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p.ProductId} className="bg-white border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold text-lg">{p.Name}</h3>
              <p className="text-sm text-slate-500">{p.Category} | ₹{Number(p.Price).toLocaleString('en-IN')}</p>
              <p className={`text-xs font-bold mt-2 ${p.Stock < 10 ? 'text-amber-600' : 'text-emerald-600'}`}>Stock: {p.Stock}</p>
            </div>
          ))}
        </div>
      </div>

      {showProductForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowProductForm(false)}>
          <form onSubmit={handleProductSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Add Product</h2>
            <input placeholder="Product Name" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <input placeholder="Price" type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <input placeholder="Category" value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <input placeholder="Stock" type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowProductForm(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold">Save</button>
            </div>
          </form>
        </div>
      )}

      {/* Orders */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><ShoppingCart size={22}/> My Orders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(o => (
            <div key={o.Id} className="bg-white border rounded-xl p-4 shadow-sm">
              <h3 className="font-bold">Order #{o.Id}</h3>
              <p className="text-sm text-slate-500">Status: <span className="font-bold">{o.Status}</span></p>
              <p className="text-sm text-slate-600">Products: <span className="font-medium">{o.Products || "-"}</span></p>
              <p className="text-sm text-slate-600">Amount: ₹{Number(o.TotalAmount || 0).toLocaleString('en-IN')}</p>
            </div>
          ))}
          {orders.length === 0 && <p className="text-slate-400">No orders yet.</p>}
        </div>
      </div>

      {/* Vendor Sale Report */}
      <div className="mt-10 bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-4">Product Sale Report</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => fetchReport('daily')} className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm">Daily</button>
          <button onClick={() => fetchReport('monthly')} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">Monthly</button>
          <button onClick={() => fetchReport('yearly')} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm">Yearly</button>
        </div>
        <table className="w-full text-sm"><thead><tr><th className="text-left">Product</th><th>Qty</th><th>Revenue</th></tr></thead><tbody>{reportData.map(r => <tr key={r.ProductName}><td>{r.ProductName}</td><td>{r.TotalQty}</td><td>₹{r.Revenue}</td></tr>)}</tbody></table>
      </div>
    </div>
  );
}

export default VendorDashboard;
