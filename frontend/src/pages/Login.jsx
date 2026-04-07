import React, { useState } from "react";
import { motion } from "framer-motion";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center py-32 px-6 bg-[url('https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center relative"
    >
      <div className="absolute inset-0 bg-luxury-black/90 backdrop-blur-sm"></div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="w-full max-w-md relative z-10  glass  p-10 md:p-14 border border-luxury-gold/20 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-luxury-white mb-2">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-luxury-gold text-xs tracking-widest uppercase">
            {isLogin
              ? "Enter your details to access your vault"
              : "Become a Venorum member"}
          </p>
        </div>

        <form className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent border-b border-gray-600 focus:border-luxury-gold py-2 outline-none transition-colors text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
              Email Address
            </label>
            <input
              type="email"
              className="w-full bg-transparent border-b border-gray-600 focus:border-luxury-gold py-2 outline-none transition-colors text-white"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-xs uppercase tracking-wider text-gray-400">
                Password
              </label>
              {isLogin && (
                <span className="text-[10px] text-gray-400 hover:text-luxury-gold cursor-pointer transition-colors uppercase">
                  Forgot?
                </span>
              )}
            </div>
            <input
              type="password"
              className="w-full bg-transparent border-b border-gray-600 focus:border-luxury-gold py-2 outline-none transition-colors text-white"
            />
          </div>

          <button
            type="button"
            className="w-full bg-luxury-gold text-luxury-black hover:bg-luxury-white transition-colors duration-300 py-4 uppercase tracking-widest text-sm font-medium mt-8"
          >
            {isLogin ? "Sign In" : "Register"}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-luxury-gold/20 pt-6">
          <p className="text-sm text-gray-400">
            {isLogin ? "Don't have an account?" : "Already a member?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-luxury-gold hover:text-luxury-white transition-colors"
            >
              {isLogin ? "Register now." : "Sign in."}
            </button>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
