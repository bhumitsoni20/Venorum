import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Sparkles, ArrowRight, Save, Loader2, Wand2,
  PenLine, CalendarDays, Type, Check, ChevronDown, ShoppingBag
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const OCCASIONS = ["Wedding", "Party", "Daily Wear", "Formal", "Anniversary", "Date Night", "Cocktail"];
const OUTFIT_COLORS = ["Black", "Red", "Blue", "White", "Green", "Pink", "Navy", "Gold", "Cream", "Maroon"];

const getPreviewGradient = (metalHex, gemColor) => {
  const mHex = metalHex || "#D4AF37";
  const gColor = gemColor || "#E8E8E8";
  return `radial-gradient(ellipse at 30% 30%, ${gColor}40, transparent 50%),
          radial-gradient(ellipse at 70% 60%, ${mHex}30, transparent 40%),
          linear-gradient(135deg, ${mHex}, ${mHex}88, ${mHex})`;
};

const Section = ({ children, id, className = "" }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    className={`py-20 md:py-28 ${className}`}
  >
    {children}
  </motion.section>
);

const SectionTitle = ({ number, title, subtitle }) => (
  <div className="mb-12 md:mb-16">
    <div className="flex items-center gap-3 mb-4">
      <span className="text-luxury-gold/40 text-xs tracking-[0.4em] uppercase font-mono">Step {number}</span>
      <div className="h-px flex-1 bg-gradient-to-r from-luxury-gold/20 to-transparent" />
    </div>
    <h2 className="text-3xl md:text-5xl font-serif text-luxury-white mb-3">{title}</h2>
    {subtitle && <p className="text-gray-500 text-sm md:text-base max-w-xl">{subtitle}</p>}
  </div>
);

