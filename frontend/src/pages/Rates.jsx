import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Info,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

const Rates = () => {
  const [city] = useState("Bikaner");
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [source, setSource] = useState("");

  const fetchRates = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/rates/${city.toLowerCase()}`);
      if (!res.ok) throw new Error("Failed to fetch rates");
      const json = await res.json();
      if (json.success) {
        setRates(json.data);
        setSource(json.source);
      } else {
        throw new Error(json.message || "Unknown error");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [city]);

  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";
    return "₹" + Number(price).toLocaleString("en-IN");
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const rateCards = rates
    ? [
        {
          name: "24K Gold",
          weight: "per gram",
          price: rates.gold?.["24k"],
          accent: "from-yellow-500/10 to-transparent",
        },
        {
          name: "22K Gold",
          weight: "per gram",
          price: rates.gold?.["22k"],
          accent: "from-amber-500/10 to-transparent",
        },
        {
          name: "Fine Silver",
          weight: "per gram",
          price: rates.silver,
          accent: "from-gray-400/10 to-transparent",
        },
      ]
    : [];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 relative bg-luxury-black overflow-hidden"
    >
      {/* Atmospheric Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-luxury-gold/5 via-luxury-black to-luxury-black opacity-60 mix-blend-screen pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        {/* Header Section */}
        <motion.div variants={fadeUp} className="text-center mb-16">
          <p className="text-luxury-gold tracking-[0.3em] font-medium text-xs uppercase mb-4 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]">
            Market Intelligence
          </p>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-tight">
            Live Gold & Silver Rates
          </h1>
          <p className="text-gray-400 font-light tracking-wide max-w-xl mx-auto">
            Real-time prices sourced from verified market channels, refreshed
            every 10 minutes to inform your next acquisition.
          </p>
        </motion.div>

        {/* Location Badge */}
        <motion.div variants={fadeUp} className="flex justify-center mb-12">
          <div className="flex items-center space-x-3 text-sm text-gray-400 py-2 px-6 border border-luxury-gold/20 rounded-full glass">
            <MapPin size={14} className="text-luxury-gold" />
            <span>
              Rates for <strong className="text-luxury-white">{city}</strong>
            </span>
            {source === "cache" && (
              <span className="text-[9px] bg-luxury-gold/10 text-luxury-gold px-2 py-0.5 rounded-full uppercase tracking-wider border border-luxury-gold/20">
                cached
              </span>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="animate-spin text-luxury-gold" size={36} />
            <p className="text-gray-500 uppercase tracking-widest text-xs">
              Fetching live market data...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <p className="text-red-400/80 text-sm mb-6">{error}</p>
            <button
              onClick={fetchRates}
              className="inline-flex items-center gap-2 px-8 py-3 border border-luxury-gold/30 text-luxury-gold text-xs uppercase tracking-widest hover:bg-luxury-gold/10 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </button>
          </motion.div>
        )}

        {/* Rate Cards */}
        {!loading && rates && (
          <>
            <motion.div
              variants={fadeUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              {rateCards.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15, duration: 0.7 }}
                  whileHover={{
                    y: -8,
                    boxShadow: "0 25px 50px -12px rgba(212,175,55,0.15)",
                  }}
                  className="glass p-8 border border-luxury-gold/20 rounded-sm relative overflow-hidden group"
                >
                  {/* Glow Effect */}
                  <div
                    className={`absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br ${item.accent} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000`}
                  ></div>

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] mb-1">
                          {item.weight}
                        </p>
                        <h3 className="text-xl font-serif text-white">
                          {item.name}
                        </h3>
                      </div>
                      <span className="text-2xl">{item.icon}</span>
                    </div>

                    <div className="flex items-end justify-between">
                      <p className="text-3xl md:text-4xl font-serif text-luxury-gold tracking-tight">
                        {item.price ? formatPrice(item.price) : "Unavailable"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Last Updated Bar */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 tracking-[0.15em] uppercase mb-8 px-2 gap-2"
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                Live market connection
              </span>
              <span>
                Last Updated:{" "}
                {rates.lastUpdated
                  ? new Date(rates.lastUpdated).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—"}
              </span>
            </motion.div>

            {/* Historical Comparison Table */}
            {rates.gold && (
              <motion.div
                variants={fadeUp}
                className="glass border border-luxury-gold/10 rounded-sm overflow-hidden mb-16"
              >
                <div className="px-8 py-5 border-b border-luxury-gold/10">
                  <h3 className="text-sm font-serif text-luxury-white tracking-wide">
                    Rate Summary — {city}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] text-gray-500 uppercase tracking-[0.2em] border-b border-luxury-gold/5">
                        <th className="text-left px-8 py-4 font-medium">
                          Metal
                        </th>
                        <th className="text-right px-8 py-4 font-medium">
                          Per Gram
                        </th>
                        <th className="text-right px-8 py-4 font-medium">
                          Per 10g
                        </th>
                        <th className="text-right px-8 py-4 font-medium">
                          Per 100g
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          label: "Gold 24K",
                          perGram: rates.gold["24k"],
                        },
                        {
                          label: "Gold 22K",
                          perGram: rates.gold["22k"],
                        },
                        { label: "Silver", perGram: rates.silver },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-luxury-gold/5 hover:bg-luxury-gold/[0.02] transition-colors"
                        >
                          <td className="px-8 py-5 font-serif text-luxury-white">
                            {row.label}
                          </td>
                          <td className="px-8 py-5 text-right text-gray-300 font-medium">
                            {row.perGram ? formatPrice(row.perGram) : "—"}
                          </td>
                          <td className="px-8 py-5 text-right text-gray-400">
                            {row.perGram ? formatPrice(row.perGram * 10) : "—"}
                          </td>
                          <td className="px-8 py-5 text-right text-gray-400">
                            {row.perGram ? formatPrice(row.perGram * 100) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Trend Graph (Decorative) */}
            <motion.div
              variants={fadeUp}
              className="w-full glass border border-luxury-gold/10 rounded-sm p-8 mb-16 relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-serif text-luxury-white">
                  Market Trend
                </h3>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">
                  7 Day Indicator
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-luxury-gold/5 to-transparent pointer-events-none rounded-b-sm"></div>
              <svg
                viewBox="0 0 1000 200"
                className="w-full h-32 md:h-48 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
              >
                <defs>
                  <linearGradient
                    id="goldLine"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.1" />
                    <stop offset="50%" stopColor="#d4af37" stopOpacity="1" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient
                    id="goldFill"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#d4af37" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,150 C100,155 200,130 300,120 C400,110 450,90 500,95 C550,100 600,80 700,70 C800,60 900,45 1000,40"
                  fill="none"
                  stroke="url(#goldLine)"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <path
                  d="M0,150 C100,155 200,130 300,120 C400,110 450,90 500,95 C550,100 600,80 700,70 C800,60 900,45 1000,40 L1000,200 L0,200 Z"
                  fill="url(#goldFill)"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest mt-4">
                <span>7 Days Ago</span>
                <span>Today</span>
              </div>
            </motion.div>
          </>
        )}

        {/* Info & CTA Section */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center space-x-2 text-gray-500 text-xs tracking-wider mb-12">
          </div>

          <Link
            to="/shop"
            className="group relative inline-flex items-center justify-center overflow-hidden border border-luxury-gold/50 bg-luxury-black/40 backdrop-blur-md px-12 py-5 text-xs tracking-[0.2em] font-medium uppercase transition-all duration-500 hover:bg-luxury-gold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
          >
            <span className="relative z-10 group-hover:text-luxury-black transition-colors duration-500 flex items-center space-x-3">
              <span>Explore Jewelry</span>
              <ArrowRight
                size={16}
                className="group-hover:translate-x-1 transition-transform"
              />
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Rates;
