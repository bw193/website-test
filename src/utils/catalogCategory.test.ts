import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildCatalogCategorySchema,
  getCatalogCategoryPageCopy,
  getCatalogCategorySeoTitle,
  type CatalogCategorySchemaProduct,
} from './catalogCategory';

const approvedTitles = [
  ['hot-sale', 'Wholesale Mirror Supplier | Hot-Selling Mirror Manufacturer'],
  ['led-lighted-mirror', 'LED Bathroom Mirror Manufacturer | LED Lighted Mirror Supplier'],
  ['bathroom-mirror-without-led', 'Non-LED Bathroom Mirrors | Bathroom Mirror Manufacturer'],
  ['full-length-dressing-mirror', 'Full-Length Mirror Manufacturer | Dressing Mirror Supplier'],
  ['irregular-mirror', 'Custom Irregular Mirrors | Professional Irregular Mirror Manufacturer'],
  ['mirror-cabinet', 'LED Mirror Cabinet Manufacturer | Mirror Cabinet Manufacturing'],
] as const;

const translatedSeo = {
  "zh": {
    "titles": {
      "hot-sale": "镜子批发供应商 | 热销镜子制造商",
      "led-lighted-mirror": "LED 浴室镜制造商 | LED 发光镜供应商",
      "bathroom-mirror-without-led": "无 LED 浴室镜 | 浴室镜制造商",
      "full-length-dressing-mirror": "全身镜制造商 | 穿衣镜供应商",
      "irregular-mirror": "定制异形镜 | 专业异形镜制造商",
      "mirror-cabinet": "LED 镜柜制造商 | 镜柜制造"
    },
    "copy": {
      "hot-sale": {
        "h1": "热销镜子批发",
        "description": "选购镜子批发供应商与制造商提供的热销镜子。支持定制尺寸、镜框及表面处理，适用于品牌商、零售商和酒店项目。"
      },
      "led-lighted-mirror": {
        "h1": "LED 浴室镜制造商",
        "description": "采购 LED 发光浴室镜，支持定制尺寸，并提供调光和防雾选项。为品牌商和酒店提供 OEM/ODM 镜子制造及批发供应。"
      },
      "bathroom-mirror-without-led": {
        "h1": "浴室镜制造商",
        "description": "采购有框及无框设计的无 LED 浴室镜。支持定制尺寸、材料和表面处理，为品牌商和酒店提供 OEM/ODM 镜子制造服务。"
      },
      "full-length-dressing-mirror": {
        "h1": "全身穿衣镜制造商",
        "description": "从制造商和批发供应商处采购全身穿衣镜。支持定制尺寸、镜框和表面处理，适用于酒店、零售商及家居品牌。"
      },
      "irregular-mirror": {
        "h1": "定制异形镜制造商",
        "description": "向专业镜子制造商采购定制异形镜。支持定制形状、尺寸和表面处理，为品牌商及酒店项目提供 OEM/ODM 供应服务。"
      },
      "mirror-cabinet": {
        "h1": "LED 镜柜制造商",
        "description": "采购兼具实用储物空间的 LED 镜柜，支持定制尺寸与表面处理。为品牌商和酒店提供 OEM/ODM 镜柜制造及批发供应。"
      }
    }
  },
  "es": {
    "titles": {
      "hot-sale": "Proveedor mayorista de espejos | Fabricante de los espejos más vendidos",
      "led-lighted-mirror": "Fabricante de espejos de baño LED | Proveedor de espejos con luz LED",
      "bathroom-mirror-without-led": "Espejos de baño sin LED | Fabricante de espejos de baño",
      "full-length-dressing-mirror": "Fabricante de espejos de cuerpo entero | Proveedor de espejos de vestidor",
      "irregular-mirror": "Espejos irregulares a medida | Fabricante profesional de espejos irregulares",
      "mirror-cabinet": "Fabricante de armarios con espejo LED | Fabricación de armarios con espejo"
    },
    "copy": {
      "hot-sale": {
        "h1": "Espejos más vendidos al por mayor",
        "description": "Descubra los espejos más vendidos de un proveedor mayorista y fabricante de espejos. Tamaños, marcos y acabados personalizados para marcas, minoristas y proyectos hoteleros."
      },
      "led-lighted-mirror": {
        "h1": "Fabricante de espejos de baño LED",
        "description": "Adquiera espejos de baño con luz LED, tamaños personalizados y opciones de regulación de brillo y antivaho. Fabricación de espejos OEM/ODM y suministro al por mayor para marcas y hoteles."
      },
      "bathroom-mirror-without-led": {
        "h1": "Fabricante de espejos de baño",
        "description": "Adquiera espejos de baño sin LED, con o sin marco. Tamaños, materiales y acabados personalizados, con fabricación de espejos OEM/ODM para marcas y hoteles."
      },
      "full-length-dressing-mirror": {
        "h1": "Fabricante de espejos de vestidor de cuerpo entero",
        "description": "Adquiera espejos de vestidor de cuerpo entero de un fabricante y proveedor mayorista. Tamaños, marcos y acabados personalizados para hoteles, minoristas y marcas de artículos para el hogar."
      },
      "irregular-mirror": {
        "h1": "Fabricante de espejos irregulares a medida",
        "description": "Adquiera espejos irregulares a medida de un fabricante profesional. Formas, tamaños y acabados personalizados, con suministro OEM/ODM para marcas y proyectos hoteleros."
      },
      "mirror-cabinet": {
        "h1": "Fabricante de armarios con espejo LED",
        "description": "Adquiera armarios con espejo LED y espacio de almacenamiento práctico, con tamaños y acabados personalizados. Fabricación OEM/ODM y suministro al por mayor para marcas y hoteles."
      }
    }
  },
  "fr": {
    "titles": {
      "hot-sale": "Fournisseur de miroirs en gros | Fabricant de miroirs à succès",
      "led-lighted-mirror": "Fabricant de miroirs de salle de bain LED | Fournisseur de miroirs lumineux LED",
      "bathroom-mirror-without-led": "Miroirs de salle de bain sans LED | Fabricant de miroirs de salle de bain",
      "full-length-dressing-mirror": "Fabricant de miroirs en pied | Fournisseur de miroirs de dressing",
      "irregular-mirror": "Miroirs irréguliers sur mesure | Fabricant professionnel de miroirs irréguliers",
      "mirror-cabinet": "Fabricant d'armoires à miroir LED | Fabrication d'armoires à miroir"
    },
    "copy": {
      "hot-sale": {
        "h1": "Miroirs à succès en gros",
        "description": "Découvrez des miroirs à succès auprès d'un fournisseur et fabricant de miroirs en gros. Dimensions, cadres et finitions sur mesure pour les marques, les détaillants et les projets hôteliers."
      },
      "led-lighted-mirror": {
        "h1": "Fabricant de miroirs de salle de bain LED",
        "description": "Commandez des miroirs de salle de bain à éclairage LED aux dimensions personnalisées, avec réglage de luminosité et fonction antibuée en option. Fabrication de miroirs OEM/ODM et fourniture en gros pour les marques et les hôtels."
      },
      "bathroom-mirror-without-led": {
        "h1": "Fabricant de miroirs de salle de bain",
        "description": "Commandez des miroirs de salle de bain sans LED, avec ou sans cadre. Dimensions, matériaux et finitions sur mesure, avec fabrication de miroirs OEM/ODM pour les marques et les hôtels."
      },
      "full-length-dressing-mirror": {
        "h1": "Fabricant de miroirs de dressing en pied",
        "description": "Commandez des miroirs de dressing en pied auprès d'un fabricant et fournisseur en gros. Dimensions, cadres et finitions sur mesure pour les hôtels, les détaillants et les marques d'articles pour la maison."
      },
      "irregular-mirror": {
        "h1": "Fabricant de miroirs irréguliers sur mesure",
        "description": "Commandez des miroirs irréguliers sur mesure auprès d'un fabricant professionnel. Formes, dimensions et finitions personnalisées, avec fourniture OEM/ODM pour les marques et les projets hôteliers."
      },
      "mirror-cabinet": {
        "h1": "Fabricant d'armoires à miroir LED",
        "description": "Commandez des armoires à miroir LED avec des rangements pratiques, des dimensions et des finitions sur mesure. Fabrication OEM/ODM et fourniture en gros pour les marques et les hôtels."
      }
    }
  },
  "de": {
    "titles": {
      "hot-sale": "Spiegel-Großhändler | Hersteller gefragter Spiegel",
      "led-lighted-mirror": "Hersteller von LED-Badspiegeln | Lieferant für LED-Leuchtspiegel",
      "bathroom-mirror-without-led": "Badspiegel ohne LED | Hersteller von Badspiegeln",
      "full-length-dressing-mirror": "Hersteller von Ganzkörperspiegeln | Lieferant für Ankleidespiegel",
      "irregular-mirror": "Unregelmäßige Spiegel nach Maß | Professioneller Hersteller unregelmäßiger Spiegel",
      "mirror-cabinet": "Hersteller von LED-Spiegelschränken | Fertigung von Spiegelschränken"
    },
    "copy": {
      "hot-sale": {
        "h1": "Gefragte Spiegel im Großhandel",
        "description": "Entdecken Sie gefragte Spiegel von einem Spiegel-Großhändler und Hersteller. Individuelle Größen, Rahmen und Oberflächen für Marken, Einzelhändler und Hotelprojekte."
      },
      "led-lighted-mirror": {
        "h1": "Hersteller von LED-Badspiegeln",
        "description": "Beziehen Sie LED-beleuchtete Badspiegel in individuellen Größen mit optionaler Dimm- und Antibeschlagfunktion. OEM/ODM-Spiegelfertigung und Großhandelslieferungen für Marken und Hotels."
      },
      "bathroom-mirror-without-led": {
        "h1": "Hersteller von Badspiegeln",
        "description": "Beziehen Sie Badspiegel ohne LED in gerahmten und rahmenlosen Ausführungen. Individuelle Größen, Materialien und Oberflächen mit OEM/ODM-Spiegelfertigung für Marken und Hotels."
      },
      "full-length-dressing-mirror": {
        "h1": "Hersteller von Ganzkörper-Ankleidespiegeln",
        "description": "Beziehen Sie Ganzkörper-Ankleidespiegel von einem Hersteller und Großhändler. Individuelle Größen, Rahmen und Oberflächen für Hotels, Einzelhändler und Einrichtungsmarken."
      },
      "irregular-mirror": {
        "h1": "Hersteller unregelmäßiger Spiegel nach Maß",
        "description": "Beziehen Sie unregelmäßige Spiegel nach Maß von einem professionellen Hersteller. Individuelle Formen, Größen und Oberflächen mit OEM/ODM-Lieferungen für Marken und Hotelprojekte."
      },
      "mirror-cabinet": {
        "h1": "Hersteller von LED-Spiegelschränken",
        "description": "Beziehen Sie LED-Spiegelschränke mit praktischem Stauraum sowie individuellen Größen und Oberflächen. OEM/ODM-Fertigung und Großhandelslieferungen für Marken und Hotels."
      }
    }
  },
  "it": {
    "titles": {
      "hot-sale": "Fornitore di specchi all'ingrosso | Produttore degli specchi più venduti",
      "led-lighted-mirror": "Produttore di specchi da bagno LED | Fornitore di specchi illuminati a LED",
      "bathroom-mirror-without-led": "Specchi da bagno senza LED | Produttore di specchi da bagno",
      "full-length-dressing-mirror": "Produttore di specchi a figura intera | Fornitore di specchi da guardaroba",
      "irregular-mirror": "Specchi irregolari su misura | Produttore professionale di specchi irregolari",
      "mirror-cabinet": "Produttore di armadietti con specchio LED | Produzione di armadietti con specchio"
    },
    "copy": {
      "hot-sale": {
        "h1": "Specchi più venduti all'ingrosso",
        "description": "Scopri gli specchi più venduti di un fornitore all'ingrosso e produttore di specchi. Dimensioni, cornici e finiture personalizzate per marchi, rivenditori e progetti alberghieri."
      },
      "led-lighted-mirror": {
        "h1": "Produttore di specchi da bagno LED",
        "description": "Acquista specchi da bagno illuminati a LED con dimensioni personalizzate, regolazione della luminosità e funzione antiappannamento opzionali. Produzione di specchi OEM/ODM e fornitura all'ingrosso per marchi e hotel."
      },
      "bathroom-mirror-without-led": {
        "h1": "Produttore di specchi da bagno",
        "description": "Acquista specchi da bagno senza LED, con o senza cornice. Dimensioni, materiali e finiture personalizzati, con produzione di specchi OEM/ODM per marchi e hotel."
      },
      "full-length-dressing-mirror": {
        "h1": "Produttore di specchi da guardaroba a figura intera",
        "description": "Acquista specchi da guardaroba a figura intera da un produttore e fornitore all'ingrosso. Dimensioni, cornici e finiture personalizzate per hotel, rivenditori e marchi per la casa."
      },
      "irregular-mirror": {
        "h1": "Produttore di specchi irregolari su misura",
        "description": "Acquista specchi irregolari su misura da un produttore professionale. Forme, dimensioni e finiture personalizzate, con fornitura OEM/ODM per marchi e progetti alberghieri."
      },
      "mirror-cabinet": {
        "h1": "Produttore di armadietti con specchio LED",
        "description": "Acquista armadietti con specchio LED e pratici vani portaoggetti, con dimensioni e finiture personalizzate. Produzione OEM/ODM e fornitura all'ingrosso per marchi e hotel."
      }
    }
  }
} as const;

