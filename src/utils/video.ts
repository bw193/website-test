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

export function buildEmbedUrl(url: string | null | undefined): string {
  if (!url) return '';
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (host.endsWith('youtube.com')) {
      const id =
        u.searchParams.get('v') ||
        u.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/)?.[1] ||
        '';
      return id ? `https://www.youtube.com/embed/${id}` : '';
    }
    if (host.endsWith('vimeo.com')) {
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
  if (video.source_type === 'embed') {
    const embed = video.embed_url || buildEmbedUrl(video.video_url);
    if (embed) return { kind: 'embed', src: embed };
  }
  if ((video.source_type === 'upload' || video.source_type === 'direct') && video.video_url) {
    return { kind: 'video', src: video.video_url };
  }
  if (isDirectVideoUrl(video.video_url)) {
    return { kind: 'video', src: video.video_url || '' };
  }
  const embed = video.embed_url || buildEmbedUrl(video.video_url);
  return embed ? { kind: 'embed', src: embed } : { kind: 'missing', src: '' };
}

export function localizeVideo(post: VideoPost, lang: string): LocalizedVideoPost {
  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    source_type: normalizeVideoSourceType(post.source_type),
    video_url: post.video_url ?? null,
    embed_url: post.embed_url ?? null,
    thumbnail_url: post.thumbnail_url ?? null,
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
    thumbnail_url: post.thumbnail_url ?? null,
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
