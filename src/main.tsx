import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import './index.css';
import { initialLanguageReady } from './i18n';

// Wait for the route's locale bundle before the first paint. Until it lands,
// t() falls back to English — and since createRoot clears the prerendered
// (already-localized) markup, rendering early would flash English at every
// non-English visitor. The prerendered content stays on screen meanwhile, so
// this costs no perceived latency; for /en/ it resolves immediately.
initialLanguageReady.then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </StrictMode>,
  );
});
