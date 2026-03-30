import React, { useEffect, useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { VideoCard } from '@/components/VideoCard';
import { EmptyState, VideoGridSkeleton } from '@/components/common';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites, usePlaylists } from '@/hooks/useStorage';
import { PlaylistPickerModal } from '@/components/PlaylistPickerModal';
import { Search as SearchIcon } from 'lucide-react';

const SEARCH_CACHE_PREFIX = 'search-cache-v1:';

export const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [selectedVideoForPlaylist, setSelectedVideoForPlaylist] = useState<YouTubeVideo | null>(null);
  const [lastQuery, setLastQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { playVideo } = usePlayer();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { playlists, addToPlaylist, createPlaylist } = usePlaylists();

  const handleSearch = async (query: string) => {
    const normalizedQuery = query.trim().toLowerCase();
    setLastQuery(query);
    try {
      setLoading(true);
      setHasSearched(true);
      setError(null);
      const results = await youtubeApi.searchMusicVideos(query, 20);
      setSearchResults(results);
      localStorage.setItem(`${SEARCH_CACHE_PREFIX}${normalizedQuery}`, JSON.stringify({ results, cachedAt: Date.now() }));
    } catch (err) {
      console.error('Error searching videos:', err);
      try {
        const cached = localStorage.getItem(`${SEARCH_CACHE_PREFIX}${normalizedQuery}`);
        if (cached) {
          const parsed = JSON.parse(cached) as { results: YouTubeVideo[] };
          if (Array.isArray(parsed.results) && parsed.results.length > 0) {
            setSearchResults(parsed.results);
            setError('Showing cached results. Connect to refresh.');
            return;
          }
        }
      } catch (cacheError) {
        console.error('Error reading search cache:', cacheError);
      }

      setSearchResults([]);
      setError('Search failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!error || !lastQuery.trim()) {
      return;
    }

    const onReconnect = () => {
      handleSearch(lastQuery);
    };

    window.addEventListener('online', onReconnect);
    return () => window.removeEventListener('online', onReconnect);
  }, [error, lastQuery]);

  const handlePlay = (video: YouTubeVideo) => {
    playVideo(video, searchResults);
  };

  const handleFavorite = async (video: YouTubeVideo) => {
    if (isFavorite(video.id)) {
      await removeFavorite(video.id);
    } else {
      await addFavorite(video);
    }
  };

  const handleAddToPlaylist = async (video: YouTubeVideo) => {
    setSelectedVideoForPlaylist(video);
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    if (!selectedVideoForPlaylist) return;
    await addToPlaylist(playlistId, selectedVideoForPlaylist);
  };

  const handleCreateAndAdd = async (playlistName: string) => {
    if (!selectedVideoForPlaylist) return;
    const created = await createPlaylist(playlistName);
    if (created) {
      await addToPlaylist(created.id, selectedVideoForPlaylist);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gable-green to-black pt-20 pb-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <SearchIcon className="w-8 h-8 text-calypso" />
            <h2 className="text-3xl font-bold text-white">Search Music</h2>
          </div>
          <p className="text-timberwolf opacity-75 mb-6">
            Find your favorite music videos from YouTube
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <VideoGridSkeleton count={8} />
        ) : !hasSearched ? (
          <EmptyState
            icon={<SearchIcon className="w-16 h-16" />}
            title="Start Searching"
            description="Enter a song name, artist, or genre to find music videos."
          />
        ) : error && searchResults.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-timberwolf opacity-75">{error}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlay}
                  onFavorite={handleFavorite}
                  isFavorite={isFavorite(video.id)}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              ))}
            </div>
          </>
        ) : searchResults.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="w-16 h-16" />}
            title="No Results Found"
            description={error || 'Try searching with different keywords or check your spelling.'}
          />
        ) : (
          <>
            <div className="mb-6">
              <p className="text-timberwolf opacity-75">
                Found {searchResults.length} results
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlay}
                  onFavorite={handleFavorite}
                  isFavorite={isFavorite(video.id)}
                  onAddToPlaylist={handleAddToPlaylist}
                />
              ))}
            </div>
          </>
        )}

        <PlaylistPickerModal
          isOpen={!!selectedVideoForPlaylist}
          playlists={playlists}
          onClose={() => setSelectedVideoForPlaylist(null)}
          onSelectPlaylist={handleSelectPlaylist}
          onCreateAndAdd={handleCreateAndAdd}
        />
      </div>
    </div>
  );
};
