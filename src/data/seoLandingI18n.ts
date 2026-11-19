import type { SupportedLanguage } from '../hooks/useLocalizedPath';
import {
  SEO_LANDING_PAGES,
  type SeoLandingPage,
  type SeoLandingPageTranslation,
  type SeoLandingSection,
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

const BASE_PAGE_TRANSLATIONS: Partial<
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
    homeIntro: 'Explore engineering specifications for LED bathroom mirrors, custom CAD programs, hospitality FF&E, commercial washrooms, mirror cabinets and private-label OEM/ODM production.',
    homeExplore: 'Review spec guide',
    hubTitle: 'Mirror Manufacturing Solutions | OEM, Bulk & Project Specs | BOLEN',
    hubDescription: 'Explore BOLEN B2B manufacturing solutions: 5mm EN 1036 LED bathroom mirrors, custom CAD mirrors, hotel and commercial projects, mirror cabinets and OEM/ODM supply.',
    hubEyebrow: 'Factory programs',
    hubHeading: 'Mirror manufacturing solutions',
    hubIntro: 'Factory engineering programs for 5mm EN 1036 LED mirrors, custom OEM/ODM, container wholesale, and hotel or commercial projects.',
    discussProject: 'Discuss your project',
    browseCatalog: 'Browse product catalog',
    exploreSolution: 'Explore this solution',
    hubGroups: {
      product: { title: 'Product types', description: 'The mirror platform you need to sell or specify.' },
      sourcing: { title: 'How you buy', description: 'Container wholesale, custom sizing, and private-label OEM/ODM.' },
      project: { title: 'Projects', description: 'Hotel FF&E and multi-unit commercial supply.' },
    },
    howEyebrow: 'Next step',
    howHeading: 'How an inquiry works',
    howSteps: [
      { title: 'Choose a route', copy: 'Product platform, container wholesale/OEM, or a hotel/commercial schedule.' },
      { title: 'Send a spec', copy: 'Dimensions (mm/inch), quantity, voltage/market, and functions — CAD or photos help.' },
      { title: 'Get a factory quote', copy: '7–12 day sample, MOQ 50–100 pcs, 25–35 day lead time and ISTA-3A packing.' },
    ],
    strengths: [
      { title: 'Integrated 46,800 m² plant', copy: '5mm EN 1036 glass cutting, 6063-T5 frames, CRI ≥ 90 LED assembly, hi-pot testing and ISTA-3A export packing under ISO 9001.' },
      { title: 'Specification-led quoting', copy: 'Pricing and MOQ (typically 50–100 pcs) are confirmed against dimensions, IP44/IP54 electronics, packaging and destination compliance.' },
      { title: 'Verified compliance & warranty', copy: 'UL 962, CE EN 60598, SAA and RoHS component sets reviewed by model, backed by a 3-year electrical / 2-year structural warranty.' },
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
    homeIntro: '了解 5mm EN 1036 无铜银镜、CRI ≥ 90 LED 浴室镜、CAD 定制镜、酒店与商业工程、镜柜及 OEM/ODM 自有品牌生产规格。', homeExplore: '查看技术规格',
    hubTitle: '镜子制造解决方案 | OEM/ODM、整柜批发与工程供货 | BOLEN', hubDescription: '了解 BOLEN 面向 LED 浴室镜、定制镜、酒店和商业项目、镜柜及 OEM/ODM 项目的工程制造解决方案（MOQ 50–100 件，交期 25–35 天）。',
    hubEyebrow: '工厂采购', hubHeading: '镜子制造与采购方案',
    hubIntro: '覆盖 5mm 无铜银镜 LED 镜、定制 OEM/ODM、20GP/40HQ 混批供货，以及酒店与商业工程项目。',
    discussProject: '讨论您的项目', browseCatalog: '浏览产品目录', exploreSolution: '查看此方案',
    hubGroups: {
      product: { title: '产品类型', description: '要销售或工程指定的镜类平台。' },
      sourcing: { title: '采购方式', description: '整柜混批、按尺寸定制、自有品牌 OEM/ODM。' },
      project: { title: '工程项目', description: '酒店 FF&E 与多单元项目分批供货。' },
    },
    howEyebrow: '询价流程', howHeading: '怎样开始',
    howSteps: [
      { title: '选方案', copy: '产品平台、整柜批发/OEM，或酒店与商业工程。' },
      { title: '发规格', copy: '尺寸（毫米/英寸）、数量、目的国电压与认证要求、图纸或参考图。' },
      { title: '收报价', copy: '7–12 天打样、MOQ 50–100 件、25–35 天量产交期及 ISTA-3A 出口包装核算。' },
    ],
    strengths: [
      { title: '46,800 m² 一体化工厂', copy: '5mm EN 1036 无铜银镜裁切、6063-T5 铝框、CRI ≥ 90 灯带组装、耐压老化测试和 ISTA-3A 包装同厂完成。' },
      { title: '按规格透明报价', copy: '单价和起订量（常规 50–100 件）根据尺寸、IP44/IP54 电气配置、包装及目的市场认证核算。' },
      { title: '分项质保与认证核查', copy: '按型号匹配 UL 962、CE EN 60598、SAA、RoHS 认证方案，享 3 年电子元件 / 2 年镜体结构质保。' },
    ],
    home: '首页', solutions: '采购方案', requestQuote: '申请工厂报价', viewCatalog: '查看产品目录', relevantProducts: '相关产品',
    modelsHeading: '参考型号', viewAllProducts: '查看全部产品', buyerQuestions: '买家常见问题', faqHeading: '常见问题',
    relatedSolutions: '相关制造方案', quoteEyebrow: '按规格报价', quoteHeading: '请发送您需要的尺寸、数量和功能。', startRfq: '开始询价',
  },
  es: {
    navLabel: 'Soluciones', footerLabel: 'Soluciones de fabricación', homeEyebrow: 'Rutas de compra B2B', homeHeading: 'Encuentre la solución de fabricación de espejos adecuada',
    homeIntro: 'Consulte especificaciones técnicas para espejos LED de 5 mm EN 1036, programas CAD a medida, hostelería, proyectos comerciales, armarios LED y producción OEM/ODM.', homeExplore: 'Ver ficha técnica',
    hubTitle: 'Soluciones de fabricación de espejos | OEM, Mayorista y Proyectos | BOLEN', hubDescription: 'Explore soluciones industriales BOLEN para espejos LED EN 1036, espejos a medida, hoteles, proyectos comerciales, armarios y programas OEM/ODM (MOQ 50–100 uds.).',
    hubEyebrow: 'Programas de fábrica', hubHeading: 'Soluciones de fabricación de espejos',
    hubIntro: 'Programas de fábrica en vidrio 5 mm EN 1036 para espejos LED, OEM/ODM, contenedores 20GP/40HQ y proyectos hoteleros o comerciales.',
    discussProject: 'Hablemos de su proyecto', browseCatalog: 'Ver catálogo', exploreSolution: 'Explorar esta solución',
    hubGroups: {
      product: { title: 'Tipos de producto', description: 'Empiece por el espejo que necesita vender o especificar.' },
      sourcing: { title: 'Cómo compra', description: 'Rutas de contenedor mayorista, corte a medida y marca propia.' },
      project: { title: 'Suministro de proyecto', description: 'Programas FF&E de hostelería y multiunidad por fase.' },
    },
    howEyebrow: 'Cómo usar esta página', howHeading: 'Elija una ruta y envíe una especificación útil.',
    howSteps: [
      { title: 'Elija la ruta adecuada', copy: 'Tipo de producto, programa mayorista/OEM o suministro de proyecto hotelero y multiunidad.' },
      { title: 'Envíe la especificación', copy: 'Dimensiones (mm/pulgadas), cantidad, mercado (UL/CE/SAA), funciones y plano o foto.' },
      { title: 'Revise la cotización de fábrica', copy: 'Muestras en 7–12 días, MOQ 50–100 uds., producción en 25–35 días y embalaje ISTA-3A.' },
    ],
    strengths: [
      { title: 'Planta integrada de 46.800 m²', copy: 'Vidrio sin cobre de 5 mm EN 1036, marcos 6063-T5, LED CRI ≥ 90, ensayos eléctricos y embalaje ISTA-3A bajo ISO 9001.' },
      { title: 'Cotización según especificaciones', copy: 'Precio y MOQ (50–100 uds.) confirmados según medidas, protección IP44/IP54, embalaje y mercado.' },
      { title: 'Cumplimiento y garantía clara', copy: 'Componentes UL 962, CE EN 60598, SAA y RoHS por modelo, con garantía eléctrica de 3 años y estructural de 2 años.' },
    ],
    home: 'Inicio', solutions: 'Soluciones', requestQuote: 'Solicitar cotización de fábrica', viewCatalog: 'Ver catálogo de productos', relevantProducts: 'Productos relacionados',
    modelsHeading: 'Modelos para iniciar su especificación', viewAllProducts: 'Ver todos los productos', buyerQuestions: 'Preguntas de compradores', faqHeading: 'Preguntas frecuentes',
    relatedSolutions: 'Soluciones de fabricación relacionadas', quoteEyebrow: 'Cotización por especificación', quoteHeading: 'Envíenos dimensiones, cantidad y funciones necesarias.', startRfq: 'Iniciar solicitud',
  },
  fr: {
    navLabel: 'Solutions', footerLabel: 'Solutions de fabrication', homeEyebrow: 'Parcours d’achat B2B', homeHeading: 'Trouvez la bonne solution de fabrication de miroirs',
    homeIntro: 'Consultez nos spécifications techniques (verre 5 mm EN 1036, CRI ≥ 90, IP44/IP54) pour miroirs LED, sur-mesure CAD, hôtellerie, tertiaire, armoires LED et OEM/ODM.', homeExplore: 'Voir le cahier technique',
    hubTitle: 'Solutions de fabrication de miroirs | OEM, Gros & Projets | BOLEN', hubDescription: 'Découvrez les solutions industrielles BOLEN : miroirs LED 5 mm EN 1036, miroirs sur mesure, hôtels, tertiaire, armoires LED et OEM/ODM (MOQ 50–100 pcs).',
    hubEyebrow: 'Programmes usine', hubHeading: 'Solutions de fabrication de miroirs',
    hubIntro: 'Programmes usine certifiés ISO 9001 pour miroirs LED, OEM/ODM, conteneurs 20GP/40HQ et projets hôteliers ou tertiaires.',
    discussProject: 'Parler de votre projet', browseCatalog: 'Parcourir le catalogue', exploreSolution: 'Explorer cette solution',
    hubGroups: {
      product: { title: 'Types de produits', description: 'Commencez par le miroir que vous devez vendre ou prescrire.' },
      sourcing: { title: 'Mode d’approvisionnement', description: 'Conteneur grossiste, cotes sur mesure et marque privée.' },
      project: { title: 'Fourniture de projet', description: 'Programmes hôteliers FF&E et résidentiels par lot.' },
    },
    howEyebrow: 'Comment utiliser cette page', howHeading: 'Choisissez un parcours, puis envoyez un cahier des charges.',
    howSteps: [
      { title: 'Choisissez le bon parcours', copy: 'Famille produit, approvisionnement OEM/gros ou projet hôtelier et multi-logements.' },
      { title: 'Envoyez le cahier des charges', copy: 'Cotes (mm/pouces), quantité, marché (CE/UL/SAA), fonctions et plan CAD ou visuel.' },
      { title: 'Examinez le devis usine', copy: 'Prototype en 7–12 jours, MOQ 50–100 pcs, série en 25–35 jours et cartons ISTA-3A.' },
    ],
    strengths: [
      { title: 'Usine intégrée de 46 800 m²', copy: 'Découpe verre 5 mm EN 1036, cadres alu 6063-T5, LED CRI ≥ 90, tests diélectriques et emballage ISTA-3A.' },
      { title: 'Devis selon cahier des charges', copy: 'Prix et MOQ (50–100 pcs) confirmés selon dimensions, indice IP44/IP54, emballage et destination.' },
      { title: 'Conformité et garantie unifiée', copy: 'Composants CE EN 60598, UL 962, SAA et RoHS par modèle ; garantie 3 ans électronique / 2 ans structure.' },
    ],
    home: 'Accueil', solutions: 'Solutions', requestQuote: 'Demander un devis usine', viewCatalog: 'Voir le catalogue', relevantProducts: 'Produits associés',
    modelsHeading: 'Modèles pour démarrer votre cahier des charges', viewAllProducts: 'Voir tous les produits', buyerQuestions: 'Questions des acheteurs', faqHeading: 'Questions fréquentes',
    relatedSolutions: 'Solutions de fabrication associées', quoteEyebrow: 'Devis selon spécifications', quoteHeading: 'Envoyez-nous les dimensions, quantités et fonctions souhaitées.', startRfq: 'Démarrer une demande',
  },
  de: {
    navLabel: 'Lösungen', footerLabel: 'Fertigungslösungen', homeEyebrow: 'Beschaffungswege für Einkäufer', homeHeading: 'Die passende Lösung für Ihre Spiegelfertigung',
    homeIntro: 'Technische Spezifikationen (5 mm EN 1036 Glas, CRI ≥ 90, IP44/IP54) für LED-Badspiegel, CAD-Maßanfertigungen, Hotel- & Objektbau, Spiegelschränke und OEM/ODM.', homeExplore: 'Spezifikation prüfen',
    hubTitle: 'Lösungen für die Spiegelfertigung | OEM, Großhandel & Objekt | BOLEN', hubDescription: 'BOLEN Fertigungslösungen für 5 mm EN 1036 LED-Badspiegel, Maßspiegel, Hotel- und Gewerbeprojekte, Spiegelschränke sowie OEM/ODM (MOQ 50–100 Stk.).',
    hubEyebrow: 'Werksprogramme', hubHeading: 'Lösungen für die Spiegelfertigung',
    hubIntro: 'ISO-9001-Werksprogramme für LED-Spiegel, OEM/ODM, 20GP/40HQ-Container und Hotel- oder Gewerbeprojekte.',
    discussProject: 'Projekt besprechen', browseCatalog: 'Produktkatalog ansehen', exploreSolution: 'Diese Lösung entdecken',
    hubGroups: {
      product: { title: 'Produkttypen', description: 'Beginnen Sie mit dem Spiegel, den Sie verkaufen oder ausschreiben möchten.' },
      sourcing: { title: 'Beschaffungsweg', description: 'Container-Großhandel, Maßanfertigung und Eigenmarkenfertigung.' },
      project: { title: 'Projektlieferung', description: 'Hotel-FF&E und Mehrparteienprogramme nach Bauphase.' },
    },
    howEyebrow: 'So nutzen Sie diese Seite', howHeading: 'Route wählen, dann eine belastbare Spezifikation senden.',
    howSteps: [
      { title: 'Passende Route wählen', copy: 'Produkttyp, OEM/Großhandel oder Objektlieferung für Hotels und Wohnanlagen.' },
      { title: 'Arbeitsspezifikation senden', copy: 'Maße (mm/Zoll), Menge, Zielmarkt (CE/UL/SAA), Funktionen und CAD-Zeichnung.' },
      { title: 'Werksangebot prüfen', copy: 'Muster in 7–12 Tagen, MOQ 50–100 Stk., Serie in 25–35 Tagen und ISTA-3A-Verpackung.' },
    ],
    strengths: [
      { title: '46.800 m² Direktwerk', copy: '5 mm EN 1036 Spiegelglas, 6063-T5 Alurahmen, CRI ≥ 90 LEDs, Hochspannungstest und ISTA-3A-Exportkartons.' },
      { title: 'Spezifikationsbasierte Angebote', copy: 'Preis und MOQ (50–100 Stk.) werden anhand von Maßen, IP44/IP54-Technik, Verpackung und Zielmarkt bestätigt.' },
      { title: 'Geprüfte Normen & Garantie', copy: 'CE EN 60598, UL 962, SAA und RoHS je Modell; 3 Jahre Garantie auf Elektronik, 2 Jahre auf Spiegel & Rahmen.' },
    ],
    home: 'Startseite', solutions: 'Lösungen', requestQuote: 'Werksangebot anfordern', viewCatalog: 'Produktkatalog ansehen', relevantProducts: 'Passende Produkte',
    modelsHeading: 'Modelle als Ausgangspunkt Ihrer Spezifikation', viewAllProducts: 'Alle Produkte ansehen', buyerQuestions: 'Fragen von Einkäufern', faqHeading: 'Häufige Fragen',
    relatedSolutions: 'Verwandte Fertigungslösungen', quoteEyebrow: 'Spezifikationsbasiertes Angebot', quoteHeading: 'Senden Sie uns Maße, Menge und gewünschte Funktionen.', startRfq: 'Anfrage starten',
  },
  it: {
    navLabel: 'Soluzioni', footerLabel: 'Soluzioni produttive', homeEyebrow: 'Percorsi di acquisto B2B', homeHeading: 'Trova la soluzione giusta per la produzione di specchi',
    homeIntro: 'Specifiche tecniche (vetro 5 mm EN 1036, CRI ≥ 90, IP44/IP54) per specchi LED da bagno, progetti CAD su misura, hospitality, contract, armadietti LED e OEM/ODM.', homeExplore: 'Vedi scheda tecnica',
    hubTitle: 'Soluzioni per la produzione di specchi | OEM, Wholesale & Contract | BOLEN', hubDescription: 'Scopri le soluzioni industriali BOLEN per specchi LED 5 mm EN 1036, specchi su misura, hotel, progetti contract, armadietti LED e programmi OEM/ODM (MOQ 50–100 pz).',
    hubEyebrow: 'Programmi di fabbrica', hubHeading: 'Soluzioni per la produzione di specchi',
    hubIntro: 'Programmi produttivi ISO 9001 per specchi LED, OEM/ODM, container 20GP/40HQ e forniture hotel o commerciali.',
    discussProject: 'Parliamo del progetto', browseCatalog: 'Sfoglia il catalogo', exploreSolution: 'Esplora questa soluzione',
    hubGroups: {
      product: { title: 'Tipi di prodotto', description: 'Parti dallo specchio che devi vendere o inserire a capitolato.' },
      sourcing: { title: 'Come acquisti', description: 'Container wholesale, taglio su misura e private label.' },
      project: { title: 'Fornitura di progetto', description: 'Programmi hospitality FF&E e multiunità per lotto.' },
    },
    howEyebrow: 'Come usare questa pagina', howHeading: 'Scegli un percorso, poi invia una specifica operativa.',
    howSteps: [
      { title: 'Scegli il percorso giusto', copy: 'Famiglia prodotto, fornitura OEM/wholesale o capitolato hotel e multiunità.' },
      { title: 'Invia la specifica', copy: 'Quote (mm/pollici), quantità, mercato (CE/UL/SAA), funzioni e disegno CAD.' },
      { title: 'Esamina il preventivo di fabbrica', copy: 'Campione in 7–12 giorni, MOQ 50–100 pz, serie in 25–35 giorni e imballo ISTA-3A.' },
    ],
    strengths: [
      { title: 'Stabilimento da 46.800 m²', copy: 'Vetro 5 mm EN 1036 senza rame, telai 6063-T5, LED CRI ≥ 90, collaudo elettrico e cartoni export ISTA-3A.' },
      { title: 'Preventivi su specifica', copy: 'Prezzo e MOQ (50–100 pz) confermati su dimensioni, grado IP44/IP54, imballaggio e mercato.' },
      { title: 'Certificazioni e garanzia chiara', copy: 'Componenti CE EN 60598, UL 962, SAA e RoHS per modello; garanzia 3 anni elettronica / 2 anni struttura.' },
    ],
    home: 'Home', solutions: 'Soluzioni', requestQuote: 'Richiedi preventivo di fabbrica', viewCatalog: 'Vedi catalogo prodotti', relevantProducts: 'Prodotti pertinenti',
    modelsHeading: 'Modelli da cui partire per la specifica', viewAllProducts: 'Vedi tutti i prodotti', buyerQuestions: 'Domande degli acquirenti', faqHeading: 'Domande frequenti',
    relatedSolutions: 'Soluzioni produttive correlate', quoteEyebrow: 'Preventivo su specifica', quoteHeading: 'Invia dimensioni, quantità e funzioni richieste.', startRfq: 'Avvia richiesta',
  },
};

