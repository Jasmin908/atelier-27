// Central site configuration.

/**
 * The real Forma Studio URL is not available yet.
 * While this is null, the CTA and footer credit render as plain text
 * without an href. Set it to the final URL to turn both into links.
 */
export const FORMA_STUDIO_URL: string | null = null;

/**
 * Production origin, e.g. "https://example.ch" (no trailing slash).
 * While this is null, no canonical or hreflang URLs are emitted.
 */
export const SITE_URL: string | null = null;

/** The concept site stays out of search indexes until this is set to true. */
export const ALLOW_INDEXING = false;

export const COORDINATES = { lat: '47.5596° N', lon: '07.5886° E' };

export const LOCALES = {
  de: { path: '/', htmlLang: 'de-CH', hreflang: 'de' },
  en: { path: '/en/', htmlLang: 'en', hreflang: 'en' },
} as const;

export type Locale = keyof typeof LOCALES;
