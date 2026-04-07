import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const ShopCategoryDetails = () => {
  const { categorySlug } = useParams(); // 'womens', 'mens', 'kids'
  
  // Map slug back to exactly "Women's", "Men's", "Kids" expected in DB
  const slugToMainMap = {
    'womens': "Women's",
    'mens': "Men's",
    'kids': "Kids"
  };

  const mainCategoryName = slugToMainMap[categorySlug] || "Women's";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubcategory, setActiveSubcategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch(`${API_URL}/categories`);
        const prodRes = await fetch(`${API_URL}/products`);
        
        if (catRes.ok && prodRes.ok) {
          const allCategories = await catRes.json();
          const allProducts = await prodRes.json();

          const mappedCategories = allCategories.filter(c => c.mainCategory === mainCategoryName);
          setCategories(mappedCategories);

          const catIds = mappedCategories.map(c => c._id);
          const mappedProducts = allProducts.filter(p => p.category && catIds.includes(p.category._id));
          setProducts(mappedProducts);
        }
      } catch(err) {
        console.error("Failed to fetch shop inventory:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mainCategoryName]);

  const filteredProducts = activeSubcategory === 'All' 
    ? products 
    : products.filter(p => p.category?.name === activeSubcategory);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 px-6 container mx-auto"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif mb-4 text-luxury-white">
          {mainCategoryName} Heritage
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Explore the exhaustive compendium of curated masterpieces categorized exclusively for {mainCategoryName.toLowerCase()}.
        </p>
      </div>

      {loading ? (
        <div className="h-[40vh] flex justify-center items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-luxury-gold"></div>
        </div>
      ) : (
        <>
          {/* Subcategory Filter Banner */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 border-b border-luxury-gold/10 pb-8">
            <button
              onClick={() => setActiveSubcategory('All')}
              className={`px-8 py-3 text-xs uppercase tracking-[0.2em] transition-all rounded-full border ${
                activeSubcategory === 'All'
                ? "bg-luxury-gold text-luxury-black border-luxury-gold font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                : "border-gray-800 text-gray-400 hover:border-luxury-gold hover:text-luxury-white"
              }`}
            >
              All Categories
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveSubcategory(cat.name)}
                className={`px-8 py-3 text-xs uppercase tracking-[0.2em] transition-all rounded-full border ${
                  activeSubcategory === cat.name
                  ? "bg-luxury-gold text-luxury-black border-luxury-gold font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                  : "border-gray-800 text-gray-400 hover:border-luxury-gold hover:text-luxury-white"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((p, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.8 }}
                  key={p._id}
                  className="group relative cursor-pointer"
                >
                  <div className="relative h-[350px] overflow-hidden bg-luxury-gray rounded-sm mb-4 border border-transparent group-hover:border-luxury-gold/20 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
                    <img
                      src={p.images[0] || "https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=600&auto=format&fit=crop"}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                    />
                    <Link
                      to={`/product/${p._id}`}
                      className="absolute inset-0 z-10"
                    ></Link>
                  </div>
                  <div>
                    <h3 className="text-md font-serif mb-1 group-hover:text-luxury-gold transition-colors text-white">
                      {p.name}
                    </h3>
                    <p className="text-xs tracking-wide text-gray-400">₹{p.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="w-full py-20 flex flex-col items-center justify-center">
               <p className="text-gray-500 text-sm uppercase tracking-widest text-center italic">No masterworks minted in this parameter yet.</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ShopCategoryDetails;
