import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  RefreshCw,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "../firebase/firebaseConfig";

const API_URL = "http://localhost:5000/api";

const Login = () => {
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("venorum_auth_token");
    const user = localStorage.getItem("venorum_user");
    if (token && user) {
      navigate("/");
    }
  }, [navigate]);

  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // FORM FIELDS
  const [name, setName] = useState("");
  const [emailStr, setEmailStr] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // --- SYNC WITH BACKEND ---
  const syncWithBackend = async (firebaseIdToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: firebaseIdToken }),
      });

      if (res.ok) {
        const userData = await res.json();
        localStorage.setItem("venorum_auth_token", firebaseIdToken);
        localStorage.setItem("venorum_user", JSON.stringify(userData));

        // Notify Navbar to update
        window.dispatchEvent(new Event("venorum-auth-change"));

        navigate("/");
      } else {
        const errData = await res.json();
        throw new Error(errData.message || "Backend sync failed.");
      }
    } catch (err) {
      setError(err?.message || "Failed to connect to server.");
      setLoading(false);
    }
  };

  // --- TRY ADMIN LOGIN FIRST (backend email/password) ---
  const tryAdminLogin = async (email, pwd) => {
    try {
      const res = await fetch(`${API_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwd }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("venorum_auth_token", data.token);
        localStorage.setItem("venorum_user", JSON.stringify(data));

        // Notify Navbar to update
        window.dispatchEvent(new Event("venorum-auth-change"));

        navigate("/");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // --- EMAIL/PASSWORD SUBMIT ---
  const handleSubmit = async () => {
    if (!emailStr || !password) {
      setError("Email and Password are required.");
      return;
    }
    if (!isLogin && !name) {
      setError("Name is required for registration.");
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
      if (!isLogin) {
        // SIGN UP — Custom Backend Register (Professional Email)
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email: emailStr, password }),
        });

        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
          // We don't log them in yet; they must verify via email first
          setIsLogin(true); // Switch to login view
        } else {
          throw new Error(data.message || "Registration failed.");
        }
      } else {
        // SIGN IN — try admin login first, then Firebase
        const isAdmin = await tryAdminLogin(emailStr, password);
        if (!isAdmin) {
          // Not admin credentials — try Firebase auth
          const userCredential = await signInWithEmailAndPassword(
            auth,
            emailStr,
            password,
          );
          const token = await userCredential.user.getIdToken(true);
          await syncWithBackend(token);
        }
      }
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in.");
      } else if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password"
      ) {
        setError("Invalid email or password.");
      } else if (code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Use at least 6 characters.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(
          err?.message?.replace("Firebase:", "").trim() ||
            "Authentication failed.",
        );
      }
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD ---
  const handleForgotPassword = async () => {
    if (!emailStr) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailStr }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        throw new Error(data.message || "Failed to send reset email.");
      }
      setLoading(false);
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  // --- GOOGLE SIGN-IN ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken(true);
      await syncWithBackend(token);
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        setError("Google sign-in failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[100vh] flex items-center justify-center px-6 py-24 bg-[url('https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat relative"
    >
      <div className="absolute inset-0 bg-luxury-black/85 backdrop-blur-md"></div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 25 }}
        className="w-full max-w-md relative z-10 glass border border-luxury-gold/30 rounded-sm p-10 overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-luxury-gold mb-2 tracking-widest uppercase">
            Venorum
          </h1>
          <p className="text-gray-400 text-xs font-light uppercase tracking-widest">
            {isForgotPassword
              ? "Reset Your Password"
              : isLogin
                ? "Welcome Back"
                : "Create Your Account"}
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
          {/* ========== FORGOT PASSWORD VIEW ========== */}
          {isForgotPassword ? (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* EMAIL */}
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="email"
                  value={emailStr}
                  onChange={(e) => setEmailStr(e.target.value)}
                  className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm px-12 py-3 text-white text-sm outline-none transition-colors"
                  placeholder="Email Address"
                />
              </div>

              {/* RESET BUTTON */}
              <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm transition-all hover:bg-luxury-white shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              {/* BACK TO LOGIN */}
              <div className="flex justify-center mt-4 pt-2">
                <button
                  onClick={() => {
                    setIsForgotPassword(false);
                    setError("");
                    setMessage("");
                  }}
                  className="flex items-center gap-2 text-gray-400 hover:text-luxury-gold transition-colors text-xs uppercase tracking-[0.1em] font-medium"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* ========== LOGIN / SIGNUP VIEW ========== */
            <motion.div
              key={isLogin ? "login" : "signup"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-5"
            >
              {/* NAME FIELD — only on Sign Up */}
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="relative"
                >
                  <User
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    size={16}
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm px-12 py-3 text-white text-sm outline-none transition-colors"
                    placeholder="Full Name"
                  />
                </motion.div>
              )}

              {/* EMAIL */}
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                  size={16}
                />
                <input
                  type="email"
                  value={emailStr}
                  onChange={(e) => setEmailStr(e.target.value)}
                  className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm px-12 py-3 text-white text-sm outline-none transition-colors"
                  placeholder="Email Address"
                />
              </div>

              {/* PASSWORD with Eye Toggle */}
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10"
                  size={16}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-luxury-black/50 border border-luxury-gold/30 focus:border-luxury-gold rounded-sm pl-12 pr-12 py-3 text-white text-sm outline-none transition-colors"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-luxury-gold transition-colors z-10 focus:outline-none"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* FORGOT PASSWORD LINK — only on Login */}
              {isLogin && (
                <div className="flex justify-end -mt-2">
                  <button
                    onClick={() => {
                      setIsForgotPassword(true);
                      setError("");
                      setMessage("");
                    }}
                    className="text-gray-400 hover:text-luxury-gold transition-colors text-[11px] uppercase tracking-[0.08em] font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-luxury-gold text-luxury-black font-bold uppercase tracking-widest px-6 py-4 rounded-sm transition-all hover:bg-luxury-white shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={18} />
                ) : (
                  <span>{isLogin ? "Sign In" : "Sign Up"}</span>
                )}
              </button>

              {/* TOGGLE */}
              <div className="flex flex-col items-center gap-2 mt-4 text-xs pt-2">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setMessage("");
                  }}
                  className="text-gray-400 hover:text-white transition-colors uppercase tracking-[0.1em] font-medium"
                >
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </button>
              </div>

              {/* DIVIDER */}
              <div className="flex items-center my-6 opacity-60">
                <div className="flex-1 border-t border-luxury-gold/20"></div>
                <span className="px-4 text-[10px] text-gray-400 uppercase tracking-widest">
                  Or
                </span>
                <div className="flex-1 border-t border-luxury-gold/20"></div>
              </div>

              {/* GOOGLE BUTTON */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 glass border border-gray-600/50 text-white font-semibold px-6 py-3 rounded-sm transition-all hover:bg-gray-800 disabled:opacity-50 text-sm"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                <span>Continue with Google</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default Login;
