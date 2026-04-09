import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, RefreshCw } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const Cart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCart = async () => {
    const token = localStorage.getItem("venorum_auth_token");
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/cart`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not fetch cart");
      const data = await res.json();
      // data.items will have [{product: {...}, quantity: N}]
      setItems(data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (productId, currentQ, delta) => {
    const newQ = currentQ + delta;
    if (newQ < 1) return;

    const token = localStorage.getItem("venorum_auth_token");
    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: newQ })
      });
      if (res.ok) {
        setItems(items.map(item => 
          item.product._id === productId ? { ...item, quantity: newQ } : item
        ));
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const removeItem = async (productId) => {
    const token = localStorage.getItem("venorum_auth_token");
    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(items.filter(item => item.product._id !== productId));
      }
    } catch (err) {
      console.error("Removal failed", err);
    }
  };

  const subtotal = items.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 500 : 0;

  const handleCheckout = async () => {
    const token = localStorage.getItem("venorum_auth_token");
    if (!token || items.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        orderItems: items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          image: item.product.images[0],
          price: item.product.price,
          product: item.product._id
        })),
        shippingAddress: {
          address: "123 Royale Estate",
          city: "London",
          postalCode: "W1J 7JZ",
          country: "United Kingdom"
        },
        paymentMethod: "Credit Card",
        itemsPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        totalPrice: subtotal + shipping
      };

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        // Success! Cart is cleared on backend. 
        // Notify Navbar
        window.dispatchEvent(new Event("venorum-cart-change"));
        navigate('/profile');
      } else {
        const data = await res.json();
        throw new Error(data.message || "Checkout failed");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <RefreshCw className="animate-spin text-luxury-gold" size={32} />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 container mx-auto px-6"
    >
      <h1 className="text-4xl md:text-5xl font-serif mb-12">Shopping Bag</h1>

      {error && <p className="text-red-500 mb-6 text-sm uppercase tracking-widest">{error}</p>}

      {items.length === 0 ? (
        <div className="text-center py-20 border border-luxury-gold/20  glass ">
          <p className="text-gray-400 mb-6">
            Your shopping bag is currently empty.
          </p>
          <Link
            to="/shop"
            className="bg-luxury-gold text-luxury-black px-8 py-3 uppercase tracking-widest text-xs hover:bg-luxury-white transition-colors"
          >
            Discover Pieces
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-2/3 space-y-8">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.product?._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gold/20 pb-8 gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-luxury-gray">
                      <img
                        src={item.product?.images?.[0] || "https://via.placeholder.com/200"}
                        alt={item.product?.name}
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl mb-1">{item.product?.name}</h3>
                      <p className="text-sm text-gray-400 tracking-wider">
                        SKU: VN-{item.product?._id?.substring(0,6)}
                      </p>
                      <p className="text-luxury-gold mt-2 block sm:hidden">
                        ₹{(item.product?.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:w-1/2">
                    <div className="flex items-center space-x-4  glass  px-4 py-2 border border-luxury-gold/20">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity, -1)}
                        className="text-gray-400 hover:text-luxury-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity, 1)}
                        className="text-gray-400 hover:text-luxury-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-luxury-white font-medium hidden sm:block">
                      ₹{((item.product?.price || 0) * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => removeItem(item.product._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors ml-4"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:w-1/3">
            <div className=" glass  p-8 border border-luxury-gold/20 sticky top-32">
              <h3 className="text-xl font-serif mb-6 border-b border-luxury-gold/20 pb-4">
                Order Summary
              </h3>
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-luxury-white">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Shipping Priority</span>
                  <span className="text-luxury-white">
                    ₹{shipping.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxes & Duties</span>
                  <span className="text-luxury-white">
                    Calculated at checkout
                  </span>
                </div>
              </div>
              <div className="border-t border-luxury-gold/20 pt-4 mb-8 flex justify-between text-lg">
                <span>Total</span>
                <span className="text-luxury-gold">
                  ₹{(subtotal + shipping).toLocaleString("en-IN")}
                </span>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-luxury-gold text-luxury-black flex items-center justify-center space-x-2 py-4 hover:bg-luxury-white transition-colors uppercase tracking-widest text-xs font-semibold"
              >
                <span>Secure Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Cart;


