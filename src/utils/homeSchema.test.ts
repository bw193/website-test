import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildHomeSchema } from './homeSchema';

const GALLERY = [
  {
    url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/factory/a.jpg',
    alt: 'BOLEN LED-Spiegel Hersteller',
    caption: 'Werk',
  },
];

test('home JSON-LD links brand entities, localizes copy per language, serves images from /media/, and never emits standalone VideoObject', () => {
  const featuredVideo = {
    id: 'vid-1',
    slug: 'bolen-source-factory',
    source_type: 'upload' as const,
    video_url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-videos/videos/a.mp4',
    embed_url: null,
    thumbnail_url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-videos/thumbnails/a.jpg',
    category: 'Factory Tour',
    tags: [],
    duration_seconds: 130,
    published_at: '2026-09-01T00:00:00Z',
    title: 'BOLEN Werk',
    excerpt: 'Rundgang durch das BOLEN Werk.',
  };

  const nodes = buildHomeSchema('de', { factoryGallery: GALLERY, featuredVideo }) as any[];
  assert.deepEqual(
    nodes.map((node) => node['@type']),
    ['Organization', 'WebSite', 'ImageGallery'],
    'standalone VideoObject must not be emitted on the homepage',
  );

  const [organization, website, gallery] = nodes;

  assert.equal(organization['@type'], 'Organization');
  assert.equal(organization['@id'], 'https://bolenmirror.com/#organization');
  assert.equal(organization.name, 'BOLEN Mirror');
  assert.equal(organization.legalName, 'Jiaxing Chengtai Mirror Co., Ltd.');
  assert.equal(organization.logo.url, 'https://bolenmirror.com/media/comp%20image/logo.png');
  assert.match(organization.description, /Hersteller und Lieferant von LED-Spiegeln/);
  assert.equal(organization.contactPoint.contactType, 'sales');
  assert.deepEqual(organization.contactPoint.availableLanguage, ['en', 'zh', 'es', 'fr', 'de', 'it']);
  assert.equal('sameAs' in organization, false, 'no empty sameAs');

  assert.equal(website['@type'], 'WebSite');
  assert.deepEqual(website.publisher, { '@id': organization['@id'] });
  assert.equal('potentialAction' in website, false, 'the retired sitelinks search box is gone');

  assert.equal(gallery['@type'], 'ImageGallery');
  assert.equal(gallery.inLanguage, 'de');
  assert.equal(gallery.name, 'Einblick in das BOLEN Spiegelwerk');
  assert.match(gallery.description, /Fotos aus dem BOLEN Werk/);
  assert.equal(gallery.url, 'https://bolenmirror.com/de/#factory-showcase');
  assert.equal(gallery.image[0].contentUrl, 'https://bolenmirror.com/media/product-images/site-assets/factory/a.jpg');
  assert.equal(gallery.image[0].creditText, 'BOLEN Mirror');
  assert.equal(gallery.image[0].caption, 'Werk');
});

test('localizes Organization and ImageGallery strings across all 6 languages', () => {
  for (const lang of ['en', 'zh', 'es', 'fr', 'de', 'it']) {
    const [org, , gallery] = buildHomeSchema(lang, { factoryGallery: GALLERY }) as any[];
    assert.ok(typeof org.description === 'string' && org.description.length > 40, lang);
    assert.ok(typeof gallery.name === 'string' && gallery.name.length > 5, lang);
    if (lang !== 'en') {
      const [enOrg, , enGallery] = buildHomeSchema('en', { factoryGallery: GALLERY }) as any[];
      assert.notEqual(org.description, enOrg.description, `${lang} org description must be localized`);
      assert.notEqual(gallery.name, enGallery.name, `${lang} gallery name must be localized`);
    }
  }
});

test('the gallery node is omitted when there are no factory photos', () => {
  assert.deepEqual(
    buildHomeSchema('en').map((node) => node['@type']),
    ['Organization', 'WebSite'],
  );
});
