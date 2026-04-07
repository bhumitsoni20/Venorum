import React from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();

  // Placeholder static data
  const product = {
    name: 'The Aurelia Ring',
    price: '₹3,45,000',
    description: 'A masterpiece of modern craftsmanship, the Aurelia Ring features a flawless 2-carat center diamond embraced by an interlocking band of 18k solid gold. Perfect for those who desire understated elegance with a commanding presence.',
    story: 'Inspired by the celestial movements and the golden hour, Aurelia was forged for the modern goddess. It takes our master jewelers 120 hours to set and polish the delicate facets.',
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=1000&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1599643478514-411bd0adddd1?q=80&w=1000&auto=format&fit=crop'
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20"
    >
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        {/* Image Gallery */}
        <div className="space-y-6">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
             className="w-full h-[600px] bg-luxury-gray rounded-sm overflow-hidden"
           >
              <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
           </motion.div>
           <div className="grid grid-cols-2 gap-6">
              <div className="h-[300px] bg-luxury-gray rounded-sm overflow-hidden">
                 <img src={product.images[1]} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="h-[300px] bg-luxury-gray rounded-sm flex items-center justify-center p-8 text-center border border-luxury-gold/20 relative overflow-hidden group cursor-pointer">
                 <div className="absolute inset-0 bg-luxury-gold/5 group-hover:bg-luxury-gold/10 transition-colors"></div>
                 <div>
                    <p className="text-sm tracking-[0.2em] uppercase text-luxury-gold mb-2">Exclusive</p>
                    <p className="font-serif">Request a 360° Video Consultation</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-center">
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-luxury-gold tracking-[0.3em] text-xs uppercase mb-4"
           >
             Bridal Collection
           </motion.p>
           
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="text-4xl md:text-5xl font-serif mb-4"
           >
             {product.name}
           </motion.h1>
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.4 }}
             className="text-2xl text-gray-400 font-light tracking-wide mb-8"
           >
             {product.price}
           </motion.p>
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="space-y-6 mb-10"
           >
             <p className="text-gray-400 leading-relaxed font-light">{product.description}</p>
             <div className="pt-4 border-t border-luxury-gold/10">
                <h4 className="font-serif text-lg mb-2">The Story</h4>
                <p className="text-gray-400 text-sm leading-relaxed font-light">{product.story}</p>
             </div>
           </motion.div>

           {/* Customization Options */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.6 }}
             className="mb-10 space-y-4"
           >
              <div>
                 <span className="block text-sm text-gray-400 mb-2">Material</span>
                 <div className="flex space-x-4">
                    <button className="w-8 h-8 rounded-full bg-[#E5D7B7] border-2 border-luxury-white ring-2 ring-offset-2 ring-offset-luxury-black ring-[#E5D7B7]"></button>
                    <button className="w-8 h-8 rounded-full bg-[#f3e5ab] border border-transparent"></button>
                    <button className="w-8 h-8 rounded-full bg-[#EAE2D6] border border-transparent"></button>
                 </div>
              </div>
              
              <div className="pt-4">
                 <div className="flex justify-between items-end mb-2">
                    <span className="block text-sm text-gray-400">Ring Size</span>
                    <span className="text-xs text-luxury-gold underline cursor-pointer hover:text-luxury-white transition-colors">Size Guide</span>
                 </div>
                 <select className="w-full bg-luxury-gray border border-luxury-gold/20 text-sm py-4 px-6 focus:outline-none focus:border-luxury-gold text-luxury-white">
                   <option>Select Size (US)</option>
                   <option>5.0</option>
                   <option>5.5</option>
                   <option>6.0</option>
                   <option>6.5</option>
                   <option>7.0</option>
                 </select>
              </div>
           </motion.div>

           {/* Actions */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.7 }}
             className="flex space-x-4 mb-12"
           >
              <button className="flex-grow bg-luxury-gold text-luxury-black hover:bg-luxury-white transition-colors py-4 uppercase tracking-widest text-sm font-medium">Add to Cart</button>
              <button className="p-4 border border-luxury-gold/20 hover:border-luxury-gold text-luxury-gold transition-colors flex items-center justify-center">
                 <Heart size={20} />
              </button>
           </motion.div>

           {/* Trust Badges */}
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.9 }}
             className="grid grid-cols-3 gap-4 border-t border-luxury-gold/10 pt-8"
           >
              <div className="text-center group">
                 <Truck className="mx-auto text-gray-400 mb-2 group-hover:text-luxury-gold transition-colors" size={20} strokeWidth={1.5} />
                 <p className="text-[10px] uppercase tracking-wider text-gray-400">Complimentary<br/>Shipping</p>
              </div>
              <div className="text-center group">
                 <ShieldCheck className="mx-auto text-gray-400 mb-2 group-hover:text-luxury-gold transition-colors" size={20} strokeWidth={1.5} />
                 <p className="text-[10px] uppercase tracking-wider text-gray-400">Lifetime<br/>Warranty</p>
              </div>
              <div className="text-center group">
                 <RotateCcw className="mx-auto text-gray-400 mb-2 group-hover:text-luxury-gold transition-colors" size={20} strokeWidth={1.5} />
                 <p className="text-[10px] uppercase tracking-wider text-gray-400">30-Day<br/>Returns</p>
              </div>
           </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductDetail;
