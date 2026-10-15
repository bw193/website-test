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
    '**Standalone label**\n\nBody text.',
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

test('numbered lines typed without a space become a list, labels in bold', () => {
  const html = render('1.Single Touch Switch: One-key control for light and defogging.\n\n2.Stepless Dimming & Color Temperature: Freely switch between 3000K-6000K.\n\n3.Fast Defogging: Clears the mirror quickly.');
  assert.equal((html.match(/<ol>/g) || []).length, 1);
  assert.equal((html.match(/<li>/g) || []).length, 3);
  assert.match(html, /<li><strong>Single Touch Switch:<\/strong> One-key control for light and defogging\.<\/li>/);
  assert.match(html, /<li><strong>Stepless Dimming &amp; Color Temperature:<\/strong> Freely switch/);
});

test('bullet characters, dashes and asterisks typed at the start of lines become lists', () => {
  const dots = render('• Unique bear head shape, frameless style\n• 5mm copper-free silver mirror panel\n• Touch sensor switch');
  assert.match(dots, /^<ul>\s*<li>Unique bear head shape, frameless style<\/li>\s*<li>5mm copper-free silver mirror panel<\/li>\s*<li>Touch sensor switch<\/li>\s*<\/ul>/);
  const dashes = render('3. Smart Functions\n-Touch sensor switch (on/off + dimming)\n-3-color temperature: Warm 3000K / Cool 6000K\n-IP44 waterproof rating');
  assert.match(dashes, /<h3>3\. Smart Functions<\/h3>\s*<ul>\s*<li>Touch sensor switch \(on\/off \+ dimming\)<\/li>\s*<li>3-color temperature: Warm 3000K \/ Cool 6000K<\/li>/);
  const stars = render('Round wall mounted LED mirror for hotel projects.\n*The frosted halo delivers soft face light.\n\n*3 CCT switching with stepless dimming.\n\n*CE certified for European markets');
  assert.match(stars, /<p>Round wall mounted LED mirror for hotel projects\.<\/p>\s*<ul>\s*<li>The frosted halo delivers soft face light\.<\/li>\s*<li>3 CCT switching with stepless dimming\.<\/li>\s*<li>CE certified for European markets<\/li>\s*<\/ul>/);
  assert.ok(!stars.includes('*'));
  // A lone "-20°C" line is text, and real emphasis keeps its asterisks' meaning.
  assert.match(render('Works from\n-20°C to 50°C.'), /<p>Works from<\/p>\s*<p>-20°C to 50°C\.<\/p>/);
  assert.match(render('Products comply with *CE, RoHS* standards.'), /<em>CE, RoHS<\/em>/);
});

test('a label followed by asterisk items, on one line or several, is a bold label over a list', () => {
  const html = render('Mirror Material： \n*Copper-free silver mirror\n*Explosion-proof film backing\n\nLED Strip： *High-brightness 2835 LED, Ra>90 \n*Color temp: 3000K / 6500K\n\nInstallation: *Wall-mounted bracket *Surface or recessed power cord');
  assert.match(html, /<p><strong>Mirror Material:<\/strong><\/p>\s*<ul>\s*<li>Copper-free silver mirror<\/li>\s*<li>Explosion-proof film backing<\/li>\s*<\/ul>/);
  assert.match(html, /<p><strong>LED Strip:<\/strong><\/p>\s*<ul>\s*<li>High-brightness 2835 LED, Ra&gt;90<\/li>\s*<li>Color temp: 3000K \/ 6500K<\/li>/);
  assert.match(html, /<p><strong>Installation:<\/strong><\/p>\s*<ul>\s*<li>Wall-mounted bracket<\/li>\s*<li>Surface or recessed power cord<\/li>/);
  // Lines run together by a translation keep the sentence that came first.
  const joined = render('La forma redonda crea un aspecto limpio. Material del espejo: *Espejo sin cobre *Respaldo antiexplosión');
  assert.match(joined, /<p>La forma redonda crea un aspecto limpio\.<\/p>\s*<p><strong>Material del espejo:<\/strong><\/p>\s*<ul>\s*<li>Espejo sin cobre<\/li>/);
});

