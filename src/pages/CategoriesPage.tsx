import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CloudRain, Drum, Guitar, HeartHandshake, Library, MoonStar, Music, PartyPopper, Sparkles, Trophy, Waves, Wine } from 'lucide-react';
import { youtubeApi } from '@/utils/youtube';
import { YouTubeVideo } from '@/types';
import { VideoCard } from '@/components/VideoCard';
import { usePlayer } from '@/context/PlayerContext';

const categories = [
  { id: 'pop', name: 'Pop', icon: Sparkles, query: 'pop music hits' },
  { id: 'rock', name: 'Rock', icon: Guitar, query: 'rock music hits' },
  { id: 'hip-hop', name: 'Hip Hop', icon: Trophy, query: 'hip hop rap music' },
  { id: 'edm', name: 'EDM', icon: Drum, query: 'edm electronic dance music' },
  { id: 'jazz', name: 'Jazz', icon: Waves, query: 'jazz music' },
  { id: 'classical', name: 'Classical', icon: Library, query: 'classical music' },
  { id: 'country', name: 'Country', icon: Guitar, query: 'country music hits' },
  { id: 'latin', name: 'Latin', icon: PartyPopper, query: 'latin music reggaeton' },
  { id: 'rnb', name: 'R&B', icon: HeartHandshake, query: 'rnb soul music' },
  { id: 'indie', name: 'Indie', icon: MoonStar, query: 'indie alternative music' },
  { id: 'kpop', name: 'K-Pop', icon: Sparkles, query: 'kpop music' },
  { id: 'reggae', name: 'Reggae', icon: Waves, query: 'reggae music' },
];

const moods = [
  { id: 'chill', name: 'Chill Vibes', icon: Waves, query: 'chill relaxing music' },
  { id: 'workout', name: 'Workout', icon: Trophy, query: 'workout gym music' },
  { id: 'party', name: 'Party', icon: PartyPopper, query: 'party dance music' },
  { id: 'sad', name: 'Sad & Emotional', icon: CloudRain, query: 'sad emotional music' },
  { id: 'happy', name: 'Happy & Upbeat', icon: Sparkles, query: 'happy upbeat music' },
  { id: 'focus', name: 'Focus & Study', icon: Library, query: 'focus study music' },
  { id: 'sleep', name: 'Sleep', icon: MoonStar, query: 'sleep relaxation music' },
  { id: 'romantic', name: 'Romantic', icon: Wine, query: 'romantic love songs' },
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
    <div className="app-page text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-surface rounded-b-3xl border-none">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="pill-action p-2"
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
                  ? 'bg-blue-100 text-slate-900 font-semibold'
                  : 'bg-blue-900/35 text-blue-100/80 hover:bg-blue-900/55'
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
                className="group relative aspect-square rounded-2xl overflow-hidden glass-surface transition-all duration-300 transform hover:scale-105"
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition" />
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  <category.icon className="w-10 h-10 mb-3 text-blue-100" />
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
              className="mb-6 flex items-center gap-2 text-blue-100/70 hover:text-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to {activeTab}
            </button>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-blue-200/30 border-t-blue-100 rounded-full mx-auto mb-4" />
                <p className="text-blue-100/75">Loading...</p>
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
