import React from 'react';
import { Link } from 'react-router-dom';
import { m } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { optimizeImage, imageSrcSet } from '../utils/optimizeImage';
import { formatBlogDate } from '../utils/blog';
import type { BlogListItem } from '../types/blog';

const FALLBACK_COVER =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

interface Props {
  post: BlogListItem;
  index?: number;
}

const BlogCard: React.FC<Props> = ({ post, index = 0 }) => {
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();
  const cover = post.cover_image || FALLBACK_COVER;

  return (
    <m.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: Math.min(index * 0.08, 0.4), ease: [0.16, 1, 0.3, 1] }}
      className="group"
    >
      <Link to={lp(`/blog/${post.slug}`)} className="block">
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-stone-200 mb-5">
          <img
            src={optimizeImage(cover, { width: 700 })}
            srcSet={imageSrcSet(cover, [400, 700, 1000])}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            alt={post.title}
            width="700"
            height="467"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {post.category && (
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">
            {post.category}
          </span>
        )}
        <h3 className="mt-2 font-serif text-2xl leading-snug text-stone-900 group-hover:text-amber-700 transition-colors">
          {post.title}
        </h3>
        <p className="mt-3 text-stone-600 font-light leading-relaxed line-clamp-3">{post.excerpt}</p>
        <div className="mt-4 flex items-center gap-3 text-xs text-stone-400 font-medium uppercase tracking-wider">
          {post.published_at && <span>{formatBlogDate(post.published_at, lang)}</span>}
          {post.published_at && <span className="w-1 h-1 rounded-full bg-stone-300" />}
          <span>{t('blog.readingTime', { minutes: post.reading_minutes })}</span>
          <ArrowUpRight className="w-4 h-4 ml-auto text-stone-300 group-hover:text-amber-600 transition-colors" />
        </div>
      </Link>
    </m.article>
  );
};

export default BlogCard;
