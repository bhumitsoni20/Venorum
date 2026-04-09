import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Heart, RefreshCw } from 'lucide-react';

const API_URL = "http://localhost:5000/api";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const token = localStorage.getItem("venorum_auth_token");
    if (!token) {
      navigate('/login');
      return;
    }

    setCartLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id, quantity: 1 })
      });

      if (res.ok) {
        setMessage("Item added to your shopping bag.");
        // Notify Navbar to update count
        window.dispatchEvent(new Event("venorum-cart-change"));
      } else {
        const data = await res.json();
        throw new Error(data.message || "Failed to add to cart");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="animate-spin text-luxury-gold" size={32} />
    </div>
  );

  if (error && !product) return (
    <div className="min-h-screen pt-32 text-center">
      <h2 className="text-2xl font-serif text-red-500">Error: {error}</h2>
      <Link to="/shop" className="text-luxury-gold underline mt-4 inline-block">Back to Shop</Link>
    </div>
  );

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
              <img src={product.images[0] || 'https://via.placeholder.com/600'} alt={product.name} className="w-full h-full object-cover" />
           </motion.div>
           <div className="grid grid-cols-2 gap-6">
              {product.images[1] && (
                <div className="h-[300px] bg-luxury-gray rounded-sm overflow-hidden">
                   <img src={product.images[1]} alt={product.name} className="w-full h-full object-cover" />
                </div>
              )}
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
           {message && <p className="bg-luxury-gold/10 text-luxury-gold p-3 mb-6 text-xs uppercase tracking-widest border border-luxury-gold/20">{message}</p>}
           
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             className="text-luxury-gold tracking-[0.3em] text-xs uppercase mb-4"
           >
             Venorum Masterpiece
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
             ₹{product.price.toLocaleString("en-IN")}
           </motion.p>
           
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="space-y-6 mb-10"
           >
             <p className="text-gray-400 leading-relaxed font-light">{product.description}</p>
           </motion.div>

           {/* Actions */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.7 }}
             className="flex space-x-4 mb-12"
           >
              <button 
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="flex-grow bg-luxury-gold text-luxury-black hover:bg-luxury-white transition-colors py-4 uppercase tracking-widest text-sm font-medium flex items-center justify-center gap-2"
              >
                {cartLoading ? <RefreshCw className="animate-spin" size={16} /> : "Add to Cart"}
              </button>
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
