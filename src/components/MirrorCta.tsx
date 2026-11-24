import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight, Mail, Phone, Sun } from 'lucide-react';
import { useLocalizedPath } from '../hooks/useLocalizedPath';
import { useSeenOnce } from '../hooks/useSeenOnce';
import { usePointerVars } from '../hooks/usePointerVars';

/** The colour temperatures a BOLEN tri-colour LED mirror's touch sensor steps through. */
const TEMPERATURES = [3000, 4000, 6000] as const;

/**
 * The home page's closing CTA, drawn as a BOLEN LED mirror: smoked glass with a
 * frosted light band inset from its edge (an arch mirror on phones). The band
 * switches on the first time the mirror is well into view; after that a
 * reflection glides across the glass now and then, a highlight follows the
 * pointer, and the touch sensor under the contact line steps the light through
 * warm, neutral and cool white the way the real mirror's does (index.css,
 * "Closing CTA").
 */
export default function MirrorCta() {
  const { t } = useTranslation();
  const { lp } = useLocalizedPath();
  const [mirrorRef, lit] = useSeenOnce<HTMLDivElement>('35%');
  usePointerVars(mirrorRef);
  const [tempIndex, setTempIndex] = useState(0);
  const kelvin = `${TEMPERATURES[tempIndex]}K`;

  return (
    <section aria-labelledby="home-cta-title" className="bg-[#FAF9F6] px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-14 lg:px-8">
      <div
        ref={mirrorRef}
        data-temp={TEMPERATURES[tempIndex]}
        className={`cta-mirror relative isolate mx-auto max-w-5xl px-7 pb-12 pt-28 text-center sm:px-16 sm:pb-14 sm:pt-20 ${lit ? 'is-lit' : ''}`}
      >
        <span aria-hidden="true" className="cta-mirror-band" />
        <span aria-hidden="true" className="cta-mirror-sweep" />
        <span aria-hidden="true" className="cta-mirror-glare" />
        <h2 id="home-cta-title" className="relative font-serif text-4xl leading-[1.1] text-white text-balance sm:text-5xl">
          {t('home.cta.title')}
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-base leading-7 text-stone-300 sm:text-lg">
          {t('home.cta.desc')}
        </p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to={lp('/rfq')} className="btn-primary min-h-12 w-full px-8 text-base sm:w-auto">
            {t('home.cta.contactSales')}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to={lp('/products')} className="btn-secondary-on-dark min-h-12 w-full px-8 text-base sm:w-auto">
            {t('home.cta.viewCatalog')}
          </Link>
        </div>
        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-400">
          <span className="text-stone-200">{t('home.cta.responseNote', '24-hour specification review & factory quotation')}</span>
          <a href="mailto:sales@bolenmirror.com" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
            sales@bolenmirror.com
          </a>
          <a href="tel:+8618058603602" className="inline-flex items-center gap-1.5 transition-colors hover:text-white">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            +86 18058603602
          </a>
        </div>
        {/* The touch sensor: like the real mirror's, each touch steps the light
            to the next colour temperature. */}
        <button
          type="button"
          onClick={() => setTempIndex((index) => (index + 1) % TEMPERATURES.length)}
          aria-label={t('home.cta.lightToggle', { kelvin })}
          className="cta-sensor group relative mx-auto mt-8 flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-[13px] font-medium tabular-nums text-stone-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
        >
          <span aria-hidden="true" className="cta-sensor-pad relative flex h-9 w-9 items-center justify-center rounded-full">
            <Sun className="h-4 w-4" />
          </span>
          <span aria-hidden="true">{kelvin}</span>
        </button>
      </div>
    </section>
  );
}
