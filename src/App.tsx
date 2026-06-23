/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LanguageLayout from './components/LanguageLayout';
import { hasSupabaseConfig } from './supabaseConfig';
import Home from './pages/Home';

// Home renders synchronously — it's the most common landing target and the LCP
// route, so it must be in the initial chunk. Everything else is lazy: deep-link
// visits still see the prerendered body content (baked into each route's
// index.html) while the chunk downloads. Products was previously eager too, but
// it pulled `motion` onto the home critical path — lazy-loading it keeps the
// homepage bundle free of the motion runtime.
const Products = lazy(() => import('./pages/Products'));
// MotionProvider supplies motion's features to the lazy routes that still use
// `m` components. Lazy so `motion` never lands in the homepage bundle.
const MotionProvider = lazy(() => import('./components/MotionProvider'));
const withMotion = (el: React.ReactNode) => <MotionProvider>{el}</MotionProvider>;
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const OurStory = lazy(() => import('./pages/OurStory'));
const RFQ = lazy(() => import('./pages/RFQ'));
const AdminAuthBoundary = lazy(() => import('./components/AdminAuthBoundary'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProductForm = lazy(() => import('./pages/AdminProductForm'));
const AdminRoute = lazy(() => import('./components/AdminRoute'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const AdminBlogForm = lazy(() => import('./pages/AdminBlogForm'));
const Videos = lazy(() => import('./pages/Videos'));
const VideoDetail = lazy(() => import('./pages/VideoDetail'));
const AdminVideoForm = lazy(() => import('./pages/AdminVideoForm'));

// Loading fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
          <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-amber-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium">
            Skip to content
          </a>
          {!hasSupabaseConfig && (
            <div className="bg-amber-600 text-white text-center py-2 px-4 text-sm font-medium">
              Supabase Setup Required: Add <code className="bg-amber-700 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-700 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your Environment Variables (or AI Studio Secrets) and rebuild the app.
            </div>
          )}
          <Navbar />
          <main id="main-content" className="flex-1 flex flex-col">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Redirect root to default language */}
                <Route path="/" element={<Navigate to="/en/" replace />} />

                {/* Language-prefixed public routes */}
                <Route path="/:lang" element={<LanguageLayout />}>
                  <Route index element={<Home />} />
                  <Route path="products" element={withMotion(<Products />)} />
                  <Route path="products/:id" element={withMotion(<ProductDetail />)} />
                  <Route path="our-story" element={withMotion(<OurStory />)} />
                  <Route path="blog" element={withMotion(<Blog />)} />
                  <Route path="blog/:slug" element={withMotion(<BlogPost />)} />
                  <Route path="videos" element={withMotion(<Videos />)} />
                  <Route path="videos/:slug" element={withMotion(<VideoDetail />)} />
                  <Route path="rfq" element={withMotion(<RFQ />)} />
                </Route>

                {/* Admin routes (no language prefix) */}
                <Route
                  path="/admin/login"
                  element={<AdminAuthBoundary><AdminLogin /></AdminAuthBoundary>}
                />
                <Route element={<AdminAuthBoundary><AdminRoute /></AdminAuthBoundary>}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/products/new" element={<AdminProductForm />} />
                  <Route path="/admin/products/:id" element={<AdminProductForm />} />
                  <Route path="/admin/blog/new" element={<AdminBlogForm />} />
                  <Route path="/admin/blog/:id" element={<AdminBlogForm />} />
                  <Route path="/admin/videos/new" element={<AdminVideoForm />} />
                  <Route path="/admin/videos/:id" element={<AdminVideoForm />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
  );
}
