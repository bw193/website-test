import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mediaSourceUrl, mediaUpstreamUrl, toMediaPath, toMediaTransformPath, toMediaUrl } from './media';
import { imageSrcSet, optimizeImage } from './optimizeImage';

const STORAGE = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1';
const PRODUCT = `${STORAGE}/object/public/product-images/products/1789869664636-ohqsx8j.jpg`;
const LOGO = `${STORAGE}/object/public/comp%20image/logo.png`;

test('Supabase images map to same-origin /media/ paths and absolute URLs', () => {
  assert.equal(toMediaPath(PRODUCT), '/media/product-images/products/1789869664636-ohqsx8j.jpg');
  assert.equal(toMediaUrl(PRODUCT), 'https://bolenmirror.com/media/product-images/products/1789869664636-ohqsx8j.jpg');
  assert.equal(toMediaPath(LOGO), '/media/comp%20image/logo.png');
  // Raw and pre-encoded spellings of the same object agree.
  assert.equal(toMediaPath(`${STORAGE}/object/public/comp image/logo.png`), '/media/comp%20image/logo.png');
  assert.equal(toMediaPath(`${STORAGE}/object/public/comp%20image/CE(1)(1).jpg`), '/media/comp%20image/CE(1)(1).jpg');
  assert.equal(toMediaUrl('/media/comp%20image/logo.png'), 'https://bolenmirror.com/media/comp%20image/logo.png');
});

test('everything the proxy does not serve is left untouched', () => {
  const untouched = [
    'https://i.ytimg.com/vi/yQKZzgU23Nk/maxresdefault.jpg',
    '/hero/lcp-1280.webp',
    `${STORAGE}/object/public/other-bucket/file.jpg`,
    `${STORAGE}/object/public/product-videos/videos/1789897842547-h6eyqac.mp4`,
    'data:image/svg+xml;base64,AAAA',
  ];
  for (const url of untouched) {
    assert.equal(toMediaPath(url), url);
    assert.equal(toMediaUrl(url), url);
  }
  assert.equal(toMediaPath(null), null);
  assert.equal(toMediaUrl(undefined), undefined);
});

test('optimizeImage emits /media/ transform URLs with the same parameters as before', () => {
  assert.equal(optimizeImage(PRODUCT, { width: 800 }), '/media/product-images/products/1789869664636-ohqsx8j.jpg?width=800&resize=contain');
  assert.equal(
    optimizeImage(PRODUCT, { width: 1200, height: 675, resize: 'cover', quality: 85 }),
    '/media/product-images/products/1789869664636-ohqsx8j.jpg?width=1200&height=675&quality=85&resize=cover',
  );
  assert.equal(
    imageSrcSet(LOGO, [400, 800]),
    '/media/comp%20image/logo.png?width=400&resize=contain 400w, /media/comp%20image/logo.png?width=800&resize=contain 800w',
  );
  // Unmapped buckets keep the direct Supabase transform; other hosts are untouched.
  assert.equal(
    optimizeImage(`${STORAGE}/object/public/other-bucket/a.jpg`, { width: 400 }),
    `${STORAGE}/render/image/public/other-bucket/a.jpg?width=400&resize=contain`,
  );
  assert.equal(optimizeImage('https://i.ytimg.com/vi/x/hqdefault.jpg', { width: 400 }), 'https://i.ytimg.com/vi/x/hqdefault.jpg');
  assert.equal(optimizeImage(''), '');
});

test('/media/ requests resolve to the Supabase object or transform they stand for', () => {
  const resolve = (path: string) => {
    const url = new URL(path, 'https://bolenmirror.com');
    return mediaUpstreamUrl(url.pathname, url.searchParams);
  };
  assert.equal(resolve('/media/product-images/products/a.jpg'), `${STORAGE}/object/public/product-images/products/a.jpg`);
  assert.equal(
    resolve('/media/comp%20image/logo.png?width=400&resize=contain&utm_source=x'),
    `${STORAGE}/render/image/public/comp%20image/logo.png?width=400&resize=contain`,
  );
  // Round trip: the proxy asks Supabase for exactly what optimizeImage used to request directly.
  assert.equal(
    mediaSourceUrl(optimizeImage(PRODUCT, { width: 640 })),
    `${STORAGE}/render/image/public/product-images/products/1789869664636-ohqsx8j.jpg?width=640&resize=contain`,
  );
  assert.equal(mediaSourceUrl('/hero/lcp-640.webp'), '/hero/lcp-640.webp');
});

test('the proxy refuses unknown buckets, non-images, traversal and bad parameters', () => {
  const refused = [
    '/media/private-bucket/a.jpg',
    '/media/product-videos/videos/a.mp4',
    '/media/product-images/products/page.html',
    '/media/product-images',
    '/media/product-images//a.jpg',
    '/media/product-images/%2e%2e/secret.jpg',
    '/media/product-images/a.jpg?width=9999',
    '/media/product-images/a.jpg?resize=stretch',
    '/media/product-images/a.jpg?quality=5',
    '/media/product-images/%E0%A4%A.jpg',
    '/other/product-images/a.jpg',
  ];
  for (const path of refused) {
    const [pathname, query = ''] = path.split('?');
    assert.equal(mediaUpstreamUrl(pathname, new URLSearchParams(query)), null, path);
  }
  assert.equal(toMediaTransformPath(PRODUCT, new URLSearchParams('width=0')), null);
});
