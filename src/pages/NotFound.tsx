import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

export default function NotFound() {
  const { lp } = useLocalizedPath();
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
            to={lp('/')}
            className="btn-primary"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to={lp('/products')}
            className="btn-secondary"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
