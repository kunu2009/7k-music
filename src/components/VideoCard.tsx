import React from 'react';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';
import { Heart, Play, MoreVertical } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  onPlay: (video: YouTubeVideo) => void;
  onFavorite?: (video: YouTubeVideo) => void;
  isFavorite?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({ 
  video, 
  onPlay, 
  onFavorite,
  isFavorite = false 
}) => {
  return (
    <div className="group relative bg-gable-green rounded-lg overflow-hidden hover:bg-chathams-blue transition-all duration-300 cursor-pointer">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={video.thumbnails.medium}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Play overlay */}
        <div 
          onClick={() => onPlay(video)}
          className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center"
        >
          <button className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 bg-calypso hover:bg-chathams-blue rounded-full p-4 shadow-lg">
            <Play className="w-6 h-6 text-white fill-white" />
          </button>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white font-medium">
            {youtubeApi.formatDuration(video.duration)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 
          className="font-semibold text-white text-sm line-clamp-2 mb-2 group-hover:text-timberwolf transition-colors"
          title={video.title}
        >
          {video.title}
        </h3>
        
        <p className="text-timberwolf text-xs opacity-75 mb-2">
          {video.channelTitle}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-timberwolf text-xs opacity-60">
            {video.viewCount && youtubeApi.formatViewCount(video.viewCount)}
          </span>

          <div className="flex items-center gap-2">
            {onFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(video);
                }}
                className="p-1.5 hover:bg-calypso rounded-full transition-colors"
                aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart 
                  className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-timberwolf'}`} 
                />
              </button>
            )}
            
            <button
              className="p-1.5 hover:bg-calypso rounded-full transition-colors"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4 text-timberwolf" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
