import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import BlogCard from '../components/BlogCard';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { readInitialBlogList } from '../utils/prerenderData';
import {
  formatBlogDate,
  hasBlogTranslation,
  normalizeBlogCover,
  toListItem,
} from '../utils/blog';
import { buildBlogIndexSchema } from '../utils/blogSchema';
import { imageSrcSet, optimizeImage } from '../utils/optimizeImage';
import { runWhenIdle } from '../utils/idle';
import { getSeoSolutionsUi } from '../data/seoLandingI18n';
import { INSIGHTS_PATH, insightDetailPath } from '../data/insights';
import type { BlogListItem, BlogPost } from '../types/blog';

const LIST_COLUMNS =
  'id, slug, category, cover_image, author, reading_minutes, published_at, title, excerpt, body';

function CategoryFilter({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`border-b-2 px-0.5 pb-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 ${
        active
          ? 'border-amber-600 text-stone-900'
          : 'border-transparent text-stone-500 hover:text-stone-900'
      }`}
    >
      {label}
    </button>
  );
}

export default function Blog() {
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();
  const solutionsUi = getSeoSolutionsUi(lang);
  const initial = readInitialBlogList(lang);
  const [posts, setPosts] = useState<BlogListItem[]>(initial ?? []);
  const [loading, setLoading] = useState(initial === null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [failedCovers, setFailedCovers] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let active = true;
    const initialForLanguage = readInitialBlogList(lang);
    setPosts(initialForLanguage ?? []);
    setLoading(initialForLanguage === null);

    const refreshPosts = async () => {
      try {
        const { supabase } = await import('../supabase');
        const { data, error } = await supabase
          .from('blog_posts')
          .select(LIST_COLUMNS)
          .eq('status', 'published')
          .order('published_at', { ascending: false });
        if (error) throw error;
        if (active && data) {
          setPosts(
            (data as BlogPost[])
              .filter((post) => hasBlogTranslation(post, lang))
              .map((post) => toListItem(post, lang))
          );
        }
      } catch (error) {
        console.error('Error fetching insight posts', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    if (initialForLanguage) {
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
    const values = new Set<string>();
    posts.forEach((post) => post.category && values.add(post.category));
    return Array.from(values);
  }, [posts]);

  const selectedCategory =
    activeCategory && categories.includes(activeCategory) ? activeCategory : null;
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category === selectedCategory)
    : posts;
  const featured = selectedCategory ? undefined : posts[0];
  const gridItems = selectedCategory ? filteredPosts : posts.slice(1);
  const featuredCover = featured ? normalizeBlogCover(featured.cover_image) : null;
  const showFeaturedCover = Boolean(
    featured && featuredCover && !failedCovers.has(featured.id)
  );
  const pageTitle = t('blog.metaTitle', 'BOLEN Mirror Insights | LED Mirror Sourcing Guides');
  const pageDescription = t(
    'blog.metaDescription',
    'Practical LED mirror sourcing guides, technology explainers, and OEM/ODM manufacturing insight from BOLEN.'
  );
  const headingLead = t('blog.titleLead', 'Mirror sourcing');
  const headingAccent = t('blog.titleAccent', 'insights');
  const pageHeading = lang === 'zh' ? `${headingLead}${headingAccent}` : `${headingLead} ${headingAccent}`;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800">
      <SEO
        title={pageTitle}
        description={pageDescription}
        path={INSIGHTS_PATH}
        schema={buildBlogIndexSchema(lang, {
          name: pageHeading,
          description: pageDescription,
          breadcrumbLabel: t('navbar.blog', 'Insights'),
          posts,
        })}
      />

      <header className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-amber-800">
              {t('blog.kicker', 'Practical guidance from the factory floor')}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">
              {headingLead}{lang === 'zh' ? '' : ' '}
              <span className="text-stone-500">{headingAccent}</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-stone-700">
              {t(
                'blog.intro',
                'Buying guidance, technology explanations, and manufacturing know-how for LED mirrors, smart mirrors, and OEM/ODM programs.'
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={lp('/rfq')} className="btn-primary">
              {solutionsUi.discussProject}
            </Link>
            <Link to={lp('/solutions')} className="btn-secondary">
              {solutionsUi.navLabel}
            </Link>
          </div>
        </div>
      </header>

      {loading && posts.length === 0 ? (
        <section className="mx-auto max-w-6xl border-t border-stone-200 px-4 py-12 sm:px-6 lg:px-8">
          <div className="animate-pulse border-b border-stone-200 pb-12">
            <div className="h-3 w-24 bg-stone-200" />
            <div className="mt-5 h-10 max-w-2xl bg-stone-200" />
            <div className="mt-3 h-5 max-w-xl bg-stone-100" />
          </div>
          <div className="grid gap-10 pt-12 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse border-t border-stone-200 pt-5">
                <div className="h-3 w-20 bg-stone-200" />
                <div className="mt-4 h-7 bg-stone-200" />
                <div className="mt-3 h-16 bg-stone-100" />
              </div>
            ))}
          </div>
        </section>
      ) : posts.length === 0 ? (
        <section className="mx-auto max-w-6xl border-t border-stone-200 px-4 py-24 sm:px-6 lg:px-8">
          <p className="text-lg text-stone-600">
            {t('blog.empty', 'No insights published yet. Check back soon.')}
          </p>
        </section>
      ) : (
        <>
          {featured && (
            <section className="mx-auto max-w-6xl border-t border-stone-200 px-4 py-12 sm:px-6 lg:px-8">
              <article>
                <Link
                  to={lp(insightDetailPath(featured.slug))}
                  className={
                    showFeaturedCover
                      ? 'group grid items-center gap-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:gap-12'
                      : 'group block max-w-4xl py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-4 sm:py-8'
                  }
                >
                  {showFeaturedCover && featuredCover && (
                    <div className="block overflow-hidden bg-stone-100">
                    <img
                      src={optimizeImage(featuredCover, { width: 1200 })}
                      srcSet={imageSrcSet(featuredCover, [700, 1200, 1600])}
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      alt=""
                      width="1200"
                      height="800"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={() =>
                        setFailedCovers((current) => new Set(current).add(featured.id))
                      }
                      className="aspect-[3/2] h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                      {t('blog.featured', 'Featured insight')}
                      {featured.category
                        ? ` · ${t(`blog.categories.${featured.category}`, featured.category)}`
                        : ''}
                    </p>
                    <h2 className="mt-3 font-serif text-3xl leading-tight text-stone-900 transition-colors group-hover:text-amber-800 sm:text-4xl lg:text-5xl">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="mt-5 max-w-2xl text-[17px] leading-8 text-stone-700">
                        {featured.excerpt}
                      </p>
                    )}
                    <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wider text-stone-500">
                      {featured.published_at && (
                        <span>{formatBlogDate(featured.published_at, lang)}</span>
                      )}
                      {featured.published_at && <span aria-hidden className="text-stone-300">·</span>}
                      <span>{t('blog.readingTime', { minutes: featured.reading_minutes })}</span>
                    </div>
                    <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-stone-900 group-hover:text-amber-800">
                      {t('blog.readArticle', 'Read insight')}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              </article>
            </section>
          )}

          <section className="border-t border-stone-200 bg-white" aria-labelledby="latest-insights-heading">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-7 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 id="latest-insights-heading" className="font-serif text-3xl text-stone-900 sm:text-4xl">
                    {t('blog.latestHeading', 'Latest insights')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {t('blog.latestIntro', 'Filter by topic or browse every published guide.')}
                  </p>
                </div>
                {categories.length > 0 && (
                  <div
                    className="flex flex-wrap gap-x-6 gap-y-3"
                    aria-label={t('blog.filterLabel', 'Filter insights by topic')}
                  >
                    <CategoryFilter
                      label={t('blog.allPosts', 'All')}
                      active={selectedCategory === null}
                      onClick={() => setActiveCategory(null)}
                    />
                    {categories.map((category) => (
                      <CategoryFilter
                        key={category}
                        label={t(`blog.categories.${category}`, category)}
                        active={selectedCategory === category}
                        onClick={() => setActiveCategory(category)}
                      />
                    ))}
                  </div>
                )}
              </div>

              {gridItems.length > 0 ? (
                <div className="mt-10 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                  {gridItems.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <p className="py-12 text-stone-600">
                  {t('blog.noMoreInTopic', 'No additional insights in this view yet.')}
                </p>
              )}
            </div>
          </section>

          <section className="border-t border-stone-200 bg-[#FAF9F6]">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div className="max-w-2xl">
                <h2 className="font-serif text-2xl text-stone-900 sm:text-3xl">
                  {t('blog.nextStepTitle', 'Turn useful insight into a factory-ready specification')}
                </h2>
                <p className="mt-2 text-[15px] leading-7 text-stone-600">
                  {t(
                    'blog.nextStepDescription',
                    'Compare manufacturing routes, then send dimensions, quantity, market, and required functions for a focused quote.'
                  )}
                </p>
              </div>
              <Link to={lp('/solutions')} className="btn-secondary shrink-0">
                {solutionsUi.exploreSolution}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
