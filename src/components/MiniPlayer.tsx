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
    <div className="fixed bottom-0 left-0 right-0 bg-gable-green border-t border-chathams-blue shadow-2xl z-50 safe-pad-bottom">
      {/* Progress bar */}
      <div 
        className="h-1 bg-chathams-blue cursor-pointer group relative"
        onPointerDown={handleSeekStart}
        onPointerMove={handleSeekMove}
        onPointerUp={handleSeekEnd}
        onPointerCancel={handleSeekEnd}
        onPointerLeave={handleSeekEnd}
      >
        <div 
          className="h-full bg-calypso transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <div className="container mx-auto px-4 py-3">
        {(playerStatus === 'loading' || playerStatus === 'buffering' || playerStatus === 'error') && (
          <div className="mb-2 text-xs text-timberwolf opacity-90">
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
              className="w-14 h-14 rounded object-cover"
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
                  <p className="text-timberwolf text-xs opacity-75 truncate">
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
              className="p-2 hover:bg-chathams-blue active:scale-95 rounded-full transition-all"
              aria-label="Previous"
            >
              <SkipBack className="w-5 h-5 text-timberwolf" />
            </button>

            <button
              onClick={withHaptic(onPlayPause, 'medium')}
              className="p-3 bg-calypso hover:bg-chathams-blue active:scale-95 rounded-full transition-all transform hover:scale-105"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white fill-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white" />
              )}
            </button>

            <button
              onClick={withHaptic(onNext)}
              className="p-2 hover:bg-chathams-blue active:scale-95 rounded-full transition-all"
              aria-label="Next"
            >
              <SkipForward className="w-5 h-5 text-timberwolf" />
            </button>
          </div>

          {/* Right: Additional Controls */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="text-timberwolf text-xs opacity-75 hidden md:block">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              onClick={withHaptic(onToggleFavorite)}
              className="p-2 hover:bg-chathams-blue active:scale-95 rounded-full transition-all"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-timberwolf'}`} 
              />
            </button>

            <button
              onClick={withHaptic(onToggleMute)}
              className="p-2 hover:bg-chathams-blue active:scale-95 rounded-full transition-all hidden md:block"
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
                className="p-2 hover:bg-chathams-blue active:scale-95 rounded-full transition-all hidden md:block"
                aria-label="Expand player"
              >
                <Maximize2 className="w-5 h-5 text-timberwolf" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
