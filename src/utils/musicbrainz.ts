interface MusicBrainzResponse {
  found: boolean;
  source?: string;
  trackTitle?: string;
  artistName?: string;
  releaseTitle?: string;
  releaseDate?: string;
  country?: string;
  score?: number;
  genres?: string[];
  mbid?: string;
  url?: string;
}

interface MetadataCachePayload {
  expiresAt: number;
  value: MusicBrainzResponse;
}

const CACHE_PREFIX = 'musicbrainz-cache:';

function cacheKey(track: string, artist: string) {
  return `${CACHE_PREFIX}${track.toLowerCase().trim()}::${artist.toLowerCase().trim()}`;
}

function readCache(track: string, artist: string): MusicBrainzResponse | null {
  try {
    const raw = localStorage.getItem(cacheKey(track, artist));
    if (!raw) return null;
    const payload = JSON.parse(raw) as MetadataCachePayload;
    if (!payload.value || Date.now() > payload.expiresAt) {
      localStorage.removeItem(cacheKey(track, artist));
      return null;
    }
    return payload.value;
  } catch {
    return null;
  }
}

function writeCache(track: string, artist: string, value: MusicBrainzResponse) {
  try {
    const payload: MetadataCachePayload = {
      value,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14,
    };
    localStorage.setItem(cacheKey(track, artist), JSON.stringify(payload));
  } catch {
    // Ignore cache write failures.
  }
}

export const musicBrainzApi = {
  async getMetadata(track: string, artist: string): Promise<MusicBrainzResponse | null> {
    if (!track.trim()) return null;

    const cached = readCache(track, artist);
    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({ track: track.trim() });
    if (artist.trim()) {
      params.set('artist', artist.trim());
    }

    const response = await fetch(`/api/musicbrainz?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`MusicBrainz API error: ${response.status}`);
    }

    const data = (await response.json()) as MusicBrainzResponse;
    if (!data.found) {
      return null;
    }

    writeCache(track, artist, data);
    return data;
  },
};