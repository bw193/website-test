/**
 * Same-origin media URLs.
 *
 * Product photos, factory images, logos, video posters and self-hosted videos
 * live in Supabase Storage, which answers every object — and every /render/image/
 * variant — with `X-Robots-Tag: none` (noindex, nofollow). That kept images out
 * of Google Images and blocked Googlebot Video from indexing self-hosted MP4s in
 * VideoObject / video sitemap entries.
 *
 * worker/media.ts serves the same files from bolenmirror.com/media/ without that
 * header (streaming Range/206 responses for videos), so every media URL the site
 * emits goes through these helpers:
 *
 *   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 *     → /media/<bucket>/<path>                              original image or video
 *   optimizeImage(url, { width: 800 })
 *     → /media/<bucket>/<path>?width=800&resize=contain      raster image transform
 *
 * Only the site's own media buckets are mapped. Any other URL (YouTube posters,
 * self-hosted /hero/ files, an unknown bucket) is returned unchanged.
 */

export const SITE_ORIGIN = 'https://bolenmirror.com';
export const SUPABASE_STORAGE_ORIGIN = 'https://mxmmffwntosvwaviippd.supabase.co';
export const MEDIA_PATH_PREFIX = '/media/';

const OBJECT_BASE = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/`;
const RENDER_BASE = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/render/image/public/`;
const SITE_MEDIA_BASE = `${SITE_ORIGIN}${MEDIA_PATH_PREFIX}`;

/** Public buckets that hold site media. Only staff can upload to them. */
export const MEDIA_BUCKETS: readonly string[] = [
  'product-images',
  'product-videos',
  'comp image',
  'video',
  'videos',
];

const RASTER_IMAGE_FILE = /\.(avif|gif|jpe?g|jfif|png|webp)$/i;
const IMAGE_FILE = /\.(avif|gif|jpe?g|jfif|png|svg|webp)$/i;
const VIDEO_FILE = /\.(mp4|webm|mov)$/i;
const MEDIA_FILE = /\.(avif|gif|jpe?g|jfif|png|svg|webp|mp4|webm|mov)$/i;

/** Supabase transform parameters the proxy forwards, in optimizeImage's order. */
const TRANSFORM_PARAMS: Record<string, RegExp> = {
  width: /^(?:[1-9]\d{0,2}|1\d{3}|2[0-4]\d{2}|2500)$/, // 1–2500, Supabase's limit
  height: /^(?:[1-9]\d{0,2}|1\d{3}|2[0-4]\d{2}|2500)$/,
  quality: /^(?:[2-9]\d|100)$/, // 20–100
  resize: /^(?:cover|contain|fill)$/,
};

