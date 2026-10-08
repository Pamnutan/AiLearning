import { useState, useEffect } from "react";
import { Plus, Boxes, Search, AlertTriangle } from "lucide-react";
import api from "../services/api";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState({ name: "", price: "", category: "", stock: "", storeId: "" });
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/products").then(r => setProducts(r.data)).catch(() => {});
    api.get("/stores").then(r => setStores(r.data)).catch(() => {});
    api.get("/users").then(r => setVendors(r.data.filter(u => u.Role?.toLowerCase() === 'vendor'))).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock || 0) };
      await api.post("/products", payload);
      const r = await api.get("/products");
      setProducts(r.data);
      setShowForm(false);
      setForm({ name: "", price: "", category: "", stock: "", storeId: "" });
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  }

  const lowStock = products.filter(p => p.Stock < 10);
  const filtered = products.filter(p => {
    const s = search.toLowerCase();
    return !search || p.Name?.toLowerCase().includes(s) || p.Category?.toLowerCase().includes(s);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Products (Store-linked)</h1>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"><Plus size={18}/> Add Product</button>
      </div>
      <p className="text-sm text-slate-500">Add products under a vendor store. Low stock items shown with warning.</p>

      {/* Low Stock Warning */}
      {lowStock.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800">
          <AlertTriangle size={24} className="text-amber-600 shrink-0"/>
          <div>
            <p className="font-bold">Low Stock Warning</p>
            <p className="text-sm">{lowStock.length} product(s) have stock below 10: {lowStock.map(p => p.Name).join(", ")}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-4">
        <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="border rounded-xl px-4 py-2 w-full max-w-md text-sm"/>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-5 py-3">Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(p => (
              <tr key={p.ProductId} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium">{p.Name}</td>
                <td className="px-5 py-3">{p.Category}</td>
                <td className="px-5 py-3">₹{Number(p.Price).toLocaleString('en-IN')}</td>
                <td className="px-5 py-3">{p.Stock}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${p.Stock < 10 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {p.Stock < 10 ? 'LOW STOCK' : 'OK'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">Add Product</h2>
            <input placeholder="Product Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <input placeholder="Price" type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <input placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <input placeholder="Stock" type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <select value={form.storeId} onChange={e => setForm({...form, storeId: e.target.value})} className="w-full border rounded-xl px-4 py-2.5">
              <option value="">Select Store (Vendor Store)</option>
              {stores.map(s => <option key={s.StoreId} value={s.StoreId}>{s.StoreName}</option>)}
            </select>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;