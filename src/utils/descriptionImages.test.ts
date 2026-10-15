import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderMarkdownToHtml } from '../components/Markdown';
import {
  MAX_DESCRIPTION_CHARS,
  checkDescription,
  collectUsedDescriptions,
  descriptionImageMarkdown,
  descriptionImageSize,
  extractDescriptionImages,
  findDescriptionImageProblems,
  insertDescriptionImage,
  removeDescriptionImage,
} from './descriptionImages';
import { markdownToPlainText } from './productSeo';

const BASE = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/product-images/products';
const UPLOAD = `${BASE}/1791000000000-k3f9x2a-1600x1200.webp`;
const LAYERS = 'Layer structure of the 5 mm copper-free silver mirror in this backlit LED mirror';

const photo = (description: string, src = UPLOAD) => descriptionImageMarkdown(src, description);
const render = (source: string) => renderMarkdownToHtml(source, { descriptionImages: true });

test('reads each photo and its description in page order', () => {
  const details = `Features:\n\n${photo('Edge & "black edge" check on the 5 mm mirror glass')}\n\n1. Copper free\n\n${photo(LAYERS, `${BASE}/a.jpg`)}\n`;
  assert.deepEqual(
    extractDescriptionImages(details).map(({ src, description }) => ({ src, description })),
    [
      { src: UPLOAD, description: 'Edge & "black edge" check on the 5 mm mirror glass' },
      { src: `${BASE}/a.jpg`, description: LAYERS },
    ],
  );
  assert.deepEqual(extractDescriptionImages('No photos here.'), []);
  assert.deepEqual(extractDescriptionImages(null), []);
});

test('Markdown characters in a description survive the round trip', () => {
  const description = 'Size 60*80*100 cm [front] with 5_mm glass, Q&A <b> and a \\ backslash';
  const markdown = photo(description);
  assert.equal(extractDescriptionImages(markdown)[0].description, description);
  const html = render(markdown);
  assert.match(html, /alt="Size 60\*80\*100 cm \[front\] with 5_mm glass, Q&amp;A &lt;b&gt; and a \\ backslash"/);
  assert.match(html, /<figcaption>Size 60\*80\*100 cm \[front\] with 5_mm glass, Q&amp;A &lt;b&gt; and a \\ backslash<\/figcaption>/);
  assert.ok(!html.includes('<em>'));
  // Line breaks typed into a description become spaces, and URLs stay one token.
  assert.equal(photo('Two\nlines', `${BASE}/a (1).jpg`), `![Two lines](${BASE}/a%20%281%29.jpg)`);
});

test('a description needs six words and at most 300 characters', () => {
  assert.deepEqual(checkDescription('   '), { kind: 'missing' });
  assert.deepEqual(checkDescription('Copper-free silver mirror layers'), { kind: 'tooShort' });
  assert.deepEqual(checkDescription(`${'word '.repeat(70)}end`), { kind: 'tooLong' });
  assert.deepEqual(checkDescription('x'.repeat(MAX_DESCRIPTION_CHARS)), { kind: 'tooShort' });
  assert.equal(checkDescription(LAYERS), null);
});

test('case, punctuation and spacing do not make a description new', () => {
  const used = [{ productId: 'p-40', productTitle: 'Round Backlit LED Mirror', description: LAYERS }];
  assert.deepEqual(checkDescription(`  ${LAYERS.toUpperCase()}!! `, { usedElsewhere: used }), {
    kind: 'usedElsewhere',
    productTitle: 'Round Backlit LED Mirror',
  });
  assert.deepEqual(checkDescription(LAYERS.replace(/ /g, '   '), { others: [LAYERS] }), { kind: 'repeatedHere' });
  assert.equal(checkDescription(`${LAYERS}, shown in cross-section`, { others: [LAYERS], usedElsewhere: used }), null);
});

test('a save lists every photo that breaks a rule, counting photos from 1', () => {
  const used = [{ productId: 'p-40', productTitle: 'Round Backlit LED Mirror', description: 'Anti-fog pad behind the glass of this round backlit mirror' }];
  const details = [
    photo(LAYERS),
    photo('Mirror layers'),
    photo(LAYERS.toLowerCase()),
    photo('Anti-fog pad behind the glass of this round backlit mirror'),
    `Typed by hand ![](${BASE}/pasted.jpg) inside a sentence.`,
  ].join('\n\n');
  assert.deepEqual(findDescriptionImageProblems(details, used), [
    { kind: 'tooShort', photo: 2 },
    { kind: 'repeatedHere', photo: 3 },
    { kind: 'usedElsewhere', productTitle: 'Round Backlit LED Mirror', photo: 4 },
    { kind: 'missing', photo: 5 },
  ]);
  assert.deepEqual(findDescriptionImageProblems(`Plain text.\n\n${photo(LAYERS)}`, used), []);
});

test("a product's own photos never count as used elsewhere", () => {
  const products = [
    { id: 'p-38', title: 'Square LED Mirror', details: photo(LAYERS) },
    { id: 'p-40', title: 'Round Backlit LED Mirror', details: `Text\n\n${photo('Anti-fog pad behind the glass of this round backlit mirror')}` },
    { id: 'p-41', title: 'No Photos', details: 'Just text.' },
  ];
  assert.deepEqual(
    collectUsedDescriptions(products, 'p-38').map((used) => used.productTitle),
    ['Round Backlit LED Mirror'],
  );
  assert.equal(collectUsedDescriptions(products).length, 2);
});

