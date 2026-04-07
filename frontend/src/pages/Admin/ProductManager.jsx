import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Image as ImageIcon, Video, Cuboid, Save, Tag, SlidersHorizontal, Trash2, Package } from "lucide-react";

// The API Base URLs
const API_URL = "http://localhost:5000/api"; // Default MERN stack port
// Ensure cross-origin sharing is configured if not proxied

const ProductManager = () => {
  const categories = ["Women's", "Men's", "Kids"];
  const [activeCategory, setActiveCategory] = useState("Women's");
  
  const [categoriesData, setCategoriesData] = useState([]);
  const [activeSubcategoryId, setActiveSubcategoryId] = useState(null);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [isAddingSub, setIsAddingSub] = useState(false);

  // Form State
  const initialForm = {
    name: "",
    description: "",
    pricingBreakdown: [{ id: Date.now(), label: "Base Metal Configuration", value: "" }],
    images: [],
    video: "",
    arModelUrl: "",
    gems: []
  };
  const [productForm, setProductForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "alert",
    title: "",
    message: "",
    onConfirm: null
  });

  const availableGems = ["Diamond (VS1)", "Emerald", "Ruby", "Sapphire", "Black Onyx", "Pearl"];

  // Fetch Categories on Mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        if(res.ok) {
          const data = await res.json();
          setCategoriesData(data);
        }
      } catch(err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Filter rendering list based on active category tab
  const activeSubcategories = categoriesData.filter(c => c.mainCategory === activeCategory);

  useEffect(() => {
    // Reset active subcategory when category changes
    if (activeSubcategories.length > 0) {
      setActiveSubcategoryId(activeSubcategories[0]._id);
    } else {
      setActiveSubcategoryId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, categoriesData.length]);

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim()) {
      setModalConfig({ isOpen: true, type: "alert", title: "Validation Error", message: "Subcategory name is required to create a new collection." });
      return;
    }
    try {
      const payload = {
        name: newSubcategoryName.trim(),
        mainCategory: activeCategory,
        slug: newSubcategoryName.trim().toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      };
      // Temporary mock authentication headers -> Admin panel should map actual tokens
      const res = await fetch(`${API_URL}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer MOCK_TOKEN` },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
        const newCat = await res.json();
        setCategoriesData([...categoriesData, newCat]);
        setNewSubcategoryName("");
        setIsAddingSub(false);
      } else {
        const err = await res.json();
        setModalConfig({ isOpen: true, type: "alert", title: "Creation Failed", message: err.message || "Failed to add category." });
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleRemoveSubcategory = (e, subToRemove) => {
    e.stopPropagation();
    setModalConfig({
        isOpen: true,
        type: "confirm",
        title: "Remove Collection",
        message: `Are you sure you want to permanently remove the "${subToRemove.name}" collection? All related products will be archived and this action cannot be undone.`,
        onConfirm: async () => {
             try {
                const res = await fetch(`${API_URL}/categories/${subToRemove._id}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer MOCK_TOKEN` }
                });
                if(res.ok) {
                    setCategoriesData(prev => prev.filter(s => s._id !== subToRemove._id));
                    if (activeSubcategoryId === subToRemove._id) {
                        setActiveSubcategoryId(null);
                    }
                }
             } catch(err) {
                 console.error(err);
             }
        }
    });
  };

  const toggleGem = (gem) => {
    setProductForm(prev => ({
      ...prev,
      gems: prev.gems.includes(gem) 
        ? prev.gems.filter(g => g !== gem)
        : [...prev.gems, gem]
    }));
  };

  const addPriceComponent = () => {
    setProductForm(prev => ({
      ...prev,
      pricingBreakdown: [...prev.pricingBreakdown, { id: Date.now(), label: "", value: "" }]
    }));
  };

  const updatePriceComponent = (id, field, value) => {
    setProductForm(prev => ({
      ...prev,
      pricingBreakdown: prev.pricingBreakdown.map(comp => 
        comp.id === id ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const removePriceComponent = (id) => {
    setProductForm(prev => ({
      ...prev,
      pricingBreakdown: prev.pricingBreakdown.filter(comp => comp.id !== id)
    }));
  };
  
  const calculateTotal = () => {
    return productForm.pricingBreakdown.reduce((total, comp) => {
      const val = parseFloat(comp.value);
      return total + (isNaN(val) ? 0 : val);
    }, 0);
  };

  const handleSaveProduct = async () => {
    if (!productForm.name.trim() || !productForm.description.trim() || productForm.pricingBreakdown.length === 0) {
      setModalConfig({ isOpen: true, type: "alert", title: "Missing Requirements", message: "Masterpiece Name, Description, and at least one Pricing Component are required." });
      return;
    }
    
    setSaving(true);
    const payload = {
      category: activeSubcategoryId, // ObjectId of category
      name: productForm.name,
      description: productForm.description,
      price: calculateTotal(),
      pricingBreakdown: productForm.pricingBreakdown,
      images: productForm.images.length > 0 ? productForm.images : [productForm.imagesString || ""], // Simple array conversion
      video: productForm.video,
      arModelUrl: productForm.arModelUrl,
      gems: productForm.gems
    };
    
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer MOCK_TOKEN` },
        body: JSON.stringify(payload)
      });
      if(res.ok) {
         setProductForm(initialForm);
         const catName = categoriesData.find(c => c._id === activeSubcategoryId)?.name;
         setModalConfig({ isOpen: true, type: "success", title: "Masterpiece Minted", message: `Product successfully fully crafted and stored in ${activeCategory} > ${catName}.` });
      } else {
         const err = await res.json();
         setModalConfig({ isOpen: true, type: "alert", title: "Minting Failed", message: err.message || "Failed to save product." });
      }
    } catch(err) {
      console.error(err);
    }
    setSaving(false);
  };

  const activeSubcategoryObj = categoriesData.find(c => c._id === activeSubcategoryId);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif text-luxury-white mb-2">Catalog Manager</h1>
        <p className="text-gray-400 text-sm tracking-widest uppercase mb-8">Orchestrate the Venorum Collection</p>
        
        {/* Top Category Tabs */}
        <div className="flex border-b border-luxury-gold/20 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-4 text-xs font-sans uppercase tracking-[0.2em] font-semibold transition-all whitespace-nowrap ${
                activeCategory === cat 
                ? "text-luxury-gold border-b-2 border-luxury-gold" 
                : "text-gray-500 hover:text-luxury-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Left Sidebar: Subcategories */}
        <div className="w-full lg:w-64 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-luxury-white font-serif text-lg flex items-center gap-2"><Tag size={16} className="text-luxury-gold"/> Collections</h3>
            <button onClick={() => setIsAddingSub(!isAddingSub)} className="text-luxury-gold hover:text-white transition-colors p-1 bg-luxury-gold/10 rounded-full">
              <Plus size={16} />
            </button>
          </div>

          <AnimatePresence>
            {isAddingSub && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex gap-2 mb-2 overflow-hidden">
                <input 
                  type="text" 
                  value={newSubcategoryName}
                  onChange={(e) => setNewSubcategoryName(e.target.value)}
                  placeholder="New subcategory..." 
                  className="w-full bg-luxury-gray text-white text-xs border border-luxury-gold/30 rounded-sm px-3 py-2 outline-none focus:border-luxury-gold"
                />
                <button onClick={handleAddSubcategory} className="bg-luxury-gold text-luxury-black px-3 py-2 text-xs font-bold rounded-sm">Add</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            {activeSubcategories.map(sub => (
              <div
                key={sub._id}
                onClick={() => setActiveSubcategoryId(sub._id)}
                className={`flex items-center justify-between text-left px-4 py-3 text-sm rounded-sm transition-all border group cursor-pointer ${
                  activeSubcategoryId === sub._id 
                  ? "bg-luxury-charcoal/50 border-luxury-gold/50 text-luxury-white shadow-[0_0_10px_rgba(212,175,55,0.1)]" 
                  : "border-transparent text-gray-400 hover:bg-luxury-gray hover:text-white"
                }`}
              >
                <span>{sub.name}</span>
                <button 
                  onClick={(e) => handleRemoveSubcategory(e, sub)}
                  className={`p-1 rounded-sm transition-all ${activeSubcategoryId === sub._id ? 'text-luxury-gold hover:text-red-500' : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500'}`}
                  title="Remove Subcategory"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {activeSubcategories.length === 0 && (
              <p className="text-xs text-gray-500 italic px-4">No collections found.</p>
            )}
          </div>
        </div>

        {/* Right Content: Add Product Form */}
        <div className="flex-1 glass border border-luxury-gold/20 rounded-sm p-6 lg:p-10 shadow-2xl overflow-y-auto">
          {activeSubcategoryObj ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={activeSubcategoryId}>
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-luxury-gold/10">
                <h2 className="text-2xl font-serif text-luxury-white">
                  Craft Product in <span className="text-luxury-gold italic">{activeSubcategoryObj.name}</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Basic Details */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gold mb-2">Masterpiece Name</label>
                    <input 
                      type="text" 
                      value={productForm.name}
                      onChange={e => setProductForm({...productForm, name: e.target.value})}
                      className="w-full bg-luxury-black border border-luxury-gold/20 focus:border-luxury-gold rounded-sm px-4 py-3 text-white outline-none transition-colors"
                      placeholder="e.g. Imperial Eternity Band"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-luxury-gold mb-2">Description</label>
                    <textarea 
                      rows="4"
                      value={productForm.description}
                      onChange={e => setProductForm({...productForm, description: e.target.value})}
                      className="w-full bg-luxury-black border border-luxury-gold/20 focus:border-luxury-gold rounded-sm px-4 py-3 text-white outline-none transition-colors resize-none"
                      placeholder="Provide the legacy and narrative of this piece..."
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-3 border-b border-luxury-gold/10 pb-2">
                       <label className="block text-[10px] uppercase tracking-widest text-luxury-gold">Dynamic Pricing Breakdown</label>
                       <button onClick={addPriceComponent} className="text-luxury-gold hover:text-luxury-black hover:bg-luxury-gold transition-colors p-1 bg-luxury-gold/10 rounded-sm">
                         <Plus size={12} />
                       </button>
                    </div>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {productForm.pricingBreakdown.map((comp) => (
                          <motion.div 
                            key={comp.id} 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex gap-2"
                          >
                             <div className="flex-1 bg-luxury-black border border-luxury-gold/20 focus-within:border-luxury-gold rounded-sm flex">
                                <input 
                                  type="text" 
                                  value={comp.label}
                                  onChange={e => updatePriceComponent(comp.id, "label", e.target.value)}
                                  className="w-[55%] bg-transparent px-3 py-2 text-xs text-white outline-none border-r border-luxury-gold/20 placeholder-gray-600"
                                  placeholder="Fee Category (e.g. Making Charges)"
                                />
                                <div className="relative w-[45%] flex items-center">
                                  <span className="absolute left-3 text-[10px] text-gray-500 tracking-widest">₹</span>
                                  <input 
                                    type="number" 
                                    value={comp.value}
                                    onChange={e => updatePriceComponent(comp.id, "value", e.target.value)}
                                    className="w-full bg-transparent pl-8 pr-3 py-2 text-xs text-white outline-none placeholder-gray-600"
                                    placeholder="0.00"
                                  />
                                </div>
                             </div>
                             {productForm.pricingBreakdown.length > 1 && (
                               <button 
                                 onClick={() => removePriceComponent(comp.id)} 
                                 className="px-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/20 rounded-sm"
                               >
                                 <Trash2 size={14} />
                               </button>
                             )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="mt-4 pt-4 border-t border-luxury-gold/30 flex justify-between items-center">
                      <span className="text-gray-400 uppercase tracking-widest text-[10px]">Net Valuation</span>
                      <span className="text-luxury-gold font-serif text-xl tracking-wider">₹{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                {/* Media & Customizations */}
                <div className="space-y-8">
                  {/* Media Uploads */}
                  <div>
                     <h3 className="text-[10px] uppercase tracking-widest text-luxury-gold mb-4 flex items-center gap-2 border-b border-luxury-gold/10 pb-2"><ImageIcon size={14}/> Media Gallery</h3>
                     <div className="space-y-3">
                        <div className="flex gap-2">
                           <input 
                              type="text" 
                              placeholder="Image URL 1" 
                              value={productForm.imagesString || ""} 
                              onChange={e => setProductForm({...productForm, imagesString: e.target.value})}
                              className="flex-1 bg-luxury-black border border-gray-800 focus:border-luxury-gold/50 rounded-sm px-3 py-2 text-xs text-white outline-none" 
                           />
                           <button className="bg-luxury-gray hover:bg-luxury-gold/20 border border-gray-600 text-gray-300 px-3 py-2 rounded-sm transition-colors"><Plus size={14}/></button>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1 bg-luxury-black border border-gray-800 rounded-sm px-3 py-2 text-xs text-gray-500 flex items-center gap-2">
                              <Video size={14} className="text-gray-600"/> 
                              <input 
                                type="text" 
                                placeholder="Cinematic Video URL (.mp4)" 
                                value={productForm.video}
                                onChange={e => setProductForm({...productForm, video: e.target.value})}
                                className="bg-transparent outline-none w-full text-white"
                              />
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <div className="flex-1 bg-luxury-black border border-luxury-gold/20 focus-within:border-luxury-gold rounded-sm px-3 py-2 text-xs text-luxury-gold flex items-center gap-2">
                              <Cuboid size={14} /> 
                              <input 
                                type="text" 
                                placeholder="360° AR Model URL (.glb / .gltf)" 
                                value={productForm.arModelUrl}
                                onChange={e => setProductForm({...productForm, arModelUrl: e.target.value})}
                                className="bg-transparent outline-none w-full text-white placeholder-luxury-gold/50"
                              />
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Gem Customization */}
                  <div>
                    <h3 className="text-[10px] uppercase tracking-widest text-luxury-gold mb-4 flex items-center gap-2 border-b border-luxury-gold/10 pb-2"><SlidersHorizontal size={14}/> Gem Configurations</h3>
                    <p className="text-xs text-gray-400 mb-3 font-light">Select which gems patrons can apply to personalize this piece.</p>
                    <div className="flex flex-wrap gap-2">
                      {availableGems.map(gem => {
                        const isSelected = productForm.gems.includes(gem);
                        return (
                          <button
                            key={gem}
                            onClick={(e) => { e.preventDefault(); toggleGem(gem); }}
                            className={`px-4 py-2 text-[10px] uppercase tracking-wider rounded-full border transition-all duration-300 ${
                              isSelected 
                              ? "bg-luxury-gold text-luxury-black border-luxury-gold font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]" 
                              : "bg-luxury-black border-gray-700 text-gray-400 hover:border-luxury-gold/50 hover:text-luxury-white"
                            }`}
                          >
                            {gem}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-12 pt-6 border-t border-luxury-gold/10 flex justify-end gap-4">
                <button className="px-6 py-3 text-xs uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Discard</button>
                <button 
                  onClick={handleSaveProduct}
                  disabled={saving}
                  className="flex items-center gap-2 bg-luxury-gold hover:bg-luxury-white text-luxury-black font-semibold px-8 py-3 text-xs uppercase tracking-widest rounded-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] disabled:opacity-50"
                >
                  {saving ? (
                    <span className="animate-pulse">Crafting...</span>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Mint & Publish</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
               <Package size={64} strokeWidth={1} className="text-luxury-gold mb-6"/>
               <h3 className="text-xl font-serif text-white mb-2">Select or Create a Collection</h3>
               <p className="text-sm text-gray-400">Choose a subcategory from the left panel to begin crafting products.</p>
             </div>
          )}
        </div>
      </div>

      {/* Venorum Modal System */}
      <AnimatePresence>
        {modalConfig.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-luxury-black/70 pointer-events-auto"
          >
            <motion.div
              initial={{ y: 50, scale: 0.95, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              exit={{ y: 20, scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass border border-luxury-gold/30 rounded-sm p-8 max-w-md w-full shadow-[0_0_50px_rgba(212,175,55,0.15)] flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-luxury-gold to-transparent opacity-50"></div>
              
              <h2 className="text-2xl font-serif text-luxury-white mb-4">{modalConfig.title}</h2>
              <p className="text-gray-400 font-light text-sm leading-relaxed mb-8">{modalConfig.message}</p>
              
              {modalConfig.type === "confirm" ? (
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                    className="flex-1 px-4 py-3 text-xs uppercase tracking-widest text-gray-400 border border-gray-600 hover:text-white hover:border-gray-400 rounded-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      if (modalConfig.onConfirm) modalConfig.onConfirm();
                      setModalConfig({ ...modalConfig, isOpen: false });
                    }}
                    className="flex-1 px-4 py-3 text-xs uppercase tracking-widest bg-red-900/20 text-red-500 border border-red-500/30 hover:bg-red-900/40 rounded-sm transition-colors shadow-[0_0_15px_rgba(220,38,38,0.1)] hover:shadow-[0_0_20px_rgba(220,38,38,0.2)]"
                  >
                    Confirm Drop
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
                  className="w-full bg-luxury-gold text-luxury-black font-semibold px-8 py-3 rounded-sm text-xs uppercase tracking-widest hover:bg-luxury-white transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                >
                  {modalConfig.type === "success" ? "Continue" : "Acknowledge"}
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductManager;
