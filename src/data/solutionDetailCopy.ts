import type { SupportedLanguage } from '../hooks/useLocalizedPath';

type SolutionDetailCopy = {
  overview: string;
  overviewHeading: string;
  details: string;
  onThisPage: string;
  viewModel: string;
  previewModel: string;
  imageLoading: string;
  imageUnavailable: string;
  retryImage: string;
  factoryEyebrow: string;
  factoryHeading: string;
  factoryLink: string;
  factoryImageAlt: string;
};

export const SOLUTION_DETAIL_COPY: Record<SupportedLanguage, SolutionDetailCopy> = {
  en: {
    overview: 'Overview',
    overviewHeading: 'Built around your requirements.',
    details: 'Specification guide',
    onThisPage: 'In this solution',
    viewModel: 'Explore this model',
    previewModel: 'Preview model',
    imageLoading: 'Loading image',
    imageUnavailable: 'This image could not be loaded.',
    retryImage: 'Try again',
    factoryEyebrow: 'Your manufacturing partner',
    factoryHeading: 'From your brief to the finished mirror.',
    factoryLink: 'Inside BOLEN',
    factoryImageAlt: 'Exterior of the BOLEN mirror factory in Jiaxing',
  },
  zh: {
    overview: '方案概览', overviewHeading: '围绕您的需求，打造专属方案。',
    details: '规格与采购指南', onThisPage: '了解此方案',
    viewModel: '查看这款产品', previewModel: '预览产品',
    imageLoading: '图片加载中', imageUnavailable: '暂时无法加载此图片。', retryImage: '重试',
    factoryEyebrow: '您的制造合作伙伴', factoryHeading: '从您的构想，到成品交付。', factoryLink: '走进 BOLEN',
    factoryImageAlt: 'BOLEN 嘉兴镜子工厂外观',
  },
  es: {
    overview: 'Resumen', overviewHeading: 'Creado en torno a sus necesidades.',
    details: 'Guía de especificaciones', onThisPage: 'En esta solución',
    viewModel: 'Explorar este modelo', previewModel: 'Vista previa del modelo',
    imageLoading: 'Cargando imagen', imageUnavailable: 'No se pudo cargar esta imagen.', retryImage: 'Reintentar',
    factoryEyebrow: 'Su socio de fabricación', factoryHeading: 'De su idea al espejo terminado.', factoryLink: 'Conozca BOLEN',
    factoryImageAlt: 'Exterior de la fábrica de espejos BOLEN en Jiaxing',
  },
  fr: {
    overview: 'Aperçu', overviewHeading: 'Conçu autour de vos exigences.',
    details: 'Guide des spécifications', onThisPage: 'Dans cette solution',
    viewModel: 'Découvrir ce modèle', previewModel: 'Aperçu du modèle',
    imageLoading: 'Chargement de l’image', imageUnavailable: 'Cette image n’a pas pu être chargée.', retryImage: 'Réessayer',
    factoryEyebrow: 'Votre partenaire de fabrication', factoryHeading: 'De votre idée au miroir fini.', factoryLink: 'Découvrir BOLEN',
    factoryImageAlt: 'Extérieur de l’usine de miroirs BOLEN à Jiaxing',
  },
  de: {
    overview: 'Überblick', overviewHeading: 'Auf Ihre Anforderungen abgestimmt.',
    details: 'Spezifikationsleitfaden', onThisPage: 'In dieser Lösung',
    viewModel: 'Dieses Modell ansehen', previewModel: 'Modellvorschau',
    imageLoading: 'Bild wird geladen', imageUnavailable: 'Dieses Bild konnte nicht geladen werden.', retryImage: 'Erneut versuchen',
    factoryEyebrow: 'Ihr Fertigungspartner', factoryHeading: 'Von Ihrer Idee zum fertigen Spiegel.', factoryLink: 'BOLEN kennenlernen',
    factoryImageAlt: 'Außenansicht der BOLEN Spiegelfabrik in Jiaxing',
  },
  it: {
    overview: 'Panoramica', overviewHeading: 'Progettato intorno alle vostre esigenze.',
    details: 'Guida alle specifiche', onThisPage: 'In questa soluzione',
    viewModel: 'Scopri questo modello', previewModel: 'Anteprima del modello',
    imageLoading: 'Caricamento immagine', imageUnavailable: 'Impossibile caricare questa immagine.', retryImage: 'Riprova',
    factoryEyebrow: 'Il vostro partner produttivo', factoryHeading: 'Dalla vostra idea allo specchio finito.', factoryLink: 'Scopri BOLEN',
    factoryImageAlt: 'Esterno della fabbrica di specchi BOLEN a Jiaxing',
  },
};
