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
  breadcrumbLabel: string;
  proofPointsLabel: string;
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
      { title: 'Get a factory quote', copy: '7–12 day sample, trial from 10 pcs stocked (50–100 pcs OEM), 25–35 day lead time and ISTA-3A packing.' },
    ],
    strengths: [
      { title: 'Integrated 46,800 m² plant', copy: '5mm EN 1036 glass cutting, 6063-T5 frames, CRI ≥ 90 LED assembly, hi-pot testing and ISTA-3A export packing under ISO 9001.' },
      { title: 'Specification-led quoting', copy: 'Pricing and MOQ (10 pcs stocked trials; 50–100 pcs custom OEM) are confirmed against dimensions, IP44/IP54 electronics, packaging and destination compliance.' },
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
    breadcrumbLabel: 'Breadcrumb',
    proofPointsLabel: 'BOLEN manufacturing proof points',
  },
  zh: {
    navLabel: '采购方案', footerLabel: '制造解决方案', homeEyebrow: '买家采购路径', homeHeading: '找到适合您的镜子制造方案',
    homeIntro: '了解 5mm EN 1036 无铜银镜、CRI ≥ 90 LED 浴室镜、CAD 定制镜、酒店与商业工程、镜柜及 OEM/ODM 自有品牌生产规格。', homeExplore: '查看技术规格',
    hubTitle: '镜子制造解决方案 | OEM/ODM、整柜批发与工程供货 | BOLEN', hubDescription: '了解 BOLEN 面向 LED 浴室镜、定制镜、酒店和商业项目、镜柜及 OEM/ODM 项目的工程制造解决方案（常规现货 10 件起试单，定制 OEM 50–100 件起，交期 25–35 天）。',
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
      { title: '收报价', copy: '7–12 天打样、现有款 10 件起试单（定制 OEM 50–100 件起）、25–35 天交期与 ISTA-3A 包装。' },
    ],
    strengths: [
      { title: '46,800 m² 一体化工厂', copy: '5mm EN 1036 无铜银镜裁切、6063-T5 铝框、CRI ≥ 90 灯带组装、耐压老化测试和 ISTA-3A 包装同厂完成。' },
      { title: '按规格透明报价', copy: '单价和起订量（现有目录款 10 件起试单，定制 OEM 50–100 件起）根据尺寸、IP44/IP54 电气配置、包装及目的市场认证核算。' },
      { title: '分项质保与认证核查', copy: '按型号匹配 UL 962、CE EN 60598、SAA、RoHS 认证方案，享 3 年电子元件 / 2 年镜体结构质保。' },
    ],
    home: '首页', solutions: '采购方案', requestQuote: '申请工厂报价', viewCatalog: '查看产品目录', relevantProducts: '相关产品',
    modelsHeading: '参考型号', viewAllProducts: '查看全部产品', buyerQuestions: '买家常见问题', faqHeading: '常见问题',
    relatedSolutions: '相关制造方案', quoteEyebrow: '按规格报价', quoteHeading: '请发送您需要的尺寸、数量和功能。', startRfq: '开始询价',
    breadcrumbLabel: '面包屑导航', proofPointsLabel: 'BOLEN 制造实力核心指标',
  },
  es: {
    navLabel: 'Soluciones', footerLabel: 'Soluciones de fabricación', homeEyebrow: 'Rutas de compra B2B', homeHeading: 'Encuentre la solución de fabricación de espejos adecuada',
    homeIntro: 'Consulte especificaciones técnicas para espejos LED de 5 mm EN 1036, programas CAD a medida, hostelería, proyectos comerciales, armarios LED y producción OEM/ODM.', homeExplore: 'Ver ficha técnica',
    hubTitle: 'Soluciones de fabricación de espejos | OEM, Mayorista y Proyectos | BOLEN', hubDescription: 'Explore soluciones industriales BOLEN para espejos LED EN 1036, espejos a medida, hoteles, proyectos comerciales, armarios y programas OEM/ODM (pruebas desde 10 uds., OEM 50–100 uds.).',
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
      { title: 'Revise la cotización de fábrica', copy: 'Muestras en 7–12 días, pruebas desde 10 uds. en catálogo (50–100 uds. OEM), producción en 25–35 días y embalaje ISTA-3A.' },
    ],
    strengths: [
      { title: 'Planta integrada de 46.800 m²', copy: 'Vidrio sin cobre de 5 mm EN 1036, marcos 6063-T5, LED CRI ≥ 90, ensayos eléctricos y embalaje ISTA-3A bajo ISO 9001.' },
      { title: 'Cotización según especificaciones', copy: 'Precio y MOQ (desde 10 uds. en modelos estándar; 50–100 uds. OEM a medida) confirmados según medidas, IP44/IP54 y mercado.' },
      { title: 'Cumplimiento y garantía clara', copy: 'Componentes UL 962, CE EN 60598, SAA y RoHS por modelo, con garantía eléctrica de 3 años y estructural de 2 años.' },
    ],
    home: 'Inicio', solutions: 'Soluciones', requestQuote: 'Solicitar cotización de fábrica', viewCatalog: 'Ver catálogo de productos', relevantProducts: 'Productos relacionados',
    modelsHeading: 'Modelos para iniciar su especificación', viewAllProducts: 'Ver todos los productos', buyerQuestions: 'Preguntas de compradores', faqHeading: 'Preguntas frecuentes',
    relatedSolutions: 'Soluciones de fabricación relacionadas', quoteEyebrow: 'Cotización por especificación', quoteHeading: 'Envíenos dimensiones, cantidad y funciones necesarias.', startRfq: 'Iniciar solicitud',
    breadcrumbLabel: 'Ruta de navegación', proofPointsLabel: 'Indicadores de fabricación BOLEN',
  },
  fr: {
    navLabel: 'Solutions', footerLabel: 'Solutions de fabrication', homeEyebrow: 'Parcours d’achat B2B', homeHeading: 'Trouvez la bonne solution de fabrication de miroirs',
    homeIntro: 'Consultez nos spécifications techniques (verre 5 mm EN 1036, CRI ≥ 90, IP44/IP54) pour miroirs LED, sur-mesure CAD, hôtellerie, tertiaire, armoires LED et OEM/ODM.', homeExplore: 'Voir le cahier technique',
    hubTitle: 'Solutions de fabrication de miroirs | OEM, Gros & Projets | BOLEN', hubDescription: 'Découvrez les solutions industrielles BOLEN : miroirs LED 5 mm EN 1036, miroirs sur mesure, hôtels, tertiaire, armoires LED et OEM/ODM (essais dès 10 pcs, OEM 50–100 pcs).',
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
      { title: 'Examinez le devis usine', copy: 'Prototype en 7–12 jours, essais dès 10 pcs catalogue (50–100 pcs OEM), série en 25–35 jours et cartons ISTA-3A.' },
    ],
    strengths: [
      { title: 'Usine intégrée de 46 800 m²', copy: 'Découpe verre 5 mm EN 1036, cadres alu 6063-T5, LED CRI ≥ 90, tests diélectriques et emballage ISTA-3A.' },
      { title: 'Devis selon cahier des charges', copy: 'Prix et MOQ (dès 10 pcs sur modèles catalogue ; 50–100 pcs en OEM sur mesure) confirmés selon dimensions, IP44/IP54 et destination.' },
      { title: 'Conformité et garantie unifiée', copy: 'Composants CE EN 60598, UL 962, SAA et RoHS par modèle ; garantie 3 ans électronique / 2 ans structure.' },
    ],
    home: 'Accueil', solutions: 'Solutions', requestQuote: 'Demander un devis usine', viewCatalog: 'Voir le catalogue', relevantProducts: 'Produits associés',
    modelsHeading: 'Modèles pour démarrer votre cahier des charges', viewAllProducts: 'Voir tous les produits', buyerQuestions: 'Questions des acheteurs', faqHeading: 'Questions fréquentes',
    relatedSolutions: 'Solutions de fabrication associées', quoteEyebrow: 'Devis selon spécifications', quoteHeading: 'Envoyez-nous les dimensions, quantités et fonctions souhaitées.', startRfq: 'Démarrer une demande',
    breadcrumbLabel: 'Fil d’Ariane', proofPointsLabel: 'Repères industriels BOLEN',
  },
  de: {
    navLabel: 'Lösungen', footerLabel: 'Fertigungslösungen', homeEyebrow: 'Beschaffungswege für Einkäufer', homeHeading: 'Die passende Lösung für Ihre Spiegelfertigung',
    homeIntro: 'Technische Spezifikationen (5 mm EN 1036 Glas, CRI ≥ 90, IP44/IP54) für LED-Badspiegel, CAD-Maßanfertigungen, Hotel- & Objektbau, Spiegelschränke und OEM/ODM.', homeExplore: 'Spezifikation prüfen',
    hubTitle: 'Lösungen für die Spiegelfertigung | OEM, Großhandel & Objekt | BOLEN', hubDescription: 'BOLEN Fertigungslösungen für 5 mm EN 1036 LED-Badspiegel, Maßspiegel, Hotel- und Gewerbeprojekte, Spiegelschränke sowie OEM/ODM (Testorders ab 10 Stk., OEM 50–100 Stk.).',
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
      { title: 'Werksangebot prüfen', copy: 'Muster in 7–12 Tagen, Testorder ab 10 Stk. Lagerplattform (50–100 Stk. OEM), Serie in 25–35 Tagen und ISTA-3A-Verpackung.' },
    ],
    strengths: [
      { title: '46.800 m² Direktwerk', copy: '5 mm EN 1036 Spiegelglas, 6063-T5 Alurahmen, CRI ≥ 90 LEDs, Hochspannungstest und ISTA-3A-Exportkartons.' },
      { title: 'Spezifikationsbasierte Angebote', copy: 'Preis und MOQ (ab 10 Stk. bei Katalogmodellen; 50–100 Stk. bei OEM-Sonderfertigung) richten sich nach Maßen, IP44/IP54 und Zielmarkt.' },
      { title: 'Geprüfte Normen & Garantie', copy: 'CE EN 60598, UL 962, SAA und RoHS je Modell; 3 Jahre Garantie auf Elektronik, 2 Jahre auf Spiegel & Rahmen.' },
    ],
    home: 'Startseite', solutions: 'Lösungen', requestQuote: 'Werksangebot anfordern', viewCatalog: 'Produktkatalog ansehen', relevantProducts: 'Passende Produkte',
    modelsHeading: 'Modelle als Ausgangspunkt Ihrer Spezifikation', viewAllProducts: 'Alle Produkte ansehen', buyerQuestions: 'Fragen von Einkäufern', faqHeading: 'Häufige Fragen',
    relatedSolutions: 'Verwandte Fertigungslösungen', quoteEyebrow: 'Spezifikationsbasiertes Angebot', quoteHeading: 'Senden Sie uns Maße, Menge und gewünschte Funktionen.', startRfq: 'Anfrage starten',
    breadcrumbLabel: 'Brotkrumennavigation', proofPointsLabel: 'BOLEN Fertigungskennzahlen',
  },
  it: {
    navLabel: 'Soluzioni', footerLabel: 'Soluzioni produttive', homeEyebrow: 'Percorsi di acquisto B2B', homeHeading: 'Trova la soluzione giusta per la produzione di specchi',
    homeIntro: 'Specifiche tecniche (vetro 5 mm EN 1036, CRI ≥ 90, IP44/IP54) per specchi LED da bagno, progetti CAD su misura, hospitality, contract, armadietti LED e OEM/ODM.', homeExplore: 'Vedi scheda tecnica',
    hubTitle: 'Soluzioni per la produzione di specchi | OEM, Wholesale & Contract | BOLEN', hubDescription: 'Scopri le soluzioni industriali BOLEN per specchi LED 5 mm EN 1036, specchi su misura, hotel, progetti contract, armadietti LED e programmi OEM/ODM (ordini pilota da 10 pz, OEM 50–100 pz).',
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
      { title: 'Esamina il preventivo di fabbrica', copy: 'Campione in 7–12 giorni, pilota da 10 pz a catalogo (50–100 pz OEM), serie in 25–35 giorni e imballo ISTA-3A.' },
    ],
    strengths: [
      { title: 'Stabilimento da 46.800 m²', copy: 'Vetro 5 mm EN 1036 senza rame, telai 6063-T5, LED CRI ≥ 90, collaudo elettrico e cartoni export ISTA-3A.' },
      { title: 'Preventivi su specifica', copy: 'Prezzo e MOQ (da 10 pz su modelli a catalogo; 50–100 pz su specifiche OEM) confermati per misure, grado IP44/IP54 e mercato.' },
      { title: 'Certificazioni e garanzia chiara', copy: 'Componenti CE EN 60598, UL 962, SAA e RoHS per modello; garanzia 3 anni elettronica / 2 anni struttura.' },
    ],
    home: 'Home', solutions: 'Soluzioni', requestQuote: 'Richiedi preventivo di fabbrica', viewCatalog: 'Vedi catalogo prodotti', relevantProducts: 'Prodotti pertinenti',
    modelsHeading: 'Modelli da cui partire per la specifica', viewAllProducts: 'Vedi tutti i prodotti', buyerQuestions: 'Domande degli acquirenti', faqHeading: 'Domande frequenti',
    relatedSolutions: 'Soluzioni produttive correlate', quoteEyebrow: 'Preventivo su specifica', quoteHeading: 'Invia dimensioni, quantità e funzioni richieste.', startRfq: 'Avvia richiesta',
    breadcrumbLabel: 'Percorso di navigazione', proofPointsLabel: 'Indicatori produttivi BOLEN',
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
      footerAnchor: 'Suministro mayorista por contenedor',
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
      blurb: 'Pensili IP44 in alluminio con cerniere soft-close 110°, LED CRI ≥ 90 e MOQ 30–50 pz.',
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
      homeAnchor: 'Specchi bagno con pellicola riscaldante antiappannamento',
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

type LocalizedTechSpec = {
  proofPoints: Array<{ value: string; label: string }>;
  section: SeoLandingSection;
};

// Slug-specific B2B engineering parameters for all 12 solutions across zh, es,
// fr, de, and it. Each block mirrors the unique glass, frame, optical,
// electrical, mounting, thermal, RF, or logistics architecture of the
// corresponding English page in seoLandingPages.ts without boilerplate reuse.
const LOCALIZED_TECH_SPECS: Record<
  Exclude<SupportedLanguage, 'en'>,
  Record<string, LocalizedTechSpec>
