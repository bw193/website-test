import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import ProductCard from '../components/ProductCard';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  category?: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-stone-900 tracking-tight">{t('products.catalog')}</h1>
          <p className="mt-4 text-xl text-stone-500 max-w-2xl mx-auto">
            {t('products.desc')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-stone-500 py-12">
            {t('products.noProducts')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                description={product.description}
                image={product.images?.[0]}
                category={product.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
