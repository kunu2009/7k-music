import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Music, Sparkles } from 'lucide-react';
import { youtubeApi } from '@/utils/youtube';
import { YouTubeVideo } from '@/types';
import { VideoCard } from '@/components/VideoCard';
import { usePlayer } from '@/context/PlayerContext';

const categories = [
  { id: 'pop', name: 'Pop', emoji: '🎤', query: 'pop music hits' },
  { id: 'rock', name: 'Rock', emoji: '🎸', query: 'rock music hits' },
  { id: 'hip-hop', name: 'Hip Hop', emoji: '🎧', query: 'hip hop rap music' },
  { id: 'edm', name: 'EDM', emoji: '🎛️', query: 'edm electronic dance music' },
  { id: 'jazz', name: 'Jazz', emoji: '🎺', query: 'jazz music' },
  { id: 'classical', name: 'Classical', emoji: '🎻', query: 'classical music' },
  { id: 'country', name: 'Country', emoji: '🤠', query: 'country music hits' },
  { id: 'latin', name: 'Latin', emoji: '💃', query: 'latin music reggaeton' },
  { id: 'rnb', name: 'R&B', emoji: '🎵', query: 'rnb soul music' },
  { id: 'indie', name: 'Indie', emoji: '🌟', query: 'indie alternative music' },
  { id: 'kpop', name: 'K-Pop', emoji: '🇰🇷', query: 'kpop music' },
  { id: 'reggae', name: 'Reggae', emoji: '🌴', query: 'reggae music' },
];

const moods = [
  { id: 'chill', name: 'Chill Vibes', emoji: '😌', query: 'chill relaxing music' },
  { id: 'workout', name: 'Workout', emoji: '💪', query: 'workout gym music' },
  { id: 'party', name: 'Party', emoji: '🎉', query: 'party dance music' },
  { id: 'sad', name: 'Sad & Emotional', emoji: '😢', query: 'sad emotional music' },
  { id: 'happy', name: 'Happy & Upbeat', emoji: '😊', query: 'happy upbeat music' },
  { id: 'focus', name: 'Focus & Study', emoji: '📚', query: 'focus study music' },
  { id: 'sleep', name: 'Sleep', emoji: '😴', query: 'sleep relaxation music' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', query: 'romantic love songs' },
];

export function CategoriesPage() {
  const navigate = useNavigate();
  const { playVideo } = usePlayer();
  const [activeTab, setActiveTab] = useState<'genres' | 'moods'>('genres');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'genres', label: 'Genres', icon: Music },
    { id: 'moods', label: 'Moods', icon: Sparkles },
  ] as const;

  const currentCategories = activeTab === 'genres' ? categories : moods;

  const handleCategoryClick = async (query: string, categoryId: string) => {
    setSelectedCategory(categoryId);
    setLoading(true);
    try {
      const results = await youtubeApi.searchMusicVideos(query);
      setVideos(results);
    } catch (error) {
      console.error('Error fetching category videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-lg border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-full transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Browse Music</h1>
          <div className="w-10" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedCategory(null);
                setVideos([]);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                activeTab === tab.id
                  ? 'bg-[#a4d96c] text-black font-semibold'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {!selectedCategory ? (
          // Category Grid
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {currentCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.query, category.id)}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-[#17557b] to-[#366e8d] hover:from-[#366e8d] hover:to-[#17557b] transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  <div className="text-5xl mb-3">{category.emoji}</div>
                  <h3 className="text-sm font-bold text-center">{category.name}</h3>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Category Videos
          <div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                setVideos([]);
              }}
              className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to {activeTab}
            </button>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-[#17557b] border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-400">Loading...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={(video) => playVideo(video, videos)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
