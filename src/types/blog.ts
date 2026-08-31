// Shared types for the Journal (blog). Stored in Supabase `blog_posts`, with
// localizable fields kept as per-language JSONB maps. English is the source of
// truth and the fallback for any language that has not been translated yet.

export const BLOG_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
export type BlogLang = (typeof BLOG_LANGUAGES)[number];

/** A per-language string map. `en` is the source of truth + fallback. */
export type LocalizedMap = Partial<Record<BlogLang, string>>;

export type BlogStatus = 'draft' | 'published';

/** Raw row shape as stored in / returned from Supabase `blog_posts`. */
export interface BlogPost {
  id: string;
  slug: string;
  status: BlogStatus;
  category?: string | null;
  cover_image?: string | null;
  author?: string | null;
  reading_minutes?: number | null;
  tags?: string[] | null;
  product_ids?: string[] | null;
  title: LocalizedMap;
  excerpt?: LocalizedMap | null;
  body?: LocalizedMap | null; // markdown per language
  seo_title?: LocalizedMap | null;
  seo_description?: LocalizedMap | null;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** A post flattened to a single language — the island payload + render model. */
export interface LocalizedBlogPost {
  id: string;
  slug: string;
  category?: string | null;
  cover_image?: string | null;
  author: string;
  reading_minutes: number;
  tags?: string[] | null;
  published_at?: string | null;
  updated_at?: string | null;
  product_ids: string[];
  title: string;
  excerpt: string;
  body: string; // markdown, already resolved for the active language
  seo_title?: string;
  seo_description?: string;
  /** Locales that contain both a real title and body (no English fallback). */
  available_languages: BlogLang[];
}

/** Lightweight, single-language card model used by the index list. */
export interface BlogListItem {
  id: string;
  slug: string;
  category?: string | null;
  cover_image?: string | null;
  author: string;
  reading_minutes: number;
  published_at?: string | null;
  title: string;
  excerpt: string;
}
