import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Settings, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:5000/api";

const Profile = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("venorum_user") || "{}"));

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("venorum_auth_token");
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const res = await fetch(`${API_URL}/orders/myorders`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (e) {
        console.error("Order fetch failed", e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("venorum_auth_token");
    localStorage.removeItem("venorum_user");
    window.dispatchEvent(new Event("venorum-auth-change"));
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="animate-spin text-luxury-gold" size={32} />
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 container mx-auto px-6"
    >
      <div className="flex flex-col md:flex-row gap-12">
         {/* Sidebar */}
         <div className="w-full md:w-1/4">
            <div className="mb-10">
               <h2 className="text-3xl font-serif mb-1">{user.name || "Venorum Member"}</h2>
               <p className="text-luxury-gold text-sm tracking-wider">{user.role === 'admin' ? 'Master Curator' : 'VIP Select Member'}</p>
            </div>
            
            <nav className="flex flex-col space-y-2">
               <a href="#" className="flex items-center space-x-4 p-4 bg-luxury-gray border-l-2 border-luxury-gold text-luxury-white transition-colors">
                 <Package size={18} />
                 <span className="text-sm uppercase tracking-wide">My Orders</span>
               </a>
               <a href="#" className="flex items-center space-x-4 p-4 hover:bg-luxury-gray border-l-2 border-transparent hover:border-luxury-gold/20 text-gray-400 hover:text-luxury-white transition-colors">
                 <Settings size={18} />
                 <span className="text-sm uppercase tracking-wide">Account Details</span>
               </a>
               <button 
                onClick={handleLogout}
                className="flex items-center space-x-4 p-4 hover:bg-luxury-gray border-l-2 border-transparent hover:border-red-900 text-red-500 transition-colors mt-8 w-full text-left"
               >
                 <LogOut size={18} />
                 <span className="text-sm uppercase tracking-wide">Sign Out</span>
               </button>
            </nav>
         </div>

         {/* Main Content */}
         <div className="w-full md:w-3/4">
            <h3 className="text-2xl font-serif mb-8 border-b border-luxury-gold/20 pb-4">Recent Orders</h3>
            
            <div className="space-y-6">
               {orders.length === 0 ? (
                 <p className="text-gray-400 text-center py-10 border border-luxury-gold/10 text-xs tracking-widest uppercase">No recent acquisitions found.</p>
               ) : (
                 orders.map((order) => (
                    <div key={order._id} className="border border-luxury-gold/10 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-luxury-gold/20 transition-colors">
                       <div className="w-24 h-24 bg-luxury-gray shrink-0 rounded-sm overflow-hidden">
                          <img 
                            src={order.orderItems[0]?.image || "https://via.placeholder.com/200"} 
                            className="w-full h-full object-cover" 
                            alt="Item" 
                          />
                       </div>
                       <div className="flex-grow text-center sm:text-left">
                          <div className="flex flex-col sm:flex-row justify-between mb-2">
                             <h4 className="font-serif text-lg">{order.orderItems[0]?.name} {order.orderItems.length > 1 && `+ ${order.orderItems.length - 1} more`}</h4>
                             <span className="text-luxury-gold text-sm font-medium">₹{order.totalPrice.toLocaleString("en-IN")}</span>
                          </div>
                          <p className="text-xs text-gray-400 tracking-wider mb-4 uppercase">
                            ORDER #{order._id.substring(order._id.length - 8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                          <div className="inline-block px-3 py-1 bg-luxury-gray border border-luxury-gold/20 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                             {order.status}
                          </div>
                       </div>
                       <div className="w-full sm:w-auto sm:text-right pt-4 sm:pt-0">
                          <button className="text-[10px] uppercase tracking-widest text-luxury-gold hover:text-luxury-white transition-colors underline underline-offset-4 font-semibold">View Details</button>
                       </div>
                    </div>
                 ))
               )}
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default Profile;

