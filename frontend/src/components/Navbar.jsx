import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Heart,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import venorumLogo from "../assets/venorum.svg";
import { auth } from "../firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Real Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("venorum_auth_token"),
  );
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("venorum_user") || "null"),
  );

  // Listen for login/logout across the app
  useEffect(() => {
    const syncAuth = () => {
      const token = localStorage.getItem("venorum_auth_token");
      const user = JSON.parse(localStorage.getItem("venorum_user") || "null");
      setIsLoggedIn(!!token);
      setCurrentUser(user);
    };

    // Initial sync
    syncAuth();

    // Listen for storage changes (for multiple tabs)
    window.addEventListener("storage", syncAuth);

    // Custom event for same-tab updates
    window.addEventListener("venorum-auth-change", syncAuth);

    // Also listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // If it's a firebase user, ensure we have him in state if not already there
        if (!localStorage.getItem("venorum_auth_token")) {
          setIsLoggedIn(true);
          setCurrentUser({
            name: user.displayName || "Venorum Member",
            email: user.email,
            role: "user",
          });
        }
      } else {
        // Only log out if there isn't a custom token (like admin)
        if (!localStorage.getItem("venorum_auth_token")) {
          setIsLoggedIn(false);
          setCurrentUser(null);
        }
      }
    });

    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("venorum-auth-change", syncAuth);
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      /* ignore */
    }
    localStorage.removeItem("venorum_auth_token");
    localStorage.removeItem("venorum_user");
    setIsLoggedIn(false);
    setCurrentUser(null);
    setProfileDropdownOpen(false);

    // Notify same-tab listeners
    window.dispatchEvent(new Event("venorum-auth-change"));

    navigate("/");
  };

  // Cart State
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    const token = localStorage.getItem("venorum_auth_token");
    if (!token) {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const totalItems =
          data.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
        setCartCount(totalItems);
      }
    } catch (e) {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchCartCount();
    window.addEventListener("venorum-cart-change", fetchCartCount);
    window.addEventListener("venorum-auth-change", fetchCartCount);
    return () => {
      window.removeEventListener("venorum-cart-change", fetchCartCount);
      window.removeEventListener("venorum-auth-change", fetchCartCount);
    };
  }, []);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: "Shop", path: "/shop" },
    { name: "Customization", path: "#" },
    { name: "Concierge", path: "/consultation", special: true },
    { name: "About", path: "#" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "glass py-4 shadow-lg" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-luxury-white hover:text-luxury-gold transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link
          to="/"
          className="block hover:opacity-80 transition-opacity duration-300"
        >
          <img src={venorumLogo} alt="Venorum" className="h-12 md:h-12 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-12 items-center">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[11px] tracking-[0.25em] font-medium uppercase transition-all duration-500 py-2 ${
                  isActive
                    ? "text-luxury-gold drop-shadow-[0_0_12px_rgba(212,175,55,0.8)]"
                    : "text-gray-300 hover:text-luxury-white"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-8 relative">
          <button className="text-gray-300 hover:text-luxury-gold transition-all duration-500 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
            <Search size={20} strokeWidth={1.5} />
          </button>

          <Link
            to="/wishlist"
            className="text-gray-300 hover:text-luxury-gold transition-all duration-500 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]"
          >
            <Heart size={20} strokeWidth={1.5} />
          </Link>

          <Link
            to="/cart"
            className="text-gray-300 hover:text-luxury-gold transition-all duration-500 hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] relative block"
          >
            <ShoppingBag size={20} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-luxury-gold text-luxury-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center pointer-events-none">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="relative hidden md:block" ref={dropdownRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className={`text-gray-300 hover:text-luxury-gold transition-all duration-500 hover:scale-110 flex items-center ${
                profileDropdownOpen
                  ? "text-luxury-gold drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] scale-110"
                  : ""
              }`}
            >
              <User size={20} strokeWidth={1.5} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-6 w-56 glass border border-luxury-gold/20 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden origin-top-right rounded-sm"
                >
                  {!isLoggedIn ? (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-400 mb-4 font-light">
                        Access your exclusive Member Vault.
                      </p>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/login");
                        }}
                        className="w-full bg-luxury-gold text-luxury-black py-2 uppercase tracking-widest text-xs font-medium hover:bg-luxury-white transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          navigate("/login");
                        }}
                        className="w-full mt-3 border border-luxury-gold/40 text-luxury-gold py-2 uppercase tracking-widest text-xs font-medium hover:bg-luxury-gold hover:text-luxury-black transition-colors"
                      >
                        Sign Up
                      </button>
                    </div>
                  ) : (
                    <div className="py-2">
                      <div className="px-4 py-3 border-b border-luxury-gold/10 mb-2">
                        <p className="text-sm font-serif">
                          {currentUser?.name ||
                            currentUser?.displayName ||
                            "Venorum Member"}
                        </p>
                        <p className="text-xs text-luxury-gold tracking-wider truncate">
                          {currentUser?.email || ""}
                        </p>
                      </div>

                      {currentUser?.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 bg-luxury-gold/5 hover:bg-luxury-gold/10 text-sm text-luxury-gold transition-colors font-medium border-b border-luxury-gold/10"
                        >
                          <Settings size={16} />
                          <span className="uppercase tracking-widest text-[10px]">
                            Admin Dashboard
                          </span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-gray-300 hover:text-luxury-gold transition-colors"
                      >
                        <Package size={16} />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-gray-300 hover:text-luxury-gold transition-colors"
                      >
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-gray-300 hover:text-luxury-gold transition-colors"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full mt-2 border-t border-luxury-gold/10 flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-red-500 hover:text-red-400 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 bg-luxury-black z-50 flex flex-col pt-20 px-6"
          >
            <button
              className="absolute top-6 right-6 text-luxury-white hover:text-luxury-gold"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={30} />
            </button>
            <div className="flex flex-col space-y-8 mt-10">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif text-luxury-white hover:text-luxury-gold transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to={isLoggedIn ? "/profile" : "/login"}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xl font-serif text-luxury-gold mt-10 border-t border-luxury-gold/20 pt-8"
              >
                {isLoggedIn ? "My Vault" : "Account Login"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
