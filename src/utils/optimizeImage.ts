/**
 * Returns the image URL as-is for now.
 *
 * To enable Supabase image transforms (Pro plan required), set
 * VITE_SUPABASE_IMAGE_TRANSFORMS=true — this switches URLs from
 * /storage/v1/object/public/ to /storage/v1/render/image/public/
 * and appends width/format/quality params for WebP serving.
 */

const TRANSFORMS_ENABLED = false;

export function optimizeImage(
  url: string | undefined | null,
  options: { width?: number; height?: number; quality?: number } = {}
): string {
  if (!url) return '';
  if (!TRANSFORMS_ENABLED) return url;
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url;

  const { width, height, quality = 80 } = options;

  let transformed = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('format', 'webp');
  params.set('quality', String(quality));

  transformed += (transformed.includes('?') ? '&' : '?') + params.toString();
  return transformed;
}

/**
 * Generates a srcSet string for responsive images.
 * Only produces srcSet when Supabase transforms are enabled.
 */
export function imageSrcSet(
  url: string | undefined | null,
  widths: number[] = [400, 800, 1200]
): string {
  if (!url || !TRANSFORMS_ENABLED) return '';
  if (!url.includes('supabase.co/storage/v1/object/public/')) return '';

  return widths
    .map(w => `${optimizeImage(url, { width: w })} ${w}w`)
    .join(', ');
}
