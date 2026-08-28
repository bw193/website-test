import type { SupportedLanguage } from '../hooks/useLocalizedPath';
import {
  SEO_LANDING_PAGES,
  type SeoLandingPage,
  type SeoLandingPageTranslation,
} from './seoLandingPages';
import { zhSeoLandingTranslations } from './seoLandingLocales/zh';
import { esSeoLandingTranslations } from './seoLandingLocales/es';
import { frSeoLandingTranslations } from './seoLandingLocales/fr';
import { deSeoLandingTranslations } from './seoLandingLocales/de';
import { itSeoLandingTranslations } from './seoLandingLocales/it';
import { zhLongTailSeoLandingTranslations } from './seoLandingLocales/zhLongTail';
import { esLongTailSeoLandingTranslations } from './seoLandingLocales/esLongTail';
import { frLongTailSeoLandingTranslations } from './seoLandingLocales/frLongTail';
import { deLongTailSeoLandingTranslations } from './seoLandingLocales/deLongTail';
import { itLongTailSeoLandingTranslations } from './seoLandingLocales/itLongTail';

export type SeoSolutionsUi = {
  navLabel: string;
  footerLabel: string;
  homeEyebrow: string;
  homeHeading: string;
  homeIntro: string;
  homeExplore: string;
  hubTitle: string;
  hubDescription: string;
  hubEyebrow: string;
  hubHeading: string;
  hubIntro: string;
  discussProject: string;
  browseCatalog: string;
  exploreSolution: string;
  hubGroups: Record<'product' | 'sourcing' | 'project', { title: string; description: string }>;
  howEyebrow: string;
  howHeading: string;
  howSteps: Array<{ title: string; copy: string }>;
  strengths: Array<{ title: string; copy: string }>;
  home: string;
  solutions: string;
  requestQuote: string;
  viewCatalog: string;
  relevantProducts: string;
  modelsHeading: string;
  viewAllProducts: string;
  buyerQuestions: string;
  faqHeading: string;
  relatedSolutions: string;
  quoteEyebrow: string;
  quoteHeading: string;
  startRfq: string;
};

const PAGE_TRANSLATIONS: Partial<
  Record<SupportedLanguage, Record<string, SeoLandingPageTranslation>>
> = {
  zh: { ...zhSeoLandingTranslations, ...zhLongTailSeoLandingTranslations },
  es: { ...esSeoLandingTranslations, ...esLongTailSeoLandingTranslations },
  fr: { ...frSeoLandingTranslations, ...frLongTailSeoLandingTranslations },
  de: { ...deSeoLandingTranslations, ...deLongTailSeoLandingTranslations },
  it: { ...itSeoLandingTranslations, ...itLongTailSeoLandingTranslations },
};

