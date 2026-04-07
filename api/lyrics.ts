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

type LyricsSuggestion = {
  trackName: string;
  artistName: string;
  albumName?: string;
  synced: boolean;
};

const NOISE_TERMS = [
  'official video',
  'official music video',
  'official audio',
  'lyrics',
  'lyric video',
  'live',
  'live concert',
  'bass boosted',
  '8d audio',
  'sped up',
  'slowed',
  'slowed reverb',
  'nightcore',
  'visualizer',
  'remaster',
  'hq',
  'hd',
  'topic',
];

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanupArtist(artist: string) {
  return normalize(artist)
    .replace(/\bvevo\b/g, ' ')
    .replace(/\btopic\b/g, ' ')
    .replace(/\sofficial\s*$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanupTrack(track: string) {
  let cleaned = track;
  cleaned = cleaned.replace(/\([^)]*\)/g, ' ');
  cleaned = cleaned.replace(/\[[^\]]*\]/g, ' ');
  cleaned = cleaned.replace(/\s+-\s+/g, ' ');
  cleaned = cleaned.replace(/\s*\|\s*/g, ' ');

  for (const term of NOISE_TERMS) {
    const pattern = new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'ig');
    cleaned = cleaned.replace(pattern, ' ');
  }

  cleaned = cleaned
    .replace(/\bft\.?\b[^-–—|]*/ig, ' ')
    .replace(/\bfeat\.?\b[^-–—|]*/ig, ' ')
    .replace(/\bfeaturing\b[^-–—|]*/ig, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned;
}

function uniqueQueries(values: string[]) {
  const set = new Set<string>();
  for (const value of values) {
    const normalized = value.trim();
    if (normalized) {
      set.add(normalized);
    }
  }
  return [...set];
}

async function searchLrcLib(query: string) {
  const url = `https://lrclib.net/api/search?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': '7KMusic/1.0 (+https://music.7kc.me)',
    },
  });

  if (!response.ok) {
    return { ok: false as const, items: [] as LrcLibItem[], status: response.status };
  }

  const items = (await response.json()) as LrcLibItem[];
  return {
    ok: true as const,
    items: Array.isArray(items) ? items : [],
    status: response.status,
  };
}

function makeSuggestions(items: LrcLibItem[], track: string, artist: string): LyricsSuggestion[] {
  return [...items]
    .sort((a, b) => scoreMatch(b, track, artist) - scoreMatch(a, track, artist))
    .filter((item) => (item.trackName || '').trim().length > 0)
    .slice(0, 6)
    .map((item) => ({
      trackName: item.trackName || track,
      artistName: item.artistName || artist,
      albumName: item.albumName,
      synced: Boolean(item.syncedLyrics),
    }));
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

  const cleanedTrack = cleanupTrack(track);
  const cleanedArtist = cleanupArtist(artist);
  const trackCore = cleanedTrack.split(/\s{2,}|\s-\s|\s\|\s/)[0]?.trim() || cleanedTrack;
  const queries = uniqueQueries([
    [track, artist].filter(Boolean).join(' '),
    [cleanedTrack, cleanedArtist].filter(Boolean).join(' '),
    [trackCore, cleanedArtist].filter(Boolean).join(' '),
    cleanedTrack,
    trackCore,
  ]);

  try {
    const gathered: LrcLibItem[] = [];
    let providerErrorStatus: number | null = null;

    for (const query of queries) {
      const result = await searchLrcLib(query);
      if (!result.ok) {
        providerErrorStatus = result.status;
        continue;
      }
      gathered.push(...result.items);

      if (gathered.length >= 20) {
        break;
      }
    }

    const deduped = gathered.filter((item, index, values) => {
      const key = `${item.id || ''}:${normalize(item.trackName || '')}:${normalize(item.artistName || '')}`;
      return index === values.findIndex((candidate) => {
        const candidateKey = `${candidate.id || ''}:${normalize(candidate.trackName || '')}:${normalize(candidate.artistName || '')}`;
        return candidateKey === key;
      });
    });

    if (deduped.length === 0) {
      if (providerErrorStatus) {
        return res.status(providerErrorStatus).json({ error: 'Lyrics provider error' });
      }
      return res.status(200).json({ found: false, lyrics: null, suggestions: [] });
    }

    const best = [...deduped]
      .sort((a, b) => scoreMatch(b, track, artist) - scoreMatch(a, track, artist))[0];

    const lyrics = best.syncedLyrics || best.plainLyrics || '';
    const suggestions = makeSuggestions(deduped, track, artist);
    if (!lyrics.trim()) {
      return res.status(200).json({
        found: false,
        lyrics: null,
        suggestions,
      });
    }

    return res.status(200).json({
      found: true,
      source: 'lrclib',
      trackName: best.trackName || track,
      artistName: best.artistName || artist,
      synced: Boolean(best.syncedLyrics),
      lyrics,
      suggestions,
    });
  } catch (error) {
    console.error('Lyrics API error:', error);
    return res.status(500).json({ error: 'Failed to fetch lyrics' });
  }
}