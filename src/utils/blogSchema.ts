// Shared JSON-LD builders used by both React and the static prerenderer.
// Keep this module browser-safe and preserve property insertion order so
// react-helmet-async can adopt the prerendered scripts without duplicates.

import { INSIGHTS_PATH, insightDetailPath } from '../data/insights';
import { normalizeBlogCover } from './blog';

const SITE_URL = 'https://bolenmirror.com';

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
  url: SITE_URL,
  logo: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png',
};

export interface BlogPostingSchemaInput {
  slug: string;
  title: string;
  excerpt?: string;
  cover_image?: string | null;
  author?: string | null;
  category?: string | null;
  tags?: string[] | null;
  published_at?: string | null;
  updated_at?: string | null;
}

export interface BlogIndexSchemaOptions {
  name?: string;
  description?: string;
  breadcrumbLabel?: string;
  posts?: Array<
    Pick<BlogPostingSchemaInput, 'slug' | 'title' | 'excerpt' | 'published_at'>
  >;
}

/** Blog, ItemList, and BreadcrumbList for the localized insights hub. */
export function buildBlogIndexSchema(
  lang: string,
  options: BlogIndexSchemaOptions = {}
): unknown[] {
  const url = `${SITE_URL}/${lang}${INSIGHTS_PATH}/`;
  const name = options.name || 'BOLEN Mirror Insights';
  const description =
    options.description ||
    'Practical LED mirror sourcing guides, technology explainers, and OEM/ODM manufacturing insight from BOLEN.';
  const posts = options.posts || [];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name,
      description,
      url,
      inLanguage: lang,
      publisher: PUBLISHER,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name,
      numberOfItems: posts.length,
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: `${SITE_URL}/${lang}${insightDetailPath(post.slug)}/`,
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}/` },
        {
          '@type': 'ListItem',
          position: 2,
          name: options.breadcrumbLabel || name,
          item: url,
        },
      ],
    },
  ];
}

/** BlogPosting for a localized insight page. */
export function buildBlogPostingSchema(
  post: BlogPostingSchemaInput,
  lang: string
): Record<string, unknown> {
  const url = `${SITE_URL}/${lang}${insightDetailPath(post.slug)}/`;
  const cover = normalizeBlogCover(post.cover_image);
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    author: { '@type': 'Organization', name: post.author || 'BOLEN Editorial' },
    publisher: PUBLISHER,
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'Blog', '@id': `${SITE_URL}/${lang}${INSIGHTS_PATH}/` },
    url,
  };
  if (cover) schema.image = [cover];
  if (post.category) schema.articleSection = post.category;
  if (post.tags?.length) schema.keywords = post.tags.join(', ');
  if (post.published_at) schema.datePublished = post.published_at;
  if (post.updated_at || post.published_at) {
    schema.dateModified = post.updated_at || post.published_at;
  }
  return schema;
}

/** BreadcrumbList (Home → Insights → article) for an article page. */
export function buildBlogBreadcrumbSchema(
  post: { slug: string; title: string },
  lang: string,
  insightsLabel = 'Insights'
): Record<string, unknown> {
  const url = `${SITE_URL}/${lang}${insightDetailPath(post.slug)}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: insightsLabel,
        item: `${SITE_URL}/${lang}${INSIGHTS_PATH}/`,
      },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
}
