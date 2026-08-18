import type { LocalizedMap } from '../types/blog';
import type {
  LocalizedVideoPost,
  ProductRecommendationInput,
  VideoListItem,
  VideoPost,
  VideoSourceType,
} from '../types/video';
import { pickLocalized } from './blog';

const DIRECT_VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

/** Poster shown when a video row has no thumbnail of its own. */
export const FALLBACK_VIDEO_THUMB =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

/** Columns every video list/card needs — the heavy JSONB body stays out. */
export const VIDEO_LIST_COLUMNS =
  'id, slug, source_type, video_url, embed_url, thumbnail_url, category, tags, duration_seconds, published_at, title, excerpt';

/**
 * Ceiling on what the homepage's background video may stream, deliberately set
 * high enough to admit the ~30MB factory film the site owner wants as the
 * backdrop. That is a lot of data for a section a visitor merely scrolled past,
 * so the cost is contained elsewhere instead: nothing loads until the band is
 * in view, metered and slow connections fall back to the poster, playback pauses
 * off-screen, and repeat visits revalidate to a 304. Lower this to ~6MB to make
 * the guard strict again — every product clip is under 5MB and still qualifies.
 */
export const AMBIENT_CLIP_BUDGET_BYTES = 32 * 1024 * 1024;
/** Loop length when an excerpt is worth taking. */
export const AMBIENT_CLIP_PREFERRED_SECONDS = 12;
/**
 * How much media a browser pulls regardless of the window we ask for. A media
 * fragment bounds *playback*, not buffering: measured in Chrome, a 12s window of
 * a 130s/26MB upload still transferred ~11MB, and a 5s window of a 45s/53MB one
 * transferred ~47MB. So an excerpt is a byte *reducer*, never a byte guarantee,
 * and the affordability check has to price in the readahead. Calibrated
 * conservatively against those two measurements.
 */
export const AMBIENT_READAHEAD_SECONDS = 55;

export interface AmbientClipPlan {
  /** Offset into the file where the loop starts, in seconds. */
  start: number;
  /** Length of the looped window, in seconds. */
  seconds: number;
  /** True when the whole file fits the budget and no excerpting is needed. */
  full: boolean;
  /** Approximate bytes the loop will stream; null when the size is unknown. */
  bytes: number | null;
}

/**
 * Decides whether the homepage can afford a video as its backdrop, and whether
 * to loop an excerpt instead of the whole thing.
 *
 * Excerpting helps exactly one shape of file: long and low-bitrate, where the
 * browser's readahead covers less than the full duration (a 3-minute 0.1 MB/s
 * upload transfers ~5MB instead of 18MB). It cannot rescue a high-bitrate file —
 * the readahead alone busts the budget — so those get the poster instead.
 */
export function planAmbientClip(
  totalBytes: number | null,
  durationSeconds: number | null | undefined
): AmbientClipPlan | null {
  // No duration means no way to size a window, so only pass files already small.
  if (!durationSeconds || durationSeconds <= 0) {
    if (totalBytes !== null && totalBytes > AMBIENT_CLIP_BUDGET_BYTES) return null;
    return { start: 0, seconds: 0, full: true, bytes: totalBytes };
  }

  // No size means no bitrate to reason about; excerpt long sources on principle.
  if (totalBytes === null) {
    const excerpt = durationSeconds > AMBIENT_READAHEAD_SECONDS;
    return {
      start: excerpt ? durationSeconds * 0.2 : 0,
      seconds: excerpt ? AMBIENT_CLIP_PREFERRED_SECONDS : durationSeconds,
      full: !excerpt,
      bytes: null,
    };
  }

  const bytesPerSecond = totalBytes / durationSeconds;
  // What the browser will really transfer, whatever window we ask it to play.
  const estimatedBytes = Math.min(totalBytes, bytesPerSecond * AMBIENT_READAHEAD_SECONDS);
  if (estimatedBytes > AMBIENT_CLIP_BUDGET_BYTES) return null;

  // Only excerpt when it actually saves bytes — otherwise the browser fetches the
  // whole file anyway and a short loop would just cost variety for nothing.
  if (durationSeconds <= AMBIENT_READAHEAD_SECONDS) {
    return { start: 0, seconds: durationSeconds, full: true, bytes: totalBytes };
  }
  // Start a fifth of the way in: the opening seconds of these uploads are
  // usually a title card or a dark pan.
  const seconds = AMBIENT_CLIP_PREFERRED_SECONDS;
  const start = Math.max(0, Math.min(durationSeconds * 0.2, durationSeconds - seconds));
  return { start, seconds, full: false, bytes: estimatedBytes };
}