test('a title typed over its text becomes a heading; a label keeps its text on the next line', () => {
  const italic = render('*Unique Hanging-Strap Round LED Mirror Design*\nShowcase distinctive interior aesthetics.\n\n*Practical Waterproof Performance*\nIP54 waterproof rating suits humid bathrooms.');
  assert.match(italic, /<h3>Unique Hanging-Strap Round LED Mirror Design<\/h3>\s*<p>Showcase distinctive interior aesthetics\.<\/p>\s*<h3>Practical Waterproof Performance<\/h3>/);
  const label = render('**Single Touch Switch:** \nOne-key control for both light and defogging.\n\n**Fast Defogging:**\nBuilt-in defogging module.');
  assert.match(label, /<p><strong>Single Touch Switch:<\/strong><br>\s*One-key control for both light and defogging\.<\/p>\s*<p><strong>Fast Defogging:<\/strong><br>\s*Built-in defogging module\.<\/p>/);
  const plain = render('Elevate Your Daily Routine with BOLEN Retractable Precision\nExperience the perfect blend of minimalist design and functionality.');
  assert.match(plain, /^<h3>Elevate Your Daily Routine with BOLEN Retractable Precision<\/h3>\s*<p>Experience the perfect blend/);
  const numbered = render('1.Natural Wooden Frame\nWarm wood texture brings a softer feel.  \n2.  Organic Round Design\nThe softly irregular shape creates a focal point.');
  assert.match(numbered, /<h3>1\. Natural Wooden Frame<\/h3>\s*<p>Warm wood texture brings a softer feel\.<\/p>\s*<h3>2\. Organic Round Design<\/h3>\s*<p>The softly irregular shape creates a focal point\.<\/p>/);
});

test('a list whose items are a title over a description becomes headings over their text', () => {
  const html = render('BOLEN supplies LED mirrors worldwide.\n1. Factory Direct Pricing \nAs a manufacturer, we offer ex-factory pricing.\n\n2. Smart Functions \n-Touch sensor switch\n-Anti-fog pad included\n\n3. Certifications & Quality \nProducts comply with *CE, RoHS* standards; \nEMC/LVD test reports available.');
  assert.match(html, /<p>BOLEN supplies LED mirrors worldwide\.<\/p>\s*<h3>1\. Factory Direct Pricing<\/h3>\s*<p>As a manufacturer, we offer ex-factory pricing\.<\/p>/);
  assert.match(html, /<h3>2\. Smart Functions<\/h3>\s*<ul>\s*<li>Touch sensor switch<\/li>\s*<li>Anti-fog pad included<\/li>\s*<\/ul>/);
  assert.match(html, /<h3>3\. Certifications &amp; Quality<\/h3>\s*<p>Products comply with <em>CE, RoHS<\/em> standards; EMC\/LVD test reports available\.<\/p>/);
  assert.ok(!html.includes('<ol'));
  // An ordinary list whose items are not all titled stays as it is.
  assert.equal(normalizeProductDetails('1. First feature\n   Description.\n2. Second feature'), '1. First feature\n   Description.\n2. Second feature');
});