const UI: Record<SupportedLanguage, SeoSolutionsUi> = {
  en: {
    navLabel: 'Solutions',
    footerLabel: 'Manufacturing Solutions',
    homeEyebrow: 'Buyer sourcing routes',
    homeHeading: 'Find the right mirror manufacturing solution',
    homeIntro: 'Explore specification guidance for LED bathroom mirrors, custom programs, hospitality, commercial projects, mirror cabinets and private-label OEM/ODM production.',
    homeExplore: 'Explore solution',
    hubTitle: 'Mirror Manufacturing Solutions | BOLEN',
    hubDescription: 'Explore BOLEN manufacturing solutions for LED bathroom mirrors, custom mirrors, hotel and commercial projects, mirror cabinets and OEM/ODM programs.',
    hubEyebrow: 'Factory programs',
    hubHeading: 'Mirror manufacturing solutions',
    hubIntro: 'Factory programs for LED mirrors, custom OEM/ODM, wholesale supply, and hotel or commercial projects.',
    discussProject: 'Discuss your project',
    browseCatalog: 'Browse product catalog',
    exploreSolution: 'Explore this solution',
    hubGroups: {
      product: { title: 'Product types', description: 'The mirror you need to sell or specify.' },
      sourcing: { title: 'How you buy', description: 'Wholesale, custom size, and private label.' },
      project: { title: 'Projects', description: 'Hotel and multi-unit supply.' },
    },
    howEyebrow: 'Next step',
    howHeading: 'How an inquiry works',
    howSteps: [
      { title: 'Choose a route', copy: 'Product, wholesale/OEM, or a hotel/commercial project.' },
      { title: 'Send a spec', copy: 'Size, quantity, market, and functions — a photo or drawing helps.' },
      { title: 'Get a factory quote', copy: 'Sample, MOQ, lead time and packing against that spec.' },
    ],
    strengths: [
      { title: 'Integrated production', copy: 'Glass, frames, LED integration, assembly, inspection and export packaging coordinated through one manufacturing program.' },
      { title: 'Specification-led quoting', copy: 'Pricing and MOQ are confirmed against dimensions, functions, materials, packaging and destination-market requirements.' },
      { title: 'Evidence before claims', copy: 'Certification, test and quality-control requirements are reviewed by model instead of relying on generic badges.' },
    ],
    home: 'Home',
    solutions: 'Solutions',
    requestQuote: 'Contact Sales',
    viewCatalog: 'View product catalog',
    relevantProducts: 'Relevant products',
    modelsHeading: 'Example models',
    viewAllProducts: 'View all products',
    buyerQuestions: 'Buyer questions',
    faqHeading: 'Frequently asked questions',
    relatedSolutions: 'Related manufacturing solutions',
    quoteEyebrow: 'Specification-based quotation',
    quoteHeading: 'Send the dimensions, quantity and functions you need.',
    startRfq: 'Start an RFQ',
  },
  zh: {
    navLabel: '采购方案', footerLabel: '制造解决方案', homeEyebrow: '买家采购路径', homeHeading: '找到适合您的镜子制造方案',
    homeIntro: '了解 LED 浴室镜、定制镜、酒店与商业项目、镜柜以及自有品牌 OEM/ODM 生产的规格与采购要点。', homeExplore: '查看方案',
    hubTitle: '镜子制造解决方案 | BOLEN', hubDescription: '了解 BOLEN 面向 LED 浴室镜、定制镜、酒店和商业项目、镜柜及 OEM/ODM 项目的制造解决方案。',
    hubEyebrow: '工厂采购', hubHeading: '镜子制造与采购方案',
    hubIntro: '覆盖 LED 镜、定制 OEM/ODM、批发供货，以及酒店与商业工程项目。',
    discussProject: '讨论您的项目', browseCatalog: '浏览产品目录', exploreSolution: '查看此方案',
    hubGroups: {
      product: { title: '产品类型', description: '要卖或要指定的镜子品类。' },
      sourcing: { title: '采购方式', description: '批发、定制尺寸、自有品牌。' },
      project: { title: '工程项目', description: '酒店与多单元项目供货。' },
    },
    howEyebrow: '询价流程', howHeading: '怎样开始',
    howSteps: [
      { title: '选方案', copy: '产品类型、批发/OEM，或酒店与工程。' },
      { title: '发规格', copy: '尺寸、数量、市场、功能；有图纸或照片更好。' },
      { title: '收报价', copy: '打样、起订量、交期、包装按该规格确认。' },
    ],
    strengths: [
      { title: '一体化生产', copy: '玻璃、框架、LED 集成、组装、检验和出口包装由同一制造体系协同完成。' },
      { title: '按规格报价', copy: '价格和起订量根据尺寸、功能、材料、包装及目的市场要求确认。' },
      { title: '以证据支持承诺', copy: '认证、测试和质量控制要求按具体型号审核，而不是依赖笼统标识。' },
    ],
    home: '首页', solutions: '采购方案', requestQuote: '申请工厂报价', viewCatalog: '查看产品目录', relevantProducts: '相关产品',
    modelsHeading: '参考型号', viewAllProducts: '查看全部产品', buyerQuestions: '买家常见问题', faqHeading: '常见问题',
    relatedSolutions: '相关制造方案', quoteEyebrow: '按规格报价', quoteHeading: '请发送您需要的尺寸、数量和功能。', startRfq: '开始询价',
  },
  es: {
    navLabel: 'Soluciones', footerLabel: 'Soluciones de fabricación', homeEyebrow: 'Rutas de compra B2B', homeHeading: 'Encuentre la solución de fabricación de espejos adecuada',
    homeIntro: 'Consulte especificaciones para espejos LED de baño, programas a medida, hostelería, proyectos comerciales, armarios con espejo y producción OEM/ODM de marca propia.', homeExplore: 'Ver solución',
    hubTitle: 'Soluciones de fabricación de espejos | BOLEN', hubDescription: 'Explore soluciones BOLEN para espejos LED de baño, espejos a medida, hoteles, proyectos comerciales, armarios y programas OEM/ODM.',
    hubEyebrow: 'Programas de fábrica', hubHeading: 'Soluciones de fabricación de espejos',
    hubIntro: 'Programas de fábrica para espejos LED, OEM/ODM, suministro mayorista y proyectos hoteleros o comerciales.',
    discussProject: 'Hablemos de su proyecto', browseCatalog: 'Ver catálogo', exploreSolution: 'Explorar esta solución',
    hubGroups: {
      product: { title: 'Tipos de producto', description: 'Empiece por el espejo que necesita vender o especificar.' },
      sourcing: { title: 'Cómo compra', description: 'Rutas de mayorista, a medida y de marca propia.' },
      project: { title: 'Suministro de proyecto', description: 'Programas de hostelería y multiunidad especificados por habitación o fase.' },
    },
    howEyebrow: 'Cómo usar esta página', howHeading: 'Elija una ruta y envíe una especificación útil.',
    howSteps: [
      { title: 'Elija la ruta adecuada', copy: 'Tipo de producto si conoce la categoría; programa de compra para OEM o mayorista; suministro de proyecto para hoteles y edificios multiunidad.' },
      { title: 'Envíe la especificación', copy: 'Dimensiones, cantidad, mercado de destino, funciones y un plano o imagen de referencia bastan para empezar.' },
      { title: 'Revise la cotización de fábrica', copy: 'Muestras, MOQ, plazo y embalaje se confirman según esa especificación, no con un precio genérico.' },
    ],
    strengths: [
      { title: 'Producción integrada', copy: 'Vidrio, marcos, integración LED, montaje, inspección y embalaje de exportación coordinados en un único programa.' },
      { title: 'Cotización según especificaciones', copy: 'Precio y MOQ se confirman según dimensiones, funciones, materiales, embalaje y mercado de destino.' },
      { title: 'Pruebas antes que afirmaciones', copy: 'La certificación, los ensayos y el control de calidad se revisan por modelo, sin depender de distintivos genéricos.' },
    ],
    home: 'Inicio', solutions: 'Soluciones', requestQuote: 'Solicitar cotización de fábrica', viewCatalog: 'Ver catálogo de productos', relevantProducts: 'Productos relacionados',
    modelsHeading: 'Modelos para iniciar su especificación', viewAllProducts: 'Ver todos los productos', buyerQuestions: 'Preguntas de compradores', faqHeading: 'Preguntas frecuentes',
    relatedSolutions: 'Soluciones de fabricación relacionadas', quoteEyebrow: 'Cotización por especificación', quoteHeading: 'Envíenos dimensiones, cantidad y funciones necesarias.', startRfq: 'Iniciar solicitud',
  },
  fr: {
    navLabel: 'Solutions', footerLabel: 'Solutions de fabrication', homeEyebrow: 'Parcours d’achat B2B', homeHeading: 'Trouvez la bonne solution de fabrication de miroirs',
    homeIntro: 'Consultez nos conseils pour miroirs LED de salle de bains, projets sur mesure, hôtellerie, bâtiments commerciaux, armoires de toilette et production OEM/ODM.', homeExplore: 'Voir la solution',
    hubTitle: 'Solutions de fabrication de miroirs | BOLEN', hubDescription: 'Découvrez les solutions BOLEN pour miroirs LED, miroirs sur mesure, hôtels, projets commerciaux, armoires et programmes OEM/ODM.',
    hubEyebrow: 'Programmes usine', hubHeading: 'Solutions de fabrication de miroirs',
    hubIntro: 'Programmes usine pour miroirs LED, OEM/ODM, fourniture en gros et projets hôteliers ou tertiaires.',
    discussProject: 'Parler de votre projet', browseCatalog: 'Parcourir le catalogue', exploreSolution: 'Explorer cette solution',
    hubGroups: {
      product: { title: 'Types de produits', description: 'Commencez par le miroir que vous devez vendre ou spécifier.' },
      sourcing: { title: 'Mode d’approvisionnement', description: 'Parcours grossiste, sur mesure et marque privée.' },
      project: { title: 'Fourniture de projet', description: 'Programmes hôteliers et multi-unités spécifiés par chambre ou phase.' },
    },
    howEyebrow: 'Comment utiliser cette page', howHeading: 'Choisissez un parcours, puis envoyez un cahier des charges.',
    howSteps: [
      { title: 'Choisissez le bon parcours', copy: 'Type de produit si la catégorie est claire ; approvisionnement pour OEM ou gros ; projet pour hôtels et bâtiments multi-unités.' },
      { title: 'Envoyez le cahier des charges', copy: 'Dimensions, quantité, marché, fonctions et un plan ou visuel de référence suffisent pour démarrer.' },
      { title: 'Examinez le devis usine', copy: 'Échantillons, MOQ, délai et emballage sont confirmés selon cette spécification, pas un prix générique.' },
    ],
    strengths: [
      { title: 'Production intégrée', copy: 'Verre, cadres, intégration LED, assemblage, contrôle et emballage export coordonnés dans un même programme.' },
      { title: 'Devis selon cahier des charges', copy: 'Prix et MOQ sont confirmés selon dimensions, fonctions, matériaux, emballage et marché de destination.' },
      { title: 'Des preuves avant les promesses', copy: 'Certifications, essais et contrôles qualité sont examinés par modèle, sans se limiter à des badges génériques.' },
    ],
    home: 'Accueil', solutions: 'Solutions', requestQuote: 'Demander un devis usine', viewCatalog: 'Voir le catalogue', relevantProducts: 'Produits associés',
    modelsHeading: 'Modèles pour démarrer votre cahier des charges', viewAllProducts: 'Voir tous les produits', buyerQuestions: 'Questions des acheteurs', faqHeading: 'Questions fréquentes',
    relatedSolutions: 'Solutions de fabrication associées', quoteEyebrow: 'Devis selon spécifications', quoteHeading: 'Envoyez-nous les dimensions, quantités et fonctions souhaitées.', startRfq: 'Démarrer une demande',
  },
  de: {
    navLabel: 'Lösungen', footerLabel: 'Fertigungslösungen', homeEyebrow: 'Beschaffungswege für Einkäufer', homeHeading: 'Die passende Lösung für Ihre Spiegelfertigung',
    homeIntro: 'Spezifikationshinweise für LED-Badspiegel, Sonderanfertigungen, Hotel- und Gewerbeprojekte, Spiegelschränke sowie OEM/ODM-Produktion.', homeExplore: 'Lösung ansehen',
    hubTitle: 'Lösungen für die Spiegelfertigung | BOLEN', hubDescription: 'BOLEN Lösungen für LED-Badspiegel, Maßspiegel, Hotel- und Gewerbeprojekte, Spiegelschränke sowie OEM/ODM-Programme.',
    hubEyebrow: 'Werksprogramme', hubHeading: 'Lösungen für die Spiegelfertigung',
    hubIntro: 'Werksprogramme für LED-Spiegel, OEM/ODM, Großhandel sowie Hotel- und Gewerbeprojekte.',
    discussProject: 'Projekt besprechen', browseCatalog: 'Produktkatalog ansehen', exploreSolution: 'Diese Lösung entdecken',
    hubGroups: {
      product: { title: 'Produkttypen', description: 'Beginnen Sie mit dem Spiegel, den Sie verkaufen oder ausschreiben möchten.' },
      sourcing: { title: 'Beschaffungsweg', description: 'Großhandel, Maßanfertigung und Eigenmarkenfertigung.' },
      project: { title: 'Projektlieferung', description: 'Hotel- und Mehrparteienprogramme nach Zimmer, Gebäude oder Phase.' },
    },
    howEyebrow: 'So nutzen Sie diese Seite', howHeading: 'Route wählen, dann eine belastbare Spezifikation senden.',
    howSteps: [
      { title: 'Passende Route wählen', copy: 'Produkttyp bei klarer Kategorie; Beschaffung für OEM oder Großhandel; Projektlieferung für Hotels und Mehrparteiengebäude.' },
      { title: 'Arbeitsspezifikation senden', copy: 'Maße, Menge, Zielmarkt, Funktionen sowie Zeichnung oder Referenzbild reichen zum Start.' },
      { title: 'Werksangebot prüfen', copy: 'Muster, MOQ, Lieferzeit und Verpackung werden an dieser Spezifikation festgemacht, nicht an einem Listenpreis.' },
    ],
    strengths: [
      { title: 'Integrierte Produktion', copy: 'Glas, Rahmen, LED-Integration, Montage, Prüfung und Exportverpackung werden in einem Fertigungsprogramm koordiniert.' },
      { title: 'Spezifikationsbasierte Angebote', copy: 'Preis und MOQ werden anhand von Maßen, Funktionen, Materialien, Verpackung und Zielmarkt bestätigt.' },
      { title: 'Nachweise statt Behauptungen', copy: 'Zertifikate, Prüfungen und Qualitätskontrollen werden je Modell geprüft, nicht nur anhand allgemeiner Logos.' },
    ],
    home: 'Startseite', solutions: 'Lösungen', requestQuote: 'Werksangebot anfordern', viewCatalog: 'Produktkatalog ansehen', relevantProducts: 'Passende Produkte',
    modelsHeading: 'Modelle als Ausgangspunkt Ihrer Spezifikation', viewAllProducts: 'Alle Produkte ansehen', buyerQuestions: 'Fragen von Einkäufern', faqHeading: 'Häufige Fragen',
    relatedSolutions: 'Verwandte Fertigungslösungen', quoteEyebrow: 'Spezifikationsbasiertes Angebot', quoteHeading: 'Senden Sie uns Maße, Menge und gewünschte Funktionen.', startRfq: 'Anfrage starten',
  },
  it: {
    navLabel: 'Soluzioni', footerLabel: 'Soluzioni produttive', homeEyebrow: 'Percorsi di acquisto B2B', homeHeading: 'Trova la soluzione giusta per la produzione di specchi',
    homeIntro: 'Indicazioni tecniche per specchi LED da bagno, progetti su misura, hospitality, applicazioni commerciali, armadietti a specchio e produzione OEM/ODM.', homeExplore: 'Scopri la soluzione',
    hubTitle: 'Soluzioni per la produzione di specchi | BOLEN', hubDescription: 'Scopri le soluzioni BOLEN per specchi LED, specchi su misura, hotel, progetti commerciali, armadietti e programmi OEM/ODM.',
    hubEyebrow: 'Programmi di fabbrica', hubHeading: 'Soluzioni per la produzione di specchi',
    hubIntro: 'Programmi di fabbrica per specchi LED, OEM/ODM, fornitura wholesale e progetti hotel o commerciali.',
    discussProject: 'Parliamo del progetto', browseCatalog: 'Sfoglia il catalogo', exploreSolution: 'Esplora questa soluzione',
    hubGroups: {
      product: { title: 'Tipi di prodotto', description: 'Parti dallo specchio che devi vendere o specificare.' },
      sourcing: { title: 'Come acquisti', description: 'Percorsi wholesale, su misura e private label.' },
      project: { title: 'Fornitura di progetto', description: 'Programmi hospitality e multiunità specificati per camera o fase.' },
    },
    howEyebrow: 'Come usare questa pagina', howHeading: 'Scegli un percorso, poi invia una specifica operativa.',
    howSteps: [
      { title: 'Scegli il percorso giusto', copy: 'Tipo di prodotto se la categoria è chiara; approvvigionamento per OEM o wholesale; progetto per hotel ed edifici multiunità.' },
      { title: 'Invia la specifica', copy: 'Dimensioni, quantità, mercato, funzioni e un disegno o immagine di riferimento bastano per iniziare.' },
      { title: 'Esamina il preventivo di fabbrica', copy: 'Campionatura, MOQ, tempi e imballaggio si confermano su quella specifica, non su un listino generico.' },
    ],
    strengths: [
      { title: 'Produzione integrata', copy: 'Vetro, telai, integrazione LED, assemblaggio, controllo e imballaggio export coordinati in un unico programma.' },
      { title: 'Preventivi su specifica', copy: 'Prezzo e MOQ vengono confermati in base a dimensioni, funzioni, materiali, imballaggio e mercato di destinazione.' },
      { title: 'Prove prima delle promesse', copy: 'Certificazioni, test e controlli qualità sono verificati per modello, senza affidarsi a marchi generici.' },
    ],
    home: 'Home', solutions: 'Soluzioni', requestQuote: 'Richiedi preventivo di fabbrica', viewCatalog: 'Vedi catalogo prodotti', relevantProducts: 'Prodotti pertinenti',
    modelsHeading: 'Modelli da cui partire per la specifica', viewAllProducts: 'Vedi tutti i prodotti', buyerQuestions: 'Domande degli acquirenti', faqHeading: 'Domande frequenti',
    relatedSolutions: 'Soluzioni produttive correlate', quoteEyebrow: 'Preventivo su specifica', quoteHeading: 'Invia dimensioni, quantità e funzioni richieste.', startRfq: 'Avvia richiesta',
  },
};

type SeoLandingProductInput = {
  title: string;
  description?: string;
  category?: string;
};

type SolutionCardCopy = { title: string; blurb: string };

const SOLUTION_CARDS: Record<SupportedLanguage, Record<string, SolutionCardCopy>> = {
  en: {
    'led-bathroom-mirror-manufacturer': { title: 'LED bathroom mirror manufacturer', blurb: 'Front-lit, backlit and smart LED mirrors for brands and projects.' },
    'led-mirror-cabinet-manufacturer': { title: 'LED mirror cabinet manufacturer', blurb: 'Illuminated storage with custom size, lighting, layout and packaging.' },
    'full-length-mirror-manufacturer': { title: 'Full-length mirror manufacturer', blurb: 'Wall, leaning and dressing mirrors for retail, hotels and apartments.' },
    'anti-fog-led-mirror-manufacturer': { title: 'Anti-fog LED mirror manufacturer', blurb: 'Demister coverage, controls and electrical setup confirmed by model.' },
    'smart-bluetooth-mirror-manufacturer': { title: 'Smart Bluetooth mirror manufacturer', blurb: 'Speakers, lighting, anti-fog and controls as one tested configuration.' },
    'irregular-shaped-mirror-manufacturer': { title: 'Irregular shaped mirror manufacturer', blurb: 'Organic, asymmetric and geometric outlines with optional LED.' },
    'led-mirror-wholesale-supplier': { title: 'Wholesale LED mirror supplier', blurb: 'Factory-direct ranges, mixed models, branding and export packaging.' },
    'custom-mirror-manufacturer': { title: 'Custom mirror manufacturer', blurb: 'Turn a drawing, sample or brief into a manufacturable OEM/ODM program.' },
    'custom-size-led-mirrors': { title: 'Custom-size LED mirrors', blurb: 'Made-to-measure lighting and dimensions for vanities and project walls.' },
    'oem-odm-mirror-manufacturing': { title: 'OEM & ODM mirror manufacturing', blurb: 'Private-label development from specification through repeat supply.' },
    'hotel-bathroom-mirrors': { title: 'Hotel bathroom mirrors', blurb: 'Vanity and guest-room mirrors specified by drawing and room schedule.' },
    'commercial-bathroom-mirrors': { title: 'Commercial bathroom mirrors', blurb: 'Repeatable specs for apartments, offices, retail and public washrooms.' },
  },
  zh: {
    'led-bathroom-mirror-manufacturer': { title: 'LED 浴室镜制造商', blurb: '正面发光、背光与智能 LED 镜，面向品牌与工程项目。' },
    'led-mirror-cabinet-manufacturer': { title: 'LED 镜柜制造商', blurb: '可定制尺寸、照明、内部布局和包装的发光储物镜柜。' },
    'full-length-mirror-manufacturer': { title: '全身镜制造商', blurb: '墙挂、倚靠和更衣镜，面向零售、酒店和公寓。' },
    'anti-fog-led-mirror-manufacturer': { title: '防雾 LED 镜制造商', blurb: '加热区域、控制方式和电气配置按型号确认。' },
    'smart-bluetooth-mirror-manufacturer': { title: '智能蓝牙镜制造商', blurb: '音箱、照明、防雾和控制作为一套经过测试的配置。' },
    'irregular-shaped-mirror-manufacturer': { title: '异形镜制造商', blurb: '有机、不对称与几何外形，可选 LED 照明。' },
    'led-mirror-wholesale-supplier': { title: 'LED 镜批发供应商', blurb: '工厂直供系列、混装型号、品牌标识和出口包装。' },
    'custom-mirror-manufacturer': { title: '定制镜制造商', blurb: '把图纸、样品或简报做成可量产的 OEM/ODM 方案。' },
    'custom-size-led-mirrors': { title: '定制尺寸 LED 镜', blurb: '按台盆和墙面尺寸定制照明与规格。' },
    'oem-odm-mirror-manufacturing': { title: 'OEM / ODM 镜子制造', blurb: '从规格到稳定复购的自有品牌开发。' },
    'hotel-bathroom-mirrors': { title: '酒店浴室镜', blurb: '按图纸和房型表指定的梳妆镜与客房镜。' },
    'commercial-bathroom-mirrors': { title: '商业工程镜', blurb: '公寓、办公、零售和公共卫浴的可重复规格。' },
  },
  es: {
    'led-bathroom-mirror-manufacturer': { title: 'Fabricante de espejos LED de baño', blurb: 'Espejos LED frontales, de contraluz e inteligentes para mayoristas y hoteles.' },
    'led-mirror-cabinet-manufacturer': { title: 'Fabricante de armarios con espejo LED', blurb: 'Almacenamiento iluminado con tamaño, luz, interior y embalaje a medida.' },
    'full-length-mirror-manufacturer': { title: 'Fabricante de espejos de cuerpo entero', blurb: 'De pared, inclinados y de tocador para retail, hoteles y proyectos.' },
    'anti-fog-led-mirror-manufacturer': { title: 'Fabricante de espejos LED antivaho', blurb: 'Cobertura del demister, controles y equipo eléctrico confirmados por modelo.' },
    'smart-bluetooth-mirror-manufacturer': { title: 'Fabricante de espejos Bluetooth', blurb: 'Altavoces, luz, antivaho y controles como una configuración ensayada.' },
    'irregular-shaped-mirror-manufacturer': { title: 'Fabricante de espejos irregulares', blurb: 'Contornos orgánicos, asimétricos y geométricos, con LED opcional.' },
    'led-mirror-wholesale-supplier': { title: 'Proveedor mayorista de espejos LED', blurb: 'Gama de fábrica, modelos mixtos, marca y embalaje de exportación.' },
    'custom-mirror-manufacturer': { title: 'Fabricante de espejos a medida', blurb: 'Convierta un plano, muestra o brief en un programa OEM/ODM fabricable.' },
    'custom-size-led-mirrors': { title: 'Espejos LED a medida', blurb: 'Iluminación y dimensiones según el tocador o el muro del proyecto.' },
    'oem-odm-mirror-manufacturing': { title: 'Fabricación OEM y ODM de espejos', blurb: 'Desarrollo de marca propia desde la especificación hasta el reaprovisionamiento.' },
    'hotel-bathroom-mirrors': { title: 'Espejos de baño para hoteles', blurb: 'Espejos de tocador y habitación según plano y cuadro de habitaciones.' },
    'commercial-bathroom-mirrors': { title: 'Espejos de baño comerciales', blurb: 'Especificaciones repetibles para apartamentos, oficinas, retail y aseos públicos.' },
  },
  fr: {
    'led-bathroom-mirror-manufacturer': { title: 'Fabricant de miroirs LED de salle de bains', blurb: 'Miroirs LED frontaux, rétroéclairés et connectés pour le gros et l’hôtellerie.' },
    'led-mirror-cabinet-manufacturer': { title: 'Fabricant d’armoires de toilette LED', blurb: 'Rangement éclairé avec dimensions, lumière, agencement et emballage sur mesure.' },
    'full-length-mirror-manufacturer': { title: 'Fabricant de miroirs en pied', blurb: 'Miroirs muraux, inclinés et dressing pour le retail, l’hôtellerie et les projets.' },
    'anti-fog-led-mirror-manufacturer': { title: 'Fabricant de miroirs LED antibuée', blurb: 'Zone chauffante, commandes et configuration électrique confirmées par modèle.' },
    'smart-bluetooth-mirror-manufacturer': { title: 'Fabricant de miroirs Bluetooth', blurb: 'Haut-parleurs, éclairage, antibuée et commandes en une configuration testée.' },
    'irregular-shaped-mirror-manufacturer': { title: 'Fabricant de miroirs de forme libre', blurb: 'Contours organiques, asymétriques et géométriques, LED en option.' },
    'led-mirror-wholesale-supplier': { title: 'Fournisseur de miroirs LED en gros', blurb: 'Gammes usine, modèles mixés, marquage et emballage export.' },
    'custom-mirror-manufacturer': { title: 'Fabricant de miroirs sur mesure', blurb: 'Transformez un plan, un échantillon ou un brief en programme OEM/ODM fabricable.' },
    'custom-size-led-mirrors': { title: 'Miroirs LED aux dimensions', blurb: 'Éclairage et cotes adaptés au meuble vasque et aux murs du projet.' },
    'oem-odm-mirror-manufacturing': { title: 'Fabrication OEM et ODM de miroirs', blurb: 'Développement marque privée de la spécification jusqu’aux réassorts.' },
    'hotel-bathroom-mirrors': { title: 'Miroirs de salle de bains hôteliers', blurb: 'Miroirs vasque et chambres spécifiés selon plans et nomenclatures.' },
    'commercial-bathroom-mirrors': { title: 'Miroirs de salle de bains tertiaires', blurb: 'Spécifications répétables pour appartements, bureaux, commerces et sanitaires publics.' },
  },
  de: {
    'led-bathroom-mirror-manufacturer': { title: 'LED-Badspiegel-Hersteller', blurb: 'Frontlicht-, Backlight- und Smart-LED-Spiegel für Großhandel und Hotels.' },
    'led-mirror-cabinet-manufacturer': { title: 'LED-Spiegelschrank-Hersteller', blurb: 'Beleuchtete Aufbewahrung mit Maß, Licht, Innenlayout und Verpackung.' },
    'full-length-mirror-manufacturer': { title: 'Ganzkörperspiegel-Hersteller', blurb: 'Wand-, Anlehn- und Ankleidespiegel für Retail, Hotels und Projekte.' },
    'anti-fog-led-mirror-manufacturer': { title: 'Anti-Beschlag-LED-Spiegel-Hersteller', blurb: 'Heizfläche, Steuerung und Elektrik werden je Modell bestätigt.' },
    'smart-bluetooth-mirror-manufacturer': { title: 'Smart-Bluetooth-Spiegel-Hersteller', blurb: 'Lautsprecher, Licht, Anti-Beschlag und Steuerung als getestete Konfiguration.' },
    'irregular-shaped-mirror-manufacturer': { title: 'Formspiegel-Hersteller', blurb: 'Organische, asymmetrische und geometrische Konturen, optional mit LED.' },
    'led-mirror-wholesale-supplier': { title: 'LED-Spiegel-Großhändler', blurb: 'Werkssortimente, Mischmodelle, Branding und Exportverpackung.' },
    'custom-mirror-manufacturer': { title: 'Maßspiegel-Hersteller', blurb: 'Zeichnung, Muster oder Briefing in ein fertigbares OEM/ODM-Programm überführen.' },
    'custom-size-led-mirrors': { title: 'LED-Spiegel nach Maß', blurb: 'Beleuchtung und Abmessungen passend zu Waschtisch und Projektwand.' },
    'oem-odm-mirror-manufacturing': { title: 'OEM- und ODM-Spiegelfertigung', blurb: 'Eigenmarkenentwicklung von der Spezifikation bis zur Folgebestellung.' },
    'hotel-bathroom-mirrors': { title: 'Hotel-Badspiegel', blurb: 'Waschtisch- und Zimmerspiegel nach Zeichnung und Zimmertabelle.' },
    'commercial-bathroom-mirrors': { title: 'Gewerbe-Badspiegel', blurb: 'Wiederholbare Specs für Wohnungen, Büros, Retail und öffentliche Sanitärbereiche.' },
  },
  it: {
    'led-bathroom-mirror-manufacturer': { title: 'Produttore di specchi LED da bagno', blurb: 'Specchi LED frontali, retroilluminati e smart per wholesale e hotel.' },
    'led-mirror-cabinet-manufacturer': { title: 'Produttore di armadietti a specchio LED', blurb: 'Storage illuminato con misura, luce, layout interno e imballo su misura.' },
    'full-length-mirror-manufacturer': { title: 'Produttore di specchi a figura intera', blurb: 'A parete, inclinati e da dressing per retail, hotel e progetti.' },
    'anti-fog-led-mirror-manufacturer': { title: 'Produttore di specchi LED antiappannamento', blurb: 'Area riscaldata, comandi e impianto elettrico confermati per modello.' },
    'smart-bluetooth-mirror-manufacturer': { title: 'Produttore di specchi Bluetooth', blurb: 'Speaker, luce, antiappannamento e comandi in una configurazione testata.' },
    'irregular-shaped-mirror-manufacturer': { title: 'Produttore di specchi sagomati', blurb: 'Contorni organici, asimmetrici e geometrici, con LED opzionale.' },
    'led-mirror-wholesale-supplier': { title: 'Fornitore wholesale di specchi LED', blurb: 'Gamma di fabbrica, modelli misti, branding e imballo export.' },
    'custom-mirror-manufacturer': { title: 'Produttore di specchi su misura', blurb: 'Trasforma disegno, campione o brief in un programma OEM/ODM producibile.' },
    'custom-size-led-mirrors': { title: 'Specchi LED su misura', blurb: 'Illuminazione e dimensioni per lavabi e pareti di progetto.' },
    'oem-odm-mirror-manufacturing': { title: 'Produzione OEM e ODM di specchi', blurb: 'Sviluppo private label dalla specifica al riordino.' },
    'hotel-bathroom-mirrors': { title: 'Specchi da bagno per hotel', blurb: 'Specchi vanity e camera specificati su disegno e room schedule.' },
    'commercial-bathroom-mirrors': { title: 'Specchi da bagno commerciali', blurb: 'Specifiche ripetibili per appartamenti, uffici, retail e bagni pubblici.' },
  },
};