const supportedLanguages = ['en', ...Object.keys(translatedSeo)];

for (const [slug, title] of approvedTitles) {
  test(`uses the exact approved English title for ${slug}`, () => {
    assert.equal(getCatalogCategorySeoTitle('en', slug, 'Fallback title'), title);
  });
}

for (const [lang, { titles }] of Object.entries(translatedSeo)) {
  for (const [slug, title] of Object.entries(titles)) {
    test(`uses the translated title without a brand suffix for ${lang}/${slug}`, () => {
      const actual = getCatalogCategorySeoTitle(lang, slug, 'Old locale title');
      assert.equal(actual, title);
      assert.doesNotMatch(actual, /bolen/i);
      assert.equal(actual.split(' | ').length, 2);
    });
  }
}

test('preserves fallback titles for unsupported languages', () => {
  for (const lang of ['ja', 'pt', '', 'en-US', 'constructor', '__proto__']) {
    for (const [slug] of approvedTitles) {
      assert.equal(getCatalogCategorySeoTitle(lang, slug, 'Fallback title'), 'Fallback title');
    }
  }
});

test('preserves fallback titles for additional or unknown categories', () => {
  for (const lang of supportedLanguages) {
    for (const slug of ['new-arrival', 'unknown', 'constructor', '__proto__']) {
      assert.equal(getCatalogCategorySeoTitle(lang, slug, 'Fallback title'), 'Fallback title');
    }
  }
});

