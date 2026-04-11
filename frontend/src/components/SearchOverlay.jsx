import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setHasSearched(false);
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(
          `${API_URL}/products?keyword=${encodeURIComponent(query.trim())}&limit=8`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const formatPrice = (v) =>
    v ? `₹${Number(v).toLocaleString("en-IN")}` : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex flex-col"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-luxury-black/95 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col w-full h-full max-w-4xl mx-auto px-6 pt-8">
            {/* Close */}
            <div className="flex justify-end mb-6">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-luxury-white transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Field */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="relative mb-10"
            >
              <div className="flex items-center border-b border-luxury-gold/20 pb-4 gap-4">
                <Search
                  size={24}
                  className="text-luxury-gold flex-shrink-0"
                  strokeWidth={1.5}
                />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for jewelry, rings, necklaces..."
                  className="flex-1 bg-transparent text-luxury-white text-2xl md:text-3xl font-serif placeholder:text-gray-600 focus:outline-none tracking-wide"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="text-gray-500 hover:text-luxury-white transition-colors p-1"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-gray-600 uppercase tracking-[0.3em] mt-3">
                {loading
                  ? "Searching the vault..."
                  : query
                    ? `${results.length} result${results.length !== 1 ? "s" : ""} found`
                    : "Type to discover exquisite creations"}
              </p>
            </motion.div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto pb-10 custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2
                    className="animate-spin text-luxury-gold"
                    size={32}
                  />
                </div>
              ) : !hasSearched && !query ? (
                /* Suggestions when nothing is typed */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {[
                    "Rings",
                    "Necklaces",
                    "Earrings",
                    "Bracelets",
                    "Gold",
                    "Diamond",
                    "Silver",
                    "Platinum",
                  ].map((tag, i) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="group flex items-center gap-2 p-4 border border-luxury-gold/10 hover:border-luxury-gold/30 bg-luxury-gray/30 hover:bg-luxury-gold/5 transition-all duration-300 rounded-sm"
                    >
                      <Sparkles
                        size={12}
                        className="text-luxury-gold/40 group-hover:text-luxury-gold transition-colors"
                      />
                      <span className="text-xs uppercase tracking-[0.2em] text-gray-400 group-hover:text-luxury-white transition-colors">
                        {tag}
                      </span>
                    </button>
                  ))}
                </motion.div>
              ) : results.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  {results.map((product, idx) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link
                        to={`/product/${product._id}`}
                        onClick={onClose}
                        className="flex items-center gap-5 p-4 hover:bg-luxury-gold/[0.04] border border-transparent hover:border-luxury-gold/10 transition-all duration-300 group rounded-sm"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-luxury-gray rounded-sm overflow-hidden flex-shrink-0 border border-luxury-gold/10 group-hover:border-luxury-gold/30 transition-colors">
                          <img
                            src={
                              product.images?.[0] ||
                              "https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=200&auto=format&fit=crop"
                            }
                            alt={product.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-luxury-white font-serif text-sm md:text-base group-hover:text-luxury-gold transition-colors truncate">
                            {product.name}
                          </h3>
                          <p className="text-gray-500 text-xs mt-1 truncate max-w-md">
                            {product.description?.slice(0, 80)}
                            {product.description?.length > 80 ? "..." : ""}
                          </p>
                          {product.category?.name && (
                            <span className="inline-block mt-2 text-[9px] uppercase tracking-[0.2em] text-luxury-gold/60 border border-luxury-gold/10 px-2 py-0.5 rounded-sm">
                              {product.category.name}
                            </span>
                          )}
                        </div>

                        {/* Price & Arrow */}
                        <div className="flex-shrink-0 text-right flex items-center gap-4">
                          <span className="text-luxury-gold font-serif text-sm md:text-base">
                            {formatPrice(product.price)}
                          </span>
                          <ArrowRight
                            size={16}
                            className="text-gray-600 group-hover:text-luxury-gold group-hover:translate-x-1 transition-all"
                          />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>
              ) : hasSearched ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20"
                >
                  <Search className="mx-auto text-gray-700 mb-4" size={40} />
                  <p className="text-gray-400 text-sm font-serif mb-2">
                    No treasures found for "{query}"
                  </p>
                  <p className="text-gray-600 text-xs">
                    Try a different search or browse our collections
                  </p>
                </motion.div>
              ) : null}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
