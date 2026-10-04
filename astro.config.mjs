import { defineConfig } from 'astro/config';

// Static site. German at /, English at /en/.
// No `site` is set on purpose: there is no production domain yet
// (see SITE_URL in src/config/site.ts).
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
