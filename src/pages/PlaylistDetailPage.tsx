import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowDown, ArrowLeft, ArrowUp, Check, GripVertical, Heart, Library, Play, Plus, Search, SkipForward, Square, Trash2, X } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites, usePlaylists } from '@/hooks/useStorage';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';

export const PlaylistDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { playlistId } = useParams<{ playlistId: string }>();
  const { playVideo, addToQueue, addToQueueNext } = usePlayer();
  const { playlists, loading, removeFromPlaylist, removeManyFromPlaylist, replacePlaylistVideos, reorderPlaylistVideos } = usePlaylists();
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [orderedVideos, setOrderedVideos] = useState<YouTubeVideo[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [undoBulkRemove, setUndoBulkRemove] = useState<{
    playlistId: string;
    previousVideos: YouTubeVideo[];
    removedCount: number;
  } | null>(null);

  const playlist = playlists.find((item) => item.id === playlistId);
  const isFiltering = searchQuery.trim().length > 0;

  const filteredVideos = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return orderedVideos;
    }

    return orderedVideos.filter((video) => {
      const title = video.title.toLowerCase();
      const channel = video.channelTitle.toLowerCase();
      return title.includes(normalizedQuery) || channel.includes(normalizedQuery);
    });
  }, [orderedVideos, searchQuery]);

  useEffect(() => {
    setOrderedVideos(playlist?.videos ?? []);
  }, [playlist]);

  useEffect(() => {
    if (!isSelectMode) {
      setSelectedVideoIds([]);
    }
  }, [isSelectMode]);

  useEffect(() => {
    if (!undoBulkRemove) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setUndoBulkRemove(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [undoBulkRemove]);

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
    if (isSelectMode) {
      return;
    }
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
    if (isSelectMode) {
      return;
    }
    if (isFavorite(video.id)) {
      await removeFavorite(video.id);
      return;
    }
    await addFavorite(video);
  };

  const handlePlayNext = (video: YouTubeVideo) => {
    if (isSelectMode) {
      return;
    }
    addToQueueNext(video);
  };

  const handleAddToQueue = (video: YouTubeVideo) => {
    if (isSelectMode) {
      return;
    }
    addToQueue(video);
  };

  const moveVideoByStep = async (videoId: string, step: -1 | 1) => {
    if (isSelectMode || isFiltering) {
      return;
    }

    const fromIndex = orderedVideos.findIndex((video) => video.id === videoId);
    if (fromIndex < 0) return;

    const toIndex = fromIndex + step;
    if (toIndex < 0 || toIndex >= orderedVideos.length) return;

    const reordered = moveVideo(orderedVideos, fromIndex, toIndex);
    await persistVideoOrder(reordered);
  };

  const handleDragStart = (videoId: string) => {
    if (isSelectMode || isFiltering) {
      return;
    }
    setDraggingId(videoId);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, videoId: string) => {
    if (isSelectMode || isFiltering) {
      return;
    }
    event.preventDefault();
    if (draggingId && draggingId !== videoId) {
      setDragOverId(videoId);
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>, dropId: string) => {
    if (isSelectMode || isFiltering) {
      return;
    }
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

  const toggleSelectedVideo = (videoId: string) => {
    setSelectedVideoIds((prev) => {
      if (prev.includes(videoId)) {
        return prev.filter((id) => id !== videoId);
      }
      return [...prev, videoId];
    });
  };

  const toggleSelectAll = () => {
    setSelectedVideoIds((prev) => {
      const visibleIds = filteredVideos.map((video) => video.id);
      const allVisibleSelected = visibleIds.every((id) => prev.includes(id));
      if (allVisibleSelected) {
        return prev.filter((id) => !visibleIds.includes(id));
      }

      const next = new Set(prev);
      for (const id of visibleIds) {
        next.add(id);
      }
      return Array.from(next);
    });
  };

  const handleRemoveSelected = async () => {
    if (!playlist || selectedVideoIds.length === 0) {
      return;
    }

    const selectedCount = selectedVideoIds.length;
    const confirmed = confirm(`Remove ${selectedCount} selected ${selectedCount === 1 ? 'song' : 'songs'} from this playlist?`);
    if (!confirmed) {
      return;
    }

    const previousVideos = [...orderedVideos];
    await removeManyFromPlaylist(playlist.id, selectedVideoIds);
    setUndoBulkRemove({
      playlistId: playlist.id,
      previousVideos,
      removedCount: selectedCount,
    });
    setSelectedVideoIds([]);
    setIsSelectMode(false);
  };

  const handleUndoBulkRemove = async () => {
    if (!playlist || !undoBulkRemove || undoBulkRemove.playlistId !== playlist.id) {
      return;
    }

    await replacePlaylistVideos(playlist.id, undoBulkRemove.previousVideos);
    setOrderedVideos(undoBulkRemove.previousVideos);
    setUndoBulkRemove(null);
  };

  if (loading) {
    return (
      <div className="app-page">
        <div className="container mx-auto px-4">
          <LoadingSpinner size="lg" text="Loading playlist..." />
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="app-page">
        <div className="container mx-auto px-4">
          <button
            onClick={() => navigate('/playlists')}
            className="mb-6 inline-flex items-center gap-2 px-4 py-2 pill-action"
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
    <div className="app-page">
      <div className="container mx-auto px-4">
        <button
          onClick={() => navigate('/playlists')}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 pill-action"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Playlists
        </button>

        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{playlist.name}</h2>
            <p className="text-blue-100/75">
              {orderedVideos.length} {orderedVideos.length === 1 ? 'video' : 'videos'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isSelectMode ? (
              <>
                <button
                  onClick={() => setIsSelectMode(true)}
                  disabled={orderedVideos.length === 0}
                  className="px-4 py-3 pill-action disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Select
                </button>
                <button
                  onClick={handlePlayAll}
                  disabled={orderedVideos.length === 0}
                  className="px-5 py-3 pill-action disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Play All
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={toggleSelectAll}
                  className="px-4 py-3 pill-action inline-flex items-center gap-2"
                >
                  {selectedVideoIds.length === orderedVideos.length ? <Check className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  {selectedVideoIds.length === orderedVideos.length ? 'Clear All' : 'Select All'}
                </button>
                <button
                  onClick={() => void handleRemoveSelected()}
                  disabled={selectedVideoIds.length === 0}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors inline-flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove Selected ({selectedVideoIds.length})
                </button>
                <button
                  onClick={() => setIsSelectMode(false)}
                  className="px-4 py-3 pill-action inline-flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="w-4 h-4 text-timberwolf opacity-80 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search songs in this playlist"
              className="w-full bg-white/10 border border-blue-100/20 rounded-xl pl-10 pr-10 py-2.5 text-white placeholder:text-blue-100/60 outline-none focus:border-blue-200/60"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-100/70 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {isFiltering && (
            <p className="text-xs text-blue-100/80 mt-2">
              {filteredVideos.length} matching {filteredVideos.length === 1 ? 'song' : 'songs'}
            </p>
          )}
        </div>

        {orderedVideos.length === 0 ? (
          <EmptyState
            icon={<Library className="w-16 h-16" />}
            title="No songs in this playlist"
            description="Add songs from home or search to start building this playlist."
          />
        ) : (
          <div className="space-y-3">
            {filteredVideos.map((video) => {
              const index = orderedVideos.findIndex((item) => item.id === video.id);
              return (
              <div
                key={video.id}
                draggable={!isFiltering}
                onDragStart={() => handleDragStart(video.id)}
                onDragOver={(event) => handleDragOver(event, video.id)}
                onDrop={(event) => {
                  void handleDrop(event, video.id);
                }}
                onDragEnd={handleDragEnd}
                className={`bg-gable-green/90 border border-white/5 rounded-xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all ${
                  dragOverId === video.id ? 'ring-2 ring-blue-200/70' : ''
                } ${draggingId === video.id ? 'opacity-60' : ''} ${selectedVideoIds.includes(video.id) ? 'ring-2 ring-white/70' : ''}`}
              >
                {isSelectMode ? (
                  <button
                    onClick={() => toggleSelectedVideo(video.id)}
                    className="p-2 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                    aria-label={selectedVideoIds.includes(video.id) ? `Deselect ${video.title}` : `Select ${video.title}`}
                  >
                    {selectedVideoIds.includes(video.id) ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Square className="w-4 h-4 text-white" />
                    )}
                  </button>
                ) : (
                  <div className="hidden sm:flex flex-col items-center text-blue-100/70">
                    <GripVertical className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-wide">{isFiltering ? 'View' : 'Drag'}</span>
                  </div>
                )}

                <button
                  onClick={() => handlePlayVideo(video)}
                  disabled={isSelectMode}
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
                  <p className="text-sm text-blue-100/80 truncate">{video.channelTitle}</p>
                  <p className="text-xs text-blue-100/60 mt-1">
                    {video.duration ? youtubeApi.formatDuration(video.duration) : 'Live/Unknown'}
                  </p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => void moveVideoByStep(video.id, -1)}
                    disabled={isSelectMode || isFiltering || index === 0}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Move ${video.title} up`}
                  >
                    <ArrowUp className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => void moveVideoByStep(video.id, 1)}
                    disabled={isSelectMode || isFiltering || index === orderedVideos.length - 1}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Move ${video.title} down`}
                  >
                    <ArrowDown className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => void handleToggleFavorite(video)}
                    disabled={isSelectMode}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors"
                    aria-label={isFavorite(video.id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite(video.id) ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                  </button>
                  <button
                    onClick={() => void handleRemoveVideo(video.id)}
                    disabled={isSelectMode}
                    className="p-2 rounded-full hover:bg-red-500/80 transition-colors"
                    aria-label={`Remove ${video.title} from playlist`}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handlePlayNext(video)}
                    disabled={isSelectMode}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Play ${video.title} next`}
                  >
                    <SkipForward className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => handleAddToQueue(video)}
                    disabled={isSelectMode}
                    className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label={`Add ${video.title} to queue`}
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </div>

      {undoBulkRemove && undoBulkRemove.playlistId === playlist.id && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
          <div className="bg-black/90 border border-white/15 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-white shadow-2xl">
            <p className="text-sm">
              Removed {undoBulkRemove.removedCount} {undoBulkRemove.removedCount === 1 ? 'song' : 'songs'}
            </p>
            <button
              onClick={() => void handleUndoBulkRemove()}
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors text-sm font-semibold"
            >
              Undo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
