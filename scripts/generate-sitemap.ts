import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import 'dotenv/config';
import type { BlogPost, LocalizedMap } from '../src/types/blog';
import type { VideoSourceType } from '../src/types/video';
import { getBlogAvailableLanguages, pickLocalized } from '../src/utils/blog';
import { deriveVideoThumbnailUrl, getVideoPlayback, normalizeVideoSourceType } from '../src/utils/video';
import { SEO_LANDING_PAGES } from '../src/data/seoLandingPages';
import {
  INSIGHTS_PATH,
  LEGACY_BLOG_PATH,
  insightDetailPath,
} from '../src/data/insights';
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
const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];
const today = new Date().toISOString().split('T')[0];

type SitemapPage = {
  loc: string;
  changefreq: string;
  priority: string;
  lastmod: string;
  videoByLang?: Record<string, string | null>;
  availableLanguages?: readonly string[];
};

type SitemapVideoPost = {
  slug: string;
  source_type: VideoSourceType | string | null;
  video_url?: string | null;
  embed_url?: string | null;
  thumbnail_url?: string | null;
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

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

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

function buildVideoBlock(video: SitemapVideoPost, lang: string): string | null {
  const playback = getVideoPlayback({
    source_type: normalizeVideoSourceType(video.source_type),
    video_url: video.video_url,
    embed_url: video.embed_url,
  });
  const thumbnail = deriveVideoThumbnailUrl(video);
  const thumbnailLoc = isHttpUrl(thumbnail) ? thumbnail : '';
  const playbackTag =
    playback.kind === 'video' && isHttpUrl(playback.src)
      ? `      <video:content_loc>${escapeXml(playback.src)}</video:content_loc>`
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
  const description = truncateDescription(
    pickLocalized(video.seo_description, lang) ||
      pickLocalized(video.excerpt, lang) ||
      pickLocalized(video.body, lang) ||
      title
  );
  const duration =
    typeof video.duration_seconds === 'number' && video.duration_seconds >= 1 && video.duration_seconds <= 28800
      ? `      <video:duration>${Math.round(video.duration_seconds)}</video:duration>`
      : '';
  const publicationDate = toW3cDate(video.published_at);

  return [
    '    <video:video>',
    `      <video:thumbnail_loc>${escapeXml(thumbnailLoc)}</video:thumbnail_loc>`,
    `      <video:title>${escapeXml(title)}</video:title>`,
    `      <video:description>${escapeXml(description)}</video:description>`,
    playbackTag,
    duration,
    publicationDate ? `      <video:publication_date>${escapeXml(publicationDate)}</video:publication_date>` : '',
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
  alternateLanguages: readonly string[] = LANGUAGES
): string {
  // Trailing slash matches Cloudflare Pages directory-style serving and the
  // canonical/hreflang URLs the prerender emits, so sitemap URLs resolve
  // 200 directly without a slash-redirect hop.
  const slug = pagePath === '/' ? '' : pagePath;
  const hreflangs = alternateLanguages.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${DOMAIN}/${l}${slug}/" />`
  ).join('\n');
  const xDefault = alternateLanguages.includes('en')
    ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en${slug}/" />`
    : '';

  return `  <url>
    <loc>${DOMAIN}/${lang}${slug}/</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${videoBlock ? `${videoBlock}\n` : ''}${hreflangs}
${xDefault}
  </url>`;
}

async function generateSitemap() {
  // Static pages
  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/products', changefreq: 'weekly', priority: '0.9' },
    { loc: '/rfq', changefreq: 'monthly', priority: '0.8' },
    { loc: '/our-story', changefreq: 'monthly', priority: '0.7' },
    { loc: INSIGHTS_PATH, changefreq: 'weekly', priority: '0.7' },
    { loc: '/videos', changefreq: 'weekly', priority: '0.7' },
  ];

  // Fetch products for dynamic pages
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, updated_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error.message);
    process.exit(1);
  }

  const productPages = (products || []).map((p) => {
    const slug = toSlug(p.title);
    const lastmod = (p.updated_at || p.created_at || today).split('T')[0];
    return {
      loc: `/products/${slug}`,
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

  // Published Journal (blog) posts. The table may not exist yet (SQL not run),
  // so a failure here just omits blog URLs instead of breaking the sitemap.
  const { data: blogPosts, error: blogError } = await supabase
    .from('blog_posts')
    .select('slug, title, body, updated_at, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (blogError) {
    console.warn('Could not fetch blog posts for sitemap:', blogError.message);
  }

  const typedBlogPosts = (blogPosts || []) as BlogPost[];
  const blogPostPages: SitemapPage[] = typedBlogPosts.map((p) => {
    const lastmod = (p.updated_at || p.published_at || p.created_at || today).split('T')[0];
    return {
      loc: insightDetailPath(p.slug),
      changefreq: 'monthly',
      priority: '0.7',
      lastmod,
      availableLanguages: getBlogAvailableLanguages(p),
    };
  });

  // Published videos. The table may not exist yet, so a failure omits video
  // URLs instead of breaking the sitemap before scripts/videos.sql is run.
  const { data: videoPosts, error: videoError } = await supabase
    .from('videos')
    .select(
      'slug, source_type, video_url, embed_url, thumbnail_url, duration_seconds, title, excerpt, body, seo_title, seo_description, updated_at, published_at, created_at'
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (videoError) {
    console.warn('Could not fetch videos for sitemap:', videoError.message);
  }

  const videoPostPages = ((videoPosts || []) as SitemapVideoPost[]).map((p) => {
    const lastmod = (p.updated_at || p.published_at || p.created_at || today).split('T')[0];
    const videoByLang = Object.fromEntries(LANGUAGES.map((lang) => [lang, buildVideoBlock(p, lang)]));
    return {
      loc: `/videos/${p.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod,
      videoByLang,
    };
  });

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

  // Most routes exist in every locale. Insight articles only emit URLs and
  // reciprocal hreflang entries for languages that contain a real translation.
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
        availableLanguages
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

  // Direct untranslated article locales to a real localized version. This is
  // written to dist after Vite copies public/_redirects, so production serves
  // an HTTP 301 instead of an English fallback with a false locale canonical.
  try {
    const baseRedirectsPath = resolve(__dirname, '..', 'public', '_redirects');
    const distRedirectsPath = resolve(__dirname, '..', 'dist', '_redirects');
    // prerender-static adds legacy product UUID redirects to dist/_redirects.
    // Preserve that generated map and only fall back to public/_redirects when
    // this script is run before a production build has created dist/.
    const existingRedirects = (() => {
      try {
        return readFileSync(distRedirectsPath, 'utf-8');
      } catch {
        return readFileSync(baseRedirectsPath, 'utf-8');
      }
    })();
    const baseRedirects = existingRedirects
      .replace(
        /^# BEGIN generated untranslated Insight redirects[\s\S]*?# END generated untranslated Insight redirects\s*/u,
        ''
      )
      .replace(/\n# Generated fallbacks for untranslated Insight articles\.[\s\S]*$/u, '')
      .trimEnd();
    const translationRedirects = typedBlogPosts.flatMap((post) => {
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
