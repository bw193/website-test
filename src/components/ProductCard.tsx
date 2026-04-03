import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
  priceRange?: string;
  msrp?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, description, image, category, priceRange, msrp }) => {
  const { t } = useTranslation();
  const formatPrice = (val?: string) => {
    if (!val) return '';
    return val.startsWith('$') ? val : `$${val}`;
  };

  return (
    <Link to={`/products/${id}`} className="group block h-full">
      <div className="bg-white rounded-2xl flex flex-col h-full overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 relative">
        
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
          <img
            src={image || 'https://picsum.photos/seed/mirror/400/500'}
            alt={title}
            className="w-full h-full object-center object-cover transition-transform duration-700 group-hover:scale-105"
            width="400"
            height="500"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/0 to-stone-900/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Quick View Button (appears on hover) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <span className="bg-white/90 backdrop-blur-sm text-stone-900 text-sm font-medium px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
              {t('products.viewDetails')} <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-5 flex flex-col flex-1">
          <div className="mb-3 flex items-center justify-between gap-2">
            {category && (
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-1 rounded-md">
                {t(`products.categories.${category}`, category)}
              </span>
            )}
          </div>
          
          <h3 className="text-lg font-bold text-stone-900 leading-tight mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
            {title}
          </h3>
          
          <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">
            {description}
          </p>
          
          {(priceRange || msrp) && (
            <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
              <div>
                {priceRange && (
                  <div className="text-xl font-extrabold text-stone-900">
                    {formatPrice(priceRange)}
                  </div>
                )}
                {msrp && (
                  <div className="text-xs text-stone-400 line-through mt-0.5">
                    {t('products.msrp')}: {formatPrice(msrp)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
