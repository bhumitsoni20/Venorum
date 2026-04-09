import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, Heart, ArrowRight, RefreshCw, Star } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Wishlist = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    const token = localStorage.getItem("venorum_auth_token");
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/wishlist`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.status === 401) {
          localStorage.removeItem("venorum_auth_token");
          localStorage.removeItem("venorum_user");
          navigate('/login');
          return;
      }
      if (!res.ok) throw new Error("Could not fetch your curated collection.");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeProduct = async (productId) => {
    const token = localStorage.getItem("venorum_auth_token");
    try {
      const res = await fetch(`${API_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== productId));
      }
    } catch (err) {
      console.error("Removal failed", err);
    }
  };

  const addToCart = async (productId) => {
    const token = localStorage.getItem("venorum_auth_token");
    try {
      const res = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (res.ok) {
        // Notify Navbar
        window.dispatchEvent(new Event("venorum-cart-change"));
        // Remove from wishlist after adding to cart? Optional, but premium.
        // removeProduct(productId);
        alert("Masterpiece added to your shopping bag.");
      }
    } catch (err) {
      console.error("Cart addition failed", err);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-luxury-black">
      <RefreshCw className="animate-spin text-luxury-gold" size={40} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 container mx-auto px-6 bg-luxury-black font-sans"
    >
      <div className="flex flex-col md:flex-row justify-between items-baseline mb-16 gap-4">
        <div>
           <h1 className="text-5xl md:text-6xl font-serif text-luxury-white mb-4">Curated Collection</h1>
           <p className="text-luxury-gold text-xs uppercase tracking-[0.4em] font-medium">Your Handpicked Selection of Perfection</p>
        </div>
        <div className="text-gray-500 text-xs uppercase tracking-widest border-b border-luxury-gold/30 pb-2">
            {products.length} MASTERPIECES SAVED
        </div>
      </div>

      {products.length === 0 ? (
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center py-32 glass border border-luxury-gold/10"
        >
          <Heart className="mx-auto text-luxury-gold/20 mb-6" size={60} strokeWidth={1} />
          <p className="text-gray-400 font-light text-lg mb-10 tracking-wide">
            Your collection is currently empty. Begin your journey of discovery.
          </p>
          <Link
            to="/shop"
            className="inline-block bg-luxury-gold text-luxury-black px-12 py-4 uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-luxury-white transition-all duration-500 shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
          >
            Explore the Vault
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative flex flex-col glass border border-luxury-gold/10 hover:border-luxury-gold/40 transition-all duration-700 overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-luxury-gray">
                   <img
                     src={product.images?.[0] || "https://via.placeholder.com/600x800"}
                     alt={product.name}
                     className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 opacity-80 group-hover:opacity-100"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-transparent opacity-60"></div>
                   
                   {/* Actions Overlay */}
                   <div className="absolute top-6 right-6 flex flex-col gap-4 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                      <button 
                        onClick={() => removeProduct(product._id)}
                        className="bg-luxury-black/60 hover:bg-red-900/40 p-3 rounded-full border border-white/10 backdrop-blur-md text-white transition-colors"
                        title="Remove from collection"
                      >
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>

                {/* Product Info */}
                <div className="p-8 flex flex-col flex-grow">
                   <div className="flex justify-between items-start mb-4">
                      <div>
                         <h3 className="text-xl font-serif text-luxury-white mb-2 group-hover:text-luxury-gold transition-colors duration-500">
                             {product.name}
                         </h3>
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                             {product.category?.name || "Premium Collection"}
                         </p>
                      </div>
                      <span className="text-luxury-gold font-medium tracking-wide">
                          ₹{product.price?.toLocaleString("en-IN")}
                      </span>
                   </div>

                   <div className="flex items-center gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map(i => (
                          <Star key={i} size={10} className="fill-luxury-gold text-luxury-gold" />
                      ))}
                      <span className="text-[10px] text-gray-500 ml-2 tracking-tighter uppercase">(Authenticated)</span>
                   </div>

                   <p className="text-xs text-gray-400 font-light line-clamp-2 mb-8 flex-grow leading-relaxed">
                       {product.description || "An exquisite piece of unparalleled craftsmanship, designed to elevate your personal archive."}
                   </p>

                   <div className="flex gap-4">
                      <button
                        onClick={() => addToCart(product._id)}
                        className="flex-grow bg-luxury-gold text-luxury-black flex items-center justify-center gap-3 py-4 hover:bg-luxury-white transition-all duration-500 uppercase tracking-[0.2em] text-[10px] font-bold"
                      >
                        <ShoppingBag size={14} />
                        <span>Acquire</span>
                      </button>
                      <Link
                        to={`/product/${product._id}`}
                        className="w-14 border border-luxury-gold/30 flex items-center justify-center text-luxury-gold hover:bg-luxury-gold/10 transition-all"
                      >
                        <ArrowRight size={18} />
                      </Link>
                   </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {/* Footer Decoration */}
      <div className="mt-32 pt-20 border-t border-luxury-gold/10 text-center">
         <p className="text-[10px] text-luxury-gold/40 uppercase tracking-[0.8em] font-light">Exclusivity in Every Choice</p>
      </div>
    </motion.div>
  );
};

export default Wishlist;
