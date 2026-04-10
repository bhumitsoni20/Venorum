import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Edit3,
  Trash2,
  X,
  Shield,
  ShieldOff,
  User,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Check,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Modal States
  const [editModal, setEditModal] = useState(null); // user object or null
  const [deleteModal, setDeleteModal] = useState(null); // user object or null
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null); // { type, message }

  const token = localStorage.getItem("venorum_auth_token");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        ...(search && { search }),
      });
      const res = await fetch(`${API_URL}/users/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data.users);
      setTotalPages(data.pages);
      setTotalUsers(data.total);
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Edit User ──
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/admin/${editModal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editModal.name,
          email: editModal.email,
          phone: editModal.phone,
          role: editModal.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u._id === data._id ? { ...u, ...data } : u))
      );
      setEditModal(null);
      showNotification("success", `${data.name} updated successfully.`);
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete User ──
  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/admin/${deleteModal._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setUsers((prev) => prev.filter((u) => u._id !== deleteModal._id));
      setTotalUsers((prev) => prev - 1);
      setDeleteModal(null);
      showNotification("success", "User removed successfully.");
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Notification Toast ── */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -30, x: "-50%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-sm shadow-2xl text-sm font-medium tracking-wide flex items-center gap-3 border ${
              notification.type === "success"
                ? "bg-green-950/90 border-green-500/30 text-green-300"
                : "bg-red-950/90 border-red-500/30 text-red-300"
            }`}
          >
            {notification.type === "success" ? (
              <Check size={16} />
            ) : (
              <AlertTriangle size={16} />
            )}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-luxury-white mb-1">
            User Management
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">
            {totalUsers} registered members
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-luxury-gray/50 border border-luxury-gold/10 text-luxury-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-luxury-gold/40 transition-colors rounded-sm"
          />
        </div>
      </div>

      {/* ── Users Table ── */}
      <div className="glass border border-luxury-gold/10 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="animate-spin text-luxury-gold" size={28} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-24">
            <Users className="mx-auto text-gray-700 mb-4" size={40} />
            <p className="text-gray-500 text-sm">
              {search
                ? "No users match your search."
                : "No registered members yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-luxury-gold/10 bg-luxury-black/50">
                  <th className="text-left px-6 py-4 font-medium">User</th>
                  <th className="text-left px-6 py-4 font-medium hidden md:table-cell">
                    Contact
                  </th>
                  <th className="text-center px-6 py-4 font-medium">Role</th>
                  <th className="text-left px-6 py-4 font-medium hidden lg:table-cell">
                    Joined
                  </th>
                  <th className="text-right px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-luxury-gold/5 hover:bg-luxury-gold/[0.02] transition-colors group"
                  >
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 flex items-center justify-center text-luxury-gold text-xs font-bold border border-luxury-gold/20 flex-shrink-0">
                          {(user.name?.[0] || "?").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-luxury-white font-medium truncate">
                            {user.name || "Unknown"}
                          </p>
                          <p className="text-gray-500 text-[11px] truncate md:hidden">
                            {user.email || user.phone || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="space-y-0.5">
                        {user.email && (
                          <p className="text-gray-400 text-xs flex items-center gap-1.5">
                            <Mail size={11} className="text-gray-600" />
                            {user.email}
                          </p>
                        )}
                        {user.phone && (
                          <p className="text-gray-400 text-xs flex items-center gap-1.5">
                            <Phone size={11} className="text-gray-600" />
                            {user.phone}
                          </p>
                        )}
                        {!user.email && !user.phone && (
                          <p className="text-gray-600 text-xs">
                            No contact info
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase tracking-[0.15em] font-semibold rounded-full border ${
                          user.role === "admin"
                            ? "bg-luxury-gold/10 text-luxury-gold border-luxury-gold/30"
                            : "bg-gray-800/50 text-gray-400 border-gray-700/50"
                        }`}
                      >
                        {user.role === "admin" ? (
                          <Shield size={10} />
                        ) : (
                          <User size={10} />
                        )}
                        {user.role}
                      </span>
                    </td>

                    {/* Joined Date */}
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-gray-500 text-xs flex items-center gap-1.5">
                        <Calendar size={11} className="text-gray-600" />
                        {formatDate(user.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            setEditModal({
                              ...user,
                              phone: user.phone || "",
                              email: user.email || "",
                            })
                          }
                          className="p-2 hover:bg-luxury-gold/10 text-gray-400 hover:text-luxury-gold rounded-sm transition-all border border-transparent hover:border-luxury-gold/20"
                          title="Edit user"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(user)}
                          className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-sm transition-all border border-transparent hover:border-red-500/20"
                          title="Delete user"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-500 text-xs tracking-wider uppercase">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-luxury-gold/10 text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 text-xs font-medium rounded-sm transition-all ${
                    page === pageNum
                      ? "bg-luxury-gold text-luxury-black"
                      : "border border-luxury-gold/10 text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/30"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-luxury-gold/10 text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════ EDIT MODAL ════════════════════ */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80 backdrop-blur-sm"
            onClick={() => !saving && setEditModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass border border-luxury-gold/20 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-gold/10">
                <h2 className="text-lg font-serif text-luxury-white">
                  Edit Member
                </h2>
                <button
                  onClick={() => setEditModal(null)}
                  className="text-gray-500 hover:text-luxury-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                    />
                    <input
                      type="text"
                      value={editModal.name}
                      onChange={(e) =>
                        setEditModal((p) => ({ ...p, name: e.target.value }))
                      }
                      className="w-full pl-9 pr-4 py-2.5 bg-luxury-gray/50 border border-luxury-gold/10 text-luxury-white text-sm focus:outline-none focus:border-luxury-gold/40 transition-colors rounded-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                    />
                    <input
                      type="email"
                      value={editModal.email}
                      onChange={(e) =>
                        setEditModal((p) => ({ ...p, email: e.target.value }))
                      }
                      className="w-full pl-9 pr-4 py-2.5 bg-luxury-gray/50 border border-luxury-gold/10 text-luxury-white text-sm focus:outline-none focus:border-luxury-gold/40 transition-colors rounded-sm"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
                    />
                    <input
                      type="text"
                      value={editModal.phone}
                      onChange={(e) =>
                        setEditModal((p) => ({ ...p, phone: e.target.value }))
                      }
                      className="w-full pl-9 pr-4 py-2.5 bg-luxury-gray/50 border border-luxury-gold/10 text-luxury-white text-sm focus:outline-none focus:border-luxury-gold/40 transition-colors rounded-sm"
                    />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="text-[10px] text-gray-500 uppercase tracking-widest block mb-2">
                    Role
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((p) => ({ ...p, role: "user" }))
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest border rounded-sm transition-all flex-1 justify-center ${
                        editModal.role === "user"
                          ? "bg-gray-700/50 border-gray-500 text-luxury-white"
                          : "border-luxury-gold/10 text-gray-500 hover:border-gray-500"
                      }`}
                    >
                      <ShieldOff size={13} />
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditModal((p) => ({ ...p, role: "admin" }))
                      }
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs uppercase tracking-widest border rounded-sm transition-all flex-1 justify-center ${
                        editModal.role === "admin"
                          ? "bg-luxury-gold/10 border-luxury-gold/40 text-luxury-gold"
                          : "border-luxury-gold/10 text-gray-500 hover:border-luxury-gold/30"
                      }`}
                    >
                      <Shield size={13} />
                      Admin
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditModal(null)}
                    className="flex-1 py-3 border border-luxury-gold/10 text-gray-400 text-xs uppercase tracking-widest hover:text-luxury-white hover:border-gray-500 transition-all rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 bg-luxury-gold text-luxury-black text-xs uppercase tracking-widest font-bold hover:bg-luxury-white transition-all disabled:opacity-50 rounded-sm flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Check size={14} />
                    )}
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ DELETE CONFIRMATION MODAL ════════════════════ */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80 backdrop-blur-sm"
            onClick={() => !saving && setDeleteModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass border border-red-500/20 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={24} />
                </div>

                <h3 className="text-lg font-serif text-luxury-white mb-2">
                  Remove Member
                </h3>
                <p className="text-gray-400 text-sm mb-1">
                  Are you sure you want to permanently delete
                </p>
                <p className="text-luxury-white font-medium mb-6">
                  {deleteModal.name || deleteModal.email || "this user"}?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 py-3 border border-luxury-gold/10 text-gray-400 text-xs uppercase tracking-widest hover:text-luxury-white hover:border-gray-500 transition-all rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex-1 py-3 bg-red-600 text-white text-xs uppercase tracking-widest font-bold hover:bg-red-500 transition-all disabled:opacity-50 rounded-sm flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    {saving ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManager;
