import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { YouTubeVideo, Playlist } from '@/types';

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

  const createPlaylist = useCallback(async (name: string) => {
    try {
      const playlist = await storage.createPlaylist(name);
      setPlaylists((prev) => sortPlaylists([...prev, playlist]));
      return playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return undefined;
    }
  }, []);

  const deletePlaylist = useCallback(async (id: string) => {
    try {
      setPlaylists((prev) => prev.filter((playlist) => playlist.id !== id));
      await storage.deletePlaylist(id);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      await loadPlaylists();
    }
  }, [loadPlaylists]);

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
      await loadPlaylists();
    }
  }, [loadPlaylists]);

  const duplicatePlaylist = useCallback(async (id: string) => {
    try {
      const playlist = await storage.duplicatePlaylist(id);
      setPlaylists((prev) => sortPlaylists([...prev, playlist]));
      return playlist;
    } catch (error) {
      console.error('Error duplicating playlist:', error);
      return undefined;
    }
  }, []);

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
      await loadPlaylists();
    }
  }, [loadPlaylists]);

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
      await loadPlaylists();
    }
  }, [loadPlaylists]);

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
      await loadPlaylists();
    }
  }, [loadPlaylists]);

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
      await loadPlaylists();
    }
  }, [loadPlaylists]);

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
      await storage.reorderPlaylists(playlistIdsInOrder);
    } catch (error) {
      console.error('Error reordering playlists:', error);
      await loadPlaylists();
    }
  }, [loadPlaylists]);

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
      await storage.reorderPlaylistVideos(playlistId, videoIdsInOrder);
    } catch (error) {
      console.error('Error reordering playlist videos:', error);
      await loadPlaylists();
    }
  }, [loadPlaylists]);

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
