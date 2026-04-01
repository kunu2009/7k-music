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
    <div className="fixed inset-0 z-50 text-white flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_10%_0%,rgba(125,157,255,0.35),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(71,119,255,0.28),transparent_36%),linear-gradient(180deg,#070b18,#0d1734_55%,#090f22)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        <button
          onClick={withHaptic(() => navigate(-1))}
          className="pill-action p-2.5"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-sm text-blue-100/80 tracking-wide">Now Playing</p>
        </div>
        <button className="pill-action p-2.5">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Video Area */}
      <div className="px-4 sm:px-8 pt-2 pb-4">
        <div className="mx-auto w-full max-w-[720px] aspect-video rounded-[28px] glass-surface relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/30 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-52 h-52 bg-cyan-400/20 blur-3xl" />
          {isLoadingState && (
            <div className="absolute inset-0 p-4 animate-pulse">
              <div className="w-full h-full rounded-2xl bg-white/10" />
            </div>
          )}
        </div>
      </div>

      {/* Song Info */}
      <div className="px-6 sm:px-8 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{currentVideo.title}</h1>
        <p className="text-blue-100/75 truncate">{currentVideo.channelTitle}</p>
        {(playerStatus === 'loading' || playerStatus === 'buffering' || playerStatus === 'error') && (
          <p className="text-xs text-blue-100/70 mt-2">
            {playerStatus === 'error'
              ? `Playback error${playerErrorCode ? ` (${playerErrorCode})` : ''}. Skipping when possible.`
              : playerStatus === 'buffering'
                ? 'Buffering…'
                : 'Loading…'}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 sm:px-8 py-2">
        <svg viewBox="0 0 360 36" className="w-full h-9 mb-3 opacity-85" aria-hidden="true">
          <defs>
            <linearGradient id="waveGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#8cb6ff" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#d4e4ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#7aa1ff" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path d="M0 18 Q8 8 16 18 T32 18 T48 18 T64 18 T80 18 T96 18 T112 18 T128 18 T144 18 T160 18 T176 18 T192 18 T208 18 T224 18 T240 18 T256 18 T272 18 T288 18 T304 18 T320 18 T336 18 T352 18" stroke="url(#waveGradient)" strokeWidth="2.2" fill="none" />
        </svg>
        <div
          onPointerDown={handleSeekStart}
          onPointerMove={handleSeekMove}
          onPointerUp={handleSeekEnd}
          onPointerCancel={handleSeekEnd}
          onPointerLeave={handleSeekEnd}
          className="relative h-1.5 bg-white/15 rounded-full cursor-pointer group"
        >
          <div
            className="absolute h-full bg-gradient-to-r from-blue-300 to-indigo-200 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 top-1/2 opacity-0 group-hover:opacity-100 transition"
            style={{ left: `${progress}%`, marginLeft: '-8px' }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-100/70 mt-2">
          <span>{formatTime(activeTime)}</span>
          <span>-{formatTime(Math.max(duration - activeTime, 0))}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 sm:px-8 py-6">
        {/* Secondary Controls */}
        <div className="flex items-center justify-between mb-6 glass-surface rounded-2xl px-4 py-3">
          <button
            onClick={withHaptic(toggleShuffle)}
            className={`p-2 rounded-full transition ${
              shuffle ? 'text-blue-100' : 'text-blue-100/60 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={withHaptic(handleToggleFavorite)}
            className={`p-2 rounded-full transition ${
              favorite ? 'text-rose-400' : 'text-blue-100/60 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={withHaptic(toggleRepeat)}
            className={`p-2 rounded-full transition relative ${
              repeat !== 'off' ? 'text-blue-100' : 'text-blue-100/60 hover:text-white'
            }`}
          >
            <Repeat className="w-5 h-5" />
            {repeat === 'one' && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-200 rounded-full" />
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
            className="w-16 h-16 bg-gradient-to-b from-blue-100 to-white active:scale-95 rounded-full flex items-center justify-center transition shadow-[0_0_40px_rgba(175,199,255,0.7)] hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-slate-900 fill-slate-900" />
            ) : (
              <Play className="w-8 h-8 text-slate-900 fill-slate-900 ml-1" />
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
          <button className="p-2 text-blue-100/60 hover:text-white transition">
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={withHaptic(() => navigate('/playlists'))}
            className="pill-action flex items-center gap-2 px-4 py-2"
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
