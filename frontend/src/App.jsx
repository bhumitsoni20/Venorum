import React from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Wishlist from "./pages/Wishlist.jsx";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Consultation from "./pages/Consultation";
import Rates from "./pages/Rates";
import ShopCategoryDetails from "./pages/ShopCategoryDetails";

// Admin
import AdminLayout from "./pages/Admin/AdminLayout";
import ProductManager from "./pages/Admin/ProductManager";
import UserManager from "./pages/Admin/UserManager";
import Dashboard from "./pages/Admin/Dashboard"; 

const MainLayout = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col min-h-screen bg-luxury-black text-luxury-white overflow-hidden">
      <Navbar />
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Public Application */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/shop/:categorySlug" element={<ShopCategoryDetails />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/consultation" element={<Consultation />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="*" element={<Home />} />
        </Route>



        {/* Secure Admin Area */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="orders" element={<div className="p-10 text-white">Orders Area</div>} />
          <Route path="users" element={<UserManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