const Customization = () => {
  // Dynamic Data States
  const [metals, setMetals] = useState([]);
  const [gems, setGems] = useState([]);
  const [shapes, setShapes] = useState([]);

  // Selection States (storing IDs to send to backend)
  const [metalId, setMetalId] = useState("");
  const [gemId, setGemId] = useState("");
  const [shapeId, setShapeId] = useState("");
  
  const [story, setStory] = useState({ message: "", date: "", initials: "" });
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [occasion, setOccasion] = useState("");
  const [outfitColor, setOutfitColor] = useState("");
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Preview properties
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef(null);
  const dragStart = useRef(0);

  // Derived properties from selections
  const currentMetal = metals.find(m => m._id === metalId);
  const currentGem = gems.find(g => g._id === gemId);
  const currentShape = shapes.find(s => s._id === shapeId);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Run seeds first explicitly
        await Promise.all([
          fetch(`${API_URL}/metals/seed`, { method: "POST" }),
          fetch(`${API_URL}/gems/seed`, { method: "POST" }),
          fetch(`${API_URL}/shapes/seed`, { method: "POST" }),
        ]);

        const [mRes, gRes, sRes] = await Promise.all([
          fetch(`${API_URL}/metals`),
          fetch(`${API_URL}/gems`),
          fetch(`${API_URL}/shapes`),
        ]);

        if (mRes.ok && gRes.ok && sRes.ok) {
          const mData = await mRes.json();
          const gData = await gRes.json();
          const sData = await sRes.json();

          setMetals(mData);
          setGems(gData);
          setShapes(sData);

          if (mData.length > 0) setMetalId(mData[0]._id);
          if (gData.length > 0) setGemId(gData[0]._id);
          if (sData.length > 0) setShapeId(sData[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch dynamic data:", err);
      }
    };
    fetchData();
  }, []);

  // Live Pricing
  const fetchPrice = useCallback(async () => {
    if (!metalId || !gemId || !currentShape) return;
    setPricingLoading(true);
    try {
      const res = await fetch(`${API_URL}/customize/price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          metalId, 
          gemId, 
          shapeName: currentShape.name, 
          weight: 5 // Default design weight 5g
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPricing(data.breakdown);
      }
    } catch (err) {
      console.error("Pricing error:", err);
    }
    setPricingLoading(false);
  }, [metalId, gemId, currentShape]);

  useEffect(() => {
    fetchPrice();
  }, [fetchPrice]);

  // Preview Drag
  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = e.clientX;
  };
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const delta = (e.clientX - dragStart.current) * 0.5;
    setRotation((prev) => prev + delta);
    dragStart.current = e.clientX;
  };
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (isDragging) return;
    const interval = setInterval(() => {
      setRotation((prev) => prev + 0.3);
    }, 30);
    return () => clearInterval(interval);
  }, [isDragging]);

  // AI Suggestion
  const handleAiSuggest = async () => {
    if (!occasion || !outfitColor) return;
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const res = await fetch(`${API_URL}/ai/style-suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, outfitColor }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestion(data.suggestion);
      }
    } catch (err) {
      console.error("AI suggestion error:", err);
    }
    setAiLoading(false);
  };

  const applyAiSuggestion = () => {
    if (!aiSuggestion) return;
    
    // Find closest matching IDs from fetched data
    const mMatch = metals.find(m => m.name.toLowerCase().includes(aiSuggestion.metal.toLowerCase()) || aiSuggestion.metal.toLowerCase().includes(m.name.toLowerCase()));
    if (mMatch) setMetalId(mMatch._id);

    const gMatch = gems.find(g => g.name.toLowerCase().includes(aiSuggestion.gem.toLowerCase()));
    if (gMatch) setGemId(gMatch._id);

    const sMatch = shapes.find(s => s.name.toLowerCase().includes(aiSuggestion.shape.toLowerCase()));
    if (sMatch) setShapeId(sMatch._id);
  };

  // Add to wishlist
  const handleSave = async () => {
    const token = localStorage.getItem("venorum_auth_token");
    if (!token) {
      alert("Please log in to save your design.");
      return;
    }
    setSaving(true);
    try {
      // Save to customizations DB
      const res = await fetch(`${API_URL}/customize/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          metal: currentMetal?.name,
          gem: currentGem?.name,
          shape: currentShape?.name,
          story,
          price: pricing,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
    setSaving(false);
  };
  
  // Add to cart
  const handleAddToCart = async () => {
    const token = localStorage.getItem("venorum_auth_token");
    if (!token) {
       alert("Please log in to add to cart.");
       return;
    }
    setAddingToCart(true);
    try {
        const payload = {
            productId: null, 
            quantity: 1,
            isCustom: true,
            customDetails: {
                metal: currentMetal?.name,
                gem: currentGem?.name,
                shape: currentShape?.name,
                story,
                calculatedPrice: pricing?.total || 0,
                metalRate: currentMetal?.pricePerGram
            }
        };
        const res = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        if(res.ok) {
            alert("Added to cart successfully!");
        } else {
           alert("Failed to add to cart.");
        }
    } catch(err) {
        console.error("Cart error:", err);
    }
    setAddingToCart(false);
  };

  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0.3]);

  if (metals.length === 0 || gems.length === 0 || shapes.length === 0) {
    return (
      <div className="min-h-screen bg-luxury-black flex items-center justify-center">
         <Loader2 className="animate-spin text-luxury-gold" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-black">
      {/* ═══════ HERO ═══════ */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: getPreviewGradient(currentMetal?.hex, currentGem?.color),
              transition: "background 1s ease",
            }}
          />
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-luxury-gold/20 rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
              animate={{ y: [0, -30, 0], opacity: [0.1, 0.5, 0.1] }}
              transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }}>
            <p className="text-luxury-gold/60 text-xs tracking-[0.5em] uppercase mb-6">Bespoke Jewelry Atelier</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-luxury-white mb-6 leading-[1.1]">
              Design Your<br /><span className="gold-gradient-text">Masterpiece</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Craft a one-of-a-kind piece that reflects your unique story. Every detail, dynamically generated for you.
            </p>
            <motion.a
              href="#metal"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 bg-luxury-gold text-luxury-black px-8 py-4 uppercase text-xs tracking-[0.3em] font-semibold hover:bg-luxury-white transition-colors duration-500"
            >
              Begin Crafting <ArrowRight size={16} />
            </motion.a>
          </motion.div>
        </div>

        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <ChevronDown className="text-luxury-gold/40" size={24} />
        </motion.div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-6">
        {/* ═══════ SECTION 1: CHOOSE METAL ═══════ */}
        <Section id="metal">
          <SectionTitle number="01" title="Select Your Metal" subtitle="Driven by live market rates. Hand-forged to perfection." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {metals.map((m) => (
              <motion.button
                key={m._id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setMetalId(m._id)}
                className={`relative p-8 rounded-sm border transition-all duration-500 text-left group overflow-hidden ${
                  metalId === m._id
                    ? "border-luxury-gold/60 bg-luxury-gold/[0.06] shadow-[0_0_40px_rgba(212,175,55,0.1)]"
                    : "border-gray-800 bg-luxury-gray/30 hover:border-gray-600"
                }`}
              >
                {metalId === m._id && (
                  <motion.div layoutId="metalActive" className="absolute top-4 right-4">
                    <Check size={18} className="text-luxury-gold" />
                  </motion.div>
                )}

                <div
                  className="w-16 h-16 rounded-full mb-6 relative"
                  style={{
                    background: `radial-gradient(circle at 35% 35%, ${m.hex}ee, ${m.hex}88, ${m.hex}44)`,
                    boxShadow: metalId === m._id ? `0 0 30px ${m.hex}40` : "none",
                  }}
                >
                  <span className="absolute inset-0 flex items-center justify-center text-2xl">{m.icon}</span>
                </div>

                <h3 className={`text-lg font-serif mb-1 transition-colors ${
                  metalId === m._id ? "text-luxury-gold" : "text-luxury-white"
                }`}>
                  {m.name}
                </h3>
                <p className="text-xs text-gray-500 tracking-widest">{m.priceHint}</p>
              </motion.button>
            ))}
          </div>
        </Section>

        {/* ═══════ SECTION 2: CHOOSE GEMSTONE ═══════ */}
        <Section id="gemstone">
          <SectionTitle number="02" title="Choose Your Gemstone" subtitle="Sourced entirely from our dynamic catalog." />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {gems.map((g) => (
              <motion.button
                key={g._id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGemId(g._id)}
                className={`relative p-6 rounded-sm border text-center transition-all duration-500 group ${
                  gemId === g._id
                    ? "border-luxury-gold/50 bg-luxury-gold/[0.04]"
                    : "border-gray-800 bg-luxury-gray/20 hover:border-gray-600"
                }`}
              >
                <div className="relative mx-auto mb-4 w-14 h-14 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `radial-gradient(circle, ${g.color}40, transparent 70%)` }}
                  />
                  <motion.div
                    animate={gemId === g._id ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className="w-10 h-10 rounded-full relative"
                    style={{
                      background: `radial-gradient(circle at 30% 30%, ${g.color}ff, ${g.color}88)`,
                      boxShadow: gemId === g._id ? `0 0 25px ${g.color}60, 0 0 50px ${g.color}20` : "none",
                    }}
                  />
                </div>
                <p className={`text-xs font-medium tracking-wider uppercase transition-colors ${
                  gemId === g._id ? "text-luxury-gold" : "text-gray-400"
                }`}>
                  {g.name}
                </p>
                {gemId === g._id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-2 right-2">
                    <Check size={14} className="text-luxury-gold" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          {currentGem?.description && (
            <motion.p key={gemId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-gray-500 text-sm italic max-w-lg">
              "{currentGem.description}"
            </motion.p>
          )}
        </Section>

        {/* ═══════ SECTION 3: SELECT SHAPE ═══════ */}
        <Section id="shape">
          <SectionTitle number="03" title="Select the Cut" subtitle="Custom forms shaping the brilliance of your piece." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {shapes.map((s) => (
              <motion.button
                key={s._id}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShapeId(s._id)}
                className={`p-8 rounded-sm border text-center transition-all duration-500 relative overflow-hidden ${
                  shapeId === s._id
                    ? "border-luxury-gold/50 bg-luxury-gold/[0.06]"
                    : "border-gray-800 bg-luxury-gray/20 hover:border-gray-600"
                }`}
              >
                <motion.span
                  className="block text-4xl mb-4"
                  style={{ color: shapeId === s._id ? currentGem?.color : "#666" }}
                  animate={shapeId === s._id ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {s.icon}
                </motion.span>
                <p className={`text-xs tracking-[0.2em] uppercase ${
                  shapeId === s._id ? "text-luxury-gold" : "text-gray-500"
                }`}>
                  {s.name}
                </p>
                {shapeId === s._id && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-3 right-3">
                    <Check size={14} className="text-luxury-gold" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </Section>

        {/* ═══════ SECTION 4: LIVE 3D/360 PREVIEW ═══════ */}
        <Section id="preview">
          <SectionTitle number="04" title="Live Preview" subtitle="Drag to rotate. Watch your creation come alive in real-time." />
          <div
            ref={previewRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="relative w-full aspect-square max-w-lg mx-auto cursor-grab active:cursor-grabbing select-none"
          >
            <div
              className="absolute inset-4 rounded-full opacity-20"
              style={{
                background: `conic-gradient(from ${rotation}deg, ${currentGem?.color}00, ${currentGem?.color}40, ${currentGem?.color}00, ${currentMetal?.hex || '#D4AF37'}40, ${currentGem?.color}00)`,
                transition: "background 0.5s ease",
              }}
            />
            <motion.div
              className="absolute inset-10 rounded-full flex items-center justify-center overflow-hidden border border-luxury-gold/10"
              style={{ background: getPreviewGradient(currentMetal?.hex, currentGem?.color), transform: `rotate(${rotation}deg)` }}
            >
              <motion.div
                className="w-24 h-24 md:w-32 md:h-32 rounded-full relative"
                style={{
                  background: `radial-gradient(circle at 35% 35%, white, ${currentGem?.color}ee, ${currentGem?.color}88)`,
                  boxShadow: `0 0 60px ${currentGem?.color}50, 0 0 120px ${currentGem?.color}20, inset 0 0 30px ${currentGem?.color}30`,
                  transform: `rotate(${-rotation}deg)`,
                }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-white/60 rounded-full"
                    style={{
                      top: `${20 + Math.random() * 60}%`, left: `${20 + Math.random() * 60}%`,
                      animation: `pulse ${1.5 + Math.random()}s ease-in-out infinite ${Math.random()}s`,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 text-center">
              <motion.div key={`${metalId}-${gemId}-${shapeId}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-luxury-gold font-serif text-lg">{currentMetal?.name} × {currentGem?.name}</p>
                <p className="text-gray-500 text-xs tracking-[0.2em] uppercase">{currentShape?.name} Cut</p>
              </motion.div>
            </div>
          </div>
          <p className="text-center text-gray-600 text-xs mt-4 tracking-widest uppercase">↔ Drag to explore</p>
        </Section>

        {/* ═══════ SECTION 5: BUILD YOUR STORY ═══════ */}
        <Section id="story">
          <SectionTitle number="05" title="Build Your Story" subtitle="Every masterpiece deserves a narrative. Engrave your soul into it." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-[0.2em]">
                <PenLine size={14} className="text-luxury-gold/60" /> Engraving
              </label>
              <input
                type="text" maxLength={40} value={story.message}
                onChange={(e) => setStory({ ...story, message: e.target.value })}
                placeholder="Forever yours…"
                className="w-full bg-transparent border border-gray-800 focus:border-luxury-gold/40 px-4 py-3 text-sm text-luxury-white placeholder:text-gray-700 focus:outline-none transition-colors rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-[0.2em]">
                <CalendarDays size={14} className="text-luxury-gold/60" /> Special Date
              </label>
              <input
                type="date" value={story.date}
                onChange={(e) => setStory({ ...story, date: e.target.value })}
                className="w-full bg-transparent border border-gray-800 focus:border-luxury-gold/40 px-4 py-3 text-sm text-luxury-white focus:outline-none transition-colors rounded-sm [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-[0.2em]">
                <Type size={14} className="text-luxury-gold/60" /> Initials
              </label>
              <input
                type="text" maxLength={4} value={story.initials}
                onChange={(e) => setStory({ ...story, initials: e.target.value.toUpperCase() })}
                placeholder="A & B"
                className="w-full bg-transparent border border-gray-800 focus:border-luxury-gold/40 px-4 py-3 text-sm text-luxury-white placeholder:text-gray-700 focus:outline-none transition-colors rounded-sm"
              />
            </div>
          </div>
          <AnimatePresence mode="wait">
            {(story.message || story.date || story.initials) && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass border border-luxury-gold/10 p-8 rounded-sm max-w-2xl mx-auto text-center">
                <Sparkles size={20} className="text-luxury-gold/40 mx-auto mb-4" />
                <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mb-3">This piece tells your story</p>
                <p className="font-serif text-luxury-white text-lg md:text-xl italic leading-relaxed">
                  {story.message && <span>"{story.message}"</span>}
                  {story.initials && <span className="text-luxury-gold"> — {story.initials}</span>}
                </p>
                {story.date && <p className="text-gray-500 text-xs mt-3 tracking-widest">{new Date(story.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ═══════ SECTION 6: AI STYLE MATCH ═══════ */}
        <Section id="ai-style">
          <SectionTitle number="06" title="AI Style Match" subtitle="Let our intelligence curate the perfect combination for your occasion." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <label className="text-xs text-gray-500 uppercase tracking-[0.2em]">Occasion</label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button
                    key={o} onClick={() => setOccasion(o)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider border rounded-sm transition-all duration-300 ${occasion === o ? "border-luxury-gold/50 text-luxury-gold bg-luxury-gold/[0.06]" : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs text-gray-500 uppercase tracking-[0.2em]">Outfit Color</label>
              <div className="flex flex-wrap gap-2">
                {OUTFIT_COLORS.map((c) => (
                  <button
                    key={c} onClick={() => setOutfitColor(c)}
                    className={`px-4 py-2 text-xs uppercase tracking-wider border rounded-sm transition-all duration-300 ${outfitColor === c ? "border-luxury-gold/50 text-luxury-gold bg-luxury-gold/[0.06]" : "border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAiSuggest} disabled={!occasion || !outfitColor || aiLoading}
            className={`flex items-center gap-3 px-8 py-4 uppercase text-xs tracking-[0.3em] font-semibold transition-all duration-500 ${occasion && outfitColor ? "bg-gradient-to-r from-luxury-gold to-[#F1D570] text-luxury-black hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {aiLoading ? "Analyzing..." : "Suggest Style"}
          </motion.button>
          
          <AnimatePresence>
            {aiSuggestion && (
              <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-8 border border-luxury-gold/20 rounded-sm overflow-hidden">
                <div className="bg-gradient-to-r from-luxury-gold/[0.06] to-transparent p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-luxury-gold" />
                    <span className="text-luxury-gold text-xs tracking-[0.3em] uppercase">AI Recommendation</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6 mb-6">
                    <div>
                      <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mb-1">Metal</p>
                      <p className="text-luxury-white font-serif text-lg">{aiSuggestion.metal}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mb-1">Gemstone</p>
                      <p className="text-luxury-white font-serif text-lg">{aiSuggestion.gem}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase mb-1">Shape</p>
                      <p className="text-luxury-white font-serif text-lg">{aiSuggestion.shape}</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm italic mb-2">"{aiSuggestion.reasoning}"</p>
                  <p className="text-luxury-gold/60 text-xs">💡 {aiSuggestion.styleNote}</p>
                  <motion.button onClick={applyAiSuggestion} className="mt-6 flex items-center gap-2 bg-luxury-gold text-luxury-black px-6 py-3 text-xs uppercase tracking-[0.2em] font-semibold hover:bg-luxury-white transition-colors">
                    <Check size={14} /> Apply This Style
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        {/* ═══════ SECTION 7: LIVE PRICING ═══════ */}
        <Section id="pricing">
          <SectionTitle number="07" title="Price Breakdown" subtitle="Transparent luxury powered by live rates. No hidden charges." />
          <div className="max-w-lg mx-auto">
            <div className="border border-luxury-gold/20 rounded-sm overflow-hidden">
              <div className="bg-gradient-to-r from-luxury-gold/10 to-transparent px-8 py-5 border-b border-luxury-gold/10">
                <p className="text-luxury-gold text-xs tracking-[0.3em] uppercase">Your Configuration</p>
                <p className="text-luxury-white font-serif mt-1">{currentMetal?.name} • {currentGem?.name} • {currentShape?.name}</p>
              </div>
              <div className="px-8 py-6 space-y-4">
                {pricingLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="animate-spin text-luxury-gold" size={24} /></div>
                ) : pricing ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Metal (5g)</span>
                      <span className="text-luxury-white font-mono">₹{pricing.metalPrice?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Gemstone ({currentGem?.name})</span>
                      <span className="text-luxury-white font-mono">₹{pricing.gemPrice?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Making Charges</span>
                      <span className="text-luxury-white font-mono">₹{pricing.makingCharges?.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="h-px bg-luxury-gold/20 my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-luxury-gold font-serif text-lg">Total</span>
                      <motion.span key={pricing.total} initial={{ scale: 1.2, color: "#F1D570" }} animate={{ scale: 1, color: "#D4AF37" }} className="text-luxury-gold font-serif text-2xl">
                        ₹{pricing.total?.toLocaleString("en-IN")}
                      </motion.span>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600 text-center py-4">Calculating...</p>
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════ SECTION 8: FINAL SUMMARY ═══════ */}
        <Section id="final">
          <SectionTitle number="08" title="Your Masterpiece" subtitle="Review your design and make it yours." />
          <div className="max-w-2xl mx-auto border border-luxury-gold/20 rounded-sm overflow-hidden mb-10">
            <div className="h-48 relative overflow-hidden" style={{ background: getPreviewGradient(currentMetal?.hex, currentGem?.color) }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-20 h-20 rounded-full"
                  style={{ background: `radial-gradient(circle at 35% 35%, white, ${currentGem?.color}ee, ${currentGem?.color}88)`, boxShadow: `0 0 50px ${currentGem?.color}40` }}
                  animate={{ rotate: 360, scale: [1, 1.05, 1] }}
                  transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
                />
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-white/60 uppercase tracking-wider">
                <span>{currentMetal?.name}</span>
                <span>{currentGem?.name}</span>
                <span>{currentShape?.name} Cut</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="font-serif text-2xl text-luxury-white mb-2">Custom {currentShape?.name} {currentGem?.name} in {currentMetal?.name}</h3>
              {story.message && <p className="text-gray-500 text-sm italic mb-1">Engraved: "{story.message}"</p>}
              {story.initials && <p className="text-gray-500 text-sm">Initials: {story.initials}</p>}
              {pricing && <p className="text-luxury-gold font-serif text-xl mt-4">₹{pricing.total?.toLocaleString("en-IN")}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleAddToCart} disabled={addingToCart}
              className="flex items-center justify-center gap-3 bg-luxury-gold text-luxury-black px-10 py-4 uppercase text-xs tracking-[0.3em] font-semibold hover:bg-luxury-white transition-colors duration-500 shadow-[0_0_30px_rgba(212,175,55,0.15)]"
            >
              {addingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />} 
              {addingToCart ? "Adding..." : "Add to Cart"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
              className="flex items-center justify-center gap-3 border border-luxury-gold/40 text-luxury-gold px-10 py-4 uppercase text-xs tracking-[0.3em] font-semibold hover:bg-luxury-gold hover:text-luxury-black transition-colors duration-500"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <Check size={16} /> : <Save size={16} />}
              {saving ? "Saving…" : saved ? "Design Saved!" : "Save to Wishlist"}
            </motion.button>
          </div>
        </Section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
};

export default Customization;