> = {
  zh: {
    'led-bathroom-mirror-manufacturer': {
      proofPoints: [
        { value: '5mm EN 1036', label: '无铜环保银镜（>720 小时耐盐雾验证）' },
        { value: 'CRI ≥ 90 · IP44/54', label: '2700K–6500K 无极调色与密封防水驱动' },
        { value: '10 / 50–100 件', label: '常规款 10 件起试单，定制 OEM 50–100 件起' },
        { value: '7–12 / 25–35 天', label: '工程打样与量产交期（ISTA-3A 出口箱）' },
      ],
      section: {
        heading: '浴室分区光学、防水电气与老化检测规范',
        paragraphs: [
          '针对卫浴潮湿区，嘉兴 46,800 m² 工厂（6 条产线，始于 2005 年）将 5mm 汽车级无铜银镜（含铜量 <0.1%，无铅环氧背漆符合 EN 1036）与 120–240 颗/米高密 SMD 2835 灯带整合设计，实现 CRI ≥ 90（化妆/酒店可选 CRI ≥ 95）、SDCM ≤ 3 色容差及 50,000+ 小时额定寿命。',
        ],
        bullets: [
          '18–35mm 精密喷砂透光窗口，搭配 IP65 硅胶套管灯槽与 IP44/IP54 密封恒压电源盒',
          '支持 110–120V（UL 962 / ETL / FCC）与 220–240V（CE EN 60598、CB、UKCA、SAA、RoHS）分区电气架构',
          '逐台执行 100% 高压介电耐压、接地连续性测试及至少 2 小时满载点灯除雾老化',
          '现有目录款支持 10 件试单，定制 OEM 尺寸 50–100 件起；电子件 3 年质保、镜体边框 2 年质保',
        ],
      },
    },
    'custom-mirror-manufacturer': {
      proofPoints: [
        { value: '±1.0mm CNC', label: '4mm/5mm 镜片精密磨边与斜边加工' },
        { value: '6063-T5 / 实木', label: '200+ 现成铝型材、不锈钢及防潮木框' },
        { value: '24–48 小时审图', label: '7–12 天 CAD 来图实体打样交付' },
        { value: '10 / 50–100 / 200+', label: '现货 10 件、改型 50–100 件、新开模 200+ 件' },
      ],
      section: {
        heading: '从 CAD 图纸审核到框型挤压与实体打样',
        paragraphs: [
          '不同于仅拼装标准壳体的贸易商，BOLEN 厂内自主完成镜片精切、激光磨砂灯道、1.2–1.5mm 壁厚 6063-T5 氧化铝框、304 不锈钢及防潮实木框加工。收到 DWG/DXF/PDF 图纸或潘通/RAL 色卡后，工程师在 24–48 小时内核算壁挂承重、PMMA 均光扩散及安全间隙并出具深化确认图。',
        ],
        bullets: [
          '加工范围覆盖 400×600mm 梳妆镜至 1800×900mm 建筑大镜，支持平磨边、圆弧边或 10–25mm 抛光斜边',
          '表面工艺提供拉丝金、香槟古铜、哑光黑、枪灰、烤漆白及天然木饰面，配法式暗挂条或 Z 型挂件',
          '复用厂内 200+ 现有铝材模具免收开模费（MOQ 50–100 件），全新专属挤出模或背板模 200+ 件起订',
          '电商单件配 30mm 护角 5 层 BC 瓦楞箱，工程项目提供按房号标识托盘及 3 年电气/2 年结构质保',
        ],
      },
    },
    'hotel-bathroom-mirrors': {
      proofPoints: [
        { value: 'CRI ≥ 90–95', label: '2700K–4000K 酒店暖中性显色梳妆光' },
        { value: '硬接线墙控', label: '兼容插卡取电主控与断电记忆调光' },
        { value: '7–12 天样板间', label: '按 FF&E 深化图打样，定制 50 件/房型起' },
        { value: '按楼层贴标', label: '免熏蒸胶合板托盘 + 1%–2% 工程备品' },
      ],
      section: {
        heading: '酒店客房 FF&E 深化指标、样板间与分楼层交付',
        paragraphs: [
          '酒店卫浴强调整体色温统一、防眩目面部显色及高频保洁耐腐蚀。BOLEN 将无铜耐盐雾银镜与 CAT II 安全背膜结合，针对大床房、双床房、套房及无障碍 ADA 客房定向调校 2700K/3000K/4000K 显色光源，并在量产前 7–12 天完成样板间挂墙实测。',
        ],
        bullets: [
          '支持 0–10V / 可控硅墙面调光或断电记忆硬接线，直接联动客房总控插卡开关',
          '采用暗藏防盗 Z 型挂件与可拆式快修驱动背板，便于酒店工程部快速更换维护',
          '同一采购单可同步配套客房全身穿衣镜与发光镜柜，标准款 10 件起试单、定制房型 50 件起订',
          '按 FF&E 编号、楼栋、楼层与房型逐箱喷码装托，随货配备 1%–2% 约定驱动及传感器备件',
        ],
      },
    },
    'commercial-bathroom-mirrors': {
      proofPoints: [
        { value: '130μm CAT II', label: '高粘防爆安全膜，受撞击碎片不飞溅' },
        { value: '极简硬接线', label: '100–240V 固定色温免误触公区照明' },
        { value: '10 / 50–100 件', label: '现货 10 件试点，多户型投标 50–100 件/户型' },
        { value: '分阶段锁料', label: '按施工进度分批出货并锁定 BOM 成本' },
      ],
      section: {
        heading: '高人流公区防爆结构、极简控制与分期价值工程',
        paragraphs: [
          '写字楼卫生间、长租公寓与商业试衣间更看重抗冲击安全与低故障率。每面商业镜均可加贴 130 微米 CAT II 聚乙烯防爆膜，搭配重型镀锌钢 Z 型防拆挂条与耐腐蚀阳极铝框；带灯型号简化为硬接线直控，省去多余触控菜单，降低物业运维成本。',
        ],
        bullets: [
          '标配 5mm 耐蚀无铜镜片，经济型精装公寓带框系列可选 4mm 轻量化降本方案',
          '提供无电源纯镜面与 IP44/IP54 商业照明双线方案，随附统一施工定位钻孔模板加快多楼层安装',
          '报价透明拆分镜片厚度、框型截面、合规电源及散箱/托盘包装差异，助力总包跨户型成本平衡',
          '封存首件主样锁定多期施工物料一致，25–35 天分批交付，享 3 年电气及 2 年非带电结构质保',
        ],
      },
    },
    'led-mirror-cabinet-manufacturer': {
      proofPoints: [
        { value: '110° 304 铰链', label: '30,000 次开合寿命测试阻尼缓冲门铰' },
        { value: '6–8mm 钢化层板', label: '可调储物隔板（单层承重 10–15 kg）' },
        { value: '10 / 30–50 件', label: '现货 10 件试单，定制镜柜 30–50 件/尺寸' },
        { value: '14–32 kg 加强箱', label: '蜂窝护板 + 35mm 模塑内衬防移位包装' },
      ],
      section: {
        heading: '镜柜承重箱体、门铰走线安全与重型抗震包装',
        paragraphs: [
          '发光镜柜的机械载荷与门体穿线远高于平面镜。BOLEN 生产宽 500–1200mm、深 120–150mm 的单门、双门及三门壁挂/嵌入式镜柜，箱体选用防锈氧化铝合金或 E1 级防潮板，门板采用双面无铜银镜，将 12V/24V 低压门体线束隐藏于柔性穿线管内，与 IP44 强电电源仓物理隔离。',
        ],
        bullets: [
          '内置门控感应柜内照明、门板集成电热防雾区，并可选配电动剃须刀插座或双口 USB-A/C 充电口',
          '柔性门铰线束与 110° 304 不锈钢缓冲铰链均通过 30,000 次开合循环验证',
          '针对 14–32 kg 重型柜体定制内部层板锁定块、35mm 高密 EPE、蜂窝抗压板及五层跌落测试外箱',
          '现有目录镜柜 10 件起试单，定制尺寸与结构 30–50 件起订，工程打样 10–14 天、大货 25–35 天',
        ],
      },
    },
    'oem-odm-mirror-manufacturing': {
      proofPoints: [
        { value: 'ISO 9001 锁料', label: '封存金样与零擅自替换 BOM 版本管理' },
        { value: '200+ ODM 平台', label: '零模具费快速改款，或 NDA 独家开模' },
        { value: 'AQL 1.5 / 2.5', label: '按订单号归档出货前抽检尺寸与影像报告' },
        { value: '60 / 120 km 港口', label: '嘉兴直连上海港 60 km、宁波港约 120 km' },
      ],
      section: {
        heading: '品牌代工 BOM 锁定、合规技术档案与验货追溯',
        paragraphs: [
          '面向卫浴品牌与大型零售商，BOLEN 严格区分 OEM 锁料复制与 ODM 平台加速：OEM 订单按买家图纸固化金样与物料清单，杜绝翻单私换配件；ODM 项目则基于 200+ 成熟光学与框架架构微调外观、触控 UI 丝印与彩盒，将模具投入归零并在 7–12 天交付确认样。',
        ],
        bullets: [
          '提供镜面激光蚀刻品牌标、定制丝印触控图标、序列号铭牌及多语种安装手册配套',
          '按目的市场整理 UL 962、CE EN 60598、CB、UKCA、SAA、EMC 与 RoHS 元件合规资料包',
          '每批次执行全检耐压、老化测试及 AQL 1.5/2.5 验货归档，支持彩印零售盒或 UPC/EAN/FNSKU 电商箱',
          '支持现有款 10 件试单、ODM 定制 50–100 件及独家模具 200+ 件起订，提供 FOB/CIF/DDP 贸易交付',
        ],
      },
    },
    'led-mirror-wholesale-supplier': {
      proofPoints: [
        { value: '20GP / 40HQ 混装', label: '单柜灵活拼配 4–8 款畅销规格（350–1300 件）' },
        { value: '10 / 50 件每款', label: '现货 10 件 LCL 测款，整柜混拼 50 件/SKU' },
        { value: '通用驱动平台', label: '全系共享认证电源与开关，减少仓库备品' },
        { value: 'FOB / EXW 阶梯价', label: '透明核算 10 / 50 / 200 / 500+ 单箱 CBM 成本' },
      ],
      section: {
        heading: '多价位段混柜装柜效率与渠道备品标准化',
        paragraphs: [
          '健康的分销目录需要兼顾周转率与款式覆盖。BOLEN 协助批发商在同一 20GP（约 350–550 件）或 40HQ（约 850–1,300 件）整柜内科学搭配 4–8 款梯度产品——涵盖入门无框圆镜/方镜、中端哑光黑与拉丝金铝框镜，以及旗舰蓝牙镜或镜柜——同时跨款式统一驱动与触控模块型号。',
        ],
        bullets: [
          '按 600×800mm 至 1200×800mm 常见规格精准测算单柜立方数（CBM），最大化海运装柜率',
          '出厂预贴外箱/内箱条码（UPC、EAN、SKU 与毛净重），支持快递单件防摔箱或展厅缠膜托盘',
          '分档列明 10 件现货试单、50 件混柜、200 件及 500+ 件工厂直出价，剔除贸易中间加价',
          '随柜附带 1%–2% 通用电气易损备件，25–35 天经上海或宁波港直发，享统一 3 年电子质保',
        ],
      },
    },
    'custom-size-led-mirrors': {
      proofPoints: [
        { value: '400–2000+ mm', label: '毫米/英寸定尺裁切（16" 至 78"+，±1.0mm）' },
        { value: '36W–96W 动态配载', label: '按面积重算 24V 双端供电与除雾功率' },
        { value: '免开模改尺', label: '无框及拼接铝框 50–100 件即可按需定尺' },
        { value: '抗扭加强框架', label: '>1200mm 超宽镜配加强背框与蜂窝抗弯箱' },
      ],
      section: {
        heading: '大跨度非标定尺、24V 均光配载与抗弯运输结构',
        paragraphs: [
          '双台盆或嵌入式墙龛常需 36"×42"、72"×36"、1400×750mm 等非目录尺寸，并要求精确避让龙头与墙体暗盒。BOLEN 绝不简单拉伸小功率驱动，而是依据定制净面积同步放大 24V 直流双端馈电灯带、36W–96W 恒压电源容量及背胶发热膜面积，消除大尺寸中段压降发暗。',
        ],
        bullets: [
          '支持 R5–R50mm 自定义倒角半径、胶囊/拱形比例缩放及横竖双向精确出线孔位定位',
          '宽度超 1200mm 自动升级加厚铝合金背框与双点重型 Z 型挂轨，确保上墙平整不形变',
          '标准目录尺码 10 件可试单，无框与焊接 6063-T5 铝框免模具费定尺 50–100 件起，7–12 天出样',
          '超大尺寸采用 30–40mm 周边泡沫护槽、蜂窝护面板及立式木箱/A 字架托盘防止运输扭曲破裂',
        ],
      },
    },
    'irregular-shaped-mirror-manufacturer': {
      proofPoints: [
        { value: 'DXF/AI 矢量编程', label: 'CNC 异形精切与全自动金刚石曲线抛边' },
        { value: '柔性 COB/2835 绕边', label: '紧弯弧度保持背光光晕均匀无暗角' },
        { value: '四向重心挂件', label: '实测重心支持竖挂、横挂及倒置创意安装' },
        { value: '模切贴合 EPE 内衬', label: '按异形轮廓专切缓冲腔，保护突出弧边' },
      ],
      section: {
        heading: '异形曲线 CNC 抛边工艺、弧面均光与仿形缓冲包装',
        paragraphs: [
          '鹅卵石、云朵、波浪、半圆及不对称艺术镜的成败取决于曲线边缘平滑度与非对称重心平衡。BOLEN 直接导入买家 DXF/DWG/AI 矢量路径编程切割，提前校验最小内外曲率半径，确保自动磨边不崩角；有框款式可选滚弯窄铝框或 CNC 铣削实木/防潮 MDF 外框。',
        ],
        bullets: [
          '带灯异形款采用高密柔性 24V COB 或 2835 灯带沿曲线等距排布，转角光晕连续柔和',
          '依据每款异形实际重心点布置四向多角度钥匙孔挂片，实现灵活多向陈列悬挂',
          '按实样轮廓专用刀模冲切 25–35mm 高密 EPE 仿形泡棉，杜绝矩形护角留空导致弧端磕损',
          '现有有机模板 10 件起试单，独家矢量轮廓 50–100 件起订；发光款电气 3 年质保，无灯款镜体 2 年质保',
        ],
      },
    },
    'smart-bluetooth-mirror-manufacturer': {
      proofPoints: [
        { value: '蓝牙 5.0 / 5.3', label: '10 米稳定传输、支持定制 OEM 配对广播名' },
        { value: '2×3W 密封音腔', label: '防潮减震背置发声单元，消除镜面共振杂音' },
        { value: 'CE RED / FCC 射频', label: '同步覆盖灯具安规与无线射频 EMC 合规' },
        { value: '100% 音频全检', label: '逐台实测蓝牙配对、扫频音质与触控响应' },
      ],
      section: {
        heading: '防潮声学减震、交互界面定制与射频电磁合规',
        paragraphs: [
          '在浴室镜内集成无线音频与数字显示必须兼顾声学隔离与电磁屏蔽。BOLEN 采用蓝牙 5.0/5.3 模块（可烧录品牌专属蓝牙配对名称）匹配双 2×3W 减震防水背置扬声器，同时集成防眩光激光蚀刻 12/24 小时时钟、环境温度显示及可选 3 倍/5 倍光学放大镜与夜灯感应。',
        ],
        bullets: [
          '全套驱动、音频功放与电容触控盒执行独立 IP44 密封，并带电磁抗干扰屏蔽布线',
          '针对目标市场按型号配置北美 UL 962 + FCC 或欧洲 CE LVD/EMC/RED、UKCA 与 SAA 方案',
          '定制触控丝印图标、待机背光亮度、摄氏/华氏切换及多语种说明书，10 件试单 / 50–100 件 OEM 起订',
          '出厂前 100% 执行蓝牙连接、声学扫频、触控灵敏度及 2 小时老化校验，智能电子件享 3 年质保',
        ],
      },
    },
    'anti-fog-led-mirror-manufacturer': {
      proofPoints: [
        { value: '150–250 W/m²', label: '双层绝缘 PET 碳晶/金属箔电热防雾膜' },
        { value: '3–5 分钟升温除雾', label: '中央可视区安全温升 +12°C 至 +18°C' },
        { value: '60 分钟定时断电', label: '独立除雾触控开关，满足酒店及欧盟节能需求' },
        { value: '30%–55% 清晰区', label: '200×300 至 400×600mm+ 发热区图纸实标' },
      ],
      section: {
        heading: 'PET 电热防雾功率密度、防脱胶工艺与定时节能控制',
        paragraphs: [
          '劣质除雾膜常因功率不足无法化雾，或局部过热导致银层脱胶发黄。BOLEN 选用通过 UL/TUV/CE 认证的双层绝缘 PET 电热防雾膜（150–250 W/m²），配合耐高温丙烯酸热敏背胶贴合于无铜银镜背面，3–5 分钟内将中央可视区温和提升 +12°C 至 +18°C，无热冲击风险。',
        ],
        bullets: [
          '发热片尺寸从 200×300mm 至 400×600mm+ 随镜面比例精准放大，并在工程图上明示避让灯窗与挂件',
          '标配独立防雾触控键，可选 60 分钟自动断电节能继电器，亦可与浴室照明墙控同步启停',
          '生产老化期间 100% 执行高压绝缘耐压测试及热成像升温均匀度核查，杜绝局部过热点',
          '常规款 10 件起试单，定制发热区及 OEM 规格 50–100 件起；电热膜与控制系统享 3 年原厂质保',
        ],
      },
    },
    'full-length-mirror-manufacturer': {
      proofPoints: [
        { value: '1500–2000mm', label: '无水波纹浮法银镜 + 130μm CAT II 防爆膜' },
        { value: '三合一安装方式', label: '折叠落地 U 型支架、防倾倒斜靠与壁挂 Z 条' },
        { value: '抗弯蜂窝加强箱', label: '整面蜂窝护板 + 35mm 边角泡棉防快递折损' },
        { value: '10 / 50 件起订', label: '现有款 10 件试单，定制尺码与框色 50 件起' },
      ],
      section: {
        heading: '长跨度成像平整度、三合一落地支架与抗弯物流包装',
        paragraphs: [
          '1500–2000mm 超高穿衣镜极易放大镜面波纹变形或边角扭曲。BOLEN 精选光学级 4mm/5mm 浮法无铜银镜并强制背贴 130 微米 CAT II 防爆安全膜，配合 1.2–1.5mm 加厚 6063-T5 氧化铝、喷涂钢或窑干实木框架，确保客房、试衣间与家居使用长期笔直不弯拱。',
        ],
        bullets: [
          '涵盖 1500×400、1600×500、1650×600、1800×800mm 等拱形、圆角、胶囊及矩形长款版型',
          '可选配带防滑脚垫与限位链条的折叠落地支架、斜靠防倾倒墙面安全绳或暗藏式竖挂五金',
          '电商快递采用全幅蜂窝抗弯板 + 35mm 高密护边五层纸箱，酒店/零售整柜提供立式 A 型架托盘',
          '发光全身镜电气件 3 年质保，非带电穿衣镜镜片、安全背膜、支架与外框享 2 年质保',
        ],
      },
    },
  },
  es: {
    'led-bathroom-mirror-manufacturer': {
      proofPoints: [
        { value: '5 mm EN 1036', label: 'Vidrio plata sin cobre (>720 h niebla salina)' },
        { value: 'CRI ≥ 90 · IP44/54', label: 'CCT continuo 2700K–6500K y drivers estancos' },
        { value: '10 / 50–100 uds.', label: 'Pruebas desde 10 uds. catálogo; 50–100 uds. OEM' },
        { value: '7–12 / 25–35 días', label: 'Prototipos y serie con cartón ISTA-3A' },
      ],
      section: {
        heading: 'Ingeniería óptica, sellado eléctrico IP44/IP54 y control de envejecimiento',
        paragraphs: [
          'En nuestra planta integrada de 46.800 m² en Jiaxing (6 líneas desde 2005), combinamos vidrio espejo de grado automotriz sin cobre de 5 mm (<0,1 % de cobre, respaldo epoxi sin plomo EN 1036) con tiras SMD 2835 de 120–240 LEDs/m que alcanzan CRI ≥ 90 (opción ≥ 95 para maquillaje), uniformidad cromática SDCM ≤ 3 y vida útil superior a 50.000 horas.',
        ],
        bullets: [
          'Ventanas chorreadas con arena de 18–35 mm, canales LED encapsulados IP65 y cajas de driver selladas IP44/IP54',
          'Arquitectura eléctrica 110–120V (UL 962 / ETL / FCC) o 220–240V (CE EN 60598, CB, UKCA, SAA y RoHS) según destino',
          'Verificación unitaria 100 % dieléctrica hi-pot, continuidad de tierra y 2 horas de encendido continuo a plena carga',
          'Pedidos piloto desde 10 uds. en modelos existentes y series OEM desde 50–100 uds.; garantía de 3 años en electrónica y 2 en estructura',
        ],
      },
    },
    'custom-mirror-manufacturer': {
      proofPoints: [
        { value: '±1,0 mm CNC', label: 'Corte y biselado en vidrio plata de 4 mm / 5 mm' },
        { value: 'Aluminio 6063-T5', label: '200+ perfiles propios, acero 304 y madera sellada' },
        { value: '24–48 h planos', label: 'Prototipo físico a partir de DWG/DXF en 7–12 días' },
        { value: '10 / 50–100 / 200+', label: 'Catálogo 10 uds., perfiles 50–100, nuevo molde 200+' },
      ],
      section: {
        heading: 'Fabricación interna desde plano CAD, perfiles metálicos y prototipado',
        paragraphs: [
          'A diferencia de ensambladores sujetos a carcasas cerradas, mecanizamos internamente vidrio, canales láser, bastidores de aluminio 6063-T5 (espesor de pared 1,2–1,5 mm), acero inoxidable 304 y madera sellada contra humedad. Analizamos archivos DWG/DXF/PDF o referencias RAL/Pantone en 24–48 horas, validando rigidez, difusión PMMA sin puntos LED y distancias de seguridad.',
        ],
        bullets: [
          'Medidas a medida desde 400×600 mm hasta formatos arquitectónicos de 1800×900 mm con canto pulido o bisel de 10–25 mm',
          'Acabados anodizados y lacados en latón cepillado, bronce champán, negro mate, antracita, blanco y roble natural',
          'Reutilizar nuestros 200+ perfiles elimina costes de utillaje (MOQ 50–100 uds.); matrices exclusivas desde 200+ uds.',
          'Embalaje BC de 5 capas con cantoneras de 30 mm para paquetería o palés etiquetados para entregas de obra',
        ],
      },
    },
    'hotel-bathroom-mirrors': {
      proofPoints: [
        { value: 'CRI ≥ 90–95', label: 'Luz cálida/neutra 2700K–4000K para tocador hotelero' },
        { value: 'Conexión mural', label: 'Compatible con tarjetero maestro y memoria de encendido' },
        { value: 'Habitación piloto', label: 'Muestras según planos FF&E en 7–12 días (50 uds./tipo)' },
        { value: 'Palés por planta', label: 'Etiquetado por ala/habitación + 1 %–2 % de repuestos' },
      ],
      section: {
        heading: 'Especificaciones FF&E para habitaciones, habitación piloto y logística por fases',
        paragraphs: [
          'Los proyectos hoteleros exigen reproducción fiel del rostro sin deslumbramiento, sujeción antirrobo y cero ennegrecimiento de cantos. Combinamos cristal sin cobre con lámina inastillable CAT II y LEDs calibrados en 2700K, 3000K o 4000K para habitaciones estándar, suites y baños accesibles ADA, validados mediante muestra piloto en 7–12 días.',
        ],
        bullets: [
          'Cablado directo a interruptor general o regulador mural 0–10V / TRIAC con conservación del último modo',
          'Herrajes ocultos en Z antirrobo y placas traseras registrables para sustituir el driver sin desmontar obra',
          'Suministro coordinado de espejos de tocador, vestidores de cuerpo entero y armarios LED bajo un mismo pedido',
          'Estarcido de cajas y palés sin fumigación por código FF&E, planta y tipología, incluyendo 1 %–2 % de recambios acordados',
        ],
      },
    },
    'commercial-bathroom-mirrors': {
      proofPoints: [
        { value: 'Film CAT II 130 μm', label: 'Retención de fragmentos ante impacto en zonas públicas' },
        { value: 'Encendido directo', label: 'Módulos 100–240V sin menús táctiles innecesarios' },
        { value: '10 / 50–100 uds.', label: 'Obra menor desde 10 uds.; licitaciones 50–100 uds./tipo' },
        { value: 'Entregas por fases', label: 'BOM bloqueado y plantillas uniformes de perforación' },
      ],
      section: {
        heading: 'Resistencia para aseos de alto tráfico, seguridad CAT II e ingeniería de valor',
        paragraphs: [
          'Oficinas, residencias de estudiantes, apartamentos en alquiler y probadores comerciales priorizan mantenimiento mínimo y contención de rotura. Integramos lámina PE CAT II de 130 micras, barras Z de acero galvanizado de alta carga y versiones cableadas directas (o espejos no iluminados) que soportan ciclos intensivos de limpieza.',
        ],
        bullets: [
          'Vidrio anticorrosivo de 5 mm (alternativa enmarcada de 4 mm para capítulos residenciales de ajuste presupuestario)',
          'Versiones LED simplificadas de larga vida útil (>50.000 h) en 3000K/4000K/6000K o espejos sin consumo eléctrico',
          'Desglose transparente de costes por espesor de vidrio, marco, certificación y paletización para comparar partidas',
          'Plantillas estandarizadas de taladrado para instaladores y garantía unificada de 3 años LED / 2 años estructura',
        ],
      },
    },
    'led-mirror-cabinet-manufacturer': {
      proofPoints: [
        { value: 'Bisagras 110° 304', label: 'Cierre suave en acero inoxidable (30.000 ciclos)' },
        { value: 'Baldas 6–8 mm', label: 'Vidrio templado regulable con carga de 10–15 kg' },
        { value: '10 / 30–50 uds.', label: 'Piloto 10 uds. en stock; armarios OEM 30–50 uds.' },
        { value: 'Embalaje 14–32 kg', label: 'Bloqueo de baldas, panel nido de abeja y EPE 35 mm' },
      ],
      section: {
        heading: 'Mecánica de armarios iluminados, paso eléctrico en bisagra y protección reforzada',
        paragraphs: [
          'Un armario de baño iluminado soporta mucha mayor carga mecánica y complejidad eléctrica que un espejo plano. Fabricamos cuerpos murales o empotrados (anchos habituales 500–1200 mm, fondos 120–150 mm) en aluminio anodizado antioxidante o tablero E1 hidrófugo, con puertas de doble espejo y conductos flexibles de baja tensión (12V/24V) aislados del compartimento estanco IP44.',
        ],
        bullets: [
          'Configuraciones de una, dos o tres puertas con luz interior activada al abrir, base para afeitadora y puertos USB-A/C',
          'Cableado flexible puerta-cuerpo y bisagras amortiguadas de 110° probadas por encima de 30.000 aperturas',
          'Protección diseñada para 14–32 kg: topes internos de balda, espuma moldeada de 35 mm y paneles tipo nido de abeja',
          'Muestras técnicas de armario en 10–14 días; MOQ de 10 uds. en referencias estándar y 30–50 uds. en desarrollo OEM',
        ],
      },
    },
    'oem-odm-mirror-manufacturing': {
      proofPoints: [
        { value: 'ISO 9001 · BOM fijo', label: 'Muestra dorada sellada sin cambios ocultos de piezas' },
        { value: '200+ bases ODM', label: 'Lanzamiento sin utillaje o moldes exclusivos bajo NDA' },
        { value: 'Inspección AQL', label: 'Control AQL 1.5/2.5 y reportes fotográficos por pedido' },
        { value: 'Puertos 60 / 120 km', label: 'A 60 km del puerto de Shanghái y ~120 km de Ningbo' },
      ],
      section: {
        heading: 'Gobernanza de marca propia, control BOM y expedientes para auditorías retail',
        paragraphs: [
          'Para marcas de baño y grandes distribuidores, el valor de fábrica reside en repetir con exactitud cada lote. En proyectos OEM bloqueamos la lista de materiales (BOM) y la muestra dorada aprobada; en programas ODM personalizamos sobre más de 200 plataformas probadas el serigrafiado táctil, los acabados y la caja retail sin inversión en troqueles.',
        ],
        bullets: [
          'Grabado láser de logotipo frontal o retroiluminado, etiquetas técnicas seriadas y manuales multilingües',
          'Revisión documental por referencia para UL 962, CE EN 60598, CB, UKCA, SAA, compatibilidad EMC y RoHS',
          'Cajas litografiadas a todo color para tienda o cartones marrones e-commerce con códigos UPC, EAN o FNSKU',
          'Pruebas desde 10 uds. en stock, adaptaciones ODM desde 50–100 uds. y moldes exclusivos desde 200+ uds. (FOB/CIF/DDP)',
        ],
      },
    },
    'led-mirror-wholesale-supplier': {
      proofPoints: [
        { value: '20GP / 40HQ mixto', label: '350–550 uds. (20GP) o 850–1.300 uds. (40HQ) en 4–8 SKUs' },
        { value: '10 / 50 uds./SKU', label: 'LCL desde 10 uds. catálogo; contenedor mixto 50 uds./modelo' },
        { value: 'Electrónica común', label: 'Misma familia de drivers y sensores para simplificar stock' },
        { value: 'Escalados FOB/EXW', label: 'Precios claros por volumen (10 / 50 / 200 / 500+ uds.)' },
      ],
      section: {
        heading: 'Consolidación de contenedores mixtos y optimización de surtido mayorista',
        paragraphs: [
          'Un catálogo rentable equilibra rotación y amplitud sin inmovilizar capital en un único código. Ayudamos a importadores a combinar entre 4 y 8 modelos complementarios por contenedor —básicos sin marco, gama media con perfil negro/dorado y modelos insignia con audio o almacenaje— estandarizando la electrónica de recambio.',
        ],
        bullets: [
          'Cálculo de cubicaje (CBM) optimizado para formatos clave de 600×800 mm a 1200×800 mm en carga FCL o LCL',
          'Etiquetado de origen con códigos de barras master/inner, peso bruto/neto y elección entre caja courier o palé de exposición',
          'Escalas de precio directas de fábrica diferenciando cumplimiento CE/SAA frente a UL/ETL sin márgenes de intermediarios',
          'Reposición ágil en 25–35 días con 1 %–2 % de kits eléctricos de servicio y garantía de 3 años LED / 2 años estructura',
        ],
      },
    },
    'custom-size-led-mirrors': {
      proofPoints: [
        { value: '400–2000+ mm', label: 'Medidas en mm o pulgadas (16"–78"+) con corte ±1,0 mm' },
        { value: '36W–96W escalado', label: 'Tira 24V doble alimentación y driver ajustados al área' },
        { value: 'Sin coste de molde', label: 'Redimensionado sin troquel desde 50–100 uds. (10 uds. stock)' },
        { value: 'Refuerzo >1200 mm', label: 'Subbastidor de aluminio y embalaje antiflexión' },
      ],
      section: {
        heading: 'Escalado de potencia lumínica 24V y rigidez para espejos de gran formato',
        paragraphs: [
          'Los tocadores dobles y hornacinas a medida exigen formatos fuera de catálogo (como 36"×42", 72"×36" o 1650×850 mm) alineados a la caja eléctrica en pared. En lugar de estirar un driver pequeño, recalculamos la longitud de tira LED de 24V con doble alimentación, la potencia del driver (36W–96W) y la superficie calefactora antivaho.',
        ],
        bullets: [
          'Radios de esquina personalizables (R5–R50 mm), proporciones cápsula/arco y coordenadas exactas de salida trasera de cable',
          'A partir de 1200 mm de ancho añadimos subchasis de aluminio reforzado y doble barra Z para evitar flecha o caídas de tensión',
          'Los diseños sin marco y perfiles 6063-T5 ingletados se adaptan sin gastos de molde con muestras listas en 7–12 días',
          'Protección perimetral de espuma de 30–40 mm, refuerzos nido de abeja y jaulas de contrachapado para formatos panorámicos',
        ],
      },
    },
    'irregular-shaped-mirror-manufacturer': {
      proofPoints: [
        { value: 'Contorno DXF/AI', label: 'Corte CNC curvo y pulido diamantado sin astillado' },
        { value: 'Halo COB/2835', label: 'Tira flexible de alta densidad uniforme en radios cerrados' },
        { value: 'Colgado 4 vías', label: 'Anclajes calibrados al centro de gravedad asimétrico' },
        { value: 'Espuma troquelada', label: 'Cavidad EPE de 25–35 mm ajustada a cada silueta' },
      ],
      section: {
        heading: 'Mecanizado curvo CNC, difusión perimetral y cavidades de espuma a medida',
        paragraphs: [
          'Las siluetas orgánicas —guijarro, nube, onda, medialuna o formas asimétricas— dependen de un canto impecable y un equilibrio preciso en pared. Programamos mesas CNC directamente desde trazados DXF/DWG/AI verificando radios mínimos de curvatura, con opción de bastidor de aluminio curvado o madera fresada.',
        ],
        bullets: [
          'Iluminación trasera o frontal flexible manteniendo separación constante del borde para evitar zonas sombreadas en curvas',
          'Herrajes multiposición probados en 4 orientaciones (vertical, horizontal o invertida) según el centro de masas real',
          'Troquelado de espuma EPE a la forma exacta del espejo para proteger lóbulos salientes frente a impactos de tránsito',
          'Plantillas orgánicas existentes desde 10 uds. y siluetas exclusivas desde 50–100 uds. (garantía 3 años LED / 2 años sin LED)',
        ],
      },
    },
    'smart-bluetooth-mirror-manufacturer': {
      proofPoints: [
        { value: 'BT 5.0 / 5.3', label: 'Alcance de 10 m con nombre de emparejamiento OEM' },
        { value: 'Audio 2×3W estanco', label: 'Transductores traseros amortiguados sin vibración' },
        { value: 'CE RED / FCC / UL', label: 'Cumplimiento combinado de luminaria y radiofrecuencia' },
        { value: '100 % test audio', label: 'Prueba individual de enlace, barrido sonoro y tacto' },
      ],
      section: {
        heading: 'Aislamiento acústico estanco, interfaz táctil y homologación RF/EMC',
        paragraphs: [
          'Integrar audio inalámbrico y pantallas digitales en ambientes húmedos requiere aislamiento acústico, apantallamiento EMI y ergonomía clara. Montamos módulos Bluetooth 5.0/5.3 con identificador OEM personalizable y doble excitador trasero sellado de 2×3W, junto a reloj 12/24 h, temperatura (°C/°F) y lupa opcional 3x/5x.',
        ],
        bullets: [
          'Cajas selladas IP44 independientes para fuente, placa de audio y módulo capacitivo o sensor de movimiento nocturno',
          'Conjuntos homologados para Norteamérica (UL 962 / ETL + FCC) o Europa y Oceanía (CE EN 60598, RED, EMC, UKCA, SAA)',
          'Personalización de iconos serigrafiados, intensidad en reposo y manuales (10 uds. stock / 50–100 uds. OEM)',
          'Verificación final al 100 % de emparejamiento, respuesta táctil, barrido acústico y envejecimiento con 3 años de garantía',
        ],
      },
    },
    'anti-fog-led-mirror-manufacturer': {
      proofPoints: [
        { value: '150–250 W/m²', label: 'Lámina PET doble aislamiento reconocida UL/TUV/CE' },
        { value: '+12 °C a +18 °C', label: 'Desempañado de zona central en 3–5 min sin choque térmico' },
        { value: 'Apagado auto 60 min', label: 'Botón táctil independiente con relé de ahorro energético' },
        { value: '30 %–55 % área', label: 'Láminas de 200×300 a 400×600 mm+ acotadas en plano' },
      ],
      section: {
        heading: 'Densidad térmica de lámina PET, adherencia segura y control temporizado',
        paragraphs: [
          'Un sistema antivaho fiable requiere dimensionar la potencia superficial para despejar el vapor sin degradar el plateado. Aplicamos láminas calefactoras PET de doble aislamiento (150–250 W/m²) con adhesivo acrílico térmico de alta retención que elevan la zona central entre +12 °C y +18 °C en 3–5 minutos.',
        ],
        bullets: [
          'Dimensiones de lámina mapeadas por modelo (de 200×300 mm a más de 400×600 mm) evitando zonas arenadas y herrajes',
          'Interruptor táctil dedicado con temporizador de corte automático a los 60 minutos o sincronización con interruptor mural',
          'Ensayo dieléctrico hi-pot al 100 % y control térmico durante las 2 horas de prueba en línea antes de embalar',
          'Pruebas de catálogo desde 10 uds. y layouts térmicos OEM desde 50–100 uds., cubiertos por 3 años de garantía eléctrica',
        ],
      },
    },
    'full-length-mirror-manufacturer': {
      proofPoints: [
        { value: '1500–2000 mm', label: 'Vidrio float sin distorsión + film inastillable CAT II' },
        { value: 'Montaje 3 en 1', label: 'Soporte abatible en U, apoyo antivuelco o barra Z mural' },
        { value: 'Embalaje antiflexión', label: 'Placas nido de abeja y esquineros EPE de 35 mm' },
        { value: '10 / 50 uds.', label: 'Catálogo desde 10 uds.; medidas y acabados OEM 50 uds.' },
      ],
      section: {
        heading: 'Planitud óptica en gran altura, soportes 3 en 1 y embalaje contra flexión',
        paragraphs: [
          'A partir de 1500 mm de altura cualquier ondulación del vidrio o unión débil resulta evidente. Seleccionamos espejo float sin cobre de 4 mm o 5 mm con película antiexplosión CAT II de 130 μm obligatoria, enmarcado en aluminio 6063-T5 de 1,2–1,5 mm, acero lacado o madera secada al horno.',
        ],
        bullets: [
          'Siluetas arqueadas, rectangulares, cápsula o esquinas redondeadas en 1500×400, 1600×500, 1650×600 y 1800×800 mm',
          'Configuración mural, apoyada con correa antivuelco o autoportante con caballete abatible, topes antideslizantes y cadena',
          'Cartón doble pared de 5 capas con refuerzo completo tipo nido de abeja para mensajería o palés verticales A-frame',
          'Opción con iluminación perimetral LED (garantía 3 años electrónica) y garantía de 2 años en espejo, respaldo y bastidor',
        ],
      },
    },
  },
  fr: {
    'led-bathroom-mirror-manufacturer': {
      proofPoints: [
        { value: '5 mm EN 1036', label: 'Verre argenté sans cuivre (>720 h brouillard salin)' },
        { value: 'CRI ≥ 90 · IP44/54', label: 'CCT continu 2700K–6500K et boîtiers étanches' },
        { value: '10 / 50–100 pcs', label: 'Essai dès 10 pcs catalogue ; OEM 50–100 pcs' },
        { value: '7–12 / 25–35 jours', label: 'Prototypage et série en cartons ISTA-3A' },
      ],
      section: {
        heading: 'Architecture optique, étanchéité volumes humides et vieillissement en ligne',
        paragraphs: [
          'Au sein de notre site intégré de 46 800 m² à Jiaxing (6 lignes depuis 2005), nous associons un miroir argenté sans cuivre 5 mm (<0,1 % de cuivre, vernis époxy sans plomb EN 1036) à des rubans SMD 2835 de 120 à 240 LED/m offrant un IRC/CRI ≥ 90 (option ≥ 95), un tri chromatique SDCM ≤ 3 et plus de 50 000 heures de durée de vie.',
        ],
        bullets: [
          'Bandeaux sablés de précision 18–35 mm, profils LED gainés silicone IP65 et compartiments driver scellés IP44/IP54',
          'Alimentations 220–240V (CE EN 60598, CB, UKCA, SAA, RoHS) ou 110–120V (UL 962 / ETL / FCC) selon zone d’exportation',
          'Contrôle unitaire 100 % diélectrique haute tension, continuité de terre et 2 heures de rodage pleine charge',
          'Commandes tests dès 10 pièces sur références existantes et séries OEM à 50–100 pièces ; garantie 3 ans électronique / 2 ans structure',
        ],
      },
    },
    'custom-mirror-manufacturer': {
      proofPoints: [
        { value: '±1,0 mm CNC', label: 'Découpe précise et biseaux 10–25 mm sur verre 4/5 mm' },
        { value: 'Alu 6063-T5 & bois', label: '200+ profilés existants, inox 304 et bois hydrofuge' },
        { value: 'Étude 24–48 h', label: 'Prototype physique sur plan DWG/DXF en 7–12 jours' },
        { value: '10 / 50–100 / 200+', label: 'Stock 10 pcs, profils 50–100, filière dédiée 200+' },
      ],
      section: {
        heading: 'Façonnage sur plan CAD, extrusion de cadres et prototypage rapide',
        paragraphs: [
          'Contrairement aux assembleurs limités à des boîtiers standards, nous usinons en interne verre, canaux laser, profilés aluminium 6063-T5 (paroi 1,2–1,5 mm), inox 304 et cadres bois traités humidité. Sous 24 à 48 heures après réception de vos plans DWG/DXF/PDF ou teintes RAL/Pantone, nos ingénieurs valident rigidité, diffuseur PMMA homogène et entraxes de fixation.',
        ],
        bullets: [
          'Formats de 400×600 mm jusqu’aux grands panneaux muraux 1800×900 mm à chants plats polis, arrondis ou biseautés',
          'Finitions anodisées et thermolaquées : laiton brossé, bronze champagne, noir mat, canon de fusil, blanc et bois naturel',
          'L’adaptation de nos 200+ profilés évite tout frais d’outillage (MOQ 50–100 pcs) ; filières dédiées dès 200+ pcs',
          'Cartons BC 5 cannelures avec coins mousse 30 mm pour le colisage individuel ou palettes étiquetées par chantier',
        ],
      },
    },
    'hotel-bathroom-mirrors': {
      proofPoints: [
        { value: 'CRI ≥ 90–95', label: 'Teintes hôtelières flatteuses 2700K–4000K sans éblouir' },
        { value: 'Raccordement mural', label: 'Compatible lecteur de carte chambre et mémoire secteur' },
        { value: 'Chambre témoin', label: 'Échantillon sur plans FF&E en 7–12 j (50 pcs/typologie)' },
        { value: 'Palettes par étage', label: 'Repérage aile/chambre + 1 %–2 % de pièces de rechange' },
      ],
      section: {
        heading: 'Prescriptions hôtelières FF&E, chambre témoin et logistique par étage',
        paragraphs: [
          'Les chambres d’hôtel exigent un rendu facial naturel, un accrochage inviolable et une résistance durable aux produits d’entretien. Nous associons miroir sans cuivre filmé CAT II et rubans LED calibrés en 2700K, 3000K ou 4000K pour chambres standard, suites et PMR, validés en situation réelle via un prototype de chambre témoin livré en 7–12 jours.',
        ],
        bullets: [
          'Câblage direct sur interrupteur mural ou variateur 0–10V / TRIAC avec reprise automatique après coupure carte',
          'Rails Z antivol dissimulés et platine arrière démontable facilitant la maintenance technique des drivers',
          'Coordination sur une seule commande des miroirs vasque, miroirs en pied de chambre et armoires éclairées',
          'Marquage des cartons et palettes contreplaqué sans fumigation par code FF&E, bâtiment, étage et lot + 1 %–2 % de pièces de réserve',
        ],
      },
    },
    'commercial-bathroom-mirrors': {
      proofPoints: [
        { value: 'Film CAT II 130 μm', label: 'Retient les éclats en cas de choc dans les ERP' },
        { value: 'Commande simplifiée', label: 'LED 100–240V câblé direct sans menu tactile fragile' },
        { value: '10 / 50–100 pcs', label: 'Essai dès 10 pcs ; lots résidentiels 50–100 pcs/type' },
        { value: 'Livraison par phase', label: 'Nomenclature figée et gabarits de perçage unifiés' },
      ],
      section: {
        heading: 'Sécurité anti-éclats pour sanitaires collectifs et ingénierie de valeur',
        paragraphs: [
          'Bureaux, résidences étudiantes, logements locatifs et cabines commerciales privilégient robustesse et pose rapide. Nos modèles collectifs reçoivent un film polyéthylène CAT II 130 microns, des barres de suspension galvanisées anti-arrachement et une alimentation simplifiée (ou une version non éclairée) conçue pour durer sans maintenance superflue.',
        ],
        bullets: [
          'Verre anti-corrosion 5 mm (option 4 mm encadré pour les lots résidentiels à budget optimisé)',
          'Versions LED câblées 3000K/4000K/6000K (>50 000 h) ou miroirs sans alimentation à garantie structurelle de 2 ans',
          'Décomposition transparente des coûts (épaisseur verre, profilé, conformité, colisage) pour arbitrer entre lots',
          'Gabarits de perçage standardisés multi-étages et livraisons échelonnées en 25–35 jours par tranche de chantier',
        ],
      },
    },
    'led-mirror-cabinet-manufacturer': {
      proofPoints: [
        { value: 'Charnières 110° inox', label: 'Fermeture amortie 304 testée sur 30 000 cycles' },
        { value: 'Tablettes 6–8 mm', label: 'Verre trempé réglable supportant 10 à 15 kg' },
        { value: '10 / 30–50 pcs', label: 'Essai 10 pcs sur stock ; OEM sur mesure 30–50 pcs' },
        { value: 'Calage 14–32 kg', label: 'Bloque-étagères, nid d’abeille et EPE 35 mm moulé' },
      ],
      section: {
        heading: 'Structure d’armoire de toilette, faisceau de porte et colisage renforcé',
        paragraphs: [
          'Une armoire de toilette éclairée cumule contraintes de poids et passages électriques mobiles. Nous fabriquons des caissons muraux ou encastrables (largeurs 500–1200 mm, profondeurs 120–150 mm) en aluminium anodisé anticorrosion ou panneaux E1 hydrofuges, portes miroir double face et gaines souples basse tension 12V/24V isolées du bloc secteur IP44.',
        ],
        bullets: [
          'Modèles 1 à 3 portes avec éclairage intérieur sur capteur d’ouverture, prise rasoir et double port USB-A/C en option',
          'Passage de câble articulé et charnières freinées 110° en inox 304 endurants sur plus de 30 000 manœuvres',
          'Conditionnement conçu pour 14–32 kg : cales anti-glissement des tablettes, plaques nid d’abeille et mousse EPE 35 mm',
          'Prototypage dédié en 10–14 jours ; essais dès 10 pcs sur catalogue et séries personnalisées dès 30–50 pcs',
        ],
      },
    },
    'oem-odm-mirror-manufacturing': {
      proofPoints: [
        { value: 'ISO 9001 · BOM figé', label: 'Échantillon d’or verrouillé sans substitution cachée' },
        { value: '200+ bases ODM', label: 'Personnalisation sans moule ou outillage sous NDA' },
        { value: 'Contrôle AQL 1.5/2.5', label: 'Rapports dimensionnels et photos archivés par commande' },
        { value: 'Ports 60 / 120 km', label: 'Proximité Shanghai (60 km) et Ningbo (~120 km)' },
      ],
      section: {
        heading: 'Gouvernance marque privée, contrôle BOM et dossiers de conformité',
        paragraphs: [
          'Les enseignes et marques sanitaires exigent une répétabilité stricte d’un réassort à l’autre. En OEM, nous figeons l’échantillon d’or et la nomenclature complète (BOM) ; en ODM, nos 200+ plateformes éprouvées permettent d’adapter dimensions, sérigraphie tactile et packaging retail sans coût d’outillage, avec validation prototype en 7–12 jours.',
        ],
        bullets: [
          'Gravure laser du logo rétroéclairé ou en façade, plaques signalétiques sérialisées et notices multilingues',
          'Constitution des dossiers techniques par modèle : CE EN 60598, CB, UKCA, UL 962, SAA, CEM et RoHS',
          'Boîtes couleur contrecollées pour points de vente ou cartons e-commerce ISTA-3A étiquetés EAN/UPC/FNSKU',
          'Pilotes dès 10 pcs catalogue, séries ODM 50–100 pcs et moules exclusifs 200+ pcs en FOB, CIF ou DDP',
        ],
      },
    },
    'led-mirror-wholesale-supplier': {
      proofPoints: [
        { value: '20GP / 40HQ panaché', label: '4 à 8 modèles par conteneur (350 à 1 300 pièces)' },
        { value: '10 / 50 pcs par SKU', label: 'Test LCL dès 10 pcs ; panachage conteneur 50 pcs/modèle' },
        { value: 'Pièces mutualisées', label: 'Famille unique de drivers et capteurs pour le SAV' },
        { value: 'Paliers FOB / EXW', label: 'Tarification transparente par volume (10/50/200/500+)' },
      ],
      section: {
        heading: 'Panachage de conteneurs grossistes et rationalisation du stock SAV',
        paragraphs: [
          'Une offre de gros performante associe rotation rapide et gamme lisible sans immobiliser de trésorerie sur une seule référence. Nous aidons les distributeurs à panacher 4 à 8 modèles par conteneur 20GP (~350–550 pcs) ou 40HQ (~850–1 300 pcs) — de l’entrée de gamme sans cadre aux gammes encadrées noir/or et connectées — autour d’une électronique harmonisée.',
        ],
        bullets: [
          'Optimisation du cubage (CBM) sur les formats porteurs de 600×800 mm à 1200×800 mm en FCL ou LCL',
          'Codes-barres EAN/UPC et poids pré-imprimés sur cartons individuels renforcés ou palettes filmées showroom',
          'Grille tarifaire usine distinguant conformité CE/SAA et UL/ETL afin de calculer la marge rendue au m³',
          'Expédition en 25–35 jours avec 1 %–2 % de composants SAV inclus et garantie 3 ans LED / 2 ans structure',
        ],
      },
    },
    'custom-size-led-mirrors': {
      proofPoints: [
        { value: '400–2000+ mm', label: 'Coupes en mm ou pouces (16"–78"+) au ±1,0 mm près' },
        { value: '36W–96W proportionné', label: 'Ruban 24V double alimentation et driver recalibrés' },
        { value: 'Zéro frais de moule', label: 'Redimensionnement dès 50–100 pcs (10 pcs en stock)' },
        { value: 'Anti-flexion >1200 mm', label: 'Châssis arrière renforcé et caisses contreplaqué' },
      ],
      section: {
        heading: 'Recalcul électrique 24V et rigidité sur mesure jusqu’à 2 000 mm',
        paragraphs: [
          'Les doubles vasques et niches murales imposent des cotes hors catalogue (36"×42", 72"×36", 1400×750 mm) calées sur les sorties électriques existantes. Plutôt que de sous-alimenter une grande dalle, nous recalculons la puissance du driver (36W–96W), la double injection 24V DC des LED pour éviter toute perte centrale et la surface du film anti-buée.',
        ],
        bullets: [
          'Rayons d’angle configurables (R5–R50 mm), formats pilule ou arche et coordonnées exactes de sortie de câble',
          'Au-delà de 1 200 mm de large, renfort par cadre aluminium structurel arrière et double rail de pose en Z',
          'Plateformes sans cadre et profilés 6063-T5 recoupables sans moule avec échantillon validé en 7–12 jours',
          'Profils de calage mousse 30–40 mm, plaques nid d’abeille et caisses bois ou palettes A-frame contre la torsion',
        ],
      },
    },
    'irregular-shaped-mirror-manufacturer': {
      proofPoints: [
        { value: 'Découpe DXF / AI', label: 'Usinage CNC curviligne et polissage diamant sans éclat' },
        { value: 'Halo COB / 2835', label: 'Ruban souple continu même dans les courbes serrées' },
        { value: 'Accroche 4 sens', label: 'Points de suspension équilibrés sur centre de gravité' },
        { value: 'Mousse découpée', label: 'Alvéoles EPE 25–35 mm moulées sur chaque contour' },
      ],
      section: {
        heading: 'Façonnage CNC de courbes organiques, halo régulier et calage sur contour',
        paragraphs: [
          'Les silhouettes galet, nuage, vague, demi-lune ou asymétriques reposent sur la finesse des chants et l’équilibre d’accrochage. Nos tables CNC lisent directement vos vecteurs DXF/DWG/AI en contrôlant les rayons de courbure minimaux avant polissage diamant, avec cadre aluminium cintré ou bois fraisé en option.',
        ],
        bullets: [
          'Rubans LED souples 24V positionnés à retrait constant du bord pour un rétroéclairage homogène sans zone sombre',
          'Fixations multi-angles validées dans 4 orientations (verticale, horizontale ou inversée) selon le centre de masse',
          'Découpe à la forme de cavités EPE 25–35 mm protégeant chaque lobe asymétrique mieux que des coins rectangulaires',
          'Modèles organiques existants dès 10 pcs et contours exclusifs dès 50–100 pcs (garantie 3 ans LED / 2 ans non LED)',
        ],
      },
    },
    'smart-bluetooth-mirror-manufacturer': {
      proofPoints: [
        { value: 'Bluetooth 5.0/5.3', label: 'Portée 10 m et nom d’appairage OEM personnalisable' },
        { value: 'Stéréo 2×3W étanche', label: 'Transducteurs arrière amortis sans vibration du verre' },
        { value: 'CE RED / FCC / UL', label: 'Conformité luminaire et radiofréquence vérifiée par modèle' },
        { value: 'Tests audio 100 %', label: 'Contrôle unitaire appairage, balayage sonore et tactile' },
      ],
      section: {
        heading: 'Acoustique étanche, interface tactile OEM et conformité radio RED/FCC',
        paragraphs: [
          'L’intégration audio et digitale dans une pièce humide exige découplage vibratoire et blindage électromagnétique. Nous associons modules Bluetooth 5.0/5.3 (identifiant de marque programmable) et doubles haut-parleurs étanches 2×3W à un affichage laser antireflet heure/température (12/24 h, °C/°F) et une loupe grossissante 3x/5x en option.',
        ],
        bullets: [
          'Boîtiers IP44 distincts pour l’alimentation, le bloc audio et la platine capacitive ou veilleuse à détecteur de présence',
          'Architectures certifiées CE LVD/EMC/RED, UKCA et SAA (220–240V) ou UL 962 / ETL + FCC (110–120V)',
          'Sérigraphie d’icônes tactiles, intensité de veille et notices multilingues dès 50–100 pcs (essais stock dès 10 pcs)',
          'Essai unitaire 100 % d’appairage Bluetooth, de réponse tactile et de tenue diélectrique ; garantie électronique 3 ans',
        ],
      },
    },
    'anti-fog-led-mirror-manufacturer': {
      proofPoints: [
        { value: '150–250 W/m²', label: 'Film chauffant PET double isolation reconnu UL/TUV/CE' },
        { value: 'Clair en 3–5 min', label: 'Élévation thermique maîtrisée (+12 °C à +18 °C)' },
        { value: 'Arrêt auto 60 min', label: 'Touche anti-buée dédiée conforme écoconception UE' },
        { value: 'Zone 30 %–55 %', label: 'Formats 200×300 à 400×600 mm+ cotés sur plan' },
      ],
      section: {
        heading: 'Densité thermique anti-buée PET, adhésion durable et minuterie économe',
        paragraphs: [
          'Un film sous-dimensionné laisse la buée persister tandis qu’une surchauffe altère l’argenture. Nous dimensionnons chaque nappe chauffante PET double isolation (150–250 W/m²), collée par adhésif acrylique haute tenue thermique, afin de réchauffer la zone centrale de +12 °C à +18 °C en 3 à 5 minutes sans choc thermique.',
        ],
        bullets: [
          'Implantation précise sur plan (200×300 mm à plus de 400×600 mm) à distance des zones sablées, drivers et pattes de pose',
          'Commande tactile indépendante avec temporisation d’arrêt automatique à 60 minutes ou couplage à l’interrupteur mural',
          'Contrôle diélectrique hi-pot à 100 % et vérification de montée en température pendant le cycle de rodage de 2 heures',
          'Séries catalogue dès 10 pièces et implantations anti-buée OEM dès 50–100 pièces, garanties 3 ans pièces électriques',
        ],
      },
    },
    'full-length-mirror-manufacturer': {
      proofPoints: [
        { value: '1500–2000 mm', label: 'Verre float sans déformation + film sécurité CAT II' },
        { value: 'Pose 3 en 1', label: 'Chevalet pliable en U, appui anti-bascule ou rail Z mural' },
        { value: 'Colis anti-flexion', label: 'Panneaux nid d’abeille intégraux + mousse EPE 35 mm' },
        { value: '10 / 50 pcs', label: 'Essai dès 10 pcs catalogue ; OEM sur mesure dès 50 pcs' },
      ],
      section: {
        heading: 'Planéité grand format, chevalet 3 en 1 et emballage renforcé des miroirs en pied',
        paragraphs: [
          'Sur une hauteur de 1 500 à 2 000 mm, la moindre onde optique ou faiblesse d’angle devient visible. Nos miroirs en pied utilisent un verre float sans cuivre 4 ou 5 mm systématiquement sécurisé par un film CAT II de 130 μm, maintenu dans un cadre rigide en aluminium 6063-T5 (1,2–1,5 mm), acier thermolaqué ou bois séché au four.',
        ],
        bullets: [
          'Silhouettes arche, rectangulaire, coins arrondis ou capsule aux formats 1500×400, 1600×500, 1650×600 et 1800×800 mm',
          'Équipement mural, à poser avec sangle murale anti-basculement ou autoportant avec chevalet repliable, patins et chaînette',
          'Cartons double cannelure 5 plis renforcés par plaques nid d’abeille pour la messagerie ou palettes verticales A-frame',
          'Option éclairage LED périphérique (garantie 3 ans électronique) et garantie 2 ans sur glace, film, pied et cadre non LED',
        ],
      },
    },
  },
  de: {
    'led-bathroom-mirror-manufacturer': {
      proofPoints: [
        { value: '5 mm EN 1036', label: 'Kupferfreies Kristallspiegelglas (>720 Std. Salzsprühtest)' },
        { value: 'CRI ≥ 90 · IP44/54', label: 'Stufenlos 2700K–6500K & gekapselte Bad-Treiber' },
        { value: '10 / 50–100 Stk.', label: 'Testorder ab 10 Stk. Lagerware; OEM 50–100 Stk.' },
        { value: '7–12 / 25–35 Tage', label: 'Musterbau und Serie im ISTA-3A-Exportkarton' },
      ],
      section: {
        heading: 'Optische Auslegung, Feuchtraumschutz IP44/IP54 und 100-%-Stückprüfung',
        paragraphs: [
          'In unserem 46.800 m² großen Stammwerk in Jiaxing (6 Linien seit 2005) verbinden wir 5 mm kupferfreies Silberspiegelglas in Automobilqualität (<0,1 % Kupfer, bleifreier Epoxid-Rückseitenlack nach EN 1036) mit hochdichten SMD-2835-LED-Bändern (120–240 LEDs/m), CRI ≥ 90 (optional ≥ 95), engem Farbbinning SDCM ≤ 3 und über 50.000 Betriebsstunden.',
        ],
        bullets: [
          '18–35 mm präzisionsgesandstrahlte Lichtfelder, silikonummantelte IP65-LED-Kanäle und abgedichtete IP44/IP54-Treiberboxen',
          'Marktkonforme Elektrik für 220–240V (CE EN 60598, CB, UKCA, SAA, RoHS) oder 110–120V (UL 962 / ETL / FCC)',
          '100 % Hochspannungs-Durchschlagprüfung, Schutzleiterkontrolle und mindestens 2 Stunden Volllast-Dauerlauftest',
          'Bestehende Katalogmodelle ab 10 Stk. zur Probe, OEM-Serien ab 50–100 Stk.; 3 Jahre Elektronik- und 2 Jahre Strukturgarantie',
        ],
      },
    },
    'custom-mirror-manufacturer': {
      proofPoints: [
        { value: '±1,0 mm CNC', label: 'Zuschnitt, Kantenpolitur & 10–25 mm Facettenschliff' },
        { value: '6063-T5 & Holz', label: '200+ Werksprofile, Edelstahl 304 & feuchtefestes Holz' },
        { value: '24–48 Std. Prüfung', label: 'Muster nach DWG/DXF-Zeichnung in 7–12 Tagen' },
        { value: '10 / 50–100 / 200+', label: 'Lager 10 Stk., Profilbau 50–100, neues Werkzeug 200+' },
      ],
      section: {
        heading: 'Eigenfertigung nach CAD-Zeichnung, Profilrahmen und Musterbau',
        paragraphs: [
          'Statt auf Standardgehäuse begrenzt zu sein, fertigen wir Spiegelglas, gelaserte Lichtkanäle, 1,2–1,5 mm starke 6063-T5-Aluminiumprofile, gebürsteten Edelstahl 304 und versiegelte Holzrahmen im eigenen Haus. Auf Basis Ihrer DWG/DXF/PDF-Daten oder RAL-/Pantone-Vorgaben prüfen wir binnen 24–48 Stunden Statik, punktlichtfreie PMMA-Diffusoren und Schutzabstände.',
        ],
        bullets: [
          'Sonderformate von 400×600 mm bis 1800×900 mm mit flachpolierter Kante, Rundkante oder 10–25 mm Facette',
          'Oberflächen in Messing gebürstet, Champagnerbronze, Mattschwarz, Gunmetal, Weiß sowie Echtholz-Ausführungen',
          'Nutzung unserer 200+ vorhandenen Strangpressprofile spart Werkzeugkosten (MOQ 50–100 Stk.); eigene Matrizen ab 200+ Stk.',
          '5-lagige BC-Welle-Versandkartons mit 30-mm-Eckblöcken für den Paketversand oder objektbezogene Palettierung',
        ],
      },
    },
    'hotel-bathroom-mirrors': {
      proofPoints: [
        { value: 'CRI ≥ 90–95', label: 'Schmeichelndes 2700K–4000K Hotellicht für Gästezimmer' },
        { value: 'Festanschluss', label: 'Kompatibel mit Keycard-Hauptschalter & Memory-Funktion' },
        { value: 'Musterzimmer 7–12 T.', label: 'Freigabemuster nach FF&E-Plan (ab 50 Stk./Zimmertyp)' },
        { value: 'Etagen-Etiketten', label: 'Begasungsfreie Paletten & 1–2 % Ersatzteilpaket' },
      ],
      section: {
        heading: 'Hotel-FF&E-Spezifikation, Musterzimmerfreigabe und etagenweise Anlieferung',
        paragraphs: [
          'Im Hotelbau entscheiden blendfreie Gesichtswiedergabe, diebstahlsichere Wandmontage und fleckenfreie Kanten im feuchten Dauerbetrieb. Wir kombinieren korrosionsfestes Spiegelglas und CAT-II-Sicherheitsfolie mit einheitlich selektierten 2700K-, 3000K- oder 4000K-LEDs für Standardzimmer, Suiten und barrierefreie Bäder – vorab getestet im Musterzimmer.',
        ],
        bullets: [
          'Direkter Festanschluss an Raumschalter oder 0–10V-/TRIAC-Wanddimmer mit Zustandsspeicher nach Stromtrennung',
          'Verdeckte Z-Profil-Sicherheitsaufhängung und abnehmbare Service-Trägerplatte für schnellen Treiberwechsel im Betrieb',
          'Abgestimmte Komplettlieferung aus Waschtischspiegeln, Ankleide-Ganzkörperspiegeln und Spiegelschränken',
          'Karton- und Palettenstempel nach FF&E-Position, Gebäudeflügel, Etage und Zimmertyp inklusive 1–2 % Reservetreibern',
        ],
      },
    },
    'commercial-bathroom-mirrors': {
      proofPoints: [
        { value: '130 μm CAT-II-Folie', label: 'Bindet Glassplitter zuverlässig bei Stoßbelastung' },
        { value: 'Wartungsarme Elektrik', label: '100–240V Festanschluss ohne anfällige Touch-Menüs' },
        { value: '10 / 50–100 Stk.', label: 'Kleinlose ab 10 Stk.; Ausschreibungen 50–100 Stk./Typ' },
        { value: 'Bauabschnitts-Abruf', label: 'Fixierte Stückliste & einheitliche Bohrschablonen' },
      ],
      section: {
        heading: 'Splitterschutz, robuste Objekttechnik und transparente Wertanalyse',
        paragraphs: [
          'Öffentliche Sanitärräume, Bürokerne, Studentenwohnheime und Mietwohnanlagen erfordern langlebige Beschläge und verlässliche Bruchsicherung. Unsere Objektspiegel erhalten eine 130-Mikrometer-PE-Folie nach CAT II, verzinkte Schwerlast-Z-Schienen sowie vereinfachte LED-Festanschlüsse (oder stromlose Ausführungen) für jahrzehntelangen Betrieb.',
        ],
        bullets: [
          '5 mm korrosionsbeständiges Glas (für kostenoptimierte gerahmte Wohnbauserien auch in 4 mm ausführbar)',
          'Reduzierte Objekt-LED-Module in 3000K/4000K/6000K (>50.000 Std.) oder unbeleuchtete Waschtischspiegel',
          'Offene Aufschlüsselung der Kostentreiber (Glasstärke, Rahmenprofil, Normensatz, Verpackung) für präzise Kalkulation',
          'Einheitliche Montage-Bohrschablonen für zügigen Etagenausbau sowie 3 Jahre Elektronik- / 2 Jahre Strukturgarantie',
        ],
      },
    },
    'led-mirror-cabinet-manufacturer': {
      proofPoints: [
        { value: '110° 304-Scharniere', label: 'Soft-Close-Edelstahldämpfer (30.000 Öffnungszyklen)' },
        { value: '6–8 mm ESG-Böden', label: 'Verstellbare Fachböden mit 10–15 kg Tragkraft' },
        { value: '10 / 30–50 Stk.', label: 'Lagermodelle ab 10 Stk.; OEM-Schränke 30–50 Stk.' },
        { value: '14–32 kg Schwerlast', label: 'Fixierte Fachböden, Wabenplatten & 35 mm EPE-Formteile' },
      ],
      section: {
        heading: 'Spiegelschrank-Mechanik, gekapselte Türverkabelung und Transportschutz',
        paragraphs: [
          'Beleuchtete Spiegelschränke stellen deutlich höhere Anforderungen an Statik und Kabelführung als flache Wandspiegel. Wir fertigen Aufputz- und Unterputzkorpusse (typische Breiten 500–1200 mm, Tiefen 120–150 mm) aus eloxiertem Aluminium oder feuchteresistenten E1-Platten, doppelseitigen Spiegeltüren und flexiblen 12V/24V-Niedervolt-Leitungen getrennt vom IP44-Netzteilraum.',
        ],
        bullets: [
          'Ein- bis dreitürige Varianten mit Türkontakt-Innenbeleuchtung, integrierter Rasiersteckdose und Dual-USB-A/C-Ports',
          'Verdeckte Tür-Korpus-Leitungen und 110°-Soft-Close-Scharniere dauergetestet auf über 30.000 Bewegungszyklen',
          'Verpackung für 14–32 kg Stückgewicht: arretierte Glasböden, 35 mm Form-EPE, Wabenschutzplatten und 5-Lagen-Karton',
          'Musterbau für Spiegelschränke in 10–14 Tagen; Testorders ab 10 Stk. Lagerware, OEM-Sondergrößen ab 30–50 Stk.',
        ],
      },
    },
    'oem-odm-mirror-manufacturing': {
      proofPoints: [
        { value: 'ISO 9001 · BOM-Lock', label: 'Freigegebenes Goldmuster ohne verdeckten Bauteilwechsel' },
        { value: '200+ ODM-Plattformen', label: 'Werkzeugfreier Markenstart oder Exklusiv-Tooling (NDA)' },
        { value: 'AQL 1,5 / 2,5', label: 'Dokumentierte Warenausgangsprüfung je Bestellnummer' },
        { value: '60 / 120 km Häfen', label: 'Direktanbindung Hafen Shanghai (60 km) & Ningbo (~120 km)' },
      ],
      section: {
        heading: 'Eigenmarken-Governance, Stücklistenkontrolle und Handels-Compliance',
        paragraphs: [
          'Sanitärmarken und Handelsketten verlangen absolute Wiederholgenauigkeit über alle Nachbestellungen. Bei OEM-Programmen frieren wir Goldmuster und Stückliste (BOM) verbindlich ein; bei ODM-Serien nutzen Marken über 200 erprobte Basisplattformen und individualisieren Maße, Touch-Symbole und Verkaufsverpackung ohne Werkzeugkosten in 7–12 Tagen.',
        ],
        bullets: [
          'Lasergravierte Front- oder Hinterleuchtungslogos, serialisierte Typenschilder und mehrsprachige Montagehandbücher',
          'Modellbezogene Zusammenstellung von CE-EN-60598-, CB-, UKCA-, UL-962-, SAA-, EMV- und RoHS-Nachweisen',
          'Farbig kaschierte Retail-Kartons oder braune ISTA-3A-Versandverpackungen mit EAN-, UPC- oder FNSKU-Etiketten',
          'Einstieg ab 10 Stk. bei Lagerplattformen, 50–100 Stk. ODM-Anpassung und 200+ Stk. Exklusivwerkzeug (FOB/CIF/DDP)',
        ],
      },
    },
    'led-mirror-wholesale-supplier': {
      proofPoints: [
        { value: '20GP / 40HQ Mix', label: '4–8 SKUs je Container (350–550 bzw. 850–1.300 Stk.)' },
        { value: '10 / 50 Stk. je SKU', label: 'LCL-Test ab 10 Stk. Lagerware; Mischcontainer 50 Stk./SKU' },
        { value: 'Gleichteile-System', label: 'Einheitliche Treiber- und Sensorfamilien im Sortiment' },
        { value: 'FOB / EXW Staffeln', label: 'Klare Mengenpreise für 10, 50, 200 und 500+ Einheiten' },
      ],
      section: {
        heading: 'Mischcontainer-Konsolidierung und wirtschaftliche Großhandelssortimente',
        paragraphs: [
          'Erfolgreiche Fachhandelsprogramme verbinden Sortimentsbreite mit schnellem Lagerumschlag. Statt Kapital in einen einzelnen Artikel zu binden, kombinieren Importeure 4 bis 8 abgestufte Modelle in einem 20GP- oder 40HQ-Container – vom rahmenlosen Basismodell über schwarze und messingfarbene Alurahmen bis zu Bluetooth- und Schrank-Topsellern.',
        ],
        bullets: [
          'CBM-Laderaumoptimierung für gängige Absatzgrößen von 600×800 mm bis 1200×800 mm im Vollcontainer oder Beiladung',
          'Ab Werk aufgebrachte EAN-/UPC-Barcodes, Gewichtsangaben sowie Wahl zwischen Paket-Einzelkarton und Showroom-Palette',
          'Transparente Werksstaffeln getrennt nach CE/SAA- und UL/ETL-Ausführung zur genauen Kalkulation der Kubikmeter-Marge',
          'Lieferung in 25–35 Tagen inklusive 1–2 % einheitlicher Ersatz-Elektroniksets sowie 3 Jahren LED- / 2 Jahren Strukturgarantie',
        ],
      },
    },
    'custom-size-led-mirrors': {
      proofPoints: [
        { value: '400–2000+ mm', label: 'Millimeter- oder Zollmaße (16"–78"+, ±1,0 mm CNC)' },
        { value: '36W–96W skaliert', label: '24V-Zweifacheinspeisung & Heizfläche nach Maß angepasst' },
        { value: 'Ohne Formkosten', label: 'Rahmenlos & Alurahmen ab 50–100 Stk. (10 Stk. Standard)' },
        { value: 'Versteifung >1200 mm', label: 'Verstärkter Alu-Unterrahmen & Anti-Flex-Schutzkiste' },
      ],
      section: {
        heading: 'Proportionale 24V-Lichtskalierung und Verwindungssteifigkeit bis 2.000 mm',
        paragraphs: [
          'Doppelwaschtische und Wandnischen verlangen Zwischenmaße wie 1400×750 mm oder 1650×850 mm mit exakt positioniertem Kabelauslass. Statt unterdimensionierte Bauteile zu strecken, berechnen wir für jede Zielgröße LED-Bandlänge mit 24V-Doppelspeisung, Treiberleistung (36W–96W) und Heizflächen-Abdeckung neu – ganz ohne Helligkeitsabfall in der Mitte.',
        ],
        bullets: [
          'Frei wählbare Eckradien (R5–R50 mm), Kapsel- oder Bogenproportionen sowie waagerechte/senkrechte Aufhängung',
          'Ab 1.200 mm Breite serienmäßig verstärkter Aluminium-Rückrahmen und doppelte Schwerlast-Z-Aufhängeschienen',
          'Werkzeugfreie Maßanpassung auf rahmenlosen und auf Gehrung geschweißten 6063-T5-Rahmen mit 7–12 Tagen Musterzeit',
          '30–40 mm umlaufende Schaumstoffkanäle, Wabenplatten und Sperrholzkisten schützen Überbreiten gegen Transporttorsion',
        ],
      },
    },
    'irregular-shaped-mirror-manufacturer': {
      proofPoints: [
        { value: 'DXF/AI-Vektorschnitt', label: 'CNC-Konturfräsung & ausbruchfreie Diamantpolitur' },
        { value: 'Flex-COB / 2835', label: 'Gleichmäßiges Lichthalo selbst in engen Kurvenradien' },
        { value: '4-Wege-Aufhängung', label: 'Schwerpunktgeprüfte Halter für variable Ausrichtung' },
        { value: 'Kontur-EPE-Einlage', label: 'Stanzgeformte 25–35 mm Polster exakt nach Umriss' },
      ],
      section: {
        heading: 'CNC-Freiformbearbeitung, Kurvenausleuchtung und Konturschaum-Verpackung',
        paragraphs: [
          'Organische Kiesel-, Wolken-, Wellen-, Halbmond- und asymmetrische Designspiegel leben von makelloser Kantenführung und sauberer Wandbalance. Wir programmieren CNC-Schneidtische direkt aus DXF/DWG/AI-Kurven, prüfen Mindest-Innenradien vor dem automatischen Diamantpolieren und fertigen optional rollgebogene Aluminium- oder gefräste Holzrahmen.',
        ],
        bullets: [
          'Hochdichte flexible 24V-COB- oder 2835-LED-Bänder im konstanten Randabstand vermeiden dunkle Zonen in Spitzen',
          'Auf den realen Massenschwerpunkt abgestimmte Vier-Richtungs-Schlüssellochbeschläge (hoch, quer oder gedreht montierbar)',
          'Maßgestanzte 25–35 mm EPE-Schaumkavitäten schützen überstehende Rundungen zuverlässiger als rechteckige Eckpolster',
          'Vorhandene organische Formen ab 10 Stk. testbar, Exklusivkonturen ab 50–100 Stk. (3 J. LED- / 2 J. Glas- & Rahmengarantie)',
        ],
      },
    },
    'smart-bluetooth-mirror-manufacturer': {
      proofPoints: [
        { value: 'Bluetooth 5.0/5.3', label: '10 m Reichweite & kundenspezifischer OEM-Kopplungsname' },
        { value: '2×3W gekapselt', label: 'Schwingungsgedämpfte Stereo-Rücklautsprecher fürs Bad' },
        { value: 'CE RED / FCC / UL', label: 'Leuchtensicherheit plus Funk- und EMV-Konformität' },
        { value: '100-%-Audioprüfung', label: 'Einzeltest von Kopplung, Frequenzgang & Touch-Sensorik' },
      ],
      section: {
        heading: 'Feuchtraum-Akustik, EMV-Abschirmung und vernetzte OEM-Steuerung',
        paragraphs: [
          'Funk-Audio und Digitalanzeigen im Badezimmer verlangen akustische Entkopplung, EMV-Schirmung und intuitive Bedienung. Wir verbauen Bluetooth-5.0/5.3-Module (mit programmierbarer OEM-Gerätekennung) samt zweier 2×3W-gedämpfter Feuchtraum-Schallwandler, entspiegelter 12/24-Std.-Uhr-/Temperaturanzeige sowie optionalem 3x/5x-Kosmetikspiegel.',
        ],
        bullets: [
          'Getrennt abgedichtete IP44-Gehäuse für Netzteil, Audio-Endstufe und kapazitive Touch- oder Bewegungsmelder-Steuerung',
          'Zielmarktgerechte Auslegung nach CE LVD/EMV/RED, UKCA und SAA (220–240V) oder UL 962 / ETL + FCC (110–120V)',
          'Kundenspezifische Touch-Symbole, Standby-Helligkeit und Anleitungen ab 50–100 Stk. (Katalogmodelle ab 10 Stk.)',
          '100 % Endprüfung von Bluetooth-Kopplung, Tonwiedergabe, Sensorreaktion und Hochspannung mit 3 Jahren Elektronikgarantie',
        ],
      },
    },
    'anti-fog-led-mirror-manufacturer': {
      proofPoints: [
        { value: '150–250 W/m²', label: 'Doppelt isolierte UL/TÜV/CE-PET-Spiegelheizmatte' },
        { value: 'Klar in 3–5 Min.', label: 'Sanfte Erwärmung (+12 °C bis +18 °C) ohne Hitzeschock' },
        { value: '60-Min.-Abschaltung', label: 'Separater Heizungstaster nach EU-Ökodesign-Anforderung' },
        { value: '30–55 % Sichtfeld', label: 'Heizmatten 200×300 bis 400×600 mm+ bemaßt im Plan' },
      ],
      section: {
        heading: 'Thermische Flächenleistung, Delaminationsschutz und Zeitschalt-Steuerung',
        paragraphs: [
          'Eine zu kleine Heizfolie lässt den Spiegel beschlagen, während Überhitzung die Versilberung angreift. Unsere doppelt isolierten PET-Spiegelheizmatten (150–250 W/m²) werden mit temperaturfestem Acrylatkleber blasenfrei aufgebracht und erhöhen die zentrale Spiegelfläche in 3 bis 5 Minuten schonend um +12 °C bis +18 °C.',
        ],
        bullets: [
          'Modellbezogene Mattenformate (200×300 mm bis über 400×600 mm) mit dokumentiertem Abstand zu Lichtfeldern und Beschlägen',
          'Unabhängiger Antibeschlag-Taster mit 60-Minuten-Abschaltautomatik zur Energieeinsparung oder Kopplung an den Wandschalter',
          '100 % dielektrische Hochspannungsprüfung und thermische Aufheizkontrolle während des 2-Stunden-Werkslaufs',
          'Katalog-Heizspiegel ab 10 Stk. testbar, kundenspezifische Heizflächen ab 50–100 Stk. mit 3 Jahren Elektronikgarantie',
        ],
      },
    },
    'full-length-mirror-manufacturer': {
      proofPoints: [
        { value: '1500–2000 mm', label: 'Verzerrungsfreies Floatglas + 130 μm CAT-II-Schutzfolie' },
        { value: '3-in-1-Aufstellung', label: 'Klappständer, Wand-Z-Schiene & Kipp-Sicherungsband' },
        { value: 'Anti-Flex-Karton', label: 'Vollflächige Wabenplatte & 35 mm EPE-Kantenschutz' },
        { value: '10 / 50 Stk.', label: 'Lagermodelle ab 10 Stk.; Sondergrößen & Farben ab 50 Stk.' },
      ],
      section: {
        heading: 'Optische Planheit in Überlänge, 3-in-1-Standmechanik und Biegeschutz-Verpackung',
        paragraphs: [
          'Bei 1.500 bis 2.000 mm Bauhöhe werden kleinste Glaswellen oder schwache Eckverbindungen sofort sichtbar. Wir selektieren optisch planes 4- oder 5-mm-Float-Silberglas mit obligatorischer 130-μm-CAT-II-Splitterschutzfolie und fassen es in verwindungssteife 1,2–1,5-mm-Alurahmen (6063-T5), pulverbeschichteten Stahl oder kammergetrocknetes Holz.',
        ],
        bullets: [
          'Bogen-, Rechteck-, Rundkanten- und Kapselformen in 1500×400, 1600×500, 1650×600 und 1800×800 mm Standard- und Sondermaß',
          'Wahlweise mit ausklappbarem U-Standbügel (Rutschstopper & Sicherheitskette), Anlehn-Kippsicherung oder Wandaufhängung',
          'Doppelwellige 5-Lagen-Pakete mit vollflächiger Wabenversteifung für den Paketversand oder stehende A-Rahmen-Paletten',
          'Optional mit umlaufender CRI-≥-90-LED-Beleuchtung (3 Jahre Elektronikgarantie); 2 Jahre Garantie auf Glas, Folie, Standfuß & Rahmen',
        ],
      },
    },
  },
  it: {
    'led-bathroom-mirror-manufacturer': {
      proofPoints: [
        { value: '5 mm EN 1036', label: 'Vetro argentato senza rame (>720 h nebbia salina)' },
        { value: 'CRI ≥ 90 · IP44/54', label: 'CCT continuo 2700K–6500K e driver stagni da bagno' },
        { value: '10 / 50–100 pz', label: 'Pilota da 10 pz a catalogo; OEM su misura 50–100 pz' },
        { value: '7–12 / 25–35 gg', label: 'Campionatura e serie in cartoni export ISTA-3A' },
      ],
      section: {
        heading: 'Architettura ottica, protezione zone umide IP44/IP54 e collaudo in linea',
        paragraphs: [
          'Nel nostro stabilimento integrato di 46.800 m² a Jiaxing (6 linee attive dal 2005) abbiniamo vetro specchio senza rame da 5 mm di grado automotive (<0,1 % rame, vernice epossidica priva di piombo EN 1036) a strisce SMD 2835 da 120–240 LED/m con CRI ≥ 90 (opzione ≥ 95), tolleranza colore SDCM ≤ 3 e vita utile oltre 50.000 ore.',
        ],
        bullets: [
          'Fasce sabbiate di precisione da 18–35 mm, canali LED inguainati IP65 e scatole alimentatore stagne IP44/IP54',
          'Configurazioni 220–240V (CE EN 60598, CB, UKCA, SAA, RoHS) o 110–120V (UL 962 / ETL / FCC) per area di destinazione',
          'Collaudo dielettrico hi-pot al 100 %, verifica continuità di terra e 2 ore di burn-in a pieno carico prima dell’imballo',
          'Ordini di prova da 10 pz su modelli a catalogo e produzioni OEM da 50–100 pz; garanzia 3 anni elettronica e 2 anni struttura',
        ],
      },
    },
    'custom-mirror-manufacturer': {
      proofPoints: [
        { value: '±1,0 mm CNC', label: 'Taglio sagomato, filo lucido e bisello 10–25 mm' },
        { value: 'Alluminio 6063-T5', label: '200+ profili propri, acciaio 304 e legno trattato' },
        { value: 'Revisione 24–48 h', label: 'Prototipo fisico da disegno DWG/DXF in 7–12 giorni' },
        { value: '10 / 50–100 / 200+', label: 'Catalogo 10 pz, profili 50–100, nuova matrice 200+' },
      ],
      section: {
        heading: 'Lavorazione interna da disegno CAD, estrusi su misura e prototipazione',
        paragraphs: [
          'A differenza dei rivenditori vincolati a scocche standard, realizziamo internamente taglio vetro, canali laser, cornici in alluminio estruso 6063-T5 (parete 1,2–1,5 mm), inox 304 e legno sigillato anti-umidità. Entro 24–48 ore dai file DWG/DXF/PDF o codici RAL/Pantone verifichiamo rigidezza, diffusori PMMA privi di punti luce e distanze elettriche.',
        ],
        bullets: [
          'Dimensioni su progetto da 400×600 mm fino a lastre architettoniche 1800×900 mm con bordo lucido o bisellato',
          'Finiture anodizzate e verniciate: ottone spazzolato, bronzo champagne, nero opaco, canna di fucile, bianco e legno',
          'Adattare i nostri 200+ profili azzera i costi di attrezzatura (MOQ 50–100 pz); nuove matrici dedicate da 200+ pz',
          'Imballo 5 onde BC-flute con paraspigoli 30 mm per spedizioni singole o bancali etichettati per consegne contract',
        ],
      },
    },
    'hotel-bathroom-mirrors': {
      proofPoints: [
        { value: 'CRI ≥ 90–95', label: 'Luce calda/neutra 2700K–4000K per camere e suite' },
        { value: 'Cablaggio diretto', label: 'Compatibile con tasca badge master e memoria luce' },
        { value: 'Camera campione', label: 'Mock-up su abachi FF&E in 7–12 gg (50 pz/tipologia)' },
        { value: 'Pallet per piano', label: 'Stampa codice camera/ala + 1 %–2 % ricambi inclusi' },
      ],
      section: {
        heading: 'Capitolati FF&E alberghieri, camera campione e logistica per piano',
        paragraphs: [
          'Le strutture ricettive richiedono resa incarnato naturale senza abbagliamento, fissaggi antifurto e resistenza alla corrosione da pulizie frequenti. Uniamo specchio senza rame con pellicola CAT II e strisce LED selezionate a 2700K, 3000K o 4000K per camere standard, suite e bagni accessibili, validati con mock-up fisico in 7–12 giorni.',
        ],
        bullets: [
          'Collegamento diretto a interruttore generale o dimmer a parete 0–10V / TRIAC con ripristino dell’ultima impostazione',
          'Staffe a Z nascoste antimanomissione e piastra posteriore ispezionabile per sostituire il driver in manutenzione rapida',
          'Fornitura coordinata in un unico ordine di specchi lavabo, figura intera per camera e armadietti illuminati',
          'Etichettatura di scatole e pallet in compensato senza fumigazione per codice FF&E, edificio, piano e lotto + 1 %–2 % ricambi',
        ],
      },
    },
    'commercial-bathroom-mirrors': {
      proofPoints: [
        { value: 'Film CAT II 130 μm', label: 'Trattiene i frammenti in caso di urto in spazi pubblici' },
        { value: 'Comando semplificato', label: 'LED 100–240V cablato diretto senza menu touch fragili' },
        { value: '10 / 50–100 pz', label: 'Lotti ridotti da 10 pz; gare multiunità 50–100 pz/tipo' },
        { value: 'Consegne a fasi', label: 'Distinta bloccata e dime di foratura standardizzate' },
      ],
      section: {
        heading: 'Sicurezza antisfondamento per spazi ad alto traffico e value engineering',
        paragraphs: [
          'Uffici, studentati, residenze in affitto e camerini commerciali esigono manutenzione minima e contenimento della rottura. Dotiamo gli specchi contract di pellicola PE CAT II da 130 micron, barre a Z in acciaio zincato ad alta portata e moduli LED cablati essenziali (oppure versioni senza illuminazione) pensati per cicli intensivi.',
        ],
        bullets: [
          'Vetro anticorrosione da 5 mm (alternativa incorniciata da 4 mm per lotti residenziali con vincoli di budget)',
          'Moduli LED fissi 3000K/4000K/6000K (>50.000 h) oppure specchi privi di parte elettrica con garanzia strutturale 2 anni',
          'Preventivo analitico per spessore vetro, profilo cornice, pacchetto certificazioni e imballo per bilanciare i capitolati',
          'Dime di foratura uniformi per posa rapida multi-piano e spedizioni programmate in 25–35 giorni per avanzamento cantiere',
        ],
      },
    },
    'led-mirror-cabinet-manufacturer': {
      proofPoints: [
        { value: 'Cerniere 110° 304', label: 'Chiusura rallentata inox testata oltre 30.000 cicli' },
        { value: 'Ripiani 6–8 mm', label: 'Vetro temperato regolabile con portata 10–15 kg' },
        { value: '10 / 30–50 pz', label: 'Pilota 10 pz da catalogo; armadietti OEM 30–50 pz' },
        { value: 'Imballo 14–32 kg', label: 'Fermi ripiani, pannelli alveolari ed EPE 35 mm sagomato' },
      ],
      section: {
        heading: 'Meccanica dei pensili illuminati, passacavo anta e imballaggio pesante',
        paragraphs: [
          'Un armadietto a specchio LED sostiene carichi meccanici e cablaggi mobili ben più complessi di uno specchio piano. Produciamo casse da parete o ad incasso (larghezze 500–1200 mm, profondità 120–150 mm) in alluminio anodizzato antiruggine o pannello E1 idrofugo, ante bifacciali a specchio e guaine flessibili 12V/24V separate dal vano rete IP44.',
        ],
        bullets: [
          'Versioni a 1, 2 o 3 ante con luce interna a sensore anta, presa rasoio integrata e doppia porta USB-A/C opzionale',
          'Condotti porta-cassa e cerniere ammortizzate 110° in acciaio 304 collaudati su oltre 30.000 aperture',
          'Protezione studiata per 14–32 kg: blocchi interni per ripiani, fogli a nido d’ape, schiuma 35 mm e cartone 5 onde',
          'Campionatura tecnica in 10–14 giorni; ordini pilota da 10 pz a catalogo e produzioni OEM da 30–50 pz per misura',
        ],
      },
    },
    'oem-odm-mirror-manufacturing': {
      proofPoints: [
        { value: 'ISO 9001 · BOM fisso', label: 'Golden sample vincolante senza sostituzioni occulte' },
        { value: '200+ basi ODM', label: 'Avvio senza costi stampo o attrezzature esclusive NDA' },
        { value: 'Collaudo AQL 1.5/2.5', label: 'Report dimensionali e foto archiviati per numero ordine' },
        { value: 'Porti 60 / 120 km', label: 'Logistica diretta da Shanghai (60 km) e Ningbo (~120 km)' },
      ],
      section: {
        heading: 'Governance private label, blocco distinta BOM e fascicoli di conformità',
        paragraphs: [
          'I marchi arredo bagno e le catene retail esigono coerenza totale sui riordini. Nei programmi OEM congeliamo il Golden Sample e la distinta base (BOM); nei percorsi ODM partiamo da oltre 200 piattaforme collaudate personalizzando misure, icone serigrafate e scatole retail senza costi di stampo con prototipo in 7–12 giorni.',
        ],
        bullets: [
          'Incisione laser del logo frontale o retroilluminato, targhette dati serializzate e manuali d’uso multilingua',
          'Fascicoli tecnici verificati per modello su CE EN 60598, CB, UKCA, UL 962, SAA, compatibilità EMC e RoHS',
          'Scatole retail litografate a colori oppure cartoni e-commerce ISTA-3A completi di etichette EAN, UPC o FNSKU',
          'Test da 10 pz su modelli a stock, adattamenti ODM da 50–100 pz e stampi dedicati da 200+ pz (FOB/CIF/DDP)',
        ],
      },
    },
    'led-mirror-wholesale-supplier': {
      proofPoints: [
        { value: '20GP / 40HQ misto', label: '4–8 referenze per container (350–550 o 850–1.300 pz)' },
        { value: '10 / 50 pz per SKU', label: 'Test LCL da 10 pz catalogo; carico misto 50 pz/modello' },
        { value: 'Ricambi unificati', label: 'Stessa famiglia di driver e sensori su tutta la gamma' },
        { value: 'Listini FOB / EXW', label: 'Scaglioni trasparenti per 10, 50, 200 e 500+ pezzi' },
      ],
      section: {
        heading: 'Consolidamento container misti ed efficienza dell’assortimento wholesale',
        paragraphs: [
          'Un listino distributivo efficace bilancia rotazione e varietà senza immobilizzare capitale su un unico codice. Affianchiamo gli importatori nel combinare 4–8 modelli complementari per container 20GP o 40HQ — dai modelli base senza cornice alle serie con telaio nero/oro fino a Bluetooth e pensili — condividendo l’elettronica di ricambio.',
        ],
        bullets: [
          'Ottimizzazione del volume utile (CBM) sui formati ad alta rotazione da 600×800 mm a 1200×800 mm in FCL o LCL',
          'Codici a barre EAN/UPC e pesi applicati in fabbrica su cartoni singoli per corriere o pallet filmati per showroom',
          'Quotazioni dirette distinte tra standard CE/SAA e UL/ETL per calcolare il margine reso al metro cubo senza intermediari',
          'Consegne in 25–35 giorni con 1 %–2 % di kit elettrici di riserva e garanzia unificata 3 anni LED / 2 anni struttura',
        ],
      },
    },
    'custom-size-led-mirrors': {
      proofPoints: [
        { value: '400–2000+ mm', label: 'Taglio al millimetro o in pollici (16"–78"+, ±1,0 mm)' },
        { value: '36W–96W scalato', label: 'Doppia alimentazione 24V e area termica ricalcolate' },
        { value: 'Senza costi stampo', label: 'Ridimensionamento da 50–100 pz (10 pz formati stock)' },
        { value: 'Rinforzo >1200 mm', label: 'Sottotelaio in alluminio e casse antiflessione' },
      ],
      section: {
        heading: 'Ricalcolo potenza LED 24V e rigidità strutturale fino a 2.000 mm',
        paragraphs: [
          'I mobili doppio lavabo e le nicchie a parete richiedono dimensioni fuori catalogo (come 1400×750 mm, 1650×850 mm o 72"×36") allineate alla scatola elettrica esistente. Anziché forzare un alimentatore sottodimensionato, ricalcoliamo striscia LED 24V a doppia iniezione, potenza driver (36W–96W) e pellicola antiappannamento per luce uniforme.',
        ],
        bullets: [
          'Raggi d’angolo su richiesta (R5–R50 mm), proporzioni a capsula o ad arco e coordinate esatte di uscita cavo',
          'Oltre i 1.200 mm di larghezza integriamo sottotelaio posteriore in alluminio rinforzato e doppia barra Z ad alta portata',
          'Modelli senza cornice e telai 6063-T5 giuntati ridimensionabili senza stampo, con campione confermato in 7–12 giorni',
          'Canali perimetrali in schiuma 30–40 mm, pannelli a nido d’ape e casse in compensato contro le flessioni di trasporto',
        ],
      },
    },
    'irregular-shaped-mirror-manufacturer': {
      proofPoints: [
        { value: 'Sagoma DXF / AI', label: 'Taglio CNC curvilineo e lucidatura diamantata netta' },
        { value: 'Halo COB / 2835', label: 'Striscia flessibile omogenea anche su curve strette' },
        { value: 'Posa 4 orientamenti', label: 'Ganci posizionati sul baricentro reale della forma' },
        { value: 'EPE fustellato', label: 'Sede in schiuma 25–35 mm ritagliata su ogni profilo' },
      ],
      section: {
        heading: 'Sagomatura CNC di curve organiche, halo continuo e imballo a profilo',
        paragraphs: [
          'Le forme a ciottolo, nuvola, onda, mezzaluna e asimmetriche dipendono da una molatura perfetta e dall’equilibrio di sospensione. Programmiamo i banchi CNC direttamente da tracciati vettoriali DXF/DWG/AI verificando i raggi minimi prima della lucidatura diamantata, con opzioni di cornice in alluminio calandrato o legno fresato.',
        ],
        bullets: [
          'LED flessibili 24V ad alta densità posati a distanza costante dal bordo per un alone posteriore privo di zone d’ombra',
          'Attacchi multiposizione verificati in 4 orientamenti (verticale, orizzontale o invertito) rispetto al centro di gravità',
          'Sagomatura dedicata di sedi EPE da 25–35 mm per proteggere i lobi sporgenti meglio dei paraspigoli rettangolari',
          'Sagome organiche a catalogo da 10 pz e contorni esclusivi da 50–100 pz (garanzia 3 anni LED / 2 anni non LED)',
        ],
      },
    },
    'smart-bluetooth-mirror-manufacturer': {
      proofPoints: [
        { value: 'Bluetooth 5.0/5.3', label: 'Portata 10 m con nome di abbinamento OEM dedicato' },
        { value: 'Stereo 2×3W stagno', label: 'Trasduttori posteriori smorzati privi di risonanze' },
        { value: 'CE RED / FCC / UL', label: 'Conformità congiunta apparecchio luce e radiofrequenza' },
        { value: 'Test audio 100 %', label: 'Verifica singola di pairing, sweep acustico e touch' },
      ],
      section: {
        heading: 'Isolamento acustico da bagno, interfaccia touch OEM e conformità RED/FCC',
        paragraphs: [
          'Integrare audio wireless e display digitali in ambiente umido richiede disaccoppiamento acustico, schermatura EMI e comandi chiari. Abbiniamo moduli Bluetooth 5.0/5.3 (con ID broadcast personalizzabile) a due speaker posteriori stagni 2×3W smorzati, orologio/temperatura 12/24 h (°C/°F) inciso al laser e lente 3x/5x opzionale.',
        ],
        bullets: [
          'Custodie IP44 separate per alimentatore, modulo audio e scheda capacitiva o luce notturna a sensore di movimento',
          'Pacchetti conformi a CE LVD/EMC/RED, UKCA e SAA (220–240V) oppure UL 962 / ETL + FCC (110–120V)',
          'Personalizzazione di icone serigrafate, luminosità standby e manuali da 50–100 pz (pilota 10 pz su modelli a stock)',
          'Collaudo unitario al 100 % di connessione Bluetooth, risposta touch, sweep sonoro e burn-in con garanzia elettronica 3 anni',
        ],
      },
    },
    'anti-fog-led-mirror-manufacturer': {
      proofPoints: [
        { value: '150–250 W/m²', label: 'Pellicola PET a doppio isolamento certificata UL/TUV/CE' },
        { value: 'Libero in 3–5 min', label: 'Riscaldamento mirato (+12 °C / +18 °C) senza shock termico' },
        { value: 'Spegnimento 60 min', label: 'Tasto antiappannamento dedicato a risparmio energetico' },
        { value: 'Area 30 %–55 %', label: 'Tappetini da 200×300 a 400×600 mm+ quotati su disegno' },
      ],
      section: {
        heading: 'Potenza termica PET antiappannamento, adesione stabile e timer automatico',
        paragraphs: [
          'Una resistenza sottodimensionata lascia lo specchio appannato, mentre un calore eccessivo danneggia l’argentatura. Applichiamo pellicole riscaldanti PET a doppio isolamento (150–250 W/m²) con adesivo acrilico ad alta tenuta termica che portano la zona centrale a +12 °C / +18 °C sopra ambiente in 3–5 minuti senza stress sul vetro.',
        ],
        bullets: [
          'Formati pellicola mappati per modello (da 200×300 mm a oltre 400×600 mm) distanziati da fasce sabbiate, driver e ganci',
          'Comando touch indipendente dotato di relè di autospegnimento a 60 minuti oppure collegamento diretto all’interruttore bagno',
          'Verifica dielettrica hi-pot al 100 % e controllo termico di riscaldamento durante il test di invecchiamento di 2 ore',
          'Modelli a catalogo da 10 pz e layout termici OEM da 50–100 pz, coperti da garanzia di 3 anni sui componenti elettrici',
        ],
      },
    },
    'full-length-mirror-manufacturer': {
      proofPoints: [
        { value: '1500–2000 mm', label: 'Vetro float senza onde + pellicola antisfondamento CAT II' },
        { value: 'Uso 3 in 1', label: 'Cavalletto pieghevole a U, appoggio antiribaltamento o Z-bar' },
        { value: 'Imballo antiflessione', label: 'Pannelli alveolari integrali + protezioni EPE da 35 mm' },
        { value: '10 / 50 pz', label: 'Pilota da 10 pz a catalogo; su misura e finiture OEM 50 pz' },
      ],
      section: {
        heading: 'Planarità ottica in grande altezza, supporto 3 in 1 e imballaggio antiflessione',
        paragraphs: [
          'Su altezze tra 1.500 e 2.000 mm qualsiasi distorsione del vetro o giunzione debole emerge subito. Selezioniamo vetro float argentato senza rame da 4 o 5 mm con pellicola antisfondamento CAT II da 130 μm obbligatoria, inserito in telai rigidi in alluminio 6063-T5 (1,2–1,5 mm), acciaio verniciato o legno essiccato.',
        ],
        bullets: [
          'Formati ad arco, rettangolari, con angoli arrotondati o a capsula in 1500×400, 1600×500, 1650×600 e 1800×800 mm',
          'Allestimento da parete, in appoggio con cinghia di sicurezza o autoportante con cavalletto pieghevole, piedini e catenella',
          'Cartoni 5 onde a doppia parete con irrigidimento alveolare integrale per corriere oppure pallet verticali A-frame',
          'Illuminazione LED perimetrale opzionale (garanzia 3 anni elettronica) e 2 anni di garanzia su vetro, pellicola, supporto e telaio',
        ],
      },
    },
  },
};

