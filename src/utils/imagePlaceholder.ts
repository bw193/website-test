import type React from 'react';

/**
 * Inline placeholder for products whose image is missing.
 *
 * Replaces the previous `https://picsum.photos/seed/mirror/...` fallbacks,
 * which pulled a RANDOM unrelated photograph from a placeholder service and
 * presented it as the product — the worst possible failure mode on a supplier
 * catalog. This is a data URI, so it also costs no request and cannot 404.
 *
 * Kept as an SVG data URI rather than a file so it works identically in the
 * React app and in the prerendered HTML.
 */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" role="img">
  <rect width="400" height="400" fill="#f5f5f4"/>
  <rect x="120" y="96" width="160" height="208" rx="80" fill="none" stroke="#d6d3d1" stroke-width="6"/>
  <text x="200" y="212" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="26" font-weight="600" letter-spacing="4" fill="#a8a29e">BOLEN</text>
</svg>`;

export const PRODUCT_IMAGE_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(SVG)}`;

/**
 * onError handler that swaps a broken image for the placeholder.
 *
 * A `|| PRODUCT_IMAGE_PLACEHOLDER` fallback only covers a missing/empty URL —
 * it does nothing when the URL is present but dead, which is the common case
 * here (product rows referencing deleted Supabase objects). Without this the
 * page shows the browser's broken-image glyph on a product photo.
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>): void {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return; // guard against a loop
  img.dataset.fallbackApplied = 'true';
  img.src = PRODUCT_IMAGE_PLACEHOLDER;
  img.srcset = '';
}
