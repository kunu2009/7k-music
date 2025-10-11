import React, { useState } from 'react';
import { usePlaylists } from '@/hooks/useStorage';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { Library, Plus, Trash2 } from 'lucide-react';

export const PlaylistsPage: React.FC = () => {
  const { playlists, loading, createPlaylist, deletePlaylist } = usePlaylists();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');

  const handleCreatePlaylist = async () => {
    if (playlistName.trim()) {
      await createPlaylist(playlistName.trim());
      setPlaylistName('');
      setShowCreateModal(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      await deletePlaylist(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gable-green to-black pt-20 pb-32">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Library className="w-8 h-8 text-calypso" />
              <h2 className="text-3xl font-bold text-white">Your Playlists</h2>
            </div>
            <p className="text-timberwolf opacity-75">
              Create and organize your music collections
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-calypso hover:bg-chathams-blue text-white font-medium rounded-full transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Playlist
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner size="lg" text="Loading playlists..." />
        ) : playlists.length === 0 ? (
          <EmptyState
            icon={<Library className="w-16 h-16" />}
            title="No Playlists Yet"
            description="Create your first playlist to start organizing your favorite music."
            action={{
              label: 'Create Playlist',
              onClick: () => setShowCreateModal(true),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-gable-green rounded-lg p-6 hover:bg-chathams-blue transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <Library className="w-12 h-12 text-calypso" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlaylist(playlist.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500 rounded-full transition-all"
                    aria-label="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">
                  {playlist.name}
                </h3>
                <p className="text-timberwolf text-sm opacity-75">
                  {playlist.videos.length} {playlist.videos.length === 1 ? 'video' : 'videos'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gable-green rounded-lg p-8 max-w-md w-full border border-calypso">
              <h3 className="text-white text-2xl font-bold mb-4">Create Playlist</h3>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Playlist name..."
                className="w-full bg-chathams-blue text-white px-4 py-3 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-calypso"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreatePlaylist}
                  className="flex-1 px-4 py-2 bg-calypso hover:bg-chathams-blue text-white font-medium rounded-lg transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setPlaylistName('');
                  }}
                  className="flex-1 px-4 py-2 bg-transparent border border-timberwolf text-timberwolf hover:bg-chathams-blue hover:border-calypso font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
