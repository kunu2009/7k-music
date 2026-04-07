import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Heart,
  MoreVertical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  ListMusic,
  Volume2,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { useFavorites } from '@/hooks/useStorage';
import { triggerHaptic } from '@/utils/feedback';
import { LyricsSuggestion, lyricsApi } from '@/utils/lyrics';
import { musicBrainzApi } from '@/utils/musicbrainz';

export function NowPlayingPage() {
  const navigate = useNavigate();
  const {
    currentVideo,
    playerStatus,
    playerErrorCode,
    isPlaying,
    currentTime,
    duration,
    playPause,
    next,
    previous,
    seekTo,
    queue,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const [isSeeking, setIsSeeking] = useState(false);
  const [previewTime, setPreviewTime] = useState<number | null>(null);
  const [lyrics, setLyrics] = useState<string>('');
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsSuggestions, setLyricsSuggestions] = useState<LyricsSuggestion[]>([]);
  const [pickingSuggestion, setPickingSuggestion] = useState(false);
  const [metadata, setMetadata] = useState<{
    releaseTitle?: string;
    releaseDate?: string;
    country?: string;
    genres?: string[];
    url?: string;
  } | null>(null);
  const [metadataLoading, setMetadataLoading] = useState(false);

  if (!currentVideo) {
    navigate('/');
    return null;
  }

  const favorite = isFavorite(currentVideo.id);

  useEffect(() => {
    let mounted = true;

    const loadLyrics = async () => {
      setLyrics('');
      setLyricsSuggestions([]);
      setLyricsLoading(true);
      try {
        const result = await lyricsApi.lookupLyrics(currentVideo.title, currentVideo.channelTitle);
        if (!mounted) return;
        setLyrics(result.lyrics ?? 'Lyrics not found for this track yet.');
        setLyricsSuggestions(result.suggestions);
      } catch {
        if (!mounted) return;
        setLyrics('Could not load lyrics right now.');
        setLyricsSuggestions([]);
      } finally {
        if (mounted) {
          setLyricsLoading(false);
        }
      }
    };

    loadLyrics();
    return () => {
      mounted = false;
    };
  }, [currentVideo.id, currentVideo.title, currentVideo.channelTitle]);

  useEffect(() => {
    let mounted = true;

    const loadMetadata = async () => {
      setMetadata(null);
      setMetadataLoading(true);
      try {
        const result = await musicBrainzApi.getMetadata(currentVideo.title, currentVideo.channelTitle);
        if (!mounted) return;
        setMetadata(result ? {
          releaseTitle: result.releaseTitle,
          releaseDate: result.releaseDate,
          country: result.country,
          genres: result.genres,
          url: result.url,
        } : null);
      } catch {
        if (!mounted) return;
        setMetadata(null);
      } finally {
        if (mounted) {
          setMetadataLoading(false);
        }
      }
    };

    loadMetadata();
    return () => {
      mounted = false;
    };
  }, [currentVideo.id, currentVideo.title, currentVideo.channelTitle]);

  const handleToggleFavorite = async () => {
    if (favorite) {
      await removeFavorite(currentVideo.id);
    } else {
      await addFavorite(currentVideo);
    }
  };

  const handlePickSuggestion = async (suggestion: LyricsSuggestion) => {
    setPickingSuggestion(true);
    try {
      const picked = await lyricsApi.getLyrics(suggestion.trackName, suggestion.artistName);
      setLyrics(picked ?? 'Lyrics not found for the selected suggestion.');
    } catch {
      setLyrics('Could not load lyrics for the selected suggestion.');
    } finally {
      setPickingSuggestion(false);
    }
  };

  const calculateSeekTime = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pointerX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = rect.width > 0 ? pointerX / rect.width : 0;
    return percent * duration;
  };

  const handleSeekStart = (e: React.PointerEvent<HTMLDivElement>) => {
    if (duration <= 0) return;
    const newTime = calculateSeekTime(e);
    setIsSeeking(true);
    setPreviewTime(newTime);
    seekTo(newTime);
  };

  const handleSeekMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isSeeking || duration <= 0) return;
    const newTime = calculateSeekTime(e);
    setPreviewTime(newTime);
    seekTo(newTime);
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    setPreviewTime(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const activeTime = previewTime ?? currentTime;
  const progress = duration > 0 ? (activeTime / duration) * 100 : 0;
  const isLoadingState = playerStatus === 'loading' || playerStatus === 'buffering';

  const withHaptic = (action: () => void, intensity: 'light' | 'medium' = 'light') => () => {
    triggerHaptic(intensity);
    action();
  };

  return (
    <div className="min-h-screen text-white flex flex-col overflow-y-auto bg-[radial-gradient(circle_at_10%_0%,rgba(125,157,255,0.35),transparent_40%),radial-gradient(circle_at_90%_0%,rgba(71,119,255,0.28),transparent_36%),linear-gradient(180deg,#070b18,#0d1734_55%,#090f22)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5">
        <button
          onClick={withHaptic(() => navigate(-1))}
          className="pill-action p-2.5"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-sm text-blue-100/80 tracking-wide">Now Playing</p>
        </div>
        <button className="pill-action p-2.5">
          <MoreVertical className="w-6 h-6" />
        </button>
      </div>

      {/* Video Area */}
      <div className="px-4 sm:px-8 pt-2 pb-4">
        <div className="mx-auto w-full max-w-[720px] aspect-video rounded-[28px] glass-surface relative overflow-hidden">
          <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-500/30 blur-3xl" />
          <div className="absolute -bottom-12 -right-12 w-52 h-52 bg-cyan-400/20 blur-3xl" />
          <div id="youtube-player-host" className="absolute inset-0 z-[1]" />
          {isLoadingState && (
            <div className="absolute inset-0 p-4 animate-pulse">
              <div className="w-full h-full rounded-2xl bg-white/10" />
            </div>
          )}
        </div>
      </div>

      {/* Song Info */}
      <div className="px-6 sm:px-8 py-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{currentVideo.title}</h1>
        <p className="text-blue-100/75 truncate">{currentVideo.channelTitle}</p>
        {(playerStatus === 'loading' || playerStatus === 'buffering' || playerStatus === 'error') && (
          <p className="text-xs text-blue-100/70 mt-2">
            {playerStatus === 'error'
              ? `Playback error${playerErrorCode ? ` (${playerErrorCode})` : ''}. Skipping when possible.`
              : playerStatus === 'buffering'
                ? 'Buffering…'
                : 'Loading…'}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-6 sm:px-8 py-2">
        <svg viewBox="0 0 360 36" className="w-full h-9 mb-3 opacity-85" aria-hidden="true">
          <defs>
            <linearGradient id="waveGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#8cb6ff" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#d4e4ff" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#7aa1ff" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <path d="M0 18 Q8 8 16 18 T32 18 T48 18 T64 18 T80 18 T96 18 T112 18 T128 18 T144 18 T160 18 T176 18 T192 18 T208 18 T224 18 T240 18 T256 18 T272 18 T288 18 T304 18 T320 18 T336 18 T352 18" stroke="url(#waveGradient)" strokeWidth="2.2" fill="none" />
        </svg>
        <div
          onPointerDown={handleSeekStart}
          onPointerMove={handleSeekMove}
          onPointerUp={handleSeekEnd}
          onPointerCancel={handleSeekEnd}
          onPointerLeave={handleSeekEnd}
          className="relative h-1.5 bg-white/15 rounded-full cursor-pointer group"
        >
          <div
            className="absolute h-full bg-gradient-to-r from-blue-300 to-indigo-200 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-y-1/2 top-1/2 opacity-0 group-hover:opacity-100 transition"
            style={{ left: `${progress}%`, marginLeft: '-8px' }}
          />
        </div>
        <div className="flex justify-between text-xs text-blue-100/70 mt-2">
          <span>{formatTime(activeTime)}</span>
          <span>-{formatTime(Math.max(duration - activeTime, 0))}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 sm:px-8 py-6">
        {/* Secondary Controls */}
        <div className="flex items-center justify-between mb-6 glass-surface rounded-2xl px-4 py-3">
          <button
            onClick={withHaptic(toggleShuffle)}
            className={`p-2 rounded-full transition ${
              shuffle ? 'text-blue-100' : 'text-blue-100/60 hover:text-white'
            }`}
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            onClick={withHaptic(handleToggleFavorite)}
            className={`p-2 rounded-full transition ${
              favorite ? 'text-rose-400' : 'text-blue-100/60 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={withHaptic(toggleRepeat)}
            className={`p-2 rounded-full transition relative ${
              repeat !== 'off' ? 'text-blue-100' : 'text-blue-100/60 hover:text-white'
            }`}
          >
            <Repeat className="w-5 h-5" />
            {repeat === 'one' && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-blue-200 rounded-full" />
            )}
          </button>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={withHaptic(previous)}
            className="p-3 hover:bg-white/10 active:scale-95 rounded-full transition-all"
          >
            <SkipBack className="w-7 h-7" />
          </button>

          <button
            onClick={withHaptic(playPause, 'medium')}
            className="w-16 h-16 bg-gradient-to-b from-blue-100 to-white active:scale-95 rounded-full flex items-center justify-center transition shadow-[0_0_40px_rgba(175,199,255,0.7)] hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-slate-900 fill-slate-900" />
            ) : (
              <Play className="w-8 h-8 text-slate-900 fill-slate-900 ml-1" />
            )}
          </button>

          <button
            onClick={withHaptic(next)}
            className="p-3 hover:bg-white/10 active:scale-95 rounded-full transition-all"
          >
            <SkipForward className="w-7 h-7" />
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between mt-6">
          <button className="p-2 text-blue-100/60 hover:text-white transition">
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={withHaptic(() => navigate('/playlists'))}
            className="pill-action flex items-center gap-2 px-4 py-2"
          >
            <ListMusic className="w-5 h-5" />
            <span className="text-sm">{queue.length} in queue</span>
          </button>
        </div>
      </div>

      {/* Lyrics */}
      <div className="px-6 sm:px-8 pb-4">
        <div className="space-y-3">
          {metadata && (
            <div className="glass-surface rounded-2xl p-4 border border-blue-200/10">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h3 className="text-white font-semibold">Track Facts</h3>
                {metadata.url && (
                  <a
                    href={metadata.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-100/70 hover:text-white transition"
                  >
                    Open MusicBrainz
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {metadata.releaseTitle && (
                  <div className="rounded-xl bg-white/5 px-3 py-2">
                    <div className="text-blue-100/60 text-xs uppercase tracking-wide">Release</div>
                    <div className="text-white mt-1 line-clamp-2">{metadata.releaseTitle}</div>
                  </div>
                )}
                {metadata.releaseDate && (
                  <div className="rounded-xl bg-white/5 px-3 py-2">
                    <div className="text-blue-100/60 text-xs uppercase tracking-wide">First release</div>
                    <div className="text-white mt-1">{metadata.releaseDate}</div>
                  </div>
                )}
                {metadata.country && (
                  <div className="rounded-xl bg-white/5 px-3 py-2">
                    <div className="text-blue-100/60 text-xs uppercase tracking-wide">Country</div>
                    <div className="text-white mt-1">{metadata.country}</div>
                  </div>
                )}
                {metadata.genres && metadata.genres.length > 0 && (
                  <div className="rounded-xl bg-white/5 px-3 py-2 sm:col-span-2">
                    <div className="text-blue-100/60 text-xs uppercase tracking-wide">Genres</div>
                    <div className="text-white mt-1 flex flex-wrap gap-2">
                      {metadata.genres.map((genre) => (
                        <span key={genre} className="px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-50 text-xs">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="glass-surface rounded-2xl p-4">
            <h3 className="text-white font-semibold mb-2">Lyrics</h3>
            {lyricsLoading ? (
              <p className="text-blue-100/75 text-sm">Loading lyrics...</p>
            ) : (
              <>
                <p className="text-blue-100/80 text-sm whitespace-pre-wrap leading-6 max-h-52 overflow-auto">
                  {lyrics}
                </p>
                {lyrics.startsWith('Lyrics not found') && lyricsSuggestions.length > 0 && (
                  <div className="mt-3 border-t border-blue-200/15 pt-3">
                    <p className="text-xs text-blue-100/70 mb-2">Try one of these likely matches:</p>
                    <div className="flex flex-wrap gap-2">
                      {lyricsSuggestions.slice(0, 5).map((item, index) => {
                        const key = `${item.trackName}-${item.artistName}-${index}`;
                        return (
                          <button
                            key={key}
                            type="button"
                            disabled={pickingSuggestion}
                            onClick={() => handlePickSuggestion(item)}
                            className="text-left px-3 py-2 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 transition disabled:opacity-60"
                          >
                            <div className="text-xs text-white">{item.trackName}</div>
                            <div className="text-[11px] text-blue-100/75">{item.artistName}</div>
                          </button>
                        );
                      })}
                    </div>
                    {pickingSuggestion && (
                      <p className="text-xs text-blue-100/60 mt-2">Loading selected lyrics...</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          {metadataLoading && !metadata && (
            <p className="text-xs text-blue-100/55 px-1">Loading track facts...</p>
          )}
        </div>
      </div>

      {/* Safe Area Bottom Padding */}
      <div className="h-8 safe-space-bottom" />
    </div>
  );
}
