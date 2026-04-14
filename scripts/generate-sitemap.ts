import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import 'dotenv/config';

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

function toSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

function buildUrlEntry(pagePath: string, lastmod: string, changefreq: string, priority: string, lang: string): string {
  const hreflangs = LANGUAGES.map(
    (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${DOMAIN}/${l}${pagePath === '/' ? '' : pagePath}" />`
  ).join('\n');
  const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${DOMAIN}/en${pagePath === '/' ? '' : pagePath}" />`;

  return `  <url>
    <loc>${DOMAIN}/${lang}${pagePath === '/' ? '' : pagePath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${hreflangs}
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
      loc: `/products/${slug}-${p.id}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod,
    };
  });

  const allPages = [
    ...staticPages.map((p) => ({ ...p, lastmod: today })),
    ...productPages,
  ];

  // Generate a URL entry for each page × each language
  const urls = LANGUAGES.flatMap((lang) =>
    allPages.map((p) => buildUrlEntry(p.loc, p.lastmod, p.changefreq, p.priority, lang))
  );

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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

  console.log(`Generated sitemap with ${staticPages.length + productPages.length} URLs`);
}

generateSitemap();
