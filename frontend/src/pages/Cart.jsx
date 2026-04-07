import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight } from "lucide-react";

const Cart = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      name: "The Aurelia Ring",
      price: 345000,
      quantity: 1,
      img: "https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Eternity Pendant",
      price: 235000,
      quantity: 1,
      img: "https://images.unsplash.com/photo-1599643477874-c4a6a4218a5c?q=80&w=200&auto=format&fit=crop",
    },
  ]);

  const updateQuantity = (id, delta) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const newQ = item.quantity + delta;
          return { ...item, quantity: newQ > 0 ? newQ : 1 };
        }
        return item;
      }),
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shipping = subtotal > 0 ? 500 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 container mx-auto px-6"
    >
      <h1 className="text-4xl md:text-5xl font-serif mb-12">Shopping Bag</h1>

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
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-luxury-gold/20 pb-8 gap-6"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-luxury-gray">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-400 tracking-wider">
                        SKU: VN-{item.id}089
                      </p>
                      <p className="text-luxury-gold mt-2 block sm:hidden">
                        ₹{item.price.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:w-1/2">
                    <div className="flex items-center space-x-4  glass  px-4 py-2 border border-luxury-gold/20">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-gray-400 hover:text-luxury-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-gray-400 hover:text-luxury-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <p className="text-luxury-white font-medium hidden sm:block">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
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
              <button className="w-full bg-luxury-gold text-luxury-black flex items-center justify-center space-x-2 py-4 hover:bg-luxury-white transition-colors uppercase tracking-widest text-xs font-semibold">
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