const approvedPageCopy = [
  {
    slug: 'hot-sale',
    h1: 'Wholesale Hot-Selling Mirrors',
    description: 'Explore hot-selling mirrors from a wholesale mirror supplier and manufacturer. Custom sizes, frames and finishes for brands, retailers and hotel projects.',
  },
  {
    slug: 'led-lighted-mirror',
    h1: 'LED Bathroom Mirror Manufacturer',
    description: 'Source LED lighted bathroom mirrors with custom sizes, dimming and anti-fog options. OEM/ODM mirror manufacturing and wholesale supply for brands and hotels.',
  },
  {
    slug: 'bathroom-mirror-without-led',
    h1: 'Bathroom Mirror Manufacturer',
    description: 'Source non-LED bathroom mirrors in framed and frameless designs. Custom sizes, materials and finishes with OEM/ODM mirror manufacturing for brands and hotels.',
  },
  {
    slug: 'full-length-dressing-mirror',
    h1: 'Full-Length Dressing Mirror Manufacturer',
    description: 'Source full-length dressing mirrors from a manufacturer and wholesale supplier. Custom sizes, frames and finishes for hotels, retailers and home brands.',
  },
  {
    slug: 'irregular-mirror',
    h1: 'Custom Irregular Mirror Manufacturer',
    description: 'Source custom irregular mirrors from a professional mirror manufacturer. Custom shapes, sizes and finishes with OEM/ODM supply for brands and hotel projects.',
  },
  {
    slug: 'mirror-cabinet',
    h1: 'LED Mirror Cabinet Manufacturer',
    description: 'Source LED mirror cabinets with practical storage, custom sizes and finishes. OEM/ODM mirror cabinet manufacturing and wholesale supply for brands and hotels.',
  },
] as const;

test('every category with a custom title has dedicated H1 and description copy in all languages', () => {
  const fallback = { h1: 'Fallback heading', description: 'Fallback description' };
  for (const lang of supportedLanguages) {
    const descriptions = new Set<string>();
    for (const [slug] of approvedTitles) {
      const copy = getCatalogCategoryPageCopy(lang, slug, fallback);
      assert.ok(copy.h1.trim(), `${lang}/${slug}: missing H1`);
      assert.ok(copy.description.trim(), `${lang}/${slug}: missing description`);
      assert.notEqual(copy.h1, fallback.h1, `${lang}/${slug}: still using the default H1`);
      assert.notEqual(copy.description, fallback.description, `${lang}/${slug}: still using the generic description`);
      descriptions.add(copy.description);
    }
    assert.equal(descriptions.size, approvedTitles.length, `${lang}: category descriptions must be distinct`);
  }
});

for (const { slug, h1, description } of approvedPageCopy) {
  test(`uses the exact approved English H1 and description for ${slug}`, () => {
    assert.deepEqual(
      getCatalogCategoryPageCopy('en', slug, { h1: 'Original heading', description: 'Original description' }),
      { h1, description }
    );
  });
}

for (const [lang, { copy }] of Object.entries(translatedSeo)) {
  for (const [slug, expected] of Object.entries(copy)) {
    test(`uses the complete translated H1 and description for ${lang}/${slug}`, () => {
      assert.deepEqual(
        getCatalogCategoryPageCopy(lang, slug, { h1: 'Old locale heading', description: 'Old locale description' }),
        expected
      );
    });
  }
}

