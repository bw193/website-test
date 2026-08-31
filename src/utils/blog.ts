// Pure helpers for the Journal. Safe to import from both the React app and the
// browserless prerender script (no React, no DOM, no Node-only APIs).

import type {
  BlogLang,
  BlogPost,
  BlogListItem,
  LocalizedBlogPost,
  LocalizedMap,
} from '../types/blog';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Return a renderable cover URL, or null for blank/invalid legacy values.
 * A missing cover is a supported editorial choice and must not be replaced by
 * a generic visible image.
 */
export function normalizeBlogCover(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return HTTP_PROTOCOLS.has(url.protocol) ? trimmed : null;
  } catch {
    return null;
  }
}

/** Locales with genuine article content, used by hreflang and the sitemap. */
export function getBlogAvailableLanguages(post: Pick<BlogPost, 'title' | 'body'>): BlogLang[] {
  return (['en', 'zh', 'es', 'fr', 'de', 'it'] as const).filter((lang) => {
    const title = post.title?.[lang]?.trim();
    const body = post.body?.[lang]?.trim();
    return Boolean(title && body);
  });
}

export function hasBlogTranslation(post: Pick<BlogPost, 'title' | 'body'>, lang: string): boolean {
  return getBlogAvailableLanguages(post).includes(lang as BlogLang);
}

/** Returns the value for `lang`, falling back to English, then empty string. */
export function pickLocalized(field: LocalizedMap | null | undefined, lang: string): string {
  if (!field) return '';
  const v = field[lang as keyof LocalizedMap];
  if (v && v.trim()) return v;
  return field.en ?? '';
}

const WORDS_PER_MINUTE = 200;

/** Rough reading-time estimate from a markdown body (min 1 minute). */
export function estimateReadingMinutes(markdown: string | null | undefined): number {
  if (!markdown) return 1;
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/** Locale-aware long date (e.g. "May 27, 2026"); falls back to ISO date. */
export function formatBlogDate(date: string | null | undefined, lang: string): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return d.toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return d.toISOString().split('T')[0];
  }
}

/** Flatten a raw post to a single language for rendering / island embedding. */
export function localizePost(post: BlogPost, lang: string): LocalizedBlogPost {
  const body = pickLocalized(post.body, lang);
  return {
    id: post.id,
    slug: post.slug,
    category: post.category ?? null,
    cover_image: normalizeBlogCover(post.cover_image),
    author: post.author || 'BOLEN Editorial',
    reading_minutes: post.reading_minutes ?? estimateReadingMinutes(body),
    tags: post.tags ?? null,
    published_at: post.published_at ?? null,
    updated_at: post.updated_at ?? null,
    product_ids: post.product_ids ?? [],
    title: pickLocalized(post.title, lang),
    excerpt: pickLocalized(post.excerpt, lang),
    body,
    seo_title: pickLocalized(post.seo_title, lang) || undefined,
    seo_description: pickLocalized(post.seo_description, lang) || undefined,
    available_languages: getBlogAvailableLanguages(post),
  };
}

/** Flatten a raw post to the lightweight card model for the index list. */
export function toListItem(post: BlogPost, lang: string): BlogListItem {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category ?? null,
    cover_image: normalizeBlogCover(post.cover_image),
    author: post.author || 'BOLEN Editorial',
    reading_minutes: post.reading_minutes ?? estimateReadingMinutes(pickLocalized(post.body, lang)),
    published_at: post.published_at ?? null,
    title: pickLocalized(post.title, lang),
    excerpt: pickLocalized(post.excerpt, lang),
  };
}
