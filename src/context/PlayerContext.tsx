import React, { useState, createContext, useContext, useRef, useEffect } from 'react';
import { PlayerStatus, YouTubeVideo } from '@/types';
import { useYouTubePlayer } from '@/hooks/useYouTubePlayer';
import { storage } from '@/utils/storage';

const PLAYER_PERSISTENCE_KEY = 'player-state-v1';

interface PersistedPlayerState {
  currentVideo: YouTubeVideo | null;
  queue: YouTubeVideo[];
  currentIndex: number;
  currentTime: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
  isMuted: boolean;
}

interface PlayerContextType {
  currentVideo: YouTubeVideo | null;
  queue: YouTubeVideo[];
  currentIndex: number;
  apiReady: boolean;
  isReady: boolean;
  playerStatus: PlayerStatus;
  playerErrorCode: number | null;
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
  const pendingVideoRef = useRef<YouTubeVideo | null>(null);
  const pendingSeekTimeRef = useRef<number>(0);
  const hasRestoredStateRef = useRef(false);

  const {
    isPlaying,
    status,
    errorCode,
    currentTime,
    duration,
    apiReady,
    isReady,
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
    onError: (_errorCode) => {
      if (queue.length > 1) {
        next();
      }
    },
  });

  useEffect(() => {
    if (!apiReady || !isReady || !pendingVideoRef.current) {
      return;
    }

    const videoToPlay = pendingVideoRef.current;
    pendingVideoRef.current = null;
    loadVideo(videoToPlay, true);
  }, [apiReady, isReady, loadVideo]);

  useEffect(() => {
    if (hasRestoredStateRef.current) {
      return;
    }

    try {
      const raw = localStorage.getItem(PLAYER_PERSISTENCE_KEY);
      if (!raw) {
        hasRestoredStateRef.current = true;
        return;
      }

      const persisted = JSON.parse(raw) as PersistedPlayerState;
      setQueue(Array.isArray(persisted.queue) ? persisted.queue : []);
      setCurrentIndex(typeof persisted.currentIndex === 'number' ? persisted.currentIndex : 0);
      setCurrentVideo(persisted.currentVideo || null);
      setRepeat(persisted.repeat || 'off');
      setShuffle(!!persisted.shuffle);
      setIsMuted(!!persisted.isMuted);
      pendingSeekTimeRef.current = typeof persisted.currentTime === 'number' ? persisted.currentTime : 0;
    } catch (error) {
      console.error('Failed to restore player state:', error);
    } finally {
      hasRestoredStateRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (!apiReady || !isReady || !currentVideo) {
      return;
    }

    const seekTime = pendingSeekTimeRef.current;
    if (seekTime <= 0) {
      return;
    }

    loadVideo(currentVideo, false);
    const timer = window.setTimeout(() => {
      playerSeekTo(seekTime);
      pendingSeekTimeRef.current = 0;
    }, 400);

    return () => window.clearTimeout(timer);
  }, [apiReady, isReady, currentVideo, loadVideo, playerSeekTo]);

  useEffect(() => {
    if (!hasRestoredStateRef.current) {
      return;
    }

    const persisted: PersistedPlayerState = {
      currentVideo,
      queue,
      currentIndex,
      currentTime,
      repeat,
      shuffle,
      isMuted,
    };

    try {
      localStorage.setItem(PLAYER_PERSISTENCE_KEY, JSON.stringify(persisted));
    } catch (error) {
      console.error('Failed to persist player state:', error);
    }
  }, [currentVideo, queue, currentIndex, currentTime, repeat, shuffle, isMuted]);

  useEffect(() => {
    const handleReconnect = () => {
      if (!currentVideo || !apiReady || !isReady) {
        return;
      }

      if (status === 'error' || status === 'buffering' || status === 'paused') {
        loadVideo(currentVideo, true);
      }
    };

    window.addEventListener('online', handleReconnect);
    return () => window.removeEventListener('online', handleReconnect);
  }, [currentVideo, apiReady, isReady, status, loadVideo]);

  const initPlayer = (elementId: string) => {
    initializePlayer(elementId);
  };

  const playVideo = (video: YouTubeVideo, newQueue?: YouTubeVideo[]) => {
    console.log('🎵 Playing video:', video.title, 'API Ready:', apiReady, 'Player Ready:', isReady);
    
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
    
    // Wait for both API and Player to be ready
    if (!apiReady || !isReady) {
      console.warn('⚠️ Player not ready yet, waiting... API:', apiReady, 'Player:', isReady);
      pendingVideoRef.current = video;
    } else {
      console.log('✅ Player ready, loading video immediately');
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
    apiReady,
    isReady,
    playerStatus: status,
    playerErrorCode: errorCode,
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
