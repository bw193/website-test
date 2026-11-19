import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import 'dotenv/config';
import type { BlogPost, LocalizedMap } from '../src/types/blog';
import type { VideoSourceType } from '../src/types/video';
import { getBlogAvailableLanguages, pickLocalized } from '../src/utils/blog';
import { deriveVideoThumbnailUrl, getVideoPlayback, normalizeVideoSourceType } from '../src/utils/video';
import { toMediaUrl } from '../src/utils/media';
import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages';
import { productDetailPath, productAlternatePaths } from '../src/utils/productRoutes';
import {
  INSIGHTS_PATH,
  LEGACY_BLOG_PATH,
  insightDetailPath,
} from '../src/data/insights';
import { TERMS_PATH } from '../src/data/termsCopy';
import {
  categoryPublicPages,
  DEFAULT_PRODUCT_CATEGORIES,
  parseCategoriesSetting,
} from '../src/utils/catalogCategory';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const DOMAIN = 'https://bolenmirror.com';
const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
const today = new Date().toISOString().split('T')[0];
const PAGE_SIZE = 500;

type SitemapPage = {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod: string;
  videoByLang?: Record<string, string | null>;
  availableLanguages?: readonly string[];
  pathsByLang?: Record<string, string>;
};

type SitemapVideoPost = {
  slug: string;
  source_type: VideoSourceType | string | null;
  video_url?: string | null;
  embed_url?: string | null;
  thumbnail_url?: string | null;
  category?: string | null;
  tags?: string[] | null;
  duration_seconds?: number | null;
  title?: LocalizedMap | null;
  excerpt?: LocalizedMap | null;
  body?: LocalizedMap | null;
  seo_title?: LocalizedMap | null;
  seo_description?: LocalizedMap | null;
  updated_at?: string | null;
  published_at?: string | null;
  created_at?: string | null;
};

