import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildHomeSchema } from './homeSchema';

const GALLERY = [
  {
    url: 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/site-assets/factory/a.jpg',
    alt: 'BOLEN led mirror manufacturer',
    caption: 'Factory',
  },
];

test('home JSON-LD links the brand entities and serves every image from /media/', () => {
  const [organization, website, gallery] = buildHomeSchema('de', { factoryGallery: GALLERY }) as any[];

  assert.equal(organization['@type'], 'Organization');
  assert.equal(organization['@id'], 'https://bolenmirror.com/#organization');
  assert.equal(organization.name, 'BOLEN Mirror');
  assert.equal(organization.legalName, 'Jiaxing Chengtai Mirror Co., Ltd.');
  assert.equal(organization.logo.url, 'https://bolenmirror.com/media/comp%20image/logo.png');
  assert.equal('sameAs' in organization, false, 'no empty sameAs');

  assert.equal(website['@type'], 'WebSite');
  assert.deepEqual(website.publisher, { '@id': organization['@id'] });
  assert.equal('potentialAction' in website, false, 'the retired sitelinks search box is gone');

  assert.equal(gallery['@type'], 'ImageGallery');
  assert.equal(gallery.url, 'https://bolenmirror.com/de/#factory-showcase');
  assert.equal(gallery.image[0].contentUrl, 'https://bolenmirror.com/media/product-images/site-assets/factory/a.jpg');
  assert.equal(gallery.image[0].creditText, 'BOLEN Mirror');
  assert.equal(gallery.image[0].caption, 'Factory');
});

test('the gallery node is omitted when there are no factory photos', () => {
  assert.deepEqual(
    buildHomeSchema('en').map((node) => node['@type']),
    ['Organization', 'WebSite'],
  );
});
