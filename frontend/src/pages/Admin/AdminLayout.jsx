import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={18} /> },
    { name: "Catalog", path: "/admin/products", icon: <Package size={18} /> },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingBag size={18} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-luxury-black flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 z-50 left-4 text-luxury-white glass p-2 rounded-sm border border-luxury-gold/50"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {(sidebarOpen || window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            exit={{ x: -250 }}
            transition={{ duration: 0.3 }}
            className={`fixed md:relative z-40 w-64 h-screen glass border-r border-luxury-gold/20 flex flex-col pt-20 md:pt-8 bg-luxury-black/95 md:bg-transparent backdrop-blur-xl md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="px-8 mb-12 hidden md:block">
              <Link to="/" className="text-2xl font-serif text-luxury-white tracking-widest hover:text-luxury-gold transition-colors">
                VENORUM <span className="text-xs text-luxury-gold block uppercase tracking-[0.4em] mt-1">Admin</span>
              </Link>
            </div>

            <nav className="flex-1 px-4 space-y-2 text-sm font-sans uppercase tracking-widest text-gray-400">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-4 px-4 py-3 rounded-sm transition-all duration-300 ${
                      isActive ? "bg-luxury-gold text-luxury-black font-semibold shadow-[0_0_15px_rgba(212,175,55,0.3)]" : "hover:bg-luxury-gray hover:text-luxury-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-luxury-gold/20">
              <Link to="/" className="flex items-center space-x-4 px-4 py-3 text-sm text-red-500 hover:bg-luxury-gray hover:text-red-400 rounded-sm transition-colors uppercase tracking-widest">
                <LogOut size={18} />
                <span>Exit Panel</span>
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden pt-16 md:pt-0">
        <div className="p-6 md:p-10 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
