import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, RefreshCw, CheckCircle, ArrowLeft } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    const handleReset = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage(data.message);
                setIsSuccess(true);
            } else {
                throw new Error(data.message || "Something went wrong.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-[100vh] flex items-center justify-center px-6 py-24 bg-[url('https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative"
        >
            <div className="absolute inset-0 bg-luxury-black/85 backdrop-blur-md"></div>

            <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 25 }}
                className="w-full max-w-md relative z-10 glass border border-luxury-gold/30 rounded-sm p-10 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-luxury-gold mb-2 tracking-widest uppercase">Venorum</h1>
                    <p className="text-gray-400 text-xs font-light uppercase tracking-widest">
                        Update Your Password
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/30 text-red-500 p-3 rounded-sm text-xs mb-6 text-center shadow-[0_0_10px_rgba(220,38,38,0.2)]">
                        {error}
                    </div>
                )}
                
                {message && (
                    <div className="bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 p-3 rounded-sm text-xs mb-6 text-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        {message}
                    </div>
                )}

                {isSuccess ? (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle className="text-luxury-gold" size={48} />
                        </div>
                        <button 
                            onClick={() => navigate("/login")}
                            className="w-full bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm transition-all hover:bg-luxury-white shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-4"
                        >
                            Go to Sign In
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-5">
                        {/* PASSWORD */}
                         <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={16} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={e => setPassword(e.target.value)} 
                                className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm pl-12 pr-12 py-3 text-white text-sm outline-none transition-colors" 
                                placeholder="New Password" 
                                required
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-luxury-gold transition-colors z-10 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        {/* CONFIRM PASSWORD */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={16} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm pl-12 pr-12 py-3 text-white text-sm outline-none transition-colors" 
                                placeholder="Confirm New Password" 
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="w-full flex items-center justify-center gap-3 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm transition-all hover:bg-luxury-white shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 mt-2"
                        >
                            {loading ? <RefreshCw className="animate-spin" size={18} /> : <span>Reset Password</span>}
                        </button>

                        <div className="flex justify-center mt-4">
                            <button 
                                type="button"
                                onClick={() => navigate("/login")}
                                className="flex items-center gap-2 text-gray-400 hover:text-luxury-gold transition-colors text-xs uppercase tracking-[0.1em] font-medium"
                            >
                                <ArrowLeft size={14} />
                                <span>Back to Sign In</span>
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ResetPassword;
