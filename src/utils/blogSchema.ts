// Shared JSON-LD builders used by BOTH the React <SEO> component (Blog.tsx /
// BlogPost.tsx) AND the browserless prerender (scripts/prerender-static.ts).
//
// Both sides must emit BYTE-IDENTICAL JSON so react-helmet-async's isEqualNode
// check adopts the prerendered <script type="application/ld+json"> tags on
// mount instead of removing them and appending duplicates. Because both call
// the SAME function with the SAME inputs, the serialized output matches.
//
// Keep this module dependency-free (no React, no Node APIs) and preserve key
// insertion order — JSON.stringify follows it and isEqualNode compares bytes.

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
  published_at?: string | null;
  updated_at?: string | null;
}

/** Blog + BreadcrumbList for the index page. */
export function buildBlogIndexSchema(lang: string): unknown[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'The BOLEN Journal',
      description:
        'Guides, technology explainers, and manufacturing insight on LED mirrors, smart mirrors, and OEM/ODM production from BOLEN.',
      url: `${SITE_URL}/${lang}/blog/`,
      inLanguage: lang,
      publisher: PUBLISHER,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}/` },
        { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/${lang}/blog/` },
      ],
    },
  ];
}

/** BlogPosting for an article page. */
export function buildBlogPostingSchema(post: BlogPostingSchemaInput, lang: string): Record<string, unknown> {
  const url = `${SITE_URL}/${lang}/blog/${post.slug}/`;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.cover_image ? [post.cover_image] : [],
    author: { '@type': 'Organization', name: post.author || 'BOLEN Editorial' },
    publisher: PUBLISHER,
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
  };
  // Appended conditionally and last so both renderers produce identical key
  // order whether or not the dates are present.
  if (post.published_at) schema.datePublished = post.published_at;
  if (post.updated_at || post.published_at) schema.dateModified = post.updated_at || post.published_at;
  return schema;
}

/** BreadcrumbList (Home → Journal → article) for an article page. */
export function buildBlogBreadcrumbSchema(post: { slug: string; title: string }, lang: string): Record<string, unknown> {
  const url = `${SITE_URL}/${lang}/blog/${post.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/${lang}/blog/` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
}
