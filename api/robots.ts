import { VercelRequest, VercelResponse } from '@vercel/node';

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
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.status(200).send(`User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /now-playing\nDisallow: /favorites\nDisallow: /my-music\nDisallow: /playlists\nDisallow: /settings\nSitemap: ${origin}/sitemap.xml\n`);
}