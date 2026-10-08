import { useEffect, useState } from "react";
import { Users, Plus, ShieldCheck, User, Mail, CalendarDays, Search, X, Loader2 } from "lucide-react";
import api from "../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const emptyForm = { name: "", email: "", role: "user", password: "" };
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    try { setLoading(true); setError("");
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (e) { setError("Unable to load users."); }
    finally { setLoading(false); }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function openAddModal() {
    setEditingUser(null); setForm(emptyForm); setShowForm(true); setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSaving(true); setError("");
      const payload = {
        name: form.name.trim(), email: form.email.trim(),
        password: form.password, role: form.role,
      };
      if (!payload.name || !payload.email || (!editingUser && !payload.password)) {
        setError("Name, email and password required."); return;
      }
      if (!editingUser) {
        await api.post("/users", payload);
      } else {
        await api.put(`/users/${editingUser.Id}`, { name: payload.name, email: payload.email, role: payload.role });
      }
      setShowForm(false); await fetchUsers();
    } catch (err) { setError(err.response?.data?.message || "Failed to save user."); }
    finally { setSaving(false); }
  }

  const [showForm, setShowForm] = useState(false);

  const filteredUsers = users.filter(u => {
    const s = search.toLowerCase();
    return !search || (u.Name?.toLowerCase().includes(s) || u.Email?.toLowerCase().includes(s) || u.Role?.toLowerCase().includes(s));
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.Role?.toLowerCase() === 'admin').length,
    vendors: users.filter(u => u.Role?.toLowerCase() === 'vendor').length,
    users: users.filter(u => u.Role?.toLowerCase() === 'user').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <button onClick={openAddModal} className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2">
          <Plus size={18}/> Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total", v: stats.total, color: "indigo" },
          { label: "Admins", v: stats.admins, color: "amber" },
          { label: "Vendors", v: stats.vendors, color: "blue" },
          { label: "Users", v: stats.users, color: "emerald" },
        ].map(s => (
          <div key={s.label} className="bg-white border rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 flex gap-3">
          <input
            placeholder="Search by name, email or role..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded-xl px-4 py-2 w-full max-w-md text-sm"
          />
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-5 py-3">Name</th><th>Email</th><th>Role</th><th>Created</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredUsers.map(u => (
              <tr key={u.Id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium">{u.Name}</td>
                <td className="px-5 py-3 text-slate-600">{u.Email}</td>
                <td className="px-5 py-3 capitalize">{u.Role}</td>
                <td className="px-5 py-3 text-slate-400">{new Date(u.CreatedAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4">
            <h2 className="text-xl font-bold">{editingUser ? "Edit User" : "Add User"}</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            <input placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" required/>
            {!editingUser && <input placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border rounded-xl px-4 py-2.5" type="password" required/>}
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border rounded-xl px-4 py-2.5">
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-xl py-2.5 text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-sm font-bold">{saving ? "Saving..." : "Save"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;