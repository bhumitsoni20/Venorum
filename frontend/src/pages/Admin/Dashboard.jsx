import React from "react";
import { motion } from "framer-motion";
import { Package, Users, ShoppingBag, TrendingUp, DollarSign } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { title: "Total Revenue", value: "₹45.2M", icon: <DollarSign size={24} className="text-luxury-gold" />, trend: "+12.5%" },
    { title: "Active Orders", value: "142", icon: <ShoppingBag size={24} className="text-luxury-gold" />, trend: "+5.2%" },
    { title: "Vault Members", value: "8,245", icon: <Users size={24} className="text-luxury-gold" />, trend: "+1.2%" },
    { title: "Products Minted", value: "314", icon: <Package size={24} className="text-luxury-gold" />, trend: "Steady" }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif text-luxury-white mb-2">Venorum Command Center</h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">Performance & Analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="glass border border-luxury-gold/10 p-6 rounded-sm hover:border-luxury-gold/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-luxury-black/50 rounded-sm border border-luxury-gold/20">
                {stat.icon}
              </div>
              <span className="text-xs text-green-500 font-bold tracking-wider">{stat.trend}</span>
            </div>
            <h3 className="text-gray-400 text-xs tracking-widest uppercase mb-1">{stat.title}</h3>
            <p className="text-2xl font-serif text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 glass border border-luxury-gold/10 rounded-sm p-6 flex flex-col justify-center items-center">
          <TrendingUp size={48} className="text-luxury-gold/50 mb-4" />
          <p className="text-white font-serif text-lg">Sales Trajectory Mapping</p>
          <p className="text-gray-500 text-xs">Visual analytics system deploying soon...</p>
        </div>
        <div className="glass border border-luxury-gold/10 rounded-sm p-6">
          <h3 className="text-luxury-white font-serif mb-6 text-lg border-b border-luxury-gold/10 pb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(req => (
              <div key={req} className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-white">ORD-49{req}X</p>
                  <p className="text-gray-500 text-xs">Awaiting Fulfillment</p>
                </div>
                <div className="text-luxury-gold font-serif">₹{Math.floor(Math.random() * 50) + 12},000</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
