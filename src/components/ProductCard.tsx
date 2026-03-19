import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface ProductCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ id, title, description, image, category }) => {
  const { t } = useTranslation();
  return (
    <div className="group relative bg-white border border-stone-200 rounded-2xl flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="aspect-w-3 aspect-h-4 bg-stone-200 group-hover:opacity-75 sm:aspect-none sm:h-96">
        <img
          src={image || 'https://picsum.photos/seed/mirror/400/500'}
          alt={title}
          className="w-full h-full object-center object-cover sm:w-full sm:h-full"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 p-6 space-y-2 flex flex-col justify-between">
        <div>
          {category && <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{category}</span>}
          <h3 className="text-lg font-medium text-stone-900 mt-1">
            <Link to={`/products/${id}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </Link>
          </h3>
          <p className="text-sm text-stone-500 line-clamp-2 mt-2">{description}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium text-amber-600 group-hover:text-amber-500">{t('products.viewDetails')} &rarr;</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
