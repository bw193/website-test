import { SITE_ORIGIN, toMediaUrl } from './media';

export const STORY_COMPANY = {
  legalName: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
  foundedYear: 2005,
  facilitySquareMeters: 46_800,
  minimumEmployees: 200,
  email: 'sales@bolenmirror.com',
  phone: '+86 18058603602',
  address: {
    street: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town',
    city: 'Jiaxing',
    region: 'Zhejiang',
    country: 'CN',
  },
} as const;

const LOGO_URL = 'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/logo.png';
const SITE_LANGUAGES = ['en', 'zh', 'es', 'fr', 'de', 'it'];

const ORG_DESCRIPTION: Record<string, string> = {
  en: 'Established in 2005 in Jiaxing, Zhejiang, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) manufactures OEM/ODM LED bathroom mirrors, smart mirrors, vanity mirrors and mirror cabinets across a 46,800 m² facility.',
  zh: '嘉兴诚泰镜业有限公司（BOLEN）成立于 2005 年，位于浙江嘉兴，拥有 46,800 平方米生产基地，专业从事 LED 浴室镜、智能镜、化妆镜与镜柜的 OEM/ODM 研发制造。',
  es: 'Fundada en 2005 en Jiaxing, Zhejiang, Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) fabrica espejos de baño LED, espejos inteligentes, espejos de tocador y armarios con espejo OEM/ODM en una planta de 46.800 m².',
  fr: 'Fondée en 2005 à Jiaxing (Zhejiang), Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) fabrique en OEM/ODM des miroirs de salle de bain LED, miroirs connectés, miroirs de courtoisie et armoires à miroir sur un site de 46 800 m².',
  de: 'Die 2005 in Jiaxing (Zhejiang) gegründete Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) fertigt im 46.800 m² großen Werk OEM/ODM-LED-Badspiegel, Smart-Spiegel, Schminkspiegel und Spiegelschränke.',
  it: 'Fondata nel 2005 a Jiaxing (Zhejiang), Jiaxing Chengtai Mirror Co., Ltd. (BOLEN) produce in OEM/ODM specchi da bagno LED, specchi smart, specchi da toeletta e pensili a specchio in uno stabilimento di 46.800 m².',
};

export function buildStorySchema(lang: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name,
    description,
    inLanguage: lang,
    url: `${SITE_ORIGIN}/${lang}/our-story/`,
    mainEntity: {
      '@type': 'Organization',
      '@id': `${SITE_ORIGIN}/#organization`,
      name: STORY_COMPANY.legalName,
      description: ORG_DESCRIPTION[lang] || ORG_DESCRIPTION.en,
      foundingDate: String(STORY_COMPANY.foundedYear),
      url: `${SITE_ORIGIN}/`,
      logo: toMediaUrl(LOGO_URL),
      numberOfEmployees: {
        '@type': 'QuantitativeValue',
        minValue: STORY_COMPANY.minimumEmployees,
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: STORY_COMPANY.address.street,
        addressLocality: STORY_COMPANY.address.city,
        addressRegion: STORY_COMPANY.address.region,
        addressCountry: STORY_COMPANY.address.country,
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+86-18058603602',
        email: STORY_COMPANY.email,
        contactType: 'sales',
        areaServed: 'Worldwide',
        availableLanguage: SITE_LANGUAGES,
      },
      areaServed: 'Worldwide',
    },
  };
}