const PRODUCT_CARD_COPY: Record<
  SupportedLanguage,
  {
    labels: Record<'led' | 'cabinet' | 'fullLength' | 'frameless' | 'shape' | 'standard', string>;
    summary: string;
  }
> = {
  en: {
    labels: { led: 'Custom LED bathroom mirror', cabinet: 'Custom LED mirror cabinet', fullLength: 'Custom full-length mirror', frameless: 'Custom frameless bathroom mirror', shape: 'Custom-shape bathroom mirror', standard: 'Custom bathroom mirror' },
    summary: 'Dimensions, finish, lighting functions, mounting and packaging can be reviewed against your project. Final configuration, MOQ and certification scope are confirmed during quotation.',
  },
  zh: {
    labels: { led: '可定制 LED 浴室镜', cabinet: '可定制 LED 镜柜', fullLength: '可定制全身镜', frameless: '可定制无框浴室镜', shape: '可定制异形浴室镜', standard: '可定制浴室镜' },
    summary: '支持按项目要求确认尺寸、外观、照明功能、安装方式及包装。具体配置、起订量与认证范围以询价审核为准。',
  },
  es: {
    labels: { led: 'Espejo LED de baño a medida', cabinet: 'Armario con espejo LED a medida', fullLength: 'Espejo de cuerpo entero a medida', frameless: 'Espejo de baño sin marco a medida', shape: 'Espejo de forma especial a medida', standard: 'Espejo de baño a medida' },
    summary: 'Podemos revisar dimensiones, acabado, iluminación, montaje y embalaje según su proyecto. La configuración, el MOQ y las certificaciones se confirman durante la cotización.',
  },
  fr: {
    labels: { led: 'Miroir de salle de bains LED sur mesure', cabinet: 'Armoire de toilette LED sur mesure', fullLength: 'Miroir en pied sur mesure', frameless: 'Miroir de salle de bains sans cadre sur mesure', shape: 'Miroir de forme spéciale sur mesure', standard: 'Miroir de salle de bains sur mesure' },
    summary: 'Dimensions, finition, éclairage, fixation et emballage peuvent être étudiés selon votre projet. La configuration, le MOQ et les certifications sont confirmés au devis.',
  },
  de: {
    labels: { led: 'LED-Badezimmerspiegel nach Maß', cabinet: 'LED-Spiegelschrank nach Maß', fullLength: 'Ganzkörperspiegel nach Maß', frameless: 'Rahmenloser Badspiegel nach Maß', shape: 'Formspiegel nach Maß', standard: 'Badezimmerspiegel nach Maß' },
    summary: 'Maße, Oberfläche, Beleuchtung, Montage und Verpackung werden passend zum Projekt geprüft. Konfiguration, MOQ und Zertifizierungsumfang werden im Angebot bestätigt.',
  },
  it: {
    labels: { led: 'Specchio LED da bagno su misura', cabinet: 'Armadietto a specchio LED su misura', fullLength: 'Specchio a figura intera su misura', frameless: 'Specchio da bagno senza cornice su misura', shape: 'Specchio sagomato su misura', standard: 'Specchio da bagno su misura' },
    summary: 'Dimensioni, finitura, illuminazione, montaggio e imballaggio possono essere valutati per il progetto. Configurazione, MOQ e certificazioni vengono confermati nel preventivo.',
  },
};

