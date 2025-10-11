import React from 'react';
import { VideoCard } from '@/components/VideoCard';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/hooks/useStorage';
import { Heart } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { playVideo } = usePlayer();
  const { favorites, loading, removeFavorite, isFavorite } = useFavorites();

  const handlePlay = (video: any) => {
    playVideo(video, favorites);
  };

  const handleFavorite = async (video: any) => {
    if (isFavorite(video.id)) {
      await removeFavorite(video.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gable-green to-black pt-20 pb-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h2 className="text-3xl font-bold text-white">Your Favorites</h2>
          </div>
          <p className="text-timberwolf opacity-75">
            Music videos you've saved for quick access
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading your favorites..." />
        ) : favorites.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-16 h-16" />}
            title="No Favorites Yet"
            description="Start adding music videos to your favorites by clicking the heart icon."
          />
        ) : (
          <>
            <div className="mb-6">
              <p className="text-timberwolf opacity-75">
                {favorites.length} {favorites.length === 1 ? 'video' : 'videos'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((video) => (
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
