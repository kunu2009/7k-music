import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerStatus, YTPlayer, YouTubeVideo } from '@/types';

interface UseYouTubePlayerOptions {
  onVideoEnd?: () => void;
  onError?: (error: number) => void;
}

export function useYouTubePlayer(options: UseYouTubePlayerOptions = {}) {
  const [player, setPlayer] = useState<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [status, setStatus] = useState<PlayerStatus>('idle');
  const [errorCode, setErrorCode] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [apiReady, setApiReady] = useState(false);
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<number | null>(null);

  const getPreferredQuality = useCallback(() => {
    const savedQuality = localStorage.getItem('player.videoQuality') || 'auto';
    const dataSaver = localStorage.getItem('player.dataSaver') === 'true';

    if (savedQuality !== 'auto') {
      return savedQuality as 'small' | 'medium' | 'large' | 'hd720' | 'hd1080' | 'highres' | 'default';
    }

    if (dataSaver) {
      return 'small' as const;
    }

    return 'default' as const;
  }, []);

  const applyPlaybackQuality = useCallback(() => {
    if (!playerRef.current) return;
    try {
      playerRef.current.setPlaybackQuality(getPreferredQuality());
    } catch (error) {
      console.warn('Could not apply playback quality:', error);
    }
  }, [getPreferredQuality]);

  // Load YouTube IFrame API
  useEffect(() => {
    // Check if API is already loaded
    if (window.YT && window.YT.Player) {
      console.log('✅ YouTube IFrame API Already Loaded');
      setApiReady(true);
      return;
    }

    // Check if script is already in the document
    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]');
    if (existingScript) {
      // Script exists but API might not be ready yet
      const checkAPI = setInterval(() => {
        if (window.YT && window.YT.Player) {
          console.log('✅ YouTube IFrame API Ready (from existing script)');
          setApiReady(true);
          clearInterval(checkAPI);
        }
      }, 100);
      return () => clearInterval(checkAPI);
    }

    // Create script tag
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // The API will call this function when ready
    window.onYouTubeIframeAPIReady = () => {
      console.log('✅ YouTube IFrame API Ready');
      setApiReady(true);
    };
  }, []);

  // Initialize player
  const initializePlayer = useCallback((elementId: string, videoId?: string) => {
    console.log('🎬 initializePlayer called, API ready:', !!window.YT?.Player);
    
    if (!window.YT || !window.YT.Player) {
      console.error('❌ YouTube API not loaded yet, cannot initialize player');
      return;
    }

    // Destroy existing player
    if (playerRef.current) {
      try {
        console.log('🗑️ Destroying existing player');
        playerRef.current.destroy();
        playerRef.current = null;
        setPlayer(null);
        setIsReady(false);
      } catch (e) {
        console.log('Error destroying player:', e);
      }
    }

    console.log('🎬 Creating new YouTube player on element:', elementId);
    
    try {
      new window.YT.Player(elementId, {
        height: '100%',
        width: '100%',
        videoId: videoId || '',
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            console.log('✅ Player Ready');
            setIsReady(true);
            setStatus('paused');
            setErrorCode(null);
            setPlayer(event.target);
            playerRef.current = event.target;
            applyPlaybackQuality();
          },
          onStateChange: (event) => {
            const state = event.data;
            console.log('Player state changed:', state);
            // -1 = unstarted, 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
            if (state === 1) {
              setIsPlaying(true);
              setStatus('playing');
              setDuration(event.target.getDuration());
              applyPlaybackQuality();
              startProgressTracking();
            } else if (state === 2) {
              setIsPlaying(false);
              setStatus('paused');
              stopProgressTracking();
            } else if (state === 3) {
              setStatus('buffering');
            } else if (state === 5) {
              setIsPlaying(false);
              setStatus('paused');
              stopProgressTracking();
            } else if (state === 0) {
              setIsPlaying(false);
              setStatus('paused');
              stopProgressTracking();
              options.onVideoEnd?.();
            }
          },
          onError: (event) => {
            console.error('YouTube Player Error:', event.data);
            // Error codes:
            // 2 – Invalid video ID
            // 5 – HTML5 player error
            // 100 – Video not found or private
            // 101/150 – Video not allowed to be played in embedded players
            
            const errorMessages: { [key: number]: string } = {
              2: 'Invalid video ID - The video cannot be played',
              5: 'HTML5 player error',
              100: 'Video not found or is private',
              101: 'Video cannot be embedded',
              150: 'Video cannot be embedded',
            };
            
            const message = errorMessages[event.data] || 'Unknown error';
            console.error(`❌ YouTube Error ${event.data}: ${message}`);
            
            options.onError?.(event.data);
            setIsPlaying(false);
            setStatus('error');
            setErrorCode(event.data);
          },
        },
      });
    } catch (error) {
      console.error('Error initializing player:', error);
    }
  }, [options]);

  // Progress tracking
  const startProgressTracking = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = window.setInterval(() => {
      if (playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      stopProgressTracking();
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, []);

  // Player controls
  const play = useCallback(() => {
    console.log('▶️ Play called - Player exists:', !!playerRef.current, 'Is ready:', isReady);
    if (playerRef.current && isReady) {
      try {
        setErrorCode(null);
        playerRef.current.playVideo();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    } else {
      console.warn('⚠️ Player not ready yet');
    }
  }, [isReady]);

  const pause = useCallback(() => {
    console.log('⏸️ Pause called - Player exists:', !!playerRef.current, 'Is ready:', isReady);
    if (playerRef.current && isReady) {
      try {
        playerRef.current.pauseVideo();
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    } else {
      console.warn('⚠️ Player not ready yet');
    }
  }, [isReady]);

  const loadVideo = useCallback((video: YouTubeVideo, autoplay = true) => {
    console.log('📼 Loading video:', video.title, 'Player ready:', isReady, 'Autoplay:', autoplay);
    if (playerRef.current && isReady) {
      try {
        setStatus('loading');
        setErrorCode(null);
        if (autoplay) {
          playerRef.current.loadVideoById(video.id);
        } else {
          playerRef.current.cueVideoById(video.id);
        }
        window.setTimeout(() => {
          applyPlaybackQuality();
        }, 400);
      } catch (error) {
        console.error('Error loading video:', error);
      }
    } else {
      console.warn('⚠️ Player not initialized yet, video ID:', video.id);
    }
  }, [isReady, applyPlaybackQuality]);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (playerRef.current.isMuted()) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
    }
  }, []);

  return {
    player,
    isReady,
    isPlaying,
    status,
    errorCode,
    currentTime,
    duration,
    apiReady,
    initializePlayer,
    play,
    pause,
    loadVideo,
    seekTo,
    setVolume,
    toggleMute,
  };
}
