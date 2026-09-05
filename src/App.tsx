/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LanguageLayout from './components/LanguageLayout';
import AnalyticsTracker from './components/AnalyticsTracker';
import { hasSupabaseConfig } from './supabaseConfig';
import Home from './pages/Home';
import { INSIGHTS_PATH, LEGACY_BLOG_PATH, insightDetailPath } from './data/insights';

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
const AdminLayout = lazy(() => import('./components/AdminLayout'));
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
const SeoSolutions = lazy(() => import('./pages/SeoSolutions'));
const SeoLandingPage = lazy(() => import('./pages/SeoLandingPage'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const AiReceptionist = lazy(() => import('./components/AiReceptionist'));

// Loading fallback
const PageLoader = () => (
  <div className="flex-1 flex items-center justify-center min-h-screen">
    <div className="w-12 h-12 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
  </div>
);

function RedirectToCatalog() {
  const { lang } = useParams<{ lang: string }>();
  return <Navigate to={`/${lang || 'en'}/products/`} replace />;
}

function RedirectLegacyInsights() {
  const { lang, slug } = useParams<{ lang?: string; slug?: string }>();
  const target = slug ? insightDetailPath(slug) : INSIGHTS_PATH;
  return <Navigate to={`/${lang || 'en'}${target}/`} replace />;
}

function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col font-sans text-gray-900 ${isAdminRoute ? 'bg-stone-100' : 'bg-gray-50'}`}>
      {!isAdminRoute && (
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-amber-500 focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-medium">
          {t('accessibility.skipToContent', 'Skip to content')}
        </a>
      )}
      {!hasSupabaseConfig && (
        <div className="bg-amber-600 text-white text-center py-2 px-4 text-sm font-medium">
          {t(
            'admin.supabaseSetupBanner',
            'Supabase Setup Required: Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Environment Variables (or AI Studio Secrets) and rebuild the app.'
          )}
        </div>
      )}
      {!isAdminRoute && <Navbar />}
      <main id="main-content" className="flex-1 flex flex-col min-h-0">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Redirect root to default language */}
            <Route path="/" element={<Navigate to="/en/" replace />} />

            {/* Language-prefixed public routes */}
            <Route path="/:lang" element={<LanguageLayout />}>
              <Route index element={<Home />} />
              <Route path="products" element={withMotion(<Products />)} />
              <Route path="products/category" element={<RedirectToCatalog />} />
              <Route path="products/category/:categorySlug" element={withMotion(<Products />)} />
              <Route path="products/:productCategory/:id" element={withMotion(<ProductDetail />)} />
              <Route path="products/:id" element={withMotion(<ProductDetail />)} />
              <Route path="our-story" element={withMotion(<OurStory />)} />
              <Route path={INSIGHTS_PATH.slice(1)} element={<Blog />} />
              <Route path={`${INSIGHTS_PATH.slice(1)}/:slug`} element={<BlogPost />} />
              <Route path={LEGACY_BLOG_PATH.slice(1)} element={<RedirectLegacyInsights />} />
              <Route path={`${LEGACY_BLOG_PATH.slice(1)}/:slug`} element={<RedirectLegacyInsights />} />
              <Route path="videos" element={withMotion(<Videos />)} />
              <Route path="videos/:slug" element={withMotion(<VideoDetail />)} />
              <Route path="solutions" element={<SeoSolutions />} />
              <Route path="solutions/:slug" element={<SeoLandingPage />} />
              <Route path="rfq" element={withMotion(<RFQ />)} />
              <Route path="terms-and-conditions" element={<TermsAndConditions />} />
            </Route>

            {/* Client-side safety net; production serves permanent redirects. */}
            <Route path={LEGACY_BLOG_PATH} element={<RedirectLegacyInsights />} />
            <Route path={`${LEGACY_BLOG_PATH}/:slug`} element={<RedirectLegacyInsights />} />

            {/* Admin routes (no language prefix) — own chrome, no public nav/footer */}
            <Route
              path="/admin/login"
              element={<AdminAuthBoundary><AdminLogin /></AdminAuthBoundary>}
            />
            <Route element={<AdminAuthBoundary><AdminRoute /></AdminAuthBoundary>}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route path="/admin/products/:id" element={<AdminProductForm />} />
                <Route path="/admin/blog/new" element={<AdminBlogForm />} />
                <Route path="/admin/blog/:id" element={<AdminBlogForm />} />
                <Route path="/admin/videos/new" element={<AdminVideoForm />} />
                <Route path="/admin/videos/:id" element={<AdminVideoForm />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && (
        <Suspense fallback={null}>
          <AiReceptionist />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <AnalyticsTracker />
      <AppShell />
    </Router>
  );
}
