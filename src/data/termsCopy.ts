// Terms and Conditions copy, shared by src/pages/TermsAndConditions.tsx and the
// static prerender in scripts/prerender-static.ts. The page is client-only
// React apart from this text; keeping the copy here lets the build emit a real
// dist/<lang>/terms-and-conditions/index.html so the route is served with
// HTTP 200 instead of the 404 page (see assets.not_found_handling in
// wrangler.jsonc). The copy is English in every locale today.

export const TERMS_PATH = '/terms-and-conditions';

export const TERMS_SEO = {
  title: 'Terms and Conditions | BOLEN Mirror',
  description:
    'Terms and conditions for using the BOLEN Mirror website and requesting product information or quotations.',
} as const;

// Key order matters: the prerender and react-helmet-async both JSON.stringify
// this object, and Helmet only adopts a prerendered <script> whose serialized
// text is byte-identical to its own.
export const TERMS_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms and Conditions',
  description: 'Terms and conditions for using the BOLEN Mirror website.',
} as const;

export const TERMS_KICKER = 'Legal';
export const TERMS_HEADING = 'Terms and Conditions';
export const TERMS_LAST_UPDATED = 'Last updated: August 19, 2026';
export const TERMS_INTRO =
  'These terms govern your use of the BOLEN Mirror website, operated by Jiaxing Chengtai Mirror Co., Ltd. By using this website, you agree to these terms.';
export const TERMS_CONTACT_HEADING = 'Contact';
export const TERMS_CONTACT_LEAD = 'If you have questions about these terms, contact us at';
export const TERMS_CONTACT_EMAIL = 'sales@bolenmirror.com';

export const TERMS_SECTIONS: ReadonlyArray<{ title: string; body: string }> = [
  {
    title: 'Use of this website',
    body: 'You may use this website to learn about BOLEN products and services and to contact us about potential business. You must not misuse the website, interfere with its operation, or use its content for unlawful purposes.',
  },
  {
    title: 'Product information and quotations',
    body: 'Product images, specifications, availability, and other information are provided for general reference and may change without notice. Website content does not constitute a binding offer. Prices, minimum order quantities, lead times, specifications, and commercial terms are confirmed in a written quotation or contract.',
  },
  {
    title: 'Intellectual property',
    body: 'The BOLEN name, website design, text, images, videos, product materials, and other content are owned by or licensed to Jiaxing Chengtai Mirror Co., Ltd. You may not copy, republish, distribute, or commercially exploit this content without prior written permission.',
  },
  {
    title: 'Third-party services and links',
    body: 'This website may contain links to or use services provided by third parties. We are not responsible for the availability, content, security, or privacy practices of third-party websites or services.',
  },
  {
    title: 'Disclaimer and liability',
    body: 'We aim to keep this website accurate and available, but it is provided on an “as is” and “as available” basis. To the extent permitted by applicable law, Jiaxing Chengtai Mirror Co., Ltd. is not liable for indirect, incidental, or consequential loss arising from use of, or inability to use, this website.',
  },
  {
    title: 'Changes to these terms',
    body: 'We may update these terms from time to time. Changes take effect when the revised terms are published on this page. Continued use of the website after an update means you accept the revised terms.',
  },
];
