import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { SEO_LANDING_PAGES } from '../../src/data/seoLandingPages';
import { INSIGHTS_PATH, insightDetailPath } from '../../src/data/insights';
import { getBlogAvailableLanguages } from '../../src/utils/blog';
import { productDetailPath, productAlternatePaths } from '../../src/utils/productRoutes';
import type { BlogPost } from '../../src/types/blog';
import {
  categoryPublicPages,
  DEFAULT_PRODUCT_CATEGORIES,
  parseCategoriesSetting,
} from '../../src/utils/catalogCategory';

export const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface PublicPage {
  path: string;
  changefreq: string;
  priority: string;
  lastmod: string;
  languages?: readonly Language[];
  pathsByLang?: Record<string, string>;
}

export const STATIC_PAGES: Omit<PublicPage, 'lastmod'>[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/rfq', changefreq: 'monthly', priority: '0.8' },
  { path: '/our-story', changefreq: 'monthly', priority: '0.7' },
  { path: INSIGHTS_PATH, changefreq: 'weekly', priority: '0.7' },
  { path: '/solutions', changefreq: 'monthly', priority: '0.9' },
  ...SEO_LANDING_PAGES.map((page) => ({
    path: `/solutions/${page.slug}`,
    changefreq: 'monthly',
    priority: '0.9',
  })),
];

export async function getPublicPages(): Promise<PublicPage[]> {
  const today = new Date().toISOString().split('T')[0];
  const staticPages: PublicPage[] = STATIC_PAGES.map((p) => ({ ...p, lastmod: today }));

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    console.warn('[get-public-urls] Supabase credentials not set; returning static pages only.');
    return staticPages;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, category, updated_at, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) console.warn(`[get-public-urls] Could not fetch products: ${error.message}`);

  const productPages: PublicPage[] = (error ? [] : products || []).map((p) => ({
    path: productDetailPath(p, 'en'),
    pathsByLang: productAlternatePaths(p),
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: (p.updated_at || p.created_at || today).split('T')[0],
  }));

  const { data: categorySetting } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'categories')
    .single();
  const parsedCategories = parseCategoriesSetting(categorySetting?.value);
  const categoryPages: PublicPage[] = categoryPublicPages(
    parsedCategories.length > 0 ? parsedCategories : [...DEFAULT_PRODUCT_CATEGORIES],
    today
  );

  const { data: blogPosts, error: blogError } = await supabase
    .from('blog_posts')
    .select('slug, title, body, updated_at, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (blogError) console.warn(`[get-public-urls] Could not fetch insights: ${blogError.message}`);
  const insightPages: PublicPage[] = (blogError ? [] : (blogPosts || []) as BlogPost[]).map((post) => ({
    path: insightDetailPath(post.slug),
    changefreq: 'monthly',
    priority: '0.7',
    lastmod: (post.updated_at || post.published_at || post.created_at || today).split('T')[0],
    languages: getBlogAvailableLanguages(post),
  }));

  return [...staticPages, ...productPages, ...categoryPages, ...insightPages];
}

export function expandToAllLanguageUrls(pages: PublicPage[]): string[] {
  return pages.flatMap((page) =>
    (page.languages || LANGUAGES).map(
      (lang) => `/${lang}${page.pathsByLang?.[lang] ?? (page.path === '/' ? '' : page.path)}`
    )
  );
}
