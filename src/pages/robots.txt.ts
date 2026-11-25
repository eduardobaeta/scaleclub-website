import type { APIRoute } from 'astro';
import { isIndexable } from '@/config/deployment';

export const GET: APIRoute = ({ site }) => {
  const lines = isIndexable
    ? ['User-agent: *', 'Allow: /', ...(site ? [`Sitemap: ${new URL('sitemap-index.xml', site).href}`] : [])]
    : ['User-agent: *', 'Disallow: /'];

  return new Response(`${lines.join('\n')}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
