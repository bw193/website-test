export const STORY_COMPANY = {
  legalName: 'Jiaxing Chengtai Mirror Co., Ltd. (BOLEN)',
  foundedYear: 2005,
  facilitySquareMeters: 46_800,
  minimumEmployees: 200,
  email: 'bolen2@cnjxctm.com',
  phone: '+86 18058603602',
  address: {
    street: 'No. 1, Building 2, No. 1, Chuangye Road, Wangdian Town',
    city: 'Jiaxing',
    region: 'Zhejiang',
    country: 'CN',
  },
} as const;

export function buildStorySchema(lang: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name,
    description,
    url: `https://bolenmirror.com/${lang}/our-story/`,
    mainEntity: {
      '@type': 'Organization',
      name: STORY_COMPANY.legalName,
      foundingDate: String(STORY_COMPANY.foundedYear),
      url: 'https://bolenmirror.com',
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
        telephone: STORY_COMPANY.phone,
        email: STORY_COMPANY.email,
        contactType: 'sales',
        areaServed: 'Worldwide',
        availableLanguage: ['en', 'zh', 'es', 'fr', 'de', 'it'],
      },
      areaServed: 'Worldwide',
    },
  };
}
