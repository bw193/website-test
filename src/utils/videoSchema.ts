// Shared JSON-LD builders for the video library. Used by both the React pages
// and scripts/prerender-static.ts — keep this module browser-safe and preserve
// property insertion order so react-helmet-async adopts the prerendered
// <script> tags on mount instead of replacing them.

import type { LocalizedVideoPost, VideoListItem } from '../types/video';
import { FALLBACK_VIDEO_THUMB, getVideoPlayback, toIsoDuration } from './video';

const SITE_URL = 'https://bolenmirror.com';
const PUBLISHER = {
  '@type': 'Organization',
  name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
  url: SITE_URL,
  logo: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png',
};

const SCHEMA_COPY: Record<string, { home: string; videos: string; indexName: string; indexDescription: string }> = {
  en: {
    home: 'Home',
    videos: 'Videos',
    indexName: 'BOLEN LED Mirror Video Library',
    indexDescription:
      'Product demos, factory tours, quality-control footage and installation guides for BOLEN LED, smart, vanity and bathroom mirrors.',
  },
  zh: {
    home: '首页',
    videos: '视频',
    indexName: 'BOLEN LED 镜视频库',
    indexDescription: 'BOLEN LED 镜、智能镜、化妆镜和浴室镜的产品演示、工厂实拍、质检画面与安装指南。',
  },
  es: {
    home: 'Inicio',
    videos: 'Videos',
    indexName: 'Biblioteca de videos de espejos LED BOLEN',
    indexDescription:
      'Demostraciones de producto, recorridos de fábrica, control de calidad y guías de instalación para espejos LED, smart, de tocador y de baño BOLEN.',
  },
  fr: {
    home: 'Accueil',
    videos: 'Vidéos',
    indexName: 'Vidéothèque miroirs LED BOLEN',
    indexDescription:
      "Démonstrations produit, visites d'usine, contrôle qualité et guides d'installation pour les miroirs LED, connectés, de toilette et de salle de bain BOLEN.",
  },
  de: {
    home: 'Startseite',
    videos: 'Videos',
    indexName: 'BOLEN LED-Spiegel Videobibliothek',
    indexDescription:
      'Produktdemos, Werksrundgänge, Qualitätskontrolle und Installationsanleitungen für BOLEN LED-, Smart-, Schmink- und Badspiegel.',
  },
  it: {
    home: 'Home',
    videos: 'Video',
    indexName: 'Libreria video specchi LED BOLEN',
    indexDescription:
      'Demo prodotto, tour della fabbrica, controllo qualità e guide di installazione per specchi BOLEN LED, smart, da toeletta e da bagno.',
  },
};

function schemaCopy(lang: string) {
  return SCHEMA_COPY[lang] || SCHEMA_COPY.en;
}

export function videoIndexUrl(lang: string): string {
  return `${SITE_URL}/${lang}/videos/`;
}

export function videoDetailUrl(lang: string, slug: string): string {
  return `${SITE_URL}/${lang}/videos/${slug}/`;
}

/**
 * The VideoObject body shared by the detail page, the index ItemList and the
 * home page. `@context` is added by the callers that emit a standalone node.
 */
function videoObjectCore(video: LocalizedVideoPost | VideoListItem, lang: string): Record<string, unknown> {
  const url = videoDetailUrl(lang, video.slug);
  const playback = getVideoPlayback(video);
  const node: Record<string, unknown> = {
    '@type': 'VideoObject',
    name: video.title,
    description: video.excerpt || video.title,
    thumbnailUrl: [video.thumbnail_url || FALLBACK_VIDEO_THUMB],
    uploadDate: video.published_at || ('updated_at' in video ? video.updated_at : undefined) || undefined,
    publisher: PUBLISHER,
    inLanguage: lang,
    url,
  };
  if (video.duration_seconds) node.duration = toIsoDuration(video.duration_seconds);
  if (playback.kind === 'embed') node.embedUrl = playback.src;
  if (playback.kind === 'video') node.contentUrl = playback.src;
  if (video.category) node.genre = video.category;
  if (video.tags?.length) node.keywords = video.tags.join(', ');
  return node;
}

/**
 * CollectionPage + ItemList(VideoObject) + BreadcrumbList for the localized
 * video library. Passing the visible items lets Google treat the page as a
 * video gallery and discover every watch page from the index alone.
 */
export function buildVideoIndexSchema(lang: string, videos: VideoListItem[] = []): unknown[] {
  const copy = schemaCopy(lang);
  const url = videoIndexUrl(lang);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: copy.indexName,
      description: copy.indexDescription,
      url,
      inLanguage: lang,
      publisher: PUBLISHER,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: copy.indexName,
      numberOfItems: videos.length,
      itemListElement: videos.map((video, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: videoDetailUrl(lang, video.slug),
        item: videoObjectCore(video, lang),
      })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: copy.home, item: `${SITE_URL}/${lang}/` },
        { '@type': 'ListItem', position: 2, name: copy.videos, item: url },
      ],
    },
  ];
}

export function buildVideoObjectSchema(video: LocalizedVideoPost | VideoListItem, lang: string): Record<string, unknown> {
  const url = videoDetailUrl(lang, video.slug);
  const copy = schemaCopy(lang);
  return {
    '@context': 'https://schema.org',
    ...videoObjectCore(video, lang),
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'CollectionPage', '@id': videoIndexUrl(lang), name: copy.indexName },
  };
}

export function buildVideoBreadcrumbSchema(video: { slug: string; title: string }, lang: string): Record<string, unknown> {
  const url = videoDetailUrl(lang, video.slug);
  const copy = schemaCopy(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.home, item: `${SITE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: copy.videos, item: videoIndexUrl(lang) },
      { '@type': 'ListItem', position: 3, name: video.title, item: url },
    ],
  };
}