export type SeoLandingProductInput = {
  id?: string;
  title: string;
  description?: string;
  category?: string;
};

type SolutionCardCopy = {
  title: string;
  blurb: string;
  footerAnchor: string;
  homeAnchor: string;
  relatedAnchor: string;
};

const SOLUTION_CARDS: Record<SupportedLanguage, Record<string, SolutionCardCopy>> = {
  en: {
    'led-bathroom-mirror-manufacturer': {
      title: 'LED bathroom mirror manufacturer',
      blurb: '5mm EN 1036 glass, CRI ≥ 90, 2700K–6500K dimming and IP44/IP54 OEM vanity mirrors.',
      footerAnchor: 'LED Vanity Mirror OEM Programs',
      homeAnchor: 'Engineered LED Bathroom Mirror Collections',
      relatedAnchor: 'OEM LED Bathroom Vanity Mirror Engineering',
    },
    'led-mirror-cabinet-manufacturer': {
      title: 'LED mirror cabinet manufacturer',
      blurb: 'IP44 aluminum & moisture-resistant cabinets with 110° soft-close hinges, CRI ≥ 90 LEDs and MOQ 30–50 pcs.',
      footerAnchor: 'Illuminated Mirror Cabinet OEM',
      homeAnchor: 'Wall & Recessed LED Mirror Cabinets',
      relatedAnchor: 'IP44 Illuminated Mirror & Medicine Cabinets',
    },
    'full-length-mirror-manufacturer': {
      title: 'Full-length mirror manufacturer',
      blurb: '1500–1800+ mm wall, leaning & easel floor mirrors with CAT II shatter film and ISTA-3A packing.',
      footerAnchor: 'Full-Length & Floor Mirror Supply',
      homeAnchor: 'Full-Length Dressing & Hospitality Floor Mirrors',
      relatedAnchor: 'Wall, Leaning & Freestanding Full-Length Mirrors',
    },
    'anti-fog-led-mirror-manufacturer': {
      title: 'Anti-fog LED mirror manufacturer',
      blurb: '150–250 W/m² PET demister pads (3–5 min clear zone), IP44/IP54 sealing and 60-min auto-off options.',
      footerAnchor: 'Heated Anti-Fog LED Mirrors',
      homeAnchor: 'Heated Demister & Anti-Fog Bathroom Mirrors',
      relatedAnchor: 'PET Demister Pad & Anti-Fog Mirror Specifications',
    },
    'smart-bluetooth-mirror-manufacturer': {
      title: 'Smart Bluetooth mirror manufacturer',
      blurb: 'Bluetooth 5.0/5.3 stereo speakers, clock/temp readout, CRI ≥ 90 dimming and CE RED / FCC / UL compliance.',
      footerAnchor: 'Connected Bluetooth Smart Mirrors',
      homeAnchor: 'Bluetooth Audio, Clock & Multi-Sensor Mirrors',
      relatedAnchor: 'Connected Bluetooth & Touch-Display Mirror Specs',
    },
    'irregular-shaped-mirror-manufacturer': {
      title: 'Irregular shaped mirror manufacturer',
      blurb: '±1.0 mm CNC pebble, wavy, arch and asymmetric 5mm EN 1036 mirrors with contour-cut EPE packaging.',
      footerAnchor: 'Organic & Irregular Shape Mirrors',
      homeAnchor: 'CNC Organic, Pebble & Asymmetric Mirrors',
      relatedAnchor: 'Custom Contour & Irregular Shape Mirror Fabrication',
    },
    'led-mirror-wholesale-supplier': {
      title: 'Wholesale LED mirror supplier',
      blurb: 'Mix 4–8 SKUs per 20GP/40HQ container starting at MOQ 50 pcs with ISTA-3A cartons in 25–35 days.',
      footerAnchor: 'Bulk & Container Mirror Wholesale',
      homeAnchor: 'Mixed-SKU 20GP/40HQ Container Wholesale Supply',
      relatedAnchor: 'Distributor Assortment & Container Bulk Programs',
    },
    'custom-mirror-manufacturer': {
      title: 'Custom mirror manufacturer',
      blurb: 'CAD drawings to 7–12 day prototypes in 5mm EN 1036 glass, 6063-T5 aluminum, brass or wood frames.',
      footerAnchor: 'CAD-to-Production Custom Mirrors',
      homeAnchor: 'Bespoke CAD & Frame Mirror Fabrication',
      relatedAnchor: 'Drawing-to-Sample Bespoke Mirror Construction',
    },
    'custom-size-led-mirrors': {
      title: 'Custom-size LED mirrors',
      blurb: '400–2000+ mm made-to-measure widths with scaled 24V LED wattage, 36W–96W drivers and zero mold fees.',
      footerAnchor: 'Made-to-Measure LED Mirror Sizing',
      homeAnchor: 'Cut-to-Size Single & Double Vanity LED Mirrors',
      relatedAnchor: 'Made-to-Measure Millimeter & Inch LED Mirror Sizing',
    },
    'oem-odm-mirror-manufacturing': {
      title: 'OEM & ODM mirror manufacturing',
      blurb: 'ISO 9001 private-label BOM lock, UL 962 / CE / SAA dossiers, retail packaging and 3-yr LED warranty.',
      footerAnchor: 'Private-Label OEM & ODM Programs',
      homeAnchor: 'Private-Label OEM & ODM Brand Manufacturing',
      relatedAnchor: 'Private-Label BOM Control & ODM Mirror Development',
    },
    'hotel-bathroom-mirrors': {
      title: 'Hotel bathroom mirrors',
      blurb: 'CRI ≥ 90–95 hospitality lighting, UL/CE hardwired switches, 7–12 day mock-up samples & floor labeling.',
      footerAnchor: 'Hospitality & Hotel FF&E Mirrors',
      homeAnchor: 'Hospitality FF&E & Guest-Room Mirror Schedules',
      relatedAnchor: 'Hotel Mock-Up Room & FF&E Mirror Specifications',
    },
    'commercial-bathroom-mirrors': {
      title: 'Commercial bathroom mirrors',
      blurb: '5mm EN 1036 + CAT II shatter-backed mirrors for multi-family apartments, offices and public washrooms.',
      footerAnchor: 'Multi-Unit & Commercial Mirrors',
      homeAnchor: 'Multi-Family & Commercial Washroom Mirror Supply',
      relatedAnchor: 'Multi-Unit Apartment & Public Washroom Mirror Specs',
    },
  },
  zh: {
    'led-bathroom-mirror-manufacturer': {
      title: 'LED 浴室镜制造商',
      blurb: '5mm EN 1036 无铜银镜、CRI ≥ 90、2700K–6500K 调光与 IP44/IP54 密封驱动 OEM 制造。',
      footerAnchor: 'LED 梳妆浴室镜工程定制',
      homeAnchor: '高显指防潮 LED 浴室镜产品系列开发',
      relatedAnchor: 'OEM 光学与防潮 LED 浴室镜工程规范',
    },
    'led-mirror-cabinet-manufacturer': {
      title: 'LED 镜柜制造商',
      blurb: 'IP44 铝制/防潮储物镜柜，配 110° 缓冲铰链、CRI ≥ 90 照明与 30–50 件灵活起订量。',
      footerAnchor: '智能发光储物镜柜定制',
      homeAnchor: '壁挂与嵌入式 LED 储物镜柜工程方案',
      relatedAnchor: 'IP44 防潮发光镜柜结构与包装标准',
    },
    'full-length-mirror-manufacturer': {
      title: '全身镜制造商',
      blurb: '1500–1800+ mm 壁挂、斜靠与落地支架穿衣镜，配 CAT II 防爆膜与 ISTA-3A 抗弯包装。',
      footerAnchor: '酒店与零售全身穿衣镜供货',
      homeAnchor: '壁挂与落地防爆全身穿衣镜项目供货',
      relatedAnchor: '大尺寸防爆全身镜与抗弯出口包装指南',
    },
    'anti-fog-led-mirror-manufacturer': {
      title: '防雾 LED 镜制造商',
      blurb: '150–250 W/m² PET 电热除雾膜（3–5 分钟快速清晰），支持 60 分钟自动断电与 IP44 防护。',
      footerAnchor: '电热除雾浴室镜技术方案',
      homeAnchor: '按型号匹配加热区的电热防雾 LED 镜',
      relatedAnchor: 'PET 电热防雾膜功率与清晰区配置说明',
    },
    'smart-bluetooth-mirror-manufacturer': {
      title: '智能蓝牙镜制造商',
      blurb: '蓝牙 5.0/5.3 双密封音响、时钟温度数显、CRI ≥ 90 调光及 CE RED / FCC / UL 合规配置。',
      footerAnchor: '蓝牙音响数显智能镜方案',
      homeAnchor: '集成蓝牙音频与数显触控的智能浴室镜',
      relatedAnchor: '智能蓝牙音响、数显与多传感镜配置指南',
    },
    'irregular-shaped-mirror-manufacturer': {
      title: '异形镜制造商',
      blurb: '±1.0 mm CNC 鹅卵石、波浪、拱形及不对称 5mm 无铜银镜，配异形模切 EPE 防护包装。',
      footerAnchor: 'CNC 有机异形镜定制生产',
      homeAnchor: '鹅卵石、拱形与不规则艺术镜 CNC 制造',
      relatedAnchor: '有机轮廓异形镜裁切公差与包装规范',
    },
    'led-mirror-wholesale-supplier': {
      title: 'LED 镜批发供应商',
      blurb: '支持 20GP/40HQ 整柜混装 4–8 款型号，单款 MOQ 50 件起，25–35 天港口直发。',
      footerAnchor: '20GP/40HQ 整柜混批供货',
      homeAnchor: '面向经销商的整柜多型号混装批发方案',
      relatedAnchor: '经销商价格带组合与整柜装柜批发指南',
    },
    'custom-mirror-manufacturer': {
      title: '定制镜制造商',
      blurb: '承接 CAD 图纸 7–12 天快速打样，涵盖 5mm 无铜银镜、6063-T5 铝框、拉丝金及实木边框。',
      footerAnchor: '按 CAD 图纸来图定制制镜',
      homeAnchor: '从 CAD 图纸到量产的专属镜款定制工程',
      relatedAnchor: '来图定制镜框材质、CNC 公差与打样流程',
    },
    'custom-size-led-mirrors': {
      title: '定制尺寸 LED 镜',
      blurb: '400–2000+ mm 免开模按尺寸裁切，同步匹配 24V 灯带流明与 36W–96W 驱动功率。',
      footerAnchor: '按台盆墙面定尺生产 LED 镜',
      homeAnchor: '单双盆非标尺寸免开模定制 LED 浴室镜',
      relatedAnchor: '毫米/英寸非标尺寸 LED 镜功率匹配方案',
    },
    'oem-odm-mirror-manufacturing': {
      title: 'OEM / ODM 镜子制造',
      blurb: 'ISO 9001 体系锁定 BOM 清单，提供 UL 962 / CE / SAA 认证档案、彩盒包装与 3 年电子质保。',
      footerAnchor: '自有品牌 OEM/ODM 代工体系',
      homeAnchor: '全球卫浴品牌 OEM/ODM 专案研发与品控',
      relatedAnchor: '自有品牌 BOM 锁定、激光标与合规代工指南',
    },
    'hotel-bathroom-mirrors': {
      title: '酒店浴室镜',
      blurb: 'CRI ≥ 90–95 酒店显色照明、墙控硬接线、7–12 天样板间打样及按楼层房型分箱贴标。',
      footerAnchor: '酒店客房与样板间工程供货',
      homeAnchor: '酒店 FF&E 客房梳妆镜与按楼层交付方案',
      relatedAnchor: '酒店样板间深化图纸与客房工程镜规范',
    },
    'commercial-bathroom-mirrors': {
      title: '商业工程镜',
      blurb: '5mm EN 1036 无铜镜配 CAT II 安全防爆背膜，适用于长租公寓、写字楼与公共卫浴工程。',
      footerAnchor: '公寓与公共商业卫浴工程镜',
      homeAnchor: '多单元公寓与商业公共空间耐用卫浴镜',
      relatedAnchor: '商业公区与多户型公寓防爆卫浴镜标准',
    },
  },
  es: {
    'led-bathroom-mirror-manufacturer': {
      title: 'Fabricante de espejos LED de baño',
      blurb: 'Vidrio 5 mm EN 1036 sin cobre, CRI ≥ 90, CCT 2700K–6500K y protección IP44/IP54 OEM.',
      footerAnchor: 'Programas OEM de espejos LED de tocador',
      homeAnchor: 'Ingeniería de colecciones de espejos LED de baño',
      relatedAnchor: 'Especificaciones ópticas y eléctricas de espejos LED',
    },
    'led-mirror-cabinet-manufacturer': {
      title: 'Fabricante de armarios con espejo LED',
      blurb: 'Armarios IP44 en aluminio con bisagras suaves de 110°, LED CRI ≥ 90 y MOQ 30–50 uds.',
      footerAnchor: 'Armarios de baño iluminados OEM',
      homeAnchor: 'Armarios con espejo LED murales y empotrados',
      relatedAnchor: 'Ingeniería y embalaje ISTA-3A de armarios LED',
    },
    'full-length-mirror-manufacturer': {
      title: 'Fabricante de espejos de cuerpo entero',
      blurb: 'Formatos de 1500–1800+ mm de pared o pie con lámina antiexplosión CAT II y cartón ISTA-3A.',
      footerAnchor: 'Suministro de espejos de cuerpo entero',
      homeAnchor: 'Espejos vestidores y de suelo para retail y hoteles',
      relatedAnchor: 'Especificaciones de espejos largos con lámina CAT II',
    },
    'anti-fog-led-mirror-manufacturer': {
      title: 'Fabricante de espejos LED antivaho',
      blurb: 'Lámina PET calefactora de 150–250 W/m² (3–5 min), IP44/IP54 y apagado automático de 60 min.',
      footerAnchor: 'Espejos LED con desempañador térmico',
      homeAnchor: 'Espejos de baño con lámina calefactora antivaho',
      relatedAnchor: 'Dimensionamiento térmico y control de espejos antivaho',
    },
    'smart-bluetooth-mirror-manufacturer': {
      title: 'Fabricante de espejos Bluetooth',
      blurb: 'Audio Bluetooth 5.0/5.3, reloj/temperatura, LED CRI ≥ 90 y conformidad CE RED / FCC / UL.',
      footerAnchor: 'Espejos inteligentes con audio Bluetooth',
      homeAnchor: 'Espejos conectados con altavoces, reloj y sensores',
      relatedAnchor: 'Configuración electrónica de espejos Smart Bluetooth',
    },
    'irregular-shaped-mirror-manufacturer': {
      title: 'Fabricante de espejos irregulares',
      blurb: 'Corte CNC ±1,0 mm en vidrio 5 mm EN 1036 para siluetas orgánicas y espuma troquelada EPE.',
      footerAnchor: 'Espejos orgánicos y asimétricos CNC',
      homeAnchor: 'Fabricación CNC de espejos orgánicos y de diseño',
      relatedAnchor: 'Tolerancias CNC y embalaje para espejos irregulares',
    },
    'led-mirror-wholesale-supplier': {
      title: 'Proveedor mayorista de espejos LED',
      blurb: 'Combine 4–8 SKUs por contenedor 20GP/40HQ desde MOQ 50 uds. con envío en 25–35 días.',
      footerAnchor: ' Suministro mayorista por contenedor',
      homeAnchor: 'Consolidación mayorista 20GP/40HQ para distribuidores',
      relatedAnchor: 'Surtido mayorista y carga mixta de contenedores',
    },
    'custom-mirror-manufacturer': {
      title: 'Fabricante de espejos a medida',
      blurb: 'Del plano CAD a prototipo en 7–12 días con vidrio EN 1036 y marcos de aluminio 6063-T5 o madera.',
      footerAnchor: 'Espejos personalizados bajo plano CAD',
      homeAnchor: 'Fabricación bajo plano CAD y acabados a medida',
      relatedAnchor: 'Desarrollo técnico desde planos CAD a prototipo',
    },
    'custom-size-led-mirrors': {
      title: 'Espejos LED a medida',
      blurb: 'Corte exacto de 400 a 2000+ mm con potencia LED 24V y drivers de 36W–96W escalados sin molde.',
      footerAnchor: 'Corte de espejos LED por dimensiones',
      homeAnchor: 'Espejos LED dimensionados para tocadores simples y dobles',
      relatedAnchor: 'Escalado lumínico para espejos LED a medida',
    },
    'oem-odm-mirror-manufacturing': {
      title: 'Fabricación OEM y ODM de espejos',
      blurb: 'Planta ISO 9001 con bloqueo BOM, dossieres UL 962 / CE / SAA y garantía LED de 3 años.',
      footerAnchor: 'Producción OEM/ODM para marcas propias',
      homeAnchor: 'Programas industriales OEM y ODM de marca blanca',
      relatedAnchor: 'Control BOM, certificaciones y marca propia OEM/ODM',
    },
    'hotel-bathroom-mirrors': {
      title: 'Espejos de baño para hoteles',
      blurb: 'Luz CRI ≥ 90–95, conexión mural UL/CE, muestras piloto en 7–12 días y etiquetado por planta.',
      footerAnchor: 'Proyectos FF&E de espejos hoteleros',
      homeAnchor: 'Especificaciones FF&E para habitaciones y suites de hotel',
      relatedAnchor: 'Suministro hotelero por fases y habitación piloto',
    },
    'commercial-bathroom-mirrors': {
      title: 'Espejos de baño comerciales',
      blurb: 'Vidrio 5 mm EN 1036 con film de seguridad CAT II para promociones residenciales y edificios públicos.',
      footerAnchor: 'Espejos para obra residencial y pública',
      homeAnchor: 'Suministro comercial para edificios multiunidad y oficinas',
      relatedAnchor: 'Especificaciones de espejos para promociones y aseos públicos',
    },
  },
  fr: {
    'led-bathroom-mirror-manufacturer': {
      title: 'Fabricant de miroirs LED de salle de bains',
      blurb: 'Verre 5 mm EN 1036 sans cuivre, CRI ≥ 90, CCT 2700K–6500K et étanchéité IP44/IP54 OEM.',
      footerAnchor: 'Programmes OEM miroirs LED vasque',
      homeAnchor: 'Ingénierie de collections de miroirs LED sanitaires',
      relatedAnchor: 'Spécifications optiques et IP44 des miroirs LED',
    },
    'led-mirror-cabinet-manufacturer': {
      title: 'Fabricant d’armoires de toilette LED',
      blurb: 'Armoires alu IP44 avec charnières freinées 110°, LED CRI ≥ 90 et MOQ 30–50 pcs.',
      footerAnchor: 'Armoires de toilette éclairées OEM',
      homeAnchor: 'Armoires à miroir LED murales et encastrables',
      relatedAnchor: 'Conception et emballage ISTA-3A d’armoires LED',
    },
    'full-length-mirror-manufacturer': {
      title: 'Fabricant de miroirs en pied',
      blurb: 'Formats 1500–1800+ mm muraux ou sur pied avec film sécurité CAT II et cartons ISTA-3A.',
      footerAnchor: 'Fourniture de miroirs en pied et dressing',
      homeAnchor: 'Miroirs en pied sécurisés pour hôtels et retail',
      relatedAnchor: 'Cahier technique des miroirs en pied film CAT II',
    },
    'anti-fog-led-mirror-manufacturer': {
      title: 'Fabricant de miroirs LED antibuée',
      blurb: 'Film chauffant PET 150–250 W/m² (clair en 3–5 min), IP44/IP54 et arrêt auto 60 min.',
      footerAnchor: 'Miroirs LED à désembuage thermique',
      homeAnchor: 'Miroirs sanitaires avec film antibuée dimensionné',
      relatedAnchor: 'Puissance thermique et zone claire antibuée par modèle',
    },
    'smart-bluetooth-mirror-manufacturer': {
      title: 'Fabricant de miroirs Bluetooth',
      blurb: 'Audio Bluetooth 5.0/5.3 étanche, horloge/température, CRI ≥ 90 et normes CE RED / FCC / UL.',
      footerAnchor: 'Miroirs connectés audio Bluetooth',
      homeAnchor: 'Miroirs intelligents Bluetooth, affichage et capteurs',
      relatedAnchor: 'Architecture électronique des miroirs Bluetooth',
    },
    'irregular-shaped-mirror-manufacturer': {
      title: 'Fabricant de miroirs de forme libre',
      blurb: 'Découpe CNC ±1,0 mm sur verre 5 mm EN 1036 pour formes galet/asymétriques et mousse EPE.',
      footerAnchor: 'Miroirs organiques et asymétriques CNC',
      homeAnchor: 'Façonnage CNC de miroirs organiques et galets',
      relatedAnchor: 'Découpe vectorielle et calage des miroirs irréguliers',
    },
    'led-mirror-wholesale-supplier': {
      title: 'Fournisseur de miroirs LED en gros',
      blurb: 'Panachez 4–8 SKUs par conteneur 20GP/40HQ dès MOQ 50 pcs, expédié en 25–35 jours.',
      footerAnchor: 'Approvisionnement gros par conteneur',
      homeAnchor: 'Consolidation conteneurs 20GP/40HQ pour distributeurs',
      relatedAnchor: 'Gammes grossistes et panachage conteneur multi-modèles',
    },
    'custom-mirror-manufacturer': {
      title: 'Fabricant de miroirs sur mesure',
      blurb: 'Du plan CAD au prototype en 7–12 jours : verre EN 1036, cadres alu 6063-T5, laiton ou bois.',
      footerAnchor: 'Miroirs sur plan CAD et finitions dédiées',
      homeAnchor: 'Fabrication sur plan CAD et cadres personnalisés',
      relatedAnchor: 'Étude sur plan CAD et prototypage en 7–12 jours',
    },
    'custom-size-led-mirrors': {
      title: 'Miroirs LED aux dimensions',
      blurb: 'Largeurs sur mesure 400–2000+ mm avec puissance LED 24V et drivers 36W–96W sans frais de moule.',
      footerAnchor: 'Miroirs LED coupés aux cotes projet',
      homeAnchor: 'Miroirs LED sur mesure pour simple et double vasque',
      relatedAnchor: 'Dimensionnement millimétrique et puissance LED adaptée',
    },
    'oem-odm-mirror-manufacturing': {
      title: 'Fabrication OEM et ODM de miroirs',
      blurb: 'Usine ISO 9001 : verrouillage BOM, dossiers CE / UL 962 / SAA et garantie électronique 3 ans.',
      footerAnchor: 'Programmes marque privée OEM & ODM',
      homeAnchor: 'Développement industriel OEM & ODM pour marques',
      relatedAnchor: 'Gouvernance BOM, marquage laser et dossiers OEM/ODM',
    },
    'hotel-bathroom-mirrors': {
      title: 'Miroirs de salle de bains hôteliers',
      blurb: 'Éclairage CRI ≥ 90–95, raccordement mural CE/UL, chambre témoin en 7–12 j et repérage par étage.',
      footerAnchor: 'Projets hôteliers FF&E sur plans',
      homeAnchor: 'Prescriptions FF&E pour chambres d’hôtels et résidences',
      relatedAnchor: 'Échantillons chambre témoin et logistique hôtelière',
    },
    'commercial-bathroom-mirrors': {
      title: 'Miroirs de salle de bains tertiaires',
      blurb: 'Verre 5 mm EN 1036 + film anti-éclats CAT II pour logements collectifs, bureaux et ERP.',
      footerAnchor: 'Miroirs pour logements collectifs et ERP',
      homeAnchor: 'Fourniture tertiaire et résidentielle multi-lots',
      relatedAnchor: 'Normes de sécurité CAT II pour sanitaires collectifs',
    },
  },
  de: {
    'led-bathroom-mirror-manufacturer': {
      title: 'LED-Badspiegel-Hersteller',
      blurb: '5 mm EN 1036 Kristallspiegel, CRI ≥ 90, 2700K–6500K Dimmung und IP44/IP54 OEM-Technik.',
      footerAnchor: 'OEM-Programme für LED-Waschtischspiegel',
      homeAnchor: 'Technische LED-Badspiegel-Kollektionen ab Werk',
      relatedAnchor: 'Optische & elektrische OEM-Spezifikationen für LED-Spiegel',
    },
    'led-mirror-cabinet-manufacturer': {
      title: 'LED-Spiegelschrank-Hersteller',
      blurb: 'IP44-Aluminium-Spiegelschränke mit 110°-Soft-Close, CRI ≥ 90 LEDs und MOQ 30–50 Stk.',
      footerAnchor: 'Beleuchtete OEM-Spiegelschränke',
      homeAnchor: 'Aufputz- & Unterputz-LED-Spiegelschränke',
      relatedAnchor: 'IP44-Spiegelschrank-Konstruktion & ISTA-3A-Verpackung',
    },
    'full-length-mirror-manufacturer': {
      title: 'Ganzkörperspiegel-Hersteller',
      blurb: '1500–1800+ mm Wand- und Standspiegel mit CAT-II-Splitterschutzfolie und ISTA-3A-Karton.',
      footerAnchor: 'Ganzkörper- & Standspiegel-Lieferung',
      homeAnchor: 'Bruchsichere Ankleide- und Standspiegel für Handel & Hotel',
      relatedAnchor: 'Großformat-Ganzkörperspiegel mit CAT-II-Sicherheitsfolie',
    },
    'anti-fog-led-mirror-manufacturer': {
      title: 'Anti-Beschlag-LED-Spiegel-Hersteller',
      blurb: '150–250 W/m² PET-Heizmatte (3–5 Min. frei), IP44/IP54 und 60-Min.-Abschaltautomatik.',
      footerAnchor: 'Beheizte Anti-Beschlag-Badspiegel',
      homeAnchor: 'LED-Badspiegel mit modellgeprüfter Heizflächenabdeckung',
      relatedAnchor: 'Heizmatten-Auslegung & Steuerung bei Anti-Beschlag-Spiegeln',
    },
    'smart-bluetooth-mirror-manufacturer': {
      title: 'Smart-Bluetooth-Spiegel-Hersteller',
      blurb: 'Bluetooth 5.0/5.3 Stereo-Treiber, Uhr/Temperatur, CRI ≥ 90 und CE RED / FCC / UL Konformität.',
      footerAnchor: 'Vernetzte Bluetooth-Smart-Spiegel',
      homeAnchor: 'Smart-Spiegel mit Bluetooth-Audio, Display & Sensorik',
      relatedAnchor: 'Elektronik- & EMV-Auslegung smarter Bluetooth-Spiegel',
    },
    'irregular-shaped-mirror-manufacturer': {
      title: 'Formspiegel-Hersteller',
      blurb: '±1,0 mm CNC-Konturschnitt auf 5 mm EN 1036 Glas mit konturgefräster EPE-Schutzpolsterung.',
      footerAnchor: 'Organische & asymmetrische CNC-Formspiegel',
      homeAnchor: 'CNC-gefertigte Kiesel-, Bogen- & Designspiegel',
      relatedAnchor: 'Vektor-Konturschnitt & Verpackung unregelmäßiger Spiegel',
    },
    'led-mirror-wholesale-supplier': {
      title: 'LED-Spiegel-Großhändler',
      blurb: '4–8 SKUs je 20GP/40HQ-Container kombinieren, ab MOQ 50 Stk. in 25–35 Tagen versandbereit.',
      footerAnchor: 'Container-Großhandel für Fachhändler',
      homeAnchor: 'Mischcontainer-Programme (20GP/40HQ) für Großhändler',
      relatedAnchor: 'Sortimentsstaffelung & Containerladung im Spiegel-Großhandel',
    },
    'custom-mirror-manufacturer': {
      title: 'Maßspiegel-Hersteller',
      blurb: 'Von der CAD-Zeichnung zum Muster in 7–12 Tagen: 5 mm EN 1036 Glas, 6063-T5 Alu oder Holz.',
      footerAnchor: 'Sonderanfertigungen nach CAD-Zeichnung',
      homeAnchor: 'Maßgefertigte Spiegelkonstruktionen nach CAD-Vorgabe',
      relatedAnchor: 'CAD-Machbarkeitsprüfung, Rahmenprofile & Musterbau',
    },
    'custom-size-led-mirrors': {
      title: 'LED-Spiegel nach Maß',
      blurb: 'Sondermaße von 400–2000+ mm ohne Werkzeugkosten mit skalierter 24V-LED- & Treiberleistung.',
      footerAnchor: 'Millimetergenaue LED-Spiegel nach Maß',
      homeAnchor: 'Maßgeschnittene LED-Spiegel für Einzel- & Doppelwaschtische',
      relatedAnchor: 'Werkzeugfreie Maßskalierung & Lichtberechnung für LED-Spiegel',
    },
    'oem-odm-mirror-manufacturing': {
      title: 'OEM- und ODM-Spiegelfertigung',
      blurb: 'ISO-9001-Werk mit fester Stückliste (BOM), CE / UL 962 / SAA Unterlagen & 3 Jahren LED-Garantie.',
      footerAnchor: 'Private-Label OEM- & ODM-Fertigung',
      homeAnchor: 'Eigenmarken-Entwicklung & Serienfertigung (OEM/ODM)',
      relatedAnchor: 'Stücklistenkontrolle, Prüfberichte & Private-Label-Verpackung',
    },
    'hotel-bathroom-mirrors': {
      title: 'Hotel-Badspiegel',
      blurb: 'CRI ≥ 90–95 Hotellicht, Festanschluss nach CE/UL, Musterzimmer in 7–12 Tagen & Etagenetiketten.',
      footerAnchor: 'Hotel-FF&E & Musterzimmer-Projekte',
      homeAnchor: 'Objektspezifikationen für Hotelbäder und Gästezimmer',
      relatedAnchor: 'Musterzimmer-Freigabe & etagenweise Hotellieferung',
    },
    'commercial-bathroom-mirrors': {
      title: 'Gewerbe-Badspiegel',
      blurb: '5 mm EN 1036 Glas mit CAT-II-Splitterschutz für Wohnanlagen, Bürogebäude und Sanitärräume.',
      footerAnchor: 'Objektspiegel für Wohnbau & Gewerbe',
      homeAnchor: 'Serienspiegel für Mehrparteienhäuser & öffentliche Waschräume',
      relatedAnchor: 'Ausschreibungsspezifikationen für Objekt- und Gewerbespiegel',
    },
  },
  it: {
    'led-bathroom-mirror-manufacturer': {
      title: 'Produttore di specchi LED da bagno',
      blurb: 'Vetro 5 mm EN 1036 senza rame, CRI ≥ 90, CCT 2700K–6500K e grado IP44/IP54 OEM.',
      footerAnchor: 'Programmi OEM specchi LED lavabo',
      homeAnchor: 'Ingegneria di collezioni di specchi LED da bagno',
      relatedAnchor: 'Specifiche ottiche ed elettriche IP44 per specchi LED',
    },
    'led-mirror-cabinet-manufacturer': {
      title: 'Produttore di armadietti a specchio LED',
      blurb: ' Pensili IP44 in alluminio con cerniere soft-close 110°, LED CRI ≥ 90 e MOQ 30–50 pz.',
      footerAnchor: 'Armadietti bagno illuminati OEM',
      homeAnchor: 'Armadietti a specchio LED a parete e ad incasso',
      relatedAnchor: 'Struttura IP44 e imballo ISTA-3A per armadietti LED',
    },
    'full-length-mirror-manufacturer': {
      title: 'Produttore di specchi a figura intera',
      blurb: 'Formati 1500–1800+ mm a parete o da terra con pellicola antisfondamento CAT II e imballo ISTA-3A.',
      footerAnchor: 'Fornitura specchi figura intera e dressing',
      homeAnchor: 'Specchi a figura intera sicuri per hotel e retail',
      relatedAnchor: 'Specifiche costruttive specchi lunghi con film CAT II',
    },
    'anti-fog-led-mirror-manufacturer': {
      title: 'Produttore di specchi LED antiappannamento',
      blurb: 'Tappetino riscaldante PET 150–250 W/m² (3–5 min), IP44/IP54 e spegnimento auto 60 min.',
      footerAnchor: 'Specchi LED con antiappannamento termico',
      homeAnchor: 'Specchi bagno con demister riscaldante dimensionato',
      relatedAnchor: 'Potenza termica e copertura antiappannamento per modello',
    },
    'smart-bluetooth-mirror-manufacturer': {
      title: 'Produttore di specchi Bluetooth',
      blurb: 'Audio Bluetooth 5.0/5.3 stagno, orologio/temperatura, CRI ≥ 90 e conformità CE RED / FCC / UL.',
      footerAnchor: 'Specchi smart con audio Bluetooth',
      homeAnchor: 'Specchi connessi con speaker Bluetooth, display e sensori',
      relatedAnchor: 'Architettura elettronica e RF degli specchi Bluetooth',
    },
    'irregular-shaped-mirror-manufacturer': {
      title: 'Produttore di specchi sagomati',
      blurb: 'Taglio CNC ±1,0 mm su vetro 5 mm EN 1036 per forme organiche e sagomatura interna in EPE.',
      footerAnchor: 'Specchi organici e asimmetrici CNC',
      homeAnchor: 'Lavorazione CNC di specchi organici, a ciottolo e ad arco',
      relatedAnchor: 'Tolleranze CNC e protezione bordi per specchi irregolari',
    },
    'led-mirror-wholesale-supplier': {
      title: 'Fornitore wholesale di specchi LED',
      blurb: 'Combina 4–8 SKU per container 20GP/40HQ da MOQ 50 pz con consegna in 25–35 giorni.',
      footerAnchor: 'Fornitura wholesale a container misto',
      homeAnchor: 'Consolidamento container 20GP/40HQ per distributori',
      relatedAnchor: 'Assortimento distributori e carico misto in container',
    },
    'custom-mirror-manufacturer': {
      title: 'Produttore di specchi su misura',
      blurb: 'Dal disegno CAD al prototipo in 7–12 giorni: vetro EN 1036, telai alluminio 6063-T5 o legno.',
      footerAnchor: 'Specchi personalizzati su disegno CAD',
      homeAnchor: 'Realizzazione specchi su progetto CAD e finiture dedicate',
      relatedAnchor: 'Sviluppo da tavola CAD a campione fisico in 7–12 giorni',
    },
    'custom-size-led-mirrors': {
      title: 'Specchi LED su misura',
      blurb: 'Taglio su misura 400–2000+ mm senza costi stampo, con potenza LED 24V e driver 36W–96W dedicati.',
      footerAnchor: 'Specchi LED tagliati su misura',
      homeAnchor: 'Specchi LED su misura per lavabi singoli e doppi',
      relatedAnchor: 'Dimensionamento millimetrico e calcolo luminoso LED',
    },
    'oem-odm-mirror-manufacturing': {
      title: 'Produzione OEM e ODM di specchi',
      blurb: 'Impianto ISO 9001 con blocco distinta BOM, fascicoli CE / UL 962 / SAA e garanzia LED 3 anni.',
      footerAnchor: 'Produzione private label OEM & ODM',
      homeAnchor: 'Sviluppo industriale OEM e ODM per marchi bagno',
      relatedAnchor: 'Controllo BOM, certificazioni e packaging private label',
    },
    'hotel-bathroom-mirrors': {
      title: 'Specchi da bagno per hotel',
      blurb: 'Luce CRI ≥ 90–95, cablaggio a parete CE/UL, camera campione in 7–12 gg ed etichette per piano.',
      footerAnchor: 'Forniture contract & FF&E per hotel',
      homeAnchor: 'Capitolati FF&E per camere d’albergo e residence',
      relatedAnchor: 'Mock-up camera campione e consegne hotel per piano',
    },
    'commercial-bathroom-mirrors': {
      title: 'Specchi da bagno commerciali',
      blurb: 'Vetro 5 mm EN 1036 con pellicola antisfondamento CAT II per complessi residenziali e uffici.',
      footerAnchor: 'Specchi contract per edilizia e uffici',
      homeAnchor: 'Forniture specchi per complessi residenziali e bagni pubblici',
      relatedAnchor: 'Specifiche di sicurezza CAT II per progetti multiunità',
    },
  },
};

// Title overrides for irregular-shaped-mirror-manufacturer so NO locale falsely
// claims a blanket 3-year warranty on non-LED irregular mirrors, plus differentiated
// B2B titles where overlapping slugs previously looked synonymous.
const LOCALIZED_TITLE_OVERRIDES: Record<
  Exclude<SupportedLanguage, 'en'>,
  Record<string, { title: string; description?: string }>
> = {
  zh: {
    'irregular-shaped-mirror-manufacturer': {
      title: '异形镜制造商 | CNC 有机形与不对称定制镜工厂 | BOLEN',
      description:
        'BOLEN 异形镜制造工厂：±1.0mm CNC 裁切 5mm EN 1036 无铜银镜，支持鹅卵石/波浪/拱形设计、CRI ≥ 90 背光选项、模切 EPE 包装与 25–35 天交期。',
    },
    'led-mirror-wholesale-supplier': {
      title: 'LED 镜整柜混批供应商 | 20GP/40HQ 多型号批发 | BOLEN',
    },
  },
  es: {
    'irregular-shaped-mirror-manufacturer': {
      title: 'Fabricante de espejos irregulares | Corte CNC orgánico OEM | BOLEN',
      description:
        'Fabricante de espejos irregulares, orgánicos y asimétricos en vidrio 5 mm EN 1036 (±1,0 mm CNC), con LED CRI ≥ 90 opcional, espuma EPE troquelada y entrega en 25–35 días.',
    },
    'led-mirror-wholesale-supplier': {
      title: 'Proveedor mayorista de espejos LED | Contenedor mixto 20GP/40HQ | BOLEN',
    },
  },
  fr: {
    'irregular-shaped-mirror-manufacturer': {
      title: 'Fabricant de miroirs irréguliers et organiques sur mesure | BOLEN',
      description:
        'Fabricant de miroirs irréguliers, galets et asymétriques en verre 5 mm EN 1036 (CNC ±1,0 mm), LED CRI ≥ 90 en option, mousse EPE découpée et livraison en 25–35 jours.',
    },
    'led-mirror-wholesale-supplier': {
      title: 'Grossiste miroirs LED | Conteneurs panachés 20GP/40HQ | BOLEN',
    },
  },
  de: {
    'irregular-shaped-mirror-manufacturer': {
      title: 'Formspiegel-Hersteller | Organische & asymmetrische CNC-Spiegel | BOLEN',
      description:
        'Hersteller für organische, asymmetrische und ovale Formspiegel aus 5 mm EN 1036 Glas (±1,0 mm CNC), optional mit CRI ≥ 90 LED, EPE-Konturschutz und 25–35 Tagen Lieferzeit.',
    },
    'led-mirror-wholesale-supplier': {
      title: 'LED-Spiegel-Großhandel | 20GP/40HQ Mischcontainer ab Werk | BOLEN',
    },
  },
  it: {
    'irregular-shaped-mirror-manufacturer': {
      title: 'Produttore di specchi irregolari e organici su misura | BOLEN',
      description:
        'Produttore di specchi irregolari, a ciottolo e asimmetrici in vetro 5 mm EN 1036 (CNC ±1,0 mm), LED CRI ≥ 90 opzionale, EPE sagomato e consegna in 25–35 giorni.',
    },
    'led-mirror-wholesale-supplier': {
      title: 'Fornitore wholesale specchi LED | Container misti 20GP/40HQ | BOLEN',
    },
  },
};

// Concrete, verifiable B2B engineering parameters injected into all 12 slugs across
// zh, es, fr, de, it so every localized /solutions/* page carries real technical
// numbers (5mm EN 1036, CRI ≥ 90, 2700K–6500K, IP44/IP54, UL 962 / CE EN 60598 /
// SAA / RoHS, MOQ 50–100 / 30–50 pcs, 25–35 days, ISTA-3A, 3-yr / 2-yr warranty).
function buildLocalizedTechSpecSection(slug: string, lang: Exclude<SupportedLanguage, 'en'>): {
  proofPoints: Array<{ value: string; label: string }>;
  section: SeoLandingSection;
} {
  const isCabinet = slug === 'led-mirror-cabinet-manufacturer';
  const isWholesale = slug === 'led-mirror-wholesale-supplier';
  const isFullLength = slug === 'full-length-mirror-manufacturer';
  const isAntiFog = slug === 'anti-fog-led-mirror-manufacturer';
  const isBluetooth = slug === 'smart-bluetooth-mirror-manufacturer';
  const isCustomSize = slug === 'custom-size-led-mirrors';
  const moqValue = isCabinet ? 'MOQ 30–50' : isWholesale || isFullLength ? 'MOQ 50' : 'MOQ 50–100';

  if (lang === 'zh') {
    return {
      proofPoints: [
        { value: isCustomSize ? '400–2000+ mm' : isFullLength ? '1500–1800+ mm' : '5mm EN 1036', label: '无铜环保银镜原片（>720h 耐盐雾测试，CNC ±1.0mm）' },
        { value: isAntiFog ? '150–250 W/m²' : isBluetooth ? 'BT 5.0/5.3 · IP44' : 'CRI ≥ 90 · IP44/54', label: '2700K–6500K 无极色温调光与密封防水驱动' },
        { value: `${moqValue} 件`, label: isWholesale ? '支持 20GP/40HQ 混装 4–8 款型号' : '7–12 天工程打样（嘉兴 46,800 m² 工厂）' },
        { value: '25–35 天交期', label: 'ISTA-3A 跌落测试包装 · 3年电子/2年结构质保' },
      ],
      section: {
        heading: '核心工程技术参数与出口交付基准',
        paragraphs: [
          isWholesale
            ? '针对渠道批发与整柜集采，BOLEN 支持在 20GP（约 350–550 件）或 40HQ（约 850–1,300 件）集装箱内混装 4–8 款畅销型号，单款起订量低至 50 件，统一采用 5mm EN 1036 无铜银镜与同系列认证电源，大幅降低经销商备件库存压力。'
            : isCabinet
              ? 'BOLEN 镜柜采用阳极氧化铝或 E1 防潮柜体，搭配双面 5mm EN 1036 无铜银镜门板、6–8mm 钢化玻璃活动层板及 30,000 次寿命测试的 110° 不锈钢缓冲铰链，单款起订量 30–50 件，打样周期 10–14 天。'
              : '嘉兴 46,800 m² 生产基地（2005 年创立，6 条自营产线，200+ 技术人员）采用 5mm EN 1036 无铜环保银镜（含铜量 <0.1%，通过 >720 小时盐雾测试）、高密度 2835 灯带（CRI ≥ 90，可选 CRI ≥ 95，2700K–6500K 无极调光）及 IP44/IP54 密封恒压驱动，出厂前执行 100% 高压耐压测试与 2 小时满载老化检验。',
        ],
        bullets: [
          '镜片与安全背膜：5mm（柜门/轻量化可选 4mm）EN 1036 无铜银镜，工程及全身镜标配 CAT II 防爆背膜',
          '光学与除雾性能：CRI ≥ 90、2700K–6500K 调光调色、PET 电热防雾膜（150–250 W/m²，3–5 分钟升温除雾）',
          '目的国电气合规：按型号配置 UL 962 / ETL（110–120V）或 CE EN 60598 / CB / UKCA / SAA / RoHS（220–240V）方案',
          `起订量与交期：常规 ${moqValue} 件/规格，工程打样 7–12 天，大货量产 25–35 天（距上海/宁波港约 60–120 km）`,
          '包装与统一质保：ISTA-3A 标准 5 层瓦楞纸箱 + 25–35mm 高密 EPE/EPS 护角；LED 及电气元件 3 年质保，非 LED 镜体及边框 2 年质保',
        ],
      },
    };
  }

  if (lang === 'es') {
    return {
      proofPoints: [
        { value: isCustomSize ? '400–2000+ mm' : isFullLength ? '1500–1800+ mm' : '5 mm EN 1036', label: 'Vidrio plata sin cobre (>720 h niebla salina, CNC ±1,0 mm)' },
        { value: isAntiFog ? '150–250 W/m²' : isBluetooth ? 'BT 5.0/5.3 · IP44' : 'CRI ≥ 90 · IP44/54', label: 'CCT continuo 2700K–6500K y drivers estancos' },
        { value: `${moqValue} uds.`, label: isWholesale ? 'Contenedor 20GP/40HQ con 4–8 SKUs mixtos' : 'Muestras en 7–12 días (planta de 46.800 m²)' },
        { value: '25–35 días', label: 'Embalaje ISTA-3A · Garantía 3 años LED / 2 años estructura' },
      ],
      section: {
        heading: 'Parámetros técnicos B2B, certificaciones y plazos de suministro',
        paragraphs: [
          isWholesale
            ? 'Para distribuidores e importadores, BOLEN consolida entre 4 y 8 referencias por contenedor 20GP (~350–550 uds.) o 40HQ (~850–1.300 uds.) desde MOQ 50 uds. por modelo, unificando vidrio de 5 mm EN 1036 y familias de drivers certificados.'
            : 'Desde nuestro complejo ISO 9001 de 46.800 m² en Jiaxing (fundado en 2005, 6 líneas y 200+ especialistas), fabricamos con vidrio sin cobre de 5 mm EN 1036, tiras SMD 2835 de CRI ≥ 90 (2700K–6500K, vida útil >50.000 h), protección IP44/IP54 y ensayo 100 % hi-pot + 2 horas de envejecimiento antes de embalar.',
        ],
        bullets: [
          'Vidrio y estructura: espejo sin cobre de 5 mm EN 1036 (±1,0 mm CNC), film antiexplosión CAT II y aluminio anodizado 6063-T5',
          'Óptica y antivaho: CRI ≥ 90 (opción CRI ≥ 95), regulación 10 %–100 % (2700K–6500K) y lámina PET de 150–250 W/m² (3–5 min)',
          'Normativa eléctrica: configuraciones 110–120V (UL 962 / ETL / FCC) y 220–240V (CE EN 60598, CB, UKCA, SAA, RoHS)',
          `MOQ y plazos: ${moqValue} uds. por referencia, prototipos en 7–12 días y producción en serie en 25–35 días`,
          'Embalaje y garantía: cajas de 5 capas probadas según ISTA-3A (espuma EPE/EPS 25–35 mm); 3 años en LED/electrónica y 2 años en espejo/marco sin LED',
        ],
      },
    };
  }

  if (lang === 'fr') {
    return {
      proofPoints: [
        { value: isCustomSize ? '400–2000+ mm' : isFullLength ? '1500–1800+ mm' : '5 mm EN 1036', label: 'Miroir argent sans cuivre (>720 h brouillard salin, CNC ±1,0 mm)' },
        { value: isAntiFog ? '150–250 W/m²' : isBluetooth ? 'BT 5.0/5.3 · IP44' : 'CRI ≥ 90 · IP44/54', label: 'Variation 2700K–6500K & alimentation étanche' },
        { value: `${moqValue} pcs`, label: isWholesale ? 'Panachage 4–8 SKUs en conteneur 20GP/40HQ' : 'Prototypes en 7–12 jours (usine de 46 800 m²)' },
        { value: '25–35 jours', label: 'Cartons ISTA-3A · Garantie 3 ans LED / 2 ans structure' },
      ],
      section: {
        heading: 'Spécifications techniques B2B, conformité et délais industriels',
        paragraphs: [
          isWholesale
            ? 'Pour les grossistes et centrales d’achat, BOLEN permet de panacher 4 à 8 références par conteneur 20GP (~350–550 pcs) ou 40HQ (~850–1 300 pcs) dès MOQ 50 pcs par modèle, sur une base commune verre 5 mm EN 1036 et composants certifiés.'
            : 'Produits au sein de notre site ISO 9001 de 46 800 m² à Jiaxing (créé en 2005, 6 lignes, 200+ spécialistes), nos miroirs associent verre sans cuivre 5 mm EN 1036, rubans LED SMD 2835 CRI ≥ 90 (2700K–6500K, >50 000 h), boîtiers IP44/IP54 et contrôle unitaire diélectrique + 2 h de vieillissement.',
        ],
        bullets: [
          'Verre & châssis : miroir sans cuivre 5 mm EN 1036 (tolérance CNC ±1,0 mm), film sécurité CAT II et cadres aluminium 6063-T5',
          'Éclairage & antibuée : CRI ≥ 90 (option ≥ 95), variation continue 2700K–6500K et film PET 150–250 W/m² (clair en 3–5 min)',
          'Conformité électrique : 220–240V (CE EN 60598, CB, UKCA, SAA, RoHS) ou 110–120V (UL 962 / ETL / FCC) selon marché',
          `MOQ & délais : ${moqValue} pcs par dimension, échantillon en 7–12 jours et série en 25–35 jours après validation`,
          'Emballage & garantie : cartons export 5 cannelures certifiés ISTA-3A (mousse EPE 25–35 mm) ; garantie 3 ans LED/électronique, 2 ans structure non LED',
        ],
      },
    };
  }

  if (lang === 'de') {
    return {
      proofPoints: [
        { value: isCustomSize ? '400–2000+ mm' : isFullLength ? '1500–1800+ mm' : '5 mm EN 1036', label: 'Kupferfreies Kristallspiegelglas (>720 Std. Salzsprühtest, ±1,0 mm)' },
        { value: isAntiFog ? '150–250 W/m²' : isBluetooth ? 'BT 5.0/5.3 · IP44' : 'CRI ≥ 90 · IP44/54', label: 'Stufenlos 2700K–6500K & gekapselte Bad-Treiber' },
        { value: `${moqValue} Stk.`, label: isWholesale ? '4–8 SKUs im 20GP/40HQ-Container mischen' : 'Musterbau in 7–12 Tagen (46.800 m² Werk)' },
        { value: '25–35 Tage', label: 'ISTA-3A-Exportkarton · 3 J. Elektronik- / 2 J. Strukturgarantie' },
      ],
      section: {
        heading: 'Technische B2B-Kerndaten, Prüfnormen und Lieferzeiten',
        paragraphs: [
          isWholesale
            ? 'Für Fachgroßhändler und Importeure bündelt BOLEN 4 bis 8 Artikelnummern pro 20GP- (~350–550 Stk.) oder 40HQ-Container (~850–1.300 Stk.) ab MOQ 50 Stk. je Modell – mit einheitlichem 5 mm EN 1036 Glas und abgestimmten Treiberplattformen.'
            : 'In unserem 46.800 m² großen ISO-9001-Werk in Jiaxing (gegründet 2005, 6 Fertigungslinien, 200+ Fachkräfte) verarbeiten wir 5 mm kupferfreies Spiegelglas nach EN 1036, CRI ≥ 90 SMD-2835-LEDs (2700K–6500K, >50.000 Std.), IP44/IP54-Treibergehäuse sowie 100 % Hochspannungs- und 2-Stunden-Dauerlauftests.',
        ],
        bullets: [
          'Spiegelglas & Rahmen: 5 mm EN 1036 kupferfreies Silberglas (CNC ±1,0 mm), CAT-II-Splitterschutzfolie & 6063-T5 Aluminiumprofile',
          'Licht & Antibeschlag: CRI ≥ 90 (optional ≥ 95), 2700K–6500K Dimmung sowie 150–250 W/m² PET-Heizmatte (3–5 Min. Aufheizzeit)',
          'Zertifizierungsoptionen: 220–240V (CE EN 60598, CB, UKCA, SAA, RoHS) und 110–120V (UL 962 / ETL / FCC) je Modell',
          `MOQ & Vorlaufzeit: ${moqValue} Stk. pro Ausführung, Freigabemuster in 7–12 Tagen, Serienproduktion in 25–35 Tagen`,
          'Verpackung & Garantie: ISTA-3A-fallgeprüfte 5-lagige Kartons (25–35 mm EPE-Polster); 3 Jahre Garantie auf LED/Elektronik, 2 Jahre auf Spiegel/Rahmen',
        ],
      },
    };
  }

  return {
    proofPoints: [
      { value: isCustomSize ? '400–2000+ mm' : isFullLength ? '1500–1800+ mm' : '5 mm EN 1036', label: 'Vetro specchio senza rame (>720 h nebbia salina, CNC ±1,0 mm)' },
      { value: isAntiFog ? '150–250 W/m²' : isBluetooth ? 'BT 5.0/5.3 · IP44' : 'CRI ≥ 90 · IP44/54', label: 'CCT continuo 2700K–6500K e driver stagni' },
      { value: `${moqValue} pz`, label: isWholesale ? '4–8 SKU misti per container 20GP/40HQ' : 'Campioni in 7–12 giorni (stabilimento da 46.800 m²)' },
      { value: '25–35 giorni', label: 'Imballo ISTA-3A · Garanzia 3 anni LED / 2 anni struttura' },
    ],
    section: {
      heading: 'Specifiche tecniche B2B, conformità normativa e tempi di produzione',
      paragraphs: [
        isWholesale
          ? 'Per distributori e importatori, BOLEN consente di combinare 4–8 modelli per container 20GP (~350–550 pz) o 40HQ (~850–1.300 pz) da MOQ 50 pz per codice, standardizzando vetro 5 mm EN 1036 e componentistica certificata.'
          : 'Nel nostro polo produttivo ISO 9001 da 46.800 m² a Jiaxing (attivo dal 2005, 6 linee e oltre 200 addetti) utilizziamo vetro argentato senza rame 5 mm EN 1036, strisce LED SMD 2835 CRI ≥ 90 (2700K–6500K, durata >50.000 ore), involucri IP44/IP54 e collaudo 100 % hi-pot + 2 ore di burn-in.',
      ],
      bullets: [
        'Vetro e telai: specchio senza rame 5 mm EN 1036 (tolleranza CNC ±1,0 mm), film antisfondamento CAT II e alluminio anodizzato 6063-T5',
        'Ottica e demister: CRI ≥ 90 (opzione ≥ 95), dimmerazione 2700K–6500K e tappetino PET 150–250 W/m² (attivo in 3–5 min)',
        'Conformità mercati: 220–240V (CE EN 60598, CB, UKCA, SAA, RoHS) o 110–120V (UL 962 / ETL / FCC) verificata per modello',
        `MOQ e consegne: ${moqValue} pz per misura, campionatura in 7–12 giorni e produzione di serie in 25–35 giorni`,
        'Imballaggio e garanzia: cartoni export a 5 onde testati ISTA-3A (EPE 25–35 mm); garanzia 3 anni su LED/elettronica e 2 anni su specchio/telaio non LED',
      ],
    },
  };
}

function extractProductModelCode(product: SeoLandingProductInput): string {
  const raw = (product.description || '').trim();
  const firstLine = raw.split(/\r?\n/)[0]?.trim() || '';
  const cleaned = firstLine.replace(/^model\s*no\.?\s*[:：]\s*/i, '').trim();
  if (
    cleaned &&
    cleaned.length <= 28 &&
    !/\b(this|modern|benefit|premium|best\s+selling|hot\s+sell|smart\s+bathroom)\b/i.test(cleaned)
  ) {
    const token = cleaned.match(/[a-z0-9][a-z0-9._/\- ]*\d[a-z0-9._/\- ]*/i)?.[0]?.trim();
    if (token && token.length <= 24) return token;
  }
  const embedded = raw.match(/\b(?:CTL|CTF|G|S|T)\d{2,5}[A-Z0-9\-]*\b/i)?.[0];
  if (embedded) return embedded.toUpperCase();
  if (product.id) return `BL-${product.id.slice(0, 4).toUpperCase()}`;
  return '';
}

function buildChineseModelSpecificCardCopy(
  product: SeoLandingProductInput,
  model: string
): { title: string; summary: string } {
  const src = `${product.title} ${product.category || ''} ${product.description || ''}`.toLowerCase();

  const shape = /\bpebble\b/.test(src)
    ? '鹅卵石异形'
    : /\b(half[ -]?round|half[ -]?moon)\b/.test(src)
      ? '半圆形'
      : /\b(capsule|pill)\b/.test(src)
        ? '胶囊形'
        : /\b(arch|arched)\b/.test(src)
          ? '拱形'
          : /\b(diamond|geometric)\b/.test(src)
            ? '几何多边形'
            : /\b(oval)\b/.test(src)
              ? '椭圆形'
              : /\b(round|circular)\b/.test(src)
                ? '圆形'
                : /\b(irregular|organic|asymmetr|wavy)\b/.test(src)
                  ? '有机不规则形'
                  : '矩形';

  const frame = /\b(black\s+alumin|black\s+metal|black\s+frame)\b/.test(src)
    ? '哑光黑铝框'
    : /\b(white\s+alumin|white\s+frame)\b/.test(src)
      ? '雅白铝框'
      : /\b(gold|brass)\b/.test(src)
        ? '拉丝金边框'
        : /\b(wood|wooden)\b/.test(src)
          ? '实木/木纹框'
          : /\b(alumin|metal\s+frame|framed)\b/.test(src)
            ? '铝合金边框'
            : /\b(frosted[ -]?edge|satin\s+edge)\b/.test(src)
              ? '磨砂内透光无框'
              : /\bbeveled\b/.test(src)
                ? '斜边抛光无框'
                : '无框极简';

  const isCabinet = /\b(mirror\s+cabinet|medicine|cabinet)\b/.test(src);
  const isFullLength = /\b(full[ -]?length|dressing|freestanding|floor)\b/.test(src);
  const isNonLed = /\b(without\s+led|non-led|retractable)\b/.test(src) || (!/\b(led|lighted|illuminated|backlit|front-lit)\b/.test(src) && !isCabinet);

  const productNoun = isCabinet
    ? 'LED储物镜柜'
    : isFullLength
      ? isNonLed
        ? '防爆全身穿衣镜'
        : 'LED全身穿衣镜'
      : isNonLed
        ? /\bretractable|swivel\b/.test(src)
          ? '360°伸缩折叠化妆镜'
          : '浴室挂墙化妆镜'
        : /\bbacklit|back\s+lit|halo\b/.test(src)
          ? '背光LED浴室镜'
          : /\bfront[ -]?lit\b/.test(src)
            ? '正发光LED浴室镜'
            : '智能LED浴室镜';

  const features: string[] = [];
  if (/\b(5mm|copper[ -]?free)\b/.test(src)) features.push('5mm EN 1036无铜银镜');
  if (/\b(3-color|3\s+color|3\s+tone|3000–6000k|stepless|dimmable|dimming)\b/.test(src)) {
    features.push('2700K–6500K色温无极调光');
  }
  if (/\b(anti[ -]?fog|defog|demister|heating)\b/.test(src)) features.push('一键PET电热防雾');
  if (/\b(bluetooth|speaker)\b/.test(src)) features.push('蓝牙立体声音响');
  if (/\b(time|clock|temperature)\b/.test(src)) features.push('时间/温度数显');
  if (/\b(motion\s+sensor)\b/.test(src)) features.push('人体感应开关');
  else if (/\b(touch)\b/.test(src)) features.push('灵敏触控开关');
  if (/\b(hidden\s+storage|storage|medicine|cabinet)\b/.test(src)) features.push('分区防潮收纳层板');
  if (/\b(explosion[ -]?proof|anti[ -]?explosion|safety)\b/.test(src)) features.push('CAT II防爆安全背膜');

  const mount = /\b(freestanding|with\s+stand)\b/.test(src)
    ? '支持落地支架与壁挂两用安装'
    : /\b(hotel|hospitality|salon)\b/.test(src)
      ? '适配酒店客房及商业卫浴壁挂安装'
      : /\b(apartment|villa)\b/.test(src)
        ? '适配公寓与住宅精装工程壁挂安装'
        : '采用稳固横竖壁挂安装结构';

  const cert = /\bip54\b/.test(src)
    ? 'IP54防潮密封与CE/RoHS标准'
    : /\b(ip44|ce|rohs)\b/.test(src)
      ? 'IP44防潮等级与CE/UL/SAA出口标准'
      : '出口级电气与镜面品控标准';

  const featureText =
    features.length > 0
      ? `集成${features.slice(0, 3).join('、')}`
      : isNonLed
        ? '采用高清无铜银镜片与耐腐蚀边角精磨工艺'
        : '集成高显指CRI≥90柔和灯带与防潮驱动系统';

  const titleCore = /\bretractable|swivel\b/.test(src)
    ? `壁挂式${productNoun}`
    : `${frame}${shape}${productNoun}`;

  const suffix = model ? ` · ${model}` : '';
  const summary = `${model ? `型号 ${model} ` : '该款'}${frame}${shape}设计，${featureText}，${mount}；符合${cert}，支持按项目定制尺寸与包装（常规 MOQ 50–100 件，交期 25–35 天）。`;

  return {
    title: `${titleCore}${suffix}`,
    summary,
  };
}

const PRODUCT_CARD_LABELS: Record<
  Exclude<SupportedLanguage, 'zh'>,
  Record<'led' | 'cabinet' | 'fullLength' | 'frameless' | 'shape' | 'standard', string>
> = {
  en: {
    led: 'Custom LED bathroom mirror',
    cabinet: 'Custom LED mirror cabinet',
    fullLength: 'Custom full-length mirror',
    frameless: 'Custom frameless bathroom mirror',
    shape: 'Custom-shape bathroom mirror',
    standard: 'Custom bathroom mirror',
  },
  es: {
    led: 'Espejo LED de baño OEM',
    cabinet: 'Armario con espejo LED IP44',
    fullLength: 'Espejo de cuerpo entero CAT II',
    frameless: 'Espejo de baño sin marco EN 1036',
    shape: 'Espejo orgánico CNC a medida',
    standard: 'Espejo de baño profesional',
  },
  fr: {
    led: 'Miroir LED sanitaire OEM',
    cabinet: 'Armoire de toilette LED IP44',
    fullLength: 'Miroir en pied sécurité CAT II',
    frameless: 'Miroir sans cadre 5 mm EN 1036',
    shape: 'Miroir organique CNC sur mesure',
    standard: 'Miroir de salle de bains B2B',
  },
  de: {
    led: 'LED-Badspiegel OEM',
    cabinet: 'IP44 LED-Spiegelschrank',
    fullLength: 'Ganzkörperspiegel mit CAT-II-Schutz',
    frameless: 'Rahmenloser 5 mm EN 1036 Badspiegel',
    shape: 'Organischer CNC-Formspiegel',
    standard: 'Objekt-Badspiegel nach Maß',
  },
  it: {
    led: 'Specchio LED da bagno OEM',
    cabinet: 'Armadietto a specchio LED IP44',
    fullLength: 'Specchio figura intera CAT II',
    frameless: 'Specchio senza cornice 5 mm EN 1036',
    shape: 'Specchio organico CNC su misura',
    standard: 'Specchio da bagno contract',
  },
};

