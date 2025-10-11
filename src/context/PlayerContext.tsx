import React, { useState, useEffect, createContext, useContext } from 'react';
import { YouTubeVideo } from '@/types';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { storage } from '@/utils/storage';

interface PlayerContextType {
  currentVideo: YouTubeVideo | null;
  queue: YouTubeVideo[];
  currentIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playVideo: (video: YouTubeVideo, queue?: YouTubeVideo[]) => void;
  playPause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  toggleMute: () => void;
  isMuted: boolean;
  addToQueue: (video: YouTubeVideo) => void;
  initPlayer: (elementId: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState<YouTubeVideo | null>(null);
  const [queue, setQueue] = useState<YouTubeVideo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const {
    isPlaying,
    currentTime,
    duration,
    apiReady,
    initializePlayer,
    play,
    pause,
    loadVideo,
    seekTo: playerSeekTo,
    toggleMute: playerToggleMute,
  } = useYouTubePlayer({
    onVideoEnd: () => {
      // Auto-play next video
      next();
    },
  });

  const initPlayer = (elementId: string) => {
    initializePlayer(elementId);
  };

  const playVideo = (video: YouTubeVideo, newQueue?: YouTubeVideo[]) => {
    console.log('🎵 Playing video:', video.title, 'API Ready:', apiReady);
    
    setCurrentVideo(video);
    
    if (newQueue) {
      setQueue(newQueue);
      const index = newQueue.findIndex(v => v.id === video.id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
    
    // Wait for API to be ready before loading video
    if (!apiReady) {
      console.warn('⚠️ YouTube API not ready yet, waiting...');
      // Store the video to play once ready
      const checkReady = setInterval(() => {
        if (apiReady) {
          clearInterval(checkReady);
          console.log('✅ API now ready, loading video');
          loadVideo(video, true);
        }
      }, 100);
      
      // Timeout after 5 seconds
      setTimeout(() => clearInterval(checkReady), 5000);
    } else {
      loadVideo(video, true);
    }
    
    // Add to recently played
    storage.addToRecentlyPlayed(video).catch(console.error);
  };

  const playPause = () => {
    console.log('⏯️ PlayPause - isPlaying:', isPlaying, 'API Ready:', apiReady);
    
    if (!apiReady) {
      console.warn('⚠️ YouTube API not ready yet');
      return;
    }

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const next = () => {
    if (queue.length === 0) return;
    
    const nextIndex = (currentIndex + 1) % queue.length;
    setCurrentIndex(nextIndex);
    const nextVideo = queue[nextIndex];
    setCurrentVideo(nextVideo);
    loadVideo(nextVideo, true);
    storage.addToRecentlyPlayed(nextVideo).catch(console.error);
  };

  const previous = () => {
    if (queue.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    const prevVideo = queue[prevIndex];
    setCurrentVideo(prevVideo);
    loadVideo(prevVideo, true);
    storage.addToRecentlyPlayed(prevVideo).catch(console.error);
  };

  const seekTo = (time: number) => {
    playerSeekTo(time);
  };

  const toggleMute = () => {
    playerToggleMute();
    setIsMuted(!isMuted);
  };

  const addToQueue = (video: YouTubeVideo) => {
    setQueue(prev => [...prev, video]);
  };

  const value: PlayerContextType = {
    currentVideo,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    playVideo,
    playPause,
    next,
    previous,
    seekTo,
    toggleMute,
    isMuted,
    addToQueue,
    initPlayer,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
