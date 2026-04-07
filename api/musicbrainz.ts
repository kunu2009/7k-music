import { VercelRequest, VercelResponse } from '@vercel/node';

type MusicBrainzRecording = {
  id: string;
  score?: number;
  title?: string;
  'artist-credit'?: Array<{ name?: string }>;
  'first-release-date'?: string;
  releases?: Array<{
    title?: string;
    date?: string;
    country?: string;
  }>;
  tags?: Array<{ name?: string; count?: number }>;
  genres?: Array<{ name?: string; count?: number }>;
};

type MusicBrainzResponse = {
  found: boolean;
  source: 'musicbrainz';
  trackTitle?: string;
  artistName?: string;
  releaseTitle?: string;
  releaseDate?: string;
  country?: string;
  score?: number;
  genres?: string[];
  mbid?: string;
  url?: string;
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

function scoreRecording(recording: MusicBrainzRecording, track: string, artist: string) {
  const normalizedTrack = normalize(track);
  const normalizedArtist = normalize(artist);
  const itemTrack = normalize(recording.title || '');
  const itemArtist = normalize(recording['artist-credit']?.map((entry) => entry.name || '').join(' ') || '');

  let score = Number(recording.score || 0);
  if (itemTrack === normalizedTrack) score += 20;
  if (itemTrack.includes(normalizedTrack) || normalizedTrack.includes(itemTrack)) score += 10;
  if (normalizedArtist) {
    if (itemArtist === normalizedArtist) score += 20;
    if (itemArtist.includes(normalizedArtist) || normalizedArtist.includes(itemArtist)) score += 10;
  }
  if (recording['first-release-date']) score += 2;
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

  const query = artist
    ? `recording:"${track}" AND artist:"${artist}"`
    : `recording:"${track}"`;

  const url = new URL('https://musicbrainz.org/ws/2/recording/');
  url.searchParams.set('query', query);
  url.searchParams.set('fmt', 'json');
  url.searchParams.set('limit', '8');
  url.searchParams.set('inc', 'artist-credits+releases+tags+genres');

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': '7KMusic/1.0 (https://music.7kc.me)',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'MusicBrainz provider error' });
    }

    const payload = (await response.json()) as { recordings?: MusicBrainzRecording[] };
    const recordings = Array.isArray(payload.recordings) ? payload.recordings : [];

    if (recordings.length === 0) {
      return res.status(200).json({ found: false, source: 'musicbrainz' });
    }

    const best = [...recordings].sort((a, b) => scoreRecording(b, track, artist) - scoreRecording(a, track, artist))[0];
    const primaryRelease = best.releases?.[0];
    const genres = [
      ...(best.genres || []).map((entry) => entry.name).filter((value): value is string => !!value),
      ...(best.tags || []).map((entry) => entry.name).filter((value): value is string => !!value),
    ]
      .map((value) => value.trim())
      .filter((value, index, values) => value && values.indexOf(value) === index)
      .slice(0, 6);

    const artistName = best['artist-credit']?.map((entry) => entry.name || '').filter(Boolean).join(' ').trim() || artist;

    const responseBody: MusicBrainzResponse = {
      found: true,
      source: 'musicbrainz',
      trackTitle: best.title || track,
      artistName,
      releaseTitle: primaryRelease?.title,
      releaseDate: primaryRelease?.date || best['first-release-date'],
      country: primaryRelease?.country,
      score: best.score,
      genres,
      mbid: best.id,
      url: best.id ? `https://musicbrainz.org/recording/${best.id}` : undefined,
    };

    return res.status(200).json(responseBody);
  } catch (error) {
    console.error('MusicBrainz API error:', error);
    return res.status(500).json({ error: 'Failed to fetch metadata' });
  }
}