export function getSeoLandingProductCardCopy(
  product: SeoLandingProductInput,
  lang: SupportedLanguage
): { title: string; summary: string } {
  const model = extractProductModelCode(product);
  if (lang === 'zh') {
    return buildChineseModelSpecificCardCopy(product, model);
  }

  const searchable = `${product.title} ${product.category || ''}`.toLowerCase();
  const kind = /cabinet|medicine/.test(searchable)
    ? 'cabinet'
    : /full[ -]?length|dressing|floor/.test(searchable)
      ? 'fullLength'
      : /frameless|without led|non-led|non led/.test(searchable)
        ? 'frameless'
        : /irregular|organic|asymmetr|shape|pebble|arch/.test(searchable)
          ? 'shape'
          : /led|lighted|illuminated|backlit/.test(searchable)
            ? 'led'
            : 'standard';

  const labels = PRODUCT_CARD_LABELS[lang] || PRODUCT_CARD_LABELS.en;
  const tag = model ? ` · ${model}` : '';
  const summaryByLang: Record<Exclude<SupportedLanguage, 'zh'>, string> = {
    en: `${model ? `Model ${model}: ` : ''}5mm EN 1036 silver glass, customizable dimensions, CRI ≥ 90 lighting/functions, and ISTA-3A export cartons (MOQ 50–100 pcs, 25–35 day lead time).`,
    es: `${model ? `Modelo ${model}: ` : ''}vidrio 5 mm EN 1036, medidas y funciones LED CRI ≥ 90 personalizables con embalaje ISTA-3A (MOQ 50–100 uds., entrega en 25–35 días).`,
    fr: `${model ? `Modèle ${model} : ` : ''}verre 5 mm EN 1036, dimensions et options LED CRI ≥ 90 configurables avec cartons ISTA-3A (MOQ 50–100 pcs, délai 25–35 jours).`,
    de: `${model ? `Modell ${model}: ` : ''}5 mm EN 1036 Spiegelglas, Maße und CRI ≥ 90 LED-Funktionen konfigurierbar im ISTA-3A-Exportkarton (MOQ 50–100 Stk., 25–35 Tage).`,
    it: `${model ? `Modello ${model}: ` : ''}vetro 5 mm EN 1036, misure e funzioni LED CRI ≥ 90 personalizzabili con imballo ISTA-3A (MOQ 50–100 pz, consegna 25–35 giorni).`,
  };

  return {
    title: `${labels[kind]}${tag}`,
    summary: summaryByLang[lang] || summaryByLang.en,
  };
}

