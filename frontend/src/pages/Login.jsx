import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { Smartphone, Mail, Lock, RefreshCw, Key, CheckCircle } from "lucide-react";
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  RecaptchaVerifier, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithPhoneNumber,
  sendEmailVerification
} from "../firebase/firebaseConfig";

const API_URL = "http://localhost:5000/api";

const PhoneInputField = PhoneInput.default ? PhoneInput.default : PhoneInput;

const Login = () => {
  const navigate = useNavigate();
  
  // PRIMARY UI FLOW: 'form' -> 'otp' -> 'google_phone_request'
  const [uiState, setUiState] = useState("form");
  const [isLogin, setIsLogin] = useState(true); 
  
  // FORM FIELDS (Present in both Sign In & Sign Up)
  const [emailStr, setEmailStr] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      try {
         window.recaptchaVerifier = new RecaptchaVerifier(auth, 'login-recaptcha', {
            'size': 'invisible'
         });
      } catch(e) { /* Ignore during dummy renders */ }
    }
  }, []);

  // --- CORE SYNC ---
  const syncWithBackend = async (firebaseIdToken) => {
     try {
       const res = await fetch(`${API_URL}/auth/login`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ token: firebaseIdToken })
       });
       
       if (res.ok) {
           const userData = await res.json();
           localStorage.setItem("venorum_auth_token", firebaseIdToken);
           localStorage.setItem("venorum_user", JSON.stringify(userData));
           navigate('/profile'); 
       } else {
           const errData = await res.json();
           throw new Error(errData.message || "Failed backend sync.");
       }
     } catch(err) {
         setError(err?.message || "Failed backend sync.");
         setLoading(false);
         setUiState("form"); // fallback
     }
  };

  // Trigger Phone Link OTP Flow natively for active currentUser sessions
  const dispatchPhoneVerification = async (phoneToVerify) => {
      setLoading(true); setError(""); setMessage("");
      try {
          const formattedPhone = '+' + phoneToVerify;
          const user = auth.currentUser;
          const confirmation = await linkWithPhoneNumber(user, formattedPhone, window.recaptchaVerifier);
          setConfirmationResult(confirmation);
          setMessage("Dispatching identity cipher to your device.");
          setUiState("otp");
      } catch(err) {
          setError(err?.message?.replace('Firebase:', '').trim() || "Parameter Error.");
      } finally {
          setLoading(false);
      }
  };

  // --- MAIN FORM SUBMISSION (EMAIL/PHONE/PASS) ---
  const handleNativeSubmit = async () => {
      if (!emailStr || !password || !phone) {
          setError("All three identity parameters (Email, Phone, Password) are strictly required.");
          return;
      }
      if (phone.length < 10) {
          setError("Valid international phone format required.");
          return;
      }
      
      setLoading(true); setError(""); setMessage("");
      
      try {
          let userCredential;
          
          if (!isLogin) { // SIGN UP MODE
              // 1. Create Firebase Object via Email & Password
              userCredential = await createUserWithEmailAndPassword(auth, emailStr, password);
              // 2. Dispatch Email Verification Protocol in Background
              sendEmailVerification(userCredential.user).catch(() => {});
              // 3. Immediately Dispatch Phone Verification to Link Phone
              await dispatchPhoneVerification(phone);
              // Flow stops here and awaits OTP resolution
          } else { // SIGN IN MODE
              // 1. Authorize Firebase Object via Email & Password
              userCredential = await signInWithEmailAndPassword(auth, emailStr, password);
              const activeUser = userCredential.user;
              
              // 2. Cross-check if Phone Exists natively on Identity
              if (!activeUser.phoneNumber) {
                  // User exists but has no phone mapped (or legacy). Dispatch OTP to attach it.
                  await dispatchPhoneVerification(phone);
              } else {
                  // Everything is verified. Sync Backend!
                  const token = await activeUser.getIdToken(true);
                  await syncWithBackend(token);
              }
          }
      } catch(err) {
          setError(err?.message?.replace('Firebase:', '').trim() || "Authentication halted.");
          setLoading(false);
      }
  };

  // --- GOOGLE AUTHENTICATION ---
  const handleGoogleLogin = async () => {
    setLoading(true); setError(""); setMessage("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const activeUser = result.user;
      
      if (!activeUser.phoneNumber) {
          // Google payload lacks phone identity. Interlock!
          setUiState('google_phone_request');
          setLoading(false);
      } else {
          // Fully Mapped
          const token = await activeUser.getIdToken(true);
          await syncWithBackend(token);
      }
    } catch (err) {
      setError("Google authentication interface failed to securely resolve.");
      setLoading(false);
    }
  };

  // --- GOOGLE PHONE REQUEST DISPATCH ---
  const handleGooglePhoneSubmit = async () => {
      if (!phone || phone.length < 10) {
          setError("Valid international phone format required to map Google identity.");
          return;
      }
      await dispatchPhoneVerification(phone);
  };

  // --- OTP RESOLUTION FOR ALL FLOWS ---
  const handleOtpVerify = async () => {
      if (!otp || otp.length < 6) { setError("Incomplete verification cipher."); return; }
      setLoading(true); setError(""); setMessage("");
      try {
         const result = await confirmationResult.confirm(otp);
         // Once confirmed, phone is linked. We can now securely launch to backend APIs!
         const token = await result.user.getIdToken(true);
         await syncWithBackend(token);
      } catch(err) {
         setError("Invalid OTP signature matrix.");
         setLoading(false);
      }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-[100vh] flex items-center justify-center px-6 py-24 bg-[url('https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative"
    >
      <div className="absolute inset-0 bg-luxury-black/85 backdrop-blur-md"></div>
      <div id="login-recaptcha"></div>

      <motion.div 
         initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", damping: 25 }}
         className="w-full max-w-md relative z-10 glass border border-luxury-gold/30 rounded-sm p-10 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]"
      >
         <div className="text-center mb-8">
            <h1 className="text-3xl font-serif text-luxury-gold mb-2 tracking-widest uppercase">Venorum</h1>
            <p className="text-gray-400 text-xs font-light uppercase tracking-widest flex items-center justify-center gap-2">
               {uiState === 'form' ? "Secure Access Portal" : (
                  <><Key size={14} className="text-luxury-gold"/> <span>Multi-Factor Verification</span></>
               )}
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

         <AnimatePresence mode="wait">
             
             {/* MAIN ALL-IN-ONE FORM */}
             {uiState === "form" && (
                 <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
                    
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                        <input type="email" value={emailStr} onChange={e => setEmailStr(e.target.value)} className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm px-12 py-3 text-white text-sm outline-none transition-colors" placeholder="Email Address" />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10" size={16} />
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm px-12 py-3 text-white text-sm outline-none transition-colors" placeholder="Secure Password" />
                    </div>

                    <PhoneInputField
                        country={'in'} value={phone} onChange={val => setPhone(val)}
                        containerClass="!w-full" inputClass="!w-full !bg-luxury-black/50 !border !border-luxury-gold/30 !rounded-sm !text-white !h-12 !px-14 focus:!border-luxury-gold transition-colors text-sm"
                        buttonClass="!bg-luxury-black/70 !border-luxury-gold/30 !rounded-l-sm" dropdownClass="!bg-luxury-black !text-white !border-luxury-gold/30"
                    />

                    <button onClick={handleNativeSubmit} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm transition-all hover:bg-luxury-white shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 mt-2">
                       {loading ? <RefreshCw className="animate-spin" size={18} /> : <span>{isLogin ? "Authenticate Identity" : "Register Credentials"}</span>}
                    </button>
                    
                    <div className="flex flex-col items-center gap-2 mt-4 text-xs pt-2">
                        <button onClick={() => { setIsLogin(!isLogin); setError(""); }} className="text-gray-400 hover:text-white transition-colors uppercase tracking-[0.1em] font-medium">
                           {isLogin ? "No Profile? Configure Structure" : "Existing Profile? Tunnel In"}
                        </button>
                    </div>

                    <div className="flex items-center my-6 opacity-60">
                       <div className="flex-1 border-t border-luxury-gold/20"></div>
                       <span className="px-4 text-[10px] text-gray-400 uppercase tracking-widest">Global Protocol</span>
                       <div className="flex-1 border-t border-luxury-gold/20"></div>
                    </div>

                    <button 
                       onClick={handleGoogleLogin} disabled={loading}
                       className="w-full flex items-center justify-center gap-3 glass border border-gray-600/50 text-white font-semibold px-6 py-3 rounded-sm transition-all hover:bg-gray-800 disabled:opacity-50 text-sm"
                    >
                       <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-4 h-4" />
                       <span>Continue with Google</span>
                    </button>
                 </motion.div>
             )}

             {/* GOOGLE MISSING PHONE PROTOCOL */}
             {uiState === "google_phone_request" && (
                 <motion.div key="google_phone_request" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-5 text-center">
                    <Smartphone size={40} strokeWidth={1} className="mx-auto text-luxury-gold mb-2"/>
                    <p className="text-sm text-gray-300 font-light mb-4">Google identities require explicit Mobile dual-layer mapping. Please map a phone device to your Google stream.</p>
                    
                    <PhoneInputField
                        country={'in'} value={phone} onChange={val => setPhone(val)}
                        containerClass="!w-full mb-4 text-left" inputClass="!w-full !bg-luxury-black/50 !border !border-luxury-gold/30 !rounded-sm !text-white !h-12 !px-14 focus:!border-luxury-gold transition-colors text-sm"
                        buttonClass="!bg-luxury-black/70 !border-luxury-gold/30 !rounded-l-sm" dropdownClass="!bg-luxury-black !text-white !border-luxury-gold/30"
                    />

                    <button onClick={handleGooglePhoneSubmit} disabled={loading} className="w-full flex items-center justify-center bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm disabled:opacity-50">
                       {loading ? <RefreshCw className="animate-spin" size={18} /> : <span>Dispatch OTP Link</span>}
                    </button>
                 </motion.div>
             )}

             {/* UNIVERSAL OTP RESOLUTION */}
             {uiState === "otp" && (
                 <motion.div key="otp" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                    <p className="text-sm text-gray-300 font-light text-center mb-4">We dispatched a 6-digit confirmation protocol to your mobile device.</p>
                    <input type="text" maxLength="6" value={otp} onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-luxury-black border border-luxury-gold/30 focus:border-luxury-gold rounded-sm px-12 py-4 text-white tracking-[0.5em] text-center outline-none" placeholder="••••••" />
                    
                    <button onClick={handleOtpVerify} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-luxury-white disabled:opacity-50">
                       {loading ? <RefreshCw className="animate-spin" size={18} /> : <><CheckCircle size={18}/><span>Confirm Telemetry</span></>}
                    </button>
                 </motion.div>
             )}

         </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Login;
