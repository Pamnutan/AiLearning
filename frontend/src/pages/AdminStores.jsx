import { useState, useEffect } from "react";
import { Store, Plus, Users } from "lucide-react";
import api from "../services/api";

function AdminStores() {
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ storeName: "", description: "", vendorId: "" });
  const [editingStore, setEditingStore] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    api.get("/stores").then(r => {
      setStores(r.data);
    }).catch(() => {});
    api.get("/users").then(r => {
      const vendors = r.data.filter(u => u.Role?.toLowerCase() === 'vendor');
      setUsers(vendors);
    }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingStore) {
        await api.put("/stores/" + editingStore.StoreId, { ...form, vendorId: Number(form.vendorId) });
      } else {
        await api.post("/stores", { ...form, vendorId: Number(form.vendorId) });
      }
      const r = await api.get("/stores");
      setStores(r.data);
      setShowForm(false);
      setForm({ storeName: "", description: "", vendorId: "" });
      setEditingStore(null);
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this store?")) return;
    try {
      await api.delete("/stores/" + id);
      const r = await api.get("/stores");
      setStores(r.data);
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Stores (Vendor Only)</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"><Plus size={18}/> Add Store</button>
      </div>
      <p className="text-sm text-slate-500">Only vendors can own stores. Admin can assign stores to vendors.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stores.map(s => (
          <div key={s.StoreId} className="bg-white border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center"><Store size={20} className="text-blue-600"/></div>
              <div><h3 className="font-bold text-lg">{s.StoreName}</h3><p className="text-xs text-slate-400">Vendor ID: {s.VendorId}</p></div>
            </div>
            <p className="text-sm text-slate-600">{s.Description || "No description"}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => { setEditingStore(s); setForm({ storeName: s.StoreName, description: s.Description || "", vendorId: s.VendorId ? String(s.VendorId) : "" }); setShowForm(true); }} className="text-blue-600 hover:underline text-xs font-bold">Edit</button>
              <button onClick={() => handleDelete(s.StoreId)} className="text-red-600 hover:underline text-xs font-bold">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">{editingStore ? "Edit Store" : "Create Store for Vendor"}</h2>
            <input placeholder="Store Name" value={form.storeName} onChange={e => setForm({...form, storeName: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" rows={3}/>
            <select value={form.vendorId} onChange={e => setForm({...form, vendorId: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required>
              <option value="">Select Vendor</option>
              {users.filter(u => {
                const isEditingOwnStore = editingStore && editingStore.VendorId === u.Id;
                return isEditingOwnStore || !stores.some(s => s.VendorId === u.Id && s.StoreId !== (editingStore?.StoreId || 0));
              }).map(u => <option key={u.Id} value={u.Id}>{u.Name} ({u.Email})</option>)}
            </select>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-bold">{editingStore ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminStores;