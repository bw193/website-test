import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { SEO_LANDING_GROUPS, SEO_SOLUTIONS_PATH } from '../data/seoLandingPages';
import { getLocalizedSeoLandingPages, getSeoSolutionsUi } from '../data/seoLandingI18n';
import { useLocalizedPath } from '../hooks/useLocalizedPath';

const SITE_URL = 'https://bolenmirror.com';
const HUB_OG_IMAGE =
  'https://mxmmffwntosvwaviippd.supabase.co/storage/v1/object/public/comp%20image/factory1.jpg';

export default function SeoSolutions() {
  const { lang, lp } = useLocalizedPath();
  const pages = getLocalizedSeoLandingPages(lang);
  const ui = getSeoSolutionsUi(lang);
  const heading = lang === 'zh' ? 'font-sans font-semibold tracking-tight' : 'font-serif';

  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: ui.hubHeading,
    itemListElement: pages.map((page, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: page.h1,
      url: `${SITE_URL}/${lang}/solutions/${page.slug}/`,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: ui.home, item: `${SITE_URL}/${lang}/` },
      { '@type': 'ListItem', position: 2, name: ui.footerLabel, item: `${SITE_URL}/${lang}/solutions/` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-800">
      <SEO
        title={ui.hubTitle}
        description={ui.hubDescription}
        path={SEO_SOLUTIONS_PATH}
        ogImage={HUB_OG_IMAGE}
        schema={[itemListSchema, breadcrumbSchema]}
      />

      <header className="mx-auto max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pt-20 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-amber-800">{ui.hubEyebrow}</p>
            <h1 className={`mt-3 text-4xl text-stone-900 sm:text-5xl ${heading}`}>{ui.hubHeading}</h1>
            <p className="mt-4 text-lg leading-7 text-stone-700">{ui.hubIntro}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={lp('/rfq')} className="btn-primary">
              {ui.discussProject}
            </Link>
            <Link to={lp('/products')} className="btn-secondary">
              {ui.browseCatalog}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 border-t border-stone-200 py-12 lg:grid-cols-3 lg:gap-16">
          {SEO_LANDING_GROUPS.map((group) => {
            const groupCopy = ui.hubGroups[group.id];
            const groupPages = group.slugs
              .map((slug) => pages.find((page) => page.slug === slug))
              .filter((page): page is NonNullable<typeof page> => Boolean(page));
            return (
              <section key={group.id} aria-labelledby={`solutions-${group.id}`}>
                <h2 id={`solutions-${group.id}`} className="text-sm font-semibold uppercase tracking-wider text-stone-500">
                  {groupCopy.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">{groupCopy.description}</p>
                <ul className="mt-5 divide-y divide-stone-200 border-y border-stone-200">
                  {groupPages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        to={lp(`/solutions/${page.slug}`)}
                        className="group flex items-baseline justify-between gap-4 py-3.5"
                      >
                        <span>
                          <span className="block text-[17px] font-medium text-stone-900 group-hover:text-amber-800">
                            {page.shortTitle || page.h1}
                          </span>
                          <span className="mt-1 block text-sm leading-6 text-stone-600">
                            {page.blurb || page.description}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-800" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>

      <section className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className={`text-2xl text-stone-900 ${heading}`}>{ui.howHeading}</h2>
          <ol className="mt-8 grid gap-8 sm:grid-cols-3">
            {ui.howSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="w-8 shrink-0 text-sm font-semibold text-amber-800">{index + 1}</span>
                <div>
                  <h3 className="font-medium text-stone-900">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{step.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
