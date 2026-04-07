import { useState, useEffect, useCallback, useRef } from 'react';
import { storage } from '@/utils/storage';
import { YouTubeVideo, Playlist } from '@/types';
import { emitAppNotice } from '@/utils/appNotice';

function sortPlaylists(playlists: Playlist[]) {
  return [...playlists].sort((a, b) => {
    const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
    if (aOrder === bOrder) {
      return b.updatedAt.localeCompare(a.updatedAt);
    }
    return aOrder - bOrder;
  });
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      const favs = await storage.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const addFavorite = useCallback(async (video: YouTubeVideo) => {
    try {
      await storage.addToFavorites(video);
      await loadFavorites();
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  }, [loadFavorites]);

  const removeFavorite = useCallback(async (videoId: string) => {
    try {
      await storage.removeFromFavorites(videoId);
      await loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  }, [loadFavorites]);

  const isFavorite = useCallback((videoId: string) => {
    return favorites.some(v => v.id === videoId);
  }, [favorites]);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
    refresh: loadFavorites,
  };
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const reorderPlaylistsTimerRef = useRef<number | null>(null);
  const pendingPlaylistOrderRef = useRef<string[] | null>(null);
  const reorderVideosTimersRef = useRef<Record<string, number>>({});
  const pendingVideoOrdersRef = useRef<Record<string, string[]>>({});

  const notifyPlaylistPersistError = useCallback((operation: string) => {
    emitAppNotice(`Could not ${operation}. We reloaded your playlists.`);
  }, []);

  const loadPlaylists = useCallback(async () => {
    try {
      const pls = await storage.getPlaylists();
      setPlaylists(pls);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  useEffect(() => {
    return () => {
      if (reorderPlaylistsTimerRef.current) {
        window.clearTimeout(reorderPlaylistsTimerRef.current);
      }

      Object.values(reorderVideosTimersRef.current).forEach((timerId) => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  const schedulePersistPlaylistOrder = useCallback((playlistIdsInOrder: string[]) => {
    pendingPlaylistOrderRef.current = playlistIdsInOrder;

    if (reorderPlaylistsTimerRef.current) {
      window.clearTimeout(reorderPlaylistsTimerRef.current);
    }

    reorderPlaylistsTimerRef.current = window.setTimeout(() => {
      const pendingOrder = pendingPlaylistOrderRef.current;
      pendingPlaylistOrderRef.current = null;
      reorderPlaylistsTimerRef.current = null;

      if (!pendingOrder) {
        return;
      }

      void (async () => {
        try {
          await storage.reorderPlaylists(pendingOrder);
        } catch (error) {
          console.error('Error persisting playlist order:', error);
          notifyPlaylistPersistError('save playlist order');
          await loadPlaylists();
        }
      })();
    }, 280);
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const schedulePersistPlaylistVideoOrder = useCallback((playlistId: string, videoIdsInOrder: string[]) => {
    pendingVideoOrdersRef.current[playlistId] = videoIdsInOrder;

    const existingTimer = reorderVideosTimersRef.current[playlistId];
    if (existingTimer) {
      window.clearTimeout(existingTimer);
    }

    reorderVideosTimersRef.current[playlistId] = window.setTimeout(() => {
      const pendingOrder = pendingVideoOrdersRef.current[playlistId];
      delete pendingVideoOrdersRef.current[playlistId];
      delete reorderVideosTimersRef.current[playlistId];

      if (!pendingOrder) {
        return;
      }

      void (async () => {
        try {
          await storage.reorderPlaylistVideos(playlistId, pendingOrder);
        } catch (error) {
          console.error('Error persisting playlist video order:', error);
          notifyPlaylistPersistError('save song order');
          await loadPlaylists();
        }
      })();
    }, 280);
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const createPlaylist = useCallback(async (name: string) => {
    try {
      const playlist = await storage.createPlaylist(name);
      setPlaylists((prev) => sortPlaylists([...prev, playlist]));
      return playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      notifyPlaylistPersistError('create playlist');
      return undefined;
    }
  }, [notifyPlaylistPersistError]);

  const deletePlaylist = useCallback(async (id: string) => {
    try {
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== id));
      await storage.deletePlaylist(id);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      notifyPlaylistPersistError('delete playlist');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const renamePlaylist = useCallback(async (id: string, name: string) => {
    try {
      const updatedAt = new Date().toISOString();
      setPlaylists((prev) =>
        sortPlaylists(
          prev.map((playlist) =>
            playlist.id === id
              ? {
                  ...playlist,
                  name,
                  updatedAt,
                }
              : playlist
          )
        )
      );
      await storage.renamePlaylist(id, name);
    } catch (error) {
      console.error('Error renaming playlist:', error);
      notifyPlaylistPersistError('rename playlist');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const duplicatePlaylist = useCallback(async (id: string) => {
    try {
      const playlist = await storage.duplicatePlaylist(id);
      setPlaylists((prev) => sortPlaylists([...prev, playlist]));
      return playlist;
    } catch (error) {
      console.error('Error duplicating playlist:', error);
      notifyPlaylistPersistError('duplicate playlist');
      return undefined;
    }
  }, [notifyPlaylistPersistError]);

  const addToPlaylist = useCallback(async (playlistId: string, video: YouTubeVideo) => {
    try {
      let changed = false;
      const updatedAt = new Date().toISOString();
      setPlaylists((prev) =>
        sortPlaylists(
          prev.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;
            if (playlist.videos.some((item) => item.id === video.id)) {
              return playlist;
            }

            changed = true;
            return {
              ...playlist,
              videos: [...playlist.videos, video],
              updatedAt,
            };
          })
        )
      );

      if (!changed) {
        return;
      }

      await storage.addToPlaylist(playlistId, video);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      notifyPlaylistPersistError('add song to playlist');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const removeFromPlaylist = useCallback(async (playlistId: string, videoId: string) => {
    try {
      const updatedAt = new Date().toISOString();
      setPlaylists((prev) =>
        sortPlaylists(
          prev.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  videos: playlist.videos.filter((video) => video.id !== videoId),
                  updatedAt,
                }
              : playlist
          )
        )
      );
      await storage.removeFromPlaylist(playlistId, videoId);
    } catch (error) {
      console.error('Error removing from playlist:', error);
      notifyPlaylistPersistError('remove song from playlist');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const removeManyFromPlaylist = useCallback(async (playlistId: string, videoIds: string[]) => {
    try {
      const removeSet = new Set(videoIds);
      const updatedAt = new Date().toISOString();
      setPlaylists((prev) =>
        sortPlaylists(
          prev.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  videos: playlist.videos.filter((video) => !removeSet.has(video.id)),
                  updatedAt,
                }
              : playlist
          )
        )
      );
      await storage.removeManyFromPlaylist(playlistId, videoIds);
    } catch (error) {
      console.error('Error removing multiple videos from playlist:', error);
      notifyPlaylistPersistError('remove selected songs');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const replacePlaylistVideos = useCallback(async (playlistId: string, videos: YouTubeVideo[]) => {
    try {
      const updatedAt = new Date().toISOString();
      setPlaylists((prev) =>
        sortPlaylists(
          prev.map((playlist) =>
            playlist.id === playlistId
              ? {
                  ...playlist,
                  videos,
                  updatedAt,
                }
              : playlist
          )
        )
      );
      await storage.replacePlaylistVideos(playlistId, videos);
    } catch (error) {
      console.error('Error replacing playlist videos:', error);
      notifyPlaylistPersistError('restore playlist songs');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError]);

  const reorderPlaylists = useCallback(async (playlistIdsInOrder: string[]) => {
    try {
      setPlaylists((prev) =>
        sortPlaylists(
          prev.map((playlist) => {
            const order = playlistIdsInOrder.indexOf(playlist.id);
            if (order === -1) return playlist;
            return {
              ...playlist,
              order,
            };
          })
        )
      );
      schedulePersistPlaylistOrder(playlistIdsInOrder);
    } catch (error) {
      console.error('Error reordering playlists:', error);
      notifyPlaylistPersistError('reorder playlists');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError, schedulePersistPlaylistOrder]);

  const reorderPlaylistVideos = useCallback(async (playlistId: string, videoIdsInOrder: string[]) => {
    try {
      const updatedAt = new Date().toISOString();
      setPlaylists((prev) =>
        sortPlaylists(
          prev.map((playlist) => {
            if (playlist.id !== playlistId) return playlist;

            const byId = new Map(playlist.videos.map((video) => [video.id, video]));
            const reordered = videoIdsInOrder
              .map((videoId) => byId.get(videoId))
              .filter((video): video is YouTubeVideo => !!video);

            const includedIds = new Set(reordered.map((video) => video.id));
            for (const video of playlist.videos) {
              if (!includedIds.has(video.id)) {
                reordered.push(video);
              }
            }

            return {
              ...playlist,
              videos: reordered,
              updatedAt,
            };
          })
        )
      );
      schedulePersistPlaylistVideoOrder(playlistId, videoIdsInOrder);
    } catch (error) {
      console.error('Error reordering playlist videos:', error);
      notifyPlaylistPersistError('reorder playlist songs');
      await loadPlaylists();
    }
  }, [loadPlaylists, notifyPlaylistPersistError, schedulePersistPlaylistVideoOrder]);

  return {
    playlists,
    loading,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
    duplicatePlaylist,
    addToPlaylist,
    removeFromPlaylist,
    removeManyFromPlaylist,
    replacePlaylistVideos,
    reorderPlaylists,
    reorderPlaylistVideos,
    refresh: loadPlaylists,
  };
}

export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecentlyPlayed = useCallback(async () => {
    try {
      const recent = await storage.getRecentlyPlayed();
      setRecentlyPlayed(recent);
    } catch (error) {
      console.error('Error loading recently played:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecentlyPlayed();
  }, [loadRecentlyPlayed]);

  const addToRecentlyPlayed = useCallback(async (video: YouTubeVideo) => {
    try {
      await storage.addToRecentlyPlayed(video);
      await loadRecentlyPlayed();
    } catch (error) {
      console.error('Error adding to recently played:', error);
    }
  }, [loadRecentlyPlayed]);

  return {
    recentlyPlayed,
    loading,
    addToRecentlyPlayed,
    refresh: loadRecentlyPlayed,
  };
}