/**
 * Byte size of a media URL via HEAD. `null` when it can't be determined —
 * callers should treat that as "no objection" rather than blocking playback.
 * Supabase storage serves `access-control-allow-origin: *`, and Content-Length
 * is CORS-safelisted, so this is readable from the browser.
 */
export async function fetchMediaSize(url: string): Promise<number | null> {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) return null;
    const bytes = Number(res.headers.get('content-length'));
    return Number.isFinite(bytes) && bytes > 0 ? bytes : null;
  } catch {
    return null;
  }
}

export function formatMediaSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatVideoDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 1) return '';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hours}:${String(rem).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

export function normalizeVideoSourceType(value: unknown): VideoSourceType {
  return value === 'upload' || value === 'direct' || value === 'embed' ? value : 'embed';
}

export function isDirectVideoUrl(url: string | null | undefined): boolean {
  return !!url && DIRECT_VIDEO_RE.test(url);
}

const YOUTUBE_ID_RE = /^[\w-]{11}$/;

function parseAbsoluteUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    try {
      return new URL(`https://${url}`);
    } catch {
      return null;
    }
  }
}

function isYouTubeHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  return (
    host === 'youtu.be' ||
    host === 'youtube.com' ||
    host.endsWith('.youtube.com') ||
    host === 'youtube-nocookie.com' ||
    host.endsWith('.youtube-nocookie.com')
  );
}

export function parseYouTubeId(url: string | null | undefined): string {
  if (!url) return '';
  const parsed = parseAbsoluteUrl(url.trim());
  if (!parsed || !isYouTubeHost(parsed.hostname)) return '';

  const fromQuery = parsed.searchParams.get('v') || parsed.searchParams.get('vi');
  if (fromQuery && YOUTUBE_ID_RE.test(fromQuery)) return fromQuery;

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  const parts = parsed.pathname.split('/').filter(Boolean);
  if (host === 'youtu.be') {
    return parts.find((part) => YOUTUBE_ID_RE.test(part)) || '';
  }

  const labeled = parsed.pathname.match(/\/(?:embed|shorts|live|v|e|watch)\/([\w-]{11})/);
  return labeled?.[1] || '';
}

export function isYouTubeShortsUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const parsed = parseAbsoluteUrl(url.trim());
  return parsed ? /\/shorts\//i.test(parsed.pathname) : /\/shorts\//i.test(url);
}

export function youtubePosterUrl(url: string | null | undefined): string {
  const id = parseYouTubeId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : '';
}

/** Stored cover, or a YouTube poster derived from the watch/embed URL. */
export function deriveVideoThumbnailUrl(video: {
  thumbnail_url?: string | null;
  video_url?: string | null;
  embed_url?: string | null;
}): string {
  const stored = (video.thumbnail_url || '').trim();
  if (stored) return stored;
  return youtubePosterUrl(video.video_url) || youtubePosterUrl(video.embed_url);
}

export function buildEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  const youtubeId = parseYouTubeId(url);
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}`;
  try {
    const u = parseAbsoluteUrl(url.trim());
    if (!u) return '';
    const host = u.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'vimeo.com' || host.endsWith('.vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
      return id ? `https://player.vimeo.com/video/${id}` : '';
    }
  } catch {
    return '';
  }
  return '';
}

export function getVideoPlayback(video: {
  source_type: VideoSourceType;
  video_url?: string | null;
  embed_url?: string | null;
}): { kind: 'embed' | 'video' | 'missing'; src: string } {
  const derivedFromVideoUrl = buildEmbedUrl(video.video_url);
  if (video.source_type === 'embed' || derivedFromVideoUrl) {
    const src = video.embed_url || derivedFromVideoUrl || buildEmbedUrl(video.embed_url);
    if (src) return { kind: 'embed', src };
  }
  if ((video.source_type === 'upload' || video.source_type === 'direct') && video.video_url) {
    return { kind: 'video', src: video.video_url };
  }
  if (isDirectVideoUrl(video.video_url)) {
    return { kind: 'video', src: video.video_url || '' };
  }
  const embedSrc = video.embed_url || buildEmbedUrl(video.embed_url);
  return embedSrc ? { kind: 'embed', src: embedSrc } : { kind: 'missing', src: '' };
}

