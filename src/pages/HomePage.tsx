import React, { useState, useEffect } from 'react';
import { VideoCard } from '@/components/VideoCard';
import { EmptyState, VideoGridSkeleton } from '@/components/common';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites, usePlaylists } from '@/hooks/useStorage';
import { PlaylistPickerModal } from '@/components/PlaylistPickerModal';
import { TrendingUp, Music2 } from 'lucide-react';

const HOME_CACHE_KEY = 'home-trending-cache-v1';

export const HomePage: React.FC = () => {
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideo[]>([]);
  const [selectedVideoForPlaylist, setSelectedVideoForPlaylist] = useState<YouTubeVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { playVideo } = usePlayer();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { playlists, addToPlaylist, createPlaylist } = usePlaylists();

  useEffect(() => {
    try {
      const cached = localStorage.getItem(HOME_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as { videos: YouTubeVideo[] };
        if (Array.isArray(parsed.videos) && parsed.videos.length > 0) {
          setTrendingVideos(parsed.videos);
          setLoading(false);
        }
      }
    } catch (cacheError) {
      console.error('Failed to read home cache:', cacheError);
    }

    loadTrendingVideos();
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const onReconnect = () => {
      loadTrendingVideos();
    };

    window.addEventListener('online', onReconnect);
    return () => window.removeEventListener('online', onReconnect);
  }, [error]);

  const loadTrendingVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const videos = await youtubeApi.getTrendingMusicVideos(24);
      setTrendingVideos(videos);
      localStorage.setItem(HOME_CACHE_KEY, JSON.stringify({ videos, cachedAt: Date.now() }));
    } catch (err) {
      console.error('Error loading trending videos:', err);
      if (trendingVideos.length === 0) {
        setError('Failed to load trending music videos. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (video: YouTubeVideo) => {
    playVideo(video, trendingVideos);
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
            <TrendingUp className="w-8 h-8 text-calypso" />
            <h2 className="text-3xl font-bold text-white">Trending Music</h2>
          </div>
          <p className="text-timberwolf opacity-75">
            Discover the hottest music videos trending right now
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <VideoGridSkeleton count={12} />
        ) : error ? (
          <EmptyState
            icon={<Music2 className="w-16 h-16" />}
            title="Failed to Load Videos"
            description={error}
            action={{
              label: 'Try Again',
              onClick: loadTrendingVideos,
            }}
          />
        ) : trendingVideos.length === 0 ? (
          <EmptyState
            icon={<Music2 className="w-16 h-16" />}
            title="No Videos Found"
            description="We couldn't find any trending music videos at the moment."
            action={{
              label: 'Refresh',
              onClick: loadTrendingVideos,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingVideos.map((video) => (
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
        )}

        {/* Legal Notice */}
        <div className="mt-12 p-6 bg-chathams-blue bg-opacity-30 rounded-lg border border-calypso">
          <h3 className="text-white font-semibold mb-2">📜 Legal & Ethical Notice</h3>
          <p className="text-timberwolf text-sm opacity-90">
            All videos are streamed through the official YouTube IFrame Player API. 
            We do not download, store, or modify any copyrighted content. 
            All content remains on YouTube's servers and is subject to their Terms of Service. 
            YouTube branding and controls are preserved as required.
          </p>
        </div>

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
