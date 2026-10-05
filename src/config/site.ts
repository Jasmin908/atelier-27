// Central site configuration.

/**
 * The live Forma Studio portfolio. The CTA and the footer credit link here.
 * If this is set to null, both render as plain text without an href.
 */
export const FORMA_STUDIO_URL: string | null = 'https://forma-webdesign.netlify.app/';

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
