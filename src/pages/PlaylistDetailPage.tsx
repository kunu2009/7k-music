import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, Library, Play, Trash2 } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites, usePlaylists } from '@/hooks/useStorage';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';

export const PlaylistDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams<{ playlistId: string }>();
  const { playVideo } = usePlayer();
  const { playlists, loading, removeFromPlaylist } = usePlaylists();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const playlist = playlists.find((item) => item.id === playlistId);

  const handlePlayVideo = (video: YouTubeVideo) => {
    if (!playlist) return;
    playVideo(video, playlist.videos);
  };

  const handlePlayAll = () => {
    if (!playlist || playlist.videos.length === 0) return;
    playVideo(playlist.videos[0], playlist.videos);
  };

  const handleRemoveVideo = async (videoId: string) => {
    if (!playlist) return;
    await removeFromPlaylist(playlist.id, videoId);
  };

  const handleToggleFavorite = async (video: YouTubeVideo) => {
    if (isFavorite(video.id)) {
      await removeFavorite(video.id);
      return;
    }
    await addFavorite(video);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gable-green to-black pt-20 pb-32">
        <div className="container mx-auto px-4">
          <LoadingSpinner size="lg" text="Loading playlist..." />
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gable-green to-black pt-20 pb-32">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/playlists')}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Playlists
          </button>
          <EmptyState
            icon={<Library className="w-16 h-16" />}
            title="Playlist not found"
            description="This playlist may have been removed."
            action={{
              label: 'Go to Playlists',
              onClick: () => navigate('/playlists'),
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gable-green to-black pt-20 pb-32">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/playlists')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Playlists
        </button>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{playlist.name}</h2>
            <p className="text-timberwolf opacity-75">
              {playlist.videos.length} {playlist.videos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>

          <button
            onClick={handlePlayAll}
            disabled={playlist.videos.length === 0}
            className="px-5 py-3 bg-calypso hover:bg-chathams-blue disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Play All
          </button>
        </div>

        {playlist.videos.length === 0 ? (
          <EmptyState
            icon={<Library className="w-16 h-16" />}
            title="No songs in this playlist"
            description="Add songs from home or search to start building this playlist."
          />
        ) : (
          <div className="space-y-3">
            {playlist.videos.map((video, index) => (
              <div
                key={video.id}
                className="bg-gable-green/90 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
              >
                <button
                  onClick={() => handlePlayVideo(video)}
                  className="relative shrink-0 rounded-lg overflow-hidden group"
                  aria-label={`Play ${video.title}`}
                >
                  <img
                    src={video.thumbnails.medium}
                    alt={video.title}
                    className="w-28 sm:w-32 aspect-video object-cover"
                    loading="lazy"
                  />
                  <span className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                    <Play className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
                  </span>
                </button>

                <div className="min-w-0 flex-1">
                  <p className="text-xs text-timberwolf opacity-70 mb-1">#{index + 1}</p>
                  <h3 className="text-white font-semibold line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-timberwolf opacity-80 truncate">{video.channelTitle}</p>
                  <p className="text-xs text-timberwolf opacity-60 mt-1">
                    {video.duration ? youtubeApi.formatDuration(video.duration) : 'Live/Unknown'}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => void handleToggleFavorite(video)}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label={isFavorite(video.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(video.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                  </button>
                  <button
                    onClick={() => void handleRemoveVideo(video.id)}
                    className="p-2 rounded-full hover:bg-red-500/80 transition-colors"
                    aria-label={`Remove ${video.title} from playlist`}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
