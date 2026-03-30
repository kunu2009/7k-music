import { useState } from 'react';
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
import { triggerHaptic } from '@/utils/feedback';

export function NowPlayingPage() {
  const navigate = useNavigate();
  const {
    currentVideo,
    playerStatus,
    playerErrorCode,
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
  const [isSeeking, setIsSeeking] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);

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

  const calculateSeekTime = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pointerX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = rect.width > 0 ? pointerX / rect.width : 0;
    return percent * duration;
  };

  const handleSeekStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const newTime = calculateSeekTime(e);
    setIsSeeking(true);
    setPreviewTime(newTime);
    seekTo(newTime);
  };

  const handleSeekMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking || duration <= 0) return;
    const newTime = calculateSeekTime(e);
    setPreviewTime(newTime);
    seekTo(newTime);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    setPreviewTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTime = previewTime ?? currentTime;
  const progress = duration > 0 ? (activeTime / duration) * 100 : 0;
  const isLoadingState = playerStatus === 'loading' || playerStatus === 'buffering';

  const withHaptic = (action: () => void, intensity: 'light' | 'medium' = 'light') => () => {
    triggerHaptic(intensity);
    action();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-black to-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={withHaptic(() => navigate(-1))}
          className="p-2 hover:bg-white/10 active:scale-95 rounded-full transition-all"
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
        <div className="mx-auto w-full max-w-[720px] aspect-video rounded-2xl border border-white/10 bg-black/50 relative overflow-hidden">
          {isLoadingState && (
            <div className="absolute inset-0 p-4 animate-pulse">
              <div className="w-full h-full rounded-xl bg-white/5" />
            </div>
          )}
        </div>
      </div>

      {/* Song Info */}
      <div className="px-8 py-4">
        <h1 className="text-2xl font-bold mb-2 truncate">{currentVideo.title}</h1>
        <p className="text-gray-400 truncate">{currentVideo.channelTitle}</p>
        {(playerStatus === 'loading' || playerStatus === 'buffering' || playerStatus === 'error') && (
          <p className="text-xs text-gray-400 mt-2">
            {playerStatus === 'error'
              ? `Playback error${playerErrorCode ? ` (${playerErrorCode})` : ''}. Skipping when possible.`
              : playerStatus === 'buffering'
                ? 'Buffering…'
                : 'Loading…'}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-8 py-2">
        <div
          onPointerDown={handleSeekStart}
          onPointerMove={handleSeekMove}
          onPointerUp={handleSeekEnd}
          onPointerCancel={handleSeekEnd}
          onPointerLeave={handleSeekEnd}
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
          <span>{formatTime(activeTime)}</span>
          <span>-{formatTime(Math.max(duration - activeTime, 0))}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-6">
        {/* Secondary Controls */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={withHaptic(toggleShuffle)}
            className={`p-2 rounded-full transition ${
              shuffle ? 'text-[#a4d96c]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={withHaptic(handleToggleFavorite)}
            className={`p-2 rounded-full transition ${
              favorite ? 'text-red-500' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={withHaptic(toggleRepeat)}
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
            onClick={withHaptic(previous)}
            className="p-3 hover:bg-white/10 active:scale-95 rounded-full transition-all"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={withHaptic(playPause, 'medium')}
            className="w-16 h-16 bg-[#a4d96c] hover:bg-[#b5e07d] active:scale-95 rounded-full flex items-center justify-center transition shadow-lg hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-black fill-black" />
            ) : (
              <Play className="w-8 h-8 text-black fill-black ml-1" />
            )}
          </button>

          <button
            onClick={withHaptic(next)}
            className="p-3 hover:bg-white/10 active:scale-95 rounded-full transition-all"
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
            onClick={withHaptic(() => navigate('/playlists'))}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all"
          >
            <ListMusic className="w-5 h-5" />
            <span className="text-sm">{queue.length} in queue</span>
          </button>
        </div>
      </div>

      {/* Safe Area Bottom Padding */}
      <div className="h-8 safe-space-bottom" />
    </div>
  );
}
