import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { VideoCard } from '@/components/VideoCard';
import { EmptyState } from '@/components/common';
import { YouTubeVideo } from '@/types';
import { youtubeApi } from '@/utils/youtube';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites, usePlaylists, useRecentlyPlayed } from '@/hooks/useStorage';
import { PlaylistPickerModal } from '@/components/PlaylistPickerModal';
import {
  ANDROID_APK_OPTIONS,
  ANDROID_RELEASE_META,
  AndroidAbi,
  detectPreferredAndroidAbi,
} from '@/utils/androidDownloads';
import {
  Cpu,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  Flame,
  Music2,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

const HOME_CACHE_KEY = 'home-page-cache-v2';
const HOME_PREFERENCES_KEY = 'home-preferences-v1';
const HOME_ONBOARDING_DONE_KEY = 'home-onboarding-done-v1';
const HOME_NOT_INTERESTED_KEY = 'home-not-interested-v1';

const HOME_GENRES = [
  'Pop',
  'Hip-Hop',
  'Afrobeats',
  'EDM',
  'Lo-fi',
  'Rock',
  'Indie',
  'Punjabi',
  'K-Pop',
  'Classical',
];

const HOME_ARTISTS = [
  'Arijit Singh',
  'Bad Bunny',
  'Billie Eilish',
  'Drake',
  'Dua Lipa',
  'Ed Sheeran',
  'Karan Aujla',
  'Shreya Ghoshal',
  'The Weeknd',
  'Travis Scott',
];

const HOME_SONGS = [
  'Blinding Lights',
  'Kesariya',
  'Levitating',
  'Perfect',
  'Shape of You',
  'Tere Vaaste',
  'The Box',
  'Unholy',
  'Water',
  'Wavy',
];

interface HomePreferences {
  genres: string[];
  artists: string[];
  songs: string[];
}

interface HomeSection {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  videos: YouTubeVideo[];
  reasonChips?: string[];
}

interface HomeNotInterested {
  videoIds: string[];
  channels: string[];
}

function dedupeVideos(videos: YouTubeVideo[]) {
  const seen = new Set<string>();
  return videos.filter((video) => {
    if (seen.has(video.id)) {
      return false;
    }
    seen.add(video.id);
    return true;
  });
}

function topN(values: string[], count: number) {
  const frequency = new Map<string, number>();
  values
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      frequency.set(item, (frequency.get(item) || 0) + 1);
    });

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([item]) => item);
}

function compactTitle(title: string) {
  return title.split(/[\-|\|•]/)[0]?.trim() || title.trim();
}

function normalizeChannel(channelTitle: string) {
  return channelTitle.toLowerCase().replace(/\s+/g, ' ').trim();
}

function PreferenceChip({
  label,
  selected,
  onToggle,
}: {
  label: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`px-4 py-2 rounded-full text-sm transition-all border ${
        selected
          ? 'bg-blue-100 text-slate-900 border-blue-100'
          : 'bg-blue-500/10 text-blue-100 border-blue-200/20 hover:bg-blue-500/20'
      }`}
    >
      {label}
    </button>
  );
}

