/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import { hasSupabaseConfig } from './supabase';
import Home from './pages/Home';
import Products from './pages/Products';

// Lazy load pages for better performance
const OurStory = lazy(() => import('./pages/OurStory'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const RFQ = lazy(() => import('./pages/RFQ'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProductForm = lazy(() => import('./pages/AdminProductForm'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));

// Loading fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
          {!hasSupabaseConfig && (
            <div className="bg-amber-600 text-white text-center py-2 px-4 text-sm font-medium">
              Supabase Setup Required: Add <code className="bg-amber-700 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-700 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your Environment Variables (or AI Studio Secrets) and rebuild the app.
            </div>
          )}
          <Navbar />
          <main className="flex-1 flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/our-story" element={<OurStory />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/rfq" element={<RFQ />} />
                
                <Route path="/admin/login" element={<AdminLogin />} />
                
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products/new" element={<AdminProductForm />} />
                  <Route path="/admin/products/:id" element={<AdminProductForm />} />
                </Route>
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
