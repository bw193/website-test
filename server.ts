import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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

  const LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];
  const DOMAIN = 'https://bolenmirror.com';

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

  // Generate sitemap XML from live Supabase data
  async function generateSitemapXml(): Promise<string> {
    const today = new Date().toISOString().split('T')[0];
    const { data: products } = await supabase
      .from('products')
      .select('id, title, updated_at, created_at')
      .order('created_at', { ascending: false });

    const staticPages = [
      { loc: '/', changefreq: 'weekly', priority: '1.0', lastmod: today },
      { loc: '/products', changefreq: 'weekly', priority: '0.9', lastmod: today },
      { loc: '/rfq', changefreq: 'monthly', priority: '0.8', lastmod: today },
      { loc: '/our-story', changefreq: 'monthly', priority: '0.7', lastmod: today },
    ];

    const toSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const productPages = (products || []).map(product => {
      const slug = toSlug(product.title);
      const lastmod = (product.updated_at || product.created_at || today).split('T')[0];
      return { loc: `/products/${slug}-${product.id}`, changefreq: 'weekly', priority: '0.8', lastmod };
    });

    const allPages = [...staticPages, ...productPages];
    const urls = LANGUAGES.flatMap((lang) =>
      allPages.map((p) => buildUrlEntry(p.loc, p.lastmod, p.changefreq, p.priority, lang))
    );

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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

  const SUPPORTED_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];

  // 301 redirects for old non-language-prefixed URLs → /en/...
  app.get('/products', (req, res) => res.redirect(301, '/en/products'));
  app.get('/products/*', (req, res) => res.redirect(301, `/en${req.path}`));
  app.get('/our-story', (req, res) => res.redirect(301, '/en/our-story'));
  app.get('/rfq', (req, res) => res.redirect(301, '/en/rfq'));

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
    // Redirect bare root to /en
    app.get('/', (req, res) => res.redirect(302, '/en'));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
