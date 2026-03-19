/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProductForm from './pages/AdminProductForm';
import AdminRoute from './components/AdminRoute';
import { hasSupabaseConfig } from './supabase';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
          {!hasSupabaseConfig && (
            <div className="bg-amber-500 text-white text-center py-2 text-sm font-medium">
              Supabase Setup Required: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to AI Studio Secrets.
            </div>
          )}
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              
              <Route path="/admin/login" element={<AdminLogin />} />
              
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route path="/admin/products/:id" element={<AdminProductForm />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
