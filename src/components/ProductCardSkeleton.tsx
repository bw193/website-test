import React from 'react';

/**
 * Loading placeholder for ProductCard.
 *
 * Mirrors ProductCard's exact box model — `aspect-square` image, `pt-5` body,
 * serif title + price row. Keep in lockstep with src/components/ProductCard.tsx.
 */
export default function ProductCardSkeleton() {
  return (
    <div aria-hidden="true" className="flex h-full flex-col animate-pulse">
      <div className="aspect-square overflow-hidden rounded-2xl bg-stone-200" />
      <div className="flex flex-1 flex-col pt-5">
        <div className="mb-3 h-3 w-24 rounded bg-stone-200" />
        <div className="mb-2 h-6 w-4/5 rounded bg-stone-200" />
        <div className="h-6 w-3/5 rounded bg-stone-100" />
        <div className="mt-auto pt-5">
          <div className="mb-4 h-7 w-20 rounded bg-stone-200" />
          <div className="h-11 w-full rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  );
}
