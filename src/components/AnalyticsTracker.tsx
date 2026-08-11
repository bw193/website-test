import { useEffect } from 'react';
import { trackEvent } from '../utils/analytics';

const startedRfqForms = new WeakSet<HTMLFormElement>();

export default function AnalyticsTracker() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;

      const destination = new URL(link.href, window.location.href);
      const isRfqPage = /^\/(?:en|zh|de|es|fr|it)\/rfq\/?$/.test(destination.pathname);
      const isProductRfq = destination.hash === '#product-rfq';
      if (!isRfqPage && !isProductRfq) return;

      trackEvent('rfq_cta_click', {
        cta_text: link.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80) || 'RFQ link',
        destination: `${destination.pathname}${destination.hash}`,
        source_path: window.location.pathname,
      });
    };

    const handleFormFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const form = target.closest<HTMLFormElement>('form[data-rfq-form]');
      if (!form) return;

      const formLocation = form.dataset.rfqForm || 'unknown';
      if (startedRfqForms.has(form)) return;

      startedRfqForms.add(form);
      trackEvent('rfq_form_start', {
        form_location: formLocation,
        source_path: window.location.pathname,
      });
    };

    // Capture before React Router mutates history so source_path is the page
    // the buyer actually clicked from. Query strings are intentionally omitted
    // from analytics to prevent accidental PII collection.
    document.addEventListener('click', handleClick, true);
    document.addEventListener('focusin', handleFormFocus);
    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('focusin', handleFormFocus);
    };
  }, []);

  return null;
}
