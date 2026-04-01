import React from 'react';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';
import { Heart, Play, ListPlus } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  onPlay: (video: YouTubeVideo) => void;
  onFavorite?: (video: YouTubeVideo) => void;
  isFavorite?: boolean;
  onAddToPlaylist?: (video: YouTubeVideo) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onPlay, 
  onFavorite,
  isFavorite = false,
  onAddToPlaylist,
}) => {
  return (
    <div className="group relative glass-surface rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnails.medium}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Play overlay */}
        <div 
          onClick={() => onPlay(video)}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-all duration-300 flex items-center justify-center"
        >
          <button className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 rounded-full p-4 shadow-2xl bg-gradient-to-b from-blue-100 to-white">
            <Play className="w-6 h-6 text-slate-900 fill-slate-900" />
          </button>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white font-medium">
            {youtubeApi.formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 
          className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-blue-100 transition-colors"
          title={video.title}
        >
          {video.title}
        </h3>
        
        <p className="text-blue-100/75 text-xs mb-2">
          {video.channelTitle}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-blue-100/60 text-xs">
            {video.viewCount && youtubeApi.formatViewCount(video.viewCount)}
          </span>

          <div className="flex items-center gap-2">
            {onFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(video);
                }}
                className="p-1.5 hover:bg-blue-500/30 rounded-full transition-colors"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-rose-400 text-rose-400' : 'text-blue-100/80'}`} 
                />
              </button>
            )}
            
            {onAddToPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToPlaylist(video);
                }}
                className="p-1.5 hover:bg-blue-500/30 rounded-full transition-colors"
                aria-label="Add to playlist"
              >
                <ListPlus className="w-4 h-4 text-blue-100/80" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
