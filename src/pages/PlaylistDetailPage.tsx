import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, GripVertical, Heart, Library, Play, Trash2 } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites, usePlaylists } from '@/hooks/useStorage';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';

export const PlaylistDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams<{ playlistId: string }>();
  const { playVideo } = usePlayer();
  const { playlists, loading, removeFromPlaylist, reorderPlaylistVideos } = usePlaylists();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [orderedVideos, setOrderedVideos] = useState<YouTubeVideo[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const playlist = playlists.find((item) => item.id === playlistId);

  useEffect(() => {
    setOrderedVideos(playlist?.videos ?? []);
  }, [playlist]);

  const moveVideo = (items: YouTubeVideo[], fromIndex: number, toIndex: number): YouTubeVideo[] => {
    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    return reordered;
  };

  const persistVideoOrder = async (videos: YouTubeVideo[]) => {
    if (!playlist) return;
    setOrderedVideos(videos);
    await reorderPlaylistVideos(playlist.id, videos.map((video) => video.id));
  };

  const handlePlayVideo = (video: YouTubeVideo) => {
    playVideo(video, orderedVideos);
  };

  const handlePlayAll = () => {
    if (!playlist || orderedVideos.length === 0) return;
    playVideo(orderedVideos[0], orderedVideos);
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

  const moveVideoByStep = async (videoId: string, step: -1 | 1) => {
    const fromIndex = orderedVideos.findIndex((video) => video.id === videoId);
    if (fromIndex < 0) return;

    const toIndex = fromIndex + step;
    if (toIndex < 0 || toIndex >= orderedVideos.length) return;

    const reordered = moveVideo(orderedVideos, fromIndex, toIndex);
    await persistVideoOrder(reordered);
  };

  const handleDragStart = (videoId: string) => {
    setDraggingId(videoId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, videoId: string) => {
    event.preventDefault();
    if (draggingId && draggingId !== videoId) {
      setDragOverId(videoId);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, dropId: string) => {
    event.preventDefault();
    if (!draggingId || draggingId === dropId) {
      setDragOverId(null);
      setDraggingId(null);
      return;
    }

    const fromIndex = orderedVideos.findIndex((video) => video.id === draggingId);
    const toIndex = orderedVideos.findIndex((video) => video.id === dropId);
    if (fromIndex < 0 || toIndex < 0) {
      setDragOverId(null);
      setDraggingId(null);
      return;
    }

    const reordered = moveVideo(orderedVideos, fromIndex, toIndex);
    setDragOverId(null);
    setDraggingId(null);
    await persistVideoOrder(reordered);
  };

  const handleDragEnd = () => {
    setDragOverId(null);
    setDraggingId(null);
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
              {orderedVideos.length} {orderedVideos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>

          <button
            onClick={handlePlayAll}
            disabled={orderedVideos.length === 0}
            className="px-5 py-3 bg-calypso hover:bg-chathams-blue disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            Play All
          </button>
        </div>

        {orderedVideos.length === 0 ? (
          <EmptyState
            icon={<Library className="w-16 h-16" />}
            title="No songs in this playlist"
            description="Add songs from home or search to start building this playlist."
          />
        ) : (
          <div className="space-y-3">
            {orderedVideos.map((video, index) => (
              <div
                key={video.id}
                draggable
                onDragStart={() => handleDragStart(video.id)}
                onDragOver={(event) => handleDragOver(event, video.id)}
                onDrop={(event) => {
                  void handleDrop(event, video.id);
                }}
                onDragEnd={handleDragEnd}
                className={`bg-gable-green/90 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all ${
                  dragOverId === video.id ? 'ring-2 ring-calypso' : ''
                } ${draggingId === video.id ? 'opacity-60' : ''}`}
              >
                <div className="hidden sm:flex flex-col items-center text-timberwolf opacity-70">
                  <GripVertical className="w-4 h-4" />
                  <span className="text-[10px] uppercase tracking-wide">Drag</span>
                </div>

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
                    onClick={() => void moveVideoByStep(video.id, -1)}
                    disabled={index === 0}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Move ${video.title} up`}
                  >
                    <ArrowUp className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => void moveVideoByStep(video.id, 1)}
                    disabled={index === orderedVideos.length - 1}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Move ${video.title} down`}
                  >
                    <ArrowDown className="w-4 h-4 text-white" />
                  </button>
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
