// @ts-check
import { defineConfig } from 'astro/config';

// Statische site: `npm run build` maakt platte HTML in dist/.
// Die map gaat naar public_html op Hostinger (zie README.md).
export default defineConfig({
  site: 'https://aanvragensysteem.nl',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'always'
  },
  compressHTML: true,
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' }
});
