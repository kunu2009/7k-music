import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayerStatus, YouTubeVideo } from '@/types';
import { triggerHaptic } from '@/utils/feedback';
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface MiniPlayerProps {
  video: YouTubeVideo | null;
  isPlaying: boolean;
  isFavorite: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (time: number) => void;
  onToggleFavorite: () => void;
  onToggleMute: () => void;
  isMuted?: boolean;
  playerStatus?: PlayerStatus;
  playerErrorCode?: number | null;
  onExpand?: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  video,
  isPlaying,
  isFavorite,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onToggleFavorite,
  onToggleMute,
  isMuted = false,
  playerStatus = 'idle',
  playerErrorCode = null,
  onExpand,
}) => {
  const navigate = useNavigate();
  const [isSeeking, setIsSeeking] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  
  if (!video) return null;

  const activeTime = previewTime ?? currentTime;
  const progress = duration > 0 ? (activeTime / duration) * 100 : 0;
  const isLoadingState = playerStatus === 'loading' || playerStatus === 'buffering';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateSeekTime = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = rect.width > 0 ? clickX / rect.width : 0;
    return percentage * duration;
  };

  const handleSeekStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const newTime = calculateSeekTime(e);
    setIsSeeking(true);
    setPreviewTime(newTime);
    onSeek(newTime);
  };

  const handleSeekMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking || duration <= 0) return;
    const newTime = calculateSeekTime(e);
    setPreviewTime(newTime);
    onSeek(newTime);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    setPreviewTime(null);
  };

  const withHaptic = (action: () => void, intensity: 'light' | 'medium' = 'light') => () => {
    triggerHaptic(intensity);
    action();
  };

  return (
    <div className="fixed bottom-3 left-0 right-0 z-50 safe-pad-bottom px-3 sm:px-4">
      <div className="glass-surface rounded-2xl border-white/20">
      {/* Progress bar */}
      <div 
        className="h-1 bg-white/10 cursor-pointer group relative rounded-t-2xl"
        onPointerDown={handleSeekStart}
        onPointerMove={handleSeekMove}
        onPointerUp={handleSeekEnd}
        onPointerCancel={handleSeekEnd}
        onPointerLeave={handleSeekEnd}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-300 to-indigo-200 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-3">
        {(playerStatus === 'loading' || playerStatus === 'buffering' || playerStatus === 'error') && (
          <div className="mb-2 text-xs text-blue-100/80">
            {playerStatus === 'error'
              ? `Playback error${playerErrorCode ? ` (${playerErrorCode})` : ''}. Trying next track if available.`
              : playerStatus === 'buffering'
                ? 'Buffering…'
                : 'Loading…'}
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Video Info */}
          <div 
            className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-white/5 rounded-lg p-2 -m-2 transition"
            onClick={() => navigate('/now-playing')}
          >
            <img
              src={video.thumbnails.default}
              alt={video.title}
              className="w-14 h-14 rounded-xl object-cover shadow-md"
            />
            <div className="min-w-0">
              {isLoadingState ? (
                <>
                  <div className="h-3.5 w-40 max-w-[70vw] bg-chathams-blue rounded animate-pulse mb-2" />
                  <div className="h-3 w-28 max-w-[50vw] bg-chathams-blue rounded animate-pulse" />
                </>
              ) : (
                <>
                  <h4 className="text-white text-sm font-semibold truncate">
                    {video.title}
                  </h4>
                  <p className="text-blue-100/70 text-xs truncate">
                    {video.channelTitle}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={withHaptic(onPrevious)}
              className="pill-action p-2"
              aria-label="Previous"
            >
              <SkipBack className="w-5 h-5 text-white" />
            </button>

            <button
              onClick={withHaptic(onPlayPause, 'medium')}
              className="p-3 bg-gradient-to-b from-blue-100 to-white active:scale-95 rounded-full transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(177,202,255,0.7)]"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-slate-900 fill-slate-900" />
              ) : (
                <Play className="w-6 h-6 text-slate-900 fill-slate-900" />
              )}
            </button>

            <button
              onClick={withHaptic(onNext)}
              className="pill-action p-2"
              aria-label="Next"
            >
              <SkipForward className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Right: Additional Controls */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-blue-100/70 text-xs hidden md:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              onClick={withHaptic(onToggleFavorite)}
              className="pill-action p-2"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-timberwolf'}`} 
              />
            </button>

            <button
              onClick={withHaptic(onToggleMute)}
              className="pill-action p-2 hidden md:block"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-timberwolf" />
              ) : (
                <Volume2 className="w-5 h-5 text-timberwolf" />
              )}
            </button>

            {onExpand && (
              <button
                onClick={withHaptic(() => navigate('/now-playing'))}
                className="pill-action p-2 hidden md:block"
                aria-label="Expand player"
              >
                <Maximize2 className="w-5 h-5 text-timberwolf" />
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
