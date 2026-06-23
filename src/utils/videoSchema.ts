import type { LocalizedVideoPost, VideoListItem } from '../types/video';

const SITE_URL = 'https://bolenmirror.com';
const PUBLISHER = {
  '@type': 'Organization',
  name: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
  url: SITE_URL,
  logo: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png',
};

export function buildVideoIndexSchema(lang: string): unknown[] {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'BOLEN Mirror Video Library',
      description:
        'Product videos, factory walkthroughs, and installation demos for BOLEN LED, smart, vanity, and bath mirrors.',
      url: `${SITE_URL}/${lang}/videos/`,
      inLanguage: lang,
      publisher: PUBLISHER,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}/` },
        { '@type': 'ListItem', position: 2, name: 'Videos', item: `${SITE_URL}/${lang}/videos/` },
      ],
    },
  ];
}

export function buildVideoObjectSchema(video: LocalizedVideoPost | VideoListItem, lang: string): Record<string, unknown> {
  const url = `${SITE_URL}/${lang}/videos/${video.slug}/`;
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: video.excerpt || '',
    thumbnailUrl: video.thumbnail_url ? [video.thumbnail_url] : [],
    uploadDate: video.published_at || ('updated_at' in video ? video.updated_at : undefined) || undefined,
    publisher: PUBLISHER,
    inLanguage: lang,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  if (video.duration_seconds) schema.duration = toIsoDuration(video.duration_seconds);
  if (video.embed_url) schema.embedUrl = video.embed_url;
  if (video.video_url) schema.contentUrl = video.video_url;
  return schema;
}

export function buildVideoBreadcrumbSchema(video: { slug: string; title: string }, lang: string): Record<string, unknown> {
  const url = `${SITE_URL}/${lang}/videos/${video.slug}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: 'Videos', item: `${SITE_URL}/${lang}/videos/` },
      { '@type': 'ListItem', position: 3, name: video.title, item: url },
    ],
  };
}

function toIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${s || (!h && !m) ? `${s}S` : ''}`;
}
