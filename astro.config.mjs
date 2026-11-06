// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Pagina's worden bij `npm run build` vooraf gebouwd als platte HTML (output: 'static').
// Alleen de endpoints in src/pages/api/ draaien op de server (prerender = false), via de Node-adapter.
// Het resultaat staat in dist/: dist/client (de pagina's) en dist/server/entry.mjs (de Node-app voor Hostinger).
export default defineConfig({
  site: 'https://aanvragensysteem.nl',
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always'
  },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' }
});