export function buildLocalizedTechSpecSection(
  slug: string,
  lang: Exclude<SupportedLanguage, 'en'>
): LocalizedTechSpec {
  const bySlug = LOCALIZED_TECH_SPECS[lang];
  return bySlug[slug] || bySlug['led-bathroom-mirror-manufacturer'];
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
  const summary = `${model ? `型号 ${model} ` : '该款'}${frame}${shape}设计，${featureText}，${mount}；符合${cert}，支持现有款 10 件起试单及 50–100 件 OEM 定制尺寸包装（交期 25–35 天）。`;

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
    en: `${model ? `Model ${model}: ` : ''}5mm EN 1036 silver glass, customizable dimensions, CRI ≥ 90 lighting/functions, and ISTA-3A export cartons (10-pc stocked trial / 50–100 pcs OEM, 25–35 day lead time).`,
    es: `${model ? `Modelo ${model}: ` : ''}vidrio 5 mm EN 1036, medidas y funciones LED CRI ≥ 90 personalizables con embalaje ISTA-3A (prueba desde 10 uds. / OEM 50–100 uds., entrega en 25–35 días).`,
    fr: `${model ? `Modèle ${model} : ` : ''}verre 5 mm EN 1036, dimensions et options LED CRI ≥ 90 configurables avec cartons ISTA-3A (essai dès 10 pcs / OEM 50–100 pcs, délai 25–35 jours).`,
    de: `${model ? `Modell ${model}: ` : ''}5 mm EN 1036 Spiegelglas, Maße und CRI ≥ 90 LED-Funktionen konfigurierbar im ISTA-3A-Exportkarton (Test ab 10 Stk. / OEM 50–100 Stk., 25–35 Tage).`,
    it: `${model ? `Modello ${model}: ` : ''}vetro 5 mm EN 1036, misure e funzioni LED CRI ≥ 90 personalizzabili con imballo ISTA-3A (pilota da 10 pz / OEM 50–100 pz, consegna 25–35 giorni).`,
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
