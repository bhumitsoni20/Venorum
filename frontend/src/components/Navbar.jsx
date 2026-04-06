import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, LogOut, Settings, Heart, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  // Simulated Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { name: 'Rings', path: '/shop?category=rings' },
    { name: 'Necklaces', path: '/shop?category=necklaces' },
    { name: 'Bracelets', path: '/shop?category=bracelets' },
    { name: 'Concierge', path: '/consultation' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-4 shadow-lg' : 'bg-transparent py-6'
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
        <Link to="/" className="text-2xl md:text-3xl font-serif font-semibold tracking-widest text-luxury-white hover:text-luxury-gold transition-colors duration-300">
          VENORUM
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className="text-sm tracking-widest uppercase text-gray-300 hover:text-luxury-gold transition-colors duration-300"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-6 relative">
          <button className="text-gray-300 hover:text-luxury-gold transition-colors duration-300">
            <Search size={20} strokeWidth={1.5} />
          </button>
          <Link to="/cart" className="text-gray-300 hover:text-luxury-gold transition-colors duration-300 relative block">
            <ShoppingBag size={20} strokeWidth={1.5} />
            <span className="absolute -top-2 -right-2 bg-luxury-gold text-luxury-black text-xs font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </Link>
          
          <div className="relative hidden md:block" ref={dropdownRef}>
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="text-gray-300 hover:text-luxury-gold transition-colors duration-300 flex items-center"
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
                       <p className="text-sm text-gray-400 mb-4 font-light">Access your exclusive Member Vault.</p>
                       <button 
                         onClick={() => { setProfileDropdownOpen(false); navigate('/login'); }}
                         className="w-full bg-luxury-gold text-luxury-black py-2 uppercase tracking-widest text-xs font-medium hover:bg-luxury-white transition-colors"
                       >
                          Sign In
                       </button>
                       <button onClick={() => setIsLoggedIn(true)} className="mt-4 text-[10px] text-gray-500 uppercase underline hover:text-luxury-gold">
                         (Simulate Log In)
                       </button>
                    </div>
                  ) : (
                    <div className="py-2">
                       <div className="px-4 py-3 border-b border-luxury-gold/10 mb-2">
                          <p className="text-sm font-serif">Eleanor Vance</p>
                          <p className="text-xs text-luxury-gold tracking-wider">VIP Select</p>
                       </div>
                       <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-gray-300 hover:text-luxury-gold transition-colors">
                          <Package size={16} />
                          <span>My Orders</span>
                       </Link>
                       <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-gray-300 hover:text-luxury-gold transition-colors">
                          <User size={16} />
                          <span>My Profile</span>
                       </Link>
                       <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-gray-300 hover:text-luxury-gold transition-colors">
                          <Settings size={16} />
                          <span>Settings</span>
                       </Link>
                       <button onClick={() => { setIsLoggedIn(false); setProfileDropdownOpen(false); }} className="w-full mt-2 border-t border-luxury-gold/10 flex items-center space-x-3 px-4 py-3 hover:bg-luxury-gray text-sm text-red-500 hover:text-red-400 transition-colors text-left">
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
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
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
              <Link to={isLoggedIn ? "/profile" : "/login"} onClick={() => setMobileMenuOpen(false)} className="text-xl font-serif text-luxury-gold mt-10 border-t border-luxury-gold/20 pt-8">
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
