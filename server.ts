import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { SEO_LANDING_PAGES } from './src/data/seoLandingPages';
import {
  categoryPublicPages,
  DEFAULT_PRODUCT_CATEGORIES,
  parseCategoriesSetting,
} from './src/utils/catalogCategory';
import { INSIGHTS_PATH, insightDetailPath } from './src/data/insights';
import { TERMS_PATH } from './src/data/termsCopy';
import { PRIVACY_PATH } from './src/data/privacyCopy';
import { getBlogAvailableLanguages, pickLocalized } from './src/utils/blog';
import type { BlogPost, LocalizedMap } from './src/types/blog';
import type { VideoSourceType } from './src/types/video';
import { deriveVideoThumbnailUrl, getVideoPlayback, normalizeVideoSourceType } from './src/utils/video';
import { toMediaUrl } from './src/utils/media';
import { productDetailPath, productAlternatePaths, productRedirectLocation } from './src/utils/productRoutes';
import { handleMediaRequest } from './worker/media';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const PAGE_SIZE = 500;

async function fetchPaginated<T>(
  queryPage: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  label: string
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await queryPage(from, from + PAGE_SIZE - 1);
    if (error) {
      console.warn(`Could not fetch ${label} for sitemap:`, error.message);
      return rows;
    }
    const batch = data || [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return rows;
}

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });

  const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
  const DOMAIN = 'https://bolenmirror.com';
  const MAX_VIDEO_TAGS = 32;
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

  function getVideoAvailableLanguages(video: Pick<SitemapVideoPost, 'title' | 'excerpt' | 'body'>): string[] {
    return LANGUAGES.filter((lang) => {
      const title = video.title?.[lang]?.trim();
      const content = video.body?.[lang]?.trim() || video.excerpt?.[lang]?.trim();
      return Boolean(title && content);
    });
  }

  function buildVideoBlock(video: SitemapVideoPost, lang: string): string | null {
    const playback = getVideoPlayback({
      source_type: normalizeVideoSourceType(video.source_type),
      video_url: video.video_url,
      embed_url: video.embed_url,
    });
    const thumbnail = deriveVideoThumbnailUrl(video);
    const thumbnailLoc = isHttpUrl(thumbnail) ? toMediaUrl(thumbnail) : '';
    const contentLoc = playback.kind === 'video' && isHttpUrl(playback.src) ? toMediaUrl(playback.src) : '';
    const playbackTag =
      playback.kind === 'video' && isHttpUrl(contentLoc)
        ? `      <video:content_loc>${escapeXml(contentLoc)}</video:content_loc>`
        : playback.kind === 'embed' && isHttpUrl(playback.src)
          ? `      <video:player_loc>${escapeXml(playback.src)}</video:player_loc>`
          : '';

    if (!thumbnailLoc || !playbackTag) return null;

    const fallbackTitle = normalizeText(video.slug.replace(/-/g, ' '));
    const title = normalizeText(
      pickLocalized(video.seo_title, lang) || pickLocalized(video.title, lang) || fallbackTitle
    );
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
    const slug = pagePath === '/' ? '' : pagePath.replace(/\/+$/, '');
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

  // Generate sitemap XML from live Supabase data (paginated), aligned with scripts/generate-sitemap.ts
  async function generateSitemapXml(): Promise<string> {
    const today = new Date().toISOString().split('T')[0];

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
      'products'
    );

    const staticPages: SitemapPage[] = [
      { loc: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
      { loc: '/products', changefreq: 'weekly', priority: '0.9', lastmod: today },
      { loc: '/rfq', changefreq: 'monthly', priority: '0.8', lastmod: today },
      { loc: '/our-story', changefreq: 'monthly', priority: '0.7', lastmod: today },
      { loc: INSIGHTS_PATH, changefreq: 'weekly', priority: '0.7', lastmod: today },
      { loc: '/videos', changefreq: 'weekly', priority: '0.7', lastmod: today },
      { loc: TERMS_PATH, changefreq: 'yearly', priority: '0.4', lastmod: today },
      { loc: PRIVACY_PATH, changefreq: 'yearly', priority: '0.4', lastmod: today },
    ];

    const productPages = products.map((product) => {
      const lastmod = (product.updated_at || product.created_at || today).split('T')[0];
      return {
        loc: productDetailPath(product, 'en'),
        pathsByLang: productAlternatePaths(product),
        changefreq: 'weekly',
        priority: '0.8',
        lastmod,
      };
    });

    const { data: categorySetting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'categories')
      .single();
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

    type SitemapBlogPost = Pick<BlogPost, 'slug' | 'title' | 'body' | 'updated_at' | 'published_at' | 'created_at'>;
    const blogPosts = await fetchPaginated<SitemapBlogPost>(
      (from, to) =>
        supabase
          .from('blog_posts')
          .select('slug, title, body, updated_at, published_at, created_at')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .range(from, to),
      'blog posts'
    );

    const blogPostPages: SitemapPage[] = blogPosts
      .map((post) => {
        const lastmod = (post.updated_at || post.published_at || post.created_at || today).split('T')[0];
        return {
          loc: insightDetailPath(post.slug),
          changefreq: 'monthly',
          priority: '0.7',
          lastmod,
          availableLanguages: getBlogAvailableLanguages(post),
        };
      })
      .filter((page) => (page.availableLanguages?.length ?? 0) > 0);

    const videoPosts = await fetchPaginated<SitemapVideoPost>(
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

    const videoPostPages: SitemapPage[] = videoPosts
      .map((post) => {
        const availableLanguages = getVideoAvailableLanguages(post);
        const lastmod = (post.updated_at || post.published_at || post.created_at || today).split('T')[0];
        const videoByLang = Object.fromEntries(
          availableLanguages.map((lang) => [lang, buildVideoBlock(post, lang)])
        );
        return {
          loc: `/videos/${post.slug}`,
          changefreq: 'monthly',
          priority: '0.7',
          lastmod,
          videoByLang,
          availableLanguages,
        };
      })
      .filter((page) => (page.availableLanguages?.length ?? 0) > 0);

    const solutionPages = [
      { loc: '/solutions', changefreq: 'monthly', priority: '0.9', lastmod: today },
      ...SEO_LANDING_PAGES.map((page) => ({
        loc: `/solutions/${page.slug}`,
        changefreq: 'monthly',
        priority: '0.9',
        lastmod: today,
      })),
    ];
    const allPages: SitemapPage[] = [
      ...staticPages,
      ...solutionPages,
      ...productPages,
      ...categoryPages,
      ...blogPostPages,
      ...videoPostPages,
    ];
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
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join('\n')}
</urlset>`;
  }

  // Dynamic sitemap — always serves fresh data from Supabase
  app.get('/sitemap.xml', async (req, res) => {
    try {
      const sitemap = await generateSitemapXml();
      res.header('Content-Type', 'application/xml');
      res.header('Cache-Control', 'public, max-age=3600');
      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).end();
    }
  });

  // Same-origin copies of the Supabase-hosted media, answered by the same
  // handler production uses (worker/media.ts), minus the edge cache.
  app.get('/media/*', async (req, res) => {
    const headers: Record<string, string> = { Accept: req.get('Accept') || '*/*' };
    const range = req.get('Range');
    if (range) headers.Range = range;
    const ifRange = req.get('If-Range');
    if (ifRange) headers['If-Range'] = ifRange;
    const ifNoneMatch = req.get('If-None-Match');
    if (ifNoneMatch) headers['If-None-Match'] = ifNoneMatch;
    const response = await handleMediaRequest(
      new Request(new URL(req.originalUrl, DOMAIN), {
        method: req.method,
        headers,
      }),
      undefined,
      { cache: null },
    );
    response.headers.forEach((value, name) => res.setHeader(name, value));
    if (req.method === 'HEAD' || response.status === 304 || response.status === 416) {
      res.status(response.status).end();
      return;
    }
    res.status(response.status).send(Buffer.from(await response.arrayBuffer()));
  });

  const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];
  const CATEGORY_INDEX_PATTERN = /^\/(en|zh|es|fr|de|it)\/products\/category\/?$/;
  const RETIRED_CATEGORY_PATTERN =
    /^\/(en|zh|es|fr|de|it)\/products\/category\/(framed-led-mirror|frameless-led-mirror|rectangle-led-mirror|magnifying-makeup-mirror|new-arrival|uncategorized)\/?$/;

  const withQuery = (req: express.Request, targetPath: string): string => {
    const queryIndex = req.originalUrl.indexOf('?');
    return queryIndex === -1 ? targetPath : `${targetPath}${req.originalUrl.slice(queryIndex)}`;
  };

  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }
    const url = new URL(req.originalUrl, DOMAIN);
    const categoryIndex = url.pathname.match(CATEGORY_INDEX_PATTERN);
    if (categoryIndex) {
      res.redirect(301, `/${categoryIndex[1]}/products/${url.search}`);
      return;
    }
    const retiredCategory = url.pathname.match(RETIRED_CATEGORY_PATTERN);
    if (retiredCategory) {
      const [, lang, slug] = retiredCategory;
      const dest =
        slug === 'new-arrival' || slug === 'uncategorized'
          ? `/${lang}/products/${url.search}`
          : `/${lang}/products/category/led-lighted-mirror/${url.search}`;
      res.redirect(301, dest);
      return;
    }
    const target = productRedirectLocation(url);
    if (target) {
      res.redirect(301, target);
      return;
    }
    next();
  });

  // 301 redirects for old non-language-prefixed URLs → /en/... (preserving query params)
  app.get('/products', (req, res) => res.redirect(301, withQuery(req, '/en/products/')));
  app.get('/products/*', (req, res) =>
    res.redirect(301, withQuery(req, `/en${req.path.replace(/\/+$/, '')}/`))
  );
  app.get('/our-story', (req, res) => res.redirect(301, withQuery(req, '/en/our-story/')));
  app.get('/rfq', (req, res) => res.redirect(301, withQuery(req, '/en/rfq/')));
  app.get('/videos', (req, res) => res.redirect(301, withQuery(req, '/en/videos/')));
  app.get('/videos/*', (req, res) =>
    res.redirect(301, withQuery(req, `/en${req.path.replace(/\/+$/, '')}/`))
  );
  app.get('/solutions', (req, res) => res.redirect(301, withQuery(req, '/en/solutions/')));
  app.get('/solutions/*', (req, res) =>
    res.redirect(301, withQuery(req, `/en${req.path.replace(/\/+$/, '')}/`))
  );
  app.get(TERMS_PATH, (req, res) => res.redirect(301, withQuery(req, `/en${TERMS_PATH}/`)));
  app.get(PRIVACY_PATH, (req, res) => res.redirect(301, withQuery(req, `/en${PRIVACY_PATH}/`)));
  app.get(INSIGHTS_PATH, (req, res) => res.redirect(301, withQuery(req, `/en${INSIGHTS_PATH}/`)));
  app.get(`${INSIGHTS_PATH}/*`, (req, res) =>
    res.redirect(301, withQuery(req, `/en${req.path.replace(/\/+$/, '')}/`))
  );
  app.get('/blog', (req, res) => res.redirect(301, withQuery(req, `/en${INSIGHTS_PATH}/`)));
  app.get('/blog/*', (req, res) => {
    const suffix = req.path.replace(/^\/blog\/?/, '').replace(/\/+$/, '');
    const target = suffix ? `/en${INSIGHTS_PATH}/${suffix}/` : `/en${INSIGHTS_PATH}/`;
    res.redirect(301, withQuery(req, target));
  });
  app.get('/:lang/blog', (req, res, next) => {
    if (!SUPPORTED_LANGUAGES.includes(req.params.lang)) return next();
    res.redirect(301, withQuery(req, `/${req.params.lang}${INSIGHTS_PATH}/`));
  });
  app.get('/:lang/blog/*', (req, res, next) => {
    if (!SUPPORTED_LANGUAGES.includes(req.params.lang)) return next();
    const suffix = req.path.split('/').slice(3).join('/').replace(/\/+$/, '');
    const target = suffix
      ? `/${req.params.lang}${INSIGHTS_PATH}/${suffix}/`
      : `/${req.params.lang}${INSIGHTS_PATH}/`;
    res.redirect(301, withQuery(req, target));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files but skip sitemap.xml (handled by dynamic route above)
    app.use(express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js') || filePath.endsWith('.css')) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    // Redirect bare root to /en (preserving query params)
    app.get('/', (req, res) => res.redirect(301, withQuery(req, '/en/')));
    // Same contract as the Cloudflare deployment: the client-only employee
    // portal shell for /admin*, a real 404 (dist/404.html) for anything else
    // that has no prerendered file.
    app.get(['/admin', '/admin/*'], (req, res) => {
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
      res.sendFile(path.join(distPath, 'admin', 'index.html'));
    });
    app.get('*', (req, res) => {
      res.status(404).sendFile(path.join(distPath, '404.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
