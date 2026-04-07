import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, ChevronDown, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Rates = () => {
  const [city, setCity] = useState("Mumbai");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const cities = [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Dubai",
    "London",
    "New York",
  ];

  const rates = [
    {
      name: "24K Gold",
      weight: "10g",
      price: "₹74,500",
      trend: "up",
      change: "+0.4%",
    },
    {
      name: "22K Gold",
      weight: "10g",
      price: "₹68,200",
      trend: "up",
      change: "+0.3%",
    },
    {
      name: "Fine Silver",
      weight: "1kg",
      price: "₹85,200",
      trend: "down",
      change: "-0.1%",
    },
  ];

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 relative bg-luxury-black overflow-hidden"
    >
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
            Stay updated with real-time market prices, carefully curated to
            inform your next timeless acquisition.
          </p>
        </motion.div>

        {/* Location Dropdown */}
        <motion.div variants={fadeUp} className="flex justify-center mb-12">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 text-sm text-gray-400 hover:text-luxury-gold transition-colors py-2 px-6 border border-luxury-gold/20 rounded-full glass"
            >
              <MapPin size={14} className="text-luxury-gold" />
              <span>
                Rates based on <strong>{city}</strong>
              </span>
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute top-full mt-2 w-full glass border border-luxury-gold/20 rounded-lg shadow-2xl py-2 z-50">
                {cities.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCity(c);
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-6 py-2 text-sm text-gray-400 hover:text-luxury-gold hover:bg-luxury-gold/5 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Current Rates Cards */}
        <motion.div
          variants={fadeUp}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          {rates.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{
                y: -5,
                boxShadow: "0 20px 40px -10px rgba(212,175,55,0.15)",
              }}
              className="glass p-8 border border-luxury-gold/20 rounded-sm relative overflow-hidden group"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-luxury-gold/5 rounded-full blur-2xl group-hover:bg-luxury-gold/10 transition-colors duration-700"></div>

              <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                {item.weight}
              </p>
              <h3 className="text-xl font-serif text-white mb-6">
                {item.name}
              </h3>

              <div className="flex items-end justify-between">
                <p className="text-3xl font-serif text-luxury-gold">
                  {item.price}
                </p>
                <div
                  className={`flex items-center text-xs tracking-wider ${item.trend === "up" ? "text-green-500" : "text-red-500"}`}
                >
                  {item.trend === "up" ? "↑" : "↓"} {item.change}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="flex justify-between items-center text-xs text-gray-400 tracking-widest uppercase mb-6 px-2"
        >
          <span>Market Trend Tracker</span>
          <span>
            Last Updated: Today,{" "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </motion.div>

        {/* Mini Trend Section (Abstract SVG Graph mimicking luxury aesthetic) */}
        <motion.div
          variants={fadeUp}
          className="w-full glass border border-luxury-gold/10 rounded-sm p-8 mb-16 relative"
        >
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-luxury-gold/5 to-transparent pointer-events-none"></div>
          <svg
            viewBox="0 0 1000 200"
            className="w-full h-32 md:h-48 drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <defs>
              <linearGradient id="goldLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d4af37" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#d4af37" stopOpacity="1" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            {/* Elegant bezier curve to mock a 7-day steady trend */}
            <path
              d="M0,150 C200,160 300,90 500,110 C700,130 800,50 1000,40"
              fill="none"
              stroke="url(#goldLine)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
          <div className="flex justify-between text-[10px] text-gray-400 uppercase tracking-widest mt-4">
            <span>7 Days Ago</span>
            <span>Current</span>
          </div>
        </motion.div>

        {/* Info & CTA Section */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center text-center"
        >
          <div className="flex items-center space-x-2 text-gray-400 text-xs tracking-wider mb-12">
            <Info size={14} className="text-luxury-gold/50" />
            <p>
              Prices may vary slightly based on global market fluctuations and
              bespoke making charges.
            </p>
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
