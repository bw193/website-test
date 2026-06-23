import type { BlogLang, LocalizedMap } from './blog';

export const VIDEO_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
export type VideoLang = BlogLang;

export type VideoStatus = 'draft' | 'published';
export type VideoSourceType = 'embed' | 'upload' | 'direct';

export interface VideoPost {
  id: string;
  slug: string;
  status: VideoStatus;
  source_type: VideoSourceType;
  video_url?: string | null;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  tags?: string[] | null;
  duration_seconds?: number | null;
  title: LocalizedMap;
  excerpt?: LocalizedMap | null;
  body?: LocalizedMap | null;
  seo_title?: LocalizedMap | null;
  seo_description?: LocalizedMap | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LocalizedVideoPost {
  id: string;
  slug: string;
  status: VideoStatus;
  source_type: VideoSourceType;
  video_url?: string | null;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  tags: string[];
  duration_seconds?: number | null;
  published_at?: string | null;
  updated_at?: string | null;
  title: string;
  excerpt: string;
  body: string;
  seo_title?: string;
  seo_description?: string;
  search_text?: string;
}

export interface VideoListItem {
  id: string;
  slug: string;
  source_type: VideoSourceType;
  video_url?: string | null;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  tags: string[];
  duration_seconds?: number | null;
  published_at?: string | null;
  title: string;
  excerpt: string;
  search_text?: string;
}

export interface ProductRecommendationInput {
  id: string;
  title: string;
  description?: string | null;
  images?: string[] | null;
  category?: string | null;
  price_range?: string | null;
  msrp?: string | null;
}
