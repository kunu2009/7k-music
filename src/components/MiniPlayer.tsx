import React from 'react';
import { YouTubeVideo } from '@/types';
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
  onExpand,
}) => {
  if (!video) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;
    onSeek(newTime);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gable-green border-t border-chathams-blue shadow-2xl z-50">
      {/* Progress bar */}
      <div 
        className="h-1 bg-chathams-blue cursor-pointer group relative"
        onClick={handleProgressClick}
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
        <div className="flex items-center justify-between gap-4">
          {/* Left: Video Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <img
              src={video.thumbnails.default}
              alt={video.title}
              className="w-14 h-14 rounded object-cover"
            />
            <div className="min-w-0">
              <h4 className="text-white text-sm font-semibold truncate">
                {video.title}
              </h4>
              <p className="text-timberwolf text-xs opacity-75 truncate">
                {video.channelTitle}
              </p>
            </div>
          </div>

          {/* Center: Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-chathams-blue rounded-full transition-colors"
              aria-label="Previous"
            >
              <SkipBack className="w-5 h-5 text-timberwolf" />
            </button>

            <button
              onClick={onPlayPause}
              className="p-3 bg-calypso hover:bg-chathams-blue rounded-full transition-all transform hover:scale-105"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white fill-white" />
              ) : (
                <Play className="w-6 h-6 text-white fill-white" />
              )}
            </button>

            <button
              onClick={onNext}
              className="p-2 hover:bg-chathams-blue rounded-full transition-colors"
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
              onClick={onToggleFavorite}
              className="p-2 hover:bg-chathams-blue rounded-full transition-colors"
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart 
                className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-timberwolf'}`} 
              />
            </button>

            <button
              onClick={onToggleMute}
              className="p-2 hover:bg-chathams-blue rounded-full transition-colors hidden md:block"
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
                onClick={onExpand}
                className="p-2 hover:bg-chathams-blue rounded-full transition-colors hidden md:block"
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