test('a photo is inserted at the cursor as a paragraph of its own', () => {
  const image = photo(LAYERS);
  assert.equal(insertDescriptionImage('', 0, image).text, `${image}\n`);
  assert.equal(insertDescriptionImage('Intro.', 6, image).text, `Intro.\n\n${image}\n`);
  assert.equal(insertDescriptionImage('Intro.\n\nMore.', 8, image).text, `Intro.\n\n${image}\n\nMore.`);
  assert.equal(insertDescriptionImage('Intro.\nMore.', 7, image).text, `Intro.\n\n${image}\n\nMore.`);
  // In the middle of a sentence the photo splits it.
  const split = insertDescriptionImage('Left half right half.', 9, image);
  assert.equal(split.text, `Left half\n\n${image}\n\nright half.`);
  assert.equal(split.text.slice(0, split.cursor), `Left half\n\n${image}`);
  // The edit itself, for typing it in through the browser.
  assert.equal(`Left half right half.`.slice(0, split.start) + split.insert + `Left half right half.`.slice(split.end), split.text);
});

test('removing a photo closes up the blank lines it leaves', () => {
  const image = photo(LAYERS);
  const remove = (details: string) => removeDescriptionImage(details, extractDescriptionImages(details)[0]);
  assert.equal(remove(`Intro.\n\n${image}\n\nMore.`), 'Intro.\n\nMore.');
  assert.equal(remove(`${image}\n\nMore.`), 'More.');
  assert.equal(remove(`Intro.\n\n${image}\n`), 'Intro.\n');
  assert.equal(remove(`Before ${image} after.`), 'Before\nafter.');
  // A stale position never removes anything else.
  assert.equal(removeDescriptionImage('Changed text.', { raw: image, start: 0 }), 'Changed text.');
});

test('uploads carry their size in the file name', () => {
  assert.deepEqual(descriptionImageSize(UPLOAD), { width: 1600, height: 1200 });
  assert.deepEqual(descriptionImageSize(`${BASE}/1791000000000-k3f9x2a-800x2000.jpg?v=1`), { width: 800, height: 2000 });
  assert.equal(descriptionImageSize(`${BASE}/1775203172734-eucvy6d.jpg`), null);
  assert.equal(descriptionImageSize(`${BASE}/logo-0x0.png`), null);
});

test('the product page shows each photo as a lazy, responsive, captioned figure', () => {
  const html = render(`Features:\n\n${photo(LAYERS)}\n\n1. Copper free`);
  assert.match(html, /^<p>Features:<\/p>\n<figure class="description-image"><img /);
  assert.match(html, /src="\/media\/product-images\/products\/1791000000000-k3f9x2a-1600x1200\.webp\?width=1200&amp;resize=contain"/);
  assert.match(html, /srcset="[^"]+\?width=480&amp;resize=contain 480w, [^"]+\?width=800&amp;resize=contain 800w, [^"]+\?width=1200&amp;resize=contain 1200w, [^"]+\?width=1600&amp;resize=contain 1600w" sizes="[^"]+"/);
  assert.match(html, /width="1600" height="1200" style="max-width:1600px" alt="Layer structure[^"]+" loading="lazy" decoding="async">/);
  assert.match(html, /<figcaption>Layer structure of the 5 mm copper-free silver mirror in this backlit LED mirror<\/figcaption><\/figure>/);
  assert.match(html, /<ol>\s*<li>Copper free<\/li>/);
});

test('text around a photo in the same paragraph stays in paragraphs of its own', () => {
  const html = render(`Before the photo\n${photo(LAYERS)}\nand **after** it.`);
  assert.match(html, /^<p>Before the photo<\/p>\n<figure [^]*<\/figure>\n<p>and <strong>after<\/strong> it\.<\/p>\n$/);
});

test('small and unsized photos are never stretched or fetched wider than needed', () => {
  const small = render(photo(LAYERS, `${BASE}/1791000000000-k3f9x2a-400x300.png`));
  assert.ok(!small.includes('srcset'));
  assert.match(small, /src="[^"]+-400x300\.png\?width=400&amp;resize=contain"[^>]* width="400" height="300" style="max-width:400px"/);
  const unsized = render(photo(LAYERS, `${BASE}/1775203172734-eucvy6d.jpg`));
  assert.match(unsized, / 1600w"/);
  assert.ok(!unsized.includes(' width="'));
  // Files the image service can't resize are served as they are.
  assert.match(render(photo(LAYERS, `${BASE}/diagram.gif`)), /src="\/media\/product-images\/products\/diagram\.gif"/);
});

test('unsafe photo URLs are dropped and other Markdown pages keep plain images', () => {
  assert.equal(render(`![${LAYERS}](javascript:alert(1))`).trim(), '');
  const blog = renderMarkdownToHtml(`Text\n\n${photo(LAYERS)}`);
  assert.ok(!blog.includes('<figure'));
  assert.match(blog, /<p><img src="\/media\/product-images\/products\/1791000000000-k3f9x2a-1600x1200\.webp"/);
});

test('photo Markdown never leaks into meta descriptions', () => {
  const details = `Bright mirror.\n\n${photo('Size [60*80] cm of this mirror with a frosted edge')}\n\nEasy to install.`;
  assert.equal(markdownToPlainText(details), 'Bright mirror. Easy to install.');
});