test('"Label: value" lines become a list with bold labels, section labels head their items', () => {
  const html = render('Key Features:\n\n360° Flexible Rotation: The arm rotates a full 360 degrees.\n400mm Retractable Extension: The arm extends up to 400mm.\nSpecifications:\n\nFrame Material: Rust-resistant metal alloy\nColor: Matte Black\nFrameless\nInstallation: Wall-mounted\nInstallation Guide:\n\nMark the hole positions on the wall.\nDrill the holes and insert the anchors.\nSecure the bracket with screws.');
  assert.match(html, /^<p><strong>Key Features:<\/strong><\/p>\s*<ul>\s*<li><strong>360° Flexible Rotation:<\/strong> The arm rotates a full 360 degrees\.<\/li>\s*<li><strong>400mm Retractable Extension:<\/strong>/);
  assert.match(html, /<p><strong>Specifications:<\/strong><\/p>\s*<ul>\s*<li><strong>Frame Material:<\/strong> Rust-resistant metal alloy<\/li>\s*<li><strong>Color:<\/strong> Matte Black<\/li>\s*<li>Frameless<\/li>\s*<li><strong>Installation:<\/strong> Wall-mounted<\/li>\s*<\/ul>/);
  assert.match(html, /<p><strong>Installation Guide:<\/strong><\/p>\s*<ul>\s*<li>Mark the hole positions on the wall\.<\/li>\s*<li>Drill the holes and insert the anchors\.<\/li>\s*<li>Secure the bracket with screws\.<\/li>\s*<\/ul>/);
  // Each typed as a paragraph of its own: the paragraphs stay, labels in bold.
  const paragraphs = render('Single touch switch: one key for light and defogging.\n\nFast defogging: the module clears steam quickly.');
  assert.match(paragraphs, /^<p><strong>Single touch switch:<\/strong> one key for light and defogging\.<\/p>\s*<p><strong>Fast defogging:<\/strong> the module clears steam quickly\.<\/p>/);
  // Times and ratios are not labels.
  assert.match(render('Open 10:30 to 18:00\nScreen ratio 16:9'), /<ul>\s*<li>Open 10:30 to 18:00<\/li>\s*<li>Screen ratio 16:9<\/li>/);
});

test('a title after a list starts a new part, a short item inside a spec list does not', () => {
  const html = render('Frame Depth: 4cm\nInstallation: No assembly required\nPerfect For\nMaster Bedrooms: For a final outfit check.\nEntryways: Makes a grand first impression.');
  assert.match(html, /<li><strong>Installation:<\/strong> No assembly required<\/li>\s*<\/ul>\s*<h3>Perfect For<\/h3>\s*<ul>\s*<li><strong>Master Bedrooms:<\/strong>/);
  const spec = render('Material: 5MM silver mirror\nDimension: 50*70cm/60*80cm\nFrameless\nLogo: Accept customized logo');
  assert.ok(!spec.includes('<h3>'));
  assert.equal((spec.match(/<li>/g) || []).length, 4);
});

test('lines wrapped mid-sentence are joined, separate sentences become paragraphs', () => {
  const html = render('We support full customization.\nYou can also customize the size. The 5MM copper-free silver mirror\nis processed with advanced technology, avoiding discoloration. Our waterproof\ndesign reaches IP44.');
  assert.match(html, /^<p>We support full customization\.<\/p>\s*<p>You can also customize the size\. The 5MM copper-free silver mirror is processed with advanced technology, avoiding discoloration\. Our waterproof design reaches IP44\.<\/p>\s*$/);
});

test('two lists in a row stay two lists', () => {
  const html = render('• Black frame\n• Gold frame\n-Touch switch\n-Dimmer');
  assert.equal((html.match(/<ul>/g) || []).length, 2);
});

test('laying out typed lines is stable when repeated', () => {
  for (const source of [
    'Key Features:\n\n360° Rotation: Full turn.\n400mm Extension: Folds flat.\nSpecifications:\nColor: Black\nSize: 60cm',
    '1.Single Touch Switch: One key.\n\n2.Fast Defogging: Clears steam.',
    'Mirror Material： \n*Copper-free\n*Film backing\n\nLED Strip： *2835 LED *Ra>90',
    '**Single Touch Switch:** \nOne-key control.\n\n*Practical Design*\nIP54 rated.',
    'Intro.\n1. Factory Direct Pricing \nAs a manufacturer, we cut out middlemen.\n\n2. Smart Functions \n-Touch\n-Dimmer',
  ]) {
    const once = normalizeProductDetails(source);
    assert.equal(normalizeProductDetails(once), once);
  }
});
