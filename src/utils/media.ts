/**
 * Same-origin media URLs.
 *
 * Product photos, factory images, logos and video posters live in Supabase
 * Storage, which answers every object — and every /render/image/ variant — with
 * `X-Robots-Tag: none` (noindex, nofollow). That kept all of them out of Google
 * Images and made the Product, Organization and VideoObject images ineligible
 * for rich results, which require crawlable *and indexable* image URLs.
 *
 * worker/media.ts serves the same files from bolenmirror.com/media/ without that
 * header, so every image URL the site emits goes through these helpers:
 *
 *   https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
 *     → /media/<bucket>/<path>                              original file
 *   optimizeImage(url, { width: 800 })
 *     → /media/<bucket>/<path>?width=800&resize=contain      Supabase transform
 *
 * Only the site's own media buckets are mapped. Any other URL (YouTube posters,
 * self-hosted /hero/ files, an unknown bucket) is returned unchanged.
 */

export const SITE_ORIGIN = 'https://bolenmirror.com';
export const SUPABASE_STORAGE_ORIGIN = 'https://mxmmffwntosvwaviippd.supabase.co';
export const MEDIA_PATH_PREFIX = '/media/';

const OBJECT_BASE = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/object/public/`;
const RENDER_BASE = `${SUPABASE_STORAGE_ORIGIN}/storage/v1/render/image/public/`;

/** Public buckets that hold site media. Only staff can upload to them. */
export const MEDIA_BUCKETS: readonly string[] = ['product-images', 'product-videos', 'comp image'];

/**
 * Images only: the proxy never streams video files, so a video URL keeps its
 * Supabase address even though its bucket is mapped.
 */
const IMAGE_FILE = /\.(avif|gif|jpe?g|png|svg|webp)$/i;

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
 * Canonical `<bucket>/<path>` for a mapped image, percent-encoded one segment at
 * a time so raw and pre-encoded inputs ("comp image" / "comp%20image") agree.
 * Returns null for unknown buckets, non-image files and dot segments.
 */
function canonicalObjectPath(rawPath: string): string | null {
  const segments = rawPath.split('/').map(decodeSegment);
  if (segments.length < 2) return null;
  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) return null;
  const decoded = segments as string[];
  if (!MEDIA_BUCKETS.includes(decoded[0])) return null;
  if (!IMAGE_FILE.test(decoded[decoded.length - 1])) return null;
  return decoded.map(encodeURIComponent).join('/');
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

/** A Supabase public object URL for a mapped image, split into path and query. */
function parseStorageUrl(url: string): { objectPath: string; query: string } | null {
  const base = url.startsWith(OBJECT_BASE) ? OBJECT_BASE : url.startsWith(RENDER_BASE) ? RENDER_BASE : null;
  if (!base) return null;
  const rest = url.slice(base.length).split('#')[0];
  const queryStart = rest.indexOf('?');
  const objectPath = canonicalObjectPath(queryStart === -1 ? rest : rest.slice(0, queryStart));
  if (!objectPath) return null;
  // Plain object URLs never carry transforms; render URLs keep theirs.
  const query = base === RENDER_BASE && queryStart !== -1
    ? transformQuery(new URLSearchParams(rest.slice(queryStart + 1)))
    : '';
  return query === null ? null : { objectPath, query };
}

/**
 * Same-origin path for a Supabase image (for <img>, srcset and CSS). Any other
 * URL is returned unchanged.
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
 * Absolute same-origin URL for a Supabase image — for JSON-LD, Open Graph and
 * sitemaps, which need full URLs. Relative /media/ paths are made absolute too.
 */
export function toMediaUrl(url: string): string;
export function toMediaUrl(url: string | null | undefined): string | null | undefined;
export function toMediaUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  const path = toMediaPath(url);
  return path.startsWith(MEDIA_PATH_PREFIX) ? `${SITE_ORIGIN}${path}` : path;
}

/**
 * Supabase transform URL for a mapped image, as a /media/ path. Returns null for
 * anything the proxy does not serve.
 */
export function toMediaTransformPath(url: string, params: URLSearchParams): string | null {
  const parsed = parseStorageUrl(url.trim());
  if (!parsed) return null;
  const query = transformQuery(params);
  if (query === null) return null;
  return `${MEDIA_PATH_PREFIX}${parsed.objectPath}${query ? `?${query}` : ''}`;
}

/**
 * The Supabase URL a /media/ request is served from: the original object, or
 * the /render/image/ transform when size parameters are present. Null means
 * the proxy must refuse the request.
 */
export function mediaUpstreamUrl(pathname: string, searchParams: URLSearchParams): string | null {
  if (!pathname.startsWith(MEDIA_PATH_PREFIX)) return null;
  const objectPath = canonicalObjectPath(pathname.slice(MEDIA_PATH_PREFIX.length));
  if (!objectPath) return null;
  const query = transformQuery(searchParams);
  if (query === null) return null;
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
