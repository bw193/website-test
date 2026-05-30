import React, { useEffect, useMemo, useState } from 'react';
import { m } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import BlogCard from '../components/BlogCard';
import { useLocalizedPath, useCurrentLang } from '../hooks/useLocalizedPath';
import { readInitialBlogList } from '../utils/prerenderData';
import { toListItem, formatBlogDate } from '../utils/blog';
import { buildBlogIndexSchema } from '../utils/blogSchema';
import { optimizeImage, imageSrcSet } from '../utils/optimizeImage';
import { runWhenIdle } from '../utils/idle';
import type { BlogPost, BlogListItem } from '../types/blog';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const FALLBACK_COVER =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

const LIST_COLUMNS =
  'id, slug, category, cover_image, author, reading_minutes, published_at, title, excerpt, body';

function CatTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-4 text-sm font-medium tracking-wide transition-colors ${
        active ? 'text-stone-900' : 'text-stone-400 hover:text-stone-700'
      }`}
    >
      {label}
      {active && <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-amber-500" />}
    </button>
  );
}

export default function Blog() {
  const { lp } = useLocalizedPath();
  const lang = useCurrentLang();
  const { t } = useTranslation();

  const initial = readInitialBlogList();
  const [posts, setPosts] = useState<BlogListItem[]>(initial ?? []);
  const [loading, setLoading] = useState(initial === null);
  const [activeCat, setActiveCat] = useState<string | null>(null);

  // Deferred, non-blocking refresh — the page has already rendered from the
  // prerendered island, so this only revalidates / catches newly published posts.
  useEffect(() => {
    let active = true;
    const refreshPosts = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase
          .from('blog_posts')
          .select(LIST_COLUMNS)
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (error) throw error;
        if (active && data) setPosts((data as BlogPost[]).map((p) => toListItem(p, lang)));
      } catch (e) {
        console.error('Error fetching blog posts', e);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (initial) {
      const cancel = runWhenIdle(refreshPosts, 2500);
      return () => {
        active = false;
        cancel();
      };
    }

    refreshPosts();
    return () => {
      active = false;
    };
  }, [lang]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [posts]);

  const filtered = activeCat ? posts.filter((p) => p.category === activeCat) : posts;
  const featured = filtered[0];
  const gridItems = activeCat ? filtered : filtered.slice(1);

  return (
    <div className="relative bg-[#FAF9F6] min-h-screen selection:bg-amber-200/60 selection:text-stone-900 overflow-hidden">
      <SEO
        title={t('blog.metaTitle', 'The BOLEN Journal | LED & Smart Mirror Insights')}
        description={t(
          'blog.metaDescription',
          'Buying guides, technology explainers, and manufacturing insight on LED mirrors, smart mirrors, and OEM/ODM production from BOLEN.'
        )}
        path="/blog"
        schema={buildBlogIndexSchema(lang)}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]" style={{ backgroundImage: GRAIN }} />

      <div className="relative z-10">
        {/* Masthead */}
        <header className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-center">
          <m.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-semibold uppercase tracking-[0.32em] text-amber-700 mb-6"
          >
            {t('blog.kicker', 'Field notes from the factory floor')}
          </m.p>
          <m.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-stone-900 leading-[0.95] tracking-tight"
          >
            {t('blog.titleLead', 'The BOLEN')}{' '}
            <span className="italic text-stone-500 font-light">{t('blog.titleAccent', 'Journal')}</span>
          </m.h1>
          <div className="mx-auto mt-8 h-px w-24 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-8 max-w-2xl mx-auto text-lg text-stone-600 font-light leading-relaxed"
          >
            {t(
              'blog.intro',
              'Guides, technology, and manufacturing know-how on LED and smart mirrors — written by the team that builds them.'
            )}
          </m.p>
        </header>

        {loading && posts.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/2] rounded-2xl bg-stone-200 mb-5" />
                <div className="h-3 w-20 bg-stone-200 rounded mb-3" />
                <div className="h-6 w-3/4 bg-stone-200 rounded mb-2" />
                <div className="h-4 w-full bg-stone-100 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="max-w-2xl mx-auto px-4 text-center py-32">
            <p className="text-stone-500 text-lg">{t('blog.empty', 'No articles published yet. Check back soon.')}</p>
          </div>
        ) : (
          <>
            {/* Featured lead (only on the unfiltered view) */}
            {featured && !activeCat && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20 md:mb-28">
                <m.div
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center"
                >
                  <Link to={lp(`/blog/${featured.slug}`)} className="lg:col-span-7 group block">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-stone-200 shadow-xl">
                      <img
                        src={optimizeImage(featured.cover_image || FALLBACK_COVER, { width: 1200 })}
                        srcSet={imageSrcSet(featured.cover_image || FALLBACK_COVER, [700, 1200, 1600])}
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        alt={featured.title}
                        width="1200"
                        height="750"
                        fetchPriority="high"
                        decoding="async"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <div className="lg:col-span-5 lg:-ml-16 relative z-10">
                    <div className="lg:bg-white/95 lg:backdrop-blur-sm lg:p-12 lg:rounded-3xl lg:shadow-xl lg:border lg:border-stone-100">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                        {t('blog.featured', 'Featured')}
                        {featured.category ? ` · ${featured.category}` : ''}
                      </span>
                      <h2 className="mt-3 font-serif text-3xl md:text-4xl lg:text-5xl leading-[1.05] tracking-tight text-stone-900">
                        <Link to={lp(`/blog/${featured.slug}`)} className="hover:text-amber-700 transition-colors">
                          {featured.title}
                        </Link>
                      </h2>
                      <p className="mt-5 text-stone-600 font-light leading-relaxed line-clamp-3">{featured.excerpt}</p>
                      <div className="mt-6 flex items-center gap-3 text-xs text-stone-400 font-medium uppercase tracking-wider">
                        {featured.published_at && <span>{formatBlogDate(featured.published_at, lang)}</span>}
                        {featured.published_at && <span className="w-1 h-1 rounded-full bg-stone-300" />}
                        <span>{t('blog.readingTime', { minutes: featured.reading_minutes })}</span>
                      </div>
                      <Link
                        to={lp(`/blog/${featured.slug}`)}
                        className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-stone-900 group"
                      >
                        {t('blog.readArticle', 'Read article')}
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </m.div>
              </section>
            )}

            {/* Category tabs */}
            {categories.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-stone-200">
                  <CatTab label={t('blog.allPosts', 'All')} active={activeCat === null} onClick={() => setActiveCat(null)} />
                  {categories.map((c) => (
                    <CatTab key={c} label={c} active={activeCat === c} onClick={() => setActiveCat(c)} />
                  ))}
                </div>
              </div>
            )}

            {/* Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                {gridItems.map((p, i) => (
                  <BlogCard key={p.id} post={p} index={i} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
