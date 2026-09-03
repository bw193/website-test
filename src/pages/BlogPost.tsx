import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Clock } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Markdown from '../components/Markdown';
import SEO from '../components/SEO';
import BlogCard from '../components/BlogCard';
import ProductCard from '../components/ProductCard';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialBlogPost } from '../utils/prerenderData';
import {
  formatBlogDate,
  localizePost,
  normalizeBlogCover,
  toListItem,
} from '../utils/blog';
import type { BlogPost as RawBlogPost, BlogListItem, LocalizedBlogPost } from '../types/blog';
import { buildBlogBreadcrumbSchema, buildBlogPostingSchema } from '../utils/blogSchema';
import { optimizeImage } from '../utils/optimizeImage';
import { runWhenIdle } from '../utils/idle';
import { recommendSolutionsForProduct } from '../data/seoLandingPages';
import { getSeoSolutionsUi, localizeSeoLandingPage } from '../data/seoLandingI18n';
import { INSIGHTS_PATH, insightDetailPath } from '../data/insights';

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
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();
  const initial = readInitialBlogPost(slug, lang);
  const [post, setPost] = useState<LocalizedBlogPost | null>(initial);
  const [loading, setLoading] = useState(initial === null);
  const [related, setRelated] = useState<BlogListItem[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<ProductLite[]>([]);
  const [failedCover, setFailedCover] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const initialPost = readInitialBlogPost(slug, lang);
    setPost(initialPost);
    setRelated([]);
    setRelatedProducts([]);
    setFailedCover(null);
    setLoading(initialPost === null);

    const refreshPost = async () => {
      try {
        const { supabase } = await import('../supabase');
        const [postResult, listResult] = await Promise.all([
          supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .maybeSingle(),
          supabase
            .from('blog_posts')
            .select(LIST_COLUMNS)
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(12),
        ]);
        const data = postResult.data;
        const list = listResult.data;
        if (active) {
          setPost(data ? localizePost(data as RawBlogPost, lang) : null);
        }
        if (active && list) {
          const items = (list as RawBlogPost[])
            .filter(
              (candidate) =>
                candidate.slug !== slug &&
                Boolean(candidate.title?.[lang]?.trim() && candidate.body?.[lang]?.trim())
            )
            .map((candidate) => toListItem(candidate, lang));
          setRelated(items.slice(0, 3));
        }

        const productIds =
          (data as RawBlogPost | null)?.product_ids || initialPost?.product_ids || [];
        if (active && productIds.length) {
          const { data: products } = await supabase
            .from('products')
            .select('id, title, description, images, category, price_range, msrp')
            .eq('is_active', true)
            .in('id', productIds);
          if (active && products) {
            const byId = new Map((products as ProductLite[]).map((product) => [product.id, product]));
            setRelatedProducts(
              productIds.map((id) => byId.get(id)).filter((product): product is ProductLite => Boolean(product))
            );
          }
        }
      } catch (error) {
        console.error('Error fetching insight', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (initialPost) {
      const cancel = runWhenIdle(refreshPost, 2500);
      return () => {
        active = false;
        cancel();
      };
    }

    refreshPost();
    return () => {
      active = false;
    };
  }, [slug, lang]);

  if (loading && !post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-500" />
      </div>
    );
  }

  if (!post || post.available_languages.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAF9F6] px-4 text-center">
        <SEO
          title={t('blog.notFound', 'Insight not found')}
          description={t('blog.notFoundDescription', 'The requested BOLEN insight could not be found.')}
          path={insightDetailPath(slug)}
          noindex
          alternateLanguages={[]}
        />
        <p className="font-serif text-3xl text-stone-900">
          {t('blog.notFound', 'Insight not found')}
        </p>
        <Link to={lp(INSIGHTS_PATH)} className="mt-5 text-sm font-semibold text-amber-800 hover:underline">
          {t('blog.backToJournal', 'Back to insights')}
        </Link>
      </div>
    );
  }

  if (!post.available_languages.includes(lang)) {
    const fallbackLanguage = post.available_languages.includes('en')
      ? 'en'
      : post.available_languages[0];
    if (fallbackLanguage) {
      return <Navigate to={`/${fallbackLanguage}${insightDetailPath(post.slug)}/`} replace />;
    }
  }

  const solutionsUi = getSeoSolutionsUi(lang);
  const relatedSolutions = recommendSolutionsForProduct({
    title: post.title,
    category: `${post.category || ''} ${post.excerpt || ''}`,
  }).map((page) => localizeSeoLandingPage(page, lang));
  const cover = normalizeBlogCover(post.cover_image);
  const showCover = Boolean(cover && cover !== failedCover);
  const seoTitle = post.seo_title || `${post.title} | BOLEN Mirror Insights`;
  const seoDescription = post.seo_description || post.excerpt;

  return (
    <article className="bg-[#FAF9F6] text-stone-800 selection:bg-amber-200/60 selection:text-stone-900">
      <SEO
        title={seoTitle}
        description={seoDescription}
        path={insightDetailPath(post.slug)}
        ogType="article"
        ogImage={cover || undefined}
        alternateLanguages={post.available_languages}
        schema={[
          buildBlogPostingSchema(post, lang),
          buildBlogBreadcrumbSchema(post, lang, t('navbar.blog', 'Insights')),
        ]}
      />

      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <nav className="text-sm text-stone-500" aria-label="Breadcrumb">
            <Link to={lp('/')} className="hover:text-stone-900">
              {t('navbar.home')}
            </Link>
            <span aria-hidden> / </span>
            <Link to={lp(INSIGHTS_PATH)} className="hover:text-stone-900">
              {t('navbar.blog', 'Insights')}
            </Link>
            <span aria-hidden> / </span>
            <span className="text-stone-700">{post.title}</span>
          </nav>

          {post.category && (
            <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-amber-800">
              {t(`blog.categories.${post.category}`, post.category)}
            </p>
          )}
          <h1 className="mt-3 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-5 text-lg leading-8 text-stone-700">{post.excerpt}</p>
          )}
          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium uppercase tracking-wider text-stone-500">
            <span>{post.author}</span>
            {post.published_at && <span aria-hidden className="text-stone-300">·</span>}
            {post.published_at && <span>{formatBlogDate(post.published_at, lang)}</span>}
            <span aria-hidden className="text-stone-300">·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {t('blog.readingTime', { minutes: post.reading_minutes })}
            </span>
          </div>
        </div>
      </header>

      {showCover && cover && (
        <figure className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-12 lg:px-8">
          <img
            src={optimizeImage(cover, { width: 1600, quality: 85 })}
            alt={post.title}
            width="1600"
            height="900"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailedCover(cover)}
            className="aspect-[16/9] w-full bg-stone-100 object-cover"
          />
        </figure>
      )}

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <Markdown
          className="prose prose-stone prose-lg max-w-none
            prose-headings:font-serif prose-headings:tracking-tight prose-headings:text-stone-900
            prose-h2:mt-14 prose-h2:mb-5 prose-h2:text-3xl
            prose-h3:text-2xl
            prose-p:leading-relaxed prose-p:text-stone-700
            prose-a:font-medium prose-a:text-amber-800 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-stone-900
            prose-blockquote:border-l-2 prose-blockquote:border-amber-500 prose-blockquote:bg-stone-100/60 prose-blockquote:px-6 prose-blockquote:py-2 prose-blockquote:not-italic prose-blockquote:text-stone-700
            prose-img:shadow-sm
            prose-li:text-stone-700 prose-li:marker:text-amber-600"
        >
          {post.body}
        </Markdown>

        <aside className="mt-16 bg-stone-900 p-8 text-white md:p-12" aria-label={t('blog.ctaTitle')}>
          <h2 className="font-serif text-2xl leading-tight md:text-3xl">
            {t('blog.ctaTitle', 'Looking for a mirror built to your specification?')}
          </h2>
          <p className="mt-3 max-w-xl leading-7 text-stone-300">
            {t(
              'blog.ctaDesc',
              'BOLEN manufactures LED, smart, vanity, and bathroom mirrors for global brands through OEM and ODM programs.'
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={lp('/rfq')} className="btn-primary">
              {t('blog.ctaQuote', 'Contact Sales')}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to={lp('/solutions')} className="btn-secondary-on-dark">
              {solutionsUi.navLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={lp('/products')} className="btn-secondary-on-dark">
              {t('blog.ctaCatalog', 'Browse the catalog')}
            </Link>
          </div>
        </aside>
      </div>

      {relatedSolutions.length > 0 && (
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-stone-900">{solutionsUi.relatedSolutions}</h2>
            <ul className="mt-7 grid gap-x-8 gap-y-5 md:grid-cols-3">
              {relatedSolutions.map((solution) => (
                <li key={solution.slug} className="border-t border-stone-200 pt-4">
                  <Link to={lp(`/solutions/${solution.slug}`)} className="group block">
                    <span className="flex items-baseline justify-between gap-3 font-medium text-stone-900 group-hover:text-amber-800">
                      {solution.shortTitle || solution.h1}
                      <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 group-hover:text-amber-800" />
                    </span>
                    <span className="mt-2 block text-sm leading-6 text-stone-600">{solution.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-200 bg-[#FAF9F6]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl text-stone-900 md:text-4xl">
              {t('blog.relatedProducts', 'Featured in this insight')}
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  description={product.description}
                  image={product.images?.[0] || ''}
                  category={product.category}
                  priceRange={product.price_range}
                  msrp={product.msrp}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-stone-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <h2 className="font-serif text-3xl text-stone-900 md:text-4xl">
                {t('blog.related', 'More insights')}
              </h2>
              <Link
                to={lp(INSIGHTS_PATH)}
                className="hidden items-center gap-2 text-sm font-semibold text-stone-900 hover:text-amber-800 sm:inline-flex"
              >
                {t('blog.viewAll', 'View all')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-3">
              {related.map((item) => (
                <BlogCard key={item.id} post={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
