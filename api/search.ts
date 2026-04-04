import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, maxResults = '25' } = req.query;

  // Validate query parameter
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const apiKey = process.env.VITE_YOUTUBE_API_KEY;
  if (!apiKey) {
    console.error('❌ YouTube API key not found in environment');
    return res.status(500).json({ error: 'YouTube API key not configured' });
  }

  try {
    const maxRes = Math.min(Number(maxResults), 50); // Cap at 50
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.append('part', 'snippet');
    url.searchParams.append('type', 'video');
    url.searchParams.append('videoCategoryId', '10'); // Music category
    url.searchParams.append('maxResults', maxRes.toString());
    url.searchParams.append('q', q.trim());
    url.searchParams.append('key', apiKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      console.error(`YouTube API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({
        error: `YouTube API error: ${response.statusText}`,
      });
    }

    const data = await response.json();

    // Transform results for Flutter (simpler format)
    const results = data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      artist: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      description: item.snippet.description,
    }));

    // Add CORS headers for mobile apps
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return res.status(200).json({
      success: true,
      query: q,
      results,
      count: results.length,
    });
  } catch (error) {
    console.error('API search error:', error);
    return res.status(500).json({
      error: 'Search failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
