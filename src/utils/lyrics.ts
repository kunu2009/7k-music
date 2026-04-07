interface LyricsResponse {
  found: boolean;
  lyrics: string | null;
  synced?: boolean;
  source?: string;
  trackName?: string;
  artistName?: string;
  suggestions?: LyricsSuggestion[];
}

export interface LyricsSuggestion {
  trackName: string;
  artistName: string;
  albumName?: string;
  synced?: boolean;
}

export interface LyricsLookupResult {
  lyrics: string | null;
  suggestions: LyricsSuggestion[];
}

interface LyricsCachePayload {
  expiresAt: number;
  lyrics: string;
}

const CACHE_PREFIX = 'lyrics-cache:';

function cacheKey(track: string, artist: string) {
  return `${CACHE_PREFIX}${track.toLowerCase().trim()}::${artist.toLowerCase().trim()}`;
}

function getCachedLyrics(track: string, artist: string): string | null {
  try {
    const raw = localStorage.getItem(cacheKey(track, artist));
    if (!raw) return null;
    const payload = JSON.parse(raw) as LyricsCachePayload;
    if (!payload.lyrics || Date.now() > payload.expiresAt) {
      localStorage.removeItem(cacheKey(track, artist));
      return null;
    }
    return payload.lyrics;
  } catch {
    return null;
  }
}

function setCachedLyrics(track: string, artist: string, lyrics: string) {
  try {
    const payload: LyricsCachePayload = {
      lyrics,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7,
    };
    localStorage.setItem(cacheKey(track, artist), JSON.stringify(payload));
  } catch {
    // Ignore cache write failures.
  }
}

export const lyricsApi = {
  async lookupLyrics(track: string, artist: string): Promise<LyricsLookupResult> {
    if (!track.trim()) {
      return { lyrics: null, suggestions: [] };
    }

    const cached = getCachedLyrics(track, artist);
    if (cached) {
      return { lyrics: cached, suggestions: [] };
    }

    const params = new URLSearchParams({ track: track.trim() });
    if (artist.trim()) {
      params.set('artist', artist.trim());
    }

    const response = await fetch(`/api/lyrics?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`Lyrics API error: ${response.status}`);
    }

    const data = (await response.json()) as LyricsResponse;
    if (!data.found || !data.lyrics) {
      return {
        lyrics: null,
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
      };
    }

    setCachedLyrics(track, artist, data.lyrics);
    return {
      lyrics: data.lyrics,
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };
  },

  async getLyrics(track: string, artist: string): Promise<string | null> {
    const result = await this.lookupLyrics(track, artist);
    return result.lyrics;
  },
};