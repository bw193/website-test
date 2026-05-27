import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { m, useScroll, useTransform } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ArrowUpRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../supabase';
import SEO from '../components/SEO';
import BlogCard from '../components/BlogCard';
import ProductCard from '../components/ProductCard';
import { useLocalizedPath, useCurrentLang } from '../hooks/useLocalizedPath';
import { readInitialBlogPost } from '../utils/prerenderData';
import { localizePost, toListItem, formatBlogDate } from '../utils/blog';
import { buildBlogPostingSchema, buildBlogBreadcrumbSchema } from '../utils/blogSchema';
import { optimizeImage } from '../utils/optimizeImage';
import type { BlogPost as RawBlogPost, BlogListItem, LocalizedBlogPost } from '../types/blog';

const FALLBACK_COVER =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

const LIST_COLUMNS =
  'id, slug, category, cover_image, author, reading_minutes, published_at, title, excerpt, body';

interface ProductLite {
  id: string;
  title: string;
  description: string;
  images: string[];
  category?: string;
  price_range?: string;
  msrp?: string;
}

export default function BlogPost() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { lp } = useLocalizedPath();
  const lang = useCurrentLang();
  const { t } = useTranslation();

  const initial = readInitialBlogPost(slug);
  const [post, setPost] = useState<LocalizedBlogPost | null>(initial);
  const [loading, setLoading] = useState(initial === null);
  const [related, setRelated] = useState<BlogListItem[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductLite[]>([]);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pageProgress } = useScroll();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroProgress, [0, 1], ['0%', '30%']);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.15]);
  const heroFade = useTransform(heroProgress, [0, 0.85], [1, 0]);

  useEffect(() => {
    let active = true;
    setLoading(readInitialBlogPost(slug) === null);
    (async () => {
      try {
        const { data } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .maybeSingle();
        if (active && data) setPost(localizePost(data as RawBlogPost, lang));

        const { data: list } = await supabase
          .from('blog_posts')
          .select(LIST_COLUMNS)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(7);
        if (active && list) {
          const items = (list as RawBlogPost[])
            .filter((p) => p.slug !== slug)
            .map((p) => toListItem(p, lang));
          setRelated(items.slice(0, 3));
        }

        const productIds = (data as RawBlogPost | null)?.product_ids || initial?.product_ids || [];
        if (active && productIds.length) {
          const { data: prods } = await supabase
            .from('products')
            .select('id, title, description, images, category, price_range, msrp')
            .in('id', productIds);
          if (active && prods) {
            const byId = new Map((prods as ProductLite[]).map((p) => [p.id, p]));
            setRelatedProducts(productIds.map((pid) => byId.get(pid)).filter((p): p is ProductLite => !!p));
          }
        }
      } catch (e) {
        console.error('Error fetching post', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug, lang]);

  if (loading && !post) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center text-center px-4">
        <p className="font-serif text-3xl text-stone-900 mb-4">{t('blog.notFound', 'Article not found')}</p>
        <Link to={lp('/blog')} className="text-amber-700 font-medium hover:underline">
          {t('blog.backToJournal', 'Back to the Journal')}
        </Link>
      </div>
    );
  }

  const cover = post.cover_image || FALLBACK_COVER;
  const seoTitle = post.seo_title || `${post.title} | BOLEN Mirror`;
  const seoDesc = post.seo_description || post.excerpt;

  return (
    <article className="relative bg-[#FAF9F6] selection:bg-amber-200/60 selection:text-stone-900">
      <SEO
        title={seoTitle}
        description={seoDesc}
        path={`/blog/${post.slug}`}
        ogType="article"
        ogImage={cover}
        schema={[buildBlogPostingSchema(post, lang), buildBlogBreadcrumbSchema(post, lang)]}
      />

      {/* Reading-progress thread */}
      <m.div
        className="fixed top-0 left-0 right-0 h-1 bg-amber-500 origin-left z-[60]"
        style={{ scaleX: pageProgress }}
      />

      {/* Parallax cover hero */}
      <div ref={heroRef} className="relative h-[68vh] min-h-[460px] flex items-end overflow-hidden bg-stone-900">
        <m.div style={{ y: heroY, scale: heroScale }} className="absolute inset-0 z-0">
          <img
            src={optimizeImage(cover, { width: 1920, quality: 85 })}
            alt={post.title}
            className="w-full h-full object-cover"
            width="1920"
            height="1080"
            fetchPriority="high"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/55 to-stone-900/20" />
        </m.div>
        <m.div
          style={{ opacity: heroFade }}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 text-center w-full"
        >
          {post.category && (
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">{post.category}</span>
          )}
          <h1 className="mt-5 font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-[1.05] tracking-tight">
            {post.title}
          </h1>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/70 font-medium uppercase tracking-[0.15em]">
            <span>{post.author}</span>
            {post.published_at && <span className="w-1 h-1 rounded-full bg-white/40" />}
            {post.published_at && <span>{formatBlogDate(post.published_at, lang)}</span>}
            <span className="w-1 h-1 rounded-full bg-white/40" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {t('blog.readingTime', { minutes: post.reading_minutes })}
            </span>
          </div>
        </m.div>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <ol className="flex items-center gap-2 text-xs text-stone-400 font-medium">
          <li>
            <Link to={lp('/')} className="hover:text-stone-700 transition-colors">
              {t('navbar.home')}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to={lp('/blog')} className="hover:text-stone-700 transition-colors">
              {t('navbar.blog', 'Journal')}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-stone-600 truncate max-w-[55vw]">{post.title}</li>
        </ol>
      </nav>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div
          className="prose prose-stone prose-lg max-w-none
            prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-stone-900
            prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-5
            prose-h3:text-2xl
            prose-p:text-stone-700 prose-p:font-light prose-p:leading-relaxed
            prose-a:text-amber-700 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-strong:text-stone-900
            prose-blockquote:border-l-2 prose-blockquote:border-amber-500 prose-blockquote:bg-stone-100/60 prose-blockquote:rounded-r-xl prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:font-serif prose-blockquote:text-stone-700
            prose-img:rounded-2xl prose-img:shadow-lg
            prose-li:text-stone-700 prose-li:font-light prose-li:marker:text-amber-500
            [&>p:first-of-type]:first-letter:float-left [&>p:first-of-type]:first-letter:mr-3 [&>p:first-of-type]:first-letter:font-serif [&>p:first-of-type]:first-letter:text-6xl [&>p:first-of-type]:first-letter:leading-[0.8] [&>p:first-of-type]:first-letter:text-stone-900"
        >
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>

        {/* Conversion CTA — funnels link equity to the money pages */}
        <div className="mt-16 rounded-3xl bg-stone-900 text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl" />
          <h3 className="relative font-serif text-2xl md:text-3xl leading-tight">
            {t('blog.ctaTitle', 'Looking for a mirror built to your spec?')}
          </h3>
          <p className="relative mt-3 text-stone-300 font-light max-w-xl">
            {t(
              'blog.ctaDesc',
              'BOLEN manufactures LED, smart, vanity, and bath mirrors for global brands — OEM and ODM, from one vertically integrated factory.'
            )}
          </p>
          <div className="relative mt-7 flex flex-wrap gap-3">
            <Link
              to={lp('/products')}
              className="inline-flex items-center gap-2 bg-white text-stone-900 px-6 py-3 rounded-full text-sm font-semibold hover:bg-stone-100 transition-colors"
            >
              {t('blog.ctaCatalog', 'Browse the catalog')}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              to={lp('/rfq')}
              className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              {t('blog.ctaQuote', 'Request a quote')}
            </Link>
          </div>
        </div>
      </div>

      {/* Related products — internal links to the catalog (SEO + conversion) */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 tracking-tight mb-10">
              {t('blog.relatedProducts', 'Featured in this article')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  description={p.description}
                  image={p.images?.[0] || ''}
                  category={p.category}
                  priceRange={p.price_range}
                  msrp={p.msrp}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <div className="flex items-end justify-between mb-10">
              <h2 className="font-serif text-3xl md:text-4xl text-stone-900 tracking-tight">
                {t('blog.related', 'More from the Journal')}
              </h2>
              <Link
                to={lp('/blog')}
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-stone-900 hover:text-amber-700 transition-colors"
              >
                {t('blog.viewAll', 'View all')}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {related.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
