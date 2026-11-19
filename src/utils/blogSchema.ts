// Shared JSON-LD builders used by both React and the static prerenderer.
// Keep this module browser-safe and preserve property insertion order so
// react-helmet-async can adopt the prerendered scripts without duplicates.

import { INSIGHTS_PATH, insightDetailPath } from '../data/insights';
import { normalizeBlogCover } from './blog';
import { toMediaUrl } from './media';

const SITE_URL = 'https://bolenmirror.com';
const COMPANY_NAME = 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)';
const DEFAULT_OG_IMAGE =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/1773994889396-9i4t1ap.jpg';

const PUBLISHER = {
  '@type': 'Organization',
  name: COMPANY_NAME,
  url: SITE_URL,
  logo: toMediaUrl('https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png'),
};

const HOME_LABELS: Record<string, string> = {
  en: 'Home',
  zh: '首页',
  es: 'Inicio',
  fr: 'Accueil',
  de: 'Startseite',
  it: 'Home',
};

const BLOG_INDEX_DEFAULTS: Record<string, { name: string; description: string; insights: string }> = {
  en: {
    name: 'BOLEN Mirror Insights',
    description:
      'Practical LED mirror sourcing guides, technology explainers, and OEM/ODM manufacturing insight from BOLEN.',
    insights: 'Insights',
  },
  zh: {
    name: 'BOLEN 镜类采购洞察',
    description: '面向 LED 镜、智能镜、浴室镜与定制镜采购的实用指南、技术解析及 OEM/ODM 制造洞察。',
    insights: '洞察',
  },
  es: {
    name: 'Perspectivas de BOLEN Mirror',
    description:
      'Guías prácticas de compra, explicaciones técnicas y perspectivas de fabricación OEM/ODM para espejos LED, inteligentes y a medida.',
    insights: 'Perspectivas',
  },
  fr: {
    name: 'Conseils BOLEN Mirror',
    description:
      "Guides d'achat pratiques, explications techniques et conseils de fabrication OEM/ODM pour les miroirs LED, intelligents et sur mesure.",
    insights: 'Conseils',
  },
  de: {
    name: 'BOLEN Mirror Einblicke',
    description:
      'Praxisnahe Einkaufsratgeber, Technik-Erklärungen und OEM/ODM-Fertigungseinblicke für LED-, Smart- und Maßspiegel.',
    insights: 'Einblicke',
  },
  it: {
    name: 'Approfondimenti BOLEN Mirror',
    description:
      "Guide pratiche all'acquisto, spiegazioni tecniche e approfondimenti OEM/ODM per specchi LED, smart e su misura.",
    insights: 'Approfondimenti',
  },
};

const BLOG_CATEGORY_LABELS: Record<string, Record<string, string>> = {
  'Buying Guide': {
    en: 'Buying Guide',
    zh: '选购指南',
    es: 'Guía de compra',
    fr: "Guide d'achat",
    de: 'Kaufratgeber',
    it: "Guida all'acquisto",
  },
  'Bolen Story': {
    en: 'BOLEN Story',
    zh: 'BOLEN 故事',
    es: 'Historia de BOLEN',
    fr: 'Histoire de BOLEN',
    de: 'BOLEN Geschichte',
    it: 'Storia di BOLEN',
  },
  Technology: {
    en: 'Technology',
    zh: '技术解析',
    es: 'Tecnología',
    fr: 'Technologie',
    de: 'Technologie',
    it: 'Tecnologia',
  },
  Manufacturing: {
    en: 'Manufacturing',
    zh: '生产制造',
    es: 'Fabricación',
    fr: 'Fabrication',
    de: 'Fertigung',
    it: 'Produzione',
  },
  Design: {
    en: 'Design',
    zh: '设计',
    es: 'Diseño',
    fr: 'Design',
    de: 'Design',
    it: 'Design',
  },
};

function isOrganizationAuthorName(name: string): boolean {
  const normalized = name.trim();
  if (!normalized) return true;
  return /^(?:bolen(?:\s+(?:mirror|editorial|team|staff|factory|group|optical.*))?|jiaxing\s+chengtai.*|嘉兴诚泰.*)$/i.test(
    normalized,
  );
}

function buildBlogAuthorNode(rawAuthor: string | null | undefined): Record<string, unknown> {
  const trimmed = (rawAuthor || '').trim();
  if (isOrganizationAuthorName(trimmed)) {
    return {
      '@type': 'Organization',
      name: trimmed || 'BOLEN Editorial',
      url: SITE_URL,
    };
  }
  return {
    '@type': 'Person',
    name: trimmed,
    worksFor: {
      '@type': 'Organization',
      name: COMPANY_NAME,
      url: SITE_URL,
    },
  };
}

function localizeBlogCategory(category: string | null | undefined, lang: string): string {
  const trimmed = (category || '').trim();
  if (!trimmed) return '';
  const map = BLOG_CATEGORY_LABELS[trimmed];
  return map ? map[lang] || map.en || trimmed : trimmed;
}

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
  const defaults = BLOG_INDEX_DEFAULTS[lang] || BLOG_INDEX_DEFAULTS.en;
  const homeLabel = HOME_LABELS[lang] || HOME_LABELS.en;
  const url = `${SITE_URL}/${lang}${INSIGHTS_PATH}/`;
  const name = options.name || defaults.name;
  const description = options.description || defaults.description;
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
        { '@type': 'ListItem', position: 1, name: homeLabel, item: `${SITE_URL}/${lang}/` },
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
  const cover = normalizeBlogCover(post.cover_image) || DEFAULT_OG_IMAGE;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.title,
    image: [toMediaUrl(cover)],
    author: buildBlogAuthorNode(post.author),
    publisher: PUBLISHER,
    inLanguage: lang,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'Blog', '@id': `${SITE_URL}/${lang}${INSIGHTS_PATH}/` },
    url,
  };
  if (post.category) schema.articleSection = localizeBlogCategory(post.category, lang);
  if (lang === 'en' && post.tags?.length) schema.keywords = post.tags.join(', ');
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
  insightsLabel?: string
): Record<string, unknown> {
  const defaults = BLOG_INDEX_DEFAULTS[lang] || BLOG_INDEX_DEFAULTS.en;
  const homeLabel = HOME_LABELS[lang] || HOME_LABELS.en;
  const resolvedInsightsLabel =
    insightsLabel && !(lang !== 'en' && insightsLabel === 'Insights')
      ? insightsLabel
      : defaults.insights;
  const url = `${SITE_URL}/${lang}${insightDetailPath(post.slug)}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: homeLabel, item: `${SITE_URL}/${lang}/` },
      {
        '@type': 'ListItem',
        position: 2,
        name: resolvedInsightsLabel,
        item: `${SITE_URL}/${lang}${INSIGHTS_PATH}/`,
      },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
}
