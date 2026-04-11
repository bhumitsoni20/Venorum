import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const API_URL = "http://localhost:5000/api"; 

const Shop = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch(`${API_URL}/categories`);
        const prodRes = await fetch(`${API_URL}/products`);
        
        if (catRes.ok && prodRes.ok) {
          setCategories(await catRes.json());
          const prodData = await prodRes.json();
          setProducts(prodData.products || prodData);
        }
      } catch(err) {
        console.error("Failed to fetch shop inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderSection = (mainCategoryName, subHeaderText) => {
    // Top 5-6 dynamic categories under this section + specific products linked to them
    const sectionCategories = categories.filter(c => c.mainCategory === mainCategoryName).slice(0, 6);
    
    // We get products that belong to the section categories
    const sectionCatIds = sectionCategories.map(c => c._id);
    const sectionProducts = products.filter(p => p.category && sectionCatIds.includes(p.category._id)).slice(0, 6);

    return (
      <div className="mb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif mb-2 text-luxury-white">
              {mainCategoryName} Collection 
            </h2>
            <p className="text-gray-400 max-w-md text-sm">{subHeaderText}</p>
          </div>
          <button 
             onClick={() => navigate(`/shop/${mainCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '')}`)}
             className="mt-6 md:mt-0 flex items-center space-x-2 text-sm uppercase tracking-widest text-luxury-gold hover:text-white transition-colors"
          >
             <span>View All {mainCategoryName} Categories</span>
             <ArrowRight size={16} />
          </button>
        </div>

        {sectionProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {sectionProducts.map((p, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8 }}
                key={p._id}
                className="group relative cursor-pointer"
              >
                <div className="relative h-[450px] overflow-hidden bg-luxury-gray rounded-sm mb-6 border border-transparent group-hover:border-luxury-gold/20 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                  <img
                    src={p.images[0] || "https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=600&auto=format&fit=crop"}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  />
                  <Link
                    to={`/product/${p._id}`}
                    className="absolute inset-0 z-10"
                  ></Link>
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-luxury-black/60 backdrop-blur-md text-luxury-gold text-[10px] px-3 py-1 uppercase tracking-widest border border-luxury-gold/20 rounded-sm">
                      {p.category?.name || "Premium Piece"}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 bg-gradient-to-t from-luxury-black/90 to-transparent">
                    <button className="text-xs uppercase tracking-wider text-white hover:text-luxury-gold border-b border-transparent hover:border-luxury-gold pb-1 transition-colors">
                      Quick View
                    </button>
                    <button className="text-[10px] font-bold uppercase tracking-widest bg-luxury-gold text-luxury-black px-4 py-2 hover:bg-luxury-white transition-colors">
                      Acquire
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-serif mb-1 group-hover:text-luxury-gold transition-colors text-white">
                    {p.name}
                  </h3>
                  <p className="text-sm tracking-wide text-gray-400">₹{p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="w-full py-20 flex flex-col items-center justify-center border border-luxury-gold/10 rounded-sm glass">
             <p className="text-gray-500 text-sm uppercase tracking-widest text-center">Unveiling High Jewelry Assets Soon...</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 px-6 container mx-auto"
    >
      {loading ? (
        <div className="h-[60vh] flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-luxury-gold"></div>
        </div>
      ) : (
        <>
          {renderSection("Women's", "Discover the quintessence of feminine elegance through meticulously cut masterpieces.")}
          {renderSection("Men's", "Architectural precision and bold statements crafted for the modern gentleman.")}
          {renderSection("Kids", "Delicate, heirloom-quality pieces designed to be cherished for generations.")}
        </>
      )}
    </motion.div>
  );
};

export default Shop;
