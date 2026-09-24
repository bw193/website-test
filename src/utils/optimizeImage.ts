/**
 * Resized image URLs via Supabase's image transforms (/render/image/), which
 * return WebP to browsers that accept it.
 *
 * Images in the site's own buckets are addressed through the same-origin
 * /media/ proxy (see ./media.ts) so Google can index them; any other Supabase
 * object keeps the direct /render/image/ URL, and non-Supabase URLs are
 * returned unchanged.
 */

import { toMediaTransformPath } from './media';

const TRANSFORMS_ENABLED = true;

function transformParams(
  options: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' }
): URLSearchParams {
  const { width, height, quality = 80, resize = 'contain' } = options;
  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  if (quality !== 80) params.set('quality', String(quality));
  // Most product/blog images should preserve their source framing. Video cards
  // can opt into `cover` with a fixed width/height to get true poster crops.
  params.set('resize', resize);
  return params;
}

export function optimizeImage(
  url: string | undefined | null,
  options: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' } = {}
): string {
  if (!url) return '';
  if (!TRANSFORMS_ENABLED) return url;

  const params = transformParams(options);
  const mediaPath = toMediaTransformPath(url, params);
  if (mediaPath) return mediaPath;

  if (!url.includes('supabase.co/storage/v1/object/public/')) return url;
  const transformed = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  return `${transformed}${transformed.includes('?') ? '&' : '?'}${params.toString()}`;
}

/**
 * Generates a srcSet string for responsive images.
 * Only produces srcSet when Supabase transforms are enabled.
 */
export function imageSrcSet(
  url: string | undefined | null,
  widths: number[] = [400, 800, 1200],
  options: { heightForWidth?: (width: number) => number; quality?: number; resize?: 'cover' | 'contain' } = {}
): string {
  if (!url || !TRANSFORMS_ENABLED) return '';
  if (!url.includes('supabase.co/storage/v1/object/public/')) return '';

  return widths
    .map((w) =>
      `${optimizeImage(url, {
        width: w,
        height: options.heightForWidth ? options.heightForWidth(w) : undefined,
        quality: options.quality,
        resize: options.resize,
      })} ${w}w`
    )
    .join(', ');
}
