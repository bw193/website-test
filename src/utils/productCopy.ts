const SPANISH_LED_HOTEL_MIRROR =
  /OEM&ODM\s+Espejo LED Con Puerta Marco De Aluminio Antiniebla Para Hoteles/gi;

/**
 * Fix presentation-only legacy title errors without changing the database value
 * or the existing URL slug. This keeps indexed links stable while showing
 * buyers clean English copy.
 */
export function polishEnglishProductTitle(title: string): string {
  return title
    .trim()
    .replace(SPANISH_LED_HOTEL_MIRROR, 'OEM/ODM Anti-Fog LED Hotel Mirror with Aluminum Frame and Door')
    .replace(/\b(?:reactanglar|rectanglar)\b/gi, 'Rectangular')
    .replace(/\bfree standings\b/gi, 'Free-Standing')
    .replace(/\bnatual\b/gi, 'Natural')
    .replace(/\bcertificated\b/gi, 'Certified')
    .replace(/\bdiemensions\b/gi, 'Dimensions')
    .replace(/\bdiemension\b/gi, 'Dimension')
    .replace(/\bled light strap\b/gi, 'LED Light Strip')
    .replace(/\bpool shape\b/gi, 'Capsule Oval')
    .replace(/\bround corner\b/gi, 'Rounded Corners')
    .replace(/\bOEM&ODM\b/g, 'OEM/ODM');
}
