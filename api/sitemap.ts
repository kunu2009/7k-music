import { VercelRequest, VercelResponse } from '@vercel/node';

const PUBLIC_PAGES = ['/', '/downloads', '/categories'];

function getOrigin(req: VercelRequest) {
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) || 'https';
  const host = (req.headers['x-forwarded-host'] as string | undefined) || req.headers.host || 'localhost:5173';
  return `${proto}://${host}`;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method not allowed');
  }

  const origin = getOrigin(req);
  const lastmod = new Date().toISOString();
  const urls = PUBLIC_PAGES.map((path) => `
  <url>
    <loc>${origin}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(xml);
}