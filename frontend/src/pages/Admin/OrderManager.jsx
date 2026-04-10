import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Search,
  Eye,
  Trash2,
  X,
  RefreshCw,
  AlertTriangle,
  Check,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  User,
  CreditCard,
  Calendar,
  Filter,
  IndianRupee,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const STATUS_OPTIONS = ["Processing", "Shipped", "Delivered", "Cancelled"];

const getStatusConfig = (status) => {
  switch (status?.toLowerCase()) {
    case "processing":
      return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: <Clock size={12} /> };
    case "shipped":
      return { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: <Truck size={12} /> };
    case "delivered":
      return { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: <CheckCircle2 size={12} /> };
    case "cancelled":
      return { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: <XCircle size={12} /> };
    default:
      return { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", icon: <Clock size={12} /> };
  }
};

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Modal States
  const [detailModal, setDetailModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const token = localStorage.getItem("venorum_auth_token");

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        status: statusFilter,
        ...(search && { search }),
      });
      const res = await fetch(`${API_URL}/orders/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders);
      setTotalPages(data.pages);
      setTotalOrders(data.total);
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search, token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const timer = setTimeout(() => setPage(1), 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  // ── Update Order Status ──
  const handleStatusUpdate = async (orderId, newStatus) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/orders/admin/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setOrders((prev) =>
        prev.map((o) => (o._id === data._id ? data : o))
      );
      if (detailModal?._id === data._id) setDetailModal(data);
      showNotification("success", `Order updated to "${newStatus}".`);
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Toggle Payment ──
  const handlePaymentToggle = async (orderId, isPaid) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/orders/admin/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPaid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setOrders((prev) =>
        prev.map((o) => (o._id === data._id ? data : o))
      );
      if (detailModal?._id === data._id) setDetailModal(data);
      showNotification("success", isPaid ? "Marked as paid." : "Marked as unpaid.");
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Order ──
  const handleDelete = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/orders/admin/${deleteModal._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");

      setOrders((prev) => prev.filter((o) => o._id !== deleteModal._id));
      setTotalOrders((prev) => prev - 1);
      setDeleteModal(null);
      showNotification("success", "Order removed.");
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (v) =>
    v ? `₹${Number(v).toLocaleString("en-IN")}` : "₹0";

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  const formatTime = (d) =>
    d
      ? new Date(d).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

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
            {notification.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-luxury-white mb-1">
            Order Management
          </h1>
          <p className="text-gray-500 text-xs uppercase tracking-[0.2em]">
            {totalOrders} total orders
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-4 py-3 bg-luxury-gray/50 border border-luxury-gold/10 text-luxury-white text-sm focus:outline-none focus:border-luxury-gold/40 transition-colors rounded-sm appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search by customer or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-luxury-gray/50 border border-luxury-gold/10 text-luxury-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-luxury-gold/40 transition-colors rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="glass border border-luxury-gold/10 rounded-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="animate-spin text-luxury-gold" size={28} />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <ShoppingBag className="mx-auto text-gray-700 mb-4" size={40} />
            <p className="text-gray-500 text-sm">
              {search || statusFilter !== "all"
                ? "No orders match your filters."
                : "No orders placed yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-luxury-gold/10 bg-luxury-black/50">
                  <th className="text-left px-6 py-4 font-medium">Order</th>
                  <th className="text-left px-6 py-4 font-medium hidden md:table-cell">Customer</th>
                  <th className="text-center px-6 py-4 font-medium">Items</th>
                  <th className="text-center px-6 py-4 font-medium">Status</th>
                  <th className="text-center px-6 py-4 font-medium hidden sm:table-cell">Payment</th>
                  <th className="text-right px-6 py-4 font-medium">Amount</th>
                  <th className="text-right px-6 py-4 font-medium hidden lg:table-cell">Date</th>
                  <th className="text-right px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => {
                  const cfg = getStatusConfig(order.status);
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-luxury-gold/5 hover:bg-luxury-gold/[0.02] transition-colors group"
                    >
                      {/* Order ID */}
                      <td className="px-6 py-4">
                        <span className="text-luxury-white font-mono text-xs">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-gray-300 text-xs truncate max-w-[140px]">
                          {order.user?.name || "Unknown"}
                        </p>
                        <p className="text-gray-600 text-[10px] truncate max-w-[140px]">
                          {order.user?.email || "—"}
                        </p>
                      </td>

                      {/* Items Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-400 text-xs">
                          {order.orderItems?.length || 0}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-wider font-semibold rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                          {cfg.icon}
                          {order.status}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span className={`text-[10px] uppercase tracking-wider font-medium ${order.isPaid ? "text-green-400" : "text-amber-400"}`}>
                          {order.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right">
                        <span className="text-luxury-gold font-serif text-sm">
                          {formatCurrency(order.totalPrice)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-right hidden lg:table-cell">
                        <p className="text-gray-400 text-xs">{formatDate(order.createdAt)}</p>
                        <p className="text-gray-600 text-[10px]">{formatTime(order.createdAt)}</p>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setDetailModal(order)}
                            className="p-2 hover:bg-luxury-gold/10 text-gray-400 hover:text-luxury-gold rounded-sm transition-all border border-transparent hover:border-luxury-gold/20"
                            title="View details"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteModal(order)}
                            className="p-2 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-sm transition-all border border-transparent hover:border-red-500/20"
                            title="Delete order"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
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
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-xs font-medium rounded-sm transition-all ${
                  page === i + 1
                    ? "bg-luxury-gold text-luxury-black"
                    : "border border-luxury-gold/10 text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/30"
                }`}
              >
                {i + 1}
              </button>
            ))}
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

      {/* ════════════════════ ORDER DETAIL / EDIT MODAL ════════════════════ */}
      <AnimatePresence>
        {detailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-luxury-black/80 backdrop-blur-sm"
            onClick={() => !saving && setDetailModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl glass border border-luxury-gold/20 rounded-sm shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-gold/10 sticky top-0 bg-luxury-black/95 backdrop-blur-xl z-10">
                <div>
                  <h2 className="text-lg font-serif text-luxury-white">
                    Order #{detailModal._id.slice(-6).toUpperCase()}
                  </h2>
                  <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-0.5">
                    Placed {formatDate(detailModal.createdAt)} at {formatTime(detailModal.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setDetailModal(null)}
                  className="text-gray-500 hover:text-luxury-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer */}
                  <div className="bg-luxury-gray/30 border border-luxury-gold/5 rounded-sm p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <User size={11} /> Customer
                    </p>
                    <p className="text-luxury-white text-sm font-medium">
                      {detailModal.user?.name || "Unknown"}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {detailModal.user?.email || "—"}
                    </p>
                    {detailModal.user?.phone && (
                      <p className="text-gray-500 text-xs">{detailModal.user.phone}</p>
                    )}
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-luxury-gray/30 border border-luxury-gold/5 rounded-sm p-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <MapPin size={11} /> Shipping
                    </p>
                    {detailModal.shippingAddress ? (
                      <>
                        <p className="text-luxury-white text-sm">
                          {detailModal.shippingAddress.address}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {detailModal.shippingAddress.city}, {detailModal.shippingAddress.postalCode}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {detailModal.shippingAddress.country}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-600 text-xs">No address</p>
                    )}
                  </div>
                </div>

                {/* Status Controls */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">
                    Update Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => {
                      const cfg = getStatusConfig(s);
                      const isActive = detailModal.status === s;
                      return (
                        <button
                          key={s}
                          disabled={saving}
                          onClick={() => handleStatusUpdate(detailModal._id, s)}
                          className={`flex items-center gap-1.5 px-4 py-2 text-[10px] uppercase tracking-widest border rounded-sm transition-all disabled:opacity-50 ${
                            isActive
                              ? `${cfg.bg} ${cfg.border} ${cfg.color} font-bold`
                              : "border-luxury-gold/10 text-gray-500 hover:border-luxury-gold/30 hover:text-gray-300"
                          }`}
                        >
                          {cfg.icon}
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Toggle */}
                <div className="flex items-center justify-between bg-luxury-gray/30 border border-luxury-gold/5 rounded-sm p-4">
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-500" />
                    <div>
                      <p className="text-luxury-white text-sm">Payment Status</p>
                      <p className="text-gray-500 text-[10px]">
                        {detailModal.paymentMethod || "N/A"} •{" "}
                        {detailModal.paidAt ? `Paid ${formatDate(detailModal.paidAt)}` : "Not paid yet"}
                      </p>
                    </div>
                  </div>
                  <button
                    disabled={saving}
                    onClick={() =>
                      handlePaymentToggle(detailModal._id, !detailModal.isPaid)
                    }
                    className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm border transition-all disabled:opacity-50 ${
                      detailModal.isPaid
                        ? "bg-green-500/10 border-green-500/30 text-green-400"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                    }`}
                  >
                    {detailModal.isPaid ? "✓ Paid" : "Mark Paid"}
                  </button>
                </div>

                {/* Order Items */}
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Package size={11} /> Items ({detailModal.orderItems?.length || 0})
                  </p>
                  <div className="space-y-3">
                    {detailModal.orderItems?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 bg-luxury-gray/30 border border-luxury-gold/5 rounded-sm p-3"
                      >
                        <div className="w-12 h-12 bg-luxury-gray rounded-sm overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={16} className="text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-luxury-white text-sm truncate">
                            {item.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <p className="text-luxury-gold font-serif text-sm flex-shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-luxury-gray/30 border border-luxury-gold/5 rounded-sm p-4 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Subtotal</span>
                    <span>{formatCurrency(detailModal.itemsPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Tax</span>
                    <span>{formatCurrency(detailModal.taxPrice)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Shipping</span>
                    <span>{formatCurrency(detailModal.shippingPrice)}</span>
                  </div>
                  <div className="border-t border-luxury-gold/10 pt-2 mt-2 flex justify-between items-center">
                    <span className="text-luxury-white font-medium text-sm">Total</span>
                    <span className="text-luxury-gold font-serif text-lg">
                      {formatCurrency(detailModal.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
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
                  Delete Order
                </h3>
                <p className="text-gray-400 text-sm mb-1">
                  Permanently remove order
                </p>
                <p className="text-luxury-white font-mono text-sm mb-1">
                  #{deleteModal._id.slice(-6).toUpperCase()}
                </p>
                <p className="text-luxury-gold text-sm mb-6">
                  {formatCurrency(deleteModal.totalPrice)}
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

export default OrderManager;
