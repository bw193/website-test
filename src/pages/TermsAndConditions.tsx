import React from 'react';
import SEO from '../components/SEO';

const sections = [
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

export default function TermsAndConditions() {
  return (
    <div className="bg-[#FAF9F6] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <SEO
        title="Terms and Conditions | BOLEN Mirror"
        description="Terms and conditions for using the BOLEN Mirror website and requesting product information or quotations."
        path="/terms-and-conditions"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Terms and Conditions',
          description: 'Terms and conditions for using the BOLEN Mirror website.',
        }}
      />

      <article className="mx-auto max-w-3xl">
        <header className="border-b border-stone-200 pb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Legal</p>
          <h1 className="font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">Terms and Conditions</h1>
          <p className="mt-5 text-sm text-stone-500">Last updated: August 19, 2026</p>
          <p className="mt-6 text-lg leading-8 text-stone-600">
            These terms govern your use of the BOLEN Mirror website, operated by Jiaxing Chengtai Mirror Co., Ltd.
            By using this website, you agree to these terms.
          </p>
        </header>

        <div className="space-y-10 py-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl text-stone-900">{section.title}</h2>
              <p className="mt-3 leading-7 text-stone-600">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="font-serif text-2xl text-stone-900">Contact</h2>
            <p className="mt-3 leading-7 text-stone-600">
              If you have questions about these terms, contact us at{' '}
              <a className="font-medium text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-600" href="mailto:sales@bolenmirror.com">
                sales@bolenmirror.com
              </a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
