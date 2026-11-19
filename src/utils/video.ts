import type { LocalizedMap } from '../types/blog';
import type {
  LocalizedVideoPost,
  ProductRecommendationInput,
  VideoListItem,
  VideoPost,
  VideoSourceType,
} from '../types/video';
import { pickLocalized } from './blog';
import { toMediaUrl } from './media';

const DIRECT_VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

/** Poster shown when a video row has no thumbnail of its own. */
export const FALLBACK_VIDEO_THUMB =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

/** Columns every video list/card needs — the heavy JSONB body stays out. */
export const VIDEO_LIST_COLUMNS =
  'id, slug, source_type, video_url, embed_url, thumbnail_url, category, tags, duration_seconds, published_at, title, excerpt';

const VIDEO_CATEGORY_LABELS: Record<string, Record<string, string>> = {
  'Factory Tour': {
    en: 'Factory Tour',
    zh: '工厂实拍',
    es: 'Recorrido de fábrica',
    fr: "Visite d'usine",
    de: 'Werksrundgang',
    it: 'Tour della fabbrica',
  },
  Factory: {
    en: 'Factory',
    zh: '工厂实拍',
    es: 'Recorrido de fábrica',
    fr: "Visite d'usine",
    de: 'Werksrundgang',
    it: 'Tour della fabbrica',
  },
  'Product Demo': {
    en: 'Product Demo',
    zh: '产品演示',
    es: 'Demostración de producto',
    fr: 'Démonstration produit',
    de: 'Produktdemo',
    it: 'Demo prodotto',
  },
  Installation: {
    en: 'Installation',
    zh: '安装演示',
    es: 'Instalación',
    fr: 'Installation',
    de: 'Installation',
    it: 'Installazione',
  },
  'Smart Features': {
    en: 'Smart Features',
    zh: '智能功能',
    es: 'Funciones inteligentes',
    fr: 'Fonctions intelligentes',
    de: 'Smart-Funktionen',
    it: 'Funzioni smart',
  },
  Technology: {
    en: 'Technology',
    zh: '技术解析',
    es: 'Tecnología',
    fr: 'Technologie',
    de: 'Technologie',
    it: 'Tecnologia',
  },
  'Quality Control': {
    en: 'Quality Control',
    zh: '质量控制',
    es: 'Control de calidad',
    fr: 'Contrôle qualité',
    de: 'Qualitätskontrolle',
    it: 'Controllo qualità',
  },
};

const VIDEO_SUMMARY_TEMPLATES: Record<string, (title: string) => string> = {
  en: (title) => `${title} — product demonstration and factory video from BOLEN Mirror.`,
  zh: (title) => `${title} — BOLEN 镜业工厂实拍与产品功能演示视频。`,
  es: (title) => `${title} — demostración de producto y video de fábrica de BOLEN Mirror.`,
  fr: (title) => `${title} — démonstration produit et vidéo d'usine par BOLEN Mirror.`,
  de: (title) => `${title} — Produktvorführung und Werksvideo von BOLEN Mirror.`,
  it: (title) => `${title} — dimostrazione prodotto e video di fabbrica di BOLEN Mirror.`,
};

/** Localizes known English video category names for `VideoObject.genre` and UI fallbacks. */
export function localizeVideoCategory(category: string | null | undefined, lang: string): string {
  const trimmed = (category || '').trim();
  if (!trimmed) return '';
  const entry = VIDEO_CATEGORY_LABELS[trimmed];
  if (!entry) return trimmed;
  return entry[lang] || entry.en || trimmed;
}