/**
 * Reads the `home_featured_video` site setting. Stored as `{"slug":"..."}`, but
 * tolerates a bare JSON string or a raw slug so hand-edited rows still work.
 */
export function parseFeaturedVideoSlug(raw: string | null | undefined): string {
  const trimmed = (raw || '').trim();
  if (!trimmed) return '';
  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === 'string') return parsed.trim();
    if (parsed && typeof parsed === 'object' && typeof (parsed as { slug?: unknown }).slug === 'string') {
      return ((parsed as { slug: string }).slug || '').trim();
    }
    return '';
  } catch {
    return trimmed.replace(/^"|"$/g, '');
  }
}

export function localizeVideo(post: VideoPost, lang: string): LocalizedVideoPost {
  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    source_type: normalizeVideoSourceType(post.source_type),
    video_url: post.video_url ?? null,
    embed_url: post.embed_url ?? null,
    thumbnail_url: deriveVideoThumbnailUrl(post) || null,
    category: post.category ?? null,
    tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
    duration_seconds: post.duration_seconds ?? null,
    published_at: post.published_at ?? null,
    updated_at: post.updated_at ?? null,
    title: pickLocalized(post.title, lang),
    excerpt: pickLocalized(post.excerpt, lang),
    body: pickLocalized(post.body, lang),
    seo_title: pickLocalized(post.seo_title, lang) || undefined,
    seo_description: pickLocalized(post.seo_description, lang) || undefined,
    search_text: rawVideoSearchText(post),
  };
}

export function toVideoListItem(post: VideoPost, lang: string): VideoListItem {
  return {
    id: post.id,
    slug: post.slug,
    source_type: normalizeVideoSourceType(post.source_type),
    video_url: post.video_url ?? null,
    embed_url: post.embed_url ?? null,
    thumbnail_url: deriveVideoThumbnailUrl(post) || null,
    category: post.category ?? null,
    tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
    duration_seconds: post.duration_seconds ?? null,
    published_at: post.published_at ?? null,
    title: pickLocalized(post.title, lang),
    excerpt: pickLocalized(post.excerpt, lang),
    search_text: rawVideoSearchText(post),
  };
}

function textFromLocalized(field: LocalizedMap | string | null | undefined): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return Object.values(field).filter(Boolean).join(' ');
}

function tokenize(...values: Array<string | null | undefined>): Set<string> {
  const words = values
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, ' ')
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return new Set(words);
}

const STOPWORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'from',
  'into',
  'our',
  'your',
  'that',
  'this',
  'mirror',
  'mirrors',
  'video',
  'videos',
  'bolen',
]);

function overlapScore(a: Set<string>, b: Set<string>): number {
  let score = 0;
  a.forEach((token) => {
    if (b.has(token)) score += 1;
  });
  return score;
}

function scoreProductForVideo(video: LocalizedVideoPost | VideoListItem, product: ProductRecommendationInput): number {
  const videoTokens = tokenize(video.title, video.excerpt, video.category || '', video.search_text || '', ...(video.tags || []));
  const productTokens = tokenize(product.title, product.description || '', product.category || '');
  let score = overlapScore(videoTokens, productTokens);
  if (video.category && product.category && video.category.toLowerCase() === product.category.toLowerCase()) {
    score += 8;
  }
  const tagText = (video.tags || []).join(' ').toLowerCase();
  if (product.category && tagText.includes(product.category.toLowerCase())) score += 4;
  if (product.title && tagText && tokenize(product.title).size > 0) {
    score += overlapScore(tokenize(product.title), tokenize(tagText)) * 2;
  }
  return score;
}

function scoreVideoForProduct(video: VideoListItem, product: ProductRecommendationInput): number {
  return scoreProductForVideo(video, product);
}

export function recommendProductsForVideo<T extends ProductRecommendationInput>(
  video: LocalizedVideoPost | VideoListItem,
  products: T[],
  limit = 4
): T[] {
  return products
    .map((product, index) => ({ product, score: scoreProductForVideo(video, product), index }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.product);
}

export function recommendVideosForProduct<T extends VideoListItem>(
  product: ProductRecommendationInput,
  videos: T[],
  limit = 3
): T[] {
  return videos
    .map((video, index) => ({ video, score: scoreVideoForProduct(video, product), index }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((item) => item.video);
}

export function rawVideoSearchText(video: VideoPost): string {
  return [
    textFromLocalized(video.title),
    textFromLocalized(video.excerpt),
    textFromLocalized(video.body),
    video.category || '',
    ...(video.tags || []),
  ].join(' ');
}