export function getSeoLandingProductCardCopy(
  product: SeoLandingProductInput,
  lang: SupportedLanguage
): { title: string; summary: string } {
  const searchable = `${product.title} ${product.category || ''}`.toLowerCase();
  const kind = /cabinet|medicine/.test(searchable)
    ? 'cabinet'
    : /full[ -]?length|dressing|floor/.test(searchable)
      ? 'fullLength'
      : /frameless|without led|non-led|non led/.test(searchable)
        ? 'frameless'
        : /irregular|organic|asymmetr|shape/.test(searchable)
          ? 'shape'
          : /led|lighted|illuminated|backlit/.test(searchable)
            ? 'led'
            : 'standard';
  const modelSource = product.description?.trim() || '';
  const model = modelSource.length <= 60
    ? modelSource.match(/[a-z]{1,}[a-z0-9._/\-]*\d[a-z0-9._/\-]*/i)?.[0] || ''
    : '';
  const copy = PRODUCT_CARD_COPY[lang] || PRODUCT_CARD_COPY.en;
  return {
    title: `${copy.labels[kind]}${model ? ` · ${model}` : ''}`,
    summary: copy.summary,
  };
}

export function getSeoSolutionsUi(lang: SupportedLanguage): SeoSolutionsUi {
  return UI[lang] || UI.en;
}

export function localizeSeoLandingPage(page: SeoLandingPage, lang: SupportedLanguage): SeoLandingPage {
  const translated = PAGE_TRANSLATIONS[lang]?.[page.slug];
  const card = SOLUTION_CARDS[lang]?.[page.slug] || SOLUTION_CARDS.en[page.slug];
  return {
    ...(translated ? { ...page, ...translated } : page),
    shortTitle: card?.title || page.shortTitle || page.h1,
    blurb: card?.blurb || page.blurb || page.description,
  };
}

export function getLocalizedSeoLandingPages(lang: SupportedLanguage): SeoLandingPage[] {
  return SEO_LANDING_PAGES.map((page) => localizeSeoLandingPage(page, lang));
}
