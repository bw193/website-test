import React from 'react';

/**
 * Loading placeholder for ProductCard.
 *
 * Mirrors ProductCard's exact box model — `aspect-square` image, `p-5` body,
 * `mt-auto pt-4 border-t` footer. This used to be hand-written in three places
 * (Products.tsx, Home.tsx, and an earlier catalog variant) with three different
 * geometries; the catalog copy used `aspect-[4/5]`, so every tile snapped 25%
 * shorter the moment products resolved and the whole grid jolted.
 *
 * Keep in lockstep with src/components/ProductCard.tsx.
 */
export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="bg-white rounded-2xl flex flex-col h-full overflow-hidden shadow-sm border border-stone-100 relative animate-pulse"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-200" />
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3 w-20 h-5 bg-stone-200 rounded-md" />
        <div className="w-3/4 h-6 bg-stone-200 rounded mb-2" />
        <div className="w-full h-4 bg-stone-200 rounded mb-2" />
        <div className="w-5/6 h-4 bg-stone-200 rounded mb-4" />
        <div className="mt-auto pt-4 border-t border-stone-100">
          <div className="w-24 h-6 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}
