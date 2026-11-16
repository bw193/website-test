import React from 'react';
import SEO from '../components/SEO';
import { useCurrentLang } from '../hooks/useLocalizedPath';
import {
  buildTermsSchema,
  getTermsCopy,
  TERMS_CONTACT_EMAIL,
  TERMS_PATH,
} from '../data/termsCopy';

// Copy lives in src/data/termsCopy.ts so scripts/prerender-static.ts can bake
// the same localized text into dist/<lang>/terms-and-conditions/index.html.
export default function TermsAndConditions() {
  const lang = useCurrentLang();
  const copy = getTermsCopy(lang);

  return (
    <div className="bg-[#FAF9F6] px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <SEO
        title={copy.seo.title}
        description={copy.seo.description}
        path={TERMS_PATH}
        schema={buildTermsSchema(lang)}
      />

      <article className="mx-auto max-w-3xl">
        <header className="border-b border-stone-200 pb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">{copy.kicker}</p>
          <h1 className="font-serif text-4xl leading-tight text-stone-900 sm:text-5xl">{copy.heading}</h1>
          <p className="mt-5 text-sm text-stone-500">{copy.lastUpdated}</p>
          <p className="mt-6 text-lg leading-8 text-stone-600">{copy.intro}</p>
        </header>

        <div className="space-y-10 py-10">
          {copy.sections.map((section) => (
            <section key={section.title}>
              <h2 className="font-serif text-2xl text-stone-900">{section.title}</h2>
              <p className="mt-3 leading-7 text-stone-600">{section.body}</p>
            </section>
          ))}

          <section>
            <h2 className="font-serif text-2xl text-stone-900">{copy.contactHeading}</h2>
            <p className="mt-3 leading-7 text-stone-600">
              {copy.contactLead}{' '}
              <a className="font-medium text-amber-700 underline decoration-amber-300 underline-offset-4 hover:text-amber-600" href={`mailto:${TERMS_CONTACT_EMAIL}`}>
                {TERMS_CONTACT_EMAIL}
              </a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