test('preserves fallback copy for unsupported languages', () => {
  const fallback = { h1: 'Original heading', description: 'Original description' };
  for (const lang of ['ja', 'pt', '', 'en-US', 'constructor', '__proto__']) {
    for (const { slug } of approvedPageCopy) {
      assert.deepEqual(getCatalogCategoryPageCopy(lang, slug, fallback), fallback);
    }
  }
});

test('preserves fallback H1 and description for additional or unknown categories', () => {
  const fallback = { h1: 'Original heading', description: 'Original description' };
  for (const lang of supportedLanguages) {
    for (const slug of ['new-arrival', 'unknown', 'constructor', '__proto__']) {
      assert.deepEqual(getCatalogCategoryPageCopy(lang, slug, fallback), fallback);
    }
  }
});

const options = {
  lang: 'en',
  slug: 'led-lighted-mirror',
  name: 'Led Lighted Mirror',
  description: 'Existing category description.',
  homeLabel: 'Home',
  catalogLabel: 'Catalog',
};

const products: CatalogCategorySchemaProduct[] = [
  {
    title: 'Round LED Bathroom Mirror',
    name: 'Round LED Bathroom Mirror',
    image: 'https://example.com/round-mirror.jpg',
  },
  {
    title: 'Oval Anti-Fog Mirror, 3000-6500K',
    image: 'https://example.com/oval-mirror.jpg',
  },
];

test('adds a product ItemList while retaining CollectionPage and breadcrumbs', () => {
  const [collection, breadcrumb, itemList] = buildCatalogCategorySchema({ ...options, products });
  const categoryUrl = 'https://bolenmirror.com/en/products/category/led-lighted-mirror/';

  assert.equal(collection['@type'], 'CollectionPage');
  assert.equal(collection.description, options.description);
  assert.equal(collection.url, categoryUrl);
  assert.deepEqual(collection.mainEntity, { '@id': `${categoryUrl}#itemlist` });
  assert.equal(breadcrumb['@type'], 'BreadcrumbList');
  assert.deepEqual(breadcrumb.itemListElement, [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bolenmirror.com/en/' },
    { '@type': 'ListItem', position: 2, name: 'Catalog', item: 'https://bolenmirror.com/en/products/' },
    { '@type': 'ListItem', position: 3, name: options.name, item: categoryUrl },
  ]);
  assert.deepEqual(itemList, {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${categoryUrl}#itemlist`,
    name: options.name,
    url: categoryUrl,
    numberOfItems: 2,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Round LED Bathroom Mirror',
        url: 'https://bolenmirror.com/en/products/round-led-bathroom-mirror/',
        image: 'https://example.com/round-mirror.jpg',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Oval Anti-Fog Mirror, 3000-6500K',
        url: 'https://bolenmirror.com/en/products/oval-anti-fog-mirror-3000-6500k/',
        image: 'https://example.com/oval-mirror.jpg',
      },
    ],
  });
});

