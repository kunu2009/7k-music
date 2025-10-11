import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ChevronLeft, MoreVertical } from 'lucide-react';
import { usePlaylists } from '@/hooks/useStorage';
import { YouTubeVideo } from '@/types';
import { usePlayer } from '@/context/PlayerContext';

export function MyMusicPage() {
  const navigate = useNavigate();
  const { playlists } = usePlaylists();
  const { playVideo } = usePlayer();
  const [activeTab, setActiveTab] = useState<'all' | 'playlists' | 'liked' | 'downloaded'>('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'playlists', label: 'Playlists' },
    { id: 'liked', label: 'Liked Songs' },
    { id: 'downloaded', label: 'Downloaded' },
  ] as const;

  const handlePlayPlaylist = (videos: YouTubeVideo[]) => {
    if (videos.length > 0) {
      playVideo(videos[0], videos);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">My Music</h1>
          <button className="p-2 hover:bg-white/10 rounded-full transition">
            <MoreVertical className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                activeTab === tab.id
                  ? 'bg-[#a4d96c] text-black font-semibold'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {activeTab === 'playlists' && (
          <div className="space-y-4">
            {playlists.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No playlists yet</p>
                <button
                  onClick={() => navigate('/playlists')}
                  className="px-6 py-3 bg-[#17557b] hover:bg-[#366e8d] rounded-full transition"
                >
                  Create Playlist
                </button>
              </div>
            ) : (
              playlists.map((playlist) => (
                <div
                  key={playlist.id}
                  className="bg-gradient-to-r from-gray-800/50 to-transparent rounded-2xl p-4 hover:from-gray-800 transition group"
                >
                  <div className="flex items-center gap-4">
                    {/* Playlist Cover */}
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-[#17557b] to-[#366e8d] rounded-2xl flex items-center justify-center">
                        {playlist.videos[0] ? (
                          <img
                            src={playlist.videos[0].thumbnails.medium}
                            alt={playlist.name}
                            className="w-full h-full object-cover rounded-2xl"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-white/50">
                            {playlist.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handlePlayPlaylist(playlist.videos)}
                        className="absolute -bottom-1 -right-1 w-10 h-10 bg-[#a4d96c] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:scale-110"
                      >
                        <Play className="w-5 h-5 text-black fill-black" />
                      </button>
                    </div>

                    {/* Playlist Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{playlist.name}</h3>
                      <p className="text-sm text-gray-400">
                        {playlist.videos.length} Song{playlist.videos.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={() => handlePlayPlaylist(playlist.videos)}
                      className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition"
                    >
                      <Play className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'all' && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Explore all your music in one place</p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <button
                onClick={() => navigate('/favorites')}
                className="p-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-2xl hover:from-red-500/30 hover:to-pink-500/30 transition"
              >
                <div className="text-4xl mb-2">❤️</div>
                <div className="font-semibold">Favorites</div>
              </button>
              <button
                onClick={() => setActiveTab('playlists')}
                className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl hover:from-blue-500/30 hover:to-purple-500/30 transition"
              >
                <div className="text-4xl mb-2">🎵</div>
                <div className="font-semibold">Playlists</div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'liked' && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Your liked songs appear here</p>
            <button
              onClick={() => navigate('/favorites')}
              className="px-6 py-3 bg-[#17557b] hover:bg-[#366e8d] rounded-full transition"
            >
              View Favorites
            </button>
          </div>
        )}

        {activeTab === 'downloaded' && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Downloaded songs for offline playback</p>
            <p className="text-sm text-gray-500">Feature coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
