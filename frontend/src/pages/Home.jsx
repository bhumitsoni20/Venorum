import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Video, Mail, Star, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const mainRef = useRef(null);

  // Section 1 Refs
  const sec1Ref = useRef(null);
  const heroTextRef = useRef(null);

  // Section 2 Refs
  const sec2Ref = useRef(null);
  const ring360Ref = useRef(null);
  const text360Ref = useRef(null);

  // Section 3 Refs
  const sec3Ref = useRef(null);
  const gemBaseRef = useRef(null);
  const gem1Ref = useRef(null);
  const gem2Ref = useRef(null);
  const gem3Ref = useRef(null);

  // Section 4 Refs
  const sec4Ref = useRef(null);
  const typeTextRef = useRef(null);

  // Section 5 Refs
  const sec5Ref = useRef(null);
  const cardsRef = useRef([]);

  useGSAP(
    () => {
      /* SECTION 1: Hero Parallax Zoom In (Fly-through) */
      gsap.to(heroTextRef.current, {
        y: 100, // Small downward drift keeps it centered visually
        opacity: 0,
        scale: 1.5, // Massive scale creates fly-through effect
        ease: "power1.in",
        scrollTrigger: {
          trigger: sec1Ref.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      /* SECTION 2: 360 Scroll Animation */
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: sec2Ref.current,
          start: "top top",
          end: "+=2000",
          pin: true,
          scrub: 1,
        },
      });

      // Ring rotates fully 360 while scrolling it, with parallax texts fading
      tl2
        .to(ring360Ref.current, { rotation: 360, ease: "none" }, 0)
        .fromTo(
          text360Ref.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.3 },
          0.1,
        )
        .to(text360Ref.current, { opacity: 0, y: -50, duration: 0.3 }, 0.7);

      /* SECTION 3: Dynamic Gem Change */
      const tl3 = gsap.timeline({
        scrollTrigger: {
          trigger: sec3Ref.current,
          start: "top top",
          end: "+=3000",
          pin: true,
          scrub: 1,
        },
      });

      // Initial state: Gems off-screen to the right
      gsap.set([gem1Ref.current, gem2Ref.current, gem3Ref.current], {
        x: window.innerWidth,
        opacity: 0,
        scale: 0.5,
      });

      // Gem 1 Sequence
      tl3
        .to(gem1Ref.current, { x: 0, opacity: 1, scale: 1, duration: 1 })
        .to(
          gemBaseRef.current,
          { filter: "drop-shadow(0px 0px 20px rgba(255,0,0,0.5))" },
          "<",
        )
        .to(gem1Ref.current, { opacity: 0, scale: 2, duration: 0.5 });

      // Gem 2 Sequence
      tl3
        .to(gem2Ref.current, { x: 0, opacity: 1, scale: 1, duration: 1 })
        .to(
          gemBaseRef.current,
          { filter: "drop-shadow(0px 0px 20px rgba(0,0,255,0.5))" },
          "<",
        )
        .to(gem2Ref.current, { opacity: 0, scale: 2, duration: 0.5 });

      // Gem 3 Sequence
      tl3
        .to(gem3Ref.current, { x: 0, opacity: 1, scale: 1, duration: 1 })
        .to(
          gemBaseRef.current,
          { filter: "drop-shadow(0px 0px 20px rgba(0,255,0,0.5))" },
          "<",
        );

      /* SECTION 4: Customization Typewriter Effect */
      gsap.fromTo(
        typeTextRef.current,
        { width: 0 },
        {
          width: "100%",
          duration: 2,
          ease: "steps(15)",
          scrollTrigger: {
            trigger: sec4Ref.current,
            start: "top 60%",
          },
        },
      );

      /* SECTION 5: Categories Entrance */
      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sec5Ref.current,
            start: "top 70%",
          },
        },
      );
    },
    { scope: mainRef },
  );

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  return (
    <div
      ref={mainRef}
      className="bg-luxury-black text-luxury-white overflow-hidden"
    >
      {/* ================= SECTION 1: HERO & INTRO ================= */}
      <section
        ref={sec1Ref}
        className="relative h-screen w-full flex items-center justify-center"
      >
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            poster="https://images.unsplash.com/photo-1599643478514-411bd0adddd1?q=80&w=2000&auto=format&fit=crop"
            className="w-full h-full object-cover opacity-50"
          >
            <source
              src="https://cdn.pixabay.com/video/2021/08/21/85848-592186716_tiny.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/10 via-luxury-black/60 to-luxury-black"></div>
        </div>

        <div
          ref={heroTextRef}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
            className="text-6xl md:text-9xl font-serif tracking-tight drop-shadow-2xl mb-4 gold-gradient-text"
          >
            VENORUM
          </motion.h1>

          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
            className="text-luxury-white text-lg md:text-2xl font-light tracking-[0.3em] uppercase mb-10 text-shadow-sm"
          >
            Crafted Elegance, Timeless Luxury
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0px 0px 5px rgba(212,175,55,0.2)",
                  "0px 0px 25px rgba(212,175,55,0.6)",
                  "0px 0px 5px rgba(212,175,55,0.2)",
                ],
                borderColor: [
                  "rgba(212,175,55,0.4)",
                  "rgba(212,175,55,1)",
                  "rgba(212,175,55,0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-sm border border-luxury-gold/50"
            >
              <Link
                to="/shop"
                className="group relative inline-flex items-center justify-center overflow-hidden bg-luxury-black/40 backdrop-blur-md px-12 py-4 text-xs tracking-widest uppercase transition-all duration-500 hover:bg-luxury-gold"
              >
                <span className="relative z-10 group-hover:text-luxury-black font-semibold transition-colors duration-500 flex items-center space-x-2">
                  <span>Shop Now</span>
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 2: 360 DEGREES SCROLL ================= */}
      <section
        ref={sec2Ref}
        className="relative h-screen w-full bg-luxury-black overflow-hidden flex items-center border-t border-luxury-gold/10"
      >
        {/* Deep Parallax Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-luxury-gold/5 via-luxury-black to-luxury-black"></div>

        <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 items-center relative z-10 h-full">
          <div className="relative w-full h-[60vh] md:h-[80vh] flex items-center justify-center">
            <img
              ref={ring360Ref}
              src="https://images.unsplash.com/photo-1605100804763-247f66156ce4?q=80&w=800&auto=format&fit=crop"
              alt="Rotating Jewelry"
              className="w-[300px] h-[300px] md:w-[500px] md:h-[500px] object-cover rounded-full shadow-[0_0_80px_rgba(212,175,55,0.15)] border border-luxury-gold/20"
              style={{ borderRadius: "50%" }}
            />
            <div className="absolute inset-0 rounded-full box-shadow-inner border border-luxury-gold/10 pointer-events-none scale-105 pointer-events-none"></div>
          </div>

          <div
            ref={text360Ref}
            className="flex flex-col justify-center px-6 md:px-16 text-center md:text-left opacity-0 translate-y-10"
          >
            <p className="text-luxury-gold text-xs uppercase tracking-widest mb-4">
              Master Craftsmanship
            </p>
            <h2 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">
              Every Angle,
              <br />
              <span className="italic">Perfected.</span>
            </h2>
            <p className="text-gray-400 font-light leading-relaxed mb-8">
              Forged by heritage masters, our pieces demand attention from every
              perspective. We dedicate upwards of 200 hours carving the exact
              facets needed to capture absolute brilliance.
            </p>
            <div className="h-[1px] w-24 bg-luxury-gold/50 mx-auto md:mx-0"></div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 3: DYNAMIC GEM CHANGE ================= */}
      <section
        ref={sec3Ref}
        className="relative h-screen w-full bg-luxury-black overflow-hidden border-t border-luxury-gold/10"
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-20">
          <h2 className="text-3xl md:text-5xl font-serif mb-2">
            Build Your Legacy
          </h2>
          <p className="text-gray-400 tracking-wider text-sm uppercase mb-16">
            Witness the transformation
          </p>

          <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center">
            {/* Base Ring / Platform */}
            <img
              ref={gemBaseRef}
              src="https://images.unsplash.com/photo-1599643477874-c4a6a4218a5c?q=80&w=500&auto=format&fit=crop"
              alt="Base Necklace"
              className="w-full h-full object-cover rounded-full border-2 border-luxury-gold/20 z-10 transition-all duration-300"
            />

            {/* Flying Gems Overlaying */}
            {/* Note: Using colored radial gradients to mock gems since we need specific overlays */}
            <div
              ref={gem1Ref}
              className="absolute inset-0 z-20 flex justify-center items-center"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,100,100,1)_0%,_rgba(150,0,0,1)_100%)] shadow-[0_0_30px_rgba(255,0,0,0.8)] border border-red-300"></div>
              <span className="absolute -bottom-10 text-red-400 uppercase tracking-widest text-xs font-bold bg-luxury-black/80 px-3 py-1">
                Imperial Ruby
              </span>
            </div>

            <div
              ref={gem2Ref}
              className="absolute inset-0 z-30 flex justify-center items-center"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(100,150,255,1)_0%,_rgba(0,0,150,1)_100%)] shadow-[0_0_30px_rgba(0,0,255,0.8)] border border-blue-300"></div>
              <span className="absolute -bottom-10 text-blue-400 uppercase tracking-widest text-xs font-bold bg-luxury-black/80 px-3 py-1">
                Deep Sapphire
              </span>
            </div>

            <div
              ref={gem3Ref}
              className="absolute inset-0 z-40 flex justify-center items-center"
            >
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-[radial-gradient(circle_at_center,_rgba(100,255,150,1)_0%,_rgba(0,100,0,1)_100%)] shadow-[0_0_30px_rgba(0,255,0,0.8)] border border-green-300"></div>
              <span className="absolute -bottom-10 text-green-400 uppercase tracking-widest text-xs font-bold bg-luxury-black/80 px-3 py-1">
                Verdant Emerald
              </span>
            </div>
          </div>

          <div className="absolute bottom-20 w-full flex justify-center">
            <Link
              to="/shop"
              className="glass border border-luxury-gold/30 text-luxury-white hover:bg-luxury-gold hover:text-luxury-black px-10 py-4 uppercase tracking-widest text-xs font-semibold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.6)] transition-all"
            >
              Configure Yours
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: CUSTOMIZATION & CONSULTATION ================= */}
      <section
        ref={sec4Ref}
        className="relative py-32 bg-luxury-gray border-t border-luxury-gold/5 flex flex-col items-center justify-center font-serif"
      >
        <div className="container mx-auto px-6 text-center z-10  glass  border border-luxury-gold/10 p-16 max-w-4xl relative overflow-hidden rounded-sm">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-luxury-gold/10 rounded-full blur-[100px]"></div>

          {/* Typing Effect Container */}
          <div className="inline-block relative mb-12">
            <h2
              ref={typeTextRef}
              className="text-4xl md:text-6xl text-luxury-white overflow-hidden whitespace-nowrap border-r-2 border-luxury-gold pr-2 m-0 mx-auto w-0"
            >
              Customize More?
            </h2>
          </div>

          <p className="text-gray-400 font-sans tracking-wide mb-12 max-w-xl mx-auto font-light">
            Design a piece specifically for your lineage. Connect instantly with
            our dedicated master artisans to sketch your legacy.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="flex items-center justify-center space-x-3 glass text-luxury-white hover:bg-luxury-gold hover:text-luxury-black font-sans px-8 py-4 uppercase tracking-widest text-xs transition-all border border-luxury-gold/50 shadow-lg hover:-translate-y-1">
              <Video size={16} />
              <span>Live Consultation</span>
            </button>
            <button className="flex items-center justify-center space-x-3 bg-transparent text-luxury-white hover:text-luxury-gold border border-luxury-gold/50 hover:border-luxury-gold font-sans px-8 py-4 uppercase tracking-widest text-xs transition-all hover:-translate-y-1">
              <Mail size={16} />
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: CATEGORIES ================= */}
      <section
        ref={sec5Ref}
        className="py-32 bg-luxury-black relative border-t border-luxury-gold/5"
      >
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-4">
                Collections
              </h2>
              <p className="text-luxury-gold text-xs uppercase tracking-widest">
                Select your category
              </p>
            </div>
            <Link
              to="/shop"
              className="hidden md:inline-flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-400 hover:text-luxury-gold transition-colors border-b border-gray-600 hover:border-luxury-gold pb-1"
            >
              <span>Show All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Jewelry for Women",
                img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop",
              },
              {
                title: "Jewelry for Men",
                img: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
              },
              {
                title: "Jewelry for Kids",
                img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
              },
            ].map((cat, i) => (
              <div
                key={i}
                ref={addToCardsRef}
                className="group relative h-[450px] overflow-hidden rounded-sm cursor-pointer border border-transparent hover:border-luxury-gold/50 transition-all duration-700 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]"
              >
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-luxury-black/60 to-transparent flex items-end p-8">
                  <div className="w-full flex justify-between items-center text-luxury-white group-hover:text-luxury-gold transition-colors">
                    <h3 className="font-serif text-2xl drop-shadow-md">{cat.title}</h3>
                    <ArrowRight
                      size={20}
                      className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Show All btn */}
          <div className="mt-12 text-center md:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 text-xs uppercase tracking-widest border border-luxury-gold/50 px-8 py-3 text-luxury-white"
            >
              <span>Show All Collections</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SECTION 6: ASSURANCE & MEMBERSHIP ================= */}
      <section className="py-40 bg-[url('https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-fixed relative border-t border-luxury-gold/20">
        <div className="absolute inset-0 bg-luxury-black/50 backdrop-blur-lg"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black via-transparent to-luxury-black pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          <ShieldCheck
            size={64}
            strokeWidth={1}
            className="text-luxury-gold mb-8 opacity-80"
          />

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-4xl md:text-6xl font-serif text-luxury-white mb-6 leading-tight drop-shadow-2xl"
          >
            Venorum Assurance <br className="hidden md:block" />
            <span className="italic text-luxury-gold text-3xl md:text-5xl">
              100% Transparency & Quality
            </span>
          </motion.h2>

          <p className="text-gray-400 font-light max-w-2xl mx-auto leading-relaxed mb-12">
            From ethical sourcing to lifelong warranties, every piece from
            Venorum is certified globally and backed by our master artisan
            guarantee. Join our society to preserve your legacy forever.
          </p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <button className="glass border border-luxury-gold/50 text-luxury-white hover:text-luxury-black font-semibold font-sans px-12 py-5 uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] hover:bg-luxury-gold transition-all">
              Join Membership
            </button>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 7: RATES PREVIEW ================= */}
      <section className="py-24 bg-luxury-black border-t border-luxury-gold/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-luxury-gold/5 via-luxury-black to-luxury-black pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className=" glass  border border-luxury-gold/20 max-w-5xl mx-auto p-10 md:p-14 relative flex flex-col md:flex-row items-center justify-between shadow-[0_0_40px_rgba(212,175,55,0.05)] rounded-sm"
          >
            <div className="mb-8 md:mb-0 text-center md:text-left">
              <h3 className="text-luxury-gold text-[10px] tracking-[0.3em] font-medium uppercase mb-2">Market Intelligence</h3>
              <h2 className="text-2xl md:text-3xl font-serif text-luxury-white mb-6">Today's Gold & Silver Rates</h2>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-12 text-center md:text-left">
                <div>
                  <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Gold (24K)</p>
                  <p className="text-xl font-serif text-luxury-white font-medium drop-shadow-[0_0_8px_rgba(212,175,55,0.2)]">₹74,500 <span className="text-xs text-luxury-gold/60 font-sans font-light">/ 10g</span></p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs tracking-widest uppercase mb-1">Silver</p>
                  <p className="text-xl font-serif text-luxury-white font-medium drop-shadow-[0_0_8px_rgba(212,175,55,0.2)]">₹85,200 <span className="text-xs text-luxury-gold/60 font-sans font-light">/ kg</span></p>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-6">Last Updated: {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <Link 
              to="/rates" 
              className="group relative inline-flex items-center justify-center overflow-hidden border border-luxury-gold/50 bg-luxury-black/40 backdrop-blur-md px-8 py-4 text-xs tracking-[0.2em] font-medium uppercase transition-all duration-500 hover:bg-luxury-gold hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] whitespace-nowrap"
            >
              <span className="relative z-10 group-hover:text-luxury-black transition-colors duration-500 flex items-center space-x-3">
                 <span>View Full Rates</span>
                 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
