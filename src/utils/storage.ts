import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { YouTubeVideo, Playlist } from '@/types';

interface MusicDB extends DBSchema {
  playlists: {
    key: string;
    value: Playlist;
    indexes: { 'by-updated': string };
  };
  favorites: {
    key: string;
    value: YouTubeVideo;
    indexes: { 'by-added': string };
  };
  recentlyPlayed: {
    key: string;
    value: YouTubeVideo & { playedAt: string };
    indexes: { 'by-played': string };
  };
}

let db: IDBPDatabase<MusicDB> | null = null;

async function getDB() {
  if (db) return db;

  db = await openDB<MusicDB>('7k-music-db', 1, {
    upgrade(db) {
      // Playlists store
      const playlistStore = db.createObjectStore('playlists', { keyPath: 'id' });
      playlistStore.createIndex('by-updated', 'updatedAt');

      // Favorites store
      const favoritesStore = db.createObjectStore('favorites', { keyPath: 'id' });
      favoritesStore.createIndex('by-added', 'id');

      // Recently played store
      const recentStore = db.createObjectStore('recentlyPlayed', { keyPath: 'id' });
      recentStore.createIndex('by-played', 'playedAt');
    },
  });

  return db;
}

export const storage = {
  // ===== FAVORITES =====
  async addToFavorites(video: YouTubeVideo): Promise<void> {
    const db = await getDB();
    await db.add('favorites', video);
  },

  async removeFromFavorites(videoId: string): Promise<void> {
    const db = await getDB();
    await db.delete('favorites', videoId);
  },

  async getFavorites(): Promise<YouTubeVideo[]> {
    const db = await getDB();
    return await db.getAll('favorites');
  },

  async isFavorite(videoId: string): Promise<boolean> {
    const db = await getDB();
    const video = await db.get('favorites', videoId);
    return !!video;
  },

  // ===== PLAYLISTS =====
  async createPlaylist(name: string): Promise<Playlist> {
    const db = await getDB();
    const now = Date.now();
    const playlist: Playlist = {
      id: `playlist-${now}`,
      name,
      videos: [],
      order: now,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.add('playlists', playlist);
    return playlist;
  },

  async getPlaylists(): Promise<Playlist[]> {
    const db = await getDB();
    const playlists = await db.getAll('playlists');
    return playlists.sort((a, b) => {
      const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
      if (aOrder === bOrder) {
        return b.updatedAt.localeCompare(a.updatedAt);
      }
      return aOrder - bOrder;
    });
  },

  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const db = await getDB();
    return await db.get('playlists', id);
  },

  async updatePlaylist(playlist: Playlist): Promise<void> {
    const db = await getDB();
    playlist.updatedAt = new Date().toISOString();
    await db.put('playlists', playlist);
  },

  async renamePlaylist(id: string, name: string): Promise<void> {
    const db = await getDB();
    const playlist = await db.get('playlists', id);
    if (!playlist) throw new Error('Playlist not found');

    playlist.name = name;
    playlist.updatedAt = new Date().toISOString();
    await db.put('playlists', playlist);
  },

  async duplicatePlaylist(id: string): Promise<Playlist> {
    const db = await getDB();
    const source = await db.get('playlists', id);
    if (!source) throw new Error('Playlist not found');

    const now = Date.now();
    const duplicated: Playlist = {
      ...source,
      id: `playlist-${now}`,
      name: `${source.name} (Copy)`,
      videos: [...source.videos],
      order: now,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.add('playlists', duplicated);
    return duplicated;
  },

  async deletePlaylist(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('playlists', id);
  },

  async addToPlaylist(playlistId: string, video: YouTubeVideo): Promise<void> {
    const db = await getDB();
    const playlist = await db.get('playlists', playlistId);
    if (!playlist) throw new Error('Playlist not found');
    
    // Prevent duplicates
    if (!playlist.videos.find(v => v.id === video.id)) {
      playlist.videos.push(video);
      playlist.updatedAt = new Date().toISOString();
      await db.put('playlists', playlist);
    }
  },

  async removeFromPlaylist(playlistId: string, videoId: string): Promise<void> {
    const db = await getDB();
    const playlist = await db.get('playlists', playlistId);
    if (!playlist) throw new Error('Playlist not found');
    
    playlist.videos = playlist.videos.filter(v => v.id !== videoId);
    playlist.updatedAt = new Date().toISOString();
    await db.put('playlists', playlist);
  },

  async reorderPlaylists(playlistIdsInOrder: string[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('playlists', 'readwrite');
    const playlists = await tx.store.getAll();
    const byId = new Map(playlists.map((playlist) => [playlist.id, playlist]));

    for (let index = 0; index < playlistIdsInOrder.length; index += 1) {
      const playlist = byId.get(playlistIdsInOrder[index]);
      if (!playlist) continue;
      if (playlist.order !== index) {
        playlist.order = index;
        await tx.store.put(playlist);
      }
    }

    await tx.done;
  },

  // ===== RECENTLY PLAYED =====
  async addToRecentlyPlayed(video: YouTubeVideo): Promise<void> {
    const db = await getDB();
    const recentVideo = {
      ...video,
      playedAt: new Date().toISOString(),
    };
    await db.put('recentlyPlayed', recentVideo);

    // Keep only the last 50 items
    const all = await db.getAllFromIndex('recentlyPlayed', 'by-played');
    if (all.length > 50) {
      const toDelete = all.slice(0, all.length - 50);
      for (const item of toDelete) {
        await db.delete('recentlyPlayed', item.id);
      }
    }
  },

  async getRecentlyPlayed(): Promise<YouTubeVideo[]> {
    const db = await getDB();
    const items = await db.getAllFromIndex('recentlyPlayed', 'by-played');
    // Return in reverse order (most recent first)
    return items.reverse().map(({ playedAt, ...video }) => video as YouTubeVideo);
  },

  // ===== UTILITY =====
  async clearAll(): Promise<void> {
    const db = await getDB();
    await db.clear('favorites');
    await db.clear('playlists');
    await db.clear('recentlyPlayed');
  },
};
