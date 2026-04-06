import React from 'react';
import { motion } from 'framer-motion';
import { Package, Heart, Settings, LogOut } from 'lucide-react';

const Profile = () => {
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
               <h2 className="text-3xl font-serif mb-1">Eleanor Vance</h2>
               <p className="text-luxury-gold text-sm tracking-wider">VIP Select Member</p>
            </div>
            
            <nav className="flex flex-col space-y-2">
               <a href="#" className="flex items-center space-x-4 p-4 bg-luxury-gray border-l-2 border-luxury-gold text-luxury-white transition-colors">
                 <Package size={18} />
                 <span className="text-sm uppercase tracking-wide">My Orders</span>
               </a>
               <a href="#" className="flex items-center space-x-4 p-4 hover:bg-luxury-gray border-l-2 border-transparent hover:border-gray-500 text-gray-400 hover:text-luxury-white transition-colors">
                 <Heart size={18} />
                 <span className="text-sm uppercase tracking-wide">Wishlist</span>
               </a>
               <a href="#" className="flex items-center space-x-4 p-4 hover:bg-luxury-gray border-l-2 border-transparent hover:border-gray-500 text-gray-400 hover:text-luxury-white transition-colors">
                 <Settings size={18} />
                 <span className="text-sm uppercase tracking-wide">Account Details</span>
               </a>
               <a href="#" className="flex items-center space-x-4 p-4 hover:bg-luxury-gray border-l-2 border-transparent hover:border-red-900 text-red-500 transition-colors mt-8">
                 <LogOut size={18} />
                 <span className="text-sm uppercase tracking-wide">Sign Out</span>
               </a>
            </nav>
         </div>

         {/* Main Content */}
         <div className="w-full md:w-3/4">
            <h3 className="text-2xl font-serif mb-8 border-b border-luxury-gold/20 pb-4">Recent Orders</h3>
            
            <div className="space-y-6">
               {[1, 2].map((order) => (
                  <div key={order} className="border border-luxury-gold/10 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:border-luxury-gold/30 transition-colors">
                     <div className="w-24 h-24 bg-luxury-gray shrink-0 rounded-sm overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=200&auto=format&fit=crop" className="w-full h-full object-cover" alt="Item" />
                     </div>
                     <div className="flex-grow text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row justify-between mb-2">
                           <h4 className="font-serif text-lg">The Aurelia Ring</h4>
                           <span className="text-luxury-gold text-sm font-medium">₹3,45,000</span>
                        </div>
                        <p className="text-xs text-gray-500 tracking-wider mb-4">ORDER #VN-84729 • MAY {12 + order}, 2026</p>
                        <div className="inline-block px-3 py-1 bg-luxury-gray border border-gray-700 text-[10px] uppercase tracking-wider text-gray-300">
                           Processing
                        </div>
                     </div>
                     <div className="w-full sm:w-auto sm:text-right pt-4 sm:pt-0">
                        <button className="text-xs uppercase tracking-widest text-luxury-gold hover:text-luxury-white transition-colors underline underline-offset-4">View Receipt</button>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </motion.div>
  );
};

export default Profile;