export function getSeoSolutionsUi(lang: SupportedLanguage): SeoSolutionsUi {
  return UI[lang] || UI.en;
}

export function localizeSeoLandingPage(page: SeoLandingPage, lang: SupportedLanguage): SeoLandingPage {
  const card = SOLUTION_CARDS[lang]?.[page.slug] || SOLUTION_CARDS.en[page.slug];

  if (lang === 'en') {
    return {
      ...page,
      shortTitle: card?.title || page.shortTitle || page.h1,
      blurb: card?.blurb || page.blurb || page.description,
      footerAnchor: card?.footerAnchor || card?.title || page.h1,
      homeAnchor: card?.homeAnchor || card?.title || page.h1,
      relatedAnchor: card?.relatedAnchor || card?.title || page.h1,
    };
  }

  const translated = BASE_PAGE_TRANSLATIONS[lang]?.[page.slug];
  const titleOverride = LOCALIZED_TITLE_OVERRIDES[lang]?.[page.slug];
  const tech = buildLocalizedTechSpecSection(page.slug, lang);
  const baseSections = translated?.sections || page.sections;

  return {
    ...page,
    ...(translated || {}),
    ...(titleOverride?.title ? { title: titleOverride.title } : {}),
    ...(titleOverride?.description ? { description: titleOverride.description } : {}),
    proofPoints: tech.proofPoints,
    sections: [...baseSections.slice(0, 2), tech.section, ...baseSections.slice(2)],
    shortTitle: card?.title || page.shortTitle || page.h1,
    blurb: card?.blurb || page.blurb || page.description,
    footerAnchor: card?.footerAnchor || card?.title || page.h1,
    homeAnchor: card?.homeAnchor || card?.title || page.h1,
    relatedAnchor: card?.relatedAnchor || card?.title || page.h1,
  };
}

export function getLocalizedSeoLandingPages(lang: SupportedLanguage): SeoLandingPage[] {
  return SEO_LANDING_PAGES.map((page) => localizeSeoLandingPage(page, lang));
}
