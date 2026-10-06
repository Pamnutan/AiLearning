import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { User, ShieldCheck, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function Settings() {
  const { user, token } = useAuth();
  
  // State for password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      return setError("New passwords do not match.");
    }

    if (newPassword.length < 6) {
      return setError("New password must be at least 6 characters long.");
    }

    setLoading(true);
    try {
      // Send token in authorization headers if not already globally configured in your axios interceptor
      await api.post(
        "/settings/change-password",
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your profile details and security options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Profile Details Viewer */}
        <div className="md:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-2xl shadow-md">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className="mt-4 font-bold text-lg text-slate-900">{user?.name || "User"}</h2>
            <span className="mt-1 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wider">
              {user?.role || "User"}
            </span>
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 block">Email Address</label>
              <span className="text-sm text-slate-700 font-medium break-all">{user?.email || "N/A"}</span>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block">Account ID</label>
              <span className="text-xs text-slate-500 font-mono">#{user?.id || "N/A"}</span>
            </div>
          </div>
        </div>

        {/* Right Card: Security / Password Changer Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
            <ShieldCheck className="text-indigo-600" size={20} />
            <h3 className="font-bold text-slate-900">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Current Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 transition-all outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 transition-all outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 transition-all outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
