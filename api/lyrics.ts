import { VercelRequest, VercelResponse } from '@vercel/node';

type LrcLibItem = {
  id?: number;
  trackName?: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  plainLyrics?: string;
  syncedLyrics?: string;
};

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreMatch(item: LrcLibItem, track: string, artist: string) {
  const itemTrack = normalize(item.trackName || '');
  const itemArtist = normalize(item.artistName || '');
  const normalizedTrack = normalize(track);
  const normalizedArtist = normalize(artist);

  let score = 0;
  if (itemTrack === normalizedTrack) score += 6;
  if (itemTrack.includes(normalizedTrack) || normalizedTrack.includes(itemTrack)) score += 3;
  if (itemArtist === normalizedArtist) score += 6;
  if (itemArtist.includes(normalizedArtist) || normalizedArtist.includes(itemArtist)) score += 3;
  if (item.syncedLyrics) score += 1;
  if (item.plainLyrics) score += 1;
  return score;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const track = typeof req.query.track === 'string' ? req.query.track.trim() : '';
  const artist = typeof req.query.artist === 'string' ? req.query.artist.trim() : '';

  if (!track) {
    return res.status(400).json({ error: 'Query parameter "track" is required' });
  }

  const query = [track, artist].filter(Boolean).join(' ');
  const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': '7KMusic/1.0 (+https://music.7kc.me)',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Lyrics provider error' });
    }

    const items = (await response.json()) as LrcLibItem[];
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(200).json({ found: false, lyrics: null });
    }

    const best = [...items]
      .sort((a, b) => scoreMatch(b, track, artist) - scoreMatch(a, track, artist))[0];

    const lyrics = best.syncedLyrics || best.plainLyrics || '';
    if (!lyrics.trim()) {
      return res.status(200).json({ found: false, lyrics: null });
    }

    return res.status(200).json({
      found: true,
      source: 'lrclib',
      trackName: best.trackName || track,
      artistName: best.artistName || artist,
      synced: Boolean(best.syncedLyrics),
      lyrics,
    });
  } catch (error) {
    console.error('Lyrics API error:', error);
    return res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
}