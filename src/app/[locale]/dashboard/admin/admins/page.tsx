"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const ADMIN_ROLES = [
  { value: "SUPER_ADMIN", label: "Super Admin", desc: "Full system access" },
  { value: "MODERATOR", label: "Moderator", desc: "Command Center + Operations" },
  { value: "OPS_CS", label: "Operations / CS", desc: "Operations section" },
  { value: "FINANCE", label: "Finance", desc: "Finance section" },
  { value: "FINANCE_LEAD", label: "Finance Lead", desc: "Finance + Pitch Mode" },
  { value: "SUPPORT_STAFF", label: "Support Staff", desc: "Dashboard + Analytics" },
  { value: "KYC_ANALYST", label: "KYC Analyst", desc: "Verification only" },
];

interface AdminUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  createdAt: string;
}

export default function AdminAdminsPage() {
  const { data: session } = useSession();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Create form state
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("SUPPORT_STAFF");
  const [creating, setCreating] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (e) {
      toast.error("Failed to load admin users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleCreate = async () => {
    if (!newEmail || !newPassword || !newRole) {
      toast.error("Email, password, and role are required");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to create admin");
        return;
      }
      toast.success(`Admin ${newEmail} created successfully`);
      setShowCreate(false);
      setNewEmail(""); setNewPassword(""); setNewRole("SUPPORT_STAFF");
      fetchAdmins();
    } catch (e) {
      toast.error("Failed to create admin");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateRole = async (adminId: string) => {
    try {
      const res = await fetch(`/api/admin/admins/${adminId}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update role");
        return;
      }
      toast.success("Role updated successfully");
      setEditingId(null);
      fetchAdmins();
    } catch (e) {
      toast.error("Failed to update role");
    }
  };

  const handleDelete = async (adminId: string) => {
    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete admin");
        return;
      }
      toast.success("Admin deleted successfully");
      setDeletingId(null);
      fetchAdmins();
    } catch (e) {
      toast.error("Failed to delete admin");
    }
  };

  const getRoleMeta = (role: string) => ADMIN_ROLES.find(r => r.value === role) || { label: role, desc: "", value: role };

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-violet-100 text-violet-700 border-violet-200",
    MODERATOR: "bg-blue-100 text-blue-700 border-blue-200",
    OPS_CS: "bg-teal-100 text-teal-700 border-teal-200",
    FINANCE: "bg-amber-100 text-amber-700 border-amber-200",
    FINANCE_LEAD: "bg-orange-100 text-orange-700 border-orange-200",
    SUPPORT_STAFF: "bg-gray-100 text-gray-700 border-gray-200",
    KYC_ANALYST: "bg-green-100 text-green-700 border-green-200",
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🔐 Admin Management</h1>
          <p className="text-sm text-gray-500 mt-1">Create, manage roles, and remove internal admin accounts</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition flex items-center gap-2"
        >
          <span className="text-lg">+</span> New Admin
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900">Create New Admin Account</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email *</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="admin@lunavia.vn"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Role *</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
              >
                {ADMIN_ROLES.map(r => (
                  <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 disabled:opacity-50 transition"
            >
              {creating ? "Creating..." : "Create Admin"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setNewEmail(""); setNewPassword(""); setNewRole("SUPPORT_STAFF"); }}
              className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Admin List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading admin accounts...</div>
      ) : admins.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">🔐</p>
          <p>No admin accounts found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {admins.map((admin) => {
            const meta = getRoleMeta(admin.role);
            const colorClass = roleColors[admin.role] || "bg-gray-100 text-gray-700 border-gray-200";
            const isEditing = editingId === admin.id;
            const isDeleting = deletingId === admin.id;
            const isSelf = session?.user?.email === admin.email;

            return (
              <div
                key={admin.id}
                className={`bg-white rounded-xl border p-5 transition ${
                  isDeleting ? "border-red-300 bg-red-50/30" : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${colorClass}`}>
                      {admin.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        {admin.email}
                        {isSelf && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${colorClass}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-400">{meta.desc}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isEditing && !isDeleting && (
                      <>
                        <button
                          onClick={() => { setEditingId(admin.id); setEditRole(admin.role); }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                        >
                          Change Role
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => setDeletingId(admin.id)}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Edit Role Inline */}
                {isEditing && (
                  <div className="mt-4 flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm flex-1 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
                    >
                      {ADMIN_ROLES.map(r => (
                        <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUpdateRole(admin.id)}
                      className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Delete Confirmation */}
                {isDeleting && (
                  <div className="mt-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                    <span className="text-red-600 text-sm font-medium flex-1">
                      ⚠️ Delete <strong>{admin.email}</strong>? This action cannot be undone.
                    </span>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={() => setDeletingId(null)}
                      className="px-4 py-2 bg-white text-gray-700 rounded-lg text-sm font-semibold border border-gray-200 hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Permissions preview */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(admin.permissions || []).slice(0, 8).map((p: string) => (
                    <span key={p} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono">
                      {p.replace(/_/g, " ").toLowerCase()}
                    </span>
                  ))}
                  {(admin.permissions || []).length > 8 && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">
                      +{admin.permissions.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 text-center">
        {admins.length} admin account(s) • Changes take effect immediately
      </div>
    </div>
  );
}
