import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';
import { SEO_LANDING_PAGES } from '../../src/data/seoLandingPages';

export const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'] as const;
export type Language = (typeof LANGUAGES)[number];

export interface PublicPage {
  path: string;
  changefreq: string;
  priority: string;
  lastmod: string;
}

export const STATIC_PAGES: Omit<PublicPage, 'lastmod'>[] = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/products', changefreq: 'weekly', priority: '0.9' },
  { path: '/rfq', changefreq: 'monthly', priority: '0.8' },
  { path: '/our-story', changefreq: 'monthly', priority: '0.7' },
  { path: '/solutions', changefreq: 'monthly', priority: '0.9' },
  ...SEO_LANDING_PAGES.map((page) => ({
    path: `/solutions/${page.slug}`,
    changefreq: 'monthly',
    priority: '0.9',
  })),
];

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

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
    .select('id, title, updated_at, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn(`[get-public-urls] Could not fetch products: ${error.message}`);
    return staticPages;
  }

  const productPages: PublicPage[] = (products || []).map((p) => ({
    path: `/products/${toSlug(p.title)}`,
    changefreq: 'weekly',
    priority: '0.8',
    lastmod: (p.updated_at || p.created_at || today).split('T')[0],
  }));

  return [...staticPages, ...productPages];
}

export function expandToAllLanguageUrls(pages: PublicPage[]): string[] {
  return LANGUAGES.flatMap((lang) =>
    pages.map((p) => `/${lang}${p.path === '/' ? '' : p.path}`)
  );
}