function decodeSegment(segment: string): string | null {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/**
 * Percent-encodes path segments and additionally escapes `(` and `)` so
 * filenames like `CE(1)(1).jpg` are never truncated at `)` by crawlers or
 * Markdown/CSS URL scanners.
 */
function encodePath(segments: readonly string[]): string {
  return segments
    .map((segment) => encodeURIComponent(segment).replace(/\(/g, '%28').replace(/\)/g, '%29'))
    .join('/');
}

/**
 * Canonical `<bucket>/<path>` for a mapped image or video, percent-encoded one
 * segment at a time so raw and pre-encoded inputs ("comp image" / "comp%20image",
 * "CE(1).jpg" / "CE%281%29.jpg") agree. Returns null for unknown buckets,
 * unsupported extensions and dot segments.
 */
function canonicalObjectPath(rawPath: string): string | null {
  const segments = rawPath.split('/').map(decodeSegment);
  if (segments.length < 2) return null;
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return null;
  const decoded = segments as string[];
  if (!MEDIA_BUCKETS.includes(decoded[0])) return null;
  if (!MEDIA_FILE.test(decoded[decoded.length - 1])) return null;
  return encodePath(decoded);
}

/** True when a `/media/...` pathname or object path refers to a video file. */
export function isVideoMediaPath(pathname: string): boolean {
  if (!pathname.startsWith(MEDIA_PATH_PREFIX)) return false;
  const objectPath = canonicalObjectPath(pathname.slice(MEDIA_PATH_PREFIX.length));
  return Boolean(objectPath && VIDEO_FILE.test(objectPath));
}

/** Keeps only valid transform parameters; null when any present value is invalid. */
function transformQuery(params: URLSearchParams): string | null {
  const kept = new URLSearchParams();
  for (const [name, pattern] of Object.entries(TRANSFORM_PARAMS)) {
    const value = params.get(name);
    if (value === null) continue;
    if (!pattern.test(value)) return null;
    kept.set(name, value);
  }
  return kept.toString();
}

/** A Supabase public object URL (or same-origin /media/ URL) split into path and query. */
function parseStorageUrl(url: string): { objectPath: string; query: string } | null {
  let base: string | null = null;
  if (url.startsWith(OBJECT_BASE)) base = OBJECT_BASE;
  else if (url.startsWith(RENDER_BASE)) base = RENDER_BASE;
  else if (url.startsWith(SITE_MEDIA_BASE)) base = SITE_MEDIA_BASE;
  else if (url.startsWith(MEDIA_PATH_PREFIX)) base = MEDIA_PATH_PREFIX;
  if (!base) return null;

  const rest = url.slice(base.length).split('#')[0];
  const queryStart = rest.indexOf('?');
  const objectPath = canonicalObjectPath(queryStart === -1 ? rest : rest.slice(0, queryStart));
  if (!objectPath) return null;

  const isRaster = RASTER_IMAGE_FILE.test(objectPath);
  if (base === RENDER_BASE && !isRaster) return null;

  // Plain object URLs and non-raster files (videos, SVGs) never carry image transforms.
  const acceptsQuery = (base === RENDER_BASE || base === SITE_MEDIA_BASE || base === MEDIA_PATH_PREFIX) && isRaster;
  const query = acceptsQuery && queryStart !== -1
    ? transformQuery(new URLSearchParams(rest.slice(queryStart + 1)))
    : '';
  return query === null ? null : { objectPath, query };
}

/**
 * Same-origin path for a Supabase image or video (for <img>, <video>, srcset
 * and CSS). Any other URL is returned unchanged.
 */
export function toMediaPath(url: string): string;
export function toMediaPath(url: string | null | undefined): string | null | undefined;
export function toMediaPath(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  const parsed = parseStorageUrl(url.trim());
  if (!parsed) return url;
  return `${MEDIA_PATH_PREFIX}${parsed.objectPath}${parsed.query ? `?${parsed.query}` : ''}`;
}

/**
 * Absolute same-origin URL for a Supabase image or video — for JSON-LD, Open
 * Graph and sitemaps, which need full URLs. Relative /media/ paths are made
 * absolute too.
 */
export function toMediaUrl(url: string): string;
export function toMediaUrl(url: string | null | undefined): string | null | undefined;
export function toMediaUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  const path = toMediaPath(url);
  return path.startsWith(MEDIA_PATH_PREFIX) ? `${SITE_ORIGIN}${path}` : path;
}

/**
 * Supabase transform URL for a mapped raster image, as a /media/ path. Mapped
 * videos and SVGs return their plain /media/ path without image resize params;
 * returns null for anything the proxy does not serve or invalid parameters.
 */
export function toMediaTransformPath(url: string, params: URLSearchParams): string | null {
  const parsed = parseStorageUrl(url.trim());
  if (!parsed) return null;
  const query = transformQuery(params);
  if (query === null) return null;
  if (!RASTER_IMAGE_FILE.test(parsed.objectPath)) {
    return `${MEDIA_PATH_PREFIX}${parsed.objectPath}`;
  }
  return `${MEDIA_PATH_PREFIX}${parsed.objectPath}${query ? `?${query}` : ''}`;
}

/**
 * The Supabase URL a /media/ request is served from: the original object, or
 * the /render/image/ transform when size parameters are present on a raster
 * image. Null means the proxy must refuse the request.
 */
export function mediaUpstreamUrl(pathname: string, searchParams: URLSearchParams): string | null {
  if (!pathname.startsWith(MEDIA_PATH_PREFIX)) return null;
  const objectPath = canonicalObjectPath(pathname.slice(MEDIA_PATH_PREFIX.length));
  if (!objectPath) return null;
  const query = transformQuery(searchParams);
  if (query === null) return null;
  if (query && !RASTER_IMAGE_FILE.test(objectPath)) return null;
  if (!IMAGE_FILE.test(objectPath) && !VIDEO_FILE.test(objectPath)) return null;
  return query ? `${RENDER_BASE}${objectPath}?${query}` : `${OBJECT_BASE}${objectPath}`;
}

/**
 * Inverse of the helpers above for build scripts that download media directly
 * (they run before the Worker exists). Non-media URLs are returned unchanged.
 */
export function mediaSourceUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url, SITE_ORIGIN);
  } catch {
    return url;
  }
  if (parsed.origin !== SITE_ORIGIN) return url;
  return mediaUpstreamUrl(parsed.pathname, parsed.searchParams) ?? url;
}