function HomeOnboardingModal({
  open,
  loading,
  draft,
  onToggleGenre,
  onToggleArtist,
  onToggleSong,
  onSkip,
  onSave,
}: {
  open: boolean;
  loading: boolean;
  draft: HomePreferences;
  onToggleGenre: (genre: string) => void;
  onToggleArtist: (artist: string) => void;
  onToggleSong: (song: string) => void;
  onSkip: () => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <div className="max-w-3xl mx-auto glass-surface rounded-3xl border border-blue-200/20 p-6 md:p-8">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-blue-100" />
          <h3 className="text-2xl md:text-3xl font-bold text-white">Make Home Yours</h3>
        </div>
        <p className="text-blue-100/75 mb-8">
          Pick your genres and artists once. We will shape your recommendations around them.
        </p>

        <div className="space-y-6">
          <section>
            <h4 className="text-white font-semibold mb-3">Select Genres</h4>
            <div className="flex flex-wrap gap-2">
              {HOME_GENRES.map((genre) => (
                <PreferenceChip
                  key={genre}
                  label={genre}
                  selected={draft.genres.includes(genre)}
                  onToggle={() => onToggleGenre(genre)}
                />
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-3">Select Artists</h4>
            <div className="flex flex-wrap gap-2">
              {HOME_ARTISTS.map((artist) => (
                <PreferenceChip
                  key={artist}
                  label={artist}
                  selected={draft.artists.includes(artist)}
                  onToggle={() => onToggleArtist(artist)}
                />
              ))}
            </div>
          </section>

          <section>
            <h4 className="text-white font-semibold mb-3">Pick Favorite Songs</h4>
            <div className="flex flex-wrap gap-2">
              {HOME_SONGS.map((song) => (
                <PreferenceChip
                  key={song}
                  label={song}
                  selected={draft.songs.includes(song)}
                  onToggle={() => onToggleSong(song)}
                />
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className="pill-action px-6 py-3 font-semibold disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="px-5 py-3 rounded-full border border-blue-200/30 text-blue-100/90 hover:bg-blue-500/15 transition disabled:opacity-60"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}

function HorizontalVideoRail({
  section,
  loading,
  showAll,
  onToggleShowAll,
  onPlay,
  onFavorite,
  isFavorite,
  onAddToPlaylist,
  onNotInterested,
}: {
  section: HomeSection;
  loading: boolean;
  showAll?: boolean;
  onToggleShowAll?: () => void;
  onPlay: (video: YouTubeVideo, queue: YouTubeVideo[]) => void;
  onFavorite: (video: YouTubeVideo) => void;
  isFavorite: (videoId: string) => boolean;
  onAddToPlaylist: (video: YouTubeVideo) => void;
  onNotInterested?: (video: YouTubeVideo) => void;
}) {
  const scrollContainerId = `rail-${section.id}`;

  const scrollByAmount = (direction: 'left' | 'right') => {
    const node = document.getElementById(scrollContainerId);
    if (!node) return;
    const amount = direction === 'left' ? -560 : 560;
    node.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
            {section.icon}
            {section.title}
          </h3>
          <p className="text-blue-100/70 text-sm mt-1">{section.subtitle}</p>
          {!!section.reasonChips?.length && (
            <div className="mt-3 flex flex-wrap gap-2">
              {section.reasonChips.map((chip) => (
                <span
                  key={`${section.id}-${chip}`}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-blue-200/30 text-blue-100/85 bg-blue-500/10"
                >
                  Because you liked {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2">
          {onToggleShowAll && (
            <button
              type="button"
              onClick={onToggleShowAll}
              className="px-4 py-2 rounded-full border border-blue-200/25 text-xs text-blue-100/90 hover:bg-blue-500/20 transition"
            >
              {showAll ? 'Show Less' : 'See All'}
            </button>
          )}
          <button
            type="button"
            aria-label={`Scroll ${section.title} left`}
            onClick={() => scrollByAmount('left')}
            className="w-10 h-10 rounded-full border border-blue-200/25 text-blue-100/90 hover:bg-blue-500/20 transition inline-flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            aria-label={`Scroll ${section.title} right`}
            onClick={() => scrollByAmount('right')}
            className="w-10 h-10 rounded-full border border-blue-200/25 text-blue-100/90 hover:bg-blue-500/20 transition inline-flex items-center justify-center"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="min-w-[260px] sm:min-w-[290px] glass-surface rounded-2xl overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-blue-200/10" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-blue-200/10 rounded w-full" />
                <div className="h-4 bg-blue-200/10 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : section.videos.length === 0 ? (
        <div className="glass-surface rounded-2xl px-5 py-8 text-blue-100/70 text-sm">
          Nothing here yet. Try refreshing home feed.
        </div>
      ) : showAll ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {section.videos.map((video) => (
            <VideoCard
              key={`${section.id}-${video.id}`}
              video={video}
              onPlay={() => onPlay(video, section.videos)}
              onFavorite={onFavorite}
              isFavorite={isFavorite(video.id)}
              onAddToPlaylist={onAddToPlaylist}
              onNotInterested={onNotInterested}
            />
          ))}
        </div>
      ) : (
        <div
          id={scrollContainerId}
          className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory"
        >
          {section.videos.map((video) => (
            <div key={`${section.id}-${video.id}`} className="min-w-[260px] sm:min-w-[290px] snap-start">
              <VideoCard
                video={video}
                onPlay={() => onPlay(video, section.videos)}
                onFavorite={onFavorite}
                isFavorite={isFavorite(video.id)}
                onAddToPlaylist={onAddToPlaylist}
                onNotInterested={onNotInterested}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export const HomePage: React.FC = () => {
  const [trendingVideos, setTrendingVideos] = useState<YouTubeVideo[]>([]);
  const [featuredVideos, setFeaturedVideos] = useState<YouTubeVideo[]>([]);
  const [latestVideos, setLatestVideos] = useState<YouTubeVideo[]>([]);
  const [becausePlayedVideos, setBecausePlayedVideos] = useState<YouTubeVideo[]>([]);
  const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]);
  const [recommendationChips, setRecommendationChips] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [preferences, setPreferences] = useState<HomePreferences | null>(null);
  const [draftPreferences, setDraftPreferences] = useState<HomePreferences>({ genres: [], artists: [], songs: [] });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [selectedVideoForPlaylist, setSelectedVideoForPlaylist] = useState<YouTubeVideo | null>(null);
  const [notInterested, setNotInterested] = useState<HomeNotInterested>({ videoIds: [], channels: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { playVideo } = usePlayer();
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { recentlyPlayed } = useRecentlyPlayed();
  const { playlists, addToPlaylist, createPlaylist } = usePlaylists();

  const isHiddenVideo = (video: YouTubeVideo, rules = notInterested) =>
    rules.videoIds.includes(video.id) || rules.channels.includes(normalizeChannel(video.channelTitle));

  const filterHiddenVideos = (videos: YouTubeVideo[], rules = notInterested) =>
    videos.filter((video) => !isHiddenVideo(video, rules));

  const recommendedAbi = useMemo<AndroidAbi>(() => {
    if (typeof navigator === 'undefined') {
      return 'arm64-v8a';
    }
    return detectPreferredAndroidAbi(navigator.userAgent || '');
  }, []);

  const recommendedApk = useMemo(
    () => ANDROID_APK_OPTIONS.find((option) => option.abi === recommendedAbi) || ANDROID_APK_OPTIONS[0],
    [recommendedAbi]
  );

  const sections = useMemo<HomeSection[]>(
    () => [
      {
        id: 'for-you',
        title: 'For You',
        subtitle: preferences
          ? 'Personalized from your favorite artists and genres'
          : 'Save preferences to get tailored recommendations',
        icon: <Sparkles className="w-5 h-5 text-blue-100" />,
        videos: recommendedVideos,
        reasonChips: recommendationChips,
      },
      {
        id: 'because-played',
        title: 'Because You Played',
        subtitle: recentlyPlayed.length > 0
          ? 'More tracks related to your latest listening'
          : 'Play some tracks to unlock related recommendations',
        icon: <Sparkles className="w-5 h-5 text-cyan-100" />,
        videos: becausePlayedVideos,
        reasonChips: topN(recentlyPlayed.slice(0, 6).map((video) => compactTitle(video.title)), 3),
      },
      {
        id: 'trending',
        title: 'Trending Right Now',
        subtitle: 'Most popular tracks people are playing today',
        icon: <Flame className="w-5 h-5 text-amber-300" />,
        videos: trendingVideos,
      },
      {
        id: 'latest',
        title: 'Latest Releases',
        subtitle: 'Fresh drops and newly published songs',
        icon: <Compass className="w-5 h-5 text-cyan-200" />,
        videos: latestVideos,
      },
      {
        id: 'featured',
        title: 'Featured Picks',
        subtitle: 'Curated hits, performances, and official videos',
        icon: <TrendingUp className="w-5 h-5 text-blue-200" />,
        videos: featuredVideos,
      },
    ],
    [becausePlayedVideos, featuredVideos, latestVideos, preferences, recommendationChips, recommendedVideos, recentlyPlayed, trendingVideos]
  );

  useEffect(() => {
    try {
      const storedNotInterested = localStorage.getItem(HOME_NOT_INTERESTED_KEY);
      if (storedNotInterested) {
        const parsedNotInterested = JSON.parse(storedNotInterested) as HomeNotInterested;
        if (Array.isArray(parsedNotInterested.videoIds) && Array.isArray(parsedNotInterested.channels)) {
          setNotInterested(parsedNotInterested);
        }
      }

      const cached = localStorage.getItem(HOME_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as {
          trending?: YouTubeVideo[];
          latest?: YouTubeVideo[];
          featured?: YouTubeVideo[];
          becausePlayed?: YouTubeVideo[];
          recommended?: YouTubeVideo[];
        };

        if (Array.isArray(parsed.trending) && parsed.trending.length > 0) {
          const activeRules = storedNotInterested
            ? (JSON.parse(storedNotInterested) as HomeNotInterested)
            : { videoIds: [], channels: [] };
          setTrendingVideos(filterHiddenVideos(parsed.trending, activeRules));
          setLatestVideos(filterHiddenVideos(parsed.latest || [], activeRules));
          setFeaturedVideos(filterHiddenVideos(parsed.featured || [], activeRules));
          setBecausePlayedVideos(filterHiddenVideos(parsed.becausePlayed || [], activeRules));
          setRecommendedVideos(filterHiddenVideos(parsed.recommended || [], activeRules));
          setLoading(false);
        }
      }
    } catch (cacheError) {
      console.error('Failed to read home cache:', cacheError);
    }

    try {
      const storedPreferences = localStorage.getItem(HOME_PREFERENCES_KEY);
      const onboardingDone = localStorage.getItem(HOME_ONBOARDING_DONE_KEY) === '1';
      if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences) as HomePreferences;
        if (
          Array.isArray(parsedPreferences.genres) &&
          Array.isArray(parsedPreferences.artists) &&
          Array.isArray(parsedPreferences.songs)
        ) {
          setPreferences(parsedPreferences);
          setDraftPreferences(parsedPreferences);
        }
      } else if (!onboardingDone) {
        setShowOnboarding(true);
      }
    } catch {
      setShowOnboarding(true);
    }

    loadHomeSections();
  }, []);

  useEffect(() => {
    if (!error) {
      return;
    }

    const onReconnect = () => {
      loadHomeSections();
    };

    window.addEventListener('online', onReconnect);
    return () => window.removeEventListener('online', onReconnect);
  }, [error]);

  useEffect(() => {
    if (favorites.length === 0 && recentlyPlayed.length === 0) {
      return;
    }

    loadHomeSections(undefined, true);
  }, [favorites, recentlyPlayed]);

  const getRecommendationSignals = (activePreferences: HomePreferences | null) => {
    const preferenceSignals = [
      ...(activePreferences?.genres || []),
      ...(activePreferences?.artists || []),
      ...(activePreferences?.songs || []),
    ];

    const favoriteSignals = [
      ...favorites.slice(0, 8).map((video) => video.channelTitle),
      ...favorites.slice(0, 8).map((video) => compactTitle(video.title)),
    ];

    const recentSignals = [
      ...recentlyPlayed.slice(0, 8).map((video) => video.channelTitle),
      ...recentlyPlayed.slice(0, 8).map((video) => compactTitle(video.title)),
    ];

    const weighted = [
      ...preferenceSignals,
      ...preferenceSignals,
      ...favoriteSignals,
      ...recentSignals,
    ];

    const topSignals = topN(weighted, 4);
    return {
      topSignals,
      explainability: topN([...preferenceSignals, ...favoriteSignals, ...recentSignals], 3),
    };
  };

  const buildRecommendedQuery = (activePreferences: HomePreferences | null) => {
    const { topSignals } = getRecommendationSignals(activePreferences);

    if (topSignals.length > 0) {
      return `${topSignals.join(' ')} official music`;
    }

    if (!activePreferences) {
      return 'best music mix 2026';
    }

    const genreQuery = activePreferences.genres.slice(0, 2).join(' ');
    const artistQuery = activePreferences.artists.slice(0, 2).join(' ');
    const songQuery = activePreferences.songs.slice(0, 2).join(' ');
    const composite = `${genreQuery} ${artistQuery} ${songQuery}`.trim();

    return composite ? `${composite} official music` : 'best music mix 2026';
  };

  const buildBecausePlayedVideos = async () => {
    const seedVideos = dedupeVideos([...recentlyPlayed.slice(0, 3), ...favorites.slice(0, 2)]).slice(0, 3);

    if (seedVideos.length === 0) {
      return [] as YouTubeVideo[];
    }

    const related = await Promise.all(seedVideos.map((video) => youtubeApi.getRelatedVideos(video.id, 8)));
    const flattened = dedupeVideos(related.flat());
    const seedIds = new Set(seedVideos.map((video) => video.id));
    return flattened.filter((video) => !seedIds.has(video.id)).slice(0, 16);
  };

  const loadHomeSections = async (
    nextPreferences?: HomePreferences | null,
    refreshRecommendedOnly = false
  ) => {
    const activePreferences = nextPreferences !== undefined ? nextPreferences : preferences;
    const { explainability } = getRecommendationSignals(activePreferences);
    const activeRules = notInterested;

    try {
      setLoading(true);
      setError(null);

      const recommended = await youtubeApi.searchMusicVideos(buildRecommendedQuery(activePreferences), 16);
      const becausePlayed = await buildBecausePlayedVideos();
      setRecommendationChips(explainability);
      setBecausePlayedVideos(filterHiddenVideos(becausePlayed, activeRules));

      if (refreshRecommendedOnly) {
        const normalizedRecommendedOnly = activePreferences
          ? dedupeVideos(recommended)
          : dedupeVideos(recommended).slice(0, 10);
        setRecommendedVideos(filterHiddenVideos(normalizedRecommendedOnly, activeRules));
        return;
      }

      const [trending, latest, featured] = await Promise.all([
        youtubeApi.getTrendingMusicVideos(16),
        youtubeApi.searchMusicVideos('new music releases 2026 official', 16),
        youtubeApi.searchMusicVideos('featured music videos live performance', 16),
      ]);

      const normalizedLatest = [...latest].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      const normalizedRecommended = activePreferences
        ? dedupeVideos(recommended)
        : dedupeVideos(recommended).slice(0, 10);

      setTrendingVideos(filterHiddenVideos(dedupeVideos(trending), activeRules));
      setLatestVideos(filterHiddenVideos(dedupeVideos(normalizedLatest), activeRules));
      setFeaturedVideos(filterHiddenVideos(dedupeVideos(featured), activeRules));
      setBecausePlayedVideos(filterHiddenVideos(becausePlayed, activeRules));
      setRecommendedVideos(filterHiddenVideos(normalizedRecommended, activeRules));

      localStorage.setItem(
        HOME_CACHE_KEY,
        JSON.stringify({
          trending: dedupeVideos(trending),
          latest: dedupeVideos(normalizedLatest),
          featured: dedupeVideos(featured),
          becausePlayed,
          recommended: normalizedRecommended,
          cachedAt: Date.now(),
        })
      );
    } catch (err) {
      console.error('Error loading home feed:', err);
      if (trendingVideos.length === 0 && featuredVideos.length === 0 && latestVideos.length === 0) {
        setError('Failed to load home feed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (video: YouTubeVideo, queue: YouTubeVideo[]) => {
    playVideo(video, queue);
  };

  const handleFavorite = async (video: YouTubeVideo) => {
    if (isFavorite(video.id)) {
      await removeFavorite(video.id);
    } else {
      await addFavorite(video);
    }
  };

  const handleAddToPlaylist = async (video: YouTubeVideo) => {
    setSelectedVideoForPlaylist(video);
  };

  const handleNotInterested = (video: YouTubeVideo) => {
    const next: HomeNotInterested = {
      videoIds: [...new Set([...notInterested.videoIds, video.id])],
      channels: [...new Set([...notInterested.channels, normalizeChannel(video.channelTitle)])],
    };

    setNotInterested(next);
    localStorage.setItem(HOME_NOT_INTERESTED_KEY, JSON.stringify(next));

    setTrendingVideos((prev) => prev.filter((item) => !isHiddenVideo(item, next)));
    setLatestVideos((prev) => prev.filter((item) => !isHiddenVideo(item, next)));
    setFeaturedVideos((prev) => prev.filter((item) => !isHiddenVideo(item, next)));
    setBecausePlayedVideos((prev) => prev.filter((item) => !isHiddenVideo(item, next)));
    setRecommendedVideos((prev) => prev.filter((item) => !isHiddenVideo(item, next)));
  };

  const handleResetNotInterested = () => {
    const cleared = { videoIds: [], channels: [] };
    setNotInterested(cleared);
    localStorage.removeItem(HOME_NOT_INTERESTED_KEY);
    loadHomeSections();
  };

  const handleSelectPlaylist = async (playlistId: string) => {
    if (!selectedVideoForPlaylist) return;
    await addToPlaylist(playlistId, selectedVideoForPlaylist);
  };

  const handleCreateAndAdd = async (playlistName: string) => {
    if (!selectedVideoForPlaylist) return;
    const created = await createPlaylist(playlistName);
    if (created) {
      await addToPlaylist(created.id, selectedVideoForPlaylist);
    }
  };

  const togglePreference = (list: string[], item: string) =>
    list.includes(item) ? list.filter((value) => value !== item) : [...list, item];

  const handleToggleGenre = (genre: string) => {
    setDraftPreferences((prev) => ({
      ...prev,
      genres: togglePreference(prev.genres, genre),
    }));
  };

  const handleToggleArtist = (artist: string) => {
    setDraftPreferences((prev) => ({
      ...prev,
      artists: togglePreference(prev.artists, artist),
    }));
  };

  const handleToggleSong = (song: string) => {
    setDraftPreferences((prev) => ({
      ...prev,
      songs: togglePreference(prev.songs, song),
    }));
  };

  const handleSavePreferences = async () => {
    localStorage.setItem(HOME_PREFERENCES_KEY, JSON.stringify(draftPreferences));
    localStorage.setItem(HOME_ONBOARDING_DONE_KEY, '1');
    setPreferences(draftPreferences);
    setShowOnboarding(false);
    await loadHomeSections(draftPreferences);
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem(HOME_ONBOARDING_DONE_KEY, '1');
    setShowOnboarding(false);
  };

  const hasPersonalization = Boolean(
    preferences &&
      (preferences.genres.length > 0 || preferences.artists.length > 0 || preferences.songs.length > 0)
  );

  return (
    <div className="app-page">
      <div className="container mx-auto px-4">
        <div className="mb-8 glass-surface rounded-3xl p-6 md:p-8 border border-blue-200/15">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-8 h-8 text-blue-200" />
                <h2 className="text-3xl font-bold text-white">Discover Your Sound</h2>
              </div>
              <p className="text-blue-100/75 max-w-2xl">
                Explore multiple live sections with trending songs, new drops, and picks shaped by your taste.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowOnboarding(true)}
                className="px-4 py-2 rounded-full border border-blue-200/30 text-sm text-blue-100/90 hover:bg-blue-500/15 transition"
              >
                {hasPersonalization ? 'Edit Taste Profile' : 'Set Preferences'}
              </button>

              <button
                type="button"
                onClick={() => loadHomeSections()}
                className="px-4 py-2 rounded-full border border-blue-200/30 text-sm text-blue-100/90 hover:bg-blue-500/15 transition inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              {notInterested.videoIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetNotInterested}
                  className="px-4 py-2 rounded-full border border-blue-200/30 text-sm text-blue-100/90 hover:bg-blue-500/15 transition"
                >
                  Reset Hidden
                </button>
              )}
            </div>
          </div>
        </div>

        {error ? (
          <EmptyState
            icon={<Music2 className="w-16 h-16" />}
            title="Failed to Load Home Feed"
            description={error}
            action={{
              label: 'Try Again',
              onClick: () => loadHomeSections(),
            }}
          />
        ) : (
          <div>
            {sections.map((section) => (
              <HorizontalVideoRail
                key={section.id}
                section={section}
                loading={loading}
                showAll={!!expandedSections[section.id]}
                onToggleShowAll={() =>
                  setExpandedSections((prev) => ({
                    ...prev,
                    [section.id]: !prev[section.id],
                  }))
                }
                onPlay={handlePlay}
                onFavorite={handleFavorite}
                isFavorite={isFavorite}
                onAddToPlaylist={handleAddToPlaylist}
                onNotInterested={handleNotInterested}
              />
            ))}
          </div>
        )}

        <div className="mt-12 glass-surface rounded-2xl border border-blue-200/20 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-200" />
                Android App Download
              </h3>
              <p className="text-blue-100/80 text-sm max-w-2xl">
                Pick the APK that matches your phone architecture for a smaller install. Recommended for this device:
                <span className="text-white font-semibold"> {recommendedApk.label}</span>.
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-blue-100/80">
                <span className="px-2 py-1 rounded-full border border-blue-200/25">{ANDROID_RELEASE_META.versionLabel}</span>
                <span className="px-2 py-1 rounded-full border border-blue-200/25">{ANDROID_RELEASE_META.buildLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={recommendedApk.href}
                download
                className="pill-action px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Recommended APK
              </a>
              <Link
                to="/downloads"
                className="px-5 py-2.5 rounded-full border border-blue-200/30 text-sm text-blue-100/90 hover:bg-blue-500/15 transition"
              >
                More Download Options
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {ANDROID_APK_OPTIONS.map((option) => {
              const isRecommended = option.abi === recommendedAbi;
              return (
                <div
                  key={option.abi}
                  className={`rounded-xl border p-4 ${
                    isRecommended
                      ? 'border-blue-200/70 bg-blue-500/20'
                      : 'border-blue-200/20 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <p className="text-white font-semibold text-sm">{option.label}</p>
                    {isRecommended && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-blue-100 text-slate-900 font-bold">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-blue-100/75 text-xs mb-3">{option.description}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-blue-100/85 text-xs inline-flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5" />
                      {option.abi}
                    </span>
                    <span className="text-blue-100/90 text-xs">{option.sizeLabel}</span>
                  </div>
                  <a
                    href={option.href}
                    download
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200/30 px-3 py-2 text-xs text-blue-100/90 hover:bg-blue-500/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        <section className="mt-12 glass-surface rounded-2xl border border-blue-200/20 p-6 space-y-3">
          <h2 className="text-white font-semibold text-xl">About 7K Music</h2>
          <p className="text-blue-100/80 text-sm leading-7">
            7K Music is a music discovery web app for streaming and organizing music videos in a fast, app-like
            interface. You can search songs, browse trending videos, create playlists, and continue playback across
            sections with queue controls.
          </p>
          <p className="text-blue-100/80 text-sm leading-7">
            The app supports both web and Android users through its Progressive Web App experience and architecture-based
            APK downloads. If you are looking for a lightweight music video player with modern controls, 7K Music offers
            search, favorites, categories, and download guidance in one place.
          </p>
        </section>

        {/* Legal Notice */}
        <div className="mt-12 p-6 glass-surface rounded-2xl">
          <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-200" />
            Legal and Ethical Notice
          </h3>
          <p className="text-blue-100/80 text-sm">
            All videos are streamed through the official YouTube IFrame Player API. 
            We do not download, store, or modify any copyrighted content. 
            All content remains on YouTube's servers and is subject to their Terms of Service. 
            YouTube branding and controls are preserved as required.
          </p>
        </div>

        <HomeOnboardingModal
          open={showOnboarding}
          loading={loading}
          draft={draftPreferences}
          onToggleGenre={handleToggleGenre}
          onToggleArtist={handleToggleArtist}
          onToggleSong={handleToggleSong}
          onSkip={handleSkipOnboarding}
          onSave={handleSavePreferences}
        />

        <PlaylistPickerModal
          isOpen={!!selectedVideoForPlaylist}
          playlists={playlists}
          onClose={() => setSelectedVideoForPlaylist(null)}
          onSelectPlaylist={handleSelectPlaylist}
          onCreateAndAdd={handleCreateAndAdd}
        />
      </div>
    </div>
  );
};
