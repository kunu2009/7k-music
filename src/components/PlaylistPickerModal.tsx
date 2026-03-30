import React, { useMemo, useState } from 'react';
import { Playlist } from '@/types';
import { X, Library, Plus } from 'lucide-react';

interface PlaylistPickerModalProps {
  isOpen: boolean;
  playlists: Playlist[];
  onClose: () => void;
  onSelectPlaylist: (playlistId: string) => Promise<void>;
  onCreateAndAdd: (playlistName: string) => Promise<void>;
}

export const PlaylistPickerModal: React.FC<PlaylistPickerModalProps> = ({
  isOpen,
  playlists,
  onClose,
  onSelectPlaylist,
  onCreateAndAdd,
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sortedPlaylists = useMemo(
    () => [...playlists].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [playlists],
  );

  if (!isOpen) return null;

  const handleSelect = async (playlistId: string) => {
    setIsSubmitting(true);
    try {
      await onSelectPlaylist(playlistId);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    if (!newPlaylistName.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateAndAdd(newPlaylistName.trim());
      setNewPlaylistName('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gable-green rounded-lg p-6 max-w-lg w-full border border-calypso max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-xl font-bold">Add to Playlist</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-chathams-blue rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-timberwolf" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-chathams-blue bg-opacity-50 border border-chathams-blue">
          <div className="flex items-center gap-2 mb-2">
            <Plus className="w-4 h-4 text-calypso" />
            <p className="text-white text-sm font-medium">Create new playlist</p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name..."
              className="flex-1 bg-black/30 text-white px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-calypso text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              disabled={isSubmitting}
            />
            <button
              onClick={handleCreate}
              disabled={!newPlaylistName.trim() || isSubmitting}
              className="px-3 py-2 bg-calypso hover:bg-chathams-blue text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Create
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {sortedPlaylists.length === 0 ? (
            <div className="text-center py-8">
              <Library className="w-10 h-10 text-timberwolf opacity-50 mx-auto mb-2" />
              <p className="text-timberwolf text-sm opacity-80">No playlists yet. Create one above.</p>
            </div>
          ) : (
            sortedPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => handleSelect(playlist.id)}
                disabled={isSubmitting}
                className="w-full text-left px-4 py-3 rounded-lg bg-chathams-blue bg-opacity-40 hover:bg-opacity-70 transition-colors disabled:opacity-50"
              >
                <p className="text-white font-medium truncate">{playlist.name}</p>
                <p className="text-timberwolf text-xs opacity-80">
                  {playlist.videos.length} {playlist.videos.length === 1 ? 'song' : 'songs'}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
