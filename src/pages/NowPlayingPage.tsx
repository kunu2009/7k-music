import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  MoreVertical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  ListMusic,
  Volume2,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/hooks/useStorage';

export function NowPlayingPage() {
  const navigate = useNavigate();
  const {
    currentVideo,
    isPlaying,
    currentTime,
    duration,
    playPause,
    next,
    previous,
    seekTo,
    queue,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  if (!currentVideo) {
    navigate('/');
    return null;
  }

  const favorite = isFavorite(currentVideo.id);

  const handleToggleFavorite = async () => {
    if (favorite) {
      await removeFavorite(currentVideo.id);
    } else {
      await addFavorite(currentVideo);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/10 rounded-full transition"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-sm text-gray-400">Now Playing</p>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Video Area */}
      <div className="px-4 sm:px-8 pt-4 pb-4">
        <div className="mx-auto w-full max-w-[720px] aspect-video rounded-2xl border border-white/10 bg-black/50" />
      </div>

      {/* Song Info */}
      <div className="px-8 py-4">
        <h1 className="text-2xl font-bold mb-2 truncate">{currentVideo.title}</h1>
        <p className="text-gray-400 truncate">{currentVideo.channelTitle}</p>
      </div>

      {/* Progress Bar */}
      <div className="px-8 py-2">
        <div
          onClick={handleSeek}
          className="relative h-1 bg-gray-800 rounded-full cursor-pointer group"
        >
          <div
            className="absolute h-full bg-[#a4d96c] rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 top-1/2 opacity-0 group-hover:opacity-100 transition"
            style={{ left: `${progress}%`, marginLeft: '-8px' }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(duration - currentTime)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6">
        {/* Secondary Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition ${
              shuffle ? 'text-[#a4d96c]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleFavorite}
            className={`p-2 rounded-full transition ${
              favorite ? 'text-red-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={toggleRepeat}
            className={`p-2 rounded-full transition relative ${
              repeat !== 'off' ? 'text-[#a4d96c]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Repeat className="w-5 h-5" />
            {repeat === 'one' && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#a4d96c] rounded-full" />
            )}
          </button>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={previous}
            className="p-3 hover:bg-white/10 rounded-full transition"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={playPause}
            className="w-16 h-16 bg-[#a4d96c] hover:bg-[#b5e07d] rounded-full flex items-center justify-center transition shadow-lg hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black fill-black" />
            ) : (
              <Play className="w-8 h-8 text-black fill-black ml-1" />
            )}
          </button>

          <button
            onClick={next}
            className="p-3 hover:bg-white/10 rounded-full transition"
          >
            <SkipForward className="w-7 h-7" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-6">
          <button className="p-2 text-gray-400 hover:text-white transition">
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/playlists')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <ListMusic className="w-5 h-5" />
            <span className="text-sm">{queue.length} in queue</span>
          </button>
        </div>
      </div>

      {/* Safe Area Bottom Padding */}
      <div className="h-8" />
    </div>
  );
}
