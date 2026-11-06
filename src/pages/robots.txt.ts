import { INDEXEREN, SITE } from '../config';

export function GET() {
  const body = INDEXEREN
    ? `User-agent: *
Allow: /
Disallow: /scan/bedankt/

Sitemap: ${SITE.url}/sitemap.xml
`
    : `User-agent: *
Disallow: /
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
