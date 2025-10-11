import React, { useState, createContext, useContext } from 'react';
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
  shuffle: boolean;
  repeat: 'off' | 'one' | 'all';
  playVideo: (video: YouTubeVideo, queue?: YouTubeVideo[]) => void;
  playPause: () => void;
  next: () => void;
  previous: () => void;
  seekTo: (time: number) => void;
  toggleMute: () => void;
  isMuted: boolean;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
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
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'one' | 'all'>('off');
  const [shuffledQueue, setShuffledQueue] = useState<YouTubeVideo[]>([]);

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
      // Handle repeat one
      if (repeat === 'one' && currentVideo) {
        loadVideo(currentVideo, true);
        return;
      }
      
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
      
      // Create shuffled queue if shuffle is enabled
      if (shuffle) {
        const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
        setShuffledQueue(shuffled);
      }
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
    
    const activeQueue = shuffle ? shuffledQueue : queue;
    if (activeQueue.length === 0) return;
    
    // Handle repeat all - loop back to start
    const nextIndex = (currentIndex + 1) >= activeQueue.length 
      ? (repeat === 'all' ? 0 : currentIndex)
      : (currentIndex + 1);
    
    // If we're at the end and not repeating all, don't play
    if (nextIndex === currentIndex && repeat !== 'all') return;
    
    setCurrentIndex(nextIndex);
    const nextVideo = activeQueue[nextIndex];
    setCurrentVideo(nextVideo);
    loadVideo(nextVideo, true);
    storage.addToRecentlyPlayed(nextVideo).catch(console.error);
  };

  const previous = () => {
    if (queue.length === 0) return;
    
    const activeQueue = shuffle ? shuffledQueue : queue;
    if (activeQueue.length === 0) return;
    
    const prevIndex = currentIndex === 0 ? activeQueue.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    const prevVideo = activeQueue[prevIndex];
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

  const toggleShuffle = () => {
    const newShuffle = !shuffle;
    setShuffle(newShuffle);
    
    if (newShuffle && queue.length > 0) {
      // Create shuffled version of current queue
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      setShuffledQueue(shuffled);
    }
  };

  const toggleRepeat = () => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  };

  const value: PlayerContextType = {
    currentVideo,
    queue,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    playVideo,
    playPause,
    next,
    previous,
    seekTo,
    toggleMute,
    isMuted,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
    initPlayer,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};
