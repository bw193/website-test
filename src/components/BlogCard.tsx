import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { imageSrcSet, optimizeImage } from '../utils/optimizeImage';
import { formatBlogDate, normalizeBlogCover } from '../utils/blog';
import { insightDetailPath } from '../data/insights';
import type { BlogListItem } from '../types/blog';

interface Props {
  post: BlogListItem;
}

export default function BlogCard({ post }: Props) {
  const { lp, lang } = useLocalizedPath();
  const { t } = useTranslation();
  const cover = normalizeBlogCover(post.cover_image);
  const [failedCover, setFailedCover] = useState<string | null>(null);
  const imageVisible = Boolean(cover && cover !== failedCover);

  return (
    <article className="group h-full border-t border-stone-200 pt-5">
      <Link to={lp(insightDetailPath(post.slug))} className="flex h-full flex-col">
        {cover && imageVisible && (
          <div className="mb-5 aspect-[3/2] overflow-hidden bg-stone-100">
            <img
              src={optimizeImage(cover, { width: 700 })}
              srcSet={imageSrcSet(cover, [400, 700, 1000])}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              alt=""
              width="700"
              height="467"
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setFailedCover(cover)}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </div>
        )}

        {post.category && (
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            {t(`blog.categories.${post.category}`, post.category)}
          </span>
        )}
        <h3 className="mt-2 font-serif text-2xl leading-snug text-stone-900 transition-colors group-hover:text-amber-800">
          {post.title}
        </h3>
        {post.excerpt && <p className="mt-3 line-clamp-3 text-[15px] leading-7 text-stone-600">{post.excerpt}</p>}
        <div className="mt-auto flex items-center gap-3 pt-5 text-xs font-medium uppercase tracking-wider text-stone-500">
          {post.published_at && <span>{formatBlogDate(post.published_at, lang)}</span>}
          {post.published_at && <span aria-hidden className="text-stone-300">·</span>}
          <span>{t('blog.readingTime', { minutes: post.reading_minutes })}</span>
          <ArrowRight className="ml-auto h-4 w-4 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-800" />
        </div>
      </Link>
    </article>
  );
}
