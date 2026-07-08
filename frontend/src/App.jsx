import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';

import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard'; // This acts as your Admin Layout/Sidebar
import DashboardHome from './pages/admin/DashboardHome';   // This is your KPI dashboard

import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

// 1. Create a layout shell for the customer-facing pages
const StorefrontLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          
          {/* 🛒 STOREFRONT ROUTES (Includes Navbar & max-width container) */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Route>

          {/* 🔒 PROTECTED ADMIN SECTION (Full width, independent layout) */}
          <Route element={<AdminRoute />}>
            {/* The AdminDashboard component here holds your Sidebar and <Outlet /> */}
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>
          </Route>

        </Routes>
      </Router>
    </StoreProvider>
  );
}