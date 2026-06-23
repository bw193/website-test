import type { LocalizedVideoPost, VideoListItem } from '../types/video';

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
    indexName: 'BOLEN Mirror Video Library',
    indexDescription:
      'Product videos, factory walkthroughs, and installation demos for BOLEN LED, smart, vanity, and bath mirrors.',
  },
  zh: {
    home: '首页',
    videos: '视频',
    indexName: 'BOLEN 镜业视频库',
    indexDescription: 'BOLEN LED 镜、智能镜、化妆镜和浴室镜的产品视频、工厂实拍和安装演示。',
  },
  es: {
    home: 'Inicio',
    videos: 'Videos',
    indexName: 'Biblioteca de videos de BOLEN Mirror',
    indexDescription:
      'Videos de producto, recorridos de fábrica y demostraciones de instalación para espejos LED, smart, de tocador y de baño BOLEN.',
  },
  fr: {
    home: 'Accueil',
    videos: 'Vidéos',
    indexName: 'Vidéothèque BOLEN Mirror',
    indexDescription:
      "Vidéos produit, visites d'usine et démonstrations d'installation pour les miroirs LED, intelligents, de toilette et de salle de bain BOLEN.",
  },
  de: {
    home: 'Startseite',
    videos: 'Videos',
    indexName: 'BOLEN Mirror Videobibliothek',
    indexDescription:
      'Produktvideos, Werksrundgänge und Installationsdemos für BOLEN LED-, Smart-, Schmink- und Badspiegel.',
  },
  it: {
    home: 'Home',
    videos: 'Video',
    indexName: 'Libreria video BOLEN Mirror',
    indexDescription:
      'Video prodotto, tour della fabbrica e demo di installazione per specchi BOLEN LED, smart, da toeletta e da bagno.',
  },
};

function schemaCopy(lang: string) {
  return SCHEMA_COPY[lang] || SCHEMA_COPY.en;
}

export function buildVideoIndexSchema(lang: string): unknown[] {
  const copy = schemaCopy(lang);
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: copy.indexName,
      description: copy.indexDescription,
      url: `${SITE_URL}/${lang}/videos/`,
      inLanguage: lang,
      publisher: PUBLISHER,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: copy.home, item: `${SITE_URL}/${lang}/` },
        { '@type': 'ListItem', position: 2, name: copy.videos, item: `${SITE_URL}/${lang}/videos/` },
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
  const copy = schemaCopy(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: copy.home, item: `${SITE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: copy.videos, item: `${SITE_URL}/${lang}/videos/` },
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
