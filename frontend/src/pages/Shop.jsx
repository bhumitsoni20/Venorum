import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Shop = () => {
  const products = [
    { id: 1, name: 'The Aurelia Ring', price: '₹3,45,000', img: 'https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=600&auto=format&fit=crop' },
    { id: 2, name: 'Eternity Pendant', price: '₹2,35,000', img: 'https://images.unsplash.com/photo-1599643477874-c4a6a4218a5c?q=80&w=600&auto=format&fit=crop' },
    { id: 3, name: 'Sapphire Tears', price: '₹5,30,000', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop' },
    { id: 4, name: 'Venezia Bracelet', price: '₹2,55,000', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop' },
    { id: 5, name: 'Monarch Band', price: '₹1,55,000', img: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600&auto=format&fit=crop' },
    { id: 6, name: 'Solitaire Luminous', price: '₹7,85,000', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 px-6 container mx-auto"
    >
       <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-6 md:space-y-0">
          <div>
            <h1 className="text-4xl md:text-6xl font-serif mb-4">The Collection</h1>
            <p className="text-gray-400 max-w-md">Filter through our meticulously crafted selections of high jewelry.</p>
          </div>
          <div className="flex space-x-4">
             <select className="bg-transparent border border-luxury-gold/30 text-sm py-3 px-6 rounded-sm focus:outline-none focus:border-luxury-gold text-luxury-white cursor-pointer">
               <option className="bg-luxury-black">All Categories</option>
               <option className="bg-luxury-black">Rings</option>
               <option className="bg-luxury-black">Necklaces</option>
             </select>
             <select className="bg-transparent border border-luxury-gold/30 text-sm py-3 px-6 rounded-sm focus:outline-none focus:border-luxury-gold text-luxury-white cursor-pointer">
               <option className="bg-luxury-black">Sort by: Featured</option>
               <option className="bg-luxury-black">Price: High to Low</option>
               <option className="bg-luxury-black">Price: Low to High</option>
             </select>
          </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((p, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.1, duration: 0.8 }}
               key={p.id} 
               className="group relative cursor-pointer"
             >
                <div className="relative h-[450px] overflow-hidden bg-luxury-gray rounded-sm mb-6 border border-transparent group-hover:border-luxury-gold/30 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                   <img src={p.img} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
                   <Link to={`/product/${p.id}`} className="absolute inset-0 z-10"></Link>
                   <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-gradient-to-t from-black/80 to-transparent">
                      <button className="text-xs uppercase tracking-wider text-luxury-white hover:text-luxury-gold border-b border-transparent hover:border-luxury-gold pb-1 transition-colors">Quick View</button>
                      <button className="text-xs uppercase tracking-wider bg-luxury-gold text-luxury-black px-4 py-2 hover:bg-luxury-white transition-colors">Add</button>
                   </div>
                </div>
                <div>
                   <h3 className="text-lg font-serif mb-1 group-hover:text-luxury-gold transition-colors">{p.name}</h3>
                   <p className="text-sm tracking-wide text-gray-400">{p.price}</p>
                </div>
             </motion.div>
          ))}
       </div>
    </motion.div>
  );
};

export default Shop;