test('updates page schema copy without renaming category breadcrumbs or URLs', () => {
  for (const { slug, h1, description } of approvedPageCopy) {
    const [collection, breadcrumb, itemList] = buildCatalogCategorySchema({
      ...options,
      slug,
      name: 'Original category label',
      pageName: h1,
      description,
      products,
    });
    const categoryUrl = `https://bolenmirror.com/en/products/category/${slug}/`;
    assert.equal(collection.name, h1);
    assert.equal(collection.description, description);
    assert.equal(collection.url, categoryUrl);
    assert.equal(itemList.name, h1);
    assert.equal(itemList.url, categoryUrl);
    const crumbs = breadcrumb.itemListElement as Array<Record<string, unknown>>;
    assert.equal(crumbs[2].name, 'Original category label');
    assert.equal(crumbs[2].item, categoryUrl);
  }
});

for (const [lang, { copy }] of Object.entries(translatedSeo)) {
  test(`synchronizes translated category schema copy while preserving breadcrumbs and links in ${lang}`, () => {
    for (const [slug, expected] of Object.entries(copy)) {
      const categoryLabel = `${lang} original category label`;
      const pageCopy = getCatalogCategoryPageCopy(lang, slug, {
        h1: categoryLabel,
        description: 'Old locale description',
      });
      const [collection, breadcrumb, itemList] = buildCatalogCategorySchema({
        ...options,
        lang,
        slug,
        name: categoryLabel,
        pageName: pageCopy.h1,
        description: pageCopy.description,
        products,
      });
      const categoryUrl = `https://bolenmirror.com/${lang}/products/category/${slug}/`;
      assert.equal(collection.name, expected.h1);
      assert.equal(collection.description, expected.description);
      assert.equal(collection.url, categoryUrl);
      assert.deepEqual(collection.mainEntity, { '@id': `${categoryUrl}#itemlist` });
      assert.equal(itemList.name, expected.h1);
      assert.equal(itemList.url, categoryUrl);
      assert.equal(itemList['@id'], `${categoryUrl}#itemlist`);
      const crumbs = breadcrumb.itemListElement as Array<Record<string, unknown>>;
      assert.equal(crumbs[2].name, categoryLabel);
      assert.equal(crumbs[2].item, categoryUrl);
      const entries = itemList.itemListElement as Array<Record<string, unknown>>;
      assert.equal(entries[0].url, `https://bolenmirror.com/${lang}/products/round-led-bathroom-mirror/`);
    }
  });
}

test('uses localized names but keeps the English slug and localized URL prefix', () => {
  const [, , itemList] = buildCatalogCategorySchema({
    ...options,
    lang: 'fr',
    products: [{ title: 'Round LED Bathroom Mirror', name: 'Miroir rond à LED' }],
  });
  assert.deepEqual(itemList.itemListElement, [{
    '@type': 'ListItem',
    position: 1,
    name: 'Miroir rond à LED',
    url: 'https://bolenmirror.com/fr/products/round-led-bathroom-mirror/',
  }]);
});

test('describes only the displayed batch while retaining the total matching count', () => {
  const [, , firstBatch] = buildCatalogCategorySchema({
    ...options,
    products: products.slice(0, 1),
    totalProducts: products.length,
  });
  const [, , expandedBatch] = buildCatalogCategorySchema({ ...options, products });
  assert.equal(firstBatch.numberOfItems, 2);
  assert.equal((firstBatch.itemListElement as unknown[]).length, 1);
  assert.equal(expandedBatch.numberOfItems, 2);
  assert.equal((expandedBatch.itemListElement as unknown[]).length, 2);
});

test('allows a genuinely empty category without placeholder products', () => {
  const [, , itemList] = buildCatalogCategorySchema({ ...options, products: [] });
  assert.equal(itemList.numberOfItems, 0);
  assert.deepEqual(itemList.itemListElement, []);
});

test('does not claim an empty product list while data is still loading', () => {
  const schema = buildCatalogCategorySchema(options);
  assert.equal(schema.length, 2);
  assert.equal(schema.some((entry) => entry['@type'] === 'ItemList'), false);
  assert.equal('mainEntity' in schema[0], false);
});
