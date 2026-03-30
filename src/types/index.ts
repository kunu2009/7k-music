// YouTube Data API Types
export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnails: {
    default: string;
    medium: string;
    high: string;
    maxres?: string;
  };
  viewCount?: string;
  publishedAt: string;
  duration?: string;
  description?: string;
}

export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchItem[];
}

export interface YouTubeSearchItem {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
    publishTime: string;
  };
}

export interface YouTubeVideoDetails {
  kind: string;
  etag: string;
  items: {
    id: string;
    snippet: {
      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: { url: string; width: number; height: number };
        medium: { url: string; width: number; height: number };
        high: { url: string; width: number; height: number };
        standard?: { url: string; width: number; height: number };
        maxres?: { url: string; width: number; height: number };
      };
      channelTitle: string;
      tags?: string[];
      categoryId: string;
    };
    contentDetails: {
      duration: string;
      dimension: string;
      definition: string;
    };
    statistics: {
      viewCount: string;
      likeCount: string;
      commentCount: string;
    };
  }[];
}

// App State Types
export interface Playlist {
  id: string;
  name: string;
  videos: YouTubeVideo[];
  createdAt: string;
  updatedAt: string;
}

export interface PlayerState {
  currentVideo: YouTubeVideo | null;
  isPlaying: boolean;
  queue: YouTubeVideo[];
  currentIndex: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
}

export type PlayerStatus = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused' | 'error';

// YouTube Player API Types
export interface YT {
  Player: new (elementId: string, config: YTPlayerConfig) => YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

export interface YTPlayerConfig {
  height?: string;
  width?: string;
  videoId?: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    modestbranding?: 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    fs?: 0 | 1;
    playsinline?: 0 | 1;
  };
  events?: {
    onReady?: (event: { target: YTPlayer }) => void;
    onStateChange?: (event: { target: YTPlayer; data: number }) => void;
    onError?: (event: { target: YTPlayer; data: number }) => void;
  };
}

export interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  loadVideoById: (videoId: string | { videoId: string; startSeconds?: number }) => void;
  cueVideoById: (videoId: string | { videoId: string; startSeconds?: number }) => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVolume: () => number;
  setVolume: (volume: number) => void;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// Creative Commons Music Types (for future expansion)
export interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  duration: number;
  image: string;
  audio: string;
  audiodownload: string;
  license_ccurl: string;
}
