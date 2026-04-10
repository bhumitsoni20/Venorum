import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  RefreshCw,
  CircleDot,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  IndianRupee,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("venorum_auth_token");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "₹0";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toLocaleString("en-IN")}`;
  };

  const formatFullCurrency = (value) => {
    if (!value && value !== 0) return "₹0";
    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return {
          color: "text-amber-400",
          bg: "bg-amber-500/10",
          border: "border-amber-500/20",
          icon: <Clock size={12} />,
        };
      case "shipped":
        return {
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          icon: <Truck size={12} />,
        };
      case "delivered":
        return {
          color: "text-green-400",
          bg: "bg-green-500/10",
          border: "border-green-500/20",
          icon: <CheckCircle2 size={12} />,
        };
      case "cancelled":
        return {
          color: "text-red-400",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          icon: <XCircle size={12} />,
        };
      default:
        return {
          color: "text-gray-400",
          bg: "bg-gray-500/10",
          border: "border-gray-500/20",
          icon: <CircleDot size={12} />,
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin text-luxury-gold" size={36} />
          <p className="text-gray-500 uppercase tracking-widest text-xs">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <p className="text-red-400/80 text-sm">{error}</p>
        <button
          onClick={fetchDashboard}
          className="inline-flex items-center gap-2 px-8 py-3 border border-luxury-gold/30 text-luxury-gold text-xs uppercase tracking-widest hover:bg-luxury-gold/10 transition-colors"
        >
          <RefreshCw size={14} />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recentOrders || [];
  const statusMap = data?.ordersByStatus || {};
  const monthlyRevenue = data?.monthlyRevenue || [];

  // Calculate max revenue for bar chart scaling
  const maxMonthlyRevenue = Math.max(
    ...monthlyRevenue.map((m) => m.revenue),
    1
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif text-luxury-white mb-2">
            Venorum Command Center
          </h1>
          <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">
            Performance & Analytics — Live Data
          </p>
        </div>
        <button
          onClick={fetchDashboard}
          className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 border border-luxury-gold/20 text-gray-400 hover:text-luxury-gold hover:border-luxury-gold/40 transition-all text-xs uppercase tracking-widest rounded-sm"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            fullValue: formatFullCurrency(stats.totalRevenue),
            icon: <IndianRupee size={22} className="text-luxury-gold" />,
            subtitle: `Avg. order: ${formatFullCurrency(stats.avgOrderValue)}`,
          },
          {
            title: "Total Orders",
            value: stats.totalOrders?.toLocaleString("en-IN") || "0",
            icon: <ShoppingBag size={22} className="text-luxury-gold" />,
            subtitle: `${statusMap["Processing"] || 0} processing`,
          },
          {
            title: "Vault Members",
            value: stats.totalUsers?.toLocaleString("en-IN") || "0",
            icon: <Users size={22} className="text-luxury-gold" />,
            subtitle: "Registered users",
          },
          {
            title: "Products Minted",
            value: stats.totalProducts?.toLocaleString("en-IN") || "0",
            icon: <Package size={22} className="text-luxury-gold" />,
            subtitle: "In catalog",
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass border border-luxury-gold/10 p-6 rounded-sm hover:border-luxury-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.08)] transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-luxury-black/50 rounded-sm border border-luxury-gold/20 group-hover:border-luxury-gold/40 transition-colors">
                {stat.icon}
              </div>
            </div>
            <h3 className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mb-1">
              {stat.title}
            </h3>
            <p
              className="text-2xl font-serif text-white mb-1"
              title={stat.fullValue || stat.value}
            >
              {stat.value}
            </p>
            <p className="text-[10px] text-gray-600 tracking-wider">
              {stat.subtitle}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="lg:col-span-2 glass border border-luxury-gold/10 rounded-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-luxury-white font-serif text-lg">
                Revenue Trajectory
              </h3>
              <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-1">
                Last 6 months
              </p>
            </div>
            <BarChart3 size={18} className="text-luxury-gold/40" />
          </div>

          {monthlyRevenue.length > 0 ? (
            <div className="space-y-4">
              {/* Bar Chart */}
              <div className="flex items-end gap-3 h-48 px-2">
                {monthlyRevenue.map((month, i) => {
                  const heightPercent = (month.revenue / maxMonthlyRevenue) * 100;
                  return (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(heightPercent, 4)}%` }}
                      transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
                      className="flex-1 relative group/bar"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-luxury-gold/30 to-luxury-gold/10 rounded-t-sm border border-luxury-gold/20 group-hover/bar:from-luxury-gold/50 group-hover/bar:to-luxury-gold/20 transition-colors cursor-pointer" />
                      {/* Tooltip */}
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-luxury-black/95 border border-luxury-gold/20 px-3 py-2 rounded-sm text-[10px] text-center whitespace-nowrap z-10 pointer-events-none">
                        <p className="text-luxury-gold font-medium">
                          {formatFullCurrency(month.revenue)}
                        </p>
                        <p className="text-gray-500">
                          {month.orders} orders
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {/* Month Labels */}
              <div className="flex gap-3 px-2">
                {monthlyRevenue.map((month, i) => (
                  <div
                    key={i}
                    className="flex-1 text-center text-[10px] text-gray-500 uppercase tracking-wider"
                  >
                    {month.month}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <TrendingUp
                size={40}
                className="text-luxury-gold/20 mb-3"
              />
              <p className="text-gray-500 text-xs">
                No revenue data yet.
              </p>
              <p className="text-gray-600 text-[10px]">
                Revenue analytics will appear once orders are placed.
              </p>
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="glass border border-luxury-gold/10 rounded-sm p-6">
          <h3 className="text-luxury-white font-serif text-lg mb-1">
            Order Pipeline
          </h3>
          <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-6">
            Status breakdown
          </p>

          <div className="space-y-4">
            {[
              { key: "Processing", label: "Processing" },
              { key: "Shipped", label: "Shipped" },
              { key: "Delivered", label: "Delivered" },
              { key: "Cancelled", label: "Cancelled" },
            ].map((item) => {
              const count = statusMap[item.key] || 0;
              const total = stats.totalOrders || 1;
              const percent = Math.round((count / total) * 100);
              const cfg = getStatusConfig(item.key);

              return (
                <div key={item.key}>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`flex items-center gap-2 text-xs uppercase tracking-wider ${cfg.color}`}
                    >
                      {cfg.icon}
                      {item.label}
                    </span>
                    <span className="text-gray-400 text-xs font-medium">
                      {count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-luxury-gray/50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${cfg.bg.replace("/10", "/40")}`}
                      style={{
                        backgroundColor:
                          item.key === "Processing"
                            ? "rgb(251 191 36 / 0.5)"
                            : item.key === "Shipped"
                            ? "rgb(96 165 250 / 0.5)"
                            : item.key === "Delivered"
                            ? "rgb(74 222 128 / 0.5)"
                            : "rgb(248 113 113 / 0.5)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total at bottom */}
          <div className="mt-6 pt-4 border-t border-luxury-gold/10 flex justify-between items-center">
            <span className="text-gray-500 text-[10px] uppercase tracking-widest">
              Total Orders
            </span>
            <span className="text-luxury-white font-serif text-lg">
              {stats.totalOrders || 0}
            </span>
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ── */}
      <div className="glass border border-luxury-gold/10 rounded-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-luxury-gold/10 flex justify-between items-center">
          <div>
            <h3 className="text-luxury-white font-serif text-lg">
              Recent Transactions
            </h3>
            <p className="text-gray-600 text-[10px] uppercase tracking-widest mt-0.5">
              Latest {recentOrders.length} orders
            </p>
          </div>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] text-gray-600 uppercase tracking-[0.15em] border-b border-luxury-gold/5 bg-luxury-black/30">
                  <th className="text-left px-6 py-3.5 font-medium">
                    Order ID
                  </th>
                  <th className="text-left px-6 py-3.5 font-medium hidden md:table-cell">
                    Customer
                  </th>
                  <th className="text-center px-6 py-3.5 font-medium">
                    Items
                  </th>
                  <th className="text-center px-6 py-3.5 font-medium">
                    Status
                  </th>
                  <th className="text-center px-6 py-3.5 font-medium hidden sm:table-cell">
                    Payment
                  </th>
                  <th className="text-right px-6 py-3.5 font-medium">
                    Amount
                  </th>
                  <th className="text-right px-6 py-3.5 font-medium hidden lg:table-cell">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, idx) => {
                  const statusCfg = getStatusConfig(order.status);
                  return (
                    <motion.tr
                      key={order._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-luxury-gold/5 hover:bg-luxury-gold/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-luxury-white font-mono text-xs">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div>
                          <p className="text-gray-300 text-xs truncate max-w-[160px]">
                            {order.customerName}
                          </p>
                          <p className="text-gray-600 text-[10px] truncate max-w-[160px]">
                            {order.customerEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-400 text-xs">
                          {order.itemCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] uppercase tracking-wider font-semibold rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}
                        >
                          {statusCfg.icon}
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center hidden sm:table-cell">
                        <span
                          className={`text-[10px] uppercase tracking-wider font-medium ${
                            order.isPaid
                              ? "text-green-400"
                              : "text-amber-400"
                          }`}
                        >
                          {order.isPaid ? "Paid" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-luxury-gold font-serif text-sm">
                          {formatFullCurrency(order.totalPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right hidden lg:table-cell">
                        <div>
                          <p className="text-gray-400 text-xs">
                            {formatDate(order.createdAt)}
                          </p>
                          <p className="text-gray-600 text-[10px]">
                            {formatTime(order.createdAt)}
                          </p>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto text-gray-700 mb-4" size={36} />
            <p className="text-gray-500 text-sm">
              No transactions yet.
            </p>
            <p className="text-gray-600 text-[10px] mt-1">
              Orders will appear here as they are placed.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
