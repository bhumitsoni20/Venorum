import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-luxury-gray py-16 border-t border-luxury-gold/10">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <Link to="/" className="text-2xl font-serif font-semibold tracking-widest text-luxury-white mb-6 block">
            VENORUM
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed">
            Crafting timeless elegance since 1920. Every piece is a story of luxury, passion, and perfection.
          </p>
        </div>
        
        <div>
          <h4 className="text-luxury-gold font-serif text-lg mb-6 tracking-wide">Collections</h4>
          <ul className="space-y-4">
            <li><Link to="/shop" className="text-gray-400 hover:text-luxury-white text-sm transition-colors">The Royal Series</Link></li>
            <li><Link to="/shop" className="text-gray-400 hover:text-luxury-white text-sm transition-colors">Wedding Bands</Link></li>
            <li><Link to="/shop" className="text-gray-400 hover:text-luxury-white text-sm transition-colors">Eternity Necklaces</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-luxury-gold font-serif text-lg mb-6 tracking-wide">Brand</h4>
          <ul className="space-y-4">
            <li><span className="cursor-pointer text-gray-400 hover:text-luxury-white text-sm transition-colors">Our Story</span></li>
            <li><span className="cursor-pointer text-gray-400 hover:text-luxury-white text-sm transition-colors">Craftsmanship</span></li>
            <li><span className="cursor-pointer text-gray-400 hover:text-luxury-white text-sm transition-colors">Sustainability</span></li>
          </ul>
        </div>

        <div>
          <h4 className="text-luxury-gold font-serif text-lg mb-6 tracking-wide">Support</h4>
          <ul className="space-y-4">
            <li><span className="cursor-pointer text-gray-400 hover:text-luxury-white text-sm transition-colors">Contact Us</span></li>
            <li><span className="cursor-pointer text-gray-400 hover:text-luxury-white text-sm transition-colors">Book Consultation</span></li>
            <li><span className="cursor-pointer text-gray-400 hover:text-luxury-white text-sm transition-colors">Care Guide</span></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-6 mt-16 pt-8 border-t border-luxury-gold/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
        <p>&copy; {new Date().getFullYear()} VENORUM LUXURY PIECES. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <span className="hover:text-luxury-gold cursor-pointer transition">Privacy Policy</span>
          <span className="hover:text-luxury-gold cursor-pointer transition">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