function stripMarkdownText(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[`*_>#|~]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** True when a text string is empty or looks like a bare SKU/model code (< 15 chars). */
export function isBareModelCodeDescription(value: string | null | undefined): boolean {
  const trimmed = (value || '').trim();
  if (!trimmed) return true;
  if (trimmed.length < 15) return true;
  return /^[A-Z0-9_-]{2,24}$/i.test(trimmed);
}

/**
 * Ensures video descriptions / excerpts never emit bare model codes like `"1016"`
 * or `"CTL0075B"`, falling back to clean body prose or a localized title summary.
 */
export function resolveVideoDescription(
  video: { title: string; excerpt?: string | null; body?: string | null },
  lang: string
): string {
  const excerpt = (video.excerpt || '').trim();
  if (!isBareModelCodeDescription(excerpt)) return excerpt;

  const cleanBody = video.body ? stripMarkdownText(video.body) : '';
  if (cleanBody.length >= 15) {
    return cleanBody.length > 180 ? `${cleanBody.slice(0, 177).trimEnd()}...` : cleanBody;
  }

  const cleanTitle = (video.title || '').trim();
  const buildFallback = VIDEO_SUMMARY_TEMPLATES[lang] || VIDEO_SUMMARY_TEMPLATES.en;
  return cleanTitle ? buildFallback(cleanTitle) : 'BOLEN Mirror product and factory video.';
}

/**
 * Ceiling on what the homepage's background video may stream, deliberately set
 * high enough to admit the ~30MB factory film the site owner wants as the
 * backdrop.
 */
export const AMBIENT_CLIP_BUDGET_BYTES = 32 * 1024 * 1024;
/** Loop length when an excerpt is worth taking. */
export const AMBIENT_CLIP_PREFERRED_SECONDS = 12;
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

export function planAmbientClip(
  totalBytes: number | null,
  durationSeconds: number | null | undefined
): AmbientClipPlan | null {
  if (!durationSeconds || durationSeconds <= 0) {
    if (totalBytes !== null && totalBytes > AMBIENT_CLIP_BUDGET_BYTES) return null;
    return { start: 0, seconds: 0, full: true, bytes: totalBytes };
  }

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
  const estimatedBytes = Math.min(totalBytes, bytesPerSecond * AMBIENT_READAHEAD_SECONDS);
  if (estimatedBytes > AMBIENT_CLIP_BUDGET_BYTES) return null;

  if (durationSeconds <= AMBIENT_READAHEAD_SECONDS) {
    return { start: 0, seconds: durationSeconds, full: true, bytes: totalBytes };
  }
  const seconds = AMBIENT_CLIP_PREFERRED_SECONDS;
  const start = Math.max(0, Math.min(durationSeconds * 0.2, durationSeconds - seconds));
  return { start, seconds, full: false, bytes: estimatedBytes };
}

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

/** ISO 8601 duration (PT1M30S) for schema.org `duration` and `<time dateTime>`. */
export function toIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}

/** MIME type for a direct media URL — used for `og:video:type` and `<source type>`. */
export function videoMimeType(url: string | null | undefined): string {
  const match = (url || '').match(DIRECT_VIDEO_RE);
  switch ((match?.[1] || '').toLowerCase()) {
    case 'mp4':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'ogg':
      return 'video/ogg';
    case 'mov':
      return 'video/quicktime';
    default:
      return '';
  }
}

/**
 * Turns a stored embed URL into the one the player iframe should load. YouTube
 * is moved to the privacy-enhanced youtube-nocookie host, and both providers get
 * `autoplay=1` when requested.
 */
export function buildPlaybackEmbedSrc(src: string, options: { autoplay?: boolean } = {}): string {
  const parsed = parseAbsoluteUrl(src);
  if (!parsed) return src;
  const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
  const isYouTube = host === 'youtube.com' || host === 'youtube-nocookie.com' || host.endsWith('.youtube.com');
  const isVimeo = host === 'player.vimeo.com' || host.endsWith('.vimeo.com');
  if (isYouTube) {
    parsed.hostname = 'www.youtube-nocookie.com';
    parsed.searchParams.set('rel', '0');
    parsed.searchParams.set('playsinline', '1');
  }
  if ((isYouTube || isVimeo) && options.autoplay) {
    parsed.searchParams.set('autoplay', '1');
  }
  return parsed.toString();
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
  if (stored) return toMediaUrl(stored);
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
    return { kind: 'video', src: toMediaUrl(video.video_url) };
  }
  if (isDirectVideoUrl(video.video_url)) {
    return { kind: 'video', src: toMediaUrl(video.video_url || '') };
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
  const title = pickLocalized(post.title, lang);
  const rawExcerpt = pickLocalized(post.excerpt, lang);
  const body = pickLocalized(post.body, lang);
  const rawSeoDesc = pickLocalized(post.seo_description, lang);
  const thumb = deriveVideoThumbnailUrl(post);
  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    source_type: normalizeVideoSourceType(post.source_type),
    video_url: post.video_url ? toMediaUrl(post.video_url) : null,
    embed_url: post.embed_url ?? null,
    thumbnail_url: thumb || null,
    category: post.category ?? null,
    tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
    duration_seconds: post.duration_seconds ?? null,
    published_at: post.published_at ?? null,
    updated_at: post.updated_at ?? null,
    title,
    excerpt: resolveVideoDescription({ title, excerpt: rawExcerpt, body }, lang),
    body,
    seo_title: pickLocalized(post.seo_title, lang) || undefined,
    seo_description: !isBareModelCodeDescription(rawSeoDesc) ? rawSeoDesc : undefined,
    search_text: rawVideoSearchText(post),
  };
}

export function toVideoListItem(post: VideoPost, lang: string): VideoListItem {
  const title = pickLocalized(post.title, lang);
  const rawExcerpt = pickLocalized(post.excerpt, lang);
  const body = pickLocalized(post.body, lang);
  const thumb = deriveVideoThumbnailUrl(post);
  return {
    id: post.id,
    slug: post.slug,
    source_type: normalizeVideoSourceType(post.source_type),
    video_url: post.video_url ? toMediaUrl(post.video_url) : null,
    embed_url: post.embed_url ?? null,
    thumbnail_url: thumb || null,
    category: post.category ?? null,
    tags: Array.isArray(post.tags) ? post.tags.filter(Boolean) : [],
    duration_seconds: post.duration_seconds ?? null,
    published_at: post.published_at ?? null,
    title,
    excerpt: resolveVideoDescription({ title, excerpt: rawExcerpt, body }, lang),
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
