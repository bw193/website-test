import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <SEO title="Page Not Found | BOLEN Mirror" noindex={true} />
      <div className="text-center max-w-md">
        <p className="text-8xl font-serif font-bold text-stone-200 mb-4">404</p>
        <h1 className="text-2xl font-bold text-stone-900 mb-3">Page Not Found</h1>
        <p className="text-stone-500 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 rounded-full font-medium hover:bg-stone-100 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
