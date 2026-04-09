import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, RefreshCw, ArrowRight } from "lucide-react";

const API_URL = "http://localhost:5000/api";

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState("verifying"); // verifying, success, error
    const [message, setMessage] = useState("");

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/verify-email/${token}`);
                const data = await res.json();
                
                if (res.ok) {
                    setStatus("success");
                    setMessage(data.message);
                } else {
                    setStatus("error");
                    setMessage(data.message || "Verification failed.");
                }
            } catch (err) {
                setStatus("error");
                setMessage("Connection error. Please try again later.");
            }
        };
        verify();
    }, [token]);

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-[100vh] flex items-center justify-center px-6 py-24 bg-[url('https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative"
        >
            <div className="absolute inset-0 bg-luxury-black/85 backdrop-blur-md"></div>

            <motion.div 
                initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 25 }}
                className="w-full max-w-md relative z-10 glass border border-luxury-gold/30 rounded-sm p-10 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)] text-center"
            >
                <h1 className="text-3xl font-serif text-luxury-gold mb-6 tracking-widest uppercase">Venorum</h1>

                {status === "verifying" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <RefreshCw className="animate-spin text-luxury-gold" size={40} />
                        <p className="text-gray-400 uppercase tracking-widest text-xs font-light">Authenticating Membership...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-6 py-4">
                        <div className="flex justify-center">
                            <CheckCircle className="text-emerald-500" size={50} />
                        </div>
                        <h2 className="text-xl text-white font-serif uppercase tracking-wider">Verification Complete</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                        <button 
                            onClick={() => navigate("/login")}
                            className="w-full flex items-center justify-center gap-3 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm transition-all hover:bg-luxury-white shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-6"
                        >
                            <span>Enter Collection</span>
                            <ArrowRight size={18} />
                        </button>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-6 py-4">
                        <div className="flex justify-center">
                            <XCircle className="text-red-500" size={50} />
                        </div>
                        <h2 className="text-xl text-white font-serif uppercase tracking-wider">Link Expired</h2>
                        <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                        <button 
                            onClick={() => navigate("/login")}
                            className="w-full bg-luxury-black border border-luxury-gold/50 text-luxury-gold font-bold uppercase tracking-widest px-6 py-4 rounded-sm transition-all hover:bg-luxury-gold hover:text-luxury-black mt-6"
                        >
                            Back to Sign In
                        </button>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default VerifyEmail;