// Google caps <video:tag> at 32 per video and <video:category> at 256 chars.
const MAX_VIDEO_TAGS = 32;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isHttpUrl(value: string | null | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeText(value: string): string {
  return value
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/[`*_>#|~-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateDescription(value: string): string {
  const normalized = normalizeText(value);
  return normalized.length > 2048 ? `${normalized.slice(0, 2045).trimEnd()}...` : normalized;
}

function toW3cDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

export function getVideoAvailableLanguages(
  video: Pick<SitemapVideoPost, 'title' | 'body' | 'excerpt'>
): string[] {
  return LANGUAGES.filter((lang) => {
    const title = video.title?.[lang]?.trim();
    const content = video.body?.[lang]?.trim() || video.excerpt?.[lang]?.trim();
    return Boolean(title && content);
  });
}

export function hasVideoTranslation(
  video: Pick<SitemapVideoPost, 'title' | 'body' | 'excerpt'>,
  lang: string
): boolean {
  return getVideoAvailableLanguages(video).includes(lang);
}

function buildVideoBlock(video: SitemapVideoPost, lang: string): string | null {
  const playback = getVideoPlayback({
    source_type: normalizeVideoSourceType(video.source_type),
    video_url: video.video_url,
    embed_url: video.embed_url,
  });
  const thumbnail = deriveVideoThumbnailUrl(video);
  // The site's own /media/ copy: Supabase serves the original as noindex.
  const thumbnailLoc = isHttpUrl(thumbnail) ? toMediaUrl(thumbnail) : '';
  const contentLoc = playback.kind === 'video' && isHttpUrl(playback.src) ? toMediaUrl(playback.src) : '';
  const playbackTag =
    playback.kind === 'video' && isHttpUrl(contentLoc)
      ? `      <video:content_loc>${escapeXml(contentLoc)}</video:content_loc>`
      : playback.kind === 'embed' && isHttpUrl(playback.src)
        ? `      <video:player_loc>${escapeXml(playback.src)}</video:player_loc>`
        : '';

  if (!thumbnailLoc || !playbackTag) {
    console.warn(
      `[sitemap] Skipping video metadata for ${video.slug}: missing ${!thumbnailLoc ? 'thumbnail_url' : 'video source URL'}.`
    );
    return null;
  }

  const fallbackTitle = normalizeText(video.slug.replace(/-/g, ' '));
  const title = normalizeText(pickLocalized(video.seo_title, lang) || pickLocalized(video.title, lang) || fallbackTitle);
  const rawDesc = normalizeText(
    pickLocalized(video.seo_description, lang) ||
      pickLocalized(video.excerpt, lang) ||
      pickLocalized(video.body, lang) ||
      ''
  );
  const description = truncateDescription(rawDesc.length >= 15 ? rawDesc : title);
  const duration =
    typeof video.duration_seconds === 'number' && video.duration_seconds >= 1 && video.duration_seconds <= 28800
      ? `      <video:duration>${Math.round(video.duration_seconds)}</video:duration>`
      : '';
  const publicationDate = toW3cDate(video.published_at);
  // Google allows up to 32 <video:tag> entries; the category doubles as a tag
  // since the dedicated <video:category> element was retired.
  const tags = Array.from(
    new Set([video.category || '', ...(video.tags || [])].map((tag) => normalizeText(tag)).filter(Boolean))
  ).slice(0, MAX_VIDEO_TAGS);

  return [
    '    <video:video>',
    `      <video:thumbnail_loc>${escapeXml(thumbnailLoc)}</video:thumbnail_loc>`,
    `      <video:title>${escapeXml(title)}</video:title>`,
    `      <video:description>${escapeXml(description)}</video:description>`,
    playbackTag,
    duration,
    publicationDate ? `      <video:publication_date>${escapeXml(publicationDate)}</video:publication_date>` : '',
    '      <video:family_friendly>yes</video:family_friendly>',
    ...tags.map((tag) => `      <video:tag>${escapeXml(tag)}</video:tag>`),
    '    </video:video>',
  ]
    .filter(Boolean)
    .join('\n');
}

function buildUrlEntry(
  pagePath: string,
  lastmod: string,
  changefreq: string,
  priority: string,
  lang: string,
  videoBlock?: string | null,
  alternateLanguages: readonly string[] = LANGUAGES,
  pathsByLang?: Record<string, string>,
): string {
  // Trailing slash matches Cloudflare Pages directory-style serving and the
  // canonical/hreflang URLs the prerender emits, so sitemap URLs resolve
  // 200 directly without a slash-redirect hop.
  const slug = pagePath === '/' ? '' : pagePath;
  const hreflangs = alternateLanguages.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${DOMAIN}/${l}${pathsByLang?.[l] ?? slug}/" />`
  ).join('\n');
  const xDefault = alternateLanguages.includes('en')
    ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en${pathsByLang?.en ?? slug}/" />`
    : '';

  return `  <url>
    <loc>${DOMAIN}/${lang}${pathsByLang?.[lang] ?? slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${videoBlock ? `${videoBlock}\n` : ''}${hreflangs}
${xDefault}
  </url>`;
}

async function fetchPaginated<T>(
  queryPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  label: string,
  fatalOnFirstPage = false
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await queryPage(from, from + PAGE_SIZE - 1);
    if (error) {
      if (fatalOnFirstPage && from === 0) {
        console.error(`Error fetching ${label}:`, error.message);
        process.exit(1);
      }
      console.warn(`Could not fetch ${label} for sitemap:`, error.message);
      return rows;
    }
    const batch = data || [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return rows;
}

async function generateSitemap() {
  const privacyModuleSpec = '../src/data/' + 'privacyCopy';
  const privacyMod = (await import(privacyModuleSpec).catch(() => null)) as null | {
    PRIVACY_PATH?: string;
  };

  // Static pages (including Terms and optional Privacy Policy)
  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/products', changefreq: 'weekly', priority: '0.9' },
    { loc: '/rfq', changefreq: 'monthly', priority: '0.8' },
    { loc: '/our-story', changefreq: 'monthly', priority: '0.7' },
    { loc: INSIGHTS_PATH, changefreq: 'weekly', priority: '0.7' },
    { loc: '/videos', changefreq: 'weekly', priority: '0.7' },
    { loc: TERMS_PATH, changefreq: 'yearly', priority: '0.4' },
    ...(typeof privacyMod?.PRIVACY_PATH === 'string'
      ? [{ loc: privacyMod.PRIVACY_PATH, changefreq: 'yearly', priority: '0.4' }]
      : []),
  ];

  // Fetch products with pagination so growth past 1,000 rows never truncates silently
  const products = await fetchPaginated<{
    id: string;
    title: string;
    category?: string | null;
    updated_at?: string | null;
    created_at?: string | null;
  }>(
    (from, to) =>
      supabase
        .from('products')
        .select('id, title, category, updated_at, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to),
    'products',
    true
  );

  const productPages = products.map((p) => {
    const lastmod = (p.updated_at || p.created_at || today).split('T')[0];
    return {
      loc: productDetailPath(p, 'en'),
      pathsByLang: productAlternatePaths(p),
      changefreq: 'weekly',
      priority: '0.8',
      lastmod,
    };
  });

  const { data: categorySetting, error: categoryError } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'categories')
    .single();

  if (categoryError) {
    console.warn('Could not fetch catalog categories for sitemap:', categoryError.message);
  }

  const parsedCategories = parseCategoriesSetting(categorySetting?.value);
  const categoryPages = categoryPublicPages(
    parsedCategories.length > 0 ? parsedCategories : [...DEFAULT_PRODUCT_CATEGORIES],
    today
  ).map((page) => ({
    loc: page.path,
    changefreq: page.changefreq,
    priority: page.priority,
    lastmod: page.lastmod,
  }));

  // Published Journal (blog) posts (paginated)
  type SitemapBlogPost = Pick<BlogPost, 'slug' | 'title' | 'body' | 'updated_at' | 'published_at' | 'created_at'>;
  const typedBlogPosts = await fetchPaginated<SitemapBlogPost>(
    (from, to) =>
      supabase
        .from('blog_posts')
        .select('slug, title, body, updated_at, published_at, created_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to),
    'blog posts'
  );

  const blogPostPages: SitemapPage[] = typedBlogPosts
    .map((p) => {
      const lastmod = (p.updated_at || p.published_at || p.created_at || today).split('T')[0];
      return {
        loc: insightDetailPath(p.slug),
        changefreq: 'monthly',
        priority: '0.7',
        lastmod,
        availableLanguages: getBlogAvailableLanguages(p),
      };
    })
    .filter((page) => (page.availableLanguages?.length ?? 0) > 0);

  // Published videos (paginated), guarded by hasVideoTranslation per locale
  const typedVideoPosts = await fetchPaginated<SitemapVideoPost>(
    (from, to) =>
      supabase
        .from('videos')
        .select(
          'slug, source_type, video_url, embed_url, thumbnail_url, category, tags, duration_seconds, title, excerpt, body, seo_title, seo_description, updated_at, published_at, created_at'
        )
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(from, to),
    'videos'
  );

  const videoPostPages: SitemapPage[] = typedVideoPosts
    .map((p) => {
      const availableLanguages = getVideoAvailableLanguages(p);
      const lastmod = (p.updated_at || p.published_at || p.created_at || today).split('T')[0];
      const videoByLang = Object.fromEntries(
        availableLanguages.map((lang) => [lang, buildVideoBlock(p, lang)])
      );
      return {
        loc: `/videos/${p.slug}`,
        changefreq: 'monthly',
        priority: '0.7',
        lastmod,
        videoByLang,
        availableLanguages,
      };
    })
    .filter((page) => (page.availableLanguages?.length ?? 0) > 0);

  const solutionPages: SitemapPage[] = [
    { loc: '/solutions', changefreq: 'monthly', priority: '0.9', lastmod: today },
    ...SEO_LANDING_PAGES.map((page) => ({
      loc: `/solutions/${page.slug}`,
      changefreq: 'monthly',
      priority: '0.9',
      lastmod: today,
    })),
  ];

  const allPages: SitemapPage[] = [
    ...staticPages.map((p) => ({ ...p, lastmod: today })),
    ...solutionPages,
    ...productPages,
    ...categoryPages,
    ...blogPostPages,
    ...videoPostPages,
  ];

  // Most routes exist in every locale. Insight articles and videos only emit
  // URLs and reciprocal hreflang entries for languages with real translations.
  const urls = allPages.flatMap((page) => {
    const availableLanguages = page.availableLanguages || LANGUAGES;
    return availableLanguages.map((lang) =>
      buildUrlEntry(
        page.loc,
        page.lastmod,
        page.changefreq,
        page.priority,
        lang,
        page.videoByLang?.[lang],
        availableLanguages,
        page.pathsByLang,
      )
    );
  });
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join('\n')}
</urlset>
`;

  // Write to both public/ (for dev) and dist/ (for production)
  const publicPath = resolve(__dirname, '..', 'public', 'sitemap.xml');
  const distPath = resolve(__dirname, '..', 'dist', 'sitemap.xml');

  writeFileSync(publicPath, sitemap, 'utf-8');
  console.log(`Sitemap written to ${publicPath}`);

  try {
    writeFileSync(distPath, sitemap, 'utf-8');
    console.log(`Sitemap written to ${distPath}`);
  } catch {
    // dist/ may not exist yet during pre-build
  }

  // Direct untranslated article/video locales to a real localized version.
  try {
    const baseRedirectsPath = resolve(__dirname, '..', 'public', '_redirects');
    const distRedirectsPath = resolve(__dirname, '..', 'dist', '_redirects');
    const existingRedirects = (() => {
      try {
        return readFileSync(distRedirectsPath, 'utf-8');
      } catch {
        return readFileSync(baseRedirectsPath, 'utf-8');
      }
    })();
    const baseRedirects = existingRedirects
      .replace(/# BEGIN auto-uuid-redirects[\s\S]*?# END auto-uuid-redirects\s*/gu, '')
      .replace(
        /^# BEGIN generated untranslated Insight redirects[\s\S]*?# END generated untranslated Insight redirects\s*/u,
        ''
      )
      .replace(/\n# Generated fallbacks for untranslated Insight articles\.[\s\S]*$/u, '')
      .trimEnd();
    const articleRedirects = typedBlogPosts.flatMap((post) => {
      const available = getBlogAvailableLanguages(post);
      const fallbackLanguage = available.includes('en') ? 'en' : available[0];
      if (!fallbackLanguage) return [];
      return LANGUAGES.filter((lang) => !available.includes(lang as (typeof available)[number])).flatMap(
        (lang) => {
          const insightSource = `/${lang}${insightDetailPath(post.slug)}`;
          const legacySource = `/${lang}${LEGACY_BLOG_PATH}/${post.slug}`;
          const target = `/${fallbackLanguage}${insightDetailPath(post.slug)}/`;
          return [
            `${legacySource} ${target} 301`,
            `${legacySource}/ ${target} 301`,
            `${insightSource} ${target} 301`,
            `${insightSource}/ ${target} 301`,
          ];
        }
      );
    });
    const videoRedirects = typedVideoPosts.flatMap((video) => {
      if (!video.slug) return [];
      const available = getVideoAvailableLanguages(video);
      const fallbackLanguage = available.includes('en') ? 'en' : available[0];
      if (!fallbackLanguage) return [];
      return LANGUAGES.filter((lang) => !available.includes(lang)).flatMap((lang) => {
        const source = `/${lang}/videos/${video.slug}`;
        const target = `/${fallbackLanguage}/videos/${video.slug}/`;
        return [`${source} ${target} 301`, `${source}/ ${target} 301`];
      });
    });
    const translationRedirects = [...articleRedirects, ...videoRedirects];
    const redirectOutput = translationRedirects.length
      ? `# BEGIN generated untranslated Insight redirects\n${translationRedirects.join('\n')}\n# END generated untranslated Insight redirects\n\n${baseRedirects}\n`
      : `${baseRedirects}\n`;
    writeFileSync(distRedirectsPath, redirectOutput, 'utf-8');
    console.log(`Redirect map written to ${distRedirectsPath}`);
  } catch {
    // dist/ may not exist yet during pre-build
  }

  console.log(
    `Generated sitemap with ${allPages.length} multilingual page templates, including ${solutionPages.length} solution templates and ${categoryPages.length} catalog category templates`
  );
}

generateSitemap();
