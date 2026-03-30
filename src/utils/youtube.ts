import { YouTubeVideo } from '@/types';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const BASE_URL = 'https://www.googleapis.com/youtube/v3';
const CACHE_PREFIX = 'yt-cache:';

interface CachePayload<T> {
  expiresAt: number;
  data: T;
}

function getCached<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const payload = JSON.parse(raw) as CachePayload<T>;
    if (Date.now() > payload.expiresAt) {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return null;
    }

    return payload.data;
  } catch {
    return null;
  }
}

function setCached<T>(key: string, data: T, ttlMs: number) {
  try {
    const payload: CachePayload<T> = {
      data,
      expiresAt: Date.now() + ttlMs,
    };

    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
  } catch {
    // Ignore cache write errors (quota/private mode)
  }
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

if (!API_KEY) {
  console.error('⚠️ YouTube API Key not found. Please add VITE_YOUTUBE_API_KEY to your .env file.');
}

export const youtubeApi = {
  /**
   * Fetch trending music videos
   * Uses videoCategoryId=10 for Music category
   */
  async getTrendingMusicVideos(maxResults = 20, regionCode = 'US') {
    try {
      const cacheKey = `trending:${regionCode}:${maxResults}`;
      const cached = getCached<any[]>(cacheKey);
      if (cached) {
        return this.transformVideos(cached);
      }

      const data = await fetchJson<{ items: any[] }>(
        `${BASE_URL}/videos?part=snippet,contentDetails,statistics&chart=mostPopular&videoCategoryId=10&maxResults=${maxResults}&regionCode=${regionCode}&key=${API_KEY}`
      );

      setCached(cacheKey, data.items || [], 1000 * 60 * 15);
      return this.transformVideos(data.items || []);
    } catch (error) {
      console.error('Error fetching trending music videos:', error);
      throw error;
    }
  },

  /**
   * Search for music videos by query
   * Uses topicId=/m/04rlf to filter music content
   */
  async searchMusicVideos(query: string, maxResults = 20, pageToken?: string) {
    try {
      const cacheKey = `search:${query.toLowerCase().trim()}:${maxResults}:${pageToken || ''}`;
      const cached = getCached<YouTubeVideo[]>(cacheKey);
      if (cached) {
        return cached;
      }

      let url = `${BASE_URL}/search?part=snippet&type=video&videoCategoryId=10&maxResults=${maxResults}&q=${encodeURIComponent(query)}&key=${API_KEY}`;
      
      if (pageToken) {
        url += `&pageToken=${pageToken}`;
      }

      const data = await fetchJson<{ items: any[] }>(url);
      
      // Get detailed information for each video
      const videoIds = (data.items || []).map((item: any) => item.id.videoId).filter(Boolean).join(',');
      const results = await this.getVideoDetails(videoIds);
      setCached(cacheKey, results, 1000 * 60 * 10);
      return results;
    } catch (error) {
      console.error('Error searching music videos:', error);
      throw error;
    }
  },

  /**
   * Get detailed information for specific video IDs
   */
  async getVideoDetails(videoIds: string) {
    try {
      if (!videoIds) {
        return [];
      }

      const normalizedIds = videoIds
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)
        .sort()
        .join(',');

      const cacheKey = `details:${normalizedIds}`;
      const cached = getCached<any[]>(cacheKey);
      if (cached) {
        return this.transformVideos(cached);
      }

      const data = await fetchJson<{ items: any[] }>(
        `${BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${normalizedIds}&key=${API_KEY}`
      );

      setCached(cacheKey, data.items || [], 1000 * 60 * 60);
      return this.transformVideos(data.items || []);
    } catch (error) {
      console.error('Error fetching video details:', error);
      throw error;
    }
  },

  /**
   * Get related music videos
   */
  async getRelatedVideos(videoId: string, maxResults = 10) {
    try {
      const cacheKey = `related:${videoId}:${maxResults}`;
      const cached = getCached<YouTubeVideo[]>(cacheKey);
      if (cached) {
        return cached;
      }

      const data = await fetchJson<{ items: any[] }>(
        `${BASE_URL}/search?part=snippet&type=video&videoCategoryId=10&relatedToVideoId=${videoId}&maxResults=${maxResults}&key=${API_KEY}`
      );
      const videoIds = (data.items || []).map((item: any) => item.id.videoId).filter(Boolean).join(',');
      const results = await this.getVideoDetails(videoIds);
      setCached(cacheKey, results, 1000 * 60 * 30);
      return results;
    } catch (error) {
      console.error('Error fetching related videos:', error);
      throw error;
    }
  },

  /**
   * Transform YouTube API response to our app format
   */
  transformVideos(items: any[]) {
    return items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnails: {
        default: item.snippet.thumbnails.default?.url || '',
        medium: item.snippet.thumbnails.medium?.url || '',
        high: item.snippet.thumbnails.high?.url || '',
        maxres: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high?.url || '',
      },
      viewCount: item.statistics?.viewCount || '0',
      publishedAt: item.snippet.publishedAt,
      duration: item.contentDetails?.duration || 'PT0S',
      description: item.snippet.description,
    }));
  },

  /**
   * Format ISO 8601 duration to readable format (e.g., "3:45")
   */
  formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    const h = parseInt(hours) || 0;
    const m = parseInt(minutes) || 0;
    const s = parseInt(seconds) || 0;

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  },

  /**
   * Format view count to readable format (e.g., "1.2M views")
   */
  formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  },
};
