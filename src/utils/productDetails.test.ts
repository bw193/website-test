import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderMarkdownToHtml } from '../components/Markdown';
import { normalizeProductDetails } from './productDetails';

const render = (source: string) => renderMarkdownToHtml(normalizeProductDetails(source));

test('legacy feature markers become headings separated from their descriptions', () => {
  const html = render('**FULL LENGTH VIEW – SEE YOUR OUTFIT HEAD TO TOE\nGenerous full-size surface.\n\n ** IP44 Waterproof Rating\nResists water splash.');
  assert.match(html, /<h3>FULL LENGTH VIEW – SEE YOUR OUTFIT HEAD TO TOE<\/h3>\s*<p>Generous full-size surface\.<\/p>/);
  assert.match(html, /<h3>IP44 Waterproof Rating<\/h3>\s*<p>Resists water splash\.<\/p>/);
  assert.ok(!html.includes('**'));
});

test('consecutive features preserve valid inline emphasis and all body text', () => {
  const html = render('**COLOUR TEMPERATURES\nToggle **Warm White (3000K)** and **Cool White (6000K)**.\n**FULLY DIMMABLE\nLong-press to dim.');
  assert.equal((html.match(/<h3>/g) || []).length, 2);
  assert.match(html, /<strong>Warm White \(3000K\)<\/strong>/);
  assert.match(html, /<strong>Cool White \(6000K\)<\/strong>/);
  assert.match(html, /<p>Long-press to dim\.<\/p>/);
});

test('inline feature labels get bold labels and separate paragraphs', () => {
  const html = render('Introduction.\n**Ideal for:Modern bathrooms and hotels.\n**Box contents:1 × Mirror, 1 × Wall Mounting Kit.');
  assert.match(html, /<p>Introduction\.<\/p>/);
  assert.match(html, /<p><strong>Ideal for:<\/strong> Modern bathrooms and hotels\.<\/p>/);
  assert.match(html, /<p><strong>Box contents:<\/strong> 1 × Mirror, 1 × Wall Mounting Kit\.<\/p>/);
});

test('editor whitespace inside bold labels is repaired without exposing leftover markers', () => {
  const html = render('**Dual Touch Switches:\u00a0**Two dedicated keys.\n\n**5mm Copper-Free Silver Mirror: **Clear glass.\n\n**Waterproof rating: IP44: **\nResists splashes.');
  assert.match(html, /<strong>Dual Touch Switches:<\/strong> Two dedicated keys\./);
  assert.match(html, /<strong>5mm Copper-Free Silver Mirror:<\/strong> Clear glass\./);
  assert.match(html, /<strong>Waterproof rating: IP44:<\/strong><br>\s*Resists splashes\./);
  assert.ok(!html.includes('**'));
});

test('split opening markers become separate feature labels', () => {
  const html = render('Previous feature body.\n**\nWall-Mounted Design**\nDesigned for wall mounting.');
  assert.match(html, /<p>Previous feature body\.<\/p>/);
  assert.match(html, /<strong>Wall-Mounted Design<\/strong>/);
  assert.match(html, /Designed for wall mounting\./);
  assert.ok(!html.includes('**'));
});

test('a missing space in a marked bullet is repaired into the original list', () => {
  const html = render('- **Mirror glass**: Clear imaging.\n\n-** LED light strip**: Even illumination.\n\n- **Waterproof**: Resists splashes.');
  assert.equal((html.match(/<ul>/g) || []).length, 1);
  assert.equal((html.match(/<li>/g) || []).length, 3);
  assert.match(html, /<strong>LED light strip<\/strong>: Even illumination\./);
  assert.ok(!html.includes('**'));
});

test('a stray final marker is removed from list copy while valid emphasis stays intact', () => {
  assert.ok(!render('1. Waterproof rating\nResists splashes.**').includes('**'));
  for (const source of ['**A complete bold sentence.**', '1. **A bold list item.**', '```md\nLiteral.**\n```']) {
    assert.equal(normalizeProductDetails(source), source);
  }
});

test('stray sentence markers retain the feature title and normal body weight', () => {
  const html = render('Elegant Oval Shape\n**A soft oval silhouette brings a refined focal point.\n\nProject-Friendly Design\n***Suitable for distributors and hotel projects.');
  assert.match(html, /<h3>Elegant Oval Shape<\/h3>\s*<p>A soft oval silhouette brings a refined focal point\.<\/p>/);
  assert.match(html, /<h3>Project-Friendly Design<\/h3>\s*<p>Suitable for distributors and hotel projects\.<\/p>/);
  assert.ok(!html.includes('**'));
});

test('the unmarked opening feature in legacy descriptions also becomes a heading', () => {
  const html = render('ARCHED DESIGN – ELEVATE YOUR BATHROOM STYLE\nThe elegant arched silhouette.\n\n**TOUCH SENSOR CONTROL\nTap to turn on/off.');
  assert.match(html, /<h3>ARCHED DESIGN – ELEVATE YOUR BATHROOM STYLE<\/h3>/);
  assert.match(html, /<p>The elegant arched silhouette\.<\/p>/);
});

test('existing Markdown and translated descriptions remain unchanged', () => {
  for (const source of [
    'Ordinary product details with **bold** and *italic* text.',
    '**A valid bold\nparagraph**',
    '**Standalone label**\nBody text.',
    '### 产品特点\n\n支持 **三色调光**。',
    '### Éclairage\n\nUne lumière **douce** et réglable.',
    '1. First feature\n   Description.\n2. Second feature',
    '| Feature | Value |\n| --- | --- |\n| Size | 50 × 150 |',
    '```md\n**Keep this literal\n```\n\n    **Indented code',
    'A literal \\** marker and `**code`.',
  ]) assert.equal(normalizeProductDetails(source), source);
});

test('repairs preserve valid multiline bold, code, lists and links in the same document', () => {
  const intact = '**A valid bold\nparagraph**\n\n```md\n**Keep this literal\n```\n\n- **List feature**\n\n[Details][ref] and `**literal`.\n\n[ref]: https://example.com\n';
  const normalized = normalizeProductDetails(`**BROKEN FEATURE\nBody.\n\n${intact}`);
  assert.ok(normalized.endsWith(intact));
  assert.match(renderMarkdownToHtml(normalized), /<strong>A valid bold\nparagraph<\/strong>/);
  const adjacent = render('**FEATURE\nBody text.\n### Existing heading\n- First item\n- Second item');
  assert.match(adjacent, /<p>Body text\.<\/p>\s*<h3>Existing heading<\/h3>\s*<ul>/);
});

test('empty details and repeated normalization are safe', () => {
  assert.equal(normalizeProductDetails(null), '');
  assert.equal(normalizeProductDetails(undefined), '');
  assert.equal(normalizeProductDetails(''), '');
  const normalized = normalizeProductDetails('**FEATURE\nBody text.\n');
  assert.equal(normalizeProductDetails(normalized), normalized);
});
