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
      await storage.createPlaylist(name);
      await loadPlaylists();
    } catch (error) {
      console.error('Error creating playlist:', error);
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

  return {
    playlists,
    loading,
    createPlaylist,
    deletePlaylist,
    addToPlaylist,
    removeFromPlaylist,
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
