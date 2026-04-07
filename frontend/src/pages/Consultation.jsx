import React from 'react';
import { motion } from 'framer-motion';
import { Video, Calendar, MessageSquare, ArrowRight } from 'lucide-react';

const Consultation = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen pt-32 pb-20 container mx-auto px-6"
    >
       <div className="text-center mb-16 max-w-2xl mx-auto">
          <p className="text-luxury-gold text-sm tracking-[0.2em] uppercase mb-4">Concierge Services</p>
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Virtual Consultations</h1>
          <p className="text-gray-400">Experience the world of Venorum from the comfort of your home. Connect directly with our high-jewelry advisors who will guide you through our collections.</p>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className=" glass  p-10 border border-luxury-gold/20 text-center hover:border-luxury-gold/50 transition-colors group">
             <div className="w-16 h-16 mx-auto bg-luxury-gray border border-luxury-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-luxury-gold/10 transition-colors">
                <Video size={24} className="text-luxury-gold" />
             </div>
             <h3 className="text-xl font-serif mb-4">Live Video Chat</h3>
             <p className="text-sm text-gray-400 mb-8">Initiate an instant HD video call with one of our master artisans to view pieces in real-time light.</p>
             <button className="w-full border border-luxury-white hover:border-luxury-gold py-3 uppercase text-xs tracking-widest hover:text-luxury-gold transition-colors">Start Session</button>
          </div>

          <div className=" glass  p-10 border border-luxury-gold/20 text-center hover:border-luxury-gold/50 transition-colors group relative overflow-hidden">
             <div className="absolute inset-0 bg-luxury-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative z-10">
                 <div className="w-16 h-16 mx-auto bg-luxury-gray border border-luxury-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-luxury-gold/10 transition-colors">
                    <Calendar size={24} className="text-luxury-gold" />
                 </div>
                 <h3 className="text-xl font-serif mb-4">Book Appointment</h3>
                 <p className="text-sm text-gray-400 mb-8">Schedule a private showing for bespoke requests or to view multiple pieces from our vault.</p>
                 <button className="w-full bg-luxury-gold text-luxury-black py-3 uppercase text-xs tracking-widest transition-colors font-semibold flex justify-center items-center gap-2">
                    <span>Schedule</span>
                    <ArrowRight size={14} />
                 </button>
             </div>
          </div>

          <div className=" glass  p-10 border border-luxury-gold/20 text-center hover:border-luxury-gold/50 transition-colors group">
             <div className="w-16 h-16 mx-auto bg-luxury-gray border border-luxury-gold/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-luxury-gold/10 transition-colors">
                <MessageSquare size={24} className="text-luxury-gold" />
             </div>
             <h3 className="text-xl font-serif mb-4">Live Messaging</h3>
             <p className="text-sm text-gray-400 mb-8">Speak directly with an advisor via our encrypted concierge chat line for discreet inquiries.</p>
             <button className="w-full border border-luxury-white hover:border-luxury-gold py-3 uppercase text-xs tracking-widest hover:text-luxury-gold transition-colors">Open Chat</button>
          </div>

       </div>
    </motion.div>
  );
};

export default Consultation;
