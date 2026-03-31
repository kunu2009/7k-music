import { useState, useEffect, useCallback } from 'react';
import { storage } from '@/utils/storage';
import { YouTubeVideo, Playlist } from '@/types';

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
      await loadPlaylists();
      return playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      return undefined;
    }
  }, [loadPlaylists]);

  const deletePlaylist = useCallback(async (id: string) => {
    try {
      await storage.deletePlaylist(id);
      await loadPlaylists();
    } catch (error) {
      console.error('Error deleting playlist:', error);
    }
  }, [loadPlaylists]);

  const renamePlaylist = useCallback(async (id: string, name: string) => {
    try {
      await storage.renamePlaylist(id, name);
      await loadPlaylists();
    } catch (error) {
      console.error('Error renaming playlist:', error);
    }
  }, [loadPlaylists]);

  const duplicatePlaylist = useCallback(async (id: string) => {
    try {
      const playlist = await storage.duplicatePlaylist(id);
      await loadPlaylists();
      return playlist;
    } catch (error) {
      console.error('Error duplicating playlist:', error);
      return undefined;
    }
  }, [loadPlaylists]);

  const addToPlaylist = useCallback(async (playlistId: string, video: YouTubeVideo) => {
    try {
      await storage.addToPlaylist(playlistId, video);
      await loadPlaylists();
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  }, [loadPlaylists]);

  const removeFromPlaylist = useCallback(async (playlistId: string, videoId: string) => {
    try {
      await storage.removeFromPlaylist(playlistId, videoId);
      await loadPlaylists();
    } catch (error) {
      console.error('Error removing from playlist:', error);
    }
  }, [loadPlaylists]);

  const removeManyFromPlaylist = useCallback(async (playlistId: string, videoIds: string[]) => {
    try {
      await storage.removeManyFromPlaylist(playlistId, videoIds);
      await loadPlaylists();
    } catch (error) {
      console.error('Error removing multiple videos from playlist:', error);
    }
  }, [loadPlaylists]);

  const replacePlaylistVideos = useCallback(async (playlistId: string, videos: YouTubeVideo[]) => {
    try {
      await storage.replacePlaylistVideos(playlistId, videos);
      await loadPlaylists();
    } catch (error) {
      console.error('Error replacing playlist videos:', error);
    }
  }, [loadPlaylists]);

  const reorderPlaylists = useCallback(async (playlistIdsInOrder: string[]) => {
    try {
      await storage.reorderPlaylists(playlistIdsInOrder);
      await loadPlaylists();
    } catch (error) {
      console.error('Error reordering playlists:', error);
    }
  }, [loadPlaylists]);

  const reorderPlaylistVideos = useCallback(async (playlistId: string, videoIdsInOrder: string[]) => {
    try {
      await storage.reorderPlaylistVideos(playlistId, videoIdsInOrder);
      await loadPlaylists();
    } catch (error) {
      console.error('Error reordering playlist videos:', error);
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
