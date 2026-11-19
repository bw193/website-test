// Pure helpers for the Journal. Safe to import from both the React app and the
// browserless prerender script (no React, no DOM, no Node-only APIs).

import type {
  BlogLang,
  BlogPost,
  BlogListItem,
  LocalizedBlogPost,
  LocalizedMap,
} from '../types/blog';
import { MEDIA_PATH_PREFIX } from './media';

const HTTP_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Return a renderable cover URL, or null for blank/invalid legacy values.
 * A missing cover is a supported editorial choice on the visible page and is
 * given a site-asset fallback separately in BlogPosting structured data.
 */
export function normalizeBlogCover(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith(MEDIA_PATH_PREFIX)) return trimmed;
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

const LATIN_WORDS_PER_MINUTE = 200;
const CJK_CHARS_PER_MINUTE = 400;
const CJK_CHAR_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uac00-\ud7af]/g;
const LATIN_WORD_RE = /[A-Za-z0-9\u00C0-\u024F\u0400-\u04FF]+(?:['’-][A-Za-z0-9\u00C0-\u024F\u0400-\u04FF]+)*/g;

function stripMarkdownAndHtml(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```[^\n]*\n?|```/g, ' '))
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, ' $1 ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/^\s*\|?(?:\s*:?-+:?\s*\|)+\s*$/gm, ' ')
    .replace(/[#*_>~|`-]+/g, ' ')
    .replace(/&(?:nbsp|amp|lt|gt|quot|#39);/gi, ' ');
}

/**
 * Reading-time estimate (min 1 minute) that strips Markdown/HTML syntax and
 * counts both Latin words (~200 wpm) and CJK characters (~400 cpm).
 */
export function estimateReadingMinutes(markdown: string | null | undefined): number {
  if (!markdown) return 1;
  const cleaned = stripMarkdownAndHtml(markdown).trim();
  if (!cleaned) return 1;

  const cjkMatches = cleaned.match(CJK_CHAR_RE);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  const withoutCjk = cleaned.replace(CJK_CHAR_RE, ' ').replace(/[\u3000-\u303f\uff00-\uffef]/g, ' ');
  const latinMatches = withoutCjk.match(LATIN_WORD_RE);
  const latinCount = latinMatches ? latinMatches.length : 0;

  const minutes = latinCount / LATIN_WORDS_PER_MINUTE + cjkCount / CJK_CHARS_PER_MINUTE;
  return Math.max(1, Math.round(minutes));
}

function resolveReadingMinutes(body: string, storedReadingMinutes: number | null | undefined): number {
  if (body && body.trim().length > 0) {
    return estimateReadingMinutes(body);
  }
  return storedReadingMinutes && storedReadingMinutes >= 1 ? storedReadingMinutes : 1;
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
    reading_minutes: resolveReadingMinutes(body, post.reading_minutes),
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
  const body = pickLocalized(post.body, lang);
  return {
    id: post.id,
    slug: post.slug,
    category: post.category ?? null,
    cover_image: normalizeBlogCover(post.cover_image),
    author: post.author || 'BOLEN Editorial',
    reading_minutes: resolveReadingMinutes(body, post.reading_minutes),
    published_at: post.published_at ?? null,
    title: pickLocalized(post.title, lang),
    excerpt: pickLocalized(post.excerpt, lang),
  };
}
