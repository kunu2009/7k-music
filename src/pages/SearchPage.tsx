import React, { useState } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { VideoCard } from '@/components/VideoCard';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/hooks/useStorage';
import { Search as SearchIcon } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { playVideo } = usePlayer();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const handleSearch = async (query: string) => {
    try {
      setLoading(true);
      setHasSearched(true);
      const results = await youtubeApi.searchMusicVideos(query, 20);
      setSearchResults(results);
    } catch (err) {
      console.error('Error searching videos:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

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
          <LoadingSpinner size="lg" text="Searching for music videos..." />
        ) : !hasSearched ? (
          <EmptyState
            icon={<SearchIcon className="w-16 h-16" />}
            title="Start Searching"
            description="Enter a song name, artist, or genre to find music videos."
          />
        ) : searchResults.length === 0 ? (
          <EmptyState
            icon={<SearchIcon className="w-16 h-16" />}
            title="No Results Found"
            description="Try searching with different keywords or check your spelling."
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
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